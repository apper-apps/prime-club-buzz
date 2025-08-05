import React, { useState } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Analytics from "@/components/pages/Analytics";
import Button from "@/components/atoms/Button";

const WorkflowAutomationSystem = () => {
// Workflow Builder Modal States
const [isBuilderOpen, setIsBuilderOpen] = useState(false);
const [currentWorkflow, setCurrentWorkflow] = useState(null);
const [builderState, setBuilderState] = useState({
  name: '',
  description: '',
  category: 'lead_nurturing',
  priority: 'medium',
  trigger: {
    type: 'lead_created',
    condition: '',
    value: '',
    additionalConditions: []
  },
  actions: [],
  tags: []
});
// Sample workflow data with comprehensive automation scenarios
const [expandedWorkflow, setExpandedWorkflow] = useState(null);

// Workflows state variable
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

// Save workflow function
const saveWorkflow = () => {
  // Validate required fields
  if (!builderState.name?.trim()) {
    toast.error('Workflow name is required');
    return;
  }

  if (!builderState.trigger?.type) {
    toast.error('Workflow trigger is required');
    return;
  }

  if (!builderState.actions?.length) {
    toast.error('At least one action is required');
    return;
  }

  try {
    if (currentWorkflow) {
      // Update existing workflow
      const updatedWorkflows = workflows.map(w => 
        w.Id === currentWorkflow.Id 
          ? { 
              ...w, 
              ...builderState,
              lastModified: new Date().toISOString(),
              modifiedBy: 'Current User'
            }
          : w
      );
      setWorkflows(updatedWorkflows);
      toast.success(`Workflow "${builderState.name}" updated successfully`);
    } else {
      // Generate unique ID for new workflow
      const maxId = workflows.length > 0 ? Math.max(...workflows.map(w => w.Id)) : 0;
      const newId = maxId + 1;
      
      // Create new workflow with default values
      const newWorkflow = {
        Id: newId,
        ...builderState,
        isActive: true,
        executions: 0,
        successRate: 0,
        lastRun: null,
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        modifiedBy: 'Current User'
      };
      
      setWorkflows([...workflows, newWorkflow]);
      toast.success(`Workflow "${builderState.name}" created successfully`);
    }
    
    // Reset state and close modal
    setCurrentWorkflow(null);
    setBuilderState({
      name: '',
      description: '',
      category: 'lead_nurturing',
      priority: 'medium',
      trigger: {
        type: 'lead_created',
        condition: '',
        value: '',
        additionalConditions: []
      },
      actions: [],
tags: []
    });
    setIsBuilderOpen(false);
  } catch (error) {
    console.error('Error saving workflow:', error);
    toast.error('Failed to save workflow. Please try again.');
  }
};

// Lead Scoring Rules State
const [leadScoringRules, setLeadScoringRules] = useState({
  demographic: [
    { field: 'jobTitle', operator: 'contains', value: 'Manager', score: 15 },
    { field: 'company', operator: 'not_empty', value: '', score: 10 },
  ],
  behavioral: [
    { field: 'emailOpens', operator: 'greater_than', value: '5', score: 20 },
    { field: 'websiteVisits', operator: 'greater_than', value: '3', score: 15 },
  ]
});

// Execution History State

// Workflow Management Functions
const editWorkflow = (workflow) => {
  setCurrentWorkflow(workflow);
  setBuilderState({
    name: workflow.name,
    description: workflow.description,
    trigger: workflow.trigger,
    conditions: workflow.conditions || [],
    actions: workflow.actions || [],
    priority: workflow.priority,
    category: workflow.category,
    tags: workflow.tags || []
  });
  setIsBuilderOpen(true);
};
  const deleteWorkflow = (workflowId) => {
    const workflow = workflows.find(w => w.Id === workflowId);
    if (!workflow) {
      toast.error('Workflow not found');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`)) {
      const updatedWorkflows = workflows.filter(w => w.Id !== workflowId);
      setWorkflows(updatedWorkflows);
      toast.success(`Workflow "${workflow.name}" deleted successfully`);
    }
  };

  const toggleWorkflow = (workflowId) => {
    const workflow = workflows.find(w => w.Id === workflowId);
    if (!workflow) {
      toast.error('Workflow not found');
      return;
    }

    const updatedWorkflows = workflows.map(w => 
      w.Id === workflowId ? { ...w, isActive: !w.isActive } : w
    );
    setWorkflows(updatedWorkflows);
    
    const newStatus = !workflow.isActive ? 'activated' : 'paused';
    toast.success(`Workflow "${workflow.name}" ${newStatus} successfully`);
  };

  // Execution History State
  const [executionHistory] = useState([
    {
      Id: 1,
      workflowName: 'Lead Nurturing Sequence',
      leadName: 'Sarah Johnson',
      leadEmail: 'sarah.johnson@techcorp.com',
      action: 'Send Welcome Email',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success',
      duration: '0.8s',
      channel: 'email'
    },
    {
      Id: 2,
      workflowName: 'Territory Assignment',
      leadName: 'Michael Chen',
      leadEmail: 'michael.chen@startupxyz.com',
      action: 'Assign to Sales Rep',
      timestamp: '2024-01-15T09:45:00Z',
      status: 'success',
      duration: '0.3s',
      channel: 'assignment'
    },
    {
      Id: 3,
      workflowName: 'High Value Lead Alert',
      leadName: 'Emily Rodriguez',
      leadEmail: 'emily.rodriguez@enterprise.com',
      action: 'Send SMS Notification',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'failed',
      duration: '2.1s',
      channel: 'sms',
      errorMessage: 'Invalid phone number format'
    },
    {
      Id: 4,
      workflowName: 'Demo Follow-up',
      leadName: 'David Park',
      leadEmail: 'david.park@bigcorp.com',
      action: 'Send WhatsApp Message',
      timestamp: '2024-01-15T08:30:00Z',
      status: 'success',
      duration: '1.2s',
      channel: 'whatsapp'
    },
    {
      Id: 5,
      workflowName: 'Urgent Lead Alert',
      leadName: 'Lisa Thompson',
      leadEmail: 'lisa.thompson@innovate.com',
      action: 'Post to Slack Channel',
      timestamp: '2024-01-15T08:00:00Z',
      status: 'failed',
      duration: '5.0s',
      channel: 'slack',
      errorMessage: 'Slack API rate limit exceeded'
    },
    {
      Id: 6,
      workflowName: 'Lead Scoring Update',
      leadName: 'James Wilson',
      leadEmail: 'james.wilson@growth.com',
      action: 'Update Lead Score',
      timestamp: '2024-01-15T07:45:00Z',
      status: 'success',
      duration: '0.5s',
      channel: 'assignment'
    },
    {
      Id: 7,
      workflowName: 'Cold Lead Reactivation',
      leadName: 'Amanda Foster',
      leadEmail: 'amanda.foster@oldclient.com',
      action: 'Send Reactivation Email',
      timestamp: '2024-01-15T07:30:00Z',
      status: 'failed',
      duration: '3.2s',
      channel: 'email',
      errorMessage: 'Email bounced - invalid address'
    },
    {
      Id: 8,
      workflowName: 'Demo Booking Confirmation',
      leadName: 'Robert Kim',
      leadEmail: 'robert.kim@futuretech.com',
      action: 'Send Confirmation SMS',
      timestamp: '2024-01-15T07:00:00Z',
      status: 'success',
      duration: '0.9s',
      channel: 'sms'
    }
  ]);
// Analytics State
  const [analyticsData] = useState({
    totalExecutions: 12847,
    successRate: 94.2,
    avgExecutionTime: 2.4,
    activeWorkflows: 23,
    executionTrend: [
      { date: '2024-01-15', executions: 145, label: 'Mon' },
      { date: '2024-01-16', executions: 189, label: 'Tue' },
      { date: '2024-01-17', executions: 167, label: 'Wed' },
      { date: '2024-01-18', executions: 203, label: 'Thu' },
      { date: '2024-01-19', executions: 178, label: 'Fri' },
      { date: '2024-01-20', executions: 134, label: 'Sat' },
      { date: '2024-01-21', executions: 98, label: 'Sun' }
    ],
    topPerformingWorkflows: [
      { id: 1, name: 'Lead Qualification Automation', executions: 2847, successRate: 96.8, category: 'Lead Management' },
      { id: 2, name: 'Welcome Email Sequence', executions: 2134, successRate: 94.2, category: 'Email Marketing' },
      { id: 3, name: 'High-Value Lead Alert', executions: 1892, successRate: 98.1, category: 'Notifications' },
      { id: 4, name: 'Territory Assignment', executions: 1674, successRate: 91.5, category: 'Lead Management' },
      { id: 5, name: 'Follow-up Reminder', executions: 1456, successRate: 89.3, category: 'Task Management' }
    ],
    performanceMetrics: {
      totalExecutionsChange: 12.4,
      successRateChange: 2.1,
      avgExecutionTimeChange: -8.7,
      activeWorkflowsChange: 4.5
    }
  });

// Lead Scoring Rules State
  const [scoringRules, setScoringRules] = useState({
    demographic: {
      companySize: [
        { label: 'Enterprise (1000+)', points: 25, active: true },
        { label: 'Mid-Market (200-999)', points: 20, active: true },
        { label: 'Small Business (50-199)', points: 15, active: true },
        { label: 'Startup (1-49)', points: 10, active: true }
      ],
      jobTitle: [
        { label: 'C-Level Executive', points: 30, active: true },
        { label: 'VP/Director', points: 25, active: true },
        { label: 'Manager', points: 20, active: true },
        { label: 'Individual Contributor', points: 10, active: true }
      ],
      industry: [
        { label: 'Technology', points: 25, active: true },
        { label: 'Healthcare', points: 20, active: true },
        { label: 'Financial Services', points: 20, active: true },
        { label: 'Manufacturing', points: 15, active: true },
        { label: 'Retail', points: 10, active: true }
      ],
      budget: [
        { label: '$100K+', points: 30, active: true },
        { label: '$50K-$100K', points: 25, active: true },
        { label: '$25K-$50K', points: 20, active: true },
        { label: '$10K-$25K', points: 15, active: true },
        { label: 'Under $10K', points: 5, active: true }
      ]
    },
    behavioral: {
      websiteEngagement: [
        { action: 'Pricing Page Visit', points: 15, active: true },
        { action: 'Product Demo Request', points: 25, active: true },
        { action: 'Multiple Page Views (5+)', points: 10, active: true },
        { action: 'Resource Download', points: 8, active: true },
        { action: 'Contact Form Submit', points: 20, active: true }
      ],
      contentInteraction: [
        { action: 'Whitepaper Download', points: 12, active: true },
        { action: 'Webinar Attendance', points: 18, active: true },
        { action: 'Case Study View', points: 10, active: true },
        { action: 'Blog Engagement', points: 5, active: true },
        { action: 'Video Watch (>50%)', points: 8, active: true }
      ],
      emailEngagement: [
        { action: 'Email Open', points: 2, active: true },
        { action: 'Email Click', points: 5, active: true },
        { action: 'Reply to Email', points: 15, active: true },
        { action: 'Forward Email', points: 8, active: true },
        { action: 'Unsubscribe', points: -10, active: true }
      ],
      directEngagement: [
        { action: 'Phone Call Answered', points: 25, active: true },
        { action: 'Meeting Scheduled', points: 30, active: true },
        { action: 'Social Media Follow', points: 3, active: true },
        { action: 'LinkedIn Connection', points: 5, active: true },
        { action: 'Referral Given', points: 20, active: true }
      ]
    },
    timeDecay: {
      enabled: true,
      rules: [
        { period: '0-7 days', multiplier: 1.0, active: true },
        { period: '8-30 days', multiplier: 0.8, active: true },
        { period: '31-90 days', multiplier: 0.6, active: true },
        { period: '91-180 days', multiplier: 0.4, active: true },
        { period: '180+ days', multiplier: 0.2, active: true }
      ]
    },
    thresholds: {
      cold: { min: 0, max: 25, color: 'blue' },
      warm: { min: 26, max: 50, color: 'yellow' },
      hot: { min: 51, max: 75, color: 'orange' },
      salesReady: { min: 76, max: 100, color: 'green' }
    }
  });

  // Sample leads for score calculation
  const [sampleLeads] = useState([
    {
      id: 1,
      name: 'John Smith',
      company: 'TechCorp Inc',
      demographic: { companySize: 'Enterprise (1000+)', jobTitle: 'VP/Director', industry: 'Technology', budget: '$100K+' },
      behavioral: { websiteEngagement: ['Pricing Page Visit', 'Product Demo Request'], contentInteraction: ['Webinar Attendance'], emailEngagement: ['Email Click', 'Reply to Email'], directEngagement: ['Meeting Scheduled'] },
      lastActivity: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      company: 'Healthcare Plus',
      demographic: { companySize: 'Mid-Market (200-999)', jobTitle: 'Manager', industry: 'Healthcare', budget: '$50K-$100K' },
      behavioral: { websiteEngagement: ['Resource Download'], contentInteraction: ['Case Study View'], emailEngagement: ['Email Open'], directEngagement: [] },
      lastActivity: '2024-01-10'
    }
  ]);
  // Comprehensive trigger types with icons and descriptions
// Helper function to render trigger icons
  const renderTriggerIcon = (type) => {
    const triggerType = triggerTypes.find(t => t.type === type);
    return triggerType?.icon || 'Circle';
  };

  // Helper function to render action icons
  const renderActionIcon = (type) => {
    const actionType = actionTypes.find(a => a.type === type);
    return actionType?.icon || 'Circle';
  };

  // Helper function to get priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function to get category colors
  const getCategoryColor = (category) => {
    switch (category) {
      case 'lead_nurturing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'retention':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'lead_routing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'onboarding':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 're_engagement':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
// Helper function to get channel icon
  const getChannelIcon = (channel) => {
    const iconMap = {
      email: 'Mail',
      sms: 'MessageSquare',
      whatsapp: 'MessageCircle',
      slack: 'Hash',
      assignment: 'UserCheck'
    };
    return iconMap[channel] || 'Bell';
  };
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
      type: "lead_stage_change",
      label: "Lead Stage Change",
      icon: "GitBranch",
      description: "Triggers when lead moves to a specific stage in the funnel",
      category: "lead_events"
    },
    {
      type: "deal_created",
      label: "Deal Created",
      icon: "DollarSign",
      description: "Triggers when a new deal is created in the pipeline",
      category: "deal_events"
    },
    {
      type: "deal_stage_change",
      label: "Deal Stage Change",
      icon: "ArrowRight",
      description: "Triggers when deal moves between pipeline stages",
      category: "deal_events"
    },
    {
      type: "deal_value_threshold",
      label: "Deal Value Threshold",
      icon: "Target",
      description: "Triggers when deal value reaches specified amount",
      category: "deal_events"
    },
    {
      type: "deal_won",
      label: "Deal Won",
      icon: "Trophy",
      description: "Triggers when a deal is marked as won",
      category: "deal_events"
    },
    {
      type: "deal_lost",
      label: "Deal Lost",
      icon: "X",
      description: "Triggers when a deal is marked as lost",
      category: "deal_events"
    },
    {
      type: "contact_engagement",
      label: "Contact Engagement",
      icon: "Activity",
      description: "Triggers based on contact interaction frequency",
      category: "engagement"
    },
    {
      type: "email_opened",
      label: "Email Opened",
      icon: "Mail",
      description: "Triggers when prospect opens an email",
      category: "engagement"
    },
    {
      type: "email_clicked",
      label: "Email Link Clicked",
      icon: "MousePointer",
      description: "Triggers when prospect clicks link in email",
      category: "engagement"
    },
    {
      type: "website_visit",
      label: "Website Visit",
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
    },
    {
      type: "meeting_attended",
      label: "Meeting Attended",
      icon: "Video",
      description: "Triggers when prospect attends a scheduled meeting",
      category: "sales_activity"
    },
    {
      type: "no_activity",
      label: "No Activity",
      icon: "Clock",
      description: "Triggers after specified period of inactivity",
      category: "time_based"
    },
    {
      type: "birthday",
      label: "Contact Birthday",
      icon: "Gift",
      description: "Triggers on contact's birthday",
      category: "time_based"
    },
    {
      type: "contract_expiry",
      label: "Contract Expiry",
      icon: "AlertTriangle",
      description: "Triggers before contract expiration date",
      category: "time_based"
    },
    {
      type: "territory_assignment",
      label: "Territory Assignment",
      icon: "Map",
      description: "Triggers when lead enters specific territory",
      category: "lead_events"
    },
    {
      type: "competitor_mention",
      label: "Competitor Mention",
      icon: "Shield",
      description: "Triggers when competitor is mentioned in communications",
      category: "competitive"
    },
    {
      type: "support_ticket",
      label: "Support Ticket Created",
      icon: "HelpCircle",
      description: "Triggers when customer creates support ticket",
      category: "customer_service"
    }
  ];

  // Comprehensive action types with icons and descriptions
const actionTypes = [
    {
      type: "assign_lead",
      label: "Assign Lead to Rep",
      icon: "UserCheck",
      description: "Assign lead to specific sales rep or team",
      category: "lead_management"
    },
    {
      type: "assign_territory",
      label: "Assign Territory",
      icon: "Map",
      description: "Assign lead to specific territory or region",
      category: "lead_management"
    },
    {
      type: "change_lead_stage",
      label: "Change Lead Stage",
      icon: "GitBranch",
      description: "Move lead to specific stage in funnel",
      category: "lead_management"
    },
    {
      type: "update_lead_score",
      label: "Update Lead Score",
      icon: "Target",
      description: "Increase or decrease lead score by specified amount",
      category: "scoring"
    },
    {
      type: "set_lead_priority",
      label: "Set Lead Priority",
      icon: "Flag",
      description: "Mark lead as high, medium, or low priority",
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
      type: "send_email_sequence",
      label: "Start Email Sequence",
      icon: "MailIcon",
      description: "Begin automated email drip campaign",
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
      type: "schedule_meeting",
      label: "Schedule Meeting",
      icon: "Calendar",
      description: "Book meeting with prospect automatically",
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
      type: "create_reminder",
      label: "Create Reminder",
      icon: "Bell",
      description: "Set reminder for sales rep",
      category: "task_management"
    },
    {
      type: "create_deal",
      label: "Create Deal",
      icon: "DollarSign",
      description: "Automatically create deal in pipeline",
      category: "sales_pipeline"
    },
    {
      type: "update_deal_stage",
      label: "Update Deal Stage",
      icon: "ArrowRight",
      description: "Move deal to next stage in pipeline",
      category: "sales_pipeline"
    },
    {
      type: "update_deal_value",
      label: "Update Deal Value",
      icon: "TrendingUp",
      description: "Modify deal value based on criteria",
      category: "sales_pipeline"
    },
    {
      type: "add_to_list",
      label: "Add to Marketing List",
      icon: "List",
      description: "Add prospect to specific marketing list",
      category: "list_management"
    },
    {
      type: "remove_from_list",
      label: "Remove from List",
      icon: "ListX",
      description: "Remove prospect from marketing list",
      category: "list_management"
    },
    {
      type: "add_tag",
      label: "Add Tag",
      icon: "Tag",
      description: "Add specific tag to contact record",
      category: "data_management"
    },
    {
      type: "update_contact_field",
      label: "Update Contact Field",
      icon: "Edit",
      description: "Update specific field in contact record",
      category: "data_management"
    },
    {
      type: "send_slack_notification",
      label: "Send Slack Notification",
      icon: "Slack",
      description: "Send notification to Slack channel",
      category: "notifications"
    },
    {
      type: "send_teams_notification",
      label: "Send Teams Notification",
      icon: "Users",
      description: "Send notification to Microsoft Teams",
      category: "notifications"
    },
    {
      type: "webhook_trigger",
      label: "Trigger Webhook",
      icon: "Zap",
      description: "Send data to external system via webhook",
      category: "integrations"
    },
    {
      type: "update_crm_field",
      label: "Update CRM Field",
      icon: "Database",
      description: "Update field in connected CRM system",
      category: "integrations"
    },
    {
      type: "create_calendar_event",
      label: "Create Calendar Event",
      icon: "CalendarPlus",
      description: "Add event to sales rep's calendar",
      category: "sales_activity"
    }
  ];

  // Condition options based on trigger type
  const getConditionOptions = (triggerType) => {
    const baseConditions = [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Does Not Equal" },
      { value: "contains", label: "Contains" },
      { value: "not_contains", label: "Does Not Contain" }
    ];

    const numericConditions = [
      { value: "greater_than", label: "Greater Than" },
      { value: "less_than", label: "Less Than" },
      { value: "greater_equal", label: "Greater Than or Equal" },
      { value: "less_equal", label: "Less Than or Equal" },
      { value: "between", label: "Between" }
    ];

    const timeConditions = [
      { value: "within_days", label: "Within X Days" },
      { value: "after_days", label: "After X Days" },
      { value: "before_date", label: "Before Date" },
      { value: "after_date", label: "After Date" }
    ];

    switch (triggerType) {
      case 'lead_score_change':
      case 'deal_value_threshold':
        return [...baseConditions, ...numericConditions];
      case 'time_delay':
      case 'no_activity':
      case 'contract_expiry':
      case 'birthday':
        return [...baseConditions, ...timeConditions];
      case 'lead_stage_change':
      case 'deal_stage_change':
        return [
          { value: "moved_to", label: "Moved To Stage" },
          { value: "moved_from", label: "Moved From Stage" },
          { value: "stayed_in", label: "Stayed in Stage For" }
        ];
      case 'website_visit':
        return [
          { value: "visited_page", label: "Visited Specific Page" },
          { value: "time_on_page", label: "Time on Page Greater Than" },
          { value: "page_views", label: "Number of Page Views" }
        ];
      case 'email_opened':
      case 'email_clicked':
        return [
          { value: "campaign_name", label: "Campaign Name" },
          { value: "email_subject", label: "Email Subject Contains" },
          { value: "open_count", label: "Number of Opens" }
        ];
      default:
        return baseConditions;
    }
  };

  // Value options based on condition
  const getValueOptions = (triggerType, condition) => {
    if (triggerType === 'lead_stage_change' || triggerType === 'deal_stage_change') {
      return [
        { value: "new", label: "New" },
        { value: "qualified", label: "Qualified" },
        { value: "proposal", label: "Proposal" },
        { value: "negotiation", label: "Negotiation" },
        { value: "closed_won", label: "Closed Won" },
        { value: "closed_lost", label: "Closed Lost" }
      ];
    }
    
    if (condition === 'within_days' || condition === 'after_days') {
      return [
        { value: "1", label: "1 Day" },
        { value: "3", label: "3 Days" },
        { value: "7", label: "1 Week" },
        { value: "14", label: "2 Weeks" },
        { value: "30", label: "1 Month" },
        { value: "90", label: "3 Months" }
      ];
    }

    return [];
  };

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
<div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-200">
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <ApperIcon name="Zap" size={28} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                      Workflow Automation Hub
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ApperIcon name="Sparkles" size={16} className="text-purple-500" />
                      <span>Intelligent Process Automation</span>
                    </div>
                  </div>
                </div>
                <p className="text-xl text-gray-700 max-w-4xl leading-relaxed">
                  Orchestrate intelligent, multi-channel workflows that nurture leads and automate your entire sales process with powerful automation tools
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={() => {
                    setCurrentWorkflow(null);
                    setBuilderState({
                      name: '',
                      description: '',
                      category: 'lead_nurturing',
                      priority: 'medium',
                      trigger: {
                        type: 'lead_created',
                        condition: '',
                        value: '',
                        additionalConditions: []
                      },
                      actions: [],
                      tags: []
                    });
                    setIsBuilderOpen(true);
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  <ApperIcon name="Plus" size={24} />
                  <span className="text-lg">Create Workflow</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <div className="max-w-7xl mx-auto">
<nav className="flex space-x-2" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center space-x-3 py-4 px-6 font-semibold text-sm transition-all duration-300 rounded-t-xl
                    ${activeTab === tab.id
                      ? 'bg-white text-blue-700 shadow-lg border-t-4 border-blue-500 -mb-px'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 border-t-4 border-transparent'
                    }
                  `}
                >
                  <ApperIcon 
                    name={tab.icon} 
                    size={18} 
                    className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}
                  />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                  )}
</button>
))}
            </nav>
</div>
        </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'workflows' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Automation</h2>
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
<div key={workflow.Id} className="group bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/50 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200/50 transition-all duration-300 p-8 hover:scale-[1.02] transform">
                      {/* Header with Name, Status, and Priority Badges */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl shadow-sm ${
                                workflow.isActive 
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                              }`}>
                                <ApperIcon name="Zap" size={18} className="text-white" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                                {workflow.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3">
                              {/* Status Badge */}
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${
                                workflow.isActive 
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300'
                              }`}>
                                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
                                  workflow.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                }`}></span>
                                {workflow.isActive ? 'Active' : 'Inactive'}
                              </span>
                              
                              {/* Priority Badge */}
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm border ${
                                workflow.priority === 'high' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200' :
                                workflow.priority === 'medium' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200' :
                                'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200'
                              }`}>
                                <ApperIcon 
                                  name={workflow.priority === 'high' ? 'AlertTriangle' : workflow.priority === 'medium' ? 'AlertCircle' : 'Info'} 
                                  size={12} 
                                  className="mr-1" 
                                />
                                {workflow.priority.charAt(0).toUpperCase() + workflow.priority.slice(1)} Priority
                              </span>
                              
                              {/* Category Badge */}
                              <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200 shadow-sm">
                                <ApperIcon name="Tag" size={12} className="mr-1" />
                                {workflow.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-gray-700 text-base mb-5 leading-relaxed">{workflow.description}</p>
                          
                          {/* Tags */}
                          {workflow.tags && workflow.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-5">
                              {workflow.tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm border border-gray-300"
                                >
                                  <ApperIcon name="Hash" size={10} className="mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-6">
                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => {
                              setExpandedWorkflow(
                                expandedWorkflow === workflow.Id ? null : workflow.Id
                              );
                            }}
                            className="p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 shadow-sm border border-gray-200 hover:border-purple-200"
                            title={expandedWorkflow === workflow.Id ? 'Collapse details' : 'Expand details'}
                          >
                            <ApperIcon 
                              name={expandedWorkflow === workflow.Id ? "ChevronDown" : "ChevronRight"} 
                              size={18} 
                            />
                          </button>

                          {/* Duplicate Button */}
                          <button
                            onClick={() => {
                              // Add duplicate functionality
                              console.log('Duplicating workflow:', workflow.name);
                            }}
                            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-sm border border-gray-200 hover:border-blue-200"
                            title="Duplicate workflow"
                          >
                            <ApperIcon name="Copy" size={18} />
                          </button>
                          
                          {/* Pause/Play Button */}
                          <button
                            onClick={() => toggleWorkflow(workflow.Id)}
                            className={`p-3 rounded-xl transition-all duration-200 shadow-sm border ${
                              workflow.isActive 
                                ? 'text-orange-600 hover:bg-orange-50 border-orange-200 hover:border-orange-300' 
                                : 'text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300'
                            }`}
                            title={workflow.isActive ? 'Pause workflow' : 'Activate workflow'}
                          >
                            <ApperIcon name={workflow.isActive ? "Pause" : "Play"} size={18} />
                          </button>

                          {/* Edit Button */}
                          <button 
                            onClick={() => {
                              setCurrentWorkflow(workflow);
                              editWorkflow(workflow);
                              setIsBuilderOpen(true);
                              toast.info(`Editing workflow: ${workflow.name}`);
                            }}
                            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-sm border border-gray-200 hover:border-blue-200"
                            title="Edit workflow"
                          >
                            <ApperIcon name="Edit" size={18} />
                          </button>
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => {
                              deleteWorkflow(workflow.Id);
                            }}
                            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm border border-gray-200 hover:border-red-200"
                            title="Delete workflow"
                          >
                            <ApperIcon name="Trash2" size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Stats Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 mb-6 bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-2xl border border-gray-100">
                        <div className="text-center">
                          <div className="flex flex-col items-center">
                            <div className="p-3 bg-blue-100 rounded-xl mb-2 shadow-sm">
                              <ApperIcon name="Activity" size={20} className="text-blue-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">{workflow.executions?.toLocaleString() || '0'}</div>
                            <div className="text-sm text-gray-600 font-medium">Total Executions</div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex flex-col items-center">
                            <div className="p-3 bg-green-100 rounded-xl mb-2 shadow-sm">
                              <ApperIcon name="TrendingUp" size={20} className="text-green-600" />
                            </div>
                            <div className="text-2xl font-bold text-green-600 mb-1">{workflow.successRate || '0'}%</div>
                            <div className="text-sm text-gray-600 font-medium">Success Rate</div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex flex-col items-center">
                            <div className="p-3 bg-orange-100 rounded-xl mb-2 shadow-sm">
                              <ApperIcon name="Clock" size={20} className="text-orange-600" />
                            </div>
                            <div className="text-sm font-bold text-gray-900 mb-1">
                              {workflow.lastRun ? new Date(workflow.lastRun).toLocaleDateString() : 'Never'}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Last Execution</div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex flex-col items-center">
                            <div className="p-3 bg-purple-100 rounded-xl mb-2 shadow-sm">
                              <ApperIcon name="User" size={20} className="text-purple-600" />
                            </div>
                            <div className="text-sm font-bold text-gray-900 mb-1">{workflow.createdBy || 'Unknown'}</div>
                            <div className="text-sm text-gray-600 font-medium">Created By</div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Workflow Visualization Section */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <ApperIcon name="GitBranch" size={18} className="text-indigo-600" />
                          </div>
                          Workflow Flow
                        </h4>
                        
                        <div className="overflow-x-auto pb-4">
                          <div className="flex items-center gap-4 min-w-max p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl border border-blue-100">
                            {/* Enhanced Trigger Box */}
                            <div className="flex-shrink-0 min-w-[240px]">
                              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-lg border border-blue-400">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="p-2 bg-white/20 rounded-lg">
                                    <ApperIcon 
                                      name={renderTriggerIcon(workflow.trigger.type)} 
                                      size={20} 
                                      className="text-white" 
                                    />
                                  </div>
                                  <div>
                                    <span className="text-sm font-bold block">TRIGGER</span>
                                    <span className="text-xs text-blue-100 block">
                                      {triggerTypes.find(t => t.type === workflow.trigger.type)?.label || workflow.trigger.type}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-blue-100 leading-relaxed">
                                  {triggerTypes.find(t => t.type === workflow.trigger.type)?.description}
                                </p>
                                {workflow.trigger.additionalConditions && workflow.trigger.additionalConditions.length > 0 && (
                                  <div className="mt-3 text-xs text-blue-200 bg-blue-600/30 px-3 py-1 rounded-lg">
                                    +{workflow.trigger.additionalConditions.length} conditions
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Enhanced Arrow Connector */}
                            <div className="flex-shrink-0 flex items-center">
                              <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full"></div>
                              <div className="p-1 bg-gray-100 rounded-full mx-2">
                                <ApperIcon name="ChevronRight" size={16} className="text-gray-600" />
                              </div>
                              <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full"></div>
                            </div>

                            {/* Enhanced Action Boxes */}
                            <div className="flex items-center gap-4">
                              {workflow.actions.slice(0, 3).map((action, index) => (
                                <div key={index} className="flex items-center gap-4">
                                  <div className="flex-shrink-0 min-w-[220px]">
                                    <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white rounded-2xl p-4 shadow-lg border border-green-400">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                          <ApperIcon 
                                            name={renderActionIcon(action.type)} 
                                            size={20} 
                                            className="text-white" 
                                          />
                                        </div>
                                        <div>
                                          <span className="text-sm font-bold block">ACTION {index + 1}</span>
                                          <span className="text-xs text-green-100 block">
                                            {actionTypes.find(a => a.type === action.type)?.label || action.type}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-sm text-green-100 leading-relaxed">
                                        {actionTypes.find(a => a.type === action.type)?.description}
                                      </p>
                                      {action.delay > 0 && (
                                        <div className="mt-3 text-xs text-green-200 bg-green-600/30 px-3 py-1 rounded-lg">
                                          Delay: {action.delay < 60 ? `${action.delay}m` : 
                                                 action.delay < 1440 ? `${Math.floor(action.delay / 60)}h` : 
                                                 `${Math.floor(action.delay / 1440)}d`}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Enhanced Arrow between actions */}
                                  {index < Math.min(workflow.actions.length, 3) - 1 && (
                                    <div className="flex-shrink-0 flex items-center">
                                      <div className="w-6 h-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                                      <div className="p-1 bg-gray-100 rounded-full mx-2">
                                        <ApperIcon name="ChevronRight" size={14} className="text-gray-600" />
                                      </div>
                                      <div className="w-6 h-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Enhanced +X more indicator */}
                              {workflow.actions.length > 3 && (
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-1 bg-gradient-to-r from-green-400 to-gray-400 rounded-full"></div>
                                  <div className="p-1 bg-gray-100 rounded-full">
                                    <ApperIcon name="ChevronRight" size={14} className="text-gray-600" />
                                  </div>
                                  <div className="flex-shrink-0 min-w-[140px]">
                                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-400 rounded-2xl p-4 text-center">
                                      <ApperIcon name="MoreHorizontal" size={20} className="text-gray-600 mx-auto mb-2" />
                                      <span className="text-sm font-bold text-gray-700 block">
                                        +{workflow.actions.length - 3} more
                                      </span>
                                      <p className="text-xs text-gray-600 mt-1">
                                        actions
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Expandable Detailed View */}
                      <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          expandedWorkflow === workflow.Id 
                            ? 'max-h-screen opacity-100' 
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        {expandedWorkflow === workflow.Id && (
                          <div className="pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Enhanced Left Column - Trigger Details */}
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-6 shadow-sm">
                                <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-3">
                                  <div className="p-2 bg-blue-600 rounded-xl">
                                    <ApperIcon name="Zap" size={20} className="text-white" />
                                  </div>
                                  Trigger Configuration
                                </h4>
                                
                                <div className="space-y-4">
                                  {/* Enhanced Trigger Type */}
                                  <div className="flex items-center gap-4 p-4 bg-white/70 rounded-xl shadow-sm border border-blue-100">
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                      <ApperIcon 
                                        name={triggerTypes.find(t => t.type === workflow.trigger.type)?.icon || 'Circle'} 
                                        size={24} 
                                        className="text-blue-600" 
                                      />
                                    </div>
                                    <div>
                                      <div className="font-bold text-blue-900 text-lg">
                                        {triggerTypes.find(t => t.type === workflow.trigger.type)?.label || workflow.trigger.type}
                                      </div>
                                      <div className="text-sm text-blue-700 mt-1">
                                        {triggerTypes.find(t => t.type === workflow.trigger.type)?.description || 'Custom trigger'}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Enhanced Trigger Conditions */}
                                  {workflow.trigger.conditions && (
                                    <div className="space-y-3">
                                      <div className="text-base font-bold text-blue-900">Conditions:</div>
                                      {Object.entries(workflow.trigger.conditions).map(([key, value], index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-blue-100">
                                          <span className="text-blue-800 capitalize font-medium">{key.replace('_', ' ')}:</span>
                                          <span className="text-blue-900 font-bold bg-blue-100 px-3 py-1 rounded-lg">{value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Enhanced Right Column - Actions Sequence */}
                              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 shadow-sm">
                                <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-3">
                                  <div className="p-2 bg-green-600 rounded-xl">
                                    <ApperIcon name="Play" size={20} className="text-white" />
                                  </div>
                                  Actions Sequence ({workflow.actions.length})
                                </h4>
                                
                                <div className="space-y-4">
                                  {workflow.actions.map((action, index) => (
                                    <div key={index} className="flex gap-4 p-4 bg-white/70 rounded-xl shadow-sm border border-green-100">
                                      {/* Enhanced Step Number */}
                                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 text-white text-sm font-bold rounded-xl flex items-center justify-center shadow-sm">
                                        {index + 1}
                                      </div>
                                      
                                      <div className="flex-1">
                                        {/* Enhanced Action Header */}
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="p-2 bg-green-100 rounded-lg">
                                            <ApperIcon 
                                              name={actionTypes.find(a => a.type === action.type)?.icon || 'Circle'} 
                                              size={18} 
                                              className="text-green-600" 
                                            />
                                          </div>
                                          <span className="font-bold text-green-900">
                                            {actionTypes.find(a => a.type === action.type)?.label || action.type}
                                          </span>
                                          {action.delay > 0 && (
                                            <span className="text-xs text-green-700 bg-green-200 px-3 py-1 rounded-lg font-semibold">
                                              {action.delay < 60 ? `${action.delay}m` : 
                                               action.delay < 1440 ? `${Math.floor(action.delay / 60)}h` : 
                                               `${Math.floor(action.delay / 1440)}d`} delay
                                            </span>
                                          )}
                                        </div>

                                        {/* Enhanced Action Details */}
                                        <div className="space-y-2 text-sm">
                                          {action.assignee && (
                                            <div className="text-green-800 bg-green-100/50 p-2 rounded-lg">
                                              <span className="font-semibold">Assignee:</span> {action.assignee}
                                            </div>
                                          )}
                                          {action.template && (
                                            <div className="text-green-800 bg-green-100/50 p-2 rounded-lg">
                                              <span className="font-semibold">Template:</span> {action.template}
                                            </div>
                                          )}
                                          {action.message && (
                                            <div className="text-green-800 bg-green-100/50 p-2 rounded-lg">
                                              <span className="font-semibold">Message:</span> {action.message.substring(0, 60)}...
                                            </div>
                                          )}
                                          {action.conditions && Object.keys(action.conditions).length > 0 && (
                                            <div className="mt-3 p-3 bg-green-200/50 rounded-lg border border-green-200">
                                              <div className="font-semibold text-green-900 mb-2">Conditions:</div>
                                              {Object.entries(action.conditions).map(([key, value], condIndex) => (
                                                <div key={condIndex} className="text-green-800 flex justify-between">
                                                  <span>{key.replace('_', ' ')}:</span>
                                                  <span className="font-semibold">{value}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Execution History</h2>
              
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Workflow
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lead
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Channel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {executionHistory.map((execution) => (
                        <tr 
                          key={execution.Id} 
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {execution.workflowName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {execution.leadName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {execution.leadEmail}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {execution.action}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <ApperIcon 
                                name={getChannelIcon(execution.channel)} 
                                size={16} 
                                className="text-gray-400"
                              />
                              <span className="text-sm text-gray-900 capitalize">
                                {execution.channel}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  execution.status === 'success'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {execution.status === 'success' ? 'Success' : 'Failed'}
                              </span>
                              {execution.status === 'failed' && execution.errorMessage && (
                                <div className="text-xs text-red-600 max-w-xs">
                                  {execution.errorMessage}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {execution.duration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(execution.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {executionHistory.length === 0 && (
                  <div className="text-center py-12">
                    <ApperIcon name="History" size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Execution History</h3>
                    <p className="text-gray-600">Workflow executions will appear here once they start running.</p>
                  </div>
                )}
              </div>
            </div>
)}
          
          {activeTab === 'lead-scoring' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Lead Scoring Configuration</h2>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => {
                    // Save scoring rules logic
                    console.log('Saving scoring rules...', scoringRules);
                  }}
                >
                  <ApperIcon name="Save" size={16} className="mr-2" />
                  Save Changes
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Scoring Rules (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Demographic Scoring Section */}
                  <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <ApperIcon name="User" size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">Demographic Scoring</h3>
                          <p className="text-sm text-blue-600">Score based on lead profile attributes</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {Object.entries(scoringRules.demographic).map(([category, rules]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="font-medium text-gray-900 capitalize flex items-center">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {rules.filter(r => r.active).length} active
                            </span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {rules.map((rule, index) => (
                              <div key={index} className={`border rounded-lg p-3 transition-colors ${rule.active ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={rule.active}
                                      onChange={(e) => {
                                        const newRules = { ...scoringRules };
                                        newRules.demographic[category][index].active = e.target.checked;
                                        setScoringRules(newRules);
                                      }}
                                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className={`ml-2 text-sm ${rule.active ? 'text-gray-900' : 'text-gray-500'}`}>
                                      {rule.label}
                                    </span>
                                  </div>
                                  <input
                                    type="number"
                                    value={rule.points}
                                    onChange={(e) => {
                                      const newRules = { ...scoringRules };
                                      newRules.demographic[category][index].points = parseInt(e.target.value) || 0;
                                      setScoringRules(newRules);
                                    }}
                                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={!rule.active}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Behavioral Scoring Section */}
                  <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
                    <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <ApperIcon name="Activity" size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-900">Behavioral Scoring</h3>
                          <p className="text-sm text-green-600">Score based on lead actions and engagement</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {Object.entries(scoringRules.behavioral).map(([category, actions]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="font-medium text-gray-900 capitalize flex items-center">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {actions.filter(a => a.active).length} active
                            </span>
                          </h4>
                          <div className="space-y-2">
                            {actions.map((action, index) => (
                              <div key={index} className={`border rounded-lg p-3 transition-colors ${action.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={action.active}
                                      onChange={(e) => {
                                        const newRules = { ...scoringRules };
                                        newRules.behavioral[category][index].active = e.target.checked;
                                        setScoringRules(newRules);
                                      }}
                                      className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                    />
                                    <span className={`ml-2 text-sm ${action.active ? 'text-gray-900' : 'text-gray-500'}`}>
                                      {action.action}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      value={action.points}
                                      onChange={(e) => {
                                        const newRules = { ...scoringRules };
                                        newRules.behavioral[category][index].points = parseInt(e.target.value) || 0;
                                        setScoringRules(newRules);
                                      }}
                                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                      disabled={!action.active}
                                    />
                                    <span className="text-xs text-gray-500">pts</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Decay Settings */}
                  <div className="bg-white border border-orange-200 rounded-lg overflow-hidden">
                    <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-orange-100 rounded-lg mr-3">
                            <ApperIcon name="Clock" size={20} className="text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-orange-900">Time Decay Settings</h3>
                            <p className="text-sm text-orange-600">Adjust scores based on activity recency</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={scoringRules.timeDecay.enabled}
                            onChange={(e) => {
                              setScoringRules(prev => ({
                                ...prev,
                                timeDecay: { ...prev.timeDecay, enabled: e.target.checked }
                              }));
                            }}
                            className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                          />
                          <span className="ml-2 text-sm text-orange-900">Enable Time Decay</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        {scoringRules.timeDecay.rules.map((rule, index) => (
                          <div key={index} className={`border rounded-lg p-3 transition-colors ${scoringRules.timeDecay.enabled && rule.active ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={rule.active}
                                  onChange={(e) => {
                                    const newRules = { ...scoringRules };
                                    newRules.timeDecay.rules[index].active = e.target.checked;
                                    setScoringRules(newRules);
                                  }}
                                  disabled={!scoringRules.timeDecay.enabled}
                                  className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                                />
                                <span className={`ml-2 text-sm ${scoringRules.timeDecay.enabled && rule.active ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {rule.period}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">×</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="1"
                                  value={rule.multiplier}
                                  onChange={(e) => {
                                    const newRules = { ...scoringRules };
                                    newRules.timeDecay.rules[index].multiplier = parseFloat(e.target.value) || 0;
                                    setScoringRules(newRules);
                                  }}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  disabled={!scoringRules.timeDecay.enabled || !rule.active}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Score Thresholds & Calculator (1/3 width) */}
                <div className="space-y-6">
                  
                  {/* Score Thresholds */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ApperIcon name="Target" size={20} className="mr-2 text-gray-600" />
                        Score Thresholds
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {Object.entries(scoringRules.thresholds).map(([level, threshold]) => {
                        const colors = {
                          blue: 'bg-blue-100 text-blue-800 border-blue-200',
                          yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                          orange: 'bg-orange-100 text-orange-800 border-orange-200',
                          green: 'bg-green-100 text-green-800 border-green-200'
                        };
                        
                        return (
                          <div key={level} className={`border rounded-lg p-3 ${colors[threshold.color]}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{level.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <div className="text-sm font-mono">
                                {threshold.min}-{threshold.max}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="number"
                                value={threshold.min}
                                onChange={(e) => {
                                  const newRules = { ...scoringRules };
                                  newRules.thresholds[level].min = parseInt(e.target.value) || 0;
                                  setScoringRules(newRules);
                                }}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                placeholder="Min"
                              />
                              <input
                                type="number"
                                value={threshold.max}
                                onChange={(e) => {
                                  const newRules = { ...scoringRules };
                                  newRules.thresholds[level].max = parseInt(e.target.value) || 0;
                                  setScoringRules(newRules);
                                }}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                placeholder="Max"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Score Calculator */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ApperIcon name="Calculator" size={20} className="mr-2 text-gray-600" />
                        Live Score Calculator
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {sampleLeads.map(lead => {
                        // Calculate score for sample lead
                        let totalScore = 0;
                        
                        // Demographic scoring
                        const demographicRules = scoringRules.demographic;
                        Object.entries(lead.demographic).forEach(([category, value]) => {
                          const rule = demographicRules[category]?.find(r => r.label === value && r.active);
                          if (rule) totalScore += rule.points;
                        });
                        
                        // Behavioral scoring
                        const behavioralRules = scoringRules.behavioral;
                        Object.entries(lead.behavioral).forEach(([category, actions]) => {
                          actions.forEach(action => {
                            const rule = behavioralRules[category]?.find(r => r.action === action && r.active);
                            if (rule) totalScore += rule.points;
                          });
                        });
                        
                        // Time decay application
                        if (scoringRules.timeDecay.enabled) {
                          const daysSinceActivity = Math.floor((new Date() - new Date(lead.lastActivity)) / (1000 * 60 * 60 * 24));
                          let multiplier = 1.0;
                          
                          if (daysSinceActivity > 180) multiplier = 0.2;
                          else if (daysSinceActivity > 90) multiplier = 0.4;
                          else if (daysSinceActivity > 30) multiplier = 0.6;
                          else if (daysSinceActivity > 7) multiplier = 0.8;
                          
                          totalScore = Math.round(totalScore * multiplier);
                        }
                        
                        // Determine level
                        let level = 'cold';
                        let levelColor = 'blue';
                        Object.entries(scoringRules.thresholds).forEach(([thresholdLevel, threshold]) => {
                          if (totalScore >= threshold.min && totalScore <= threshold.max) {
                            level = thresholdLevel;
                            levelColor = threshold.color;
                          }
                        });
                        
                        const levelColors = {
                          blue: 'bg-blue-100 text-blue-800',
                          yellow: 'bg-yellow-100 text-yellow-800',
                          orange: 'bg-orange-100 text-orange-800',
                          green: 'bg-green-100 text-green-800'
                        };
                        
                        return (
                          <div key={lead.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-medium text-sm text-gray-900">{lead.name}</div>
                                <div className="text-xs text-gray-500">{lead.company}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">{totalScore}</div>
                                <div className={`text-xs px-2 py-1 rounded-full ${levelColors[levelColor]}`}>
                                  {level.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${levelColor === 'blue' ? 'bg-blue-500' : levelColor === 'yellow' ? 'bg-yellow-500' : levelColor === 'orange' ? 'bg-orange-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min((totalScore / 100) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
</div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Workflow Analytics</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ApperIcon name="Clock" size={16} />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Activity" size={16} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Total Executions</span>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                      analyticsData.performanceMetrics.totalExecutionsChange >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <ApperIcon 
                        name={analyticsData.performanceMetrics.totalExecutionsChange >= 0 ? "TrendingUp" : "TrendingDown"} 
                        size={12} 
                      />
                      <span>{Math.abs(analyticsData.performanceMetrics.totalExecutionsChange)}%</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.totalExecutions.toLocaleString()}</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <ApperIcon name="CheckCircle" size={16} className="text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Success Rate</span>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                      analyticsData.performanceMetrics.successRateChange >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <ApperIcon 
                        name={analyticsData.performanceMetrics.successRateChange >= 0 ? "TrendingUp" : "TrendingDown"} 
                        size={12} 
                      />
                      <span>{Math.abs(analyticsData.performanceMetrics.successRateChange)}%</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.successRate}%</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Clock" size={16} className="text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Avg Execution Time</span>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                      analyticsData.performanceMetrics.avgExecutionTimeChange <= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <ApperIcon 
                        name={analyticsData.performanceMetrics.avgExecutionTimeChange <= 0 ? "TrendingDown" : "TrendingUp"} 
                        size={12} 
                      />
                      <span>{Math.abs(analyticsData.performanceMetrics.avgExecutionTimeChange)}%</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.avgExecutionTime}s</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Settings" size={16} className="text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Active Workflows</span>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                      analyticsData.performanceMetrics.activeWorkflowsChange >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <ApperIcon 
                        name={analyticsData.performanceMetrics.activeWorkflowsChange >= 0 ? "TrendingUp" : "TrendingDown"} 
                        size={12} 
                      />
                      <span>{Math.abs(analyticsData.performanceMetrics.activeWorkflowsChange)}%</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.activeWorkflows}</div>
                </div>
              </div>

              {/* Execution Trend Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Execution Trend</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>Last 7 days</span>
                  </div>
                </div>
                <div className="h-64">
                  <div className="flex items-end justify-between h-full space-x-2">
                    {analyticsData.executionTrend.map((item, index) => {
                      const maxValue = Math.max(...analyticsData.executionTrend.map(i => i.executions));
                      const height = (item.executions / maxValue) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex flex-col items-center mb-2">
                            <div 
                              className="w-full bg-blue-500 rounded-t transition-all duration-500 min-h-[4px] relative group cursor-pointer"
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {item.executions} executions
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Performing Workflows */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Workflows</h3>
                  <Button variant="outline" size="sm">
                    <ApperIcon name="Download" size={16} className="mr-2" />
                    Export Report
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Workflow</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Executions</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Success Rate</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topPerformingWorkflows.map((workflow, index) => (
                        <tr key={workflow.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                                <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{workflow.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(workflow.category)}`}>
                              {workflow.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">
                            {workflow.executions.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${workflow.successRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{workflow.successRate}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end">
                              {workflow.successRate >= 95 ? (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <ApperIcon name="TrendingUp" size={16} />
                                  <span className="text-sm font-medium">Excellent</span>
                                </div>
                              ) : workflow.successRate >= 90 ? (
                                <div className="flex items-center space-x-1 text-blue-600">
                                  <ApperIcon name="Minus" size={16} />
                                  <span className="text-sm font-medium">Good</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-orange-600">
                                  <ApperIcon name="TrendingDown" size={16} />
                                  <span className="text-sm font-medium">Needs Attention</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
</div>
          )}
        </div>
      </div>

      {/* Enhanced Workflow Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Enhanced Overlay with Blur Effect */}
          <div 
            className="fixed inset-0 bg-gradient-to-br from-black/60 via-blue-900/20 to-purple-900/20 backdrop-blur-sm transition-all duration-300"
            onClick={() => setIsBuilderOpen(false)}
          ></div>
          
          {/* Enhanced Centered Modal */}
          <div className="flex min-h-full items-center justify-center p-6">
            <div 
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced Sticky Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 via-white to-purple-50 border-b border-gray-200 rounded-t-3xl px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                      <ApperIcon name="Settings" size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                        {currentWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Build intelligent automation workflows to nurture leads and streamline your sales process
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBuilderOpen(false)}
                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 shadow-sm border border-gray-200 hover:border-red-200"
                    title="Close modal"
                  >
                    <ApperIcon name="X" size={24} />
                  </button>
                </div>
              </div>

              {/* Enhanced Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="space-y-10">
                  {/* Enhanced Basic Information Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mr-4 shadow-lg">
                        <ApperIcon name="Info" size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">Basic Information</h3>
                        <p className="text-blue-700 text-sm">Define the core details of your workflow</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Workflow Name *
                          </label>
                          <input
                            type="text"
                            value={builderState.name}
                            onChange={(e) => setBuilderState(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter workflow name..."
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Category
                          </label>
                          <select
                            value={builderState.category}
                            onChange={(e) => setBuilderState(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                          >
                            <option value="lead_nurturing">Lead Nurturing</option>
                            <option value="retention">Retention</option>
                            <option value="lead_routing">Lead Routing</option>
                            <option value="onboarding">Onboarding</option>
                            <option value="re_engagement">Re-engagement</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Priority
                          </label>
                          <select
                            value={builderState.priority}
                            onChange={(e) => setBuilderState(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                          >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Description *
                        </label>
                        <textarea
                          value={builderState.description}
                          onChange={(e) => setBuilderState(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe what this workflow does and when it should be used..."
                          rows={8}
                          className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Trigger Configuration Section */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mr-4 shadow-lg">
                        <ApperIcon name="Zap" size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-900">Trigger Configuration</h3>
                        <p className="text-purple-700 text-sm">Define when this workflow should activate</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Trigger Type
                        </label>
                        <select
                          value={builderState.trigger.type}
                          onChange={(e) => setBuilderState(prev => ({ 
                            ...prev, 
                            trigger: { ...prev.trigger, type: e.target.value }
                          }))}
                          className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                        >
                          {triggerTypes.map(trigger => (
                            <option key={trigger.type} value={trigger.type}>
                              {trigger.label} - {trigger.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Condition Type
                          </label>
                          <select
                            value={builderState.trigger.condition}
                            onChange={(e) => setBuilderState(prev => ({ 
                              ...prev, 
                              trigger: { ...prev.trigger, condition: e.target.value, value: '' }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                          >
                            <option value="">Select condition...</option>
                            {getConditionOptions(builderState.trigger.type).map(condition => (
                              <option key={condition.value} value={condition.value}>
                                {condition.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Value
                          </label>
                          {getValueOptions(builderState.trigger.type, builderState.trigger.condition).length > 0 ? (
                            <select
                              value={builderState.trigger.value}
                              onChange={(e) => setBuilderState(prev => ({ 
                                ...prev, 
                                trigger: { ...prev.trigger, value: e.target.value }
                              }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                            >
                              <option value="">Select value...</option>
                              {getValueOptions(builderState.trigger.type, builderState.trigger.condition).map(value => (
                                <option key={value.value} value={value.value}>
                                  {value.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={builderState.trigger.condition?.includes('than') || builderState.trigger.condition?.includes('equal') ? 'number' : 'text'}
                              value={builderState.trigger.value}
                              onChange={(e) => setBuilderState(prev => ({ 
                                ...prev, 
                                trigger: { ...prev.trigger, value: e.target.value }
                              }))}
                              placeholder={
                                builderState.trigger.condition?.includes('than') || builderState.trigger.condition?.includes('equal') 
                                  ? 'Enter number...' 
                                  : builderState.trigger.condition?.includes('date')
                                    ? 'YYYY-MM-DD'
                                    : 'Enter value...'
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Priority Level
                          </label>
                          <select
                            value={builderState.trigger.priority || 'medium'}
                            onChange={(e) => setBuilderState(prev => ({ 
                              ...prev, 
                              trigger: { ...prev.trigger, priority: e.target.value }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Actions Configuration Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mr-4 shadow-lg">
                          <ApperIcon name="Play" size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-green-900">Actions Configuration</h3>
                          <p className="text-green-700 text-sm">Define the actions that will be executed</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setBuilderState(prev => ({
                            ...prev,
                            actions: [...prev.actions, {
                              type: 'send_email',
                              delay: 0,
                              conditions: [],
                              template: '',
                              message: ''
                            }]
                          }));
                        }}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 px-4 py-2 border-green-300 text-green-700 hover:bg-green-100 rounded-xl transition-all duration-200"
                      >
                        <ApperIcon name="Plus" size={18} />
                        Add Action
                      </Button>
                    </div>
                    
                    {builderState.actions.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-green-300 rounded-2xl bg-white/50">
                        <div className="p-4 bg-green-100 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                          <ApperIcon name="Play" size={32} className="text-green-600" />
                        </div>
                        <h4 className="text-xl font-bold text-green-800 mb-3">No Actions Yet</h4>
                        <p className="text-green-600 mb-6 max-w-md mx-auto">Add actions to define what happens when this workflow triggers</p>
                        <Button
                          onClick={() => {
                            setBuilderState(prev => ({
                              ...prev,
                              actions: [{
                                type: 'send_email',
                                delay: 0,
                                conditions: [],
                                template: '',
                                message: ''
                              }]
                            }));
                          }}
                          variant="primary"
                          size="sm"
                          className="px-6 py-3"
                        >
                          <ApperIcon name="Plus" size={18} className="mr-2" />
                          Add First Action
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {builderState.actions.map((action, index) => (
                          <div key={index} className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 text-white text-sm font-bold rounded-xl flex items-center justify-center shadow-sm">
                                  {index + 1}
                                </div>
                                <span className="font-bold text-green-900 text-lg">Action {index + 1}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setBuilderState(prev => ({
                                    ...prev,
                                    actions: prev.actions.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                                title="Remove action"
                              >
                                <ApperIcon name="Trash2" size={18} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                  Action Type
                                </label>
                                <select
                                  value={action.type}
                                  onChange={(e) => {
                                    const newActions = [...builderState.actions];
                                    newActions[index].type = e.target.value;
                                    setBuilderState(prev => ({ ...prev, actions: newActions }));
                                  }}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm bg-white transition-all duration-200"
                                >
                                  {actionTypes.map(actionType => (
                                    <option key={actionType.type} value={actionType.type}>
                                      {actionType.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                  Delay (minutes)
                                </label>
                                <input
                                  type="number"
                                  value={action.delay}
                                  onChange={(e) => {
                                    const newActions = [...builderState.actions];
                                    newActions[index].delay = parseInt(e.target.value) || 0;
                                    setBuilderState(prev => ({ ...prev, actions: newActions }));
                                  }}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm bg-white transition-all duration-200"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Enhanced Tags Section */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-gradient-to-br from-gray-600 to-slate-600 rounded-2xl mr-4 shadow-lg">
                        <ApperIcon name="Tag" size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Tags</h3>
                        <p className="text-gray-700 text-sm">Add tags to organize and categorize this workflow</p>
                      </div>
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="Enter tags separated by commas..."
                        value={builderState.tags.join(', ')}
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                          setBuilderState(prev => ({ ...prev, tags }));
                        }}
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200"
                      />
                      {builderState.tags.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {builderState.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 shadow-sm border border-gray-300"
                            >
                              <ApperIcon name="Hash" size={14} className="mr-2" />
                              {tag}
                              <button
                                onClick={() => {
                                  setBuilderState(prev => ({
                                    ...prev,
                                    tags: prev.tags.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="ml-3 text-gray-500 hover:text-red-600 transition-colors"
                              >
                                <ApperIcon name="X" size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Sticky Footer */}
              <div className="sticky bottom-0 z-10 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200 rounded-b-3xl px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <ApperIcon name="Info" size={16} className="text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {currentWorkflow ? 'Editing existing workflow' : 'Creating new workflow'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setIsBuilderOpen(false)}
                      variant="outline"
                      className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        saveWorkflow();
                      }}
                      variant="primary"
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg"
                      disabled={!builderState.name || !builderState.description}
                    >
                      <ApperIcon name="Save" size={18} className="mr-2" />
                      {currentWorkflow ? 'Update Workflow' : 'Create Workflow'}
                    </Button>
                  </div>
                </div>
</div>
            </div>
          </div>
        </div>
</div>
      )}
    </div>
  );
};

export default WorkflowAutomationSystem;