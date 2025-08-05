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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Error message="Something went wrong" />;
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
  );
};

export default MainApp;