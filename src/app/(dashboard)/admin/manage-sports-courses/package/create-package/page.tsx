'use client';

import React, { useState, useEffect, useMemo, ChangeEvent, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import JoditEditor from 'jodit-react';

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
}

interface Package {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  isActive: boolean;
  courseIds?: number[];
  includedCourses: Course[];
  imageUrls: string[];
  createdAt: string;
}

type ImageSource = {
  type: 'file';
  file: File;
  preview: string;
} | {
  type: 'url';
  url: string;
};

interface FilterOptions {
  sportId: number | null;
  courseId: number | null;
  priceMin: number | null;
  priceMax: number | null;
  status: 'all' | 'active' | 'inactive';
  searchTerm: string;
}

const ITEMS_PER_PAGE = 5;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getAuthHeaders = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('authToken');
  if (!token) {
    toast.error("Authentication session expired. Please log in again.");
    return null;
  }
  return { 'Authorization': `Bearer ${token}` };
};

const ManagePackagesPage: React.FC = () => {
  const [allSports, setAllSports] = useState<Sport[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [packageName, setPackageName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<FilterOptions>({
    sportId: null,
    courseId: null,
    priceMin: null,
    priceMax: null,
    status: 'all',
    searchTerm: ''
  });
  const [imageSources, setImageSources] = useState<ImageSource[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const editor = useRef(null);

  const fetchData = async () => {
    setIsLoading(true);
    const headers = getAuthHeaders();
    if (!headers) { 
      router.push('/login'); 
      return; 
    }
    
    try {
      const [sportsRes, coursesRes, packagesRes] = await Promise.all([
        axios.get(`${apiUrl}/api/public_api/sports`),
        axios.get(`${apiUrl}/api/admin/courses`, { headers }),
        axios.get(`${apiUrl}/api/admin/packages`, { headers })
      ]);
      
      const sportsData = sportsRes.data || [];
      setAllSports(sportsData);
      
      const coursesData = coursesRes.data?.data || [];
      const coursesWithSportName = coursesData.map((course: Course) => ({
        id: course.id, 
        name: course.name || 'Unnamed Course',
        sportId: course.sportId || 0,
        sportName: sportsData.find((s: Sport) => s.id === course.sportId)?.name || 'Unknown Sport',
        description: course.description || ''
      }));
      setAllCourses(coursesWithSportName);
      
      const packagesData = packagesRes.data || [];
      const sortedPackages = [...packagesData].sort((a: Package, b: Package) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setAllPackages(sortedPackages);
      
    } catch (error: unknown) {
      console.error("Fetch error:", error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to load data.");
      } else {
        toast.error("Failed to load data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filtered = allPackages.filter(pkg => {
      if (!pkg) return false;
      
      if (filters.searchTerm && 
          !(pkg.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()))) {
        return false;
      }
      
      if (filters.sportId !== null) {
        const packageSportIds = new Set(
          pkg.includedCourses
            ?.filter(c => c.sportId !== null && c.sportId !== undefined)
            .map(c => c.sportId)
        );
        if (!packageSportIds.has(filters.sportId)) return false;
      }
      
      if (filters.courseId !== null && !pkg.includedCourses?.some(c => c.id === filters.courseId)) {
        return false;
      }
      
      if (filters.priceMin !== null && (pkg.price || 0) < filters.priceMin) return false;
      if (filters.priceMax !== null && (pkg.price || 0) > filters.priceMax) return false;
      
      if (filters.status === 'active' && !pkg.isActive) return false;
      if (filters.status === 'inactive' && pkg.isActive) return false;
      
      return true;
    });
    
    setFilteredPackages(filtered);
    setCurrentPage(1);
  }, [allPackages, filters]);

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const paginatedPackages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPackages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPackages, currentPage]);

  const handleToggleCourse = (courseId: number) => {
    setSelectedCourseIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) newSet.delete(courseId); 
      else newSet.add(courseId);
      return newSet;
    });
  };
  
  const handleToggleSport = (sportId: number) => {
    const coursesInSport = allCourses.filter(c => c.sportId === sportId).map(c => c.id);
    const allSelected = coursesInSport.every(id => selectedCourseIds.has(id));
    setSelectedCourseIds(prev => {
      const newSet = new Set(prev);
      if (allSelected) coursesInSport.forEach(id => newSet.delete(id));
      else coursesInSport.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const getSportSelectionState = (sportId: number) => {
    const coursesInSportIds = allCourses.filter(c => c.sportId === sportId).map(c => c.id);
    if (coursesInSportIds.length === 0) return { checked: false, indeterminate: false };
    const selectedCount = coursesInSportIds.filter(id => selectedCourseIds.has(id)).length;
    if (selectedCount === 0) return { checked: false, indeterminate: false };
    if (selectedCount === coursesInSportIds.length) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const selectedCourses = useMemo(() => {
    return allCourses.filter(course => selectedCourseIds.has(course.id));
  }, [selectedCourseIds, allCourses]);

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImageSources: ImageSource[] = files
        .map(file => ({ type: 'file', file, preview: URL.createObjectURL(file) }));
      setImageSources(prev => [...prev, ...newImageSources]);
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput && imageUrlInput.startsWith('http')) {
      setImageSources(prev => [...prev, { type: 'url', url: imageUrlInput }]);
      setImageUrlInput('');
    } else {
      toast.error("Please enter a valid URL.");
    }
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    const sourceToRemove = imageSources[indexToRemove];
    if (sourceToRemove.type === 'file') URL.revokeObjectURL(sourceToRemove.preview);
    setImageSources(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const resetForm = () => {
    setEditingPackageId(null);
    setPackageName('');
    setShortDescription('');
    setDescription('');
    setPrice('');
    setIsActive(true);
    setSelectedCourseIds(new Set());
    setImageSources([]);
    setImageUrlInput('');
  };

  const handleEditClick = (pkg: Package) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingPackageId(pkg.id);
    setPackageName(pkg.name || '');
    setShortDescription(pkg.shortDescription || '');
    setDescription(pkg.description || '');
    setPrice(String(pkg.price || ''));
    setIsActive(pkg.isActive ?? true);
    
    // Get course IDs from includedCourses
    const courseIds = pkg.includedCourses?.map(course => course.id) || [];
    setSelectedCourseIds(new Set(courseIds));
    
    setImageSources((pkg.imageUrls || []).map(url => ({ type: 'url', url })));
  };
  
  const handleDeleteClick = async (packageId: number) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      const headers = getAuthHeaders();
      if (!headers) { router.push('/login'); return; }
      
      try {
        await axios.delete(`${apiUrl}/api/admin/packages/${packageId}`, { headers });
        toast.success("Package deleted successfully.");
        fetchData();
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Failed to delete package.");
        } else {
          toast.error("Failed to delete package.");
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourseIds.size === 0) {
      toast.error("You must select at least one course for the package.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const filesToUpload = imageSources.filter(s => s.type === 'file') as Extract<ImageSource, {type: 'file'}>[];
      const existingUrls = imageSources.filter(s => s.type === 'url').map(s => s.url);
      
      let uploadedFilePaths: string[] = [];
      if (filesToUpload.length > 0) {
        const uploadFormData = new FormData();
        filesToUpload.forEach(source => {
          uploadFormData.append('files', source.file);
        });
        
        const uploadResponse = await axios.post('/api/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        uploadedFilePaths = uploadResponse.data?.paths || [];
      }

      const finalImageUrls = [...existingUrls, ...uploadedFilePaths];
      
      const packageData = {
        name: packageName,
        shortDescription,
        description,
        price: parseFloat(price) || 0,
        isActive,
        courseIds: Array.from(selectedCourseIds),
        imageUrls: finalImageUrls,
      };

      const headers = getAuthHeaders();
      if (!headers) { setIsSubmitting(false); router.push('/login'); return; }
      
      const endpoint = editingPackageId 
        ? `${apiUrl}/api/admin/packages/${editingPackageId}` 
        : `${apiUrl}/api/admin/packages`;
      const method = editingPackageId ? 'put' : 'post';

      const response = await axios[method](endpoint, packageData, { headers });

      if (response.data?.success) {
        toast.success(response.data.message || "Operation successful");
        resetForm();
        fetchData();
      } else {
        toast.error(response.data?.message || "An error occurred.");
      }
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to save package.");
      } else {
        toast.error("Failed to save package.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (
    field: keyof FilterOptions,
    value: string | number | null | 'all' | 'active' | 'inactive'
  ) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      sportId: null,
      courseId: null,
      priceMin: null,
      priceMax: null,
      status: 'all',
      searchTerm: ''
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold leading-7 text-gray-900 border-b border-gray-900/10 pb-6 mb-6">
            {editingPackageId ? `Editing Package (ID: ${editingPackageId})` : 'Create a New Package'}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="packageName" className="block text-sm font-medium text-gray-700">Package Name</label>
                <input type="text" id="packageName" value={packageName} onChange={(e) => setPackageName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">Short Description</label>
                <input type="text" id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="A brief summary for card views" />
              </div>
              <div>
                <label htmlFor="packagePrice" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <input type="number" id="packagePrice" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="status" value={String(isActive)} onChange={(e) => setIsActive(e.target.value === 'true')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <div className="mt-1">
                  <JoditEditor ref={editor} value={description} onBlur={newContent => setDescription(newContent)} />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1 space-y-6 sticky top-24">
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Package Summary</h3>
                <div className="max-h-48 overflow-y-auto pr-2">
                  {selectedCourses.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedCourses.map(course => (
                        <li key={course.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{course.name}</span>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{course.sportName}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-center text-gray-500 py-4">No courses selected.</p>
                  )}
                </div>
                <div className="border-t mt-4 pt-4">
                  <p className="text-lg font-semibold text-gray-800 text-right">Total Courses: {selectedCourses.length}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Images</label>
                <div className="flex items-center gap-2 mb-4">
                  <input type="url" placeholder="Add image by URL" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} className="block w-full text-sm rounded-md border-gray-300 shadow-sm" />
                  <button type="button" onClick={handleAddImageUrl} className="bg-gray-200 text-gray-700 px-3 py-2 text-sm font-semibold rounded-md hover:bg-gray-300">Add</button>
                </div>
                <label htmlFor="file-upload" className="w-full relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none hover:text-indigo-500 border border-indigo-600 p-2 text-center block">
                  <span>Upload from Computer</span>
                  <input id="file-upload" type="file" multiple className="sr-only" onChange={handleImageFileChange} accept="image/png, image/jpeg" />
                </label>
                {imageSources.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {imageSources.map((source, index) => (
                      <div key={index} className="relative group">
                        <img src={source.type === 'file' ? source.preview : source.url} alt={`Preview ${index + 1}`} className="h-20 w-full object-cover rounded-md" />
                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Select Courses</h3>
            <input 
              type="text" 
              placeholder="Search courses to add..." 
              className="mb-4 block w-full rounded-md border-gray-300 shadow-sm" 
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
              {allSports.map(sport => {
                const sportCourses = allCourses.filter(c => c.sportId === sport.id);
                if (sportCourses.length === 0) return null;
                const { checked, indeterminate } = getSportSelectionState(sport.id);
                return (
                  <div key={sport.id} className="rounded-md border border-gray-200">
                    <div className="bg-gray-50 p-3 flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                        checked={checked} 
                        ref={el => { if (el) el.indeterminate = indeterminate; }} 
                        onChange={() => handleToggleSport(sport.id)} 
                      />
                      <label className="font-semibold text-gray-700">{sport.name}</label>
                    </div>
                    <ul className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {sportCourses.map(course => (
                        <li key={course.id} className="flex items-center">
                          <input 
                            type="checkbox" 
                            id={`course-${course.id}`} 
                            checked={selectedCourseIds.has(course.id)} 
                            onChange={() => handleToggleCourse(course.id)} 
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                          />
                          <label htmlFor={`course-${course.id}`} className="ml-3 text-sm text-gray-600">{course.name}</label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="mt-8 pt-5 border-t border-gray-200 flex items-center justify-end gap-x-4">
            <button type="button" onClick={resetForm} className="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
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
              {editingPackageId ? 'Update Package' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
            <select
              value={filters.sportId || ''}
              onChange={(e) => handleFilterChange('sportId', e.target.value ? parseInt(e.target.value) : null)}
              className="block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">All Sports</option>
              {allSports.map(sport => (
                <option key={sport.id} value={sport.id}>{sport.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={filters.courseId || ''}
              onChange={(e) => handleFilterChange('courseId', e.target.value ? parseInt(e.target.value) : null)}
              className="block w-full rounded-md border-gray-300 shadow-sm"
              disabled={!filters.sportId}
            >
              <option value="">All Courses</option>
              {allCourses
                .filter(course => !filters.sportId || course.sportId === filters.sportId)
                .map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin || ''}
                onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseFloat(e.target.value) : null)}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax || ''}
                onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseFloat(e.target.value) : null)}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value as 'all' | 'active' | 'inactive')}
              className="block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="w-full max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search packages..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Packages ({filteredPackages.length})</h3>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No packages found matching your criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{pkg.name}</div>
                        {pkg.shortDescription && (
                          <div className="text-sm text-gray-500 mt-1">{pkg.shortDescription}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{pkg.price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pkg.includedCourses?.length || 0} {pkg.includedCourses?.length === 1 ? 'course' : 'courses'}
                        <div className="text-xs text-gray-400 mt-1">
                          {Array.from(new Set(
                            pkg.includedCourses?.map(c => c.sportName) || []
                          )).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pkg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                        <button 
                          onClick={() => handleEditClick(pkg)} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(pkg.id)} 
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPackages.length)}</span> of{' '}
                    <span className="font-medium">{filteredPackages.length}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === page ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManagePackagesPage;