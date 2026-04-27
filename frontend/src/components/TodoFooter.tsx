interface TodoFooterProps {
  activeCount: number;
  completedCount: number;
  filter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
  onClearCompleted: () => void;
}

export function TodoFooter({ activeCount, completedCount, filter, onFilterChange, onClearCompleted }: TodoFooterProps) {
  return (
    <footer className="todo-footer">
      <span className="todo-count">
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </span>
      <ul className="todo-filters" role="navigation" aria-label="Filter todos">
        <li>
          <button
            className={filter === 'all' ? 'filter--selected' : ''}
            onClick={() => onFilterChange('all')}
          >
            All
          </button>
        </li>
        <li>
          <button
            className={filter === 'active' ? 'filter--selected' : ''}
            onClick={() => onFilterChange('active')}
          >
            Active
          </button>
        </li>
        <li>
          <button
            className={filter === 'completed' ? 'filter--selected' : ''}
            onClick={() => onFilterChange('completed')}
          >
            Completed
          </button>
        </li>
      </ul>
      {completedCount > 0 && (
        <button className="clear-completed" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  );
}
