import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoFooter } from '../src/components/TodoFooter';

const defaultProps = {
  activeCount: 2,
  completedCount: 1,
  filter: 'all' as const,
  onFilterChange: vi.fn(),
  onClearCompleted: vi.fn(),
};

describe('TodoFooter', () => {
  it('renders plural item count', () => {
    render(<TodoFooter {...defaultProps} activeCount={3} />);
    expect(screen.getByText('3 items left')).toBeInTheDocument();
  });

  it('renders singular item count', () => {
    render(<TodoFooter {...defaultProps} activeCount={1} />);
    expect(screen.getByText('1 item left')).toBeInTheDocument();
  });

  it('renders zero item count', () => {
    render(<TodoFooter {...defaultProps} activeCount={0} />);
    expect(screen.getByText('0 items left')).toBeInTheDocument();
  });

  it('renders all three filter buttons', () => {
    render(<TodoFooter {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
  });

  it('applies filter--selected class to active filter', () => {
    render(<TodoFooter {...defaultProps} filter="active" />);
    expect(screen.getByRole('button', { name: 'Active' }).className).toBe('filter--selected');
    expect(screen.getByRole('button', { name: 'All' }).className).toBe('');
    expect(screen.getByRole('button', { name: 'Completed' }).className).toBe('');
  });

  it('calls onFilterChange with correct value when clicked', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(<TodoFooter {...defaultProps} onFilterChange={onFilterChange} />);

    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(onFilterChange).toHaveBeenCalledWith('active');

    await user.click(screen.getByRole('button', { name: 'Completed' }));
    expect(onFilterChange).toHaveBeenCalledWith('completed');

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(onFilterChange).toHaveBeenCalledWith('all');
  });

  it('shows "Clear completed" when completedCount > 0', () => {
    render(<TodoFooter {...defaultProps} completedCount={2} />);
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeInTheDocument();
  });

  it('hides "Clear completed" when completedCount is 0', () => {
    render(<TodoFooter {...defaultProps} completedCount={0} />);
    expect(screen.queryByRole('button', { name: 'Clear completed' })).not.toBeInTheDocument();
  });

  it('calls onClearCompleted when "Clear completed" clicked', async () => {
    const onClearCompleted = vi.fn();
    const user = userEvent.setup();
    render(<TodoFooter {...defaultProps} onClearCompleted={onClearCompleted} />);

    await user.click(screen.getByRole('button', { name: 'Clear completed' }));
    expect(onClearCompleted).toHaveBeenCalledOnce();
  });

  it('has role="navigation" and aria-label on filter list', () => {
    render(<TodoFooter {...defaultProps} />);
    const nav = screen.getByRole('navigation', { name: 'Filter todos' });
    expect(nav).toBeInTheDocument();
  });
});
