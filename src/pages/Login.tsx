import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import AzureLoginButton from "../components/AzureLoginButton";

const Login = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={`/${user.role}`} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="xl:mx-auto xl:w-full xl:max-w-sm 2xl:max-w-md">
          <div className="relative">
            <div className="absolute -inset-1">
              <div className="w-full h-full mx-auto opacity-30 blur-lg filter bg-gradient-to-r from-blue-500 to-purple-500"></div>
            </div>
            <div className="relative bg-white shadow-xl rounded-2xl p-8">
              <div className="text-center space-y-6">
                {/* Logo */}
                <div className="mb-8">
                  <svg
                    className="w-16 h-16 mx-auto text-blue-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12Z"
                    />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold leading-tight text-black">
                  Welcome Back
                </h2>
                <p className="mt-2 text-base text-gray-600">
                  SLT Mobitel Tire Management System
                </p>

                <div className="mt-8 space-y-4">
                  <AzureLoginButton />
                  <p className="text-sm text-gray-500">
                    Use your Microsoft account to securely access the system
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
