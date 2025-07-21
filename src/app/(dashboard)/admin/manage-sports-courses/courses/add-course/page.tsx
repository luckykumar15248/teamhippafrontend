'use client';

import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import JoditEditor from 'jodit-react';
import Image from 'next/image';

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
// --- API Helper ---
const getAuthHeaders = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const ITEMS_PER_PAGE = 10;

const AddNewCoursePage: React.FC = () => {
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

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/public_api/sports`);
        setSports(response.data);
      } catch (error){
        toast.error("Failed to fetch sports categories.");
        console.error(error);
      }
    };

    const fetchCourses = async () => {
      const headers = getAuthHeaders();
    if (!headers) return;
      try {
        const response = await axios.get(`${apiUrl}/api/admin/courses`, { headers });
       //const coursesData = Array.isArray(response.data) ? response.data : [];
        setCourses(response.data.data);
        setFilteredCourses(response.data.data);
      } catch(error) {
        toast.error("Failed to fetch courses.");
        console.error(error);
      }
    };
    
    fetchSports();
    fetchCourses();
  }, []);

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

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
      let imagePaths: string[] = [];
      if (selectedImages.length > 0) {
        imagePaths = await uploadImages(selectedImages);
      }

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

      if (courseId) {
       
        await axios.put(`${apiUrl}/api/admin/courses/${courseId}`, courseData, { headers });
        toast.success(`Course "${courseName}" updated successfully!`);
      } else {
        await axios.post(`${apiUrl}/api/admin/courses`, courseData, { headers } );
        toast.success(`Course "${courseName}" created successfully!`);
      }

      const response = await axios.get(`${apiUrl}/api/admin/courses`, { headers });
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
      setImagePreviews(course.imagePaths.map(path => `${apiUrl}${path}`));
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
     const headers = getAuthHeaders();
        if (!headers) return;
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`${apiUrl}/api/admin/courses/${courseId}`, { headers });
        setCourses(prev => prev.filter(c => c.id !== courseId));
        toast.success("Course deleted successfully.");
      } catch (error){
        toast.error("Failed to delete course.");
        console.error(error);
      }
    }
  };

  return (
    <div>
      {/* Form Section */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <form onSubmit={handleCourseSubmit}>
          <div className="border-b border-gray-900/10 pb-8">
            <h2 className="text-2xl font-semibold leading-7 text-gray-900">
              {courseId ? 'Edit Course' : 'Create a New Course'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {courseId ? 'Update the details for the existing course.' : 'Fill out the details to add a new course to your academy.'}
            </p>
          </div>

          <div className="border-b border-gray-900/10 pb-12 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 pt-8">
            {/* Course Name */}
            <div className="sm:col-span-4">
              <label htmlFor="courseName" className="block text-sm font-medium leading-6 text-gray-900">
                Course Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Sport Category */}
            <div className="sm:col-span-2">
              <label htmlFor="sportCategory" className="block text-sm font-medium leading-6 text-gray-900">
                Sport
              </label>
              <div className="mt-2">
                <select
                  id="sportCategory"
                  value={sportId}
                  onChange={(e) => setSportId(Number(e.target.value))}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value={0} disabled>Select a sport...</option>
                  {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div className="col-span-full">
              <label htmlFor="shortDescription" className="block text-sm font-medium leading-6 text-gray-900">
                Short Description
              </label>
              <div className="mt-2">
                <textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A quick summary for card views"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <p className="mt-2 text-xs leading-6 text-gray-600">Brief description that will appear in course cards</p>
            </div>

            {/* Full Description */}
            <div className="col-span-full">
              <label htmlFor="courseDescription" className="block text-sm font-medium leading-6 text-gray-900">
                Full Description
              </label>
              <div className="mt-2">
                <JoditEditor
                  ref={editor}
                  value={description}
                  onChange={(newContent) => setDescription(newContent)}
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <p className="mt-2 text-xs leading-6 text-gray-600">Detailed description of the course</p>
            </div>

            {/* Duration & Price Info */}
            <div className="sm:col-span-3">
              <label htmlFor="duration" className="block text-sm font-medium leading-6 text-gray-900">
                Duration
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 8 Weeks, Monthly"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="basePriceInfo" className="block text-sm font-medium leading-6 text-gray-900">
                Base Price Info
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="basePriceInfo"
                  value={basePriceInfo}
                  onChange={(e) => setBasePriceInfo(e.target.value)}
                  placeholder="e.g., ₹8,000 per term"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Image Uploader */}
            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Course Images
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                  </svg>
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleImageChange}
                        accept="image/png, image/jpeg, image/webp"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, WEBP up to 5MB</p>
                </div>d
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={src}
                        height={100}
                        width={100}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none opacity-75 group-hover:opacity-100"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Status */}
            <fieldset className="sm:col-span-3">
              <legend className="text-sm font-semibold leading-6 text-gray-900">Status</legend>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-x-3">
                  <input
                    id="status-active"
                    name="status"
                    type="radio"
                    checked={isActive}
                    onChange={() => setIsActive(true)}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="status-active" className="block text-sm font-medium leading-6 text-gray-900">
                    Active
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="status-inactive"
                    name="status"
                    type="radio"
                    checked={!isActive}
                    onChange={() => setIsActive(false)}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="status-inactive" className="block text-sm font-medium leading-6 text-gray-900">
                    Inactive
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
          
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300 flex items-center"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {courseId ? 'Update Course' : 'Save Course'}
            </button>
          </div>
        </form>
      </div>
      
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
};

export default AddNewCoursePage;