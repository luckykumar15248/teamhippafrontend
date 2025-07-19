// 'use client';

import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';

// Define the Sport type for type safety
type Sport = {
  id: number;
  name: string;
  isActive: boolean;
  description?: string;
  courseCount: number;
};

// Helper function to get authorization headers from localStorage
// This function is called inside the API-interacting functions to ensure it's always available
const getAuthHeaders = () => {
  // Check if window is defined to ensure this runs only in the browser environment
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn("No auth token found in localStorage.");
    return null;
  }
  return { 'Authorization': `Bearer ${token}` };
};

// Number of items to display per page in the table
const ITEMS_PER_PAGE = 5;

// API base URL, assuming it's provided via environment variables
// In a Canvas environment, process.env.NEXT_PUBLIC_API_URL might not be directly available,
// so for a runnable example, you might hardcode it or mock it.
// For this example, we'll assume it's correctly configured or mock it for demonstration.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com/'; // Fallback for demonstration

export default function SportsManagement() {
  // State variables for managing sports data, form data, modal visibility, search, and pagination
  const [sports, setSports] = useState<Sport[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // State for loading indicator

  // States for custom message and confirmation modals
  const [messageModal, setMessageModal] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; resolve: (value: boolean) => void } | null>(null);

  // Function to display a temporary message modal
  const showMessage = useCallback((text: string, type: 'success' | 'error') => {
    setMessageModal({ text, type });
    // Automatically hide the message after 3 seconds
    setTimeout(() => setMessageModal(null), 3000);
  }, []);

  // Function to show a confirmation modal and return a Promise that resolves to true/false
  const showConfirmation = useCallback((msg: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({ message: msg, resolve });
    });
  }, []);

  // Function to fetch sports data from the API
  const fetchSports = useCallback(async () => {
    const headers = getAuthHeaders(); // Get headers just before the API call
    if (!headers) {
      showMessage("Authentication required. Please log in.", "error");
      setIsLoading(false); // Stop loading if authentication fails
      return;
    }
    try {
      const res = await axios.get<Sport[]>(`${apiUrl}/api/admin/sports`, { headers });
      setSports(res.data);
    } catch (error) {
      console.error('Failed to load sports:', error);
      showMessage('Failed to load sports. Please try again later.', 'error');
    } finally {
      setIsLoading(false); // Ensure loading state is turned off
    }
  }, [showMessage]); // Depend on showMessage

  // useEffect hook to fetch sports data when the component mounts
  useEffect(() => {
    // Wrap fetchSports in an async IIFE to use await
    const loadData = async () => {
      setIsLoading(true); // Set loading to true before fetching
      await fetchSports();
    };
    loadData();
  }, [fetchSports]); // Depend on fetchSports to avoid stale closures, though it's memoized by useCallback

  // Handler for deleting a sport
  const handleDelete = async (id: number) => {
    // Use custom confirmation modal
    const confirmed = await showConfirmation('Are you sure you want to delete this sport?');
    if (!confirmed) return;

    const headers = getAuthHeaders();
    if (!headers) {
      showMessage("Authentication required to delete sport.", "error");
      return;
    }
    try {
      await axios.delete(`${apiUrl}/api/admin/sports/${id}`, { headers });
      fetchSports(); // Refresh the list after deletion
      showMessage('Sport deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete sport:', error);
      showMessage('Failed to delete sport. It might be in use.', 'error');
    }
  };

  // Function to open the add/edit sport modal
  const openModal = (sport?: Sport) => {
    if (sport) {
      // If a sport is provided, set it for editing
      setEditingSport(sport);
      setFormData({
        name: sport.name,
        description: sport.description || '', // Ensure description is a string
        isActive: sport.isActive,
      });
    } else {
      // Otherwise, prepare for adding a new sport
      setEditingSport(null);
      setFormData({ name: '', description: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  // Handler for submitting the sport form (add or update)
  const handleSubmit = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      showMessage("Authentication required to save sport.", "error");
      return;
    }

    // Validate sport name
    if (!formData.name.trim()) {
      showMessage('Sport name is required.', 'error');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      isActive: formData.isActive,
    };

    try {
      if (editingSport) {
        // If editing, send a PUT request
        await axios.put(`${apiUrl}/api/admin/sports/${editingSport.id}`, payload, { headers });
        showMessage('Sport updated successfully!', 'success');
      } else {
        // If adding, send a POST request
        await axios.post(`${apiUrl}/api/admin/sports`, payload, { headers });
        showMessage('Sport added successfully!', 'success');
      }
      fetchSports(); // Refresh the list after submission
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error('Failed to save sport:', error);
      showMessage('Failed to save sport. Please check your input.', 'error');
    }
  };

  // Filter sports based on search input
  const filteredSports = sports.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredSports.length / ITEMS_PER_PAGE);
  // Get the current items to display based on pagination
  const currentItems = filteredSports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      {/* Main content container */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header section with title and add sport button */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sports Management</h1>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Sport
          </button>
        </div>

        {/* Search input field */}
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out placeholder-gray-500 text-gray-900"
          aria-label="Search sports by name"
        />

        {/* Loading indicator */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="ml-4 text-lg text-gray-600">Loading sports...</p>
          </div>
        ) : (
          // Sports table
          <div className="bg-white shadow-xl rounded-lg overflow-hidden ring-1 ring-black ring-opacity-5">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Courses</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((sport) => (
                    <tr key={sport.id} className="hover:bg-blue-50 transition duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sport.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{sport.courseCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                            sport.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sport.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 ease-in-out hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                          onClick={() => openModal(sport)}
                          aria-label={`Edit ${sport.name}`}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 ease-in-out hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md"
                          onClick={() => handleDelete(sport.id)}
                          aria-label={`Delete ${sport.name}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 text-base">
                      No sports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-4 py-2 text-sm font-medium rounded-full shadow-sm transition-all duration-200 ease-in-out ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                onClick={() => setCurrentPage(i + 1)}
                aria-label={`Go to page ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Add/Edit Sport Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6 sm:p-0" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 transform transition-all sm:my-8 sm:align-middle">
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {editingSport ? 'Edit Sport' : 'Add New Sport'}
              </h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="sport-name" className="block text-sm font-medium text-gray-700 mb-1">Sport Name</label>
                  <input
                    type="text"
                    id="sport-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-gray-900"
                    placeholder="e.g., Basketball"
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="sport-description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    id="sport-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-gray-900"
                    placeholder="A brief description of the sport..."
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label htmlFor="status-active" className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      id="status-active"
                      name="sport-status"
                      checked={formData.isActive}
                      onChange={() => setFormData({ ...formData, isActive: true })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label htmlFor="status-inactive" className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      id="status-inactive"
                      name="sport-status"
                      checked={!formData.isActive}
                      onChange={() => setFormData({ ...formData, isActive: false })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transform hover:scale-105"
                >
                  {editingSport ? 'Update Sport' : 'Create Sport'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Message Modal */}
        {messageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4 py-6 sm:p-0">
            <div className={`bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center transform transition-all ${messageModal.type === 'success' ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'}`}>
              <p className={`text-lg font-semibold ${messageModal.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {messageModal.text}
              </p>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6 sm:p-0" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 transform transition-all sm:my-8 sm:align-middle">
              <h3 id="confirm-title" className="text-xl font-semibold text-gray-900 mb-4 text-center">Confirm Action</h3>
              <p className="text-gray-700 text-center mb-6">{confirmModal.message}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setConfirmModal(null);
                    confirmModal.resolve(false); // Resolve with false if cancelled
                  }}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmModal(null);
                    confirmModal.resolve(true); // Resolve with true if confirmed
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
