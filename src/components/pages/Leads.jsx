import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { applyGlobalColumnOrder, updateGlobalColumnOrder } from "@/services/columnOrderService";
import { createLead, deleteLead, getLeads, getVisibleColumns, updateLead } from "@/services/api/leadsService";
import { createDeal, getDeals, updateDeal } from "@/services/api/dealsService";
import { getSalesReps } from "@/services/api/salesRepService";
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
// Status color helper function
const getStatusColor = (status) => {
  const colors = {
    'Keep an Eye': 'secondary',
    'Hotlist': 'warning',
    'Connected': 'info',
    'Meeting Booked': 'primary',
    'Meeting Done': 'primary',
    'Negotiation': 'warning',
    'Launched on AppSumo': 'success',
    'Launched on Prime Club': 'success',
    'Out of League': 'danger',
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
'Category': 'category',
    'Created Date': 'createdAt',
    'IVR Number': 'ivrNumber',
    'DID Number': 'didNumber',
    'Creation Date & Time': 'creationDateTime',
    'Follow-up Date': 'followUpDate',
    'Assigned To': 'assignedTo',
    'Assign Number': 'assignNumber',
    'Notes': 'notes'
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
const navigate = useNavigate();
const location = useLocation();
  
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
  const [showHotlist, setShowHotlist] = useState(false)
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
const [categoryFilter, setCategoryFilter] = useState('all')
  const [assignedToFilter, setAssignedToFilter] = useState('all')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
// State for categories
  
  // State for drag and drop functionality
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedIndex: null,
    dragOverIndex: null,
    draggedColumn: null
  })
  const [categoryOptions, setCategoryOptions] = useState([])
  
  // State for sales reps
  const [salesReps, setSalesReps] = useState([])
  
  // State for timeouts and debouncing
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
// Load sales reps data
  async function loadSalesReps() {
    try {
      const reps = await getSalesReps()
      setSalesReps(reps)
    } catch (error) {
      console.error('Failed to load sales reps:', error)
      toast.error('Failed to load sales representatives')
    }
  }

  // Load data on component mount
useEffect(() => {
    loadCustomColumns();
    loadLeads();
    loadSalesReps();
  }, []);

  // Listen for column order changes and reload columns
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'prime_club_column_order') {
        loadCustomColumns();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
// State for timeouts and debouncing
const [updateTimeouts, setUpdateTimeouts] = useState({});
const [nextTempId, setNextTempId] = useState(-1);

// Add empty row function - moved before useEffect to avoid temporal dead zone
const addEmptyRow = () => {
  const newEmptyRow = {
    Id: nextTempId,
    isEmptyRow: true
  };
  setEmptyRows(prev => [...prev, newEmptyRow]);
  setNextTempId(prev => prev - 1);
};

useEffect(() => {
   if (!loading && emptyRows.length === 0) {
     addEmptyRow();
   }
 }, [loading, emptyRows.length]);

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
        item.Id === leadId ? { ...item, Status: item.Status } : item
      ));
    }
  };
  // Column drag and drop handlers
  const handleColumnDragStart = (e, index) => {
    setDragState({
      isDragging: true,
      dragIndex: index,
      dragOverIndex: null
    });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (dragState.dragIndex === null || dragState.dragIndex === dropIndex) {
      setDragState({ isDragging: false, dragIndex: null, dragOverIndex: null });
      return;
    }

    try {
      const newColumns = [...orderedColumns];
      const draggedColumn = newColumns[dragState.dragIndex];
      
      // Remove from current position
      newColumns.splice(dragState.dragIndex, 1);
      // Insert at new position
      newColumns.splice(dropIndex, 0, draggedColumn);
      
      // Update columns state
      setColumns(newColumns);
      
      // Save to global column order
      const newColumnIds = newColumns.map(col => col.Id);
      updateGlobalColumnOrder(newColumnIds);
      
      toast.success('Column order updated successfully');
    } catch (error) {
      console.error('Error reordering columns:', error);
      toast.error('Failed to update column order');
    }

    setDragState({ isDragging: false, dragIndex: null, dragOverIndex: null });
  };

  const handleColumnDragEnd = () => {
    setDragState({ isDragging: false, dragIndex: null, dragOverIndex: null });
  };

  // Render column data based on column type
  const renderColumnData = (lead, column, fieldName) => {
    const value = lead[fieldName];
    
    switch (column.name) {
      case 'Company Name':
        return (
          <div className="flex items-center">
            <div>
<div className="text-sm font-medium text-gray-900">{lead.name}</div>
              <div className="text-sm text-gray-500">{lead.email}</div>
            </div>
          </div>
        );
      case 'Status':
        return (
          <Badge variant={getStatusColor(lead.status)}>
            {lead.status}
          </Badge>
        );
      case 'Lead Score':
        return (
          <div className="flex items-center">
            <div className="text-sm font-medium text-gray-900">{lead.leadScore}</div>
            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, lead.leadScore)}%` }}
              ></div>
            </div>
          </div>
        );
      case 'ARR':
        return <span className="text-sm text-gray-900">{formatCurrency(lead.arr)}</span>;
case 'Creation Date & Time':
        return (
          <span className="text-sm text-gray-900">
            {lead.creationDateTime ? new Date(lead.creationDateTime).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : '-'}
          </span>
        );
      case 'Follow-up Date':
        return (
          <span className="text-sm text-gray-900">
            {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit'
            }) : '-'}
          </span>
        );
      default:
        return <span className="text-sm text-gray-900">{value || '-'}</span>;
    }
  };
 
// Handle empty row update
  const handleEmptyRowUpdate = async (tempId, field, value) => {
    try {
      const emptyRow = emptyRows.find(row => row.Id === tempId);
      if (!emptyRow) return;

      // Update the empty row
      setEmptyRows(prev => prev.map(row => 
        row.Id === tempId ? { ...row, [field]: value } : row
      ));

      // Check if this empty row has enough data to create a lead
const requiredFields = ['Company Name'];
      const hasRequiredData = requiredFields.every(fieldName => {
        const fieldKey = getFieldNameForColumn({ name: fieldName });
        return (emptyRow[fieldKey] || (field === fieldKey && value))?.trim();
      });

      if (hasRequiredData) {
        // Create lead data from empty row
        const leadData = {};
        columns.forEach(column => {
          const fieldName = getFieldNameForColumn(column);
          const fieldValue = field === fieldName ? value : emptyRow[fieldName];
          if (fieldValue !== undefined && fieldValue !== '') {
            leadData[fieldName] = fieldValue;
          }
        });

        // Set default values for required fields
        leadData.Status = leadData.Status || 'New Lead';
        leadData.createdAt = new Date().toISOString();
        leadData.Id = Date.now() + Math.random(); // Temporary ID

        try {
          // Create the lead
          const newLead = await createLead(leadData);
          
          // Remove the empty row and add the new lead to data
          setEmptyRows(prev => prev.filter(row => row.Id !== tempId));
          setData(prevData => [newLead, ...prevData]);
          
          toast.success(`Lead created for ${leadData['Company Name'] || 'company'}`);
        } catch (error) {
          console.error('Error creating lead from empty row:', error);
          toast.error('Failed to create lead');
        }
      }
    } catch (error) {
      console.error('Error updating empty row:', error);
      toast.error('Failed to update data');
    }
  };

  // Handle category creation
  const handleCreateCategory = (newCategory) => {
    if (newCategory && !categoryOptions.includes(newCategory)) {
      setCategoryOptions(prev => [...prev, newCategory]);
      toast.success(`Category "${newCategory}" created`);
    }
  };

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
// Apply global column order to visible columns
  const orderedColumns = applyGlobalColumnOrder(columns);

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
      setShowBulkDeleteDialog(false);
      
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
lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || lead.category === categoryFilter;
      const matchesAssignedTo = assignedToFilter === 'all' || lead.assignedTo === assignedToFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesAssignedTo;
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
}, [data, searchTerm, statusFilter, categoryFilter, assignedToFilter, sortField, sortDirection]);

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
    <motion.div 
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Manage your leads and convert them to deals</p>
        </div>
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={addEmptyRow}
              className="bg-green-600 hover:bg-green-700 text-white animate-button-hover"
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Row
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
<div className="flex items-center gap-4">
              {/* Tab Navigation */}
<div className="flex bg-surface-100 rounded-lg p-1">
                <button
                  onClick={() => navigate('/leads')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                    location.pathname === '/leads'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-50'
                  }`}
                >
                  <ApperIcon name="Users" size={16} className="mr-2" />
                  Leads
                </button>
                <button
                  onClick={() => navigate('/leads/custom-columns')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                    location.pathname === '/leads/custom-columns'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-50'
                  }`}
                >
                  <ApperIcon name="Settings" size={16} className="mr-2" />
                  Custom Columns
                </button>
              </div>
              
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white animate-button-hover"
              >
                <ApperIcon name="UserPlus" size={16} className="mr-2" />
                Add Lead
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search leads..."
          className="w-full max-w-md"
        />
      </motion.div>
{/* Filters */}
      <motion.div 
        className="bg-white p-4 rounded-lg shadow-sm border animate-card-hover"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            {(() => {
              const categoryColumn = columns.find(col => col.name === "Category");
              const categoryOptions = categoryColumn?.selectOptions || [];
              return categoryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ));
            })()}
          </select>

          <select
            value={assignedToFilter}
            onChange={(e) => setAssignedToFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Assigned To</option>
            {salesReps.map(rep => (
              <option key={rep.Id} value={rep.name}>{rep.name}</option>
            ))}
          </select>
        </div>
      </motion.div>
{/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} leads
      </div>

      {/* Selected Items Actions */}
      {selectedLeads.size > 0 && (
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedLeads.size} lead{selectedLeads.size === 1 ? '' : 's'} selected
            </span>
            <div className="flex gap-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleBulkDelete}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 animate-button-hover"
                >
                  <ApperIcon name="Trash2" size={16} className="mr-2" />
                  Delete Selected ({selectedLeads.size})
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 animate-button-hover"
                >
                  Clear Selection
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
{/* Main Content */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loading />
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Error message={error} />
        </motion.div>
      ) : filteredAndSortedData.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Empty message="No leads found" />
        </motion.div>
      ) : (
        <motion.div 
          className="bg-white rounded-lg shadow-sm border overflow-hidden animate-card-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <motion.thead 
                className="bg-gray-50 border-b"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === paginatedData.length && paginatedData.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  {orderedColumns.map((column, index) => {
                    const fieldName = getFieldNameForColumn(column);
                    return (
                      <th
                        key={column.Id}
                        draggable
                        onDragStart={(e) => handleColumnDragStart(e, index)}
                        onDragOver={handleColumnDragOver}
                        onDrop={(e) => handleColumnDrop(e, index)}
                        onDragEnd={handleColumnDragEnd}
                        className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none ${
                          dragState.isDragging && dragState.dragIndex === index ? 'opacity-50 bg-blue-50' : ''
                        } ${dragState.dragOverIndex === index ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                        onClick={() => handleSort(fieldName)}
                      >
                        <div className="flex items-center gap-1">
                          {column.name}
                          <ApperIcon name="ArrowUpDown" size={12} />
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </motion.thead>
              <tbody className="divide-y divide-gray-200">
                {[...paginatedData, ...emptyRows].map((lead, index) => (
                  <motion.tr
                    key={lead.Id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.6 + (index * 0.05),
                      ease: "easeOut" 
                    }}
                    whileHover={{ 
                      backgroundColor: "#f9fafb",
                      transition: { duration: 0.2 }
                    }}
                    className={`cursor-pointer ${lead.isEmptyRow ? 'empty-row' : ''} ${
                      selectedLeads.has(lead.Id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.Id)}
                        onChange={() => toggleLeadSelection(lead.Id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    {orderedColumns.map((column) => {
                      const fieldName = getFieldNameForColumn(column);
                      return (
                        <td key={column.Id} className="px-4 py-4 whitespace-nowrap">
                          {lead.isEmptyRow ? (
                            renderColumnInput(column, lead, true, handleFieldUpdateDebounced, handleFieldUpdate, handleEmptyRowUpdate, setEmptyRows, setData, handleStatusChange, categoryOptions, handleCreateCategory)
                          ) : (
                            renderColumnData(lead, column, fieldName)
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {!lead.isEmptyRow && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingLead(lead);
                              setShowEditModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            title="Edit lead"
                          >
                            <ApperIcon name="Edit2" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(lead.Id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Delete lead"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
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
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Get started by adding your first lead'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && categoryFilter === 'all') && (
                <Button onClick={() => setShowAddModal(true)}>
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Add Lead
                </Button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
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
                    className="min-w-[2rem]"
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
        </motion.div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddLead}
          categoryOptions={categoryOptions}
          onCreateCategory={handleCreateCategory}
          columns={columns}
          salesReps={salesReps}
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
          categoryOptions={categoryOptions}
          onCreateCategory={handleCreateCategory}
          columns={columns}
          salesReps={salesReps}
        />
      )}

      {showBulkDeleteDialog && (
        <BulkDeleteConfirmationDialog
          selectedCount={selectedLeads.size}
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDeleteDialog(false)}
        />
      )}
    </motion.div>
  );
}

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

  // Handle read-only display for certain columns
  if (['Lead Score', 'Created Date'].includes(column.name)) {
    let displayValue = value;
    
    if (column.name === 'Lead Score' && value) {
      displayValue = (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value >= 80 ? 'bg-green-100 text-green-800' :
            value >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {value}
          </span>
        </div>
      );
    } else if (column.name === 'Created Date') {
      displayValue = formatDate(value);
    }
    
    return (
      <div className="text-sm text-gray-900">
        {displayValue || '-'}
      </div>
    );
  }

  switch (column.type) {
case 'url':
      return (
        <div className="flex items-center">
          <Input
            type="url"
            value={value}
            onChange={e => handleChange(e.target.value)}
            onBlur={e => handleBlur(e.target.value)}
            onKeyDown={e => handleKeyDown(e, e.target.value)}
            placeholder={`Enter ${column.name.toLowerCase()}...`}
            className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 text-primary-600 font-medium placeholder-gray-400 flex-1"
          />
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

case 'datetime':
      return (
        <Input
          type="datetime-local"
          value={value ? new Date(value).toISOString().slice(0, 16) : ''}
          onChange={e => handleChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
          onBlur={e => handleBlur(e.target.value ? new Date(e.target.value).toISOString() : '')}
          onKeyDown={e => handleKeyDown(e, e.target.value ? new Date(e.target.value).toISOString() : '')}
          className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full placeholder-gray-400 text-xs"
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

const AddLeadModal = ({ onClose, onSubmit, categoryOptions, onCreateCategory, columns, salesReps }) => {
// Initialize form data based on visible columns
  const initializeFormData = () => {
    const initialData = {
      // Core fields that always exist
      name: "",
email: "",
      arr: "",
      category: "",
      status: "Keep an Eye",
      followUpDate: "",
      edition: "Select Edition",
      productName: "",
      ivrNumber: "",
      didNumber: "",
      creationDateTime: new Date().toISOString(),
      assignedTo: "",
      assignNumber: ""
    };

    // Add dynamic fields based on visible columns
    if (columns && Array.isArray(columns)) {
      columns.forEach(column => {
        const fieldName = getFieldNameForColumn(column);
        if (!initialData.hasOwnProperty(fieldName)) {
          initialData[fieldName] = getDefaultValueForType(column.type);
        }
      });
    }

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

  // Check if field should be visible based on conditional logic
  const shouldShowField = (column) => {
    if (!column.conditionalRules || column.conditionalRules.length === 0) {
      return true;
    }

    // Check each conditional rule
    return column.conditionalRules.some(rule => {
      const conditionFieldName = getFieldNameForColumn({ name: rule.condition.field });
      const conditionValue = formData[conditionFieldName];
      
      switch (rule.condition.operator) {
        case 'equals':
          return conditionValue === rule.condition.value;
        case 'notEquals':
          return conditionValue !== rule.condition.value;
        case 'contains':
          return conditionValue && conditionValue.includes(rule.condition.value);
        default:
          return true;
      }
    });
  };

const renderFormField = (column) => {
    const fieldName = getFieldNameForColumn(column);
    const isRequired = column.required;

// Skip default fields that are handled separately
    const defaultFields = ['name', 'email', 'arr', 'category', 'status', 'followUpDate', 'edition', 'productName', 'ivrNumber', 'didNumber', 'creationDateTime', 'assignedTo', 'assignNumber'];
    if (defaultFields.includes(fieldName)) {
      return null;
    }

    // Check conditional visibility
    if (!shouldShowField(column)) {
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
            {/* Name and Email Row */}
            {(shouldShowField({ fieldName: 'name' }) || shouldShowField({ fieldName: 'email' })) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shouldShowField({ fieldName: 'name' }) && (
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
                )}
                {shouldShowField({ fieldName: 'email' }) && (
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
                )}
              </div>
            )}

{/* ARR Field */}
            {shouldShowField({ fieldName: 'arr' }) && (
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
            )}

            {/* Category */}
            {shouldShowField({ fieldName: 'category' }) && (
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
            )}
{/* Status Field */}
            {shouldShowField({ fieldName: 'status' }) && (
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
            )}

            {/* Follow-up Date */}
            {shouldShowField({ fieldName: 'followUpDate' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <Input
                  type="date"
                  value={formData.followUpDate ? formData.followUpDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({...formData, followUpDate: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
            )}

            {/* IVR Number */}
            {shouldShowField({ fieldName: 'ivrNumber' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IVR Number
                </label>
                <Input
                  type="text"
                  value={formData.ivrNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Validate 10-12 digits if numeric
                    if (value && /^\d+$/.test(value) && (value.length < 10 || value.length > 12)) {
                      return; // Don't update if numeric but wrong length
                    }
                    setFormData({...formData, ivrNumber: value});
                  }}
                  placeholder="Enter IVR number (10-12 digits if numeric)"
                  className="w-full"
                />
              </div>
            )}

            {/* DID Number */}
            {shouldShowField({ fieldName: 'didNumber' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DID Number
                </label>
                <Input
                  type="text"
                  value={formData.didNumber}
                  onChange={(e) => setFormData({...formData, didNumber: e.target.value})}
                  placeholder="Enter DID number"
                  className="w-full"
                />
              </div>
            )}

            {/* Creation Date & Time */}
            {shouldShowField({ fieldName: 'creationDateTime' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creation Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={formData.creationDateTime ? new Date(formData.creationDateTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({...formData, creationDateTime: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                  className="w-full"
                />
              </div>
            )}

            {/* Assigned To */}
            {shouldShowField({ fieldName: 'assignedTo' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Select assignee...</option>
                  {salesReps.map(rep => (
                    <option key={rep.Id} value={rep.name}>{rep.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Assign Number */}
            {shouldShowField({ fieldName: 'assignNumber' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Number
                </label>
                <Input
                  type="text"
                  value={formData.assignNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    // Validate: 10-digit mobile or 4-6 digit extension
                    if (value && ((value.length !== 10 && value.length < 4) || value.length > 10)) {
                      return; // Don't update if invalid length
                    }
                    setFormData({...formData, assignNumber: value});
                  }}
                  placeholder="10-digit mobile or 4-6 digit extension"
                  className="w-full"
                />
              </div>
            )}

            {/* Edition */}
            {shouldShowField({ fieldName: 'edition' }) && (
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
            )}

            {/* Product Name */}
            {shouldShowField({ fieldName: 'productName' }) && (
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
            )}

            {/* Dynamic custom fields */}
            {columns && Array.isArray(columns) && columns.map(column => renderFormField(column))}
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

const EditLeadModal = ({ lead, onClose, onSubmit, categoryOptions, onCreateCategory, columns, salesReps = [] }) => {
  // Initialize form data based on lead data and visible columns
const initializeFormData = () => {
    const initialData = {
      // Core fields
      name: lead?.name || '',
      email: lead?.email || '',
arr: lead?.arr ? lead.arr.toString() : '',
      category: lead?.category || '',
      status: lead?.status || 'New Lead',
      followUpDate: lead?.followUpDate || '',
      edition: lead?.edition || "Select Edition",
      productName: lead?.productName || "",
      ivrNumber: lead?.ivrNumber || '',
      didNumber: lead?.didNumber || '',
      creationDateTime: lead?.creationDateTime || new Date().toISOString(),
      assignedTo: lead?.assignedTo || '',
      assignNumber: lead?.assignNumber || ''
    };

    // Add dynamic fields based on visible columns
    if (columns && Array.isArray(columns)) {
      columns.forEach(column => {
        const fieldName = getFieldNameForColumn(column);
        if (!initialData.hasOwnProperty(fieldName)) {
          initialData[fieldName] = lead?.[fieldName] || getDefaultValueForType(column.type);
        }
      });
    }

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

  // Check if field should be visible based on conditional logic
  const shouldShowField = (column) => {
    if (!column.conditionalRules || column.conditionalRules.length === 0) {
      return true;
    }

    // Check each conditional rule
    return column.conditionalRules.some(rule => {
      const conditionFieldName = getFieldNameForColumn({ name: rule.condition.field });
      const conditionValue = formData[conditionFieldName];
      
      switch (rule.condition.operator) {
        case 'equals':
          return conditionValue === rule.condition.value;
        case 'notEquals':
          return conditionValue !== rule.condition.value;
        case 'contains':
          return conditionValue && conditionValue.includes(rule.condition.value);
        default:
          return true;
      }
    });
  };

const renderFormField = (column) => {
    const fieldName = getFieldNameForColumn(column);
    const isRequired = column.required;

// Skip default fields that are handled separately
    const defaultFields = ['name', 'email', 'arr', 'category', 'status', 'followUpDate', 'edition', 'productName', 'ivrNumber', 'didNumber', 'creationDateTime', 'assignedTo', 'assignNumber'];
    if (defaultFields.includes(fieldName)) {
      return null;
    }

    // Check conditional visibility
    if (!shouldShowField(column)) {
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
            {/* Name and Email Row */}
            {(shouldShowField({ fieldName: 'name' }) || shouldShowField({ fieldName: 'email' })) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shouldShowField({ fieldName: 'name' }) && (
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
                )}
                {shouldShowField({ fieldName: 'email' }) && (
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
                )}
              </div>
            )}

{/* ARR Field */}
            {shouldShowField({ fieldName: 'arr' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ARR</label>
                <Input
                  type="number"
                  value={formData.arr}
                  onChange={e => setFormData({
                    ...formData,
                    arr: e.target.value
                  })}
                  placeholder="1000000"
                  className="w-full" />
              </div>
            )}

            {/* Category */}
            {shouldShowField({ fieldName: 'category' }) && (
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
onCreateCategory={onCreateCategory} />
                </div>
              </div>
            )}

            {/* Status Field */}
            {shouldShowField({ fieldName: 'status' }) && (
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
            )}

            {/* Follow-up Date */}
            {shouldShowField({ fieldName: 'followUpDate' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                <Input
                  type="date"
                  value={formData.followUpDate ? formData.followUpDate.split('T')[0] : ''}
                  onChange={e => setFormData({
                    ...formData,
                    followUpDate: e.target.value ? new Date(e.target.value).toISOString() : ''
                  })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
            )}

            {/* IVR Number */}
            {shouldShowField({ fieldName: 'ivrNumber' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IVR Number</label>
                <Input
                  type="text"
                  value={formData.ivrNumber}
                  onChange={e => {
                    const value = e.target.value;
                    // Validate 10-12 digits if numeric
                    if (value && /^\d+$/.test(value) && (value.length < 10 || value.length > 12)) {
                      return; // Don't update if numeric but wrong length
                    }
                    setFormData({...formData, ivrNumber: value});
                  }}
                  placeholder="Enter IVR number (10-12 digits if numeric)"
                  className="w-full"
                />
              </div>
            )}

            {/* DID Number */}
            {shouldShowField({ fieldName: 'didNumber' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DID Number</label>
                <Input
                  type="text"
                  value={formData.didNumber}
                  onChange={e => setFormData({
                    ...formData,
                    didNumber: e.target.value
                  })}
                  placeholder="Enter DID number"
                  className="w-full"
                />
              </div>
            )}

            {/* Creation Date & Time */}
            {shouldShowField({ fieldName: 'creationDateTime' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Creation Date & Time</label>
                <Input
                  type="datetime-local"
                  value={formData.creationDateTime ? new Date(formData.creationDateTime).toISOString().slice(0, 16) : ''}
                  onChange={e => setFormData({
                    ...formData,
                    creationDateTime: e.target.value ? new Date(e.target.value).toISOString() : ''
                  })}
                  className="w-full"
                />
              </div>
            )}

            {/* Assigned To */}
            {shouldShowField({ fieldName: 'assignedTo' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <select
                  value={formData.assignedTo}
                  onChange={e => setFormData({
                    ...formData,
                    assignedTo: e.target.value
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">Select assignee...</option>
                  {salesReps.map(rep => (
                    <option key={rep.Id} value={rep.name}>{rep.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Assign Number */}
            {shouldShowField({ fieldName: 'assignNumber' }) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Number</label>
                <Input
                  type="text"
                  value={formData.assignNumber}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    // Validate: 10-digit mobile or 4-6 digit extension
                    if (value && ((value.length !== 10 && value.length < 4) || value.length > 10)) {
                      return; // Don't update if invalid length
                    }
                    setFormData({...formData, assignNumber: value});
                  }}
                  placeholder="10-digit mobile or 4-6 digit extension"
                  className="w-full"
                />
              </div>
            )}

            {/* Edition */}
            {shouldShowField({ fieldName: 'edition' }) && (
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
            )}

            {/* Product Name */}
            {shouldShowField({ fieldName: 'productName' }) && (
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
            )}

            {/* Dynamic custom fields */}
            {columns && Array.isArray(columns) && columns.map(column => renderFormField(column))}
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