import Sidebar from "@/components/organisms/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
const Layout = ({ children }) => {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
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