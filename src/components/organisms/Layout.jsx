import Sidebar from "@/components/organisms/Sidebar";

const Layout = ({ children }) => {
  return (
<div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="lg:ml-60">
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;