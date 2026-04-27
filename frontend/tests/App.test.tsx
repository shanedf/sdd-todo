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
}));

import { getTodos, updateTodo, deleteTodo } from '../src/api/todo-api';

const mockGetTodos = vi.mocked(getTodos);
const mockUpdateTodo = vi.mocked(updateTodo);
const mockDeleteTodo = vi.mocked(deleteTodo);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTodos.mockResolvedValue([...mockTodos]);
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
