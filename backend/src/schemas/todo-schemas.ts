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
    201: {
      type: 'object' as const,
      properties: {
        id: { type: 'integer' as const },
        title: { type: 'string' as const },
        isCompleted: { type: 'boolean' as const },
        createdAt: { type: 'string' as const },
      },
    },
  },
};

export const getTodosSchema = {
  response: {
    200: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'integer' as const },
          title: { type: 'string' as const },
          isCompleted: { type: 'boolean' as const },
          createdAt: { type: 'string' as const },
        },
      },
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
    503: {
      type: 'object' as const,
      properties: {
        statusCode: { type: 'integer' as const },
        error: { type: 'string' as const },
        message: { type: 'string' as const },
      },
    },
  },
};
