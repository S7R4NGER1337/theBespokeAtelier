/**
 * Format a price stored in smallest currency unit (pence/stotinki ×100)
 * to a human-readable string.
 */
export const formatPrice = (amount, currency = '£') => {
  if (amount == null) return '—';
  return `${currency}${(amount / 100).toFixed(2).replace(/\.00$/, '')}`;
};

/**
 * Map appointment status to chip CSS class.
 */
export const statusChip = (status) => {
  const map = {
    confirmed:   'chip-confirmed',
    pending:     'chip-pending',
    in_progress: 'chip-progress',
    cancelled:   'chip-cancelled',
    no_show:     'chip-cancelled',
    completed:   'chip-confirmed',
  };
  return `chip ${map[status] || ''}`;
};

/**
 * Capitalise first letter of each word.
 */
export const titleCase = (str = '') =>
  str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
