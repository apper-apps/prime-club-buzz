import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Sidebar from "@/components/organisms/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
const Layout = ({ children }) => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  return (
<div className="min-h-screen bg-surface-50 relative font-sans">
      <Sidebar />
      
      {/* Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-1/2 -translate-y-1/2 z-50 p-3 bg-white shadow-lg border border-border-default rounded-xl hover:bg-surface-50 hover:shadow-xl hover:border-primary-200 transition-all duration-300 group ${
          isCollapsed 
            ? 'left-20 lg:left-20' 
            : 'left-64 lg:left-64'
        }`}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <ApperIcon 
          name={isCollapsed ? "ChevronRight" : "ChevronLeft"} 
          size={18} 
          className="text-text-secondary group-hover:text-primary-600 transition-colors" 
        />
      </button>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <main className="p-6 lg:p-8 bg-surface-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;