/**
 * Formats a date string or Date object into a consistent format to avoid hydration mismatches.
 * Default format: DD/MM/YYYY
 */
export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date into a more detailed string, consistently.
 * Example: Mon, May 13, 2026, 11:05 PM
 */
export const formatFullDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).replace(',', '');
};

/**
 * Formats a time string consistently.
 */
export const formatTime = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats a number consistently.
 */
export const formatNumber = (num: number) => {
  return num.toLocaleString('en-GB');
};
