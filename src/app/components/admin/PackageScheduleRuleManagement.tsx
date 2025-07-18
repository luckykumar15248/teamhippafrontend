"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";

// --- SVG Icon Components ---
const PlusIcon = ({ className = "mr-2" }: { className?: string }) => (
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
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
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

const TrashIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
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
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// --- Type Definitions (Matching your DTOs) ---
interface PackageInfo {
  id: number;
  name: string;
}

interface PackageSchedule {
  scheduleId: number;
  name: string;
  startDate: string;
  endDate: string;
}

interface RuleRange {
  id?: number;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

interface PackageRule {
  rule_id: number;
  schedule_id: number;
  rule_type: "OPEN" | "CLOSE";
  recurring: boolean;
  priority: number;
  is_active: boolean;
  description: string;
  ranges: RuleRange[];
  day_of_week: string[];
}

type RuleFormData = Omit<PackageRule, "rule_id"> & { rule_id?: number };

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

// --- Component Prop Interfaces ---
interface RuleListProps {
  rules: PackageRule[];
  onEdit: (rule: PackageRule) => void;
  onDelete: (rule: PackageRule) => void;
}

interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ruleData: RuleFormData) => void;
  rule: PackageRule | null;
  schedules: PackageSchedule[];
  selectedScheduleId: number;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rule: PackageRule | null;
}

// Main Page Component
const PackageBookingRulesPage = () => {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [schedules, setSchedules] = useState<PackageSchedule[]>([]);
  const [rules, setRules] = useState<PackageRule[]>([]);

  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<PackageRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<PackageRule | null>(null);
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

      try {
        const response = await axios.get(
          `${apiUrl}api/admin/package-schedules/package/${packageId}`,
          { headers }
        );
        setSchedules(response.data);
      } catch (error) {
        toast.error("Could not load schedules for this package.");
        setSchedules([]);
        console.error(error);
      }
    },
    [router]
  );

  const fetchRulesForSchedule = useCallback(
    async (scheduleId: number) => {
      const headers = getAuthHeaders();
      if (!headers) {
        router.push("/login");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          `${apiUrl}api/admin/package-booking-rules/schedule/${scheduleId}`,
          { headers }
        );
        setRules(response.data);
      } catch (error) {
        toast.error("Could not load rules for this schedule.");
        console.error(error);
        setRules([]);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPackageId) {
      fetchSchedulesForPackage(selectedPackageId);
    } else {
      setSchedules([]);
    }
    setSelectedScheduleId(null); // Reset schedule when package changes
    setRules([]);
  }, [selectedPackageId, fetchSchedulesForPackage]);

  useEffect(() => {
    if (selectedScheduleId) {
      fetchRulesForSchedule(selectedScheduleId);
    } else {
      setRules([]);
    }
  }, [selectedScheduleId, fetchRulesForSchedule]);

  const handleAddRule = () => {
    if (!selectedScheduleId) {
      toast.info("Please select a package schedule first to add a rule.");
      return;
    }
    setCurrentRule(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: PackageRule) => {
    setCurrentRule(rule);
    setIsModalOpen(true);
  };

  const openDeleteModal = (rule: PackageRule) => {
    setRuleToDelete(rule);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setRuleToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    const headers = getAuthHeaders();
    if (!headers) {
      router.push("/login");
      return;
    }

    try {
      await axios.delete(
        `${apiUrl}api/admin/package-booking-rules/${ruleToDelete.rule_id}`,
        { headers }
      );
      toast.success("Rule deleted successfully.");
      setRules((prev) =>
        prev.filter((rule) => rule.rule_id !== ruleToDelete.rule_id)
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to delete rule.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      closeDeleteModal();
    }
  };

  const handleSaveRule = async (ruleData: RuleFormData) => {
    const isUpdating = !!ruleData.rule_id;
    const headers = getAuthHeaders();
    if (!headers) {
      router.push("/login");
      return;
    }

    const endpoint = isUpdating
      ? `${apiUrl}api/admin/package-booking-rules/${ruleData.rule_id}`
      : `${apiUrl}api/admin/package-booking-rules`;

    const method = isUpdating ? "put" : "post";

    try {
      const response = await axios[method](endpoint, ruleData, { headers });
      if (response.data.success) {
        toast.success(response.data.message);
        if (selectedScheduleId) {
          fetchRulesForSchedule(selectedScheduleId);
        }
      } else {
        toast.error(response.data.message || "Failed to save rule.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while saving the rule."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
            Package Booking Rules
          </h1>
          <button
            onClick={handleAddRule}
            disabled={!selectedScheduleId}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            <PlusIcon /> Add New Rule
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="packageSelector"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              1. Select a Package
            </label>
            <select
              id="packageSelector"
              value={selectedPackageId || ""}
              onChange={(e) =>
                setSelectedPackageId(Number(e.target.value) || null)
              }
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- Select Package --</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="scheduleSelector"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              2. Select a Schedule
            </label>
            <select
              id="scheduleSelector"
              value={selectedScheduleId || ""}
              onChange={(e) =>
                setSelectedScheduleId(Number(e.target.value) || null)
              }
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={!selectedPackageId || schedules.length === 0}
            >
              <option value="">-- Select Schedule --</option>
              {schedules.map((s) => (
                <option key={s.scheduleId} value={s.scheduleId}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading rules...
          </div>
        ) : !selectedPackageId ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">
              Please select a package to see its available schedules.
            </p>
          </div>
        ) : !selectedScheduleId && schedules.length > 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">
              Please select a schedule to view or add booking rules.
            </p>
          </div>
        ) : (
          <RuleList
            rules={rules}
            onEdit={handleEditRule}
            onDelete={openDeleteModal}
          />
        )}
      </div>

      {isModalOpen && selectedScheduleId && (
        <RuleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveRule}
          rule={currentRule}
          schedules={schedules}
          selectedScheduleId={selectedScheduleId}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteRule}
          rule={ruleToDelete}
        />
      )}
    </div>
  );
};

const RuleList: React.FC<RuleListProps> = ({ rules, onEdit, onDelete }) => {
  // ... (This component remains the same as before) ...
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rule Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ranges
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Days
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rules.length > 0 ? (
            rules.map((rule) => (
              <tr key={rule.rule_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={`mr-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rule.rule_type === "OPEN"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {rule.rule_type}
                    </span>
                    <div className="text-sm font-medium text-gray-900">
                      ID: {rule.rule_id}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {rule.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {(rule.ranges || []).length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {(rule.day_of_week || []).length > 0
                    ? (rule.day_of_week || []).join(", ")
                    : "All"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rule.is_active
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {rule.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(rule)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => onDelete(rule)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-10 text-gray-500">
                No rules found for this schedule.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const RuleModal: React.FC<RuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  rule,
  schedules,
  selectedScheduleId,
}) => {
  // ... (This component remains the same as before) ...
  const getInitialFormData = (): RuleFormData => ({
    schedule_id: selectedScheduleId,
    rule_type: "OPEN",
    recurring: false,
    priority: 1,
    is_active: true,
    description: "",
    //created_by: 1,
    // updated_by: 1,
    ranges: [],
    day_of_week: [],
  });

  const [formData, setFormData] = useState<RuleFormData>(getInitialFormData());
  const [selectedSchedule, setSelectedSchedule] =
    useState<PackageSchedule | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (rule) {
      setFormData(JSON.parse(JSON.stringify(rule)));
    } else {
      setFormData(getInitialFormData());
    }
    setValidationError(null);
  }, [rule, isOpen, getInitialFormData]);

  useEffect(() => {
    const schedule = schedules.find(
      (s) => s.scheduleId === Number(formData.schedule_id)
    );
    setSelectedSchedule(schedule || null);
  }, [formData.schedule_id, schedules]);

  const handleMainChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRangeChange = (
    index: number,
    field: keyof RuleRange,
    value: string
  ) => {
    setFormData((prev) => {
      const newRanges = [...(prev.ranges || [])];
      newRanges[index] = { ...newRanges[index], [field]: value || null };
      return { ...prev, ranges: newRanges };
    });
  };

  const addRange = () => {
    setFormData((prev) => ({
      ...prev,
      ranges: [
        ...(prev.ranges || []),
        {
          id: Date.now(),
          start_date: null,
          end_date: null,
          start_time: null,
          end_time: null,
        },
      ],
    }));
  };

  const removeRange = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ranges: (prev.ranges || []).filter((_, i) => i !== index),
    }));
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const days = prev.day_of_week || [];
      if (checked) {
        return { ...prev, day_of_week: [...days, value] };
      } else {
        return { ...prev, day_of_week: days.filter((day) => day !== value) };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedSchedule) {
      setValidationError("Please select a valid course schedule.");
      return;
    }

    const scheduleStartDate = new Date(
      selectedSchedule.startDate + "T00:00:00"
    );
    const scheduleEndDate = new Date(selectedSchedule.endDate + "T23:59:59");

    for (const range of formData.ranges) {
      if (range.start_date) {
        const rangeStartDate = new Date(range.start_date + "T00:00:00");
        if (
          rangeStartDate < scheduleStartDate ||
          rangeStartDate > scheduleEndDate
        ) {
          setValidationError(
            `A rule start date (${range.start_date}) is outside the schedule's range.`
          );
          return;
        }
      }
      if (range.end_date) {
        const rangeEndDate = new Date(range.end_date + "T23:59:59");
        if (
          rangeEndDate < scheduleStartDate ||
          rangeEndDate > scheduleEndDate
        ) {
          setValidationError(
            `A rule end date (${range.end_date}) is outside the schedule's range.`
          );
          return;
        }
      }
      if (range.start_date && range.end_date) {
        const rangeStartDate = new Date(range.start_date);
        const rangeEndDate = new Date(range.end_date);
        if (rangeEndDate < rangeStartDate) {
          setValidationError(
            `A rule's end date (${range.end_date}) cannot be before its start date (${range.start_date}).`
          );
          return;
        }
      }
    }

    onSave({
      ...formData,
      schedule_id: parseInt(String(formData.schedule_id), 10),
      priority: parseInt(String(formData.priority), 10),
    });
  };

  if (!isOpen) return null;

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {rule ? "Edit Rule" : "Add New Rule"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Rule Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="schedule_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Package Schedule
                </label>
                <select
                  name="schedule_id"
                  id="schedule_id"
                  value={formData.schedule_id}
                  onChange={handleMainChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  disabled
                >
                  {schedules.map((s) => (
                    <option key={s.scheduleId} value={s.scheduleId}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="rule_type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Rule Type
                </label>
                <select
                  name="rule_type"
                  id="rule_type"
                  value={formData.rule_type}
                  onChange={handleMainChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSE">CLOSE</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700"
                >
                  Priority
                </label>
                <input
                  type="number"
                  name="priority"
                  id="priority"
                  value={formData.priority}
                  onChange={handleMainChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="lg:col-span-3">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleMainChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>
              <div className="lg:col-span-3 flex items-center space-x-8">
                <div className="flex items-center">
                  <input
                    id="recurring"
                    name="recurring"
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={handleMainChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="recurring"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Recurring
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleMainChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Is Active
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 mb-4 border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Date & Time Ranges
              </h3>
              {selectedSchedule && (
                <p className="text-sm text-gray-500">
                  Schedule valid: {selectedSchedule.startDate} to{" "}
                  {selectedSchedule.endDate}
                </p>
              )}
            </div>
            <div className="space-y-4">
              {(formData.ranges || []).map((range, index) => (
                <div
                  key={range.id || index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-gray-50 p-4 rounded-lg border"
                >
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`start_date_${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id={`start_date_${index}`}
                      value={range.start_date || ""}
                      onChange={(e) =>
                        handleRangeChange(index, "start_date", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`end_date_${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id={`end_date_${index}`}
                      value={range.end_date || ""}
                      onChange={(e) =>
                        handleRangeChange(index, "end_date", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm text-sm"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeRange(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`start_time_${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Start Time
                    </label>
                    <input
                      type="time"
                      id={`start_time_${index}`}
                      value={range.start_time || ""}
                      onChange={(e) =>
                        handleRangeChange(index, "start_time", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`end_time_${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      End Time
                    </label>
                    <input
                      type="time"
                      id={`end_time_${index}`}
                      value={range.end_time || ""}
                      onChange={(e) =>
                        handleRangeChange(index, "end_time", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRange}
              className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <PlusIcon className="mr-1" /> Add Date/Time Range
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8 border-b pb-2">
              Days of the Week
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <label
                  key={day}
                  htmlFor={`day_${day}`}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id={`day_${day}`}
                    value={day}
                    checked={(formData.day_of_week || []).includes(day)}
                    onChange={handleDayChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t sticky bottom-0 z-10 flex justify-end items-center space-x-3">
            {validationError && (
              <p className="text-sm text-red-600 mr-auto">{validationError}</p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  rule,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900">Delete Rule</h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete rule ID{" "}
            <span className="font-semibold">{rule?.rule_id}</span>? This action
            cannot be undone.
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageBookingRulesPage;
