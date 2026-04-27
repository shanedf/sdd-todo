import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  // Clean up via API — delete all existing todos
  const response = await request.get('/api/todos');
  const todos = await response.json();
  for (const todo of todos) {
    await request.delete(`/api/todos/${todo.id}`);
  }
  await page.goto('/');
});

test.describe('Todo App E2E', () => {
  test('add a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Buy groceries');
    await input.press('Enter');

    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(input).toHaveValue('');
  });

  test('toggle a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Walk the dog');
    await input.press('Enter');

    await expect(page.getByText('Walk the dog')).toBeVisible();

    const checkbox = page.getByRole('checkbox').first();
    await checkbox.click();

    await expect(page.locator('.todo-item--completed')).toBeVisible();
  });

  test('delete a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Read a book');
    await input.press('Enter');

    await expect(page.getByText('Read a book')).toBeVisible();

    const todoItem = page.locator('.todo-item').first();
    await todoItem.hover();
    await todoItem.locator('button.todo-destroy').click();

    await expect(page.getByText('Read a book')).not.toBeVisible();
  });

  test('filter todos', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    await input.fill('Active task');
    await input.press('Enter');
    await input.fill('Completed task');
    await input.press('Enter');

    // Complete the second todo
    await page.getByRole('checkbox').nth(1).click();

    // Filter: Active
    await page.getByRole('button', { name: 'Active' }).click();
    await expect(page.getByText('Active task')).toBeVisible();
    await expect(page.getByText('Completed task')).not.toBeVisible();

    // Filter: Completed
    await page.getByRole('button', { name: 'Completed', exact: true }).click();
    await expect(page.getByText('Active task')).not.toBeVisible();
    await expect(page.getByText('Completed task')).toBeVisible();

    // Filter: All
    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.getByText('Active task')).toBeVisible();
    await expect(page.getByText('Completed task')).toBeVisible();
  });

  test('clear completed', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    await input.fill('Keep this');
    await input.press('Enter');
    await input.fill('Clear this');
    await input.press('Enter');

    // Complete the second todo
    await page.getByRole('checkbox').nth(1).click();

    // Clear completed
    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByText('Keep this')).toBeVisible();
    await expect(page.getByText('Clear this')).not.toBeVisible();
  });
});
