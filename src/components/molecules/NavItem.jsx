import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const NavItem = ({ to, icon, label, isCollapsed = false }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center px-4 py-3 transition-all duration-200 group relative font-sans
        ${isActive 
          ? "bg-sidebar-active text-white rounded-tl-none rounded-tr-lg rounded-bl-lg rounded-br-lg" 
          : "text-sidebar-inactive hover:bg-sidebar-hover hover:text-white rounded-lg"
        }
      `}
    >
      {({ isActive }) => (
        <>
          <ApperIcon 
            name={icon} 
            size={18} 
            className={`shrink-0 ${isActive ? "text-white" : "text-sidebar-inactive group-hover:text-white"}`} 
          />
          {!isCollapsed && (
            <span className="ml-2 text-sm font-medium leading-5">{label}</span>
          )}
        </>
      )}
    </NavLink>
  );
};

export default NavItem;