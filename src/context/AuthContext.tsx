import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "user" | "company" | "individual" | "vvb";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  createdAt: string;
  preferences?: {
    email: boolean;
    push: boolean;
    transaction: boolean;
    newsletter: boolean;
  };
}

interface StoredUser {
  email: string;
  password: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole, company?: string, phone?: string, address?: string, country?: string) => Promise<{ success: boolean; message: string }>;
  updatePreferences: (preferences: Partial<User["preferences"]>) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  deleteAccount: () => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Default demo users
const defaultUsers: StoredUser[] = [
  {
    email: "admin@hydrex.id",
    password: "admin123",
    user: {
      id: "1",
      name: "Admin HYDREX",
      email: "admin@hydrex.id",
      role: "admin",
      createdAt: "2024-01-01",
    },
  },
  {
    email: "user@example.com",
    password: "user123",
    user: {
      id: "2",
      name: "John Doe",
      email: "user@example.com",
      role: "user",
      createdAt: "2024-01-15",
    },
  },
  {
    email: "company@example.com",
    password: "company123",
    user: {
      id: "3",
      name: "PT Green Energy",
      email: "company@example.com",
      role: "company",
      company: "PT Green Energy Indonesia",
      createdAt: "2024-02-01",
    },
  },
];

// Get users from localStorage or use defaults
const getStoredUsers = (): StoredUser[] => {
  if (typeof window === "undefined") return defaultUsers;

  const stored = localStorage.getItem("hydrex-users");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultUsers;
    }
  }

  // Initialize with default users
  localStorage.setItem("hydrex-users", JSON.stringify(defaultUsers));
  return defaultUsers;
};

// Save users to localStorage
const saveUsers = (users: StoredUser[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("hydrex-users", JSON.stringify(users));
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use Vite env variable or fallback
  const API_URL = (import.meta as any).env.VITE_API_URL || "https://hydrex.vercel.app";


  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("hydrex-token");
        if (token) {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.data.user);
          } else {
            localStorage.removeItem("hydrex-token");
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [API_URL]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("hydrex-token", data.data.token);
        setUser(data.data.user);
      }
      return { success: data.success, message: data.message };
    } catch (err) {
      return { success: false, message: "Terjadi kesalahan koneksi" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hydrex-token");
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    company?: string,
    phone?: string,
    address?: string,
    country?: string
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, company, phone, address, country }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: "Terjadi kesalahan jaringan" };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<User["preferences"]>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("hydrex-token");
      const res = await fetch(`${API_URL}/api/auth/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });
      const data = await res.json();
      if (data.success && user) {
        // Optimistically update local user state
        setUser({ ...user, preferences: data.data.preferences });
      }
      return { success: data.success, message: data.message };
    } catch (err) {
      return { success: false, message: "Terjadi kesalahan jaringan" };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("hydrex-token");
      const res = await fetch(`${API_URL}/api/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (err) {
      return { success: false, message: "Terjadi kesalahan jaringan" };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("hydrex-token");
      const res = await fetch(`${API_URL}/api/auth/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        logout();
      }
      return { success: data.success, message: data.message };
    } catch (err) {
      return { success: false, message: "Terjadi kesalahan jaringan" };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updatePreferences,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
