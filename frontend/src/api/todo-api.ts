import type { Todo, ApiError } from '../types/todo';

const BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }
  return response.json() as Promise<T>;
}

export async function getTodos(): Promise<Todo[]> {
  const response = await fetch(`${BASE_URL}/todos`);
  return handleResponse<Todo[]>(response);
}

export async function createTodo(title: string): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return handleResponse<Todo>(response);
}

export async function updateTodo(id: number, isCompleted: boolean): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isCompleted }),
  });
  return handleResponse<Todo>(response);
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }
}
