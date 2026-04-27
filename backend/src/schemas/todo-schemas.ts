const todoResponseSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' as const },
    title: { type: 'string' as const },
    isCompleted: { type: 'boolean' as const },
    createdAt: { type: 'string' as const },
  },
};

const notFoundResponseSchema = {
  type: 'object' as const,
  properties: {
    statusCode: { type: 'integer' as const },
    error: { type: 'string' as const },
    message: { type: 'string' as const },
  },
};

export const createTodoSchema = {
  body: {
    type: 'object' as const,
    required: ['title'],
    properties: {
      title: {
        type: 'string' as const,
        minLength: 1,
        maxLength: 500,
      },
    },
    additionalProperties: false,
  },
  response: {
    201: todoResponseSchema,
  },
};

export const getTodosSchema = {
  response: {
    200: {
      type: 'array' as const,
      items: todoResponseSchema,
    },
  },
};

export const healthSchema = {
  response: {
    200: {
      type: 'object' as const,
      properties: {
        status: { type: 'string' as const },
      },
    },
    503: notFoundResponseSchema,
  },
};

const todoParamsSchema = {
  type: 'object' as const,
  required: ['id'],
  properties: {
    id: { type: 'integer' as const },
  },
};

export const updateTodoSchema = {
  params: todoParamsSchema,
  body: {
    type: 'object' as const,
    required: ['isCompleted'],
    properties: {
      isCompleted: { type: 'boolean' as const },
    },
    additionalProperties: false,
  },
  response: {
    200: todoResponseSchema,
    404: notFoundResponseSchema,
  },
};

export const deleteTodoSchema = {
  params: todoParamsSchema,
  response: {
    204: {
      type: 'null' as const,
      description: 'No Content',
    },
    404: notFoundResponseSchema,
  },
};
