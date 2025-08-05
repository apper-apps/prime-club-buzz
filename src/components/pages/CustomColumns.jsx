import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  bulkDeleteColumns, 
  bulkToggleColumns, 
  createCustomColumn, 
  deleteCustomColumn, 
  getCustomColumns, 
  reorderCustomColumns, 
  toggleColumnVisibility, 
  updateCustomColumn 
} from "@/services/api/leadsService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const CustomColumns = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    loadColumns();
  }, []);

const loadColumns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomColumns();
      // Ensure all columns have isVisible property
      const columnsWithVisibility = data.map(col => ({
        ...col,
        isVisible: col.isVisible !== false
      }));
      setColumns(columnsWithVisibility);
      setSelectedColumns([]);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load custom columns");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColumn = async (columnData) => {
    try {
      const newColumn = await createCustomColumn(columnData);
      setColumns(prev => [...prev, newColumn].sort((a, b) => a.order - b.order));
      setShowAddForm(false);
      toast.success("Column created successfully");
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleUpdateColumn = async (id, updates) => {
    try {
      const updatedColumn = await updateCustomColumn(id, updates);
      setColumns(prev => prev.map(col => col.Id === id ? updatedColumn : col));
      setEditingColumn(null);
      toast.success("Column updated successfully");
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

const handleDeleteColumn = async (id) => {
    try {
      await deleteCustomColumn(id);
      setColumns(prev => prev.filter(col => col.Id !== id));
      setDeleteConfirm(null);
      toast.success("Column deleted successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletableColumns = selectedColumns.filter(id => {
        const column = columns.find(col => col.Id === id);
        return column && !column.isDefault;
      });
      
      if (deletableColumns.length === 0) {
        toast.error("No deletable columns selected");
        return;
      }

      await bulkDeleteColumns(deletableColumns);
      setColumns(prev => prev.filter(col => !deletableColumns.includes(col.Id)));
      setSelectedColumns([]);
      setBulkDeleteConfirm(false);
      toast.success(`${deletableColumns.length} column(s) deleted successfully`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleVisibility = async (id, isVisible) => {
    try {
      await toggleColumnVisibility(id, isVisible);
      setColumns(prev => prev.map(col => 
        col.Id === id ? { ...col, isVisible } : col
      ));
      toast.success(`Column ${isVisible ? 'shown' : 'hidden'} successfully`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkToggleVisibility = async (isVisible) => {
    try {
      if (selectedColumns.length === 0) {
        toast.error("No columns selected");
        return;
      }

      await bulkToggleColumns(selectedColumns, isVisible);
      setColumns(prev => prev.map(col => 
        selectedColumns.includes(col.Id) ? { ...col, isVisible } : col
      ));
      setSelectedColumns([]);
      toast.success(`${selectedColumns.length} column(s) ${isVisible ? 'shown' : 'hidden'} successfully`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSelectColumn = (id) => {
    setSelectedColumns(prev => 
      prev.includes(id) 
        ? prev.filter(colId => colId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === columns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(columns.map(col => col.Id));
    }
  };

  const visibleColumnsCount = columns.filter(col => col.isVisible !== false).length;
  const hiddenColumnsCount = columns.length - visibleColumnsCount;
  const deletableSelectedCount = selectedColumns.filter(id => {
    const column = columns.find(col => col.Id === id);
    return column && !column.isDefault;
  }).length;

  const handleReorderColumns = async (dragIndex, dropIndex) => {
    const newColumns = [...columns];
    const draggedColumn = newColumns[dragIndex];
    newColumns.splice(dragIndex, 1);
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    setColumns(newColumns);
    
    try {
      const columnIds = newColumns.map(col => col.Id);
      await reorderCustomColumns(columnIds);
      toast.success("Column order updated");
    } catch (err) {
      toast.error("Failed to save column order");
      loadColumns(); // Reload to reset order
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadColumns} />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Button
              onClick={() => navigate('/leads')}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" size={16} />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Custom Columns</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Create and manage custom columns for your leads table
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Column
          </Button>
        </div>
      </div>

{/* Columns List */}
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Columns ({columns.length})
              </h2>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="success" size="sm">
                  {visibleColumnsCount} Visible
                </Badge>
                {hiddenColumnsCount > 0 && (
                  <Badge variant="secondary" size="sm">
                    {hiddenColumnsCount} Hidden
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedColumns.length > 0 && (
                <>
                  <div className="text-sm text-gray-600">
                    {selectedColumns.length} selected
                  </div>
                  <Button
                    onClick={() => handleBulkToggleVisibility(true)}
                    variant="outline"
                    size="sm"
                  >
                    <ApperIcon name="Eye" size={14} className="mr-1" />
                    Show
                  </Button>
                  <Button
                    onClick={() => handleBulkToggleVisibility(false)}
                    variant="outline"
                    size="sm"
                  >
                    <ApperIcon name="EyeOff" size={14} className="mr-1" />
                    Hide
                  </Button>
                  {deletableSelectedCount > 0 && (
                    <Button
                      onClick={() => setBulkDeleteConfirm(true)}
                      variant="destructive"
                      size="sm"
                    >
                      <ApperIcon name="Trash2" size={14} className="mr-1" />
                      Delete ({deletableSelectedCount})
                    </Button>
                  )}
                </>
              )}
              <div className="text-sm text-gray-500">
                Drag to reorder
              </div>
            </div>
          </div>

          {/* Select All Checkbox */}
          {columns.length > 0 && (
            <div className="flex items-center space-x-2 pb-2 border-b">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedColumns.length === columns.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="select-all" className="text-sm text-gray-700">
                Select all columns
              </label>
            </div>
          )}

          {columns.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Columns" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No custom columns created yet</p>
              <Button onClick={() => setShowAddForm(true)}>
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Create Your First Column
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {columns.map((column, index) => (
                <ColumnItem
                  key={column.Id}
                  column={column}
                  index={index}
                  isSelected={selectedColumns.includes(column.Id)}
                  onSelect={() => handleSelectColumn(column.Id)}
                  onEdit={() => setEditingColumn(column)}
                  onDelete={() => setDeleteConfirm(column)}
                  onToggleVisibility={(isVisible) => handleToggleVisibility(column.Id, isVisible)}
                  onReorder={handleReorderColumns}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Add Column Modal */}
      {showAddForm && (
        <ColumnFormModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleCreateColumn}
          title="Add New Column"
        />
      )}

      {/* Edit Column Modal */}
      {editingColumn && (
        <ColumnFormModal
          column={editingColumn}
          onClose={() => setEditingColumn(null)}
          onSubmit={(data) => handleUpdateColumn(editingColumn.Id, data)}
          title="Edit Column"
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <DeleteConfirmationModal
          column={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteColumn(deleteConfirm.Id)}
        />
      )}
    </div>
  );
};

const ColumnItem = ({ column, index, isSelected, onSelect, onEdit, onDelete, onToggleVisibility, onReorder }) => {
  const [isDragging, setIsDragging] = useState(false);

  const getTypeIcon = (type) => {
    const icons = {
      text: "Type",
      number: "Hash",
      date: "Calendar",
      datetime: "Clock",
      select: "ChevronDown",
      boolean: "ToggleLeft",
      url: "Link",
      conditional: "GitBranch",
      readonly: "Lock"
    };
    return icons[type] || "Type";
  };

  const getTypeColor = (type) => {
    const colors = {
      text: "info",
      number: "primary",
      date: "warning",
      datetime: "warning",
      select: "accent",
      boolean: "success",
      url: "default",
      conditional: "secondary",
      readonly: "secondary"
    };
    return colors[type] || "default";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border rounded-lg p-4 transition-all ${
        isDragging ? 'shadow-lg scale-105 z-10' : 'shadow-sm hover:shadow-md'
      } ${isSelected ? 'ring-2 ring-primary-500 border-primary-200' : ''} ${
        column.isVisible === false ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />

          {/* Drag Handle */}
          <div 
            className="cursor-move p-1 hover:bg-gray-100 rounded"
            draggable
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            <ApperIcon name="GripVertical" size={16} className="text-gray-400" />
          </div>
          
          {/* Column Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">{column.name}</h3>
              {column.isDefault && (
                <Badge variant="secondary" size="sm">Default</Badge>
              )}
              {column.required && (
                <Badge variant="destructive" size="sm">Required</Badge>
              )}
              {column.isVisible === false && (
                <Badge variant="secondary" size="sm">Hidden</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <ApperIcon name={getTypeIcon(column.type)} size={14} />
                <Badge variant={getTypeColor(column.type)} size="sm">
                  {column.type.charAt(0).toUpperCase() + column.type.slice(1)}
                </Badge>
              </div>
              
              {column.defaultValue && (
                <div className="flex items-center space-x-1">
                  <span>Default:</span>
                  <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                    {column.defaultValue}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Visibility Toggle */}
          <Button
            onClick={() => onToggleVisibility(!column.isVisible)}
            variant="ghost"
            size="sm"
            className="p-2"
            title={column.isVisible === false ? "Show column" : "Hide column"}
          >
            <ApperIcon 
              name={column.isVisible === false ? "EyeOff" : "Eye"} 
              size={16} 
              className={column.isVisible === false ? "text-gray-400" : "text-gray-600"}
            />
          </Button>

          {/* Edit Button */}
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="p-2"
            title="Edit column"
          >
            <ApperIcon name="Edit" size={16} />
          </Button>
          
          {/* Delete Button - only for non-default columns */}
          {!column.isDefault && (
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete column"
            >
              <ApperIcon name="Trash2" size={16} />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ColumnFormModal = ({ column, onClose, onSubmit, title }) => {
const [formData, setFormData] = useState({
    name: column?.name || "",
    type: column?.type || "text",
    required: column?.required || false,
    defaultValue: column?.defaultValue || "",
    selectOptions: column?.selectOptions || [],
    conditionalRules: column?.conditionalRules || []
  });
  const [optionInput, setOptionInput] = useState("");
  const [loading, setLoading] = useState(false);

const columnTypes = [
{ value: "text", label: "Text", icon: "Type" },
    { value: "number", label: "Number", icon: "Hash" },
    { value: "date", label: "Date", icon: "Calendar" },
    { value: "datetime", label: "Date with Time", icon: "Clock" },
    { value: "select", label: "Select/Dropdown", icon: "ChevronDown" },
    { value: "boolean", label: "True/False", icon: "ToggleLeft" },
    { value: "url", label: "URL/Link", icon: "Link" },
    { value: "conditional", label: "Conditional/Dynamic", icon: "GitBranch" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Column name is required");
      return;
    }

    if (formData.type === "select" && formData.selectOptions.length === 0) {
      toast.error("Select columns must have at least one option");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  const addSelectOption = () => {
    if (optionInput.trim() && !formData.selectOptions.includes(optionInput.trim())) {
      setFormData(prev => ({
        ...prev,
        selectOptions: [...prev.selectOptions, optionInput.trim()]
      }));
      setOptionInput("");
    }
  };

  const removeSelectOption = (option) => {
    setFormData(prev => ({
      ...prev,
      selectOptions: prev.selectOptions.filter(opt => opt !== option)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <Button onClick={onClose} variant="ghost" size="sm" className="p-2">
              <ApperIcon name="X" size={16} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Column Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter column name"
                disabled={column?.isDefault}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Column Type *
              </label>
              <select
value={formData.type}
onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value,
                  selectOptions: e.target.value === "select" ? prev.selectOptions : [],
                  conditionalRules: e.target.value === "conditional" ? prev.conditionalRules : [],
                  defaultValue: ""
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={column?.isDefault}
                required
              >
                {columnTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.type === "select" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Options *
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      placeholder="Add an option"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSelectOption())}
                    />
                    <Button
                      type="button"
                      onClick={addSelectOption}
                      disabled={!optionInput.trim()}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formData.selectOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.selectOptions.map(option => (
                        <div
                          key={option}
                          className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-sm"
                        >
                          <span>{option}</span>
                          <button
                            type="button"
                            onClick={() => removeSelectOption(option)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <ApperIcon name="X" size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
<div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="required" className="text-sm text-gray-700">
                Required field
              </label>
            </div>

            {formData.type === "conditional" && (
<ConditionalRulesBuilder
                rules={formData.conditionalRules}
                columnType={formData.type}
                onChange={(rules) => setFormData(prev => ({ ...prev, conditionalRules: rules }))}
              />
            )}
            {formData.type !== "boolean" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Value
                </label>
                {formData.type === "select" ? (
                  <select
                    value={formData.defaultValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">No default</option>
                    {formData.selectOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
<Input
                    type={
                      formData.type === "date" ? "date" : 
                      formData.type === "datetime" ? "datetime-local" :
                      formData.type === "number" ? "number" : 
                      "text"
                    }
                    value={formData.defaultValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                    placeholder={
                      formData.type === "datetime" ? "Default date and time value" :
                      `Default ${formData.type} value`
                    }
                  />
                )}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : column ? "Update Column" : "Create Column"}
              </Button>
              <Button type="button" onClick={onClose} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const DeleteConfirmationModal = ({ column, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Column</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            Are you sure you want to delete the column <strong>"{column.name}"</strong>? 
            This will remove the column and all its data from the leads table.
          </p>

          <div className="flex space-x-3">
            <Button
              onClick={handleConfirm}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? "Deleting..." : "Delete Column"}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
);
};

// Bulk Delete Confirmation Modal
const BulkDeleteConfirmationModal = ({ selectedCount, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Multiple Columns</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <strong>{selectedCount}</strong> selected column(s)? 
            This will remove the columns and all their data from the leads table.
            <br /><br />
            <span className="text-sm text-gray-500">
              Note: Default columns cannot be deleted and will be skipped.
            </span>
          </p>

          <div className="flex space-x-3">
            <Button
              onClick={handleConfirm}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? "Deleting..." : `Delete ${selectedCount} Column(s)`}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ConditionalRulesBuilder = ({ rules, columnType, onChange }) => {
  const [newRule, setNewRule] = useState({
    condition: { field: "", operator: "", value: "" },
    thenAction: { type: "setValue", value: "" }
  });

  const availableFields = [
    "Company Name", "Email", "Website URL", "Phone", "Status", "Lead Score", "Source"
  ];

  const operators = [
    { value: "equals", label: "Equals" },
    { value: "notEquals", label: "Not Equals" },
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Does Not Contain" },
    { value: "greaterThan", label: "Greater Than" },
    { value: "lessThan", label: "Less Than" },
    { value: "isEmpty", label: "Is Empty" },
    { value: "isNotEmpty", label: "Is Not Empty" }
  ];

  const actionTypes = [
    { value: "setValue", label: "Set Value" },
    { value: "concatenate", label: "Concatenate" },
    { value: "calculate", label: "Calculate" },
    { value: "copyFrom", label: "Copy From Field" }
  ];

  const addRule = () => {
    if (newRule.condition.field && newRule.condition.operator) {
      onChange([...rules, { ...newRule, id: Date.now() }]);
      setNewRule({
        condition: { field: "", operator: "", value: "" },
        thenAction: { type: "setValue", value: "" },
        elseAction: { type: "setValue", value: "" }
      });
    }
  };

  const removeRule = (ruleId) => {
    onChange(rules.filter(rule => rule.id !== ruleId));
  };

  const updateRule = (ruleId, updates) => {
    onChange(rules.map(rule => rule.id === ruleId ? { ...rule, ...updates } : rule));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          If-Then-Else Rules *
        </label>
        <div className="text-xs text-gray-500">
          {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
        </div>
      </div>

      {/* Existing Rules */}
      {rules.length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {rules.map((rule, index) => (
            <div key={rule.id} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="GitBranch" size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Rule {index + 1}</span>
                </div>
                <Button
                  type="button"
                  onClick={() => removeRule(rule.id)}
                  variant="ghost"
                  size="sm"
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <ApperIcon name="Trash2" size={14} />
                </Button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-700">
                  <span className="font-medium text-blue-600">IF</span>
                  <span className="bg-white px-2 py-1 rounded border text-xs font-mono">
                    {rule.condition.field}
                  </span>
                  <span>{operators.find(op => op.value === rule.condition.operator)?.label}</span>
                  {rule.condition.value && (
                    <span className="bg-white px-2 py-1 rounded border text-xs font-mono">
                      {rule.condition.value}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-gray-700">
                  <span className="font-medium text-green-600">THEN</span>
                  <span>{actionTypes.find(act => act.value === rule.thenAction.type)?.label}</span>
                  {rule.thenAction.value && (
                    <span className="bg-white px-2 py-1 rounded border text-xs font-mono">
                      {rule.thenAction.value}
                    </span>
                  )}
                </div>

<div className="flex items-center space-x-2 text-gray-700">
                  <span className="text-gray-500 text-sm">Simple condition applied</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Rule Form */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-3">
          <ApperIcon name="Plus" size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Add New Rule</span>
        </div>

        <div className="space-y-3">
          {/* IF Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">IF Field</label>
              <select
                value={newRule.condition.field}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  condition: { ...prev.condition, field: e.target.value }
                }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select field...</option>
                {availableFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Operator</label>
              <select
                value={newRule.condition.operator}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  condition: { ...prev.condition, operator: e.target.value }
                }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select operator...</option>
                {operators.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
              <Input
                value={newRule.condition.value}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  condition: { ...prev.condition, value: e.target.value }
                }))}
                placeholder="Condition value"
                className="text-sm"
                disabled={["isEmpty", "isNotEmpty"].includes(newRule.condition.operator)}
              />
            </div>
          </div>

          {/* THEN Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-green-700 mb-1">THEN Action</label>
              <select
                value={newRule.thenAction.type}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  thenAction: { ...prev.thenAction, type: e.target.value }
                }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                {actionTypes.map(action => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-green-700 mb-1">THEN Value</label>
              <Input
                value={newRule.thenAction.value}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  thenAction: { ...prev.thenAction, value: e.target.value }
                }))}
                placeholder="Then value"
                className="text-sm"
              />
            </div>
          </div>

{/* Simple IF-THEN Logic - No ELSE needed */}
          <div className="text-sm text-gray-600 italic">
            This creates a simple condition: when the specified field matches the condition, the action will be performed.
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={addRule}
              disabled={!newRule.condition.field || !newRule.condition.operator}
              size="sm"
              className="text-sm"
            >
              <ApperIcon name="Plus" size={14} className="mr-1" />
              Add Rule
            </Button>
          </div>
</div>
      </div>

      {/* Conditional Column Warning */}
      {columnType === "conditional" && rules.length === 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <div className="flex items-center space-x-2">
            <ApperIcon name="AlertCircle" size={16} />
            <span>Conditional columns require at least one if-then-else rule to function properly.</span>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomColumnsWithModals = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    loadColumns();
  }, []);

  const loadColumns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomColumns();
      const columnsWithVisibility = data.map(col => ({
        ...col,
        isVisible: col.isVisible !== false
      }));
      setColumns(columnsWithVisibility);
      setSelectedColumns([]);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load custom columns");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColumn = async (columnData) => {
    try {
      const newColumn = await createCustomColumn(columnData);
      setColumns(prev => [...prev, newColumn].sort((a, b) => a.order - b.order));
      setShowAddForm(false);
      toast.success("Column created successfully");
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleUpdateColumn = async (id, updates) => {
    try {
      const updatedColumn = await updateCustomColumn(id, updates);
      setColumns(prev => prev.map(col => col.Id === id ? updatedColumn : col));
      setEditingColumn(null);
      toast.success("Column updated successfully");
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleDeleteColumn = async (id) => {
    try {
      await deleteCustomColumn(id);
      setColumns(prev => prev.filter(col => col.Id !== id));
      setDeleteConfirm(null);
      toast.success("Column deleted successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletableColumns = selectedColumns.filter(id => {
        const column = columns.find(col => col.Id === id);
        return column && !column.isDefault;
      });
      
      if (deletableColumns.length === 0) {
        toast.error("No deletable columns selected");
        return;
      }

      await bulkDeleteColumns(deletableColumns);
      setColumns(prev => prev.filter(col => !deletableColumns.includes(col.Id)));
      setSelectedColumns([]);
      setBulkDeleteConfirm(false);
      toast.success(`${deletableColumns.length} column(s) deleted successfully`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleVisibility = async (id, isVisible) => {
    try {
      await toggleColumnVisibility(id, isVisible);
      setColumns(prev => prev.map(col => 
        col.Id === id ? { ...col, isVisible } : col
      ));
      toast.success(`Column ${isVisible ? 'shown' : 'hidden'} successfully`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkToggleVisibility = async (isVisible) => {
    try {
      if (selectedColumns.length === 0) {
        toast.error("No columns selected");
        return;
      }

      await bulkToggleColumns(selectedColumns, isVisible);
      setColumns(prev => prev.map(col => 
        selectedColumns.includes(col.Id) ? { ...col, isVisible } : col
      ));
      setSelectedColumns([]);
      toast.success(`${selectedColumns.length} column(s) ${isVisible ? 'shown' : 'hidden'} successfully`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSelectColumn = (id) => {
    setSelectedColumns(prev => 
      prev.includes(id) 
        ? prev.filter(colId => colId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === columns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(columns.map(col => col.Id));
    }
  };

  const visibleColumnsCount = columns.filter(col => col.isVisible !== false).length;
  const hiddenColumnsCount = columns.length - visibleColumnsCount;
  const deletableSelectedCount = selectedColumns.filter(id => {
    const column = columns.find(col => col.Id === id);
    return column && !column.isDefault;
  }).length;

  const handleReorderColumns = async (dragIndex, dropIndex) => {
    const newColumns = [...columns];
    const draggedColumn = newColumns[dragIndex];
    newColumns.splice(dragIndex, 1);
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    setColumns(newColumns);
    
    try {
      const columnIds = newColumns.map(col => col.Id);
      await reorderCustomColumns(columnIds);
      toast.success("Column order updated");
    } catch (err) {
      toast.error("Failed to save column order");
      loadColumns();
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadColumns} />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <CustomColumns 
        columns={columns}
        selectedColumns={selectedColumns}
        visibleColumnsCount={visibleColumnsCount}
        hiddenColumnsCount={hiddenColumnsCount}
        deletableSelectedCount={deletableSelectedCount}
        onSelectColumn={handleSelectColumn}
        onSelectAll={handleSelectAll}
        onToggleVisibility={handleToggleVisibility}
        onBulkToggleVisibility={handleBulkToggleVisibility}
        onReorderColumns={handleReorderColumns}
        onEdit={setEditingColumn}
        onDelete={setDeleteConfirm}
        onShowAddForm={() => setShowAddForm(true)}
        onBulkDelete={() => setBulkDeleteConfirm(true)}
        navigate={navigate}
      />

      {/* Add Column Modal */}
      {showAddForm && (
        <ColumnFormModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleCreateColumn}
          title="Add New Column"
        />
      )}

      {/* Edit Column Modal */}
      {editingColumn && (
        <ColumnFormModal
          column={editingColumn}
          onClose={() => setEditingColumn(null)}
          onSubmit={(data) => handleUpdateColumn(editingColumn.Id, data)}
          title="Edit Column"
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <DeleteConfirmationModal
          column={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteColumn(deleteConfirm.Id)}
        />
      )}

      {/* Bulk Delete Confirmation */}
      {bulkDeleteConfirm && (
        <BulkDeleteConfirmationModal
          selectedCount={deletableSelectedCount}
          onClose={() => setBulkDeleteConfirm(false)}
          onConfirm={handleBulkDelete}
        />
      )}
    </div>
  );
};

export default CustomColumnsWithModals;