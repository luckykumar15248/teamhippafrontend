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
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  isActive: boolean;
  totalSessions: number;
  validityDays: number;
  packageLocation: string;
  includedCourses: (Course & { sessions: number })[];
  imageUrls: string[];
  createdAt: string;
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
  
  // Form State (Updated)
  const [packageName, setPackageName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [totalSessions, setTotalSessions] = useState('');
  const [validityDays, setValidityDays] = useState(''); 
  const [packageLocation, setPackageLocation] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [courseSessions, setCourseSessions] = useState<Map<number, number>>(new Map());

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

  const [filters, setFilters] = useState<FilterOptions>({ sportId: null, courseId: null, priceMin: null, priceMax: null, status: 'all', searchTerm: '' });
  const [imageSources, setImageSources] = useState<ImageSource[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
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

  const fetchData = async () => {
    setIsLoading(true);
    const headers = getAuthHeaders();
    if (!headers) { 
      router.push('/login'); 
      return; 
    }
    
    try {
      const [sportsRes, coursesRes, packagesRes, mediaRes] = await Promise.all([
        axios.get(`${apiUrl}/api/public_api/sports`),
        axios.get(`${apiUrl}/api/admin/courses`, { headers }),
        axios.get(`${apiUrl}/api/admin/packages`, { headers }),
        axios.get(`${apiUrl}/api/admin/media`, { headers }).catch(() => ({ data: [] }))
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
      
      setMediaItems(mediaRes.data || []);
      
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

  // Auto update slug when package name changes and autoSlug is true
  useEffect(() => {
    if (autoSlug && packageName) {
      setSlug(generateSlug(packageName));
    }
  }, [packageName, autoSlug]);

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

  const handleCourseSessionChange = (courseId: number, sessions: number) => {
    setCourseSessions(prev => new Map(prev).set(courseId, sessions));
  };

  const handleToggleCourse = (courseId: number) => {
    setCourseSessions(prev => {
        const newMap = new Map(prev);
        if (newMap.has(courseId)) {
            newMap.delete(courseId);
        } else {
            newMap.set(courseId, 1); // Default to 1 session when adding
        }
        return newMap;
    });
  };
  
  const handleToggleSport = (sportId: number) => {
    const coursesInSport = allCourses.filter(c => c.sportId === sportId);
    const allSelected = coursesInSport.every(c => courseSessions.has(c.id));
    setCourseSessions(prev => {
        const newMap = new Map(prev);
        if (allSelected) {
            coursesInSport.forEach(c => newMap.delete(c.id));
        } else {
            coursesInSport.forEach(c => {
                if (!newMap.has(c.id)) {
                    newMap.set(c.id, 1);
                }
            });
        }
        return newMap;
    });
  };

  const getSportSelectionState = (sportId: number) => {
    const coursesInSportIds = allCourses.filter(c => c.sportId === sportId).map(c => c.id);
    if (coursesInSportIds.length === 0) return { checked: false, indeterminate: false };
    const selectedCount = coursesInSportIds.filter(id => courseSessions.has(id)).length;
    if (selectedCount === 0) return { checked: false, indeterminate: false };
    if (selectedCount === coursesInSportIds.length) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const selectedCourses = useMemo(() => {
    return allCourses.filter(course => courseSessions.has(course.id));
  }, [courseSessions, allCourses]);

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

  // Media library functions
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

  const resetForm = () => {
    setEditingPackageId(null);
    setPackageName('');
    setSlug('');
    setAutoSlug(true);
    setShortDescription('');
    setDescription('');
    setPrice('');
    setTotalSessions('');
    setValidityDays('');
    setPackageLocation('');
    setIsActive(true);
    setCourseSessions(new Map());
    setImageSources([]);
    setImageUrlInput('');
    
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

  const handleEditClick = (pkg: Package) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingPackageId(pkg.id);
    setPackageName(pkg.name || '');
    setSlug(pkg.slug || '');
    setAutoSlug(pkg.slug ? false : true);
    setShortDescription(pkg.shortDescription || '');
    setDescription(pkg.description || '');
    setPrice(String(pkg.price || ''));
    setTotalSessions(String(pkg.totalSessions || ''));
    setValidityDays(String(pkg.validityDays || ''));
    setPackageLocation(String(pkg.packageLocation || ''));
    setIsActive(pkg.isActive ?? true);
    
    const courseSessionMap = new Map<number, number>();
    pkg.includedCourses?.forEach(course => {
        courseSessionMap.set(course.id, course.sessions || 1);
    });
    setCourseSessions(courseSessionMap);
    
    setImageSources((pkg.imageUrls || []).map(url => ({ type: 'url', url })));

    // Load SEO data if exists
    const seo = pkg.seoMetadata || {};
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
    if (courseSessions.size === 0) {
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
        
        const uploadResponse = await axios.post('api-frontend/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        uploadedFilePaths = uploadResponse.data?.paths || [];
      }

      const finalImageUrls = [...existingUrls, ...uploadedFilePaths];
      
      const seoMetadata = {
        metaTitle: metaTitle || packageName,
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

      const packageData = {
        name: packageName,
        slug: slug,
        shortDescription,
        description,
        price: parseFloat(price) || 0,
        totalSessions: parseInt(totalSessions) || 0,
        validityDays: parseInt(validityDays) || 0,
        packageLocation,
        isActive,
        courses: Array.from(courseSessions.entries()).map(([courseId, sessions]) => ({ courseId, sessions })),
        imageUrls: finalImageUrls,
        seoMetadata: seoMetadata
      };

      const headers = getAuthHeaders();
      if (!headers) { setIsSubmitting(false); router.push('/login'); return; }
      
      const endpoint = editingPackageId 
        ? `${apiUrl}/api/admin/packages/${editingPackageId}` 
        : `${apiUrl}/api/admin/packages`;
      const method = editingPackageId ? 'put' : 'post';
      console.log("Package location----->", packageData);
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

  // SEO score helper
  const getSeoScore = () => {
    const titleLen = (metaTitle || packageName).length;
    const descLen = metaDescription.length;
    const hasKeyword = metaKeywords
      ? metaKeywords
          .split(',')
          .map(k => k.trim().toLowerCase())
          .some(k => (packageName + ' ' + metaDescription).toLowerCase().includes(k))
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
                <input 
                  type="text" 
                  id="packageName" 
                  value={packageName} 
                  onChange={(e) => {
                    setPackageName(e.target.value);
                    if (autoSlug) setSlug(generateSlug(e.target.value));
                  }} 
                  required 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              {/* Slug Field */}
              <div className="md:col-span-2">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
                <div className="mt-1 flex gap-2">
                  <input
                    ref={slugInputRef}
                    type="text"
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setAutoSlug(false);
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm"
                  />
                  <div className="flex items-center">
                    <label className="text-sm flex items-center gap-1 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => {
                          setAutoSlug(e.target.checked);
                          if (e.target.checked) setSlug(generateSlug(packageName || ''));
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
                      const generatedSlug = generateSlug(packageName || '');
                      setSlug(generatedSlug);
                      setAutoSlug(false);
                      toast.info("Slug regenerated from package name");
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-500"
                  >
                    Regenerate
                  </button>
                </div>
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
              <div>
                <label htmlFor="totalSessions" className="block text-sm font-medium text-gray-700">Total Sessions</label>
                <input type="number" id="totalSessions" value={totalSessions} onChange={(e) => setTotalSessions(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., 10" />
              </div>
              <div>
                <label htmlFor="validityDays" className="block text-sm font-medium text-gray-700">Validity (in days)</label>
                <input type="number" id="validityDays" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., 90" />
              </div>
              
              <div>
                <label htmlFor="packageLocation" className="block text-sm font-medium text-gray-700">Package Location</label>
                <input type="text" id="packageLocation" value={packageLocation} onChange={(e) => setPackageLocation(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Package Location" />
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
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{course.sportName}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {courseSessions.get(course.id) || 1} session{courseSessions.get(course.id) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-center text-gray-500 py-4">No courses selected.</p>
                  )}
                </div>
                <div className="border-t mt-4 pt-4">
                  <p className="text-lg font-semibold text-gray-800 text-right">
                    Total Sessions: {Array.from(courseSessions.values()).reduce((sum, sessions) => sum + sessions, 0)}
                  </p>
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

          {/* SEO Section */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">SEO Settings</h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* SEO Score Indicator */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-4 h-4 rounded-full ${seoScore.color}`}></div>
                <span className="text-sm font-medium">{seoScore.label}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">Meta Title</label>
                  <input
                    type="text"
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-gray-500">
                      {(metaTitle || packageName).length}/60 chars
                    </span>
                    <span className={`font-semibold ${
                      (metaTitle || packageName).length < 30 ? 'text-red-500' :
                      (metaTitle || packageName).length <= 60 ? 'text-green-600' : 'text-yellow-500'
                    }`}>
                      {(metaTitle || packageName).length < 30 ? 'Too short' :
                       (metaTitle || packageName).length <= 60 ? 'Good' : 'Too long'}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="metaTitleSuffix" className="block text-sm font-medium text-gray-700">Meta Title Suffix</label>
                  <input
                    type="text"
                    id="metaTitleSuffix"
                    value={metaTitleSuffix}
                    onChange={(e) => setMetaTitleSuffix(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700">Canonical URL</label>
                  <input
                    type="text"
                    id="canonicalUrl"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">Meta Keywords</label>
                  <input
                    type="text"
                    id="metaKeywords"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
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
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">Meta Description</label>
                <textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
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
              <div>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="text-sm font-semibold mb-2">Google SERP Preview</h4>
                  <div className="space-y-1">
                    <div className="text-indigo-700 text-lg truncate">
                      {(metaTitle || packageName).slice(0, 60)} {metaTitleSuffix}
                    </div>
                    <div className="text-green-700 text-sm">
                      {canonicalUrl || `https://example.com/packages/${slug}`}
                    </div>
                    <div className="text-gray-600 text-sm line-clamp-2">
                      {metaDescription || shortDescription || 'This is how your meta description will appear in search results.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Open Graph */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-lg mb-4">Open Graph (Social)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ogTitle" className="block text-sm font-medium text-gray-700">OG Title</label>
                    <input
                      type="text"
                      id="ogTitle"
                      value={ogTitle}
                      onChange={(e) => setOgTitle(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">OG Image</label>
                    <div className="mt-1">
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
                  <label htmlFor="ogDescription" className="block text-sm font-medium text-gray-700">OG Description</label>
                  <textarea
                    id="ogDescription"
                    value={ogDescription}
                    onChange={(e) => setOgDescription(e.target.value)}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>

              {/* Twitter Card */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-lg mb-4">Twitter Card</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="twitterCard" className="block text-sm font-medium text-gray-700">Twitter Card Type</label>
                    <select
                      id="twitterCard"
                      value={twitterCard}
                      onChange={(e) => setTwitterCard(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="summary">summary</option>
                      <option value="summary_large_image">summary_large_image</option>
                      <option value="app">app</option>
                      <option value="player">player</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Twitter Image</label>
                    <div className="mt-1">
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
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="twitterTitle" className="block text-sm font-medium text-gray-700">Twitter Title</label>
                    <input
                      type="text"
                      id="twitterTitle"
                      value={twitterTitle}
                      onChange={(e) => setTwitterTitle(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitterDescription" className="block text-sm font-medium text-gray-700">Twitter Description</label>
                    <input
                      type="text"
                      id="twitterDescription"
                      value={twitterDescription}
                      onChange={(e) => setTwitterDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced SEO */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-lg mb-4">Advanced SEO</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="structuredData" className="block text-sm font-medium text-gray-700">Structured Data (JSON-LD)</label>
                    <textarea
                      id="structuredData"
                      value={structuredData}
                      onChange={(e) => setStructuredData(e.target.value)}
                      rows={6}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm font-mono"
                      placeholder='{"@context":"https://schema.org", ...}'
                    />
                  </div>
                  <div>
                    <label htmlFor="customMetaTags" className="block text-sm font-medium text-gray-700">Custom Meta Tags (JSON)</label>
                    <textarea
                      id="customMetaTags"
                      value={customMetaTags}
                      onChange={(e) => setCustomMetaTags(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm font-mono"
                      placeholder='[{"name":"robots","content":"noindex"}]'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Select Courses & Set Session Limits</h3>
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
                    <ul className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                      {sportCourses.map(course => (
                        <li key={course.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`course-${course.id}`} 
                              checked={courseSessions.has(course.id)} 
                              onChange={() => handleToggleCourse(course.id)} 
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                            />
                            <label htmlFor={`course-${course.id}`} className="ml-3 text-sm text-gray-600">{course.name}</label>
                          </div>
                          {courseSessions.has(course.id) && (
                            <input
                              type="number"
                              value={courseSessions.get(course.id) || 1}
                              onChange={(e) => handleCourseSessionChange(course.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center text-sm p-1 border rounded-md"
                              min="1"
                            />
                          )}
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

      {/* Rest of the component remains the same */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
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
                        <div>
                          <span className="font-medium">Sessions:</span> {pkg.totalSessions}
                        </div>
                        <div>
                          <span className="font-medium">Validity:</span> {pkg.validityDays} days
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {pkg.includedCourses?.length || 0} {pkg.includedCourses?.length === 1 ? 'course' : 'courses'}
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