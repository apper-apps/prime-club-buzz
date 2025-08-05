import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Sidebar from "@/components/organisms/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
const Layout = ({ children }) => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Sidebar />
      
{/* Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-1/2 -translate-y-1/2 z-50 p-3 bg-white shadow-xl border border-gray-200 rounded-full hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 ${
          isCollapsed 
            ? 'left-20 lg:left-20' 
            : 'left-64 lg:left-64'
        }`}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <ApperIcon 
          name={isCollapsed ? "ChevronRight" : "ChevronLeft"} 
          size={18} 
          className="text-gray-600" 
        />
      </button>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;