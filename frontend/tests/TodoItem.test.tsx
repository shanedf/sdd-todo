import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from '../src/components/TodoItem';
import type { Todo } from '../src/types/todo';

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 1,
  title: 'Test todo',
  isCompleted: false,
  createdAt: '2026-04-27T00:00:00.000Z',
  ...overrides,
});

describe('TodoItem', () => {
  it('renders checkbox unchecked for active todo', () => {
    render(<TodoItem todo={makeTodo()} onToggle={vi.fn()} onDelete={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders checkbox checked for completed todo', () => {
    render(<TodoItem todo={makeTodo({ isCompleted: true })} onToggle={vi.fn()} onDelete={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls onToggle with correct args when checkbox clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<TodoItem todo={makeTodo({ id: 5 })} onToggle={onToggle} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(5, true);
  });

  it('calls onToggle to uncomplete when completed todo checkbox clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<TodoItem todo={makeTodo({ id: 3, isCompleted: true })} onToggle={onToggle} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(3, false);
  });

  it('applies completed class when todo is completed', () => {
    const { container } = render(
      <TodoItem todo={makeTodo({ isCompleted: true })} onToggle={vi.fn()} onDelete={vi.fn()} />,
    );
    const li = container.querySelector('li');
    expect(li?.className).toContain('todo-item--completed');
  });

  it('does not apply completed class when todo is active', () => {
    const { container } = render(
      <TodoItem todo={makeTodo({ isCompleted: false })} onToggle={vi.fn()} onDelete={vi.fn()} />,
    );
    const li = container.querySelector('li');
    expect(li?.className).not.toContain('todo-item--completed');
  });

  it('renders delete button with aria-label', () => {
    render(<TodoItem todo={makeTodo({ title: 'Buy groceries' })} onToggle={vi.fn()} onDelete={vi.fn()} />);
    const deleteBtn = screen.getByRole('button', { name: 'Delete todo: Buy groceries' });
    expect(deleteBtn).toBeInTheDocument();
  });

  it('calls onDelete with correct id when delete button clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<TodoItem todo={makeTodo({ id: 7 })} onToggle={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Delete todo: Test todo' }));
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  it('renders todo title in label', () => {
    render(<TodoItem todo={makeTodo({ title: 'Walk the dog' })} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
  });
});
