import leadsData from "@/services/mockData/leads.json";
import salesRepData from "@/services/mockData/salesReps.json";

// Initialize data from JSON files
const leads = [...leadsData];
const salesReps = [...salesRepData];

// Custom columns configuration
const customColumns = [
  {
    Id: 1,
    name: "Company Name", 
    type: "text",
    required: true,
    defaultValue: "",
    isDefault: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    Id: 2,
    name: "Email",
    type: "email",
    required: true,
    defaultValue: "",
    isDefault: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    Id: 3,
    name: "Website URL",
    type: "url",
    required: true,
    defaultValue: "",
    isDefault: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    Id: 4,
    name: "Status",
    type: "select",
    required: true,
    defaultValue: "New Lead",
    selectOptions: ["New Lead", "Contacted", "Keep an Eye", "Proposal Sent", "Meeting Booked", "Meeting Done", "Commercials Sent", "Negotiation", "Hotlist", "Temporarily on hold", "Out of League", "Outdated", "Rejected", "Closed Won", "Closed Lost", "Launched on AppSumo", "Launched on Prime Club", "Connected", "Locked", "Unsubscribed"],
    isDefault: true,
    order: 4,
    createdAt: new Date().toISOString()
  },
  {
    Id: 5,
    name: "Lead Score",
    type: "readonly",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 5,
    createdAt: new Date().toISOString()
  },
  {
    Id: 6,
    name: "ARR",
    type: "number",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 6,
    createdAt: new Date().toISOString()
  },
  {
    Id: 7,
    name: "Team Size",
    type: "select",
    required: false,
    defaultValue: "",
    selectOptions: ["1-3", "4-10", "11-50", "51-100", "101-500", "501-1000", "1001+"],
    isDefault: true,
    order: 7,
    createdAt: new Date().toISOString()
  },
  {
    Id: 8,
    name: "Category",
    type: "select",
    required: false,
    defaultValue: "",
    selectOptions: ["Website Contact Form", "Partner Referral", "Cold Calling", "Events", "Facebook", "Website Chatbot", "Customer Referral", "Google PPC", "Organic SEO Traffic", "Product Inquiry Page", "Google My Business", "YouTube", "CRM API Integration Lead", "WhatsApp"],
    isDefault: true,
    order: 8,
    createdAt: new Date().toISOString()
  },
  {
    Id: 9,
    name: "Engagement Level",
    type: "readonly",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 9,
    createdAt: new Date().toISOString()
  },
  {
    Id: 10,
    name: "Deal Potential",
    type: "readonly",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 10,
    createdAt: new Date().toISOString()
  },
  {
    Id: 11,
    name: "Funding Type",
    type: "select",
    required: false,
    defaultValue: "",
    selectOptions: ["Bootstrapped", "Pre-seed", "Y Combinator", "Angel", "Series A", "Series B", "Series C"],
    isDefault: true,
    order: 11,
    createdAt: new Date().toISOString()
  },
  {
    Id: 12,
    name: "LinkedIn",
    type: "url",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 12,
    createdAt: new Date().toISOString()
  },
  {
    Id: 13,
    name: "Response Rate",
    type: "readonly",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 13,
    createdAt: new Date().toISOString()
  },
  {
    Id: 14,
    name: "Added By",
    type: "readonly",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 14,
    createdAt: new Date().toISOString()
  },
{
    Id: 15,
    name: "Created Date",
    type: "readonly",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 15,
    createdAt: new Date().toISOString()
  },
  {
    Id: 16,
    name: "IVR Number",
    type: "text",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 16,
    createdAt: new Date().toISOString()
  },
  {
    Id: 17,
    name: "DID Number", 
    type: "text",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 17,
    createdAt: new Date().toISOString()
  },
  {
    Id: 18,
    name: "Creation Date & Time",
    type: "datetime",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 18,
    createdAt: new Date().toISOString()
  },
  {
    Id: 19,
    name: "Follow-up Date",
    type: "date",
    required: false,
    defaultValue: "",
    isDefault: true,
    order: 19,
    createdAt: new Date().toISOString()
  },
  {
    Id: 20,
    name: "Assigned To",
    type: "select",
    required: false,
    defaultValue: "",
    selectOptions: [],
    isDefault: true,
    order: 20,
    createdAt: new Date().toISOString()
  },
  {
    Id: 21,
    name: "Assign Number",
    type: "number",
required: false,
    defaultValue: "",
    isDefault: true,
    order: 21,
    createdAt: new Date().toISOString()
  },
  {
    Id: 22,
    name: "Notes",
    type: "textarea",
    required: false,
    defaultValue: "",
    isDefault: false,
    order: 22,
    createdAt: new Date().toISOString()
  }
];

// Lead history tracker
const leadHistoryTracker = new Map();

// Deduplication helper function
function deduplicateLeads(leadsArray) {
  const seen = new Set();
  return leadsArray.filter(lead => {
    const key = `${lead.name}-${lead.email}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// URL tracking helper
function wasUrlPreviouslyAdded(normalizedUrl, currentDate) {
  const history = leadHistoryTracker.get(normalizedUrl);
  if (!history) return false;
  
  const daysDiff = Math.floor((currentDate - history.lastAdded) / (1000 * 60 * 60 * 24));
  return daysDiff < 30; // Consider duplicate if added within 30 days
}

// Service functions
export async function getLeads() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return deduped leads with proper structure
    const deduplicatedLeads = deduplicateLeads(leads);
    
    return {
      leads: deduplicatedLeads,
      deduplicationResult: null
    };
  } catch (error) {
    console.error('Error getting leads:', error);
    throw new Error('Failed to fetch leads');
  }
}

export async function getLeadById(id) {
  try {
    const lead = leads.find(l => l.Id === parseInt(id));
    if (!lead) {
      throw new Error('Lead not found');
    }
    return lead;
  } catch (error) {
    console.error('Error getting lead by ID:', error);
    throw error;
  }
}

export async function createLead(leadData) {
  try {
    const newId = Math.max(...leads.map(l => l.Id), 0) + 1;
    const newLead = {
      ...leadData,
      Id: newId,
      createdAt: new Date().toISOString(),
      addedBy: 1, // Default user
      addedByName: "Current User"
    };
    
    leads.push(newLead);
    return newLead;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw new Error('Failed to create lead');
  }
}

export async function updateLead(id, updates) {
  try {
    const index = leads.findIndex(l => l.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Lead not found');
    }
    
    leads[index] = { ...leads[index], ...updates };
    return leads[index];
  } catch (error) {
    console.error('Error updating lead:', error);
    throw new Error('Failed to update lead');
  }
}

export async function deleteLead(id) {
  try {
    const index = leads.findIndex(l => l.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Lead not found');
    }
    
    const deletedLead = leads.splice(index, 1)[0];
    return deletedLead;
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw new Error('Failed to delete lead');
  }
}

export async function getVisibleColumns() {
  try {
    return customColumns.filter(col => col.isVisible !== false).sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error getting visible columns:', error);
    throw new Error('Failed to get columns');
  }
}

export async function toggleColumnVisibility(id, isVisible) {
  try {
    const index = customColumns.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Column not found');
    }
    
    customColumns[index] = { 
      ...customColumns[index], 
      isVisible: isVisible 
    };
    return customColumns[index];
  } catch (error) {
    console.error('Error toggling column visibility:', error);
    throw new Error('Failed to toggle column visibility');
  }
}

export async function bulkToggleColumns(columnIds, isVisible) {
  try {
    const updatedColumns = [];
    for (const id of columnIds) {
      const index = customColumns.findIndex(c => c.Id === parseInt(id));
      if (index !== -1) {
        customColumns[index] = { 
          ...customColumns[index], 
          isVisible: isVisible 
        };
        updatedColumns.push(customColumns[index]);
      }
    }
    return updatedColumns;
  } catch (error) {
    console.error('Error bulk toggling columns:', error);
    throw new Error('Failed to bulk toggle columns');
  }
}

export async function getCustomColumns() {
  try {
    return customColumns.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error getting custom columns:', error);
    throw new Error('Failed to get custom columns');
  }
}

export async function createCustomColumn(columnData) {
  try {
    const newId = Math.max(...customColumns.map(c => c.Id), 0) + 1;
    const newColumn = {
      ...columnData,
      Id: newId,
      createdAt: new Date().toISOString(),
      order: customColumns.length + 1,
      isVisible: true,
      conditionalRules: columnData.conditionalRules || []
    };
    
    customColumns.push(newColumn);
    return newColumn;
  } catch (error) {
    console.error('Error creating custom column:', error);
    throw new Error('Failed to create custom column');
  }
}

export async function updateCustomColumn(id, updates) {
  try {
    const index = customColumns.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Column not found');
    }
    
    customColumns[index] = { 
      ...customColumns[index], 
      ...updates,
      conditionalRules: updates.conditionalRules || customColumns[index].conditionalRules || []
    };
    return customColumns[index];
  } catch (error) {
    console.error('Error updating custom column:', error);
    throw new Error('Failed to update custom column');
  }
}

export async function deleteCustomColumn(id) {
  try {
    const index = customColumns.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Column not found');
    }
    
    const column = customColumns[index];
    // Only prevent deletion of core required columns
    const protectedColumns = ['Company Name', 'Email', 'Website URL'];
    if (column.isDefault && protectedColumns.includes(column.name)) {
      throw new Error(`Cannot delete core column: ${column.name}`);
    }
    
    const deletedColumn = customColumns.splice(index, 1)[0];
    return deletedColumn;
  } catch (error) {
    console.error('Error deleting custom column:', error);
    throw error;
  }
}

export async function bulkDeleteColumns(columnIds) {
  try {
    const deletedColumns = [];
    const skippedColumns = [];
    // Sort IDs in descending order to avoid index shifting issues
    const sortedIds = columnIds.sort((a, b) => b - a);
    
    const protectedColumns = ['Company Name', 'Email', 'Website URL'];
    
    for (const id of sortedIds) {
      const index = customColumns.findIndex(c => c.Id === parseInt(id));
      if (index !== -1) {
        const column = customColumns[index];
        // Only prevent deletion of core required columns
        if (column.isDefault && protectedColumns.includes(column.name)) {
          skippedColumns.push(column.name);
        } else {
          const deletedColumn = customColumns.splice(index, 1)[0];
          deletedColumns.push(deletedColumn);
        }
      }
    }
    
    if (skippedColumns.length > 0) {
      console.warn(`Skipped deletion of protected columns: ${skippedColumns.join(', ')}`);
    }
    
    return deletedColumns;
  } catch (error) {
    console.error('Error bulk deleting columns:', error);
    throw new Error('Failed to bulk delete columns');
  }
}

export async function reorderCustomColumns(columnIds) {
  try {
    columnIds.forEach((id, index) => {
      const column = customColumns.find(c => c.Id === parseInt(id));
      if (column) {
        column.order = index + 1;
      }
    });
    
    // Import and update global column order
    const { updateGlobalColumnOrder } = await import('@/services/columnOrderService');
    updateGlobalColumnOrder(columnIds);
    
    return customColumns.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error reordering custom columns:', error);
    throw new Error('Failed to reorder custom columns');
  }
}

export async function getFreshLeadsOnly() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return leads.filter(lead => {
      const createdDate = new Date(lead.createdAt);
      return createdDate >= thirtyDaysAgo;
    });
  } catch (error) {
    console.error('Error getting fresh leads:', error);
    throw new Error('Failed to get fresh leads');
  }
}

export async function getPendingFollowUps() {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return leads.filter(lead => {
      if (!lead.followUpDate) return false;
      const followUpDate = new Date(lead.followUpDate);
      return followUpDate <= today;
    });
  } catch (error) {
    console.error('Error getting pending follow-ups:', error);
    throw new Error('Failed to get pending follow-ups');
  }
}

export async function getDailyLeadsReport() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    const todayLeads = leads.filter(lead => {
      const createdDate = new Date(lead.createdAt);
      return createdDate >= startOfDay && createdDate <= endOfDay;
    });
    
    return {
      total: todayLeads.length,
      leads: todayLeads,
      date: today.toISOString()
    };
  } catch (error) {
    console.error('Error getting daily leads report:', error);
throw new Error('Failed to get daily leads report');
  }
}