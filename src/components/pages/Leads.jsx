import React, { useCallback, useEffect, useState } from "react";
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
    'Product Name': 'productName'
  };
  
  return nameMap[column.name] || column.name.toLowerCase().replace(/\s+/g, '');
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
  
  // State for pagination and sorting
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortField, setSortField] = useState('id')
  const [sortDirection, setSortDirection] = useState('desc')
  
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

// Utility function to get field name for column

  // Initialize data
  useEffect(() => {
    loadCustomColumns();
    loadLeads();
  }, []);
// Filtering and sorting - ensure data is always an array
  const filteredAndSortedData = (Array.isArray(data) ? data : [])
    .filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead['Company Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.websiteUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead['Website URL']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.Category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.teamSize?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead['Team Size']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.productName && lead.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead['Product Name'] && lead['Product Name'].toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "" || lead.Status === statusFilter || lead.status === statusFilter;
      const matchesFunding = fundingFilter === "" || lead['Funding Type'] === fundingFilter || lead.fundingType === fundingFilter;
      const matchesCategory = categoryFilter === "" || lead.Category === categoryFilter || lead.category === categoryFilter;
      const matchesTeamSize = teamSizeFilter === "" || lead['Team Size'] === teamSizeFilter || lead.teamSize === teamSizeFilter;
      
      return matchesSearch && matchesStatus && matchesFunding && matchesCategory && matchesTeamSize;
    })
.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === "ARR" || sortField === "arr") {
        aValue = Number(a.ARR || a.arr || 0);
        bValue = Number(b.ARR || b.arr || 0);
      }
      
      if (sortField === "createdAt") {
        aValue = new Date(a.createdAt || a.CreatedAt || 0);
        bValue = new Date(b.createdAt || b.CreatedAt || 0);
      }
      
      if (sortField === "websiteUrl" || sortField === "Website URL") {
        // Sort websiteUrl by creation date (newest first) instead of alphabetical
        aValue = new Date(a.createdAt || a.CreatedAt || 0);
        bValue = new Date(b.createdAt || b.CreatedAt || 0);
      }
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination logic
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, fundingFilter, categoryFilter, teamSizeFilter]);
// Always maintain one empty row at the top
  useEffect(() => {
    if (!loading && emptyRows.length === 0) {
      addEmptyRow();
    }
  }, [loading, emptyRows.length]);


  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadLeads} />;

  return (
    <motion.div
    initial={{
        opacity: 0,
        y: 20
    }}
    animate={{
        opacity: 1,
        y: 0
    }}
    transition={{
        duration: 0.3
    }}
    className="space-y-6">
{/* Header */}
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your lead pipeline and track opportunities</p>
        </div>
        <div className="flex-shrink-0 flex space-x-2">
            <Button
                onClick={() => navigate('/leads/custom-columns')}
                variant="outline"
                className="w-full sm:w-auto">
                <ApperIcon name="Settings" size={16} className="mr-2" />
                <span className="whitespace-nowrap">Manage Columns</span>
            </Button>
            <Button
onClick={() => setShowAddLeadModal(true)}
                variant="outline"
                className="w-full sm:w-auto">
                <ApperIcon name="Plus" size={16} className="mr-2" />
                <span className="whitespace-nowrap">Add New Lead</span>
            </Button>
        </div>
    </div>
{/* Search and Filters */}
    <Card className="p-3 sm:p-4">
        <div className="space-y-4">
            <div className="w-full">
                <SearchBar
                    placeholder="Search by website, category, or team size..."
                    onSearch={setSearchTerm} />
            </div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="">All Statuses</option>
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
                <select
                    value={fundingFilter}
                    onChange={e => setFundingFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="">All Funding Types</option>
                    <option value="Bootstrapped">Bootstrapped</option>
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Y Combinator">Y Combinator</option>
                    <option value="Angel">Angel</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Series C">Series C</option>
                </select>
<select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="">All Categories</option>
                    {categoryOptions.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
<select
                    value={teamSizeFilter}
                    onChange={e => setTeamSizeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="">All Team Sizes</option>
                    {teamSizeOptions.map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>
        </div>
    </Card>
    {/* Leads Table */}
    <Card className="overflow-hidden">
        {filteredAndSortedData.length === 0 ? <Empty
onAction={() => setShowAddLeadModal(true)}
            description="Add your first lead to get started with lead management"
            actionText="Add Lead"
icon="Building2" /> : <div className="relative">
            <div 
              className="overflow-x-auto"
            >
                <table className="w-full min-w-[1200px]">
<thead className="bg-gray-50">
<tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">
                                <input
                                    type="checkbox"
checked={selectedLeads.size === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
/>
                            </th>
{(columns || []).map(column => (
                                <th key={column.Id || column.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                    <button
                                        onClick={() => handleSort(getFieldNameForColumn(column))}
                                        className="flex items-center gap-1 hover:text-gray-700">
                                        {column.name}
                                        <ApperIcon name="ArrowUpDown" size={12} />
                                    </button>
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px] sticky right-0 bg-gray-50 border-l border-gray-200">
                                Actions
                            </th>
                        </tr>
                    </thead>
<tbody className="bg-white divide-y divide-gray-200">
                        {/* Empty rows for direct data entry - positioned at top */}
                        {emptyRows.map(emptyRow => (
                            <tr key={`empty-${emptyRow.Id}`} className="hover:bg-gray-50 empty-row">
                                <td className="px-6 py-4 whitespace-nowrap w-[50px]">
                                    <input
                                        type="checkbox"
                                        disabled
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 opacity-50"
/>
                                </td>
{(columns || []).map(column => (
                                    <td key={column.Id || column.name} className="px-6 py-4 whitespace-nowrap min-w-[120px]">
                                        {renderColumnInput(column, emptyRow, true, handleFieldUpdateDebounced, handleFieldUpdate, handleEmptyRowUpdate, setEmptyRows, setData, handleStatusChange, categoryOptions, handleCreateCategory)}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-[120px] sticky right-0 bg-white border-l border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEmptyRows(prev => prev.filter(row => row.Id !== emptyRow.Id))}
                                            className="text-gray-400 hover:text-red-600 p-1 hover:bg-gray-100 rounded"
                                            title="Remove empty row">
                                            <ApperIcon name="X" size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {/* Existing leads data */}
                        {paginatedData.map(lead => (
                            <tr key={lead.Id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap w-[50px]">
                                    <input
                                        type="checkbox"
checked={selectedLeads.has(lead.Id)}
                                        onChange={() => toggleLeadSelection(lead.Id)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
/>
                                </td>
{(columns || []).map(column => (
                                    <td key={column.Id || column.name} className="px-6 py-4 whitespace-nowrap min-w-[120px]">
                                        {renderColumnInput(column, lead, false, handleFieldUpdateDebounced, handleFieldUpdate, handleEmptyRowUpdate, setEmptyRows, setData, handleStatusChange, categoryOptions, handleCreateCategory)}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-[120px] sticky right-0 bg-white border-l border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingLead(lead)}
                                            className="text-primary-600 hover:text-primary-800 p-1 hover:bg-gray-100 rounded">
                                            <ApperIcon name="Edit" size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(lead.Id)}
                                            className="text-red-600 hover:text-red-800 p-1 hover:bg-gray-100 rounded">
                                            <ApperIcon name="Trash2" size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
</div>}
</Card>

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Results Info */}
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} leads
              </div>

              <div className="flex items-center gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1"
                  >
                    <ApperIcon name="ChevronLeft" size={16} />
                  </Button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="px-3 py-1"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1"
                  >
                    <ApperIcon name="ChevronRight" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
    {/* Bulk Actions */}
{selectedLeads.size > 0 && (
      <Card className="p-4 bg-primary-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ApperIcon name="CheckCircle" size={20} className="text-primary-600" />
            <span className="text-sm font-medium text-primary-700">
{selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
onClick={clearSelection}
              className="text-primary-600 border-primary-300 hover:bg-primary-100"
            >
              Clear Selection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDeleteModal(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <ApperIcon name="Trash2" size={16} className="mr-2" />
              Delete Selected
</Button>
          </div>
        </div>
      </Card>
    )}
{/* Add Lead Modal */}
{showAddLeadModal && !columnsLoading && <AddLeadModal
          onClose={() => setShowAddLeadModal(false)} 
          onSubmit={handleAddLead}
          categoryOptions={categoryOptions}
          onCreateCategory={handleCreateCategory}
          columns={columns || []}
        />}
    {/* Edit Lead Modal */}
{editingLead && !columnsLoading && <EditLeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSubmit={handleUpdateLead}
          categoryOptions={categoryOptions}
          onCreateCategory={handleCreateCategory}
          columns={columns || []}
        />}
    {/* Bulk Delete Confirmation Dialog */}
    {showBulkDeleteModal && (
      <BulkDeleteConfirmationDialog
        selectedCount={selectedLeads.size}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkDeleteModal(false)}
      />
    )}
</motion.div>
  );
};

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