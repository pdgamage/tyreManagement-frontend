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
      className="relative inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
    >
      <span className="absolute left-4">
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
      Sign in with Microsoft
    </button>
  );
};

export default AzureLoginButton;
