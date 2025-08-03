import React, { useState } from "react";
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
// Lead Scoring Rules State
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
      <div className="bg-white border-b border-gray-200">
<div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Workflow Automation Hub
                </h1>
                <p className="text-lg text-gray-600 max-w-4xl">
                  Orchestrate intelligent, multi-channel workflows that nurture leads and automate your entire sales process
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
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <ApperIcon name="Plus" size={20} />
                  Create Workflow
                </Button>
              </div>
            </div>
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
                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => {
                              setExpandedWorkflow(
                                expandedWorkflow === workflow.Id ? null : workflow.Id
                              );
                            }}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title={expandedWorkflow === workflow.Id ? 'Collapse details' : 'Expand details'}
                          >
                            <ApperIcon 
                              name={expandedWorkflow === workflow.Id ? "ChevronDown" : "ChevronRight"} 
                              size={16} 
                            />
                          </button>

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

                      {/* Workflow Visualization Section */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <ApperIcon name="GitBranch" size={14} className="text-gray-600" />
                          Workflow Visualization
                        </h4>
                        
                        <div className="overflow-x-auto pb-2">
                          <div className="flex items-center gap-3 min-w-max">
                            {/* Trigger Box */}
                            <div className="flex-shrink-0 min-w-[200px]">
                              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <ApperIcon 
                                    name={renderTriggerIcon(workflow.trigger.type)} 
                                    size={16} 
                                    className="text-white" 
                                  />
                                  <span className="text-sm font-medium">
                                    {triggerTypes.find(t => t.type === workflow.trigger.type)?.label || workflow.trigger.type}
                                  </span>
                                </div>
                                <p className="text-xs text-blue-100 leading-relaxed">
                                  {triggerTypes.find(t => t.type === workflow.trigger.type)?.description}
                                </p>
                                {workflow.trigger.additionalConditions && workflow.trigger.additionalConditions.length > 0 && (
                                  <div className="mt-2 text-xs text-blue-200">
                                    +{workflow.trigger.additionalConditions.length} conditions
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Arrow Connector */}
                            <div className="flex-shrink-0 flex items-center">
                              <div className="w-6 h-0.5 bg-gray-300"></div>
                              <ApperIcon name="ChevronRight" size={16} className="text-gray-400 mx-1" />
                              <div className="w-6 h-0.5 bg-gray-300"></div>
                            </div>

                            {/* Action Boxes */}
                            <div className="flex items-center gap-3">
                              {workflow.actions.slice(0, 3).map((action, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <div className="flex-shrink-0 min-w-[180px]">
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-3 shadow-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        <ApperIcon 
                                          name={renderActionIcon(action.type)} 
                                          size={16} 
                                          className="text-white" 
                                        />
                                        <span className="text-sm font-medium">
                                          {actionTypes.find(a => a.type === action.type)?.label || action.type}
                                        </span>
                                      </div>
                                      <p className="text-xs text-green-100 leading-relaxed">
                                        {actionTypes.find(a => a.type === action.type)?.description}
                                      </p>
                                      {action.delay > 0 && (
                                        <div className="mt-2 text-xs text-green-200 bg-green-600 bg-opacity-50 px-2 py-1 rounded">
                                          Delay: {action.delay < 60 ? `${action.delay}m` : 
                                                 action.delay < 1440 ? `${Math.floor(action.delay / 60)}h` : 
                                                 `${Math.floor(action.delay / 1440)}d`}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Arrow between actions (except after last shown action) */}
                                  {index < Math.min(workflow.actions.length, 3) - 1 && (
                                    <div className="flex-shrink-0 flex items-center">
                                      <div className="w-4 h-0.5 bg-gray-300"></div>
                                      <ApperIcon name="ChevronRight" size={14} className="text-gray-400 mx-1" />
                                      <div className="w-4 h-0.5 bg-gray-300"></div>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Show +X more indicator */}
                              {workflow.actions.length > 3 && (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-0.5 bg-gray-300"></div>
                                  <ApperIcon name="ChevronRight" size={14} className="text-gray-400" />
                                  <div className="flex-shrink-0 min-w-[120px]">
                                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                                      <ApperIcon name="MoreHorizontal" size={16} className="text-gray-500 mx-auto mb-1" />
                                      <span className="text-xs font-medium text-gray-600">
                                        +{workflow.actions.length - 3} more
                                      </span>
                                      <p className="text-xs text-gray-500 mt-1">
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

                      {/* Legacy Trigger Section (kept for backwards compatibility) */}
                      <div className="mb-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <ApperIcon name="Zap" size={14} className="text-primary-600" />
                          Trigger Details
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

{/* Expandable Detailed View */}
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedWorkflow === workflow.Id 
                            ? 'max-h-screen opacity-100' 
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        {expandedWorkflow === workflow.Id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Column - Trigger Details */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                  <ApperIcon name="Zap" size={16} className="text-blue-600" />
                                  Trigger Details
                                </h4>
                                
                                <div className="space-y-3">
                                  {/* Trigger Type */}
                                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                                    <ApperIcon 
                                      name={triggerTypes.find(t => t.type === workflow.trigger.type)?.icon || 'Circle'} 
                                      size={20} 
                                      className="text-blue-600" 
                                    />
                                    <div>
                                      <div className="font-medium text-blue-900">
                                        {triggerTypes.find(t => t.type === workflow.trigger.type)?.label || workflow.trigger.type}
                                      </div>
                                      <div className="text-xs text-blue-600">
                                        {triggerTypes.find(t => t.type === workflow.trigger.type)?.description || 'Custom trigger'}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Trigger Conditions */}
                                  {workflow.trigger.conditions && (
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium text-blue-800">Conditions:</div>
                                      {Object.entries(workflow.trigger.conditions).map(([key, value], index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-white/40 rounded text-sm">
                                          <span className="text-blue-700 capitalize">{key.replace('_', ' ')}:</span>
                                          <span className="text-blue-900 font-medium">{value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right Column - Actions Sequence */}
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                                  <ApperIcon name="Play" size={16} className="text-green-600" />
                                  Actions Sequence ({workflow.actions.length})
                                </h4>
                                
                                <div className="space-y-3">
                                  {workflow.actions.map((action, index) => (
                                    <div key={index} className="flex gap-3 p-3 bg-white/60 rounded-lg">
                                      {/* Step Number */}
                                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {index + 1}
                                      </div>
                                      
                                      <div className="flex-1">
                                        {/* Action Header */}
                                        <div className="flex items-center gap-2 mb-2">
                                          <ApperIcon 
                                            name={actionTypes.find(a => a.type === action.type)?.icon || 'Circle'} 
                                            size={16} 
                                            className="text-green-600" 
                                          />
                                          <span className="font-medium text-green-900">
                                            {actionTypes.find(a => a.type === action.type)?.label || action.type}
                                          </span>
                                          {action.delay > 0 && (
                                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                              {action.delay < 60 ? `${action.delay}m` : 
                                               action.delay < 1440 ? `${Math.floor(action.delay / 60)}h` : 
                                               `${Math.floor(action.delay / 1440)}d`} delay
                                            </span>
                                          )}
                                        </div>

                                        {/* Action Details */}
                                        <div className="space-y-1 text-sm">
                                          {action.assignee && (
                                            <div className="text-green-700">
                                              <span className="font-medium">Assignee:</span> {action.assignee}
                                            </div>
                                          )}
                                          {action.template && (
                                            <div className="text-green-700">
                                              <span className="font-medium">Template:</span> {action.template}
                                            </div>
                                          )}
                                          {action.message && (
                                            <div className="text-green-700">
                                              <span className="font-medium">Message:</span> {action.message.substring(0, 60)}...
                                            </div>
                                          )}
                                          {action.conditions && Object.keys(action.conditions).length > 0 && (
                                            <div className="mt-2 p-2 bg-green-100/50 rounded text-xs">
                                              <div className="font-medium text-green-800 mb-1">Conditions:</div>
                                              {Object.entries(action.conditions).map(([key, value], condIndex) => (
                                                <div key={condIndex} className="text-green-700">
                                                  {key.replace('_', ' ')}: {value}
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

                      {/* Compact Actions Summary (shown when not expanded) */}
                      {expandedWorkflow !== workflow.Id && (
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
                      )}
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

      {/* Workflow Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Fixed Overlay with Semi-transparent Background */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsBuilderOpen(false)}
          ></div>
          
          {/* Centered Modal with Max Width and Height */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Header with Title and Close Button */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {currentWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Build intelligent automation workflows to nurture leads and streamline your sales process
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBuilderOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close modal"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-600 rounded-lg mr-3">
                        <ApperIcon name="Info" size={20} className="text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900">Basic Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Workflow Name *
                          </label>
                          <input
                            type="text"
                            value={builderState.name}
                            onChange={(e) => setBuilderState(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter workflow name..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={builderState.category}
                            onChange={(e) => setBuilderState(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="lead_nurturing">Lead Nurturing</option>
                            <option value="retention">Retention</option>
                            <option value="lead_routing">Lead Routing</option>
                            <option value="onboarding">Onboarding</option>
                            <option value="re_engagement">Re-engagement</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <select
                            value={builderState.priority}
                            onChange={(e) => setBuilderState(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={builderState.description}
                          onChange={(e) => setBuilderState(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe what this workflow does and when it should be used..."
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trigger Configuration Section */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-purple-600 rounded-lg mr-3">
                        <ApperIcon name="Zap" size={20} className="text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-purple-900">Trigger Configuration</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trigger Type
                        </label>
                        <select
                          value={builderState.trigger.type}
                          onChange={(e) => setBuilderState(prev => ({ 
                            ...prev, 
                            trigger: { ...prev.trigger, type: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {triggerTypes.map(trigger => (
                            <option key={trigger.type} value={trigger.type}>
                              {trigger.label} - {trigger.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Condition Type
                          </label>
                          <select
                            value={builderState.trigger.condition}
                            onChange={(e) => setBuilderState(prev => ({ 
                              ...prev, 
                              trigger: { ...prev.trigger, condition: e.target.value, value: '' }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Value
                          </label>
                          {getValueOptions(builderState.trigger.type, builderState.trigger.condition).length > 0 ? (
                            <select
                              value={builderState.trigger.value}
                              onChange={(e) => setBuilderState(prev => ({ 
                                ...prev, 
                                trigger: { ...prev.trigger, value: e.target.value }
                              }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority Level
                          </label>
                          <select
                            value={builderState.trigger.priority || 'medium'}
                            onChange={(e) => setBuilderState(prev => ({ 
                              ...prev, 
                              trigger: { ...prev.trigger, priority: e.target.value }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

                  {/* Actions Configuration Section */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-600 rounded-lg mr-3">
                          <ApperIcon name="Play" size={20} className="text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-green-900">Actions Configuration</h3>
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
                        className="flex items-center gap-2"
                      >
                        <ApperIcon name="Plus" size={16} />
                        Add Action
                      </Button>
                    </div>
                    
                    {builderState.actions.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-green-300 rounded-lg">
                        <ApperIcon name="Play" size={48} className="text-green-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-green-800 mb-2">No Actions Yet</h4>
                        <p className="text-green-600 mb-4">Add actions to define what happens when this workflow triggers</p>
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
                        >
                          <ApperIcon name="Plus" size={16} className="mr-2" />
                          Add First Action
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {builderState.actions.map((action, index) => (
                          <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                  {index + 1}
                                </div>
                                <span className="font-medium text-green-900">Action {index + 1}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setBuilderState(prev => ({
                                    ...prev,
                                    actions: prev.actions.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Remove action"
                              >
                                <ApperIcon name="Trash2" size={16} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Action Type
                                </label>
                                <select
                                  value={action.type}
                                  onChange={(e) => {
                                    const newActions = [...builderState.actions];
                                    newActions[index].type = e.target.value;
                                    setBuilderState(prev => ({ ...prev, actions: newActions }));
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                  {actionTypes.map(actionType => (
                                    <option key={actionType.type} value={actionType.type}>
                                      {actionType.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tags Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-gray-600 rounded-lg mr-3">
                        <ApperIcon name="Tag" size={20} className="text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add tags to organize and categorize this workflow
                      </label>
                      <input
                        type="text"
                        placeholder="Enter tags separated by commas..."
                        value={builderState.tags.join(', ')}
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                          setBuilderState(prev => ({ ...prev, tags }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      {builderState.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {builderState.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-800"
                            >
                              {tag}
                              <button
                                onClick={() => {
                                  setBuilderState(prev => ({
                                    ...prev,
                                    tags: prev.tags.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="ml-2 text-gray-500 hover:text-gray-700"
                              >
                                <ApperIcon name="X" size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer with Cancel and Save Buttons */}
              <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-lg px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {currentWorkflow ? 'Editing existing workflow' : 'Creating new workflow'}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setIsBuilderOpen(false)}
                      variant="outline"
                      className="px-6 py-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        // TODO: Implement save workflow functionality
                        console.log('Saving workflow:', builderState);
                        
                        if (currentWorkflow) {
                          // Update existing workflow
                          const updatedWorkflows = workflows.map(w => 
                            w.Id === currentWorkflow.Id 
                              ? { ...w, ...builderState, lastRun: new Date().toISOString() }
                              : w
                          );
                          setWorkflows(updatedWorkflows);
                        } else {
                          // Create new workflow
                          const newWorkflow = {
                            Id: workflows.length + 1,
                            ...builderState,
                            isActive: true,
                            executions: 0,
                            successRate: 0,
                            lastRun: null,
                            createdBy: 'Current User',
                            createdAt: new Date().toISOString()
                          };
                          setWorkflows([...workflows, newWorkflow]);
                        }
                        
                        setIsBuilderOpen(false);
                      }}
                      variant="primary"
                      className="px-6 py-2"
                      disabled={!builderState.name || !builderState.description}
                    >
                      <ApperIcon name="Save" size={16} className="mr-2" />
                      {currentWorkflow ? 'Update Workflow' : 'Create Workflow'}
                    </Button>
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