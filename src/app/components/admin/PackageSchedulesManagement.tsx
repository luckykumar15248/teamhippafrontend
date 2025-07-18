"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

// --- Type Definitions ---
interface Package {
  id: number;
  name: string;
}

interface PackageSchedule {
  scheduleId: number;
  packageId: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// --- API Helper ---
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) {
    toast.error("Authentication session expired. Please log in again.");
    return null;
  }
  return { Authorization: `Bearer ${token}` };
};
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// --- SVG Icon Components ---
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-2"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Schedule Modal Component ---
interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    scheduleData: Omit<PackageSchedule, "scheduleId" | "packageId">
  ) => void;
  schedule: Omit<PackageSchedule, "packageId"> | null;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  schedule,
}) => {
  const [name, setName] = useState(schedule?.name || "");
  const [startDate, setStartDate] = useState(schedule?.startDate || "");
  const [endDate, setEndDate] = useState(schedule?.endDate || "");
  const [isActive, setIsActive] = useState(schedule?.isActive ?? true);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date.");
      toast.error("End date cannot be before start date.");
      return;
    }
    onSave({ name, startDate, endDate, isActive });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {schedule ? "Edit Schedule" : "Create New Schedule"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <label
                htmlFor="scheduleName"
                className="block text-sm font-medium text-gray-700"
              >
                Schedule Name
              </label>
              <input
                type="text"
                id="scheduleName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-2 flex items-center gap-x-6">
                <div className="flex items-center gap-x-2">
                  <input
                    id="active"
                    name="status"
                    type="radio"
                    checked={isActive}
                    onChange={() => setIsActive(true)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="active">Active</label>
                </div>
                <div className="flex items-center gap-x-2">
                  <input
                    id="inactive"
                    name="status"
                    type="radio"
                    checked={!isActive}
                    onChange={() => setIsActive(false)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="inactive">Inactive</label>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const ManagePackageSchedulesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [schedules, setSchedules] = useState<PackageSchedule[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Omit<
    PackageSchedule,
    "packageId"
  > | null>(null);

  const router = useRouter();

  const fetchPackages = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      router.push("/login");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}api/admin/packages`, {
        headers,
      });
      setPackages(response.data);
    } catch (error) {
      toast.error("Could not load packages.");
      console.error(error);
    }
  };

  const fetchSchedulesForPackage = useCallback(
    async (packageId: number) => {
      const headers = getAuthHeaders();
      if (!headers) {
        router.push("/login");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          `${apiUrl}api/admin/package-schedules/package/${packageId}`,
          { headers }
        );
        setSchedules(response.data);
      } catch (error) {
        toast.error("Could not load schedules for this package.");
        console.error(error);
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (selectedPackageId) {
      fetchSchedulesForPackage(selectedPackageId);
    } else {
      setSchedules([]);
    }
  }, [selectedPackageId, fetchSchedulesForPackage]);

  const handleAddSchedule = () => {
    if (!selectedPackageId) {
      toast.info("Please select a package first.");
      return;
    }
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEditSchedule = (schedule: PackageSchedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleSaveSchedule = async (
    scheduleData: Omit<PackageSchedule, "scheduleId" | "packageId">
  ) => {
    const headers = getAuthHeaders();
    if (!headers || !selectedPackageId) {
      router.push("/login");
      return;
    }

    const endpoint = editingSchedule
      ? `${apiUrl}api/admin/package-schedules/${editingSchedule.scheduleId}`
      : `${apiUrl}api/admin/package-schedules`;

    const method = editingSchedule ? "put" : "post";

    const payload = { ...scheduleData, packageId: selectedPackageId };

    try {
      await axios[method](endpoint, payload, { headers });
      toast.success(`Schedule "${scheduleData.name}" saved successfully!`);
      fetchSchedulesForPackage(selectedPackageId);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to delete schedule."
      );
    } finally {
      setIsModalOpen(false);
      setEditingSchedule(null);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this schedule? This will also delete all of its booking rules."
      )
    ) {
      const headers = getAuthHeaders();
      if (!headers) {
        router.push("/login");
        return;
      }

      try {
        await axios.delete(
          `${apiUrl}api/admin/package-schedules/${scheduleId}`,
          { headers }
        );
        toast.success("Schedule deleted successfully.");
        setSchedules((prev) => prev.filter((s) => s.scheduleId !== scheduleId));
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(
          axiosError.response?.data?.message || "Failed to delete schedule."
        );
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
          Package Schedules
        </h2>
        <button
          onClick={handleAddSchedule}
          disabled={!selectedPackageId}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          <PlusIcon /> Add New Schedule
        </button>
      </div>

      <div className="mb-6">
        <label
          htmlFor="packageSelector"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select a Package to Manage Its Schedules
        </label>
        <select
          id="packageSelector"
          value={selectedPackageId || ""}
          onChange={(e) => setSelectedPackageId(Number(e.target.value) || null)}
          className="block w-full md:w-1/2 lg:w-1/3 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">-- Select Package --</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Schedule Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : !selectedPackageId ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    Please select a package to see its schedules.
                  </td>
                </tr>
              ) : schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <tr key={schedule.scheduleId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {schedule.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.startDate} to {schedule.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          schedule.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {schedule.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button
                        onClick={() => handleEditSchedule(schedule)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSchedule(schedule.scheduleId)
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No schedules found for this package.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSchedule}
          schedule={editingSchedule}
        />
      )}
    </div>
  );
};

export default ManagePackageSchedulesPage;
