// File: app/(dashboard)/admin/add-sport/page.tsx
// This is a dedicated page for adding a new sport.
// The URL would be /admin/add-sport.

'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// --- Type Definition ---
interface NewSportData {
  name: string;
  description: string;
  isActive: boolean;
}

// --- Main Page Component ---
const AddNewSportPage: React.FC = () => {
  // --- State Management ---
  const [sportName, setSportName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // --- Handler for form submission ---
  const handleSportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportName.trim()) {
      toast.error("Sport name cannot be empty.");
      return;
    }
    
    setIsSubmitting(true);
    const newSportData: NewSportData = {
      name: sportName,
      description,
      isActive,
    };

    // TODO: Replace this with your actual API call to save the new sport
    console.log("Submitting new sport data:", newSportData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    toast.success(`Sport "${sportName}" created successfully!`);
    
    // Optionally redirect back to the main management page
    // router.push('/admin/manage-courses'); 
    
    // Or just reset the form to allow adding another one
    setSportName('');
    setDescription('');
    setIsActive(true);
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Add a New Sport</h2>
        <p className="text-gray-600 mt-1">
          Create a new category for courses.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
          <form onSubmit={handleSportSubmit}>
            <div className="space-y-6">
              {/* Sport Name */}
              <div>
                <label htmlFor="sportName" className="block text-sm font-medium text-gray-700">Sport Name</label>
                <input
                  type="text"
                  id="sportName"
                  value={sportName}
                  onChange={(e) => setSportName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Tennis, Archery"
                  required
                />
              </div>

              {/* Sport Description */}
              <div>
                <label htmlFor="sportDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="sportDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="A brief description of the sport."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sportStatus"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="sportStatus" className="ml-2 block text-sm text-gray-900">
                  Set as Active
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-150 flex items-center disabled:bg-indigo-400"
              >
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Saving...' : 'Save Sport'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewSportPage;