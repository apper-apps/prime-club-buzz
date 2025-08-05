import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, BarChart3, TrendingUp, Globe, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';

const WebsiteUrlReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call - replace with actual service call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const mockReports = [
          {
            id: 1,
            url: 'https://example.com',
            status: 'active',
            lastChecked: new Date().toISOString(),
            responseTime: 245,
            uptime: 99.8,
            issues: 0
          },
          {
            id: 2,
            url: 'https://demo.website.com',
            status: 'warning',
            lastChecked: new Date(Date.now() - 3600000).toISOString(),
            responseTime: 1245,
            uptime: 95.2,
            issues: 2
          },
          {
            id: 3,
            url: 'https://test.portal.com',
            status: 'error',
            lastChecked: new Date(Date.now() - 7200000).toISOString(),
            responseTime: null,
            uptime: 87.5,
            issues: 5
          }
        ];
        
        setReports(mockReports);
      } catch (err) {
        setError(err.message || 'Failed to load website reports');
        console.error('Website reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error-500" />;
      default:
        return <Clock className="w-5 h-5 text-surface-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'warning':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'error':
        return 'bg-error-100 text-error-800 border-error-200';
      default:
        return 'bg-surface-100 text-surface-800 border-surface-200';
    }
  };

  const formatResponseTime = (time) => {
    if (!time) return 'N/A';
    return `${time}ms`;
  };

  const formatUptime = (uptime) => {
    return `${uptime}%`;
  };

  const handleRefreshReport = async (reportId) => {
    try {
      setLoading(true);
      // Simulate refresh API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the specific report
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, lastChecked: new Date().toISOString() }
          : report
      ));
    } catch (err) {
      setError('Failed to refresh report');
    } finally {
      setLoading(false);
    }
  };

  if (loading && reports.length === 0) {
    return <Loading message="Loading website reports..." />;
  }

  if (error && reports.length === 0) {
    return (
      <Error 
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!loading && reports.length === 0) {
    return (
      <Empty 
        message="No website reports found"
        description="Add websites to monitor their performance and status"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary-500" />
            Website URL Reports
          </h1>
          <p className="text-text-secondary mt-1">
            Monitor website performance and uptime status
          </p>
        </div>
        <Button 
          variant="primary"
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto"
        >
          Refresh All Reports
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Websites</p>
              <p className="text-2xl font-semibold text-text-primary mt-1">
                {reports.length}
              </p>
            </div>
            <Globe className="w-8 h-8 text-primary-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Active Sites</p>
              <p className="text-2xl font-semibold text-success-600 mt-1">
                {reports.filter(r => r.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Issues Found</p>
              <p className="text-2xl font-semibold text-error-600 mt-1">
                {reports.reduce((sum, r) => sum + r.issues, 0)}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-error-500" />
          </div>
        </Card>
      </div>

      {/* Reports Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border-light">
          <h2 className="text-lg font-medium text-text-primary flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            Website Status Reports
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">
                  Website URL
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">
                  Status
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">
                  Response Time
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">
                  Uptime
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">
                  Issues
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">
                  Last Checked
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-surface-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-text-tertiary" />
                      <a 
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {report.url}
                      </a>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-primary">
                    {formatResponseTime(report.responseTime)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary">{formatUptime(report.uptime)}</span>
                      <TrendingUp className="w-4 h-4 text-success-500" />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`font-medium ${report.issues > 0 ? 'text-error-600' : 'text-success-600'}`}>
                      {report.issues}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-text-secondary text-sm">
                    {new Date(report.lastChecked).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefreshReport(report.id)}
                      disabled={loading}
                    >
                      Refresh
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-error-500" />
            <span className="text-error-700">{error}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WebsiteUrlReport;