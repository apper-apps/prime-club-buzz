import dealsData from "@/services/mockData/deals.json";
// Defensive data extraction - handle both array and object structures
const extractDealsArray = (data) => {
  // If data is already an array, return it
  if (Array.isArray(data)) {
    return data;
  }
  
  // If data is an object, look for common array property names
  if (data && typeof data === 'object') {
    // Try common property names for arrays
    if (Array.isArray(data.deals)) return data.deals;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
    
    // If it's an object with numeric keys, convert to array
    const keys = Object.keys(data);
    if (keys.length > 0 && keys.every(key => !isNaN(key))) {
      return Object.values(data);
    }
  }
  
  // Fallback to empty array if structure is unrecognized
  console.warn('Unexpected deals data structure:', data);
  return [];
};

// Mock deals data - simulating API responses with defensive extraction
let deals = extractDealsArray(dealsData);

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getDeals = async () => {
  try {
    await delay(500);
    // Always return a copy of the array to prevent mutations
    const result = Array.isArray(deals) ? [...deals] : [];
    console.log('getDeals returning:', result.length, 'deals');
    return result;
  } catch (error) {
    console.error('Error in getDeals:', error);
    return [];
  }
};

export const getDealById = async (id) => {
  try {
    await delay(300);
    if (!Array.isArray(deals)) {
      console.error('Deals is not an array in getDealById');
      return null;
    }
    return deals.find(deal => deal && deal.id === id) || null;
  } catch (error) {
    console.error('Error in getDealById:', error);
    return null;
  }
};

export const createDeal = async (dealData) => {
  try {
    await delay(600);
    if (!Array.isArray(deals)) {
      deals = [];
    }
    const newDeal = {
      id: Date.now().toString(),
      ...dealData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    deals.push(newDeal);
    return newDeal;
  } catch (error) {
    console.error('Error in createDeal:', error);
    throw new Error('Failed to create deal');
  }
};

export const updateDeal = async (id, updates) => {
  try {
    await delay(400);
    if (!Array.isArray(deals)) {
      throw new Error('Deals data is corrupted');
    }
    const index = deals.findIndex(deal => deal && deal.id === id);
    if (index !== -1) {
      deals[index] = {
        ...deals[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return deals[index];
    }
    throw new Error('Deal not found');
  } catch (error) {
    console.error('Error in updateDeal:', error);
    throw error;
  }
};

export const deleteDeal = async (id) => {
  try {
    await delay(400);
    if (!Array.isArray(deals)) {
      throw new Error('Deals data is corrupted');
    }
    const index = deals.findIndex(deal => deal && deal.id === id);
    if (index !== -1) {
      const deletedDeal = deals[index];
      deals.splice(index, 1);
      return deletedDeal;
    }
    throw new Error('Deal not found');
  } catch (error) {
    console.error('Error in deleteDeal:', error);
    throw error;
  }
};