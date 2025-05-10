
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";

export type UserRole = 'admin' | 'reporter' | 'coordinator' | 'viewer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, organization: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: Record<string, User> = {
  "admin@demo.pl": { 
    id: "1", 
    name: "Administrator", 
    email: "admin@demo.pl", 
    role: "admin", 
    organization: "Główny Urząd"
  },
  "reporter@demo.pl": { 
    id: "2", 
    name: "Jan Kowalski", 
    email: "reporter@demo.pl", 
    role: "reporter", 
    organization: "Straż Pożarna"
  },
  "coordinator@demo.pl": { 
    id: "3", 
    name: "Anna Nowak", 
    email: "coordinator@demo.pl", 
    role: "coordinator", 
    organization: "Czerwony Krzyż"
  },
  "viewer@demo.pl": { 
    id: "4", 
    name: "Tomasz Wiśniewski", 
    email: "viewer@demo.pl", 
    role: "viewer", 
    organization: "Urząd Miasta"
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string, organization: string): Promise<void> => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const lowercaseEmail = email.toLowerCase();
      
      // Check if user exists in our mock data
      if (MOCK_USERS[lowercaseEmail]) {
        const user = MOCK_USERS[lowercaseEmail];
        
        // In a real app, we would validate the password here
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        toast.success("Zalogowano pomyślnie");
      } else {
        toast.error("Niepoprawne dane logowania");
        throw new Error("Invalid credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info("Wylogowano pomyślnie");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
