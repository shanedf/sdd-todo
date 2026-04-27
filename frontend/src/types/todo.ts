export interface Todo {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTodoInput {
  title: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}
