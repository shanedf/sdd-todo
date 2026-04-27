import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

const mockTodos = [
  { id: 1, title: 'First todo', isCompleted: false, createdAt: '2026-04-27T00:00:00.000Z' },
  { id: 2, title: 'Second todo', isCompleted: true, createdAt: '2026-04-27T00:00:00.000Z' },
];

vi.mock('../src/api/todo-api', () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  deleteCompletedTodos: vi.fn(),
}));

import { getTodos, updateTodo, deleteTodo, deleteCompletedTodos } from '../src/api/todo-api';

const mockGetTodos = vi.mocked(getTodos);
const mockUpdateTodo = vi.mocked(updateTodo);
const mockDeleteTodo = vi.mocked(deleteTodo);
const mockDeleteCompleted = vi.mocked(deleteCompletedTodos);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTodos.mockResolvedValue([...mockTodos]);
  mockDeleteCompleted.mockResolvedValue({ deleted: 1 });
});

describe('App optimistic rollback', () => {
  it('rolls back toggle when API fails', async () => {
    mockUpdateTodo.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    // First todo starts unchecked
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();

    // Click to toggle — optimistic update makes it checked immediately
    await user.click(checkboxes[0]);

    // After API rejection, it should roll back to unchecked
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked();
    });
  });

  it('rolls back delete when API fails', async () => {
    mockDeleteTodo.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    // Click delete on first todo
    const deleteButtons = screen.getAllByRole('button');
    await user.click(deleteButtons[0]);

    // After API rejection, todo should reappear
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });
  });
});

describe('App footer visibility', () => {
  it('shows footer when todos exist', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('1 item left')).toBeInTheDocument();
    });
  });

  it('hides footer when no todos exist', async () => {
    mockGetTodos.mockResolvedValue([]);
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/items? left/)).not.toBeInTheDocument();
    });
  });
});

describe('App filtering', () => {
  it('shows only active todos when Active filter clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Active' }));

    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.queryByText('Second todo')).not.toBeInTheDocument();
  });

  it('shows only completed todos when Completed filter clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Completed' }));

    expect(screen.queryByText('First todo')).not.toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });
});

describe('App clear completed', () => {
  it('removes completed todos optimistically', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Second todo')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear completed' }));

    expect(screen.queryByText('Second todo')).not.toBeInTheDocument();
    expect(screen.getByText('First todo')).toBeInTheDocument();
  });

  it('rolls back clear completed on API failure', async () => {
    mockDeleteCompleted.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Second todo')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear completed' }));

    await waitFor(() => {
      expect(screen.getByText('Second todo')).toBeInTheDocument();
    });
  });
});
