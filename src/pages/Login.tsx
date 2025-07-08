import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AzureLoginButton from "../components/AzureLoginButton";
import { Shield, CheckCircle, Users, Settings } from "lucide-react";

const Login = () => {
  const { user, isLoading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (!isLoading && user && user.role) {
      timeout = setTimeout(() => {
        navigate(`/${user.role}`, { replace: true });
      }, 2000); // 2 seconds delay
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (error) {
      console.error("Auth error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* Left Side - Branding & Info */}
            <div className="hidden lg:block space-y-8 animate-slide-in-left">
              <div className="text-center lg:text-left">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg"
                  alt="SLT Mobitel"
                  className="h-20 mx-auto lg:mx-0 mb-8 animate-float"
                />
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Tire Management System
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Streamline your fleet tire management with our comprehensive digital solution
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Secure Access</h3>
                    <p className="text-gray-600">Enterprise-grade security with Microsoft Azure AD integration</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Role-Based Access</h3>
                    <p className="text-gray-600">Customized dashboards for different user roles and responsibilities</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Approval Workflow</h3>
                    <p className="text-gray-600">Streamlined approval process from request to order placement</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Settings className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Fleet Management</h3>
                    <p className="text-gray-600">Complete vehicle and tire inventory management solution</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto animate-slide-in-right">
              <div className="relative">
                {/* Glassmorphism background effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 animate-pulse"></div>

                <div className="relative bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/20 hover:shadow-3xl transition-all duration-500">
                  <div className="text-center space-y-6">

                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-6">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg"
                        alt="SLT Mobitel"
                        className="h-16 mx-auto mb-4"
                      />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-gray-900">
                        Welcome Back
                      </h2>
                      <p className="text-gray-600">
                        Sign in to access your dashboard
                      </p>
                    </div>

                    <div className="space-y-6">
                      <AzureLoginButton />

                      <div className="text-center">
                        <p className="text-sm text-gray-500">
                          Use your Microsoft account to securely access the system
                        </p>
                      </div>

                      {/* Status Messages */}
                      {isLoading && (
                        <div className="flex items-center justify-center space-x-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Authenticating...</span>
                        </div>
                      )}

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 text-red-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Authentication Error</span>
                          </div>
                          <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                      )}

                      {user && user.role && !isLoading && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Login Successful!</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">Redirecting to your dashboard...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-8 text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Contact our support team for assistance
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span>1717 (24x7)</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>support@mobitel.lk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
