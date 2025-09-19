"use client";

import React, { useState } from "react";
import SportsManagement from "../../../components/admin/SportsManagement";
import CoursesManagement from "../../../components/admin/CoursesManagement";
import CourseScheduleManagement from "../../../components/admin/ScheduleRuleManagement";
import CourseSchedulesManagement from "../../../components/admin/CourseSchedulesManagement";
import PackageScheduleRuleManagement from "../../../components/admin/PackageScheduleRuleManagement";
import PackageSchedulesManagement from "../../../components/admin/PackageSchedulesManagement";
import ManageDailyAvailabilityPage from "../../../components/admin/ManageDailyAvailabilityPage";
import ManageCategoriesPage from "../../../components/admin/categories/ManageCategoriesPage";
import CourseCategoryMappingPage from "../../../components/admin/categories/CourseCategoryMappingPage";
type Tab =
  | "sports"
  | "courses"
  | "ManageCategoriesPage"
  | "CourseCategoryMappingPage"
  | "add course schedule"
  | "add course schedule rule"
  | "Manage Daily Availability Page"
  | "add package schedule"
  | "add package schedule"
  | "add Package schedule rule";

const ManageSportsAndCoursesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("sports");

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Sports & Courses
      </h2>
      <p className="text-gray-600 mb-8">
        Manage all sports categories and their corresponding course offerings
        from this central hub.
      </p>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex space-x-6 w-full overflow-auto custome-scroll"
          aria-label="Tabs"
        >
          <button
            onClick={() => setActiveTab("sports")}
            className={`${
              activeTab === "sports"
                ? "border-indigo-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 font-medium text-sm transition-colors duration-150`}
          >
            Manage Sports
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`${
              activeTab === "courses"
                ? "border-indigo-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 font-medium text-sm transition-colors duration-150`}
          >
            Manage Courses
          </button>

          <button
            onClick={() => setActiveTab("ManageCategoriesPage")}
            className={`${
              activeTab === "ManageCategoriesPage"
                ? "border-indigo-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 font-medium text-sm transition-colors duration-150`}
          >
            Manage Categories Page
          </button>
          <button
            onClick={() => setActiveTab("CourseCategoryMappingPage")}
            className={`${
              activeTab === "CourseCategoryMappingPage"
                ? "border-indigo-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 font-medium text-sm transition-colors duration-150`}
          >
            CourseCategoryMappingPage
          </button>

          <button
            onClick={() => setActiveTab("add course schedule")}
            className={`${
              activeTab === "add course schedule"
                ? "border-indigo-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 font-medium text-sm transition-colors duration-150`}
          >
            Add schedule for course
          </button>

          <button
            onClick={() => setActiveTab("add course schedule rule")}
            className={`${
              activeTab === "add course schedule rule"
                ? "border-indigo-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 font-medium text-sm transition-colors duration-150`}
          >
            Add schedule Rule for courses
          </button>

          <button
            onClick={() => setActiveTab("Manage Daily Availability Page")}
            className={`${
              activeTab === "Manage Daily Availability Page"
                ? "border-indigo-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 font-medium text-sm transition-colors duration-150`}
          >
            Manage Daily Availability Page
          </button>

          <button
            onClick={() => setActiveTab("add package schedule")}
            className={`${
              activeTab === "add package schedule"
                ? "border-indigo-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 font-medium text-sm transition-colors duration-150`}
          >
            Add schedule for package
          </button>

          <button
            onClick={() => setActiveTab("add Package schedule rule")}
            className={`${
              activeTab === "add Package schedule rule"
                ? "border-indigo-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 font-medium text-sm transition-colors duration-150`}
          >
            Add schedule Rule for package
          </button>
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === "courses" && <CoursesManagement />}
        {activeTab === "sports" && <SportsManagement />}
        {activeTab === "add course schedule" && <CourseSchedulesManagement />}
        {activeTab === "add course schedule rule" && (
          <CourseScheduleManagement />
        )}
        {activeTab === "add package schedule" && <PackageSchedulesManagement />}
        {activeTab === "add Package schedule rule" && (
          <PackageScheduleRuleManagement />
        )}
        {activeTab === "Manage Daily Availability Page" && (
          <ManageDailyAvailabilityPage />
        )}
        {activeTab === "ManageCategoriesPage" && <ManageCategoriesPage />}
        {activeTab === "CourseCategoryMappingPage" && (
          <CourseCategoryMappingPage />
        )}
      </div>
    </div>
  );
};

export default ManageSportsAndCoursesPage;
