import React from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AzureLoginButton = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async () => {
    try {
      const loginResponse = await instance.loginPopup({
        scopes: ["openid", "profile", "email"],
      });
      const idToken = loginResponse.idToken;

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/azure-protected`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        navigate(`/${data.user.role}`);
      } else {
        alert("Access denied: You are not authorized.");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
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
