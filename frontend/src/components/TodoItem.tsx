import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <li className="todo-item">
      <label className="todo-label">{todo.title}</label>
    </li>
  );
}
