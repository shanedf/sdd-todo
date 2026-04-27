import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

import { getTodos, createTodo, updateTodo, deleteTodo, deleteCompletedTodos } from '../src/api/todo-api';

const mockGetTodos = vi.mocked(getTodos);
const mockCreateTodo = vi.mocked(createTodo);
const mockUpdateTodo = vi.mocked(updateTodo);
const mockDeleteTodo = vi.mocked(deleteTodo);
const mockDeleteCompleted = vi.mocked(deleteCompletedTodos);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTodos.mockResolvedValue([...mockTodos]);
  mockDeleteCompleted.mockResolvedValue({ deleted: 1 });
  mockCreateTodo.mockResolvedValue({ id: 3, title: 'New todo', isCompleted: false, createdAt: '2026-04-27T00:00:00.000Z' });
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

describe('App error handling', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows error when createTodo fails', async () => {
    mockCreateTodo.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'New todo{enter}');

    await waitFor(() => {
      expect(screen.getByText('Could not add todo. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows error when updateTodo fails (toggle)', async () => {
    mockUpdateTodo.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.getByText('Could not update todo. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows error when deleteTodo fails', async () => {
    mockDeleteTodo.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete todo/ });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Could not delete todo. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows error when deleteCompletedTodos fails', async () => {
    mockDeleteCompleted.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Second todo')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear completed' }));

    await waitFor(() => {
      expect(screen.getByText('Could not clear completed. Please try again.')).toBeInTheDocument();
    });
  });

  it('auto-dismisses error after 3 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockCreateTodo.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'New todo{enter}');

    await waitFor(() => {
      expect(screen.getByText('Could not add todo. Please try again.')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText('Could not add todo. Please try again.')).not.toBeInTheDocument();
    });
  });

  it('does not show error on successful operations', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    mockUpdateTodo.mockResolvedValue({ id: 1, title: 'First todo', isCompleted: true, createdAt: '2026-04-27T00:00:00.000Z' });
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.queryByText(/Could not/)).not.toBeInTheDocument();
    });
  });

  it('replaces previous error with new error', async () => {
    mockUpdateTodo.mockRejectedValue(new Error('Network error'));
    mockDeleteTodo.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    // Trigger toggle error
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await waitFor(() => {
      expect(screen.getByText('Could not update todo. Please try again.')).toBeInTheDocument();
    });

    // Trigger delete error — should replace the toggle error
    const deleteButtons = screen.getAllByRole('button', { name: /Delete todo/ });
    await user.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Could not delete todo. Please try again.')).toBeInTheDocument();
    });

    // Only one error message at a time
    expect(screen.queryByText('Could not update todo. Please try again.')).not.toBeInTheDocument();
  });
});

describe('App accessibility', () => {
  it('renders semantic HTML landmarks', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(document.querySelector('form')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Filter todos' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays role="alert" on error messages', async () => {
    mockCreateTodo.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'New todo{enter}');

    await waitFor(() => {
      const errorEl = screen.getByRole('alert');
      expect(errorEl).toHaveTextContent('Could not add todo. Please try again.');
    });
  });

  it('supports full keyboard navigation flow', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('First todo')).toBeInTheDocument();
    });

    // Input should be focused on load (autoFocus)
    const input = screen.getByPlaceholderText('What needs to be done?');
    expect(input).toHaveFocus();

    // Tab through interactive elements
    await user.tab();
    expect(screen.getAllByRole('checkbox')[0]).toHaveFocus();

    await user.tab();
    expect(screen.getAllByRole('button', { name: /Delete todo: First/ })[0]).toHaveFocus();

    await user.tab();
    expect(screen.getAllByRole('checkbox')[1]).toHaveFocus();

    await user.tab();
    expect(screen.getAllByRole('button', { name: /Delete todo: Second/ })[0]).toHaveFocus();

    // Tab to footer filter buttons
    await user.tab();
    expect(screen.getByRole('button', { name: 'All' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Active' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Completed' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Clear completed' })).toHaveFocus();
  });
});
