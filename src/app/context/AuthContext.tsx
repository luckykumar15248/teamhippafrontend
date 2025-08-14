"use client";
import { useRouter } from "next/navigation";
import React, { createContext, useEffect, useState, ReactNode } from "react";

interface User {
  roleName: "ADMIN" | "VISITOR_REGISTERED" | string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  [key: string]: string | number | boolean | undefined;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  setIsLoggedIn: () => {},
  setUser: () => {},
  logout: () => {},
});


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  
 const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  setIsLoggedIn(false);
  setUser(null);
  router.push("/login"); 
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setIsLoggedIn, setUser, logout}}>
      {children}
    </AuthContext.Provider>
  );
};
