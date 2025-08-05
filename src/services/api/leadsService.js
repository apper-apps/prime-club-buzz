import leadsData from "@/services/mockData/leads.json";
import salesRepData from "@/services/mockData/salesReps.json";

let leads = [...leadsData];
let salesReps = [...salesRepData];

// Custom columns storage
let customColumns = [
  {
    Id: 1,
    name: "Website URL",
    type: "url",
    required: true,
    defaultValue: "",
    isDefault: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    Id: 2,
    name: "Company Name",
    type: "text",
    required: true,
    defaultValue: "",
    isDefault: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    Id: 3,
    name: "Status",
    type: "select",
    required: true,
    defaultValue: "New Lead",
    selectOptions: ["New Lead", "Contacted", "Meeting Booked", "Closed Won", "Closed Lost"],
    isDefault: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
];

// Track all URLs that have ever been added to the system (for fresh lead detection)
const leadHistoryTracker = new Map();

// Initialize history tracker with existing leads
leads.forEach(lead => {
  const normalizedUrl = lead.websiteUrl.toLowerCase().replace(/\/$/, '');
  leadHistoryTracker.set(normalizedUrl, true);
});

// Utility function to remove duplicate website URLs, keeping the most recent entry
const deduplicateLeads = (leadsArray) => {
  const urlMap = new Map();
  const duplicates = [];
  
  // Sort by creation date (most recent first) to keep the latest entry
  const sortedLeads = [...leadsArray].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  sortedLeads.forEach(lead => {
    const normalizedUrl = lead.websiteUrl.toLowerCase().replace(/\/$/, ''); // Remove trailing slash and normalize
    
    // Update history tracker
    leadHistoryTracker.set(normalizedUrl, true);
    
    if (urlMap.has(normalizedUrl)) {
      duplicates.push(lead);
    } else {
      urlMap.set(normalizedUrl, lead);
    }
  });
return {
    uniqueLeads: Array.from(urlMap.values()),
    duplicatesRemoved: duplicates,
    duplicateCount: duplicates.length
  };
};

export const getLeads = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Automatically deduplicate leads
  const deduplicationResult = deduplicateLeads(leads);
  
  // Update the leads array if duplicates were found
  if (deduplicationResult.duplicateCount > 0) {
    leads = deduplicationResult.uniqueLeads;
  }
  
return {
    leads: leads,
    deduplicationResult: deduplicationResult.duplicateCount > 0 ? deduplicationResult : null
  };
};

export const getLeadById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const lead = leads.find(l => l.Id === id);
  if (!lead) {
    throw new Error("Lead not found");
  }
  
  return { ...lead };
};

export const createLead = async (leadData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Validate required fields
  if (!leadData.websiteUrl || !leadData.websiteUrl.trim()) {
    throw new Error("Website URL is required");
  }
  
  // Check for duplicate website URL before creating
  const normalizedUrl = leadData.websiteUrl.toLowerCase().replace(/\/$/, '');
  const existingLead = leads.find(lead => 
    lead.websiteUrl.toLowerCase().replace(/\/$/, '') === normalizedUrl
  );
  
  if (existingLead) {
    throw new Error(`A lead with website URL "${leadData.websiteUrl}" already exists`);
  }
// Update history tracker for new lead
  leadHistoryTracker.set(normalizedUrl, true);
  const maxId = Math.max(...leads.map(l => l.Id), 0);
const newLead = {
    name: leadData.name || "",
    email: leadData.email || "",
    websiteUrl: leadData.websiteUrl,
    teamSize: leadData.teamSize || "1-3",
    arr: leadData.arr || 0,
category: leadData.category || "Website Contact Form",
    linkedinUrl: leadData.linkedinUrl || "",
status: leadData.status || "New Lead",
    fundingType: leadData.fundingType || "Bootstrapped",
edition: leadData.edition || "Select Edition",
followUpDate: leadData.followUpDate || null,
    productName: leadData.productName || "",
    Id: maxId + 1,
    createdAt: new Date().toISOString()
  };
  leads.push(newLead);
  
  return newLead;
};

export const updateLead = async (id, updates) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = leads.findIndex(l => l.Id === id);
  if (index === -1) {
    throw new Error("Lead not found");
  }
  
  leads[index] = { ...leads[index], ...updates };
  return { ...leads[index] };
};

export const deleteLead = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = leads.findIndex(l => l.Id === id);
  if (index === -1) {
    throw new Error("Lead not found");
  }
  
  leads.splice(index, 1);
  return { success: true };
};

export const getDailyLeadsReport = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter leads created today
  const todaysLeads = leads.filter(lead => {
    const leadDate = lead.createdAt.split('T')[0];
    return leadDate === today;
  });
  
  // Group by sales rep
const reportData = {
    'Daily Leads': {
      salesRep: 'Daily Leads',
      salesRepId: 0,
      leads: todaysLeads,
      leadCount: todaysLeads.length,
      lowPerformance: todaysLeads.length < 5
    }
  };
  
  // Calculate lead counts and identify low performers
  Object.values(reportData).forEach(repData => {
    repData.leadCount = repData.leads.length;
    repData.lowPerformance = repData.leadCount < 5;
  });
  
  // Convert to array and sort by lead count (descending)
return Object.values(reportData).sort((a, b) => b.leads.length - a.leads.length);
};

export const getPendingFollowUps = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get current date and 7 days from now
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);
  
  // Filter leads with follow-up dates within the next 7 days
  const pendingFollowUps = leads.filter(lead => {
    if (!lead.followUpDate) return false;
    
    const followUpDate = new Date(lead.followUpDate);
    return followUpDate >= now && followUpDate <= sevenDaysFromNow;
  });
// Sort by follow-up date (earliest first)
  return pendingFollowUps.sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
};

// Get only fresh leads that have never existed in the system before
export const getFreshLeadsOnly = async (leadsArray) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Type validation and defensive programming
  if (!leadsArray) {
    console.warn('getFreshLeadsOnly: leadsArray is null or undefined, returning empty array');
    return [];
  }
  
  if (!Array.isArray(leadsArray)) {
    console.error('getFreshLeadsOnly: Expected array but received:', typeof leadsArray, leadsArray);
    return [];
  }
  
  if (leadsArray.length === 0) {
    return [];
  }
  
  try {
    const freshLeads = leadsArray.filter(lead => {
      // Validate lead object structure
      if (!lead || typeof lead !== 'object') {
        console.warn('getFreshLeadsOnly: Invalid lead object:', lead);
        return false;
      }
      
      if (!lead.websiteUrl || !lead.createdAt) {
        console.warn('getFreshLeadsOnly: Lead missing required fields:', lead);
        return false;
      }
      
      const normalizedUrl = lead.websiteUrl.toLowerCase().replace(/\/$/, '');
      // Check if this URL was added today and wasn't in the system before today
      const leadDate = new Date(lead.createdAt);
      const today = new Date();
      
      // Validate date objects
      if (isNaN(leadDate.getTime()) || isNaN(today.getTime())) {
        console.warn('getFreshLeadsOnly: Invalid date in lead:', lead);
        return false;
      }
      
      // If lead was created today and URL never existed before, it's fresh
      return leadDate.toDateString() === today.toDateString() && 
             !wasUrlPreviouslyAdded(normalizedUrl, leadDate);
    });
    
    return freshLeads;
  } catch (error) {
    console.error('getFreshLeadsOnly: Error processing leads:', error);
    return [];
  }
};

// Helper function to check if URL existed before a given date
const wasUrlPreviouslyAdded = (normalizedUrl, currentDate) => {
  // Check if any existing lead with this URL was created before the current date
  const existingLeads = leads.filter(lead => {
    const existingNormalizedUrl = lead.websiteUrl.toLowerCase().replace(/\/$/, '');
    return existingNormalizedUrl === normalizedUrl && 
           new Date(lead.createdAt) < currentDate;
  });
  
return existingLeads.length > 0;
};

// Custom Columns Management
export const getCustomColumns = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...customColumns].sort((a, b) => a.order - b.order);
};

export const createCustomColumn = async (columnData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!columnData.name || !columnData.name.trim()) {
    throw new Error("Column name is required");
  }
  
  if (!columnData.type) {
    throw new Error("Column type is required");
  }
  
  // Check for duplicate names
  const existingColumn = customColumns.find(col => 
    col.name.toLowerCase() === columnData.name.toLowerCase()
  );
  
  if (existingColumn) {
    throw new Error(`A column with name "${columnData.name}" already exists`);
  }
  
  const maxId = Math.max(...customColumns.map(c => c.Id), 0);
  const maxOrder = Math.max(...customColumns.map(c => c.order), 0);
  
  const newColumn = {
    Id: maxId + 1,
    name: columnData.name,
    type: columnData.type,
    required: columnData.required || false,
    defaultValue: columnData.defaultValue || "",
    selectOptions: columnData.selectOptions || [],
    isDefault: false,
    order: maxOrder + 1,
    createdAt: new Date().toISOString()
  };
  
  customColumns.push(newColumn);
  return newColumn;
};

export const updateCustomColumn = async (id, updates) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = customColumns.findIndex(c => c.Id === id);
  if (index === -1) {
    throw new Error("Column not found");
  }
  
  // Check for duplicate names (excluding current column)
  if (updates.name) {
    const duplicateColumn = customColumns.find(col => 
      col.Id !== id && col.name.toLowerCase() === updates.name.toLowerCase()
    );
    
    if (duplicateColumn) {
      throw new Error(`A column with name "${updates.name}" already exists`);
    }
  }
  
  customColumns[index] = { ...customColumns[index], ...updates };
  return { ...customColumns[index] };
};

export const deleteCustomColumn = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = customColumns.findIndex(c => c.Id === id);
  if (index === -1) {
    throw new Error("Column not found");
  }
  
  const column = customColumns[index];
  if (column.isDefault) {
    throw new Error("Default columns cannot be deleted");
  }
  
  customColumns.splice(index, 1);
  return { success: true };
};

// Get visible columns for display (non-deleted, ordered)
export const getVisibleColumns = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...customColumns]
    .filter(col => !col.deleted)
    .sort((a, b) => a.order - b.order);
};

export const reorderCustomColumns = async (columnIds) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  columnIds.forEach((id, index) => {
    const column = customColumns.find(c => c.Id === id);
    if (column) {
      column.order = index + 1;
    }
  });
  
  return customColumns.sort((a, b) => a.order - b.order);
};