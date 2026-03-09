import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "user" | "company";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  createdAt: string;
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
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

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem("hydrex-user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        localStorage.removeItem("hydrex-user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const users = getStoredUsers();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      setUser(foundUser.user);
      localStorage.setItem("hydrex-user", JSON.stringify(foundUser.user));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hydrex-user");
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = getStoredUsers();
    
    // Check if email already exists
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      setIsLoading(false);
      return false;
    }

    // Create new user
    const newUser: User = {
      id: String(Date.now()),
      name,
      email,
      role,
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Add to users list
    const newStoredUser: StoredUser = {
      email,
      password,
      user: newUser,
    };

    users.push(newStoredUser);
    saveUsers(users);

    // Auto login after registration
    setUser(newUser);
    localStorage.setItem("hydrex-user", JSON.stringify(newUser));
    setIsLoading(false);
    return true;
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
