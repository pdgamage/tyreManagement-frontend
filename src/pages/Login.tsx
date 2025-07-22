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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-3xl animate-breathe animate-morph"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-3xl animate-breathe animate-morph" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-3xl animate-breathe animate-morph" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 animate-rotate-glow"></div>

        {/* Decorative tire SVG elements */}
        <div className="absolute bottom-10 left-10 opacity-10 animate-float hidden lg:block">
          <svg
            className="h-32 w-32 text-blue-300"
            style={{animationDelay: '0.5s'}}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="4"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="50" cy="50" r="8" fill="currentColor"/>
            {/* Tire tread pattern */}
            <g stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M20 50 L30 45 L30 55 Z"/>
              <path d="M70 50 L80 45 L80 55 Z"/>
              <path d="M50 20 L45 30 L55 30 Z"/>
              <path d="M50 80 L45 70 L55 70 Z"/>
            </g>
          </svg>
        </div>
        <div className="absolute top-20 right-20 opacity-10 animate-float hidden lg:block">
          <svg
            className="h-24 w-24 text-purple-300"
            style={{animationDelay: '1.5s'}}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6"/>
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="3"/>
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="50" cy="50" r="6" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-4 py-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="w-full max-w-6xl h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">

            {/* Left Side - Branding & Info */}
            <div className="hidden lg:block space-y-6 animate-slide-in-up">
              <div className="text-center lg:text-left">
                <div className="mb-6 flex items-center justify-center lg:justify-start space-x-4">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg"
                    alt="SLT Mobitel"
                    className="h-16 animate-float"
                  />
                  <div className="hidden lg:block">
                    <svg
                      className="h-12 w-12 text-blue-400 animate-pulse opacity-60"
                      viewBox="0 0 100 100"
                      fill="currentColor"
                    >
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6"/>
                      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="3"/>
                      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="50" cy="50" r="10" fill="currentColor"/>
                      {/* Tire spokes */}
                      <g stroke="currentColor" strokeWidth="1" fill="none">
                        <line x1="50" y1="20" x2="50" y2="35"/>
                        <line x1="50" y1="65" x2="50" y2="80"/>
                        <line x1="20" y1="50" x2="35" y2="50"/>
                        <line x1="65" y1="50" x2="80" y2="50"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  Tire Management
                  <span className="block text-blue-300">System</span>
                </h1>
                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  Streamline your fleet tire management with our comprehensive digital solution
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Secure Access</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">Enterprise-grade security with Microsoft Azure AD integration</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Role-Based Access</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">Customized dashboards for different user roles</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Approval Workflow</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">Streamlined approval process from request to order</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Fleet Management</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">Complete vehicle and tire inventory management</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto animate-scale-in">
              <div className="relative">
                {/* Enhanced glassmorphism background effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl"></div>

                <div className="relative bg-white/95 backdrop-blur-2xl shadow-2xl rounded-2xl p-8 border border-white/30 hover:shadow-3xl transition-all duration-500">
                  <div className="text-center space-y-6">

                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-6">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <svg
                          className="h-8 w-8 text-blue-400 opacity-60"
                          viewBox="0 0 100 100"
                          fill="currentColor"
                        >
                          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="8"/>
                          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="4"/>
                          <circle cx="50" cy="50" r="8" fill="currentColor"/>
                        </svg>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/e/ed/SLTMobitel_Logo.svg"
                          alt="SLT Mobitel"
                          className="h-12"
                        />
                        <svg
                          className="h-8 w-8 text-blue-400 opacity-60"
                          viewBox="0 0 100 100"
                          fill="currentColor"
                        >
                          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="8"/>
                          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="4"/>
                          <circle cx="50" cy="50" r="8" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                        Welcome Back
                      </h2>
                      <p className="text-gray-600">
                        Sign in to access your dashboard
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <AzureLoginButton />
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <Shield className="w-4 h-4" />
                          <span>Secured by Microsoft Azure AD</span>
                        </div>
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
              <div className="mt-6 text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Contact our support team
                  </p>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center justify-center space-x-2 text-gray-700 bg-gray-50 rounded-lg p-2">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span className="font-medium">1717 (24x7)</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-700 bg-gray-50 rounded-lg p-2">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="font-medium">support@mobitel.lk</span>
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
