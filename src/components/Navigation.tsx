import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HomeIcon, ClipboardListIcon, TruckIcon, BarChart3Icon, UserIcon, Settings2Icon } from 'lucide-react';
const Navigation = () => {
  const {
    user
  } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const NavLink = ({
    to,
    icon,
    children,
    requiresAuth = true
  }: {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    requiresAuth?: boolean;
  }) => <Link to={to} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive(to) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-50'} ${!requiresAuth ? 'border-2 border-blue-200' : ''}`}>
      {icon}
      <span>{children}</span>
    </Link>;
  const renderRoleSpecificLinks = () => {
    // For regular users (no login required)
    if (!user) {
      return <>
          <NavLink to="/user" icon={<ClipboardListIcon size={20} />} requiresAuth={false}>
            Submit Request
          </NavLink>
          <NavLink to="/vehicle-registration" icon={<TruckIcon size={20} />} requiresAuth={false}>
            Register Vehicle
          </NavLink>
        </>;
    }
    // For authenticated roles
    switch (user.role) {
      case 'supervisor':
        return <>
            <NavLink to="/supervisor" icon={<ClipboardListIcon size={20} />}>
              Requests
            </NavLink>
            <NavLink to="/supervisor/reports" icon={<BarChart3Icon size={20} />}>
              Reports
            </NavLink>
          </>;
      case 'technical-manager':
        return <>
            <NavLink to="/technical-manager" icon={<ClipboardListIcon size={20} />}>
              Technical Review
            </NavLink>
            <NavLink to="/technical-manager/inventory" icon={<BarChart3Icon size={20} />}>
              Inventory
            </NavLink>
          </>;
      case 'engineer':
        return <>
            <NavLink to="/engineer" icon={<ClipboardListIcon size={20} />}>
              Engineering Review
            </NavLink>
            <NavLink to="/engineer/specifications" icon={<Settings2Icon size={20} />}>
              Specifications
            </NavLink>
          </>;
      case 'customer-officer':
        return <>
            <NavLink to="/customer-officer" icon={<ClipboardListIcon size={20} />}>
              Orders
            </NavLink>
            <NavLink to="/customer-officer/stock" icon={<BarChart3Icon size={20} />}>
              Stock Management
            </NavLink>
          </>;
      default:
        return <>
            <NavLink to="/user" icon={<ClipboardListIcon size={20} />} requiresAuth={false}>
              My Requests
            </NavLink>
            <NavLink to="/vehicle-registration" icon={<TruckIcon size={20} />} requiresAuth={false}>
              Register Vehicle
            </NavLink>
          </>;
    }
  };
  return <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-8 h-16">
          <NavLink to="/" icon={<HomeIcon size={20} />} requiresAuth={false}>
            Home
          </NavLink>
          {renderRoleSpecificLinks()}
          {user && <div className="ml-auto flex items-center space-x-4">
              <span className="flex items-center space-x-2 text-gray-600">
                <UserIcon size={20} />
                <span>{user.name}</span>
              </span>
              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {user.role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            </div>}
        </div>
      </div>
    </nav>;
};
export default Navigation;