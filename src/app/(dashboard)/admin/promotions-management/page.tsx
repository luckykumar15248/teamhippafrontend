"use client";

import React, { useState } from "react";
import ManageCoupons from "../../../components/admin/PromotionsManagement/ManageCoupons";
import CouponReport from "../../../components/admin/PromotionsManagement/CouponReport";
type Tab = "ManageCoupons" | "CouponReport";

const ManageSportsAndCoursesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("ManageCoupons");

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Sports & Courses
      </h2>
      <p className="text-gray-600 mb-8">
        Manage all sports categories and their corresponding course offerings
        from this central hub.
      </p>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("ManageCoupons")}
            className={`${
              activeTab === "ManageCoupons"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
          >
            Create Coupon
          </button>

          <button
            onClick={() => setActiveTab("CouponReport")}
            className={`${
              activeTab === "CouponReport"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
          >
            Coupon Report
          </button>
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === "ManageCoupons" && <ManageCoupons />}
        {activeTab === "CouponReport" && <CouponReport />}
      </div>
    </div>
  );
};

export default ManageSportsAndCoursesPage;
