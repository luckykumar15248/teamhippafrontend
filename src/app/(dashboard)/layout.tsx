// File: app/(dashboard)/layout.tsx
// This is the main layout for your entire dashboard area.
// It now includes real authentication logic using localStorage.

'use client'; // This layout uses client-side hooks for authentication state and redirection.

import React, { useState, useEffect } from 'react';
import { default as NextLink } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Console } from 'console';

// A more realistic auth hook that reads from localStorage.
// For a larger app, this logic would be in a dedicated AuthContext.
const useAuth = () => {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Start in loading state
    const router = useRouter();

    useEffect(() => {
        // localStorage is only available on the client side.
       if (typeof window !== 'undefined') {
            try {
                const token = localStorage.getItem('authToken');
                console.log("Checking auth state, token:", token);
                const userDataString = localStorage.getItem('userData');
                console.log("User data from  localStorage:", userDataString);
                if (token && userDataString) {
                    const userData = JSON.parse(userDataString);
                    // You might want to add a check here to verify the token with the backend
                    setUser(userData);
                    console.log("User data is ", userData)
                    setIsAuthenticated(true);
                } else {
                    // If no token, user is not authenticated
                    setIsAuthenticated(true);
                    setUser(null);
                }
            } catch (error) {
                console.error("Failed to parse user data from localStorage", error);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false); // Finished checking auth state
            }
        }
    }, []);

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        }
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login'); // Redirect to login page after logout
    };

    return { isAuthenticated, user, isLoading, logout };
};

// --- Sidebar Component ---
// This could be its own file in components/layout/Sidebar.tsx
const Sidebar: React.FC = () => {
    const { user, logout } = useAuth(); // Gets user and logout function
    const pathname = usePathname();

    const commonLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { href: '/profile', label: 'My Profile', icon: '👤' },
        { href: 'admin/bookings', label: 'My Bookings', icon: '📅' },
    ];
    
    const adminLinks = [
        { href: '/admin/manage-courses', label: 'Manage Courses', icon: '📚' },
        { href: '/admin/manage-users', label: 'Manage Users', icon: '👥' },
        { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
    ];

    const userLinks = [
        { href: '/my-passes', label: 'My Passes', icon: '🎟️' },
        { href: '/settings', label: 'Settings', icon: '⚙️' },
    ];
    
    // Determine which links to show based on the actual user role
    const linksToShow = user?.role === 'ADMIN' 
        ? [...commonLinks, ...adminLinks] 
        : [...commonLinks, ...userLinks];

    return (
        <aside className="w-64 bg-gray-800 text-gray-200 flex-shrink-0 hidden md:flex md:flex-col">
            <div className="p-4 text-2xl font-bold text-white border-b border-gray-700">
                <NextLink href="/">TeamHippa</NextLink>
            </div>
            <nav className="mt-4 flex-1">
                <ul>
                    {linksToShow.map(link => (
                        <li key={link.href}>
                            <NextLink 
                                href={link.href} 
                                className={`flex items-center px-4 py-3 text-sm hover:bg-gray-700 transition-colors duration-150 ${pathname === link.href ? 'bg-indigo-600 text-white' : ''}`}
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
                    onClick={logout} // Wired up the logout function
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
  children: React.ReactNode
}) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const router = useRouter();
console.log("is authoniciated",isAuthenticated, user, isLoading  )
    useEffect(() => {
        // If loading is finished and user is not authenticated, redirect to login
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Show a loading state while checking for authentication
    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <p className="text-gray-600">Loading Dashboard...</p>
                {/* Or a spinner component */}
            </div>
        );
    }

    // If authenticated, render the dashboard layout
    // This also implicitly protects the route, as unauthenticated users will be redirected
    if (isAuthenticated) {
        return (
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white shadow-sm z-10">
                        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                            {/* Header now displays the actual user's name */}
                            <h1 className="text-xl font-semibold text-gray-700">Welcome back, {user?.name || 'User'}!</h1>
                            {/* Add mobile menu button for small screens */}
                            <div className="md:hidden">
                                {/* Add your mobile menu toggle logic here */}
                                <button className="p-2 text-gray-600 hover:text-gray-800">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
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

    // Return null or a fallback while redirecting
    return null;
}
