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

// Utility functions
const getFieldNameForColumn = (column) => {
  const fieldMap = {
    'Website URL': 'websiteUrl',
    'Company Name': 'name',
    'Status': 'status',
    'Product Name': 'productName',
    'Team Size': 'teamSize',
    'ARR': 'arr',
    'Category': 'category',
    'LinkedIn': 'linkedinUrl',
    'Funding Type': 'fundingType',
    'Follow-up Date': 'followUpDate',
    'Email': 'email',
    'Phone': 'phone'
  };
  return fieldMap[column.name] || column.name.toLowerCase().replace(/\s+/g, '');
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

const getStatusColor = (status) => {
  const colors = {
    'New Lead': 'info',
    'Contacted': 'primary',
    'Keep an Eye': 'info',
    'Proposal Sent': 'warning',
    'Meeting Booked': 'primary',
    'Meeting Done': 'success',
    'Commercials Sent': 'warning',
    'Negotiation': 'accent',
    'Hotlist': 'primary',
    'Temporarily on Hold': 'default',
    'Closed Won': 'success',
    'Closed Lost': 'danger'
  };
  return colors[status] || 'default';
};

const parseMultipleUrls = (input) => {
  if (!input) return [];
  
  const lines = input.split('\n').filter(line => line.trim());
  const urls = [];
  
  lines.forEach(line => {
    const wordsInLine = line.split(/\s+/);
    wordsInLine.forEach(word => {
      const trimmedWord = word.trim();
      if (trimmedWord) {
        let cleanUrl = trimmedWord;
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        urls.push(cleanUrl);
      }
    });
  });
  
  const uniqueUrls = [...new Set(urls)];
  return uniqueUrls;
};

const Leads = () => {
  const navigate = useNavigate();
  
  // State declarations
  const [data, setData] = useState([]);
  const [emptyRows, setEmptyRows] = useState([]);
  const [customColumns, setCustomColumns] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Real Estate', 'Other'
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fundingFilter, setFundingFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [teamSizeFilter, setTeamSizeFilter] = useState('');
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showHotlist, setShowHotlist] = useState(false);
  const [debounceTimeouts, setDebounceTimeouts] = useState({});
  const [nextTempId, setNextTempId] = useState(-1);
// Additional constants and options
  const teamSizeOptions = ["1-3", "4-10", "11-50", "51-100", "101-500", "500+"];
// Load data functions
const loadCustomColumns = async () => {
    try {
      const columns = await getVisibleColumns();
      setCustomColumns(columns);
    } catch (error) {
      console.error('Error loading custom columns:', error);
      toast.error('Failed to load column configuration');
    }
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const leadsData = await getLeads();
      setData(leadsData);
    } catch (error) {
      console.error('Error loading leads:', error);
      setError('Failed to load leads');
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const updatedLead = await updateLead(leadId, { status: newStatus })
      
      setData(prevData => prevData.map(item => 
        item.Id === leadId ? updatedLead : item
      ))
      
      // Handle deal creation/updates based on status
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
          // Get current deals to check if one exists for this lead
          const currentDeals = await getDeals()
          const existingDeal = currentDeals.find(deal => deal.leadId === leadId.toString())
          
          if (existingDeal) {
            // Update existing deal to the new stage
            await updateDeal(existingDeal.Id, { stage: targetStage })
            toast.success(`Lead status updated and deal moved to ${targetStage} stage!`)
          } else {
            // Create new deal for this lead
            const leadData = data.find(lead => lead.Id === leadId)
            if (leadData) {
              await createDeal({
                leadId: leadId.toString(),
                companyName: leadData.name,
                email: leadData.email,
                websiteUrl: leadData.websiteUrl,
                stage: targetStage,
                value: leadData.arr || 0,
                probability: 50,
                expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                assignedTo: leadData.addedBy || 1
              })
              toast.success(`Lead status updated and new deal created in ${targetStage} stage!`)
            }
          }
        } catch (dealError) {
          console.error('Error handling deal operations:', dealError)
          toast.warning(`Lead status updated, but failed to sync with deals pipeline`)
        }
      } else {
        toast.success('Lead status updated successfully!')
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
      toast.error('Failed to update lead status')
    }
  }

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

  const handleFieldUpdateDebounced = useCallback((leadId, field, value) => {
    const timeoutKey = `${leadId}-${field}`;
    
    if (debounceTimeouts[timeoutKey]) {
      clearTimeout(debounceTimeouts[timeoutKey]);
    }
    
    const timeoutId = setTimeout(() => {
      handleFieldUpdate(leadId, field, value);
      setDebounceTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[timeoutKey];
        return newTimeouts;
      });
    }, 500);
    
    setDebounceTimeouts(prev => ({
      ...prev,
      [timeoutKey]: timeoutId
    }));
  }, [debounceTimeouts]);

  // Empty row handlers
  const addEmptyRow = () => {
    const newEmptyRow = {
      Id: nextTempId,
      isEmptyRow: true
    };
    setEmptyRows(prev => [...prev, newEmptyRow]);
    setNextTempId(prev => prev - 1);
  };

  const handleEmptyRowUpdate = async (tempId, field, value) => {
    try {
      const emptyRow = emptyRows.find(row => row.Id === tempId)
      if (!emptyRow) return

      // Collect all filled fields from the empty row
      const urls = parseMultipleUrls(emptyRow.websiteUrl || value)
      
      if (urls.length === 0) {
        toast.error('Please enter at least one website URL')
        return
      }

      const leadData = {}
      customColumns.forEach(column => {
        const fieldName = getFieldNameForColumn(column)
        if (fieldName === 'websiteUrl') {
          // Skip websiteUrl as we handle it separately
          return
        }
        leadData[fieldName] = emptyRow[fieldName] || ''
      })

      // Create leads for each URL
      const successfulLeads = []
      const failedUrls = []

      for (const url of urls) {
        try {
          const newLead = await createLead({
            ...leadData,
            websiteUrl: url
          })
          successfulLeads.push(newLead)
        } catch (error) {
          console.error(`Failed to create lead for ${url}:`, error)
          failedUrls.push(url)
        }
      }

      if (successfulLeads.length > 0) {
        setData(prev => [...successfulLeads, ...prev])
        toast.success(`Successfully created ${successfulLeads.length} lead(s)`)
      }

      if (failedUrls.length > 0) {
        toast.error(`Failed to create leads for ${failedUrls.length} URL(s)`)
      }

      // Remove the empty row
      setEmptyRows(prev => prev.filter(row => row.Id !== tempId))
    } catch (error) {
      console.error('Error updating empty row:', error)
      toast.error('Failed to create lead')
    }
  }

  // Category handlers
  const handleCreateCategory = (newCategory) => {
    if (newCategory && !categoryOptions.includes(newCategory)) {
      setCategoryOptions(prev => [...prev, newCategory]);
      return newCategory;
    }
    return null;
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

  // Initialize data
  useEffect(() => {
    loadCustomColumns();
    loadLeads();
  }, []);
// Filtering and sorting
const filteredAndSortedData = data
    .filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.websiteUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.teamSize?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.productName && lead.productName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "" || lead.status === statusFilter;
      const matchesFunding = fundingFilter === "" || lead.fundingType === fundingFilter;
      const matchesCategory = categoryFilter === "" || lead.category === categoryFilter;
      const matchesTeamSize = teamSizeFilter === "" || lead.teamSize === teamSizeFilter;
      
      return matchesSearch && matchesStatus && matchesFunding && matchesCategory && matchesTeamSize;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === "arr") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortField === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortField === "websiteUrl") {
        // Sort websiteUrl by creation date (newest first) instead of alphabetical
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      }
      
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
<option value="">All Statuses</option>
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="all">All Statuses</option>
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
<option value="">All Funding Types</option>
                    onChange={e => setFundingFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="all">All Funding Types</option>
                    <option value="Bootstrapped">Bootstrapped</option>
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Y Combinator">Y Combinator</option>
                    <option value="Angel">Angel</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Series C">Series C</option>
                </select>
                <select
<option value="">All Categories</option>
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="all">All Categories</option>
                    {categoryOptions.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <select
<option value="">All Team Sizes</option>
                    onChange={e => setTeamSizeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="all">All Team Sizes</option>
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
                                    checked={selectedLeads.length === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                            </th>
                            {customColumns.map(column => (
                                <th key={column.Id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
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
                                {customColumns.map(column => (
                                    <td key={column.Id} className="px-6 py-4 whitespace-nowrap min-w-[120px]">
                                        {renderColumnInput(column, emptyRow, true)}
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
                                        checked={selectedLeads.includes(lead.Id)}
                                        onChange={() => toggleLeadSelection(lead.Id)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </td>
                                {customColumns.map(column => (
                                    <td key={column.Id} className="px-6 py-4 whitespace-nowrap min-w-[120px]">
                                        {renderColumnInput(column, lead, false)}
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
    {selectedLeads.length > 0 && (
      <Card className="p-4 bg-primary-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ApperIcon name="CheckCircle" size={20} className="text-primary-600" />
            <span className="text-sm font-medium text-primary-700">
              {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
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
        </div>
      </Card>
    )}
{/* Add Lead Modal */}
    {showAddLeadModal && <AddLeadModal
      onClose={() => setShowAddLeadModal(false)} 
      onSubmit={handleAddLead}
      categoryOptions={categoryOptions}
      onCreateCategory={handleCreateCategory}
    />}
    />}
    {/* Edit Lead Modal */}
    {editingLead && <EditLeadModal
        lead={editingLead}
        onClose={() => setEditingLead(null)}
        onSubmit={handleUpdateLead}
        categoryOptions={categoryOptions}
        onCreateCategory={handleCreateCategory}
{/* Bulk Delete Confirmation Dialog */}
    {showBulkDeleteModal && (
      <BulkDeleteConfirmationDialog
        selectedCount={selectedLeads.size}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkDeleteModal(false)}
      />
    )}
    )}
</motion.div>
  );
};

// Function to render column input based on column type
const renderColumnInput = (column, rowData, isEmptyRow) => {
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

const AddLeadModal = ({ onClose, onSubmit, categoryOptions, onCreateCategory }) => {
const [formData, setFormData] = useState({
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
    productName: "",
    whatsappNumber: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      arr: Number(formData.arr)
    });
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <Input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
              placeholder="Enter WhatsApp number"
              className="w-full"
            />
          </div>
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

const EditLeadModal = ({ lead, onClose, onSubmit, categoryOptions, onCreateCategory }) => {
const [formData, setFormData] = useState({
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
    productName: lead.productName || "",
    whatsappNumber: lead.whatsappNumber || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(lead.Id, {
      ...formData,
      arr: Number(formData.arr)
    });
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
<div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <Input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
              placeholder="Enter WhatsApp number"
              className="w-full"
            />
          </div>
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