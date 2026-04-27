import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTodo } from '../src/components/AddTodo';

describe('AddTodo', () => {
  it('renders input with placeholder', () => {
    render(<AddTodo onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
  });

  it('calls onAdd with trimmed title on Enter', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Buy groceries{Enter}');

    expect(onAdd).toHaveBeenCalledWith('Buy groceries');
  });

  it('clears input after submission', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?') as HTMLInputElement;
    await user.type(input, 'Buy groceries{Enter}');

    expect(input.value).toBe('');
  });

  it('does not call onAdd with empty input', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, '{Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd with whitespace-only input', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, '   {Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('has autoFocus on the input', () => {
    render(<AddTodo onAdd={vi.fn()} />);
    const input = screen.getByPlaceholderText('What needs to be done?');
    expect(input).toHaveFocus();
  });

  it('retains focus on input after submission', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Buy groceries{Enter}');

    expect(input).toHaveFocus();
  });
});
