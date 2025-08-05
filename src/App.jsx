import { Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import React, { Component } from 'react';
import Layout from '@/components/organisms/Layout';
import { SidebarProvider } from '@/contexts/SidebarContext';
import Error from '@/components/ui/Error';
import Pipeline from '@/components/pages/Pipeline';
import Leaderboard from '@/components/pages/Leaderboard';
import Hotlist from '@/components/pages/Hotlist';
import Analytics from '@/components/pages/Analytics';
import WebsiteUrlReport from '@/components/pages/WebsiteUrlReport';
import WorkflowAutomationSystem from '@/components/pages/WorkflowAutomationSystem';
import Dashboard from '@/components/pages/Dashboard';
import Leads from '@/components/pages/Leads';
import Calendar from '@/components/pages/Calendar';
import Teams from '@/components/pages/Teams';
import Contacts from '@/components/pages/Contacts';
import CustomColumns from '@/components/pages/CustomColumns';
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
componentDidCatch(error, errorInfo) {
    // Enhanced error logging for better debugging
    console.error('Error caught by boundary:', {
      message: error?.message || String(error),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    });
    
    // Log specific error details for data.filter errors
    if (error?.message && error.message.includes('filter is not a function')) {
      console.error('Data type error detected - likely received object instead of array');
    }
  }

  render() {
    if (this.state.hasError) {
      // Properly serialize error message to prevent "[object Object]" display
      let errorMessage = "Something went wrong";
      
      const error = this.state.error;
      if (error) {
        if (typeof error === 'string') {
          errorMessage = `Application Error: ${error}`;
        } else if (error instanceof Error) {
          errorMessage = `Application Error: ${error.message || error.toString()}`;
        } else if (error?.message) {
          errorMessage = `Application Error: ${error.message}`;
        } else {
          // Handle cases where error is an object without message property
          errorMessage = `Application Error: ${JSON.stringify(error, null, 2).substring(0, 200)}`;
        }
      }
      
      return <Error message={errorMessage} />;
    }

    return this.props.children;
  }
}

const MainApp = () => {
  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

return (
    <div className="font-sans antialiased">
      <SidebarProvider>
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route 
                path="/" 
                element={
                  <motion.div {...pageTransition}>
                    <Dashboard />
                  </motion.div>
                } 
              />
              <Route 
                path="/leads" 
                element={
                  <motion.div {...pageTransition}>
                    <Leads />
                  </motion.div>
                } 
              />
              <Route 
                path="/leads/custom-columns" 
                element={
                  <motion.div {...pageTransition}>
                    <CustomColumns />
                  </motion.div>
                } 
              />
              <Route
                path="/hotlist" 
                element={
                  <motion.div {...pageTransition}>
                    <Hotlist />
                  </motion.div>
                } 
              />
              <Route 
                path="/pipeline" 
                element={
                  <motion.div {...pageTransition}>
                    <Pipeline />
                  </motion.div>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <motion.div {...pageTransition}>
                    <Analytics />
                  </motion.div>
                } 
              />
              <Route 
                path="/calendar" 
                element={
                  <motion.div {...pageTransition}>
                    <Calendar />
                  </motion.div>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <motion.div {...pageTransition}>
                    <Leaderboard />
                  </motion.div>
                } 
              />
              <Route 
                path="/workflow-automation" 
                element={
                  <motion.div {...pageTransition}>
                    <WorkflowAutomationSystem />
                  </motion.div>
                } 
              />
              <Route 
                path="/teams" 
                element={
                  <motion.div {...pageTransition}>
                    <Teams />
                  </motion.div>
                } 
              />
              <Route 
                path="/contacts" 
                element={
                  <motion.div {...pageTransition}>
                    <Contacts />
                  </motion.div>
                } 
              />
              <Route 
                path="/website-url-report" 
                element={
                  <motion.div {...pageTransition}>
                    <WebsiteUrlReport />
                  </motion.div>
                } 
              />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </SidebarProvider>
    </div>
  );
};

export default MainApp;