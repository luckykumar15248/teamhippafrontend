"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "@/app/context/AuthContext";

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN";
}

const adminDashboardLinks = [
  {
    href: "/",
    label: "User Management",
    description:
      "users, roles, user_admission_info, student_academic_records",
    icon: "📅",
  },
  {
    href: "/admin/manage-sports-courses",
    label: "Sports & Courses Management",
    description: "sports, courses, sport_images, course_images",
    icon: "🏠",
  },
  {
    href: "/",
    label: "Booking Management",
    description: "bookings, booking_items, booking_item_dates",
    icon: "👤",
  },
  {
    href: "/admin/manage-sports-courses/package/create-package",
    label: "Package Management",
    description: "packages, package_courses, package_offering_periods",
    icon: "👤",
  },
  {
    href: "/admin/promotions-management",
    label: "Promotions Management",
    description: "coupons, pass_templates, generated_passes",
    icon: "👤",
  },
  {
    href: "/admin/inquiries",
    label: "Communications",
    description: "announcements and inquiries",
    icon: "👤",
  },
  {
    href: "/",
    label: "Website Content",
    description: "seo_metadata, menu_items, page_dynamic_images",
    icon: "👤",
  },
];

// --- API Helper ---
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getAuthHeaders = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("authToken");
  console.log("Auth Token:------------->", token);
  if (!token) {
    return null;
  }
  return { Authorization: `Bearer ${token}` };
};

const DashboardHomePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setIsLoggedIn } = useContext(AuthContext);
  
  const router = useRouter();

  const fetchData = useCallback(
    async (headers: { [key: string]: string }) => {
      setIsLoading(true);
      try {
        const profileRes = await axios.get(
          `${apiUrl}/api/auth/me`,
          { headers }
        );

        const userData = profileRes.data;
        console.log("User Profile Data:------------->", userData);

        if (userData.roleName !== "ADMIN") {
          toast.error("Access denied.");
          router.push("/login");
          return;
        }

        setUser(userData);
      } catch (error) {
        toast.error(
          "Could not load your dashboard. Please log in again."
        );
        console.error(error);
        localStorage.removeItem("authToken");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers) {
      router.push("/login");
      return;
    }
    fetchData(headers);
  }, [fetchData, router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    toast.success("You have been logged out.");
    setIsLoggedIn(false);
    router.push("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Dashboard Overview
        </h2>
        <button
          onClick={handleLogout}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminDashboardLinks.map((link, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <Link href={link.href} className="text-indigo-600 hover:underline">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>{link.icon}</span>
                {link.label}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              {link.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Activity
        </h3>
        <ul>
          <li className="border-b py-2 text-sm text-gray-700">
            You booked &quot;Advanced Swimming&quot; for June 10th.
          </li>
          <li className="border-b py-2 text-sm text-gray-700">
            Your &quot;Beginner Yoga&quot; pass was redeemed.
          </li>
          <li className="py-2 text-sm text-gray-700">
            Account successfully verified. Welcome!
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardHomePage;
