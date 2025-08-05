import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createLead, deleteLead, getLeads, getVisibleColumns, updateLead } from "@/services/api/leadsService";
import { createDeal, getDeals, updateDeal } from "@/services/api/dealsService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Hotlist from "@/components/pages/Hotlist";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

// Utility functions - moved to top to resolve hoisting issues
const getStatusColor = (status) => {
  const colors = {
    'New Lead': 'info',
    'Contacted': 'success',
    'Keep an Eye': 'warning',
    'Proposal Sent': 'primary',
    'Meeting Booked': 'info',
    'Meeting Done': 'success',
    'Commercials Sent': 'primary',
    'Negotiation': 'warning',
    'Hotlist': 'danger',
    'Temporarily on hold': 'secondary',
    'Out of League': 'secondary',
    'Outdated': 'secondary',
    'Rejected': 'danger',
    'Closed Won': 'success',
    'Closed Lost': 'danger'
  };
  return colors[status] || 'default';
};

const getFieldNameForColumn = (column) => {
  if (!column || !column.name) return '';
  
  const nameMap = {
    'Company Name': 'name',
    'Contact Name': 'contactName',
    'Email': 'email',
    'Website URL': 'websiteUrl',
    'LinkedIn': 'linkedinUrl',
    'Category': 'category',
    'Team Size': 'teamSize',
    'ARR': 'arr',
    'Status': 'status',
    'Funding Type': 'fundingType',
    'Follow-up Date': 'followUpDate',
    'Edition': 'edition',
    'Product Name': 'productName',
    'Lead Score': 'leadScore',
    'Engagement Level': 'engagementLevel',
    'Response Rate': 'responseRate',
    'Deal Potential': 'dealPotential',
    'Added By': 'addedByName',
    'Created Date': 'createdAt'
  };
  
  return nameMap[column.name] || column.name.toLowerCase().replace(/\s+/g, '');
};

// Format currency values
const formatCurrency = (amount) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date values
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get engagement level color
const getEngagementColor = (level) => {
  const colors = {
    'Very High': 'bg-green-100 text-green-800',
    'High': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-orange-100 text-orange-800',
    'Very Low': 'bg-red-100 text-red-800'
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
};

// Get deal potential color
const getDealPotentialColor = (potential) => {
  const colors = {
    'Very High': 'bg-emerald-100 text-emerald-800',
    'High': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-orange-100 text-orange-800',
    'Very Low': 'bg-red-100 text-red-800'
  };
  return colors[potential] || 'bg-gray-100 text-gray-800';
};

const getDefaultValueForType = (type) => {
  switch (type) {
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'date':
      return '';
    case 'select':
      return '';
    default:
      return '';
  }
};

function Leads() {
  const navigate = useNavigate()
  
  // State for columns data
  const [columns, setColumns] = useState([])
  const [columnsLoading, setColumnsLoading] = useState(true)
  const [columnsError, setColumnsError] = useState(null)
// State for data and UI
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [emptyRows, setEmptyRows] = useState([])
  
  // State for modals and selection
  const [showAddLeadModal, setShowAddLeadModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
const [selectedLeads, setSelectedLeads] = useState(new Set())
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showHotlist, setShowHotlist] = useState(false)
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [fundingFilter, setFundingFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [teamSizeFilter, setTeamSizeFilter] = useState('all')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

// State for categories
  const [categoryOptions, setCategoryOptions] = useState([])
  
// State for timeouts and debouncing
const teamSizeOptions = ['1-3', '4-10', '11-50', '50-100', '100+'];
  
  // Load custom columns
  async function loadCustomColumns() {
    try {
      setColumnsLoading(true);
      setColumnsError(null);
      const columnsData = await getVisibleColumns();
      setColumns(columnsData || []);
      return columnsData || [];
    } catch (error) {
      console.error('Error loading custom columns:', error);
      setColumnsError('Failed to load custom columns');
      toast.error('Failed to load custom columns');
      setColumns([]);
      return [];
    } finally {
      setColumnsLoading(false);
    }
  }
  
  // Load leads data
async function loadLeads() {
  try {
    setLoading(true);
    setError(null);
    
    const leadsResponse = await getLeads();
    
    // Process leads data from service response - getLeads returns { leads: [...], deduplicationResult: ... }
    let leads = [];
    if (leadsResponse && typeof leadsResponse === 'object') {
      // Handle service response structure: { leads: [], deduplicationResult: null }
      if (Array.isArray(leadsResponse.leads)) {
        leads = leadsResponse.leads;
      } else if (Array.isArray(leadsResponse.data)) {
        // Fallback for data property
        leads = leadsResponse.data;
      } else if (Array.isArray(leadsResponse)) {
        // Direct array response
        leads = leadsResponse;
      }
    } else if (Array.isArray(leadsResponse)) {
      // Direct array response
      leads = leadsResponse;
    }
    
    // Validate leads is an array
    if (!Array.isArray(leads)) {
      console.error('Invalid leads data format:', leadsResponse);
      throw new Error('Invalid leads data format received from service');
    }
    
    setData(leads);
    
    // Extract unique categories with proper null checks
    const categories = [...new Set(
      leads
        .map(lead => lead && lead.category)
        .filter(category => category && typeof category === 'string')
    )];
    setCategoryOptions(categories);
  } catch (error) {
    console.error('Error loading leads:', error);
    setError('Failed to load leads');
    toast.error('Failed to load leads');
  } finally {
    setLoading(false);
  }
}
  
  // Load data on component mount
useEffect(() => {
    loadCustomColumns()
    loadLeads()
  }, [])
  
// Additional state for dynamic functionality
  const [debounceTimeouts, setDebounceTimeouts] = useState({});
  const [nextTempId, setNextTempId] = useState(-1);
  const [updateTimeouts, setUpdateTimeouts] = useState({});

  // Missing state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fundingFilter, setFundingFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [teamSizeFilter, setTeamSizeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [emptyRows, setEmptyRows] = useState([]);

  // Add missing addEmptyRow function
  const addEmptyRow = useCallback(() => {
    const newEmptyRow = {
      Id: nextTempId,
      isEmptyRow: true,
      name: '',
      email: '',
      websiteUrl: '',
      status: 'Keep an Eye',
      teamSize: '1-3',
      category: '',
      fundingType: 'Bootstrapped'
    };
    setEmptyRows(prev => [...prev, newEmptyRow]);
    setNextTempId(prev => prev - 1);
  }, [nextTempId]);

  // Derive categories from leads data
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(data.map(lead => lead.category).filter(Boolean))];
    return uniqueCategories;
  }, [data]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, fundingFilter, categoryFilter, teamSizeFilter]);

  // Always maintain one empty row at the top
  useEffect(() => {
    if (!loading && emptyRows.length === 0) {
      addEmptyRow();
    }
  }, [loading, emptyRows.length, addEmptyRow]);
  // Debounced field update with timeout management
  const handleFieldUpdateDebounced = useCallback((leadId, field, value) => {
    const timeoutKey = `${leadId}-${field}`;
    
    // Clear existing timeout
    if (updateTimeouts[timeoutKey]) {
      clearTimeout(updateTimeouts[timeoutKey]);
    }
    
    // Set new timeout
    const timeoutId = setTimeout(() => {
      handleFieldUpdate(leadId, field, value);
      setUpdateTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[timeoutKey];
        return newTimeouts;
      });
    }, 500);
    
    setUpdateTimeouts(prev => ({
      ...prev,
      [timeoutKey]: timeoutId
    }));
  }, [updateTimeouts]);

// Field update handlers

const handleFieldUpdate = async (leadId, field, value) => {
    try {
      const processedValue = field === 'arr' && value !== '' ? Number(value) : value;
      const updates = { [field]: processedValue };
      const updatedLead = await updateLead(leadId, updates);
      
      setData(prevData => prevData.map(item => 
        item.Id === leadId ? updatedLead : item
      ));
    } catch (error) {
      console.error('Error updating lead field:', error);
      toast.error('Failed to update lead');
    }
  };

  // Handle status changes with deal creation logic
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      setData(prevData => prevData.map(item => 
        item.Id === leadId ? { ...item, Status: newStatus } : item
      ))

      const updatedLead = await updateLead(leadId, { Status: newStatus })
      
      // Handle deal creation logic for specific statuses
      const statusToStageMap = {
        'Contacted': 'Connected',
        'Meeting Booked': 'Meeting Booked',
        'Meeting Done': 'Meeting Done',
        'Commercials Sent': 'Negotiation',
        'Negotiation': 'Negotiation',
        'Closed Won': 'Won',
        'Closed Lost': 'Lost'
      }

      const targetStage = statusToStageMap[newStatus]
      if (targetStage) {
        try {
          const currentDeals = await getDeals()
          const existingDeal = currentDeals.find(deal => deal.leadId === leadId)
          
          if (existingDeal) {
            await updateDeal(existingDeal.Id, { stage: targetStage })
          } else if (newStatus !== 'Closed Lost') {
            const leadData = updatedLead || data.find(lead => lead.Id === leadId)
            if (leadData) {
              await createDeal({
                title: `${leadData["Company Name"] || "Unknown Company"} - Deal`,
                value: leadData.ARR || 0,
                stage: targetStage,
                leadId: leadId,
                companyName: leadData["Company Name"],
                contactName: leadData["Contact Name"],
                email: leadData.Email,
                phone: leadData.Phone,
                createdAt: new Date().toISOString()
              })
            }
          }
        } catch (dealError) {
          console.error('Error managing deal:', dealError)
        }
      }

      toast.success(`Lead status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating lead status:', error)
      toast.error('Failed to update lead status')
      
      // Revert optimistic update on error
      setData(prevData => prevData.map(item => 
        item.Id === leadId ? { ...item, Status: data.find(lead => lead.Id === leadId)?.Status || 'New Lead' } : item
      ))
    }
  }


// Empty row handlers
  const addEmptyRow = () => {
    const newEmptyRow = {
      Id: nextTempId,
      isEmptyRow: true
    };
    setEmptyRows(prev => [...prev, newEmptyRow]);
    setNextTempId(prev => prev - 1);
  };

  // Handle empty row updates and conversion to actual leads
  const handleEmptyRowUpdate = async (tempId, field, value) => {
    try {
      // Update the empty row data
      setEmptyRows(prev => prev.map(row => 
        row.Id === tempId ? { ...row, [field]: value } : row
      ))

      // Find the updated empty row
      const emptyRow = emptyRows.find(row => row.Id === tempId)
      if (!emptyRow) return

      // Check if this empty row has enough data to create a lead
      const requiredFields = ['Website URL', 'Company Name']
      const hasRequiredData = requiredFields.every(fieldName => {
        const fieldKey = getFieldNameForColumn({ name: fieldName })
        return (emptyRow[fieldKey] || (field === fieldKey && value))?.trim()
      })

      if (hasRequiredData) {
// Create lead data from empty row
        const leadData = {}
        columns.forEach(column => {
          const fieldName = getFieldNameForColumn(column)
          const fieldValue = field === fieldName ? value : emptyRow[fieldName]
          if (fieldValue !== undefined && fieldValue !== '') {
            leadData[fieldName] = fieldValue
          }
        })

        // Set default values for required fields
        leadData.Status = leadData.Status || 'New Lead'
        leadData.createdAt = new Date().toISOString()
        leadData.Id = Date.now() + Math.random() // Temporary ID

        try {
          // Create the lead
          const newLead = await createLead(leadData)
          
          // Remove the empty row and add the new lead to data
          setEmptyRows(prev => prev.filter(row => row.Id !== tempId))
          setData(prevData => [newLead, ...prevData])
          
          toast.success(`Lead created for ${leadData['Company Name'] || 'company'}`)
        } catch (error) {
          console.error('Error creating lead from empty row:', error)
          toast.error('Failed to create lead')
        }
      }
    } catch (error) {
      console.error('Error updating empty row:', error)
      toast.error('Failed to update data')
    }
  }

  // Handle category creation
  const handleCreateCategory = (newCategory) => {
    if (newCategory && !categoryOptions.includes(newCategory)) {
      setCategoryOptions(prev => [...prev, newCategory])
      toast.success(`Category "${newCategory}" created`)
    }
  }
// CRUD operations
  const handleDelete = async (leadId) => {
    try {
      await deleteLead(leadId);
      setData(prevData => prevData.filter(item => item.Id !== leadId));
      setSelectedLeads(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(leadId);
        return newSelection;
      });
      toast.success('Lead deleted successfully');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const handleBulkDelete = async () => {
    try {
      let successCount = 0;
      let failCount = 0;
      
      for (const leadId of selectedLeads) {
        try {
          await deleteLead(leadId);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete lead ${leadId}:`, error);
          failCount++;
        }
      }
      
      setData(prevData => prevData.filter(item => !selectedLeads.has(item.Id)));
      setSelectedLeads(new Set());
      setShowBulkDeleteModal(false);
      
      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} lead(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} lead(s)`);
      }
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Failed to delete leads');
    }
  };

  const handleAddLead = async (leadData) => {
    try {
      const newLead = await createLead(leadData);
      setData(prev => [newLead, ...prev]);
      setShowAddLeadModal(false);
      toast.success('Lead added successfully');
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    }
  };

  const handleUpdateLead = async (leadId, leadData) => {
    try {
      const updatedLead = await updateLead(leadId, leadData);
      setData(prevData => prevData.map(item => 
        item.Id === leadId ? updatedLead : item
      ));
      setEditingLead(null);
      toast.success('Lead updated successfully');
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    }
  };

  // Selection handlers
  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(leadId)) {
        newSelection.delete(leadId);
      } else {
        newSelection.add(leadId);
      }
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === data.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(data.map(lead => lead.Id)));
    }
  };

  const clearSelection = () => {
    setSelectedLeads(new Set());
  };

  // Pagination and sorting
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

// Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!data.length) return [];
    
    let filtered = data.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.websiteUrl?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesFunding = fundingFilter === 'all' || lead.fundingType === fundingFilter;
      const matchesCategory = categoryFilter === 'all' || lead.category === categoryFilter;
      const matchesTeamSize = teamSizeFilter === 'all' || lead.teamSize === teamSizeFilter;
      
      return matchesSearch && matchesStatus && matchesFunding && matchesCategory && matchesTeamSize;
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return filtered;
  }, [data, searchTerm, statusFilter, fundingFilter, categoryFilter, teamSizeFilter, sortField, sortDirection]);

  // Pagination
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  // Render main content
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Manage and track your sales leads</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/leads/custom-columns')}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Settings" size={16} />
            Custom Columns
          </Button>
          
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
          >
            <ApperIcon name="Plus" size={16} />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search leads by name, email, or website..."
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="Keep an Eye">Keep an Eye</option>
            <option value="Hotlist">Hotlist</option>
            <option value="Connected">Connected</option>
            <option value="Meeting Booked">Meeting Booked</option>
            <option value="Meeting Done">Meeting Done</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Launched on AppSumo">Launched on AppSumo</option>
            <option value="Launched on Prime Club">Launched on Prime Club</option>
            <option value="Out of League">Out of League</option>
            <option value="Rejected">Rejected</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
          
          <select
            value={fundingFilter}
            onChange={(e) => setFundingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Funding</option>
            <option value="Bootstrapped">Bootstrapped</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
            <option value="Series C">Series C</option>
            <option value="Y Combinator">Y Combinator</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            <option value="Website Contact Form">Website Contact Form</option>
            <option value="Partner Referral">Partner Referral</option>
            <option value="Cold Calling">Cold Calling</option>
            <option value="Events">Events</option>
            <option value="Website Chatbot">Website Chatbot</option>
            <option value="Customer Referral">Customer Referral</option>
          </select>
          
          <select
            value={teamSizeFilter}
            onChange={(e) => setTeamSizeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Team Sizes</option>
            <option value="1-3">1-3</option>
            <option value="4-10">4-10</option>
            <option value="11-50">11-50</option>
            <option value="51-100">51-100</option>
            <option value="101-500">101-500</option>
            <option value="500+">500+</option>
            <option value="1001+">1001+</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} leads
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Company Name
                    <ApperIcon name="ArrowUpDown" size={12} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    Email
                    <ApperIcon name="ArrowUpDown" size={12} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ApperIcon name="ArrowUpDown" size={12} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('leadScore')}
                >
                  <div className="flex items-center gap-1">
                    Lead Score
                    <ApperIcon name="ArrowUpDown" size={12} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('arr')}
                >
                  <div className="flex items-center gap-1">
                    ARR
                    <ApperIcon name="ArrowUpDown" size={12} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('teamSize')}
                >
                  <div className="flex items-center gap-1">
                    Team Size
                    <ApperIcon name="ArrowUpDown" size={12} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Category
                    <ApperIcon name="ArrowUpDown" size={12} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('engagementLevel')}
                >
                  <div className="flex items-center gap-1">
                    Engagement
                    <ApperIcon name="ArrowUpDown" size={12} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('addedByName')}
                >
                  <div className="flex items-center gap-1">
                    Added By
                    <ApperIcon name="ArrowUpDown" size={12} />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((lead) => (
                <tr key={lead.Id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.Id)}
                      onChange={() => toggleLeadSelection(lead.Id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.websiteUrl}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{lead.email}</td>
                  <td className="px-4 py-4">
                    <Badge variant={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{lead.leadScore}</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, lead.leadScore)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {formatCurrency(lead.arr)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{lead.teamSize}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{lead.category}</td>
                  <td className="px-4 py-4">
                    <Badge variant={getEngagementColor(lead.engagementLevel)}>
                      {lead.engagementLevel}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{lead.addedByName}</td>
                  <td className="px-4 py-4 text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingLead(lead);
                          setShowEditModal(true);
                        }}
                      >
                        <ApperIcon name="Edit2" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead.Id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <ApperIcon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginatedData.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || fundingFilter !== 'all' || categoryFilter !== 'all' || teamSizeFilter !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'Get started by adding your first lead'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && fundingFilter === 'all' && categoryFilter === 'all' && teamSizeFilter === 'all') && (
              <Button onClick={() => setShowAddModal(true)}>
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Add Lead
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    className="min-w-[32px]"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedLeads.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-4 z-50">
          <span className="text-sm text-gray-600">
            {selectedLeads.size} lead{selectedLeads.size === 1 ? '' : 's'} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDelete}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" size={14} className="mr-1" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Modals */}
{showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddLead}
          categoryOptions={categories || []}
        />
      )}

      {showEditModal && editingLead && (
        <EditLeadModal
          lead={editingLead}
          onClose={() => {
            setShowEditModal(false);
            setEditingLead(null);
          }}
          onSubmit={handleUpdateLead}
        />
      )}

      {showBulkDeleteDialog && (
        <BulkDeleteConfirmationDialog
          selectedCount={selectedLeads.size}
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDeleteDialog(false)}
        />
      )}
    </div>
  );
}

// Function to render column input based on column type
// Function to render column input based on column type
const renderColumnInput = (column, rowData, isEmptyRow, handleFieldUpdateDebounced, handleFieldUpdate, handleEmptyRowUpdate, setEmptyRows, setData, handleStatusChange, categoryOptions, handleCreateCategory) => {
  const fieldName = getFieldNameForColumn(column);
  const value = rowData[fieldName] || "";
  
  const handleChange = (newValue) => {
    if (isEmptyRow) {
      setEmptyRows(prev => prev.map(row => 
        row.Id === rowData.Id ? { ...row, [fieldName]: newValue } : row
      ));
    } else {
      setData(prevData => prevData.map(item => 
        item.Id === rowData.Id ? { ...item, [fieldName]: newValue } : item
      ));
      handleFieldUpdateDebounced(rowData.Id, fieldName, newValue);
    }
  };

  const handleBlur = (newValue) => {
    if (isEmptyRow) {
      handleEmptyRowUpdate(rowData.Id, fieldName, newValue);
    } else {
      handleFieldUpdate(rowData.Id, fieldName, newValue);
    }
  };

  const handleKeyDown = (e, newValue) => {
    if (e.key === "Enter") {
      if (isEmptyRow) {
        handleEmptyRowUpdate(rowData.Id, fieldName, newValue);
      } else {
        handleFieldUpdate(rowData.Id, fieldName, newValue);
      }
    }
  };

  // Handle read-only display fields
  if (['Lead Score', 'Engagement Level', 'Response Rate', 'Deal Potential', 'Added By', 'Created Date'].includes(column.name)) {
    let displayValue = value;
    
    if (column.name === 'ARR' && value) {
      displayValue = formatCurrency(value);
    } else if (column.name === 'Lead Score' && value) {
      displayValue = (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value >= 80 ? 'bg-green-100 text-green-800' :
            value >= 60 ? 'bg-blue-100 text-blue-800' :
            value >= 40 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {value}
          </span>
        </div>
      );
    } else if (column.name === 'Engagement Level') {
      displayValue = (
        <Badge className={`${getEngagementColor(value)} border-0 font-medium`}>
          {value || '-'}
        </Badge>
      );
    } else if (column.name === 'Deal Potential') {
      displayValue = (
        <Badge className={`${getDealPotentialColor(value)} border-0 font-medium`}>
          {value || '-'}
        </Badge>
      );
    } else if (column.name === 'Response Rate' && value) {
      displayValue = `${value}%`;
    } else if (column.name === 'Created Date') {
      displayValue = formatDate(value);
    }
    
    return (
      <div className="px-2 py-1 text-sm">
        {displayValue || '-'}
      </div>
    );
  }

  switch (column.type) {
    case 'url':
      return (
        <div className="flex items-center gap-2">
          <Input
            type="url"
            value={value}
            detectUrlPrefix={column.name === "Website URL"}
            urlPrefix={column.name === "Website URL" ? "https://" : undefined}
            onChange={e => handleChange(e.target.value)}
            onBlur={e => handleBlur(e.target.value)}
            onKeyDown={e => handleKeyDown(e, e.target.value)}
            placeholder={`Enter ${column.name.toLowerCase()}...`}
            className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 text-primary-600 font-medium placeholder-gray-400 flex-1"
          />
          {!isEmptyRow && value && column.name === "LinkedIn" && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-800 flex-shrink-0 p-1 hover:bg-gray-100 rounded"
              title={`Visit ${column.name}`}>
              <ApperIcon name="Linkedin" size={16} />
            </a>
          )}
        </div>
      );
    
    case 'number':
      return (
        <Input
          type="number"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onBlur={e => handleBlur(e.target.value)}
          onKeyDown={e => handleKeyDown(e, e.target.value)}
          placeholder={column.name === 'ARR' ? '150000' : `Enter ${column.name.toLowerCase()}...`}
          className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 font-medium placeholder-gray-400"
        />
      );

    case 'select':
      if (column.name === "Status") {
        return (
          <div className="relative">
            <Badge
              variant={getStatusColor(value)}
              className={`cursor-pointer hover:shadow-md transition-shadow ${isEmptyRow ? 'opacity-60' : ''}`}>
              {value}
            </Badge>
            <select
              value={value}
              onChange={e => isEmptyRow ? handleEmptyRowUpdate(rowData.Id, fieldName, e.target.value) : handleStatusChange(rowData.Id, e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full">
              {column.selectOptions?.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        );
      } else if (column.name === "Category") {
        return (
          <SearchableSelect
            value={value}
            onChange={newValue => isEmptyRow ? handleChange(newValue) : handleFieldUpdate(rowData.Id, fieldName, newValue)}
            options={categoryOptions}
            placeholder="Select category..."
            className={isEmptyRow ? "text-gray-500" : ""}
            onCreateCategory={handleCreateCategory}
          />
        );
      } else {
        return (
          <select
            value={value}
            onChange={e => handleChange(e.target.value)}
            onBlur={e => handleBlur(e.target.value)}
            className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full">
            {column.selectOptions?.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        );
      }

    case 'number':
      return (
        <Input
          type="number"
          step="1"
          min="0"
          value={value}
          onChange={e => handleChange(column.name === "ARR" ? Number(e.target.value) : e.target.value)}
          onBlur={e => handleBlur(e.target.value)}
          onKeyDown={e => handleKeyDown(e, e.target.value)}
          placeholder={column.defaultValue || "0"}
          className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full placeholder-gray-400"
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          value={value ? value.split('T')[0] : ''}
          onChange={e => handleChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
          onBlur={e => handleBlur(e.target.value ? new Date(e.target.value).toISOString() : '')}
          onKeyDown={e => handleKeyDown(e, e.target.value ? new Date(e.target.value).toISOString() : '')}
          className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full placeholder-gray-400 text-sm"
        />
      );

    case 'boolean':
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={e => handleChange(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
      );

    default: // text type
      return (
        <Input
          type={column.name === "Email" ? "email" : "text"}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onBlur={e => handleBlur(e.target.value)}
          onKeyDown={e => handleKeyDown(e, e.target.value)}
          placeholder={`Enter ${column.name.toLowerCase()}...`}
          className={`border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 text-gray-900 placeholder-gray-400 ${
            column.name === "Company Name" ? "font-medium" : ""
          }`}
        />
      );
  }
};

// Searchable Select Component for Categories
const SearchableSelect = ({ value, onChange, options, placeholder = "Select...", className = "", onCreateCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCreateCategory = () => {
    if (onCreateCategory && searchTerm.trim()) {
      const newCategory = onCreateCategory(searchTerm.trim());
      if (newCategory) {
        onChange(newCategory);
        setIsOpen(false);
        setSearchTerm("");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      } else if (onCreateCategory && searchTerm.trim()) {
        handleCreateCategory();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <ApperIcon name={isOpen ? "ChevronUp" : "ChevronDown"} size={14} className="text-gray-400" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <ApperIcon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search categories..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                    value === option ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <>
                {onCreateCategory && searchTerm.trim() ? (
                  <div
                    className="px-3 py-2 cursor-pointer hover:bg-primary-50 text-sm text-primary-600 flex items-center gap-2 border-b border-gray-100"
                    onClick={handleCreateCategory}
                  >
                    <ApperIcon name="Plus" size={14} />
                    <span>Create new category: "{searchTerm.trim()}"</span>
                  </div>
                ) : null}
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  {searchTerm.trim() ? "No matching categories found" : "No categories found"}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {setIsOpen(false); setSearchTerm("");}}
        />
      )}
    </div>
  );
};

const AddLeadModal = ({ onClose, onSubmit, categoryOptions, onCreateCategory, columns }) => {
  // Initialize form data based on visible columns
  const initializeFormData = () => {
    const initialData = {
      // Core fields that always exist
      name: "",
      email: "",
      websiteUrl: "",
      teamSize: "1-3",
      arr: "",
      category: "",
      linkedinUrl: "",
      status: "Keep an Eye",
      fundingType: "Bootstrapped",
      followUpDate: "",
      edition: "Select Edition",
      productName: ""
    };

    // Add dynamic fields based on visible columns
    columns.forEach(column => {
      const fieldName = getFieldNameForColumn(column);
      if (!initialData.hasOwnProperty(fieldName)) {
        initialData[fieldName] = getDefaultValueForType(column.type);
      }
    });

    return initialData;
  };

  const [formData, setFormData] = useState(initializeFormData());

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      arr: Number(formData.arr)
    });
  };

  const renderFormField = (column) => {
    const fieldName = getFieldNameForColumn(column);
    const isRequired = column.required;

    // Skip default fields that are handled separately
    const defaultFields = ['name', 'email', 'websiteUrl', 'teamSize', 'arr', 'category', 'linkedinUrl', 'status', 'fundingType', 'followUpDate', 'edition', 'productName'];
    if (defaultFields.includes(fieldName)) {
      return null;
    }

    switch (column.type) {
      case 'text':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="text"
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              placeholder={`Enter ${column.name.toLowerCase()}`}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
      
      case 'number':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="number"
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              placeholder={`Enter ${column.name.toLowerCase()}`}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
      
      case 'url':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="url"
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              placeholder={`https://example.com`}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
      
      case 'email':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="email"
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              placeholder={`Enter ${column.name.toLowerCase()}`}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
      
      case 'date':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="date"
              value={formData[fieldName] ? formData[fieldName].split('T')[0] : ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value ? new Date(e.target.value).toISOString() : ''})}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
      
      case 'select':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <select
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              required={isRequired}
            >
              <option value="">{`Select ${column.name.toLowerCase()}`}</option>
              {column.selectOptions?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      default:
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="text"
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              placeholder={`Enter ${column.name.toLowerCase()}`}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
    }
  };

return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h3 className="text-lg font-semibold">Add New Lead</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
            <ApperIcon name="X" size={20} />
          </button>
        </div>
<form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
<label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Acme Corp"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="partnerships@acme.com"
                className="w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <Input
              type="url"
              value={formData.websiteUrl}
              detectUrlPrefix={true}
              urlPrefix="https://"
              onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
              placeholder="https://example.com"
              className="w-full"
              required
            />
          </div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Size
              </label>
              <select
                value={formData.teamSize}
                onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="1-3">1-3</option>
                <option value="4-10">4-10</option>
                <option value="11-50">11-50</option>
                <option value="51-100">51-100</option>
                <option value="101-500">101-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
<div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ARR (USD)
              </label>
              <Input
                type="number"
                value={formData.arr}
                onChange={(e) => setFormData({...formData, arr: e.target.value})}
                placeholder="150000"
                className="w-full"
                required
              />
            </div>
          </div>
<div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="relative">
              <SearchableSelect
                value={formData.category}
                onChange={(value) => setFormData({...formData, category: value})}
                options={categoryOptions}
                placeholder="Select category..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onCreateCategory={onCreateCategory}
              />
            </div>
          </div>
<div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL
            </label>
            <Input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
              placeholder="https://linkedin.com/company/example"
              className="w-full"
              required
            />
          </div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
<option value="New Lead">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Keep an Eye">Keep an Eye</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Meeting Booked">Meeting Booked</option>
                <option value="Meeting Done">Meeting Done</option>
                <option value="Commercials Sent">Commercials Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Hotlist">Hotlist</option>
                <option value="Temporarily on hold">Temporarily on hold</option>
                <option value="Out of League">Out of League</option>
                <option value="Outdated">Outdated</option>
                <option value="Rejected">Rejected</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>
<div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Type
              </label>
              <select
                value={formData.fundingType}
                onChange={(e) => setFormData({...formData, fundingType: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="Bootstrapped">Bootstrapped</option>
                <option value="Pre-seed">Pre-seed</option>
                <option value="Y Combinator">Y Combinator</option>
                <option value="Angel">Angel</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Series C">Series C</option>
              </select>
            </div>
          </div>
<div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Date
            </label>
            <Input
              type="date"
              value={formData.followUpDate ? formData.followUpDate.split('T')[0] : ''}
              onChange={(e) => setFormData({...formData, followUpDate: e.target.value ? new Date(e.target.value).toISOString() : ''})}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edition
            </label>
            <select
              value={formData.edition}
              onChange={(e) => setFormData({...formData, edition: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="Select Edition">Select Edition</option>
              <option value="Black Edition">Black Edition</option>
              <option value="Collector's Edition">Collector's Edition</option>
<option value="Limited Edition">Limited Edition</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <Input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({...formData, productName: e.target.value})}
              placeholder="Enter product name"
              className="w-full"
            />
          </div>
          
          {/* Render dynamic fields from custom columns */}
          {columns && columns.map(column => renderFormField(column))}

<div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
              Add Lead
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditLeadModal = ({ lead, onClose, onSubmit, categoryOptions, onCreateCategory, columns }) => {
  // Initialize form data based on lead data and visible columns
  const initializeFormData = () => {
    const initialData = {
      // Core fields
      name: lead.name,
      email: lead.email,
      websiteUrl: lead.websiteUrl,
      teamSize: lead.teamSize,
      arr: lead.arr.toString(),
      category: lead.category,
      linkedinUrl: lead.linkedinUrl,
      status: lead.status,
      fundingType: lead.fundingType,
      edition: lead.edition || "Select Edition",
      productName: lead.productName || ""
    };

    // Add dynamic fields based on visible columns
    columns.forEach(column => {
      const fieldName = getFieldNameForColumn(column);
      if (!initialData.hasOwnProperty(fieldName)) {
        initialData[fieldName] = lead[fieldName] || getDefaultValueForType(column.type);
      }
    });

    return initialData;
  };

  const [formData, setFormData] = useState(initializeFormData());

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(lead.Id, {
      ...formData,
      arr: Number(formData.arr)
    });
  };

  const renderFormField = (column) => {
    const fieldName = getFieldNameForColumn(column);
    const isRequired = column.required;

    // Skip default fields that are handled separately
    const defaultFields = ['name', 'email', 'websiteUrl', 'teamSize', 'arr', 'category', 'linkedinUrl', 'status', 'fundingType', 'followUpDate', 'edition', 'productName'];
    if (defaultFields.includes(fieldName)) {
      return null;
    }

    switch (column.type) {
      case 'text':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="text"
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              placeholder={`Enter ${column.name.toLowerCase()}`}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
      
      case 'number':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="number"
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              placeholder={`Enter ${column.name.toLowerCase()}`}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
      
      case 'url':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="url"
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              placeholder={`https://example.com`}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
      
      case 'email':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="email"
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              placeholder={`Enter ${column.name.toLowerCase()}`}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
      
      case 'date':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="date"
              value={formData[fieldName] ? formData[fieldName].split('T')[0] : ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value ? new Date(e.target.value).toISOString() : ''})}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
      
      case 'select':
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <select
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              required={isRequired}
            >
              <option value="">{`Select ${column.name.toLowerCase()}`}</option>
              {column.selectOptions?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      default:
        return (
          <div key={column.Id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {column.name}
            </label>
            <Input
              type="text"
              value={formData[fieldName] || ''}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              placeholder={`Enter ${column.name.toLowerCase()}`}
              className="w-full"
              required={isRequired}
            />
          </div>
        );
    }
  };

return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h3 className="text-lg font-semibold">Edit Lead</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
            <ApperIcon name="X" size={20} />
          </button>
        </div>
<form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
<label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({
                            ...formData,
                            name: e.target.value
                        })}
                        className="w-full"
                        required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({
                            ...formData,
                            email: e.target.value
                        })}
                        className="w-full"
                        required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <Input
                    type="url"
                    value={formData.websiteUrl}
                    detectUrlPrefix={true}
                    urlPrefix="https://"
                    onChange={e => setFormData({
                        ...formData,
                        websiteUrl: e.target.value
                    })}
                    className="w-full"
                    required />
            </div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                    <select
                        value={formData.teamSize}
                        onChange={e => setFormData({
                            ...formData,
                            teamSize: e.target.value
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                        <option value="1-3">1-3</option>
                        <option value="4-10">4-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-100">51-100</option>
                        <option value="101-500">101-500</option>
                        <option value="500+">500+</option>
                    </select>
                </div>
<div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ARR (USD)</label>
                    <Input
                        type="number"
                        value={formData.arr}
                        onChange={e => setFormData({
                            ...formData,
                            arr: e.target.value
                        })}
                        className="w-full"
                        required />
                </div>
            </div>
<div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="relative">
                    <SearchableSelect
                        value={formData.category}
                        onChange={(value) => setFormData({
                            ...formData,
                            category: value
                        })}
                        options={categoryOptions}
                        placeholder="Select category..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onCreateCategory={onCreateCategory}
                    />
                </div>
            </div>
<div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                <Input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={e => setFormData({
                        ...formData,
                        linkedinUrl: e.target.value
                    })}
                    className="w-full"
                    required />
            </div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({
                            ...formData,
                            status: e.target.value
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
<option value="New Lead">New Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Keep an Eye">Keep an Eye</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Meeting Booked">Meeting Booked</option>
                        <option value="Meeting Done">Meeting Done</option>
                        <option value="Commercials Sent">Commercials Sent</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Hotlist">Hotlist</option>
                        <option value="Temporarily on hold">Temporarily on hold</option>
                        <option value="Out of League">Out of League</option>
                        <option value="Outdated">Outdated</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Closed Won">Closed Won</option>
                        <option value="Closed Lost">Closed Lost</option>
                    </select>
                </div>
<div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Funding Type</label>
                    <select
                        value={formData.fundingType}
                        onChange={e => setFormData({
                            ...formData,
                            fundingType: e.target.value
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                        <option value="Bootstrapped">Bootstrapped</option>
                        <option value="Pre-seed">Pre-seed</option>
                        <option value="Y Combinator">Y Combinator</option>
                        <option value="Angel">Angel</option>
                        <option value="Series A">Series A</option>
                        <option value="Series B">Series B</option>
                        <option value="Series C">Series C</option>
                    </select>
                </div>
            </div>
<div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Edition</label>
                <select
                    value={formData.edition}
                    onChange={e => setFormData({
                        ...formData,
                        edition: e.target.value
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="Select Edition">Select Edition</option>
                    <option value="Black Edition">Black Edition</option>
                    <option value="Collector's Edition">Collector's Edition</option>
                    <option value="Limited Edition">Limited Edition</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <Input
                    type="text"
                    value={formData.productName}
                    onChange={e => setFormData({
                        ...formData,
                        productName: e.target.value
                    })}
                    placeholder="Enter product name"
                    className="w-full"
                />
            </div>
            
            {/* Render dynamic fields from custom columns */}
            {columns && columns.map(column => renderFormField(column))}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
              Update Lead
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BulkDeleteConfirmationDialog = ({ selectedCount, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Bulk Delete</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <span className="font-semibold">{selectedCount}</span> selected lead{selectedCount > 1 ? 's' : ''}?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This will permanently remove the selected leads from your database. This action cannot be undone.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <ApperIcon name="Trash2" size={16} className="mr-2" />
              Delete {selectedCount} Lead{selectedCount > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;