// Global Column Order Management Service
// Manages column order preferences across all tables in the application

const STORAGE_KEY = 'prime_club_column_order';

// Get the current global column order from localStorage
export function getGlobalColumnOrder() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading column order from localStorage:', error);
    return null;
  }
}

// Save column order to localStorage
export function saveGlobalColumnOrder(columnOrder) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnOrder));
    return true;
  } catch (error) {
    console.error('Error saving column order to localStorage:', error);
    return false;
  }
}

// Apply global column order to a list of columns
export function applyGlobalColumnOrder(columns) {
  const globalOrder = getGlobalColumnOrder();
  if (!globalOrder) return columns;

  try {
    // Create a map of column ID to column for quick lookup
    const columnMap = new Map();
    columns.forEach(col => columnMap.set(col.Id, col));

    // Apply the global order
    const orderedColumns = [];
    globalOrder.forEach(id => {
      if (columnMap.has(id)) {
        orderedColumns.push(columnMap.get(id));
        columnMap.delete(id);
      }
    });

    // Add any remaining columns that weren't in the global order
    columnMap.forEach(col => orderedColumns.push(col));

    return orderedColumns;
  } catch (error) {
    console.error('Error applying global column order:', error);
    return columns;
  }
}

// Update global column order with new arrangement
export function updateGlobalColumnOrder(newColumnIds) {
  return saveGlobalColumnOrder(newColumnIds);
}

// Reset column order to default
export function resetGlobalColumnOrder() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting column order:', error);
    return false;
  }
}

// Get column order for a specific table (future extensibility)
export function getTableColumnOrder(tableId) {
  const globalOrder = getGlobalColumnOrder();
  return globalOrder; // For now, all tables use the same order
}

// Save column order for a specific table (future extensibility)
export function saveTableColumnOrder(tableId, columnOrder) {
  return saveGlobalColumnOrder(columnOrder);
}