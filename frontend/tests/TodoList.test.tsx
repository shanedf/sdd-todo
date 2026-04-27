import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from '../src/components/TodoList';
import type { Todo } from '../src/types/todo';

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 1,
  title: 'Test todo',
  isCompleted: false,
  createdAt: '2026-04-27T00:00:00.000Z',
  ...overrides,
});

const noop = vi.fn();

describe('TodoList', () => {
  it('renders nothing when todos array is empty', () => {
    const { container } = render(<TodoList todos={[]} onToggle={noop} onDelete={noop} />);
    const list = container.querySelector('.todo-list');
    expect(list).toBeInTheDocument();
    expect(list?.children).toHaveLength(0);
  });

  it('renders all todos', () => {
    const todos = [
      makeTodo({ id: 1, title: 'First' }),
      makeTodo({ id: 2, title: 'Second' }),
      makeTodo({ id: 3, title: 'Third' }),
    ];
    render(<TodoList todos={todos} onToggle={noop} onDelete={noop} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('renders todo titles as labels', () => {
    const todos = [makeTodo({ id: 1, title: 'Buy groceries' })];
    render(<TodoList todos={todos} onToggle={noop} onDelete={noop} />);

    const label = screen.getByText('Buy groceries');
    expect(label.className).toBe('todo-label');
  });

  it('renders long text without breaking', () => {
    const longTitle = 'A'.repeat(500);
    const todos = [makeTodo({ id: 1, title: longTitle })];
    render(<TodoList todos={todos} onToggle={noop} onDelete={noop} />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('passes onToggle and onDelete to each TodoItem', () => {
    const todos = [makeTodo({ id: 1 }), makeTodo({ id: 2, title: 'Second' })];
    render(<TodoList todos={todos} onToggle={noop} onDelete={noop} />);

    // Verify checkboxes and delete buttons render for each item
    const checkboxes = screen.getAllByRole('checkbox');
    const deleteButtons = screen.getAllByRole('button');
    expect(checkboxes).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });
});
