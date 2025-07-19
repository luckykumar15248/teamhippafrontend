'use client';
import { default as NextLink } from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// --- Interfaces (No changes) ---
interface Sport {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
  sportId: number;
  sportName: string;
  description: string;
  shortDescription: string;
  duration: string;
  basePriceInfo: string;
  isActive: boolean;
  imagePaths?: string[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const ITEMS_PER_PAGE = 10;

const CoursesManagement: React.FC = () => {
  const router = useRouter(); // Initialize router for navigation

  // --- State Management (Cleaned) ---
  // All state related to the add/edit form has been removed as the form is not in this component.
  // This includes: courseId, courseName, sportId, description, etc.
  const [sports, setSports] = useState<Sport[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  // REMOVED: Unused ref 'editor'.

  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
  };

  // --- Data Fetching (No changes) ---
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/public_api/sports`);
        setSports(response.data);
      } catch (error) {
        toast.error("Failed to fetch sports categories.");
        console.error(error)
      }
    };

    const fetchCourses = async () => {
      const headers = getAuthHeaders();
      if (!headers) return;
      try {
        const response = await axios.get(`${apiUrl}/api/admin/courses`, { headers });
        setCourses(response.data.data);
        setFilteredCourses(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch courses.");
        console.error(error)
      }
    };
    
    fetchSports();
    fetchCourses();
  }, []);

  // --- Filter and Search Functionality (No changes) ---
  useEffect(() => {
    let result = [...courses];
    
    if (searchTerm) {
      result = result.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSportFilter > 0) {
      result = result.filter(course => course.sportId === selectedSportFilter);
    }
    
    setFilteredCourses(result);
    setCurrentPage(1);
  }, [searchTerm, selectedSportFilter, courses]);

  // --- Pagination Logic (No changes) ---
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // REMOVED: All unused form handlers have been removed.
  // - handleImageChange
  // - handleRemoveImage
  // - resetForm
  // - uploadImages
  // - handleCourseSubmit

  // --- Action Handlers (Updated) ---
  const handleEditCourse = (courseId: number) => {
    // Instead of setting state, navigate to a dedicated edit page.
    // This is a more robust pattern.
    router.push(`/admin/manage-sports-courses/courses/edit-course/${courseId}`);
  };

  const handleDeleteCourse = async (courseId: number) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`${apiUrl}/api/admin/courses/${courseId}`, { headers });
        setCourses(prev => prev.filter(c => c.id !== courseId));
        toast.success("Course deleted successfully.");
      } catch (error) {
        toast.error("Failed to delete course.");
        console.error(error)
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      


{/* Search and Filter Section */}
      <div className="mt-8 bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Courses
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="sportFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Sport
            </label>
            <select
              id="sportFilter"
              value={selectedSportFilter}
              onChange={(e) => setSelectedSportFilter(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={0}>All Sports</option>
              {sports.map(sport => (
                <option key={sport.id} value={sport.id}>{sport.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedSportFilter(0);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
            <div className="flex items-end">
            <button  type="button"
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
             <NextLink href="/admin/manage-sports-courses/courses/add-course"> Add New Course</NextLink> 
            </button>
          </div>         

        </div>
      </div>



      {/* Existing Courses List */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Existing Courses ({filteredCourses.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sport
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCourses.length > 0 ? (
                  paginatedCourses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        <div className="text-sm text-gray-500">{course.shortDescription}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.sportName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditCourse(course.id)}
                          className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No courses found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredCourses.length)}</span> of{' '}
                    <span className="font-medium">{filteredCourses.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">First</span>
                      &laquo;
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      &lsaquo;
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      &rsaquo;
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Last</span>
                      &raquo;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
          </div>
          </div>
    </div>
  );
};export default CoursesManagement;