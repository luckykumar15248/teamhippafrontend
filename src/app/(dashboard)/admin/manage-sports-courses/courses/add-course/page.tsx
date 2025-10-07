'use client';

import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
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
  shortDescription: string;
  duration: string;
  basePriceInfo: string;
  isActive: boolean;
  imagePaths?: string[];
  slug?: string;
  seoMetadata?: SEOData;
}

interface SEOData {
  metaTitle?: string;
  metaTitleSuffix?: string;
  metaDescription?: string;
  serpPreviewText?: string;
  metaKeywords?: string;
  metaRobots?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageId?: number | null;
  ogImageAlt?: string | null;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageId?: number | null;
  twitterImageAlt?: string | null;
  structuredData?: object | null;
  customMetaTags?: object | null;
}

interface MediaItem {
  id: number;
  mediaUrl: string;
  altText?: string;
  fileName?: string;
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
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
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

  // SEO states
  const [metaTitle, setMetaTitle] = useState('');
  const [metaTitleSuffix, setMetaTitleSuffix] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [serpPreviewText, setSerpPreviewText] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [metaRobots, setMetaRobots] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [twitterCard, setTwitterCard] = useState('summary_large_image');
  const [twitterTitle, setTwitterTitle] = useState('');
  const [twitterDescription, setTwitterDescription] = useState('');
  const [structuredData, setStructuredData] = useState('');
  const [customMetaTags, setCustomMetaTags] = useState('');

  // Media states
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [selectedMediaTab, setSelectedMediaTab] = useState<'upload' | 'library'>('library');
  const [ogImage, setOgImage] = useState<MediaItem | null>(null);
  const [twitterImage, setTwitterImage] = useState<MediaItem | null>(null);

  const editor = useRef(null);
  const slugInputRef = useRef<HTMLInputElement | null>(null);

  // Slug generator helper
  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
      .replace(/^-+|-+$/g, '');
  };

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
        setCourses(response.data.data);
        setFilteredCourses(response.data.data);
      } catch(error) {
        toast.error("Failed to fetch courses.");
        console.error(error);
      }
    };

    const fetchMedia = async () => {
      const headers = getAuthHeaders();
      if (!headers) return;
      try {
        const response = await axios.get(`${apiUrl}/api/admin/media`, { headers });
        setMediaItems(response.data || []);
      } catch (error) {
        console.error("Failed to fetch media items", error);
      }
    };
    
    fetchSports();
    fetchCourses();
    fetchMedia();
  }, []);

  // Auto update slug when course name changes and autoSlug is true
  useEffect(() => {
    if (autoSlug && courseName) {
      setSlug(generateSlug(courseName));
    }
  }, [courseName, autoSlug]);

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
    setSlug('');
    setAutoSlug(true);
    setSportId(0);
    setDescription('');
    setShortDescription('');
    setDuration('');
    setBasePriceInfo('');
    setIsActive(true);
    setSelectedImages([]);
    setImagePreviews([]);
    
    // Reset SEO fields
    setMetaTitle('');
    setMetaTitleSuffix('');
    setMetaDescription('');
    setSerpPreviewText('');
    setMetaKeywords('');
    setMetaRobots('');
    setCanonicalUrl('');
    setOgTitle('');
    setOgDescription('');
    setTwitterCard('summary_large_image');
    setTwitterTitle('');
    setTwitterDescription('');
    setStructuredData('');
    setCustomMetaTags('');
    setOgImage(null);
    setTwitterImage(null);
  };

  const uploadImages = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('/api-frontend/upload', formData);
      return response.data.paths;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Image upload failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const headers = getAuthHeaders();
    if (!headers) {
      toast.error("Not authenticated");
      return;
    }
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await axios.post(`${apiUrl}/api/admin/media/upload`, form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      const item: MediaItem = res.data;
      setMediaItems(prev => [item, ...prev]);
      toast.success("Uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  const handleMediaAction = (item: MediaItem, action: 'og' | 'twitter') => {
    if (action === 'og') {
      setOgImage(item);
    } else if (action === 'twitter') {
      setTwitterImage(item);
    }
    setShowMediaLibrary(false);
  };

  const openMediaModalFor = (target: 'og' | 'twitter') => {
    setSelectedMediaTab('library');
    setShowMediaLibrary(true);
    console.log("Opening media modal for:", target);
  };

  const focusSlugInput = () => {
    setTimeout(() => slugInputRef.current?.focus(), 50);
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

      const seoMetadata = {
        metaTitle: metaTitle || courseName,
        metaTitleSuffix,
        metaDescription,
        serpPreviewText,
        metaKeywords,
        metaRobots,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImageId: ogImage?.id || null,
        ogImageAlt: ogImage?.altText || null,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImageId: twitterImage?.id || null,
        twitterImageAlt: twitterImage?.altText || null,
        structuredData: structuredData ? (() => {
          try {
            return JSON.parse(structuredData);
          } catch {
            return null;
          }
        })() : null,
        customMetaTags: customMetaTags ? (() => {
          try {
            return JSON.parse(customMetaTags);
          } catch {
            return null;
          }
        })() : null,
      };

      const courseData = {
        name: courseName,
        slug: slug,
        sportId: sportId,
        description: description,
        shortDescription: shortDescription,
        duration: duration,
        basePriceInfo: basePriceInfo,
        isActive: isActive,
        imagePaths: imagePaths,
        seoMetadata: seoMetadata
      };

      if (courseId) {
        await axios.put(`${apiUrl}/api/admin/courses/${courseId}`, courseData, { headers });
            console.log("Course data is->>>>", courseData);
        toast.success(`Course "${courseName}" updated successfully!`);
      } else {
        await axios.post(`${apiUrl}/api/admin/courses`, courseData, { headers });
        console.log("Course data is->>>>", courseData);
        toast.success(`Course "${courseName}" created successfully!`);
      }

      const response = await axios.get(`${apiUrl}/api/admin/courses`, { headers });
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
    setSlug(course.slug || '');
    setAutoSlug(course.slug ? false : true);
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

    // Load SEO data if exists
    const seo = course.seoMetadata || {};
    setMetaTitle(seo.metaTitle || '');
    setMetaTitleSuffix(seo.metaTitleSuffix || '');
    setMetaDescription(seo.metaDescription || '');
    setSerpPreviewText(seo.serpPreviewText || '');
    setMetaKeywords(seo.metaKeywords || '');
    setMetaRobots(seo.metaRobots || '');
    setCanonicalUrl(seo.canonicalUrl || '');
    setOgTitle(seo.ogTitle || '');
    setOgDescription(seo.ogDescription || '');
    setTwitterCard(seo.twitterCard || 'summary_large_image');
    setTwitterTitle(seo.twitterTitle || '');
    setTwitterDescription(seo.twitterDescription || '');
    setStructuredData(seo.structuredData ? JSON.stringify(seo.structuredData, null, 2) : '');
    setCustomMetaTags(seo.customMetaTags ? JSON.stringify(seo.customMetaTags, null, 2) : '');
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

  // SEO score helper
  const getSeoScore = () => {
    const titleLen = (metaTitle || courseName).length;
    const descLen = metaDescription.length;
    const hasKeyword = metaKeywords
      ? metaKeywords
          .split(',')
          .map(k => k.trim().toLowerCase())
          .some(k => (courseName + ' ' + metaDescription).toLowerCase().includes(k))
      : false;
    let score = 0;
    if (titleLen >= 30 && titleLen <= 60) score++;
    if (descLen >= 50 && descLen <= 160) score++;
    if (metaKeywords && hasKeyword) score++;
    if (score === 3) return { label: 'Good SEO score', color: 'bg-green-500' };
    if (score === 2) return { label: 'Needs Improvement', color: 'bg-yellow-400' };
    return { label: 'Poor SEO', color: 'bg-red-500' };
  };
  const seoScore = getSeoScore();

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
                  onChange={(e) => {
                    setCourseName(e.target.value);
                    if (autoSlug) setSlug(generateSlug(e.target.value));
                  }}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Slug */}
            <div className="sm:col-span-2">
              <label htmlFor="slug" className="block text-sm font-medium leading-6 text-gray-900">
                Slug
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  ref={slugInputRef}
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setAutoSlug(false);
                  }}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div className="flex items-center">
                  <label className="text-sm flex items-center gap-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={(e) => {
                        setAutoSlug(e.target.checked);
                        if (e.target.checked) setSlug(generateSlug(courseName || ''));
                      }}
                      className="rounded"
                    />
                    Auto
                  </label>
                </div>
              </div>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAutoSlug(false);
                    focusSlugInput();
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-500"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const generatedSlug = generateSlug(courseName || '');
                    setSlug(generatedSlug);
                    setAutoSlug(false);
                    toast.info("Slug regenerated from course name");
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-500"
                >
                  Regenerate
                </button>
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
                </div>
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
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

          {/* SEO Section */}
          <div className="border-b border-gray-900/10 pb-12 pt-8">
            <h3 className="text-xl font-semibold leading-7 text-gray-900 mb-6">SEO Settings</h3>
            
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* SEO Score Indicator */}
              <div className="col-span-full flex items-center gap-2 mb-4">
                <div className={`w-4 h-4 rounded-full ${seoScore.color}`}></div>
                <span className="text-sm font-medium">{seoScore.label}</span>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="metaTitle" className="block text-sm font-medium leading-6 text-gray-900">
                  Meta Title
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-gray-500">
                    {(metaTitle || courseName).length}/60 chars
                  </span>
                  <span className={`font-semibold ${
                    (metaTitle || courseName).length < 30 ? 'text-red-500' :
                    (metaTitle || courseName).length <= 60 ? 'text-green-600' : 'text-yellow-500'
                  }`}>
                    {(metaTitle || courseName).length < 30 ? 'Too short' :
                     (metaTitle || courseName).length <= 60 ? 'Good' : 'Too long'}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="metaTitleSuffix" className="block text-sm font-medium leading-6 text-gray-900">
                  Meta Title Suffix
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="metaTitleSuffix"
                    value={metaTitleSuffix}
                    onChange={(e) => setMetaTitleSuffix(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="canonicalUrl" className="block text-sm font-medium leading-6 text-gray-900">
                  Canonical URL
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="canonicalUrl"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="metaKeywords" className="block text-sm font-medium leading-6 text-gray-900">
                  Meta Keywords
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="metaKeywords"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-gray-500">{metaKeywords.length}/255 chars</span>
                  <span className={`font-semibold ${
                    metaKeywords.length === 0 ? 'text-red-500' :
                    metaKeywords.length <= 255 ? 'text-green-600' : 'text-yellow-500'
                  }`}>
                    {metaKeywords.length === 0 ? 'Missing' :
                     metaKeywords.length <= 255 ? 'OK' : 'Too long'}
                  </span>
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="metaDescription" className="block text-sm font-medium leading-6 text-gray-900">
                  Meta Description
                </label>
                <div className="mt-2">
                  <textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-gray-500">{metaDescription.length}/160 chars</span>
                  <span className={`font-semibold ${
                    metaDescription.length < 50 ? 'text-red-500' :
                    metaDescription.length <= 160 ? 'text-green-600' : 'text-yellow-500'
                  }`}>
                    {metaDescription.length < 50 ? 'Too short' :
                     metaDescription.length <= 160 ? 'Good' : 'Too long'}
                  </span>
                </div>
              </div>

              {/* SERP Preview */}
              <div className="col-span-full">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="text-sm font-semibold mb-2">Google SERP Preview</h4>
                  <div className="space-y-1">
                    <div className="text-indigo-700 text-lg truncate">
                      {(metaTitle || courseName).slice(0, 60)} {metaTitleSuffix}
                    </div>
                    <div className="text-green-700 text-sm">
                      {canonicalUrl || `https://example.com/courses/${slug}`}
                    </div>
                    <div className="text-gray-600 text-sm line-clamp-2">
                      {metaDescription || shortDescription || 'This is how your meta description will appear in search results.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Open Graph */}
              <div className="col-span-full border-t pt-6">
                <h4 className="font-medium text-lg mb-4">Open Graph (Social)</h4>
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ogTitle" className="block text-sm font-medium leading-6 text-gray-900">
                      OG Title
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="ogTitle"
                        value={ogTitle}
                        onChange={(e) => setOgTitle(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      OG Image
                    </label>
                    <div className="mt-2">
                      {ogImage ? (
                        <div className="flex flex-col gap-2">
                          <img
                            src={ogImage.mediaUrl}
                            alt={ogImage.altText || ''}
                            className="w-full h-32 object-cover rounded"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openMediaModalFor('og')}
                              className="text-sm text-indigo-600"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => setOgImage(null)}
                              className="text-sm text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openMediaModalFor('og')}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400"
                        >
                          Choose OG Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="ogDescription" className="block text-sm font-medium leading-6 text-gray-900">
                    OG Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="ogDescription"
                      value={ogDescription}
                      onChange={(e) => setOgDescription(e.target.value)}
                      rows={2}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>

              {/* Twitter Card */}
              <div className="col-span-full border-t pt-6">
                <h4 className="font-medium text-lg mb-4">Twitter Card</h4>
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                  <div>
                    <label htmlFor="twitterCard" className="block text-sm font-medium leading-6 text-gray-900">
                      Twitter Card Type
                    </label>
                    <div className="mt-2">
                      <select
                        id="twitterCard"
                        value={twitterCard}
                        onChange={(e) => setTwitterCard(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="summary">summary</option>
                        <option value="summary_large_image">summary_large_image</option>
                        <option value="app">app</option>
                        <option value="player">player</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Twitter Image
                    </label>
                    <div className="mt-2">
                      {twitterImage ? (
                        <div className="flex flex-col gap-2">
                          <img
                            src={twitterImage.mediaUrl}
                            alt={twitterImage.altText || ''}
                            className="w-full h-32 object-cover rounded"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openMediaModalFor('twitter')}
                              className="text-sm text-indigo-600"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => setTwitterImage(null)}
                              className="text-sm text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openMediaModalFor('twitter')}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400"
                        >
                          Choose Twitter Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                  <div>
                    <label htmlFor="twitterTitle" className="block text-sm font-medium leading-6 text-gray-900">
                      Twitter Title
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="twitterTitle"
                        value={twitterTitle}
                        onChange={(e) => setTwitterTitle(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="twitterDescription" className="block text-sm font-medium leading-6 text-gray-900">
                      Twitter Description
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="twitterDescription"
                        value={twitterDescription}
                        onChange={(e) => setTwitterDescription(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced SEO */}
              <div className="col-span-full border-t pt-6">
                <h4 className="font-medium text-lg mb-4">Advanced SEO</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="structuredData" className="block text-sm font-medium leading-6 text-gray-900">
                      Structured Data (JSON-LD)
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="structuredData"
                        value={structuredData}
                        onChange={(e) => setStructuredData(e.target.value)}
                        rows={6}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono"
                        placeholder='{"@context":"https://schema.org", ...}'
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="customMetaTags" className="block text-sm font-medium leading-6 text-gray-900">
                      Custom Meta Tags (JSON)
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="customMetaTags"
                        value={customMetaTags}
                        onChange={(e) => setCustomMetaTags(e.target.value)}
                        rows={4}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono"
                        placeholder='[{"name":"robots","content":"noindex"}]'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Media Library</h3>
              <div className="flex items-center gap-2">
                <div className="flex border rounded overflow-hidden">
                  <button
                    className={`px-4 py-2 ${
                      selectedMediaTab === 'library' ? 'bg-white text-indigo-600' : 'text-gray-600'
                    }`}
                    onClick={() => setSelectedMediaTab('library')}
                  >
                    Library
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      selectedMediaTab === 'upload' ? 'bg-white text-indigo-600' : 'text-gray-600'
                    }`}
                    onClick={() => setSelectedMediaTab('upload')}
                  >
                    Upload
                  </button>
                </div>
                <button
                  onClick={() => setShowMediaLibrary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              {selectedMediaTab === 'upload' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    id="admin-file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="admin-file-upload"
                    className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg inline-block"
                  >
                    Select Files
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    or drag and drop files here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg overflow-hidden relative"
                    >
                      <img
                        src={item.mediaUrl}
                        alt={item.altText || ''}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-2">
                        <div className="text-sm truncate mb-2">
                          {item.fileName || item.mediaUrl.split('/').pop() || ''}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleMediaAction(item, 'og')}
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            OG
                          </button>
                          <button
                            onClick={() => handleMediaAction(item, 'twitter')}
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            Twitter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component (Search, Filter, and Course List) remains the same */}
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