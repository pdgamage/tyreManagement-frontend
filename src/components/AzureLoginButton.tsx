import { useMsal } from "@azure/msal-react";

const AzureLoginButton = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="group relative w-full flex items-center justify-center px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
    >
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Microsoft Logo */}
      <span className="relative z-10 mr-3">
        <svg
          className="w-6 h-6"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 0H21V10H10V0Z" fill="#F25022" />
          <path d="M0 0H10V10H0V0Z" fill="#7FBA00" />
          <path d="M10 11H21V21H10V11Z" fill="#00A4EF" />
          <path d="M0 11H10V21H0V11Z" fill="#FFB900" />
        </svg>
      </span>

      {/* Button Text */}
      <span className="relative z-10 flex items-center">
        Sign in with Microsoft
        <svg
          className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </span>

      {/* Shine effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </button>
  );
};

export default AzureLoginButton;
