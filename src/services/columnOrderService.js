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

// Save column order to localStorage and trigger sync event
export function saveGlobalColumnOrder(columnOrder) {
  try {
    const orderArray = Array.isArray(columnOrder) ? columnOrder : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orderArray));
// Trigger a custom event to notify other components of the change
    const event = new Event('columnOrderChanged');
    event.detail = { columnOrder: orderArray };
    window.dispatchEvent(event);
    return true;
  } catch (error) {
    console.error('Error saving column order to localStorage:', error);
    return false;
  }
}

// Apply global column order to a list of columns
export function applyGlobalColumnOrder(columns) {
  if (!Array.isArray(columns) || columns.length === 0) {
    return columns;
  }

  const globalOrder = getGlobalColumnOrder();
  if (!globalOrder || !Array.isArray(globalOrder)) {
    return columns;
  }

  try {
    // Create a map of column ID to column for quick lookup
    const columnMap = new Map();
    columns.forEach(col => {
      if (col && col.Id !== undefined) {
        columnMap.set(col.Id, col);
      }
    });

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
  if (!Array.isArray(newColumnIds)) {
    console.warn('updateGlobalColumnOrder expects an array of column IDs');
    return false;
  }
  return saveGlobalColumnOrder(newColumnIds);
}

// Reset column order to default
export function resetGlobalColumnOrder() {
  try {
    localStorage.removeItem(STORAGE_KEY);
// Trigger sync event
    const event = new Event('columnOrderChanged');
    event.detail = { columnOrder: null };
    window.dispatchEvent(event);
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

// Force sync across all components
export function triggerColumnSync() {
const currentOrder = getGlobalColumnOrder();
  const event = new Event('columnOrderChanged');
  event.detail = { columnOrder: currentOrder };
  window.dispatchEvent(event);
}