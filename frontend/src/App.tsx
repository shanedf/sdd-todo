import { useState, useEffect } from 'react';
import type { Todo } from './types/todo';
import { getTodos, createTodo } from './api/todo-api';
import { AddTodo } from './components/AddTodo';
import { TodoList } from './components/TodoList';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => setError('Failed to load todos'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddTodo = async (title: string) => {
    const todo = await createTodo(title);
    setTodos((prev) => [...prev, todo]);
  };

  return (
    <main className="app">
      <h1 className="app-title">todos</h1>
      <AddTodo onAdd={handleAddTodo} />
      <TodoList todos={todos} />
    </main>
  );
}

export default App;
