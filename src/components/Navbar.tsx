import React from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, LogOutIcon, PhoneIcon, MailIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  
  return (
    <>
      {/* Top info bar */}
      <div className="py-2 text-white bg-blue-900">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <PhoneIcon size={16} className="mr-2" />
                <span>1717 (24x7)</span>
              </div>
              <div className="flex items-center">
                <MailIcon size={16} className="mr-2" />
                <span>support@mobitel.lk</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!user && (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 transition-colors hover:text-blue-200"
                >
                  <LockKeyhole className="w-5 h-5" />
                  <span>Management Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white border-b">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg" 
                  alt="SLT Mobitel" 
                  className="h-12" 
                />
              </Link>
            </div>
            {user && (
              <button 
                onClick={logout} 
                className="flex items-center px-4 py-2 text-white transition-colors bg-red-600 rounded hover:bg-red-700"
              >
                <LogOutIcon size={16} className="mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;