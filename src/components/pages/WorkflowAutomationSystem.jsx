import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Analytics from "@/components/pages/Analytics";

const WorkflowAutomationSystem = () => {
// Sample workflow data with comprehensive automation scenarios
  const [workflows, setWorkflows] = useState([
    {
      Id: 1,
      name: "Premium Lead Nurturing Sequence",
      description: "Automated 7-day nurturing sequence for high-value prospects with personalized touchpoints and progressive qualification",
      isActive: true,
      category: "lead_nurturing",
      priority: "high",
      trigger: {
        type: "lead_created",
        condition: "lead_score_greater_than",
        value: 75,
        additionalConditions: [
          { field: "source", operator: "equals", value: "website" },
          { field: "industry", operator: "in", value: ["technology", "finance", "healthcare"] }
        ]
      },
      actions: [
        {
          type: "assign_lead",
          delay: 0,
          conditions: [],
          assignee: "Senior Sales Rep",
          territory: "enterprise"
        },
        {
          type: "send_email",
          delay: 60,
          conditions: [],
          template: "premium_welcome_sequence",
          subject: "Welcome to Prime Club - Your Success Journey Begins",
          message: "Personalized welcome email with industry-specific case studies"
        },
        {
          type: "send_whatsapp",
          delay: 1440,
          conditions: [{ field: "email_opened", operator: "equals", value: true }],
          template: "day2_followup",
          message: "Hi {firstName}, I noticed you explored our platform. Ready to discuss how we can accelerate your growth?"
        },
        {
          type: "schedule_call",
          delay: 2880,
          conditions: [{ field: "engagement_score", operator: "greater_than", value: 50 }],
          calendar: "senior_sales_team",
          duration: 30,
          type: "discovery_call"
        },
        {
          type: "send_sms",
          delay: 7200,
          conditions: [{ field: "call_scheduled", operator: "equals", value: false }],
          message: "Last chance: Exclusive premium onboarding session available. Book now: {booking_link}"
        }
      ],
      executions: 847,
      successRate: 73.2,
      lastRun: "2024-01-15T14:30:00Z",
      createdBy: "Sarah Johnson",
      createdAt: "2024-01-01T09:00:00Z",
      tags: ["premium", "high-value", "automated", "nurturing"]
    },
    {
      Id: 2,
      name: "Abandoned Cart Recovery",
      description: "Multi-channel recovery sequence for prospects who engaged but didn't complete signup or purchase",
      isActive: true,
      category: "retention",
      priority: "medium",
      trigger: {
        type: "time_delay",
        condition: "no_activity_for",
        value: 1440,
        additionalConditions: [
          { field: "last_page_visited", operator: "contains", value: "pricing" },
          { field: "session_duration", operator: "greater_than", value: 180 }
        ]
      },
      actions: [
        {
          type: "send_email",
          delay: 60,
          conditions: [],
          template: "cart_abandonment_gentle",
          subject: "Still interested? We're here to help",
          message: "Gentle reminder with FAQ and objection handling"
        },
        {
          type: "send_sms",
          delay: 1440,
          conditions: [{ field: "email_opened", operator: "equals", value: false }],
          message: "Hi {firstName}, quick question about your Prime Club interest. Any concerns I can address?"
        },
        {
          type: "assign_lead",
          delay: 2880,
          conditions: [],
          assignee: "Recovery Specialist",
          priority: "high",
          notes: "Engaged prospect - requires personal outreach"
        },
        {
          type: "send_whatsapp",
          delay: 4320,
          conditions: [{ field: "sms_replied", operator: "equals", value: false }],
          template: "final_offer",
          message: "Limited time: 20% discount on your first month. Ready to join {firstName}?"
        }
      ],
      executions: 1203,
      successRate: 41.7,
      lastRun: "2024-01-15T16:45:00Z",
      createdBy: "Mike Chen",
      createdAt: "2023-12-15T11:30:00Z",
      tags: ["retention", "recovery", "multi-channel", "conversion"]
    },
    {
      Id: 3,
      name: "Geographic Lead Distribution",
      description: "Intelligent lead routing based on location, timezone, and sales rep expertise for optimal coverage",
      isActive: true,
      category: "lead_routing",
      priority: "high",
      trigger: {
        type: "lead_created",
        condition: "lead_has_location",
        value: true,
        additionalConditions: [
          { field: "lead_source", operator: "not_equals", value: "referral" },
          { field: "business_hours", operator: "equals", value: true }
        ]
      },
      actions: [
        {
          type: "assign_lead",
          delay: 5,
          conditions: [{ field: "timezone", operator: "in", value: ["EST", "CST"] }],
          assignee: "Eastern Sales Team",
          territory: "east_coast"
        },
        {
          type: "assign_lead",
          delay: 5,
          conditions: [{ field: "timezone", operator: "in", value: ["MST", "PST"] }],
          assignee: "Western Sales Team",
          territory: "west_coast"
        },
        {
          type: "send_email",
          delay: 30,
          conditions: [],
          template: "local_welcome",
          subject: "Welcome from your local Prime Club team",
          message: "Personalized email with local case studies and regional sales rep introduction"
        },
        {
          type: "create_task",
          delay: 60,
          conditions: [],
          task: "initial_outreach",
          priority: "high",
          due_date: "2_hours",
          description: "Follow up with new lead within 2 hours of assignment"
        },
        {
          type: "send_slack_notification",
          delay: 120,
          conditions: [{ field: "first_contact_attempted", operator: "equals", value: false }],
          channel: "sales_alerts",
          message: "🚨 New lead {leadName} assigned 2 hours ago - no contact attempt yet"
        }
      ],
      executions: 2156,
      successRate: 89.3,
      lastRun: "2024-01-15T17:22:00Z",
      createdBy: "Alex Rodriguez",
      createdAt: "2023-11-20T08:15:00Z",
      tags: ["routing", "geographic", "timezone", "instant"]
    }
  ]);

  // Comprehensive trigger types with icons and descriptions
  const triggerTypes = [
    {
      type: "lead_created",
      label: "Lead Created",
      icon: "UserPlus",
      description: "Triggers when a new lead enters the system",
      category: "lead_events"
    },
    {
      type: "lead_score_change",
      label: "Lead Score Change",
      icon: "TrendingUp",
      description: "Triggers when lead score increases or decreases by specified amount",
      category: "scoring"
    },
    {
      type: "time_delay",
      label: "Time Delay",
      icon: "Clock",
      description: "Triggers after specified time period of inactivity",
      category: "time_based"
    },
    {
      type: "email_opened",
      label: "Email Opened",
      icon: "Mail",
      description: "Triggers when prospect opens an email",
      category: "engagement"
    },
    {
      type: "page_visited",
      label: "Page Visited",
      icon: "Globe",
      description: "Triggers when prospect visits specific website pages",
      category: "website_activity"
    },
    {
      type: "form_submitted",
      label: "Form Submitted",
      icon: "FileText",
      description: "Triggers when prospect submits a form",
      category: "engagement"
    },
    {
      type: "call_completed",
      label: "Call Completed",
      icon: "Phone",
      description: "Triggers after a sales call is completed",
      category: "sales_activity"
    },
    {
      type: "meeting_scheduled",
      label: "Meeting Scheduled",
      icon: "Calendar",
      description: "Triggers when prospect schedules a meeting",
      category: "sales_activity"
    }
  ];

  // Comprehensive action types with icons and descriptions
  const actionTypes = [
    {
      type: "assign_lead",
      label: "Assign Lead",
      icon: "UserCheck",
      description: "Assign lead to specific sales rep or team",
      category: "lead_management"
    },
    {
      type: "send_email",
      label: "Send Email",
      icon: "Mail",
      description: "Send personalized email from template",
      category: "communication"
    },
    {
      type: "send_sms",
      label: "Send SMS",
      icon: "MessageSquare",
      description: "Send text message to prospect's mobile",
      category: "communication"
    },
    {
      type: "send_whatsapp",
      label: "Send WhatsApp",
      icon: "MessageCircle",
      description: "Send WhatsApp message to prospect",
      category: "communication"
    },
    {
      type: "schedule_call",
      label: "Schedule Call",
      icon: "Phone",
      description: "Automatically schedule call with prospect",
      category: "sales_activity"
    },
    {
      type: "create_task",
      label: "Create Task",
      icon: "CheckSquare",
      description: "Create follow-up task for sales rep",
      category: "task_management"
    },
    {
      type: "update_lead_score",
      label: "Update Lead Score",
      icon: "Target",
      description: "Modify lead score based on actions",
      category: "scoring"
    },
    {
      type: "add_to_list",
      label: "Add to List",
      icon: "List",
      description: "Add prospect to specific marketing list",
      category: "list_management"
    },
    {
      type: "send_slack_notification",
      label: "Send Slack Alert",
      icon: "Bell",
      description: "Send notification to Slack channel",
      category: "notifications"
    },
    {
      type: "create_deal",
      label: "Create Deal",
      icon: "DollarSign",
      description: "Automatically create deal in pipeline",
      category: "sales_pipeline"
    }
  ];

// Categories for workflow filtering
  const categories = [
    { value: "all", label: "All Categories", count: 3 },
    { value: "lead_nurturing", label: "Lead Nurturing", count: 1 },
    { value: "retention", label: "Retention", count: 1 },
    { value: "lead_routing", label: "Lead Routing", count: 1 },
    { value: "onboarding", label: "Onboarding", count: 0 },
    { value: "re_engagement", label: "Re-engagement", count: 0 }
  ];

  const [activeTab, setActiveTab] = useState('workflows');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const tabs = [
    {
      id: 'workflows',
      label: 'Workflows',
      icon: 'Settings'
    },
    {
      id: 'execution-history',
      label: 'Execution History',
      icon: 'History'
    },
    {
      id: 'lead-scoring',
      label: 'Lead Scoring',
      icon: 'Target'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'BarChart3'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Workflow Automation Hub
            </h1>
            <p className="text-lg text-gray-600 max-w-4xl">
              Orchestrate intelligent, multi-channel workflows that nurture leads and automate your entire sales process
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <div className="max-w-7xl mx-auto">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <ApperIcon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'workflows' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Automation</h2>
                
                {/* Filters and Search Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 lg:max-w-md">
                      <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search workflows..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[160px]"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label} ({category.count})
                        </option>
                      ))}
                    </select>
                    
                    {/* Status Filter */}
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[120px]"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    
                    {/* More Filters Button */}
                    <button
                      onClick={() => setShowMoreFilters(!showMoreFilters)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                    >
                      <ApperIcon name="Filter" size={16} />
                      More Filters
                    </button>
                  </div>
                  
                  {/* Expanded Filters */}
                  {showMoreFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            <option value="all">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            <option value="all">All Users</option>
                            <option value="admin">Admin</option>
                            <option value="sarah">Sarah Chen</option>
                            <option value="mike">Mike Johnson</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            <option value="all">All Time</option>
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="quarter">Last Quarter</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setFilterCategory(category.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filterCategory === category.value
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>

              {/* Workflows Grid */}
              <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
                {workflows
                  .filter(workflow => {
                    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
                    const matchesStatus = filterStatus === 'all' || 
                                        (filterStatus === 'active' && workflow.isActive) ||
                                        (filterStatus === 'inactive' && !workflow.isActive);
                    return matchesSearch && matchesCategory && matchesStatus;
                  })
                  .map(workflow => (
<div key={workflow.Id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                      {/* Header with Name, Status, and Priority Badges */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                            <div className="flex items-center gap-2">
                              {/* Status Badge */}
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                workflow.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                <span className={`w-2 h-2 rounded-full mr-1.5 ${
                                  workflow.isActive ? 'bg-green-500' : 'bg-gray-400'
                                }`}></span>
                                {workflow.isActive ? 'Active' : 'Inactive'}
                              </span>
                              
                              {/* Priority Badge */}
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                workflow.priority === 'high' ? 'bg-red-100 text-red-800' :
                                workflow.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {workflow.priority.charAt(0).toUpperCase() + workflow.priority.slice(1)}
                              </span>
                              
                              {/* Category Badge */}
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {workflow.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
                          
                          {/* Tags */}
                          {workflow.tags && workflow.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {workflow.tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 ml-4">
                          {/* Duplicate Button */}
                          <button
                            onClick={() => {
                              // Add duplicate functionality
                              console.log('Duplicating workflow:', workflow.name);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Duplicate workflow"
                          >
                            <ApperIcon name="Copy" size={16} />
                          </button>
                          
                          {/* Pause/Play Button */}
                          <button
                            onClick={() => {
                              const updatedWorkflows = workflows.map(w => 
                                w.Id === workflow.Id ? { ...w, isActive: !w.isActive } : w
                              );
                              setWorkflows(updatedWorkflows);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              workflow.isActive 
                                ? 'text-orange-600 hover:bg-orange-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={workflow.isActive ? 'Pause workflow' : 'Activate workflow'}
                          >
                            <ApperIcon name={workflow.isActive ? "Pause" : "Play"} size={16} />
                          </button>
                          
                          {/* Edit Button */}
                          <button 
                            onClick={() => {
                              // Add edit functionality
                              console.log('Editing workflow:', workflow.name);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit workflow"
                          >
                            <ApperIcon name="Edit" size={16} />
                          </button>
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this workflow?')) {
                                const updatedWorkflows = workflows.filter(w => w.Id !== workflow.Id);
                                setWorkflows(updatedWorkflows);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete workflow"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <ApperIcon name="Activity" size={14} className="text-blue-600 mr-1" />
                            <div className="text-lg font-semibold text-gray-900">{workflow.executions?.toLocaleString() || '0'}</div>
                          </div>
                          <div className="text-xs text-gray-500">Executions</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <ApperIcon name="TrendingUp" size={14} className="text-green-600 mr-1" />
                            <div className="text-lg font-semibold text-green-600">{workflow.successRate || '0'}%</div>
                          </div>
                          <div className="text-xs text-gray-500">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <ApperIcon name="Clock" size={14} className="text-gray-600 mr-1" />
                            <div className="text-lg font-semibold text-gray-900">
                              {workflow.lastRun ? new Date(workflow.lastRun).toLocaleDateString() : 'Never'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">Last Run</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <ApperIcon name="User" size={14} className="text-purple-600 mr-1" />
                            <div className="text-lg font-semibold text-gray-900">{workflow.createdBy || 'Unknown'}</div>
                          </div>
                          <div className="text-xs text-gray-500">Created By</div>
                        </div>
                      </div>

                      {/* Trigger Section */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <ApperIcon name="Zap" size={14} className="text-primary-600" />
                          Trigger
                        </h4>
                        <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <ApperIcon 
                              name={triggerTypes.find(t => t.type === workflow.trigger.type)?.icon || 'Circle'} 
                              size={14} 
                              className="text-primary-600" 
                            />
                            <span className="text-sm font-medium text-primary-800">
                              {triggerTypes.find(t => t.type === workflow.trigger.type)?.label || workflow.trigger.type}
                            </span>
                          </div>
                          <p className="text-xs text-primary-700">
                            {triggerTypes.find(t => t.type === workflow.trigger.type)?.description}
                          </p>
                          {workflow.trigger.additionalConditions && workflow.trigger.additionalConditions.length > 0 && (
                            <div className="mt-2 text-xs text-primary-600">
                              +{workflow.trigger.additionalConditions.length} additional conditions
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions Section */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <ApperIcon name="Play" size={14} className="text-blue-600" />
                          Actions ({workflow.actions.length})
                        </h4>
                        <div className="space-y-2">
                          {workflow.actions.slice(0, 3).map((action, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                              <div className="flex items-center gap-2 flex-1">
                                <ApperIcon 
                                  name={actionTypes.find(a => a.type === action.type)?.icon || 'Circle'} 
                                  size={14} 
                                  className="text-blue-600" 
                                />
                                <span className="text-sm font-medium text-blue-800">
                                  {actionTypes.find(a => a.type === action.type)?.label || action.type}
                                </span>
                              </div>
                              {action.delay > 0 && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                  {action.delay < 60 ? `${action.delay}m` : 
                                   action.delay < 1440 ? `${Math.floor(action.delay / 60)}h` : 
                                   `${Math.floor(action.delay / 1440)}d`}
                                </span>
                              )}
                            </div>
                          ))}
                          {workflow.actions.length > 3 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{workflow.actions.length - 3} more actions
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {workflows.filter(workflow => {
                const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
                const matchesStatus = filterStatus === 'all' || 
                                    (filterStatus === 'active' && workflow.isActive) ||
                                    (filterStatus === 'inactive' && !workflow.isActive);
                return matchesSearch && matchesCategory && matchesStatus;
              }).length === 0 && (
                <div className="text-center py-12">
                  <ApperIcon name="Search" size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                  <p className="text-gray-500">Try adjusting your search terms or filters.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'execution-history' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Execution History</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <ApperIcon name="History" size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Execution History</h3>
                <p className="text-gray-600">Detailed workflow execution logs and history will be available here.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'lead-scoring' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Scoring</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <ApperIcon name="Target" size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Lead Scoring Configuration</h3>
                <p className="text-gray-600">Configure lead scoring rules and view scoring analytics here.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <ApperIcon name="BarChart3" size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Analytics</h3>
                <p className="text-gray-600">Comprehensive workflow performance metrics and analytics will be displayed here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowAutomationSystem;