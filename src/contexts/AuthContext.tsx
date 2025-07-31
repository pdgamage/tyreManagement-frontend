import React, { useState, createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { AccountInfo } from "@azure/msal-browser";

type Role =
  | "user"
  | "supervisor"
  | "technical-manager"
  | "engineer"
  | "customer-officer";

interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
  costCentre?: string;
  department?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  department: string;
  employeeId: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  error: string | null;
  login: (role: Role, username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  isAuthorized: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();

  // Fetch user info from backend when authenticated
  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && accounts.length > 0 && !user) {
        setIsLoading(true);
        try {
          const request = {
            account: accounts[0] as AccountInfo,
            scopes: ["openid", "profile", "email"],
          };
          const response = await instance.acquireTokenSilent(request);
          const idToken = response.idToken;

          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/azure-protected`,
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
            // Do NOT navigate here
          } else {
            setError("Access denied: You are not authorized.");
          }
        } catch (err) {
          setError("Failed to fetch user info");
          console.error("AuthProvider fetchUser error:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchUser();
    // eslint-disable-next-line
  }, [isAuthenticated, accounts, instance, user, navigate]);

  const login = async (role: Role, username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!username || !password) {
        throw new Error("Username and password are required");
      }
      const userData = {
        id: `${role}-${Date.now()}`,
        name: username,
        role,
        email: `${username}@example.com`,
        department: role === "engineer" ? "Engineering" : "Operations",
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate(`/${role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!data.username || !data.password || !data.email) {
        throw new Error("Required fields are missing");
      }
      // Mock successful registration
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    instance.logoutRedirect({ postLogoutRedirectUri: "/login" });
  };

  const isAuthorized = (allowedRoles: Role[]) => {
    return user ? allowedRoles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        error,
        login,
        logout,
        register,
        isAuthorized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
