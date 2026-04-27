import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, isCompleted: boolean) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={`todo-item${todo.isCompleted ? ' todo-item--completed' : ''}`}>
      <div className="todo-view">
        <input
          type="checkbox"
          className="todo-toggle"
          checked={todo.isCompleted}
          onChange={() => onToggle(todo.id, !todo.isCompleted)}
        />
        <label className="todo-label">{todo.title}</label>
        <button
          className="todo-destroy"
          aria-label={`Delete todo: ${todo.title}`}
          onClick={() => onDelete(todo.id)}
        >
          ×
        </button>
      </div>
    </li>
  );
}
