import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LockKeyhole } from 'lucide-react';
import { LogOutIcon, PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react';
import Navigation from './Navigation';
interface LayoutProps {
  children: ReactNode;
}
const Layout = ({
  children
}: LayoutProps) => {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return <div className="flex flex-col min-h-screen bg-gray-50">
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
                <LockKeyhole className="w-5 h-5" /> {/* Icon */}
                <span>Management Login</span>        {/* Text */}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
    <header className="bg-white border-b">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg" alt="SLT Mobitel" className="h-12" />


            </Link>
          </div>
          {user && <button onClick={handleLogout} className="flex items-center px-4 py-2 text-white transition-colors bg-red-600 rounded hover:bg-red-700">
            <LogOutIcon size={16} className="mr-2" />
            Logout
          </button>}
        </div>
      </div>
    </header>
    <Navigation />
    <main className="container flex-grow px-4 py-8 mx-auto">{children}</main>
    <footer className="py-12 text-white bg-gray-900">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <img src="https://www.mobitel.lk/sites/default/files/mobitel-logo.png" alt="SLT Mobitel" className="h-12 mb-4" />
            <p className="text-gray-400">
              Sri Lanka's National Mobile Service Provider
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/vehicle-registration" className="transition-colors hover:text-white">
                  Vehicle Registration
                </Link>
              </li>
              <li>
                <Link to="/user" className="transition-colors hover:text-white">
                  Tire Requests
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-white">
                  Register
                </Link>
              </li>
              <li>
                <a href="#support" className="transition-colors hover:text-white">
                  Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <PhoneIcon size={16} className="mr-2" />
                1717 (24x7)
              </li>
              <li className="flex items-center">
                <MailIcon size={16} className="mr-2" />
                support@mobitel.lk
              </li>
              <li className="flex items-center">
                <MapPinIcon size={16} className="mr-2" />
                Mobitel Head Office, Colombo 01
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Working Hours</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
              <li>Saturday: 9:00 AM - 1:00 PM</li>
              <li>Sunday: Closed</li>
              <li>Support: 24/7</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 text-center text-gray-400 border-t border-gray-800">
          <p>
            © {new Date().getFullYear()} SLT Mobitel - Tire Management
            System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>;
};
export default Layout;