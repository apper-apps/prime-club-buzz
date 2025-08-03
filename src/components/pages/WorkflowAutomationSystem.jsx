import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflows</h2>
              <p className="text-gray-600">Workflow management interface will be implemented here.</p>
            </div>
          )}
          
          {activeTab === 'execution-history' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Execution History</h2>
              <p className="text-gray-600">Workflow execution history will be displayed here.</p>
            </div>
          )}
          
          {activeTab === 'lead-scoring' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Scoring</h2>
              <p className="text-gray-600">Lead scoring configuration and metrics will be shown here.</p>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
              <p className="text-gray-600">Workflow analytics and performance metrics will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowAutomationSystem;