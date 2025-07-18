'use client';
import { default as NextLink } from 'next/link';
import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

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
  // --- State Management ---
  const [courseId, setCourseId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState('');
  const [sportId, setSportId] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [basePriceInfo, setBasePriceInfo] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const editor = useRef(null);

  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
};

  // --- Data Fetching ---
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get(`${apiUrl}api/public_api/sports`);
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
        const response = await axios.get(`${apiUrl}api/admin/courses`, { headers });
       //const coursesData = Array.isArray(response.data) ? response.data : [];
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

  // --- Filter and Search Functionality ---
  useEffect(() => {
    let result = [...courses];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sport filter
    if (selectedSportFilter > 0) {
      result = result.filter(course => course.sportId === selectedSportFilter);
    }
    
    setFilteredCourses(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedSportFilter, courses]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- Image Handlers ---
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- Form Handlers ---
  const resetForm = () => {
    setCourseId(null);
    setCourseName('');
    setSportId(0);
    setDescription('');
    setShortDescription('');
    setDuration('');
    setBasePriceInfo('');
    setIsActive(true);
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const uploadImages = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('/api/upload', formData);
      return response.data.paths;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Image upload failed');
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
       const headers = getAuthHeaders();
    if (!headers) return;
    e.preventDefault();
    if (sportId === 0) {
      toast.error("Please select a sport category.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload images first
      let imagePaths: string[] = [];
      if (selectedImages.length > 0) {
        imagePaths = await uploadImages(selectedImages);
      }

      // Prepare course data
      const courseData = {
        name: courseName,
        sportId: sportId,
        description: description,
        shortDescription: shortDescription,
        duration: duration,
        basePriceInfo: basePriceInfo,
        isActive: isActive,
        imagePaths: imagePaths
      };

      // Save course data
      if (courseId) {
        await axios.put(`${apiUrl}api/admin/courses/${courseId}`, courseData, { headers});
        toast.success(`Course "${courseName}" updated successfully!`);
      } else {
        await axios.post(`${apiUrl}api/admin/courses`, courseData, { headers });
        toast.success(`Course "${courseName}" created successfully!`);
      }

      // Refresh course list
      const response = await axios.get(`${apiUrl}api/admin/courses`, { headers });
      //const coursesData = Array.isArray(response.data) ? response.data : [];
      setCourses(response.data.data);
      
      resetForm();
    } catch (error) {
      toast.error("Failed to save the course. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditCourse = (course: Course) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCourseId(course.id);
    setCourseName(course.name);
    setSportId(course.sportId);
    setDescription(course.description);
    setShortDescription(course.shortDescription);
    setDuration(course.duration);
    setBasePriceInfo(course.basePriceInfo);
    setIsActive(course.isActive);
    setSelectedImages([]);
    setImagePreviews([]);
    
    // If there are existing images, show them as previews
    if (course.imagePaths && course.imagePaths.length > 0) {
      setImagePreviews(course.imagePaths.map(path => `http://localhost:8091${path}`));
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
       const headers = getAuthHeaders();
    if (!headers) return;
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`${apiUrl}api/admin/courses/${courseId}`, { headers });
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
                          onClick={() => handleEditCourse(course)}
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