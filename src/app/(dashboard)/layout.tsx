"use client";

import React, { useState, useEffect, useContext } from "react";
import { default as NextLink } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

// A more realistic auth hook that reads from localStorage.
const useAuth = () => {
  const [user, setUser] = useState<{ name: string; roleName: string } | null>(
    null
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setIsLoggedIn } = useContext(AuthContext);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("authToken");
        const userDataString = localStorage.getItem("userData");

        if (token && userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      setIsLoggedIn(false);
      router.push("/login");
    }
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  return { isAuthenticated, user, isLoading, logout };
};

// --- Sidebar Component ---
const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const commonLinks = [{ href: "/dashboard", label: "Dashboard", icon: "🏠" }];

  const adminLinks = [
    { href: "/admin/bookings", label: "Manage Bookings", icon: "📚" },
    { href: "/admin/booking-calendar", label: "Booking Calender", icon: "🛠️" },
    { href: "/admin/manage-user-packages", label: "Manage Users Package", icon: "👥" },
    { href: "/admin/analytics", label: "Analytics", icon: "📊" },
    { href: "/admin/waitlist", label: "Waitlist", icon: "📊" },
  ];

  const userLinks = [
    { href: "/my-account", label: "My Bookings", icon: "📅" },
    { href: "/my-profile", label: "My Profile", icon: "👤" },
  ];

  const linksToShow =
    user?.roleName === "ADMIN"
      ? [...commonLinks, ...adminLinks]
      : [...commonLinks, ...userLinks];

  return (
    <aside className="w-64 bg-gray-800 text-gray-200 flex-shrink-0 hidden md:flex md:flex-col">
      <div className="p-4 text-2xl font-bold text-white border-b border-gray-700">
        <NextLink href="/">TeamHippa</NextLink>
      </div>
      <nav className="mt-4 flex-1">
        <ul>
          {linksToShow.map((link) => (
            <li key={link.href}>
              <NextLink
                href={link.href}
                className={`flex items-center px-4 py-3 text-sm hover:bg-gray-700 transition-colors duration-150 ${
                  pathname.startsWith(link.href)
                    ? "bg-indigo-600 text-white"
                    : ""
                }`}
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                {link.label}
              </NextLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm text-left text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors duration-150"
        >
          <span className="mr-3 text-lg">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

// --- Main Dashboard Layout ---
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false); // NEW state to control rendering

  useEffect(() => {
    if (isLoading) {
      return; // Don't do anything until authentication check is complete
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // If authenticated, now check for authorization
    if (pathname.startsWith("/admin")) {
      if (user?.roleName === "ADMIN") {
        setIsAuthorized(true); // User is an admin and can see the page
      } else {
        // User is logged in but is NOT an admin. Redirect them.
        toast.error("You do not have permission to access this page.");
        router.push("/my-account");
        setIsAuthorized(false); // Explicitly set to false
      }
    } else {
      // It's not an admin route, so any authenticated user is authorized
      setIsAuthorized(true);
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-700">
              Welcome back, {user?.name || "User"}!
            </h1>
            <div className="md:hidden">
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
