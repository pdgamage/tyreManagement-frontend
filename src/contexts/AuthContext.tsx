import React, { useState, createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (role: Role, username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (role: Role, data: RegisterData) => Promise<void>;
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

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing session on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would verify the session with your backend
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        localStorage.removeItem("user");
        setError("Session validation failed");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (role: Role, username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!username || !password) {
        throw new Error("Username and password are required");
      }

      // In a real app, this would validate with a backend
      const userData = {
        id: `${role}-${Date.now()}`,
        name: username,
        role,
        email: `${username}@example.com`, // Mock email
        department: role === "engineer" ? "Engineering" : "Operations", // Mock department
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // Navigate to role-specific dashboard
      navigate(`/${role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (role: Role, data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!data.username || !data.password || !data.email) {
        throw new Error("Required fields are missing");
      }

      // In a real app, this would send the registration data to a backend
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
    navigate("/login");
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
