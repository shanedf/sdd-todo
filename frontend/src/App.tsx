import { useState, useEffect } from 'react';
import type { Todo } from './types/todo';
import { getTodos, createTodo, updateTodo as apiUpdateTodo, deleteTodo as apiDeleteTodo, deleteCompletedTodos as apiDeleteCompleted } from './api/todo-api';
import { AddTodo } from './components/AddTodo';
import { TodoList } from './components/TodoList';
import { TodoFooter } from './components/TodoFooter';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => setError('Could not load todos. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAddTodo = async (title: string) => {
    try {
      const todo = await createTodo(title);
      setTodos((prev) => [...prev, todo]);
    } catch {
      setError('Could not add todo. Please try again.');
    }
  };

  const handleToggle = async (id: number, isCompleted: boolean) => {
    const snapshot = todos;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, isCompleted } : t)));
    try {
      await apiUpdateTodo(id, isCompleted);
    } catch {
      setTodos(snapshot);
      setError('Could not update todo. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiDeleteTodo(id);
    } catch {
      setTodos(snapshot);
      setError('Could not delete todo. Please try again.');
    }
  };

  const handleClearCompleted = async () => {
    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => !t.isCompleted));
    try {
      await apiDeleteCompleted();
    } catch {
      setTodos(snapshot);
      setError('Could not clear completed. Please try again.');
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  const activeCount = todos.filter((t) => !t.isCompleted).length;
  const completedCount = todos.filter((t) => t.isCompleted).length;

  return (
    <main className="app">
      <h1 className="app-title">todos</h1>
      <AddTodo onAdd={handleAddTodo} />
      {error && <p className="error-message" role="alert">{error}</p>}
      <TodoList todos={filteredTodos} onToggle={handleToggle} onDelete={handleDelete} />
      {todos.length > 0 && (
        <TodoFooter
          activeCount={activeCount}
          completedCount={completedCount}
          filter={filter}
          onFilterChange={setFilter}
          onClearCompleted={handleClearCompleted}
        />
      )}
    </main>
  );
}

export default App;
