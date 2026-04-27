import { describe, it, expect } from 'vitest';
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

describe('TodoList', () => {
  it('renders nothing when todos array is empty', () => {
    const { container } = render(<TodoList todos={[]} />);
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
    render(<TodoList todos={todos} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('renders todo titles as labels', () => {
    const todos = [makeTodo({ id: 1, title: 'Buy groceries' })];
    render(<TodoList todos={todos} />);

    const label = screen.getByText('Buy groceries');
    expect(label.className).toBe('todo-label');
  });

  it('renders long text without breaking', () => {
    const longTitle = 'A'.repeat(500);
    const todos = [makeTodo({ id: 1, title: longTitle })];
    render(<TodoList todos={todos} />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });
});
