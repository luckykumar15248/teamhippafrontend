// File: app/(dashboard)/admin/course-categories/page.tsx
// A dedicated page for mapping existing courses to their categories.

'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions (Corrected to match API response) ---
interface Course {
  id: number;
  name: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number | null;
}

interface CourseCategoryMapping {
  courseId: number;
  categoryId: number;
}
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const CourseCategoryMappingPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [mappedCategoryIds, setMappedCategoryIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // --- API Helper ---
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
        toast.error("Authentication session expired. Please log in again.");
        router.push('/login');
        return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  };

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const [coursesRes, categoriesRes] = await Promise.all([
                axios.get(`${apiUrl}api/admin/courses`, { headers }),
                axios.get(`${apiUrl}api/admin/categories`, { headers })
            ]);

            setCourses(coursesRes.data.data || coursesRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                 toast.error("Session expired. Please log in again.");
                 router.push('/login');
            } else {
                toast.error('Failed to load initial data.');
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    if (selectedCourseId) {
      const fetchMappings = async (courseId: number) => {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
          const res = await axios.get(`${apiUrl}api/admin/course-categories?courseId=${courseId}`, { headers });
          setMappedCategoryIds(res.data.map((c: { categoryId: number }) => c.categoryId));
        } catch (error) {
            console.error("Could not fetch mappings for course:", error);
            setMappedCategoryIds([]); // Reset on error
        }
      };
      fetchMappings(selectedCourseId);
    } else {
        setMappedCategoryIds([]);
    }
  }, [selectedCourseId]);

  const handleToggleMapping = async (categoryId: number) => {
    if (!selectedCourseId) return;

    const isMapped = mappedCategoryIds.includes(categoryId);
    setIsUpdating(true);
    
    const headers = getAuthHeaders();
    if (!headers) {
        setIsUpdating(false);
        return;
    }

    try {
      if (isMapped) {
        await axios.delete(`${apiUrl}api/admin/course-categories`, {
          headers,
          data: { courseId: selectedCourseId, categoryId },
        });
        toast.info('Category unlinked from course.');
        setMappedCategoryIds((prev) => prev.filter((id) => id !== categoryId));
      } else {
        await axios.post(`${apiUrl}api/admin/course-categories`, {
          courseId: selectedCourseId,
          categoryId,
        }, { headers });
        toast.success('Category linked to course.');
        setMappedCategoryIds((prev) => [...prev, categoryId]);
      }
    } catch (error) {
      toast.error('Failed to update mapping.');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderCategoryLabel = (cat: Category) => {
    const parent = categories.find((c) => c.categoryId === cat.parentCategoryId);
    return parent ? `${parent.categoryName} > ${cat.categoryName}` : cat.categoryName;
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Map Courses to Categories</h1>

            <div className="mb-6">
                <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">Select a Course to Manage its Categories</label>
                <select
                    id="course-select"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={selectedCourseId ?? ''}
                    onChange={(e) => setSelectedCourseId(Number(e.target.value) || null)}
                >
                    <option value="">-- Select Course --</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourseId && (
                <div>
                    <h2 className="font-semibold text-lg mb-3 text-gray-700">Available Categories</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map((cat) => (
                            <li
                                key={cat.categoryId}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                                mappedCategoryIds.includes(cat.categoryId)
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <span className="text-sm font-medium text-gray-800">{renderCategoryLabel(cat)}</span>
                                <button
                                    onClick={() => handleToggleMapping(cat.categoryId)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-full text-white shadow-sm ${
                                    mappedCategoryIds.includes(cat.categoryId)
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? '...' : (mappedCategoryIds.includes(cat.categoryId) ? 'Remove' : 'Add')}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
  );
};

export default CourseCategoryMappingPage;
