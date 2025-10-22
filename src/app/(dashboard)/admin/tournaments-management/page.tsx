"use client";

import React, { useEffect, useState, useRef, JSX } from "react";
import {useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { toast } from 'react-toastify';

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
console.log("API URL:", apiUrl);

function slugify(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface Tournament {
  tournamentId?: number;
  title: string;
  slug: string;
  description: string;
  locationName: string;
  locationAddress?: string;
  startDate: string;
  endDate: string;
  levelCategory: "JUNIOR" | "ADULT" | "OPEN" | "PRO";
  divisions: string;
  bookingLink?: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  isActive?: boolean;
  organizerName?: string;
  organizerContact?: string;
  featuredImageId?: number;
  // Individual SEO fields for the form
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoOgImage?: string;
  seoTwitterCard?: string;
  seoCanonicalUrl?: string;
  // Nested SEO metadata for backend (optional in interface since we transform it)
  seoMetadata?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    twitterCard?: string;
    canonicalUrl?: string;
      };
  featuredImage?: {
    id: number;
    url: string;
  } | null;
}

interface MediaImage {
  id: number;
  mediaUrl: string;
  altText?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const levels = ["JUNIOR", "ADULT", "OPEN", "PRO"] as const;
const statuses = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"] as const;
const twitterCardTypes = ["summary", "summary_large_image", "app", "player"] as const;

export default function AdminTournamentPage(): JSX.Element {
  const { register, handleSubmit, reset, watch, setValue } = useForm<Tournament>();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSlugAuto, setIsSlugAuto] = useState<boolean>(true);
  const [showImageSelector, setShowImageSelector] = useState<boolean>(false);
  const [mediaLibrary, setMediaLibrary] = useState<MediaImage[]>([]);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false
  });
  const [loadingTournaments, setLoadingTournaments] = useState<boolean>(false);

  const editor = useRef(null);

  const title = watch("title");
  const seoMetaTitle = watch("seoMetaTitle") || "";
  const seoMetaDescription = watch("seoMetaDescription") || "";
  const featuredImageId = watch("featuredImageId");

  useEffect(() => {
    if (title && isSlugAuto) {
      setValue("slug", slugify(title));
    }
  }, [title, isSlugAuto, setValue]);

  useEffect(() => {
    loadTournaments();
    loadMediaLibrary();
  }, [pagination.currentPage]);

  function getAuthHeaders(): HeadersInit {
    if (typeof window === "undefined") {
      return {};
    }
    const token = localStorage.getItem("authToken");
    return token ? { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    } : {};
  }

  async function loadTournaments(page: number = pagination.currentPage) {
    setLoadingTournaments(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/tournaments?page=${page - 1}&size=${pagination.pageSize}`, { 
        headers: getAuthHeaders() 
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched tournaments:", data);
        
        if (data.content) {
          // Handle Spring Boot pagination response
          setTournaments(data.content);
          setPagination({
            currentPage: data.number + 1,
            totalPages: data.totalPages,
            totalItems: data.totalElements,
            pageSize: data.size,
            hasNext: !data.last,
            hasPrevious: !data.first
          });
        } else if (Array.isArray(data)) {
          // Handle array response without pagination
          setTournaments(data);
          setPagination(prev => ({
            ...prev,
            totalItems: data.length,
            totalPages: Math.ceil(data.length / prev.pageSize)
          }));
        } else {
          // Handle custom pagination response
          setTournaments(data.tournaments || data.items || []);
          setPagination(data.pagination || {
            currentPage: data.currentPage || 1,
            totalPages: data.totalPages || 1,
            totalItems: data.totalItems || data.totalCount || 0,
            pageSize: data.pageSize || 10,
            hasNext: data.hasNext || false,
            hasPrevious: data.hasPrevious || false
          });
        }
      } else {
        console.error("Failed to load tournaments:", res.status);
        toast.error("Failed to load tournaments");
      }
    } catch (error) {
      console.error("Error loading tournaments:", error);
      toast.error("Error loading tournaments");
    } finally {
      setLoadingTournaments(false);
    }
  }

  async function loadMediaLibrary() {
    try {
      const endpoints = [
        `${apiUrl}/api/admin/media`,
        `${apiUrl}/api/admin/media/library`,
        `${apiUrl}/api/media`,
        `${apiUrl}/api/admin/media/fetch`
      ];

      let mediaData: MediaImage[] = [];
      
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, { 
            headers: getAuthHeaders() 
          });
          if (res.ok) {
            mediaData = await res.json();
            console.log("Media data fetched:", mediaData);
            console.log("Media library loaded from:", endpoint);
            break;
          }
        } catch (error) {
          console.log(`Failed to load from ${endpoint}:`, error);
          continue;
        }
      }

      if (mediaData.length === 0) {
        console.warn("No media endpoints accessible, using placeholder images");
        mediaData = [
          { id: 1, mediaUrl: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Tournament+1" },
          { id: 2, mediaUrl: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Tournament+2" },
          { id: 3, mediaUrl: "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Tournament+3" },
        ];
      }

      setMediaLibrary(mediaData);
    } catch (error) {
      console.error("Error loading media library:", error);
    }
  }

  async function onSubmit(data: Tournament) {
    setLoading(true);
    try {
      // Parse divisions JSON if it's a string
      const divisionsData = typeof data.divisions === 'string' 
        ? JSON.parse(data.divisions || '[]') 
        : data.divisions;

      // Create seoMetadata object from individual SEO fields
      const seoMetadata = {
        metaTitle: data.seoMetaTitle || "",
        metaDescription: data.seoMetaDescription || "",
        ogImage: data.seoOgImage || "",
        twitterCard: data.seoTwitterCard || "",
        canonicalUrl: data.seoCanonicalUrl || ""
      };

      // Remove individual SEO fields and use seoMetadata object
     // const { seoMetaTitle, seoMetaDescription, seoOgImage, seoTwitterCard, seoCanonicalUrl, ...restData } = data;
      const { ...restData } = data;
      const submissionData = {
        ...restData,
        divisions: divisionsData,
        seoMetadata: seoMetadata
      };

      console.log("Submitting data:", JSON.stringify(submissionData, null, 2));
      
      const url = editingId 
        ? `${apiUrl}/api/admin/tournaments/${editingId}` 
        : `${apiUrl}/api/admin/tournaments`;
      
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(submissionData),
      });
     
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to ${editingId ? 'update' : 'create'} tournament: ${res.status} - ${errorText}`);
      }
      
      const updated = await res.json();
      console.log("Server response:", updated);
      
      // Reset form after successful submission (both create and edit)
      resetForm();
      
      // Reload tournaments to reflect changes
      loadTournaments(editingId ? pagination.currentPage : 1);
      
      toast.success(`Tournament ${editingId ? 'updated' : 'created'} successfully!`);
      
    } catch (error) {
      toast.error(`Failed to save tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    reset({
      title: "",
      slug: "",
      description: "",
      locationName: "",
      locationAddress: "",
      startDate: "",
      endDate: "",
      levelCategory: "JUNIOR",
      divisions: "",
      bookingLink: "",
      status: "UPCOMING",
      organizerName: "",
      organizerContact: "",
      featuredImageId: undefined,
      seoMetaTitle: "",
      seoMetaDescription: "",
      seoOgImage: "",
      seoTwitterCard: "",
      seoCanonicalUrl: "",
      isActive: true
    });
    setEditingId(null);
    setIsSlugAuto(true);
  };

  const editTournament = (id: number) => {
    const tournament = tournaments.find(t => t.tournamentId === id);
    if (tournament) {
      // Convert divisions array to JSON string for the form
      const formData = {
        ...tournament,
        divisions: typeof tournament.divisions === 'string' 
          ? tournament.divisions 
          : JSON.stringify(tournament.divisions || [], null, 2),
        featuredImageId: tournament.featuredImage?.id || tournament.featuredImageId,
        // Extract individual SEO fields from seoMetadata
        seoMetaTitle: tournament.seoMetadata?.metaTitle || "",
        seoMetaDescription: tournament.seoMetadata?.metaDescription || "",
        seoOgImage: tournament.seoMetadata?.ogImage || "",
        seoTwitterCard: tournament.seoMetadata?.twitterCard || "",
        seoCanonicalUrl: tournament.seoMetadata?.canonicalUrl || ""
      };
      
      // Remove the nested seoMetadata object since we're using individual fields
     // const { seoMetadata, ...formDataWithoutSeoMetadata } = formData;
      const {...formDataWithoutSeoMetadata } = formData;
      reset(formDataWithoutSeoMetadata);
      setEditingId(id);
      setIsSlugAuto(false);
    }
  };

  const deleteTournament = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/admin/tournaments/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      
      if (res.ok) {
        // Reload current page, but if it's the last item on the page, go to previous page
        const currentTournamentsOnPage = tournaments.length;
        if (currentTournamentsOnPage === 1 && pagination.currentPage > 1) {
          loadTournaments(pagination.currentPage - 1);
        } else {
          loadTournaments(pagination.currentPage);
        }
        toast.success("Tournament deleted successfully!");
      } else {
        const errorText = await res.text();
        throw new Error(`Failed to delete: ${res.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete tournament");
    }
  };

  const toggleActive = async (id: number) => {
    const tournament = tournaments.find(t => t.tournamentId === id);
    if (!tournament) return;
    
    const newActiveStatus = !tournament.isActive;
    
    try {
      const res = await fetch(`${apiUrl}/api/admin/tournaments/${id}/active`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          isActive: newActiveStatus
        }),
      });
      
      if (res.ok) {
        const updated: Tournament = await res.json();
        setTournaments(tournaments.map(t => (t.tournamentId === id ? updated : t)));
        toast.success(`Tournament ${newActiveStatus ? 'activated' : 'deactivated'}!`);
      } else {
        const errorText = await res.text();
        throw new Error(`Failed to update active status: ${res.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Active status toggle error:", error);
      toast.error("Failed to update active status");
    }
  };

  const selectFeatureImage = (id: number) => {
    setValue("featuredImageId", id);
    setShowImageSelector(false);
  };

  const getFeaturedImageUrl = (id: number | undefined) => {
    if (!id) return null;
    const media = mediaLibrary.find(img => img.id === id);
    return media?.mediaUrl || null;
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  const nextPage = () => {
    if (pagination.hasNext) {
      goToPage(pagination.currentPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrevious) {
      goToPage(pagination.currentPage - 1);
    }
  };

  // SEO indicator colors
  const seoTitleColor = seoMetaTitle.length < 40 || seoMetaTitle.length > 70 ? "text-red-600" : "text-green-600";
  const seoDescColor = seoMetaDescription.length < 120 || seoMetaDescription.length > 160 ? "text-red-600" : "text-green-600";

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200";

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:gap-12">
        {/* Main Form */}
        <main className="bg-white dark:bg-gray-800 rounded shadow p-6 md:p-8 flex-1 border border-gray-300 dark:border-gray-600 overflow-auto max-h-[90vh]">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            {editingId ? "Edit Tournament" : "Create New Tournament"}
          </h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title and Slug */}
            <div>
              <label htmlFor="title" className="block mb-2 font-semibold text-gray-900 dark:text-gray-200">
                Tournament Title *
              </label>
              <input 
                id="title" 
                {...register("title", { required: true })} 
                className={`${inputClass} mb-3`}
                placeholder="Enter tournament title"
              />
              
              <div className="flex items-center gap-3 mb-2">
                <input 
                  type="checkbox" 
                  id="autoSlug" 
                  checked={isSlugAuto} 
                  onChange={() => setIsSlugAuto(prev => !prev)} 
                  className="w-4 h-4 accent-blue-600" 
                />
                <label htmlFor="autoSlug" className="text-sm select-none cursor-pointer dark:text-gray-400">
                  Auto-generate slug from Title
                </label>
                {!isSlugAuto && (
                  <button 
                    type="button" 
                    className="ml-auto text-blue-500 dark:text-blue-400 underline text-sm" 
                    onClick={() => setValue("slug", slugify(title))}
                  >
                    Regenerate Slug
                  </button>
                )}
              </div>
              
              <input 
                id="slug" 
                {...register("slug", { required: true })} 
                disabled={isSlugAuto} 
                className={`${inputClass} ${isSlugAuto ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-800"}`}
                placeholder="tournament-url-slug"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This will be used in the tournament URL: yoursite.com/tournaments/[slug]
              </p>
            </div>

            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="locationName" className="block mb-2 font-semibold dark:text-gray-300">
                  Location Name *
                </label>
                <input 
                  id="locationName" 
                  {...register("locationName", { required: true })} 
                  className={inputClass}
                  placeholder="Venue name"
                />
              </div>
              
              <div>
                <label htmlFor="locationAddress" className="block mb-2 font-semibold dark:text-gray-300">
                  Location Address
                </label>
                <input 
                  id="locationAddress" 
                  {...register("locationAddress")} 
                  className={inputClass}
                  placeholder="Full address"
                />
              </div>
              
              <div>
                <label htmlFor="startDate" className="block mb-2 font-semibold dark:text-gray-300">
                  Start Date *
                </label>
                <input 
                  type="date" 
                  id="startDate" 
                  {...register("startDate", { required: true })} 
                  className={inputClass} 
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block mb-2 font-semibold dark:text-gray-300">
                  End Date *
                </label>
                <input 
                  type="date" 
                  id="endDate" 
                  {...register("endDate", { required: true })} 
                  className={inputClass} 
                />
              </div>
              
              <div>
                <label htmlFor="levelCategory" className="block mb-2 font-semibold dark:text-gray-300">
                  Level Category *
                </label>
                <select 
                  id="levelCategory" 
                  {...register("levelCategory", { required: true })} 
                  className={inputClass}
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block mb-2 font-semibold dark:text-gray-300">
                  Status *
                </label>
                <select 
                  id="status" 
                  {...register("status", { required: true })} 
                  className={inputClass}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Organizer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="organizerName" className="block mb-2 font-semibold dark:text-gray-300">
                  Organizer Name
                </label>
                <input 
                  id="organizerName" 
                  {...register("organizerName")} 
                  className={inputClass}
                  placeholder="Organization or person name"
                />
              </div>
              
              <div>
                <label htmlFor="organizerContact" className="block mb-2 font-semibold dark:text-gray-300">
                  Organizer Contact
                </label>
                <input 
                  id="organizerContact" 
                  {...register("organizerContact")} 
                  className={inputClass}
                  placeholder="Phone or email"
                />
              </div>
            </div>

            {/* Booking Link */}
            <div>
              <label htmlFor="bookingLink" className="block mb-2 font-semibold dark:text-gray-300">
                Booking Link
              </label>
              <input 
                id="bookingLink" 
                {...register("bookingLink")} 
                className={inputClass}
                placeholder="https://example.com/booking"
                type="url"
              />
            </div>

            {/* Divisions */}
            <div>
              <label htmlFor="divisions" className="block mb-2 font-semibold dark:text-gray-300">
                Divisions (JSON Format)
              </label>
              <textarea 
                id="divisions" 
                {...register("divisions")} 
                rows={4} 
                placeholder='[{"name": "Boys 12U Singles"}, {"name": "Girls 14U Doubles"}]' 
                className={`${inputClass} resize-y font-mono text-sm`}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter divisions in valid JSON format. Each division should have at least a name property.
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block mb-2 font-semibold dark:text-gray-300">
                Featured Image
              </label>
              <button
                type="button"
                onClick={() => setShowImageSelector(true)}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                Select From Media Library
              </button>
              
              {featuredImageId && (
                <div className="mt-3">
                  <img 
                    src={getFeaturedImageUrl(featuredImageId) || ''} 
                    alt="Featured" 
                    className="max-w-xs rounded border border-gray-300 dark:border-gray-600 shadow-sm"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Selected Image ID: {featuredImageId}
                  </p>
                </div>
              )}
            </div>

            {/* Description Editor */}
            <div>
              <label className="block mb-2 font-semibold dark:text-gray-300">
                Description *
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                <JoditEditor
                  ref={editor}
                  value={watch("description") || ""}
                  onChange={(newContent) => setValue("description", newContent)}
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* SEO Section */}
            <section className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-gray-200">SEO Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold dark:text-gray-300">
                    Meta Title
                  </label>
                  <input 
                    {...register("seoMetaTitle")} 
                    maxLength={70} 
                    className={inputClass}
                    placeholder="Optimized title for search engines"
                  />
                  <p className={`${seoTitleColor} text-xs mt-1`}>
                    {seoMetaTitle.length} / 70 characters (Recommended: 40-70)
                  </p>
                </div>
                
                <div>
                  <label className="block mb-2 font-semibold dark:text-gray-300">
                    Meta Description
                  </label>
                  <textarea 
                    {...register("seoMetaDescription")} 
                    maxLength={160} 
                    rows={3} 
                    className={inputClass}
                    placeholder="Brief description for search results"
                  />
                  <p className={`${seoDescColor} text-xs mt-1`}>
                    {seoMetaDescription.length} / 160 characters (Recommended: 120-160)
                  </p>
                </div>
                
                <div>
                  <label className="block mb-2 font-semibold dark:text-gray-300">
                    Open Graph Image URL
                  </label>
                  <input 
                    {...register("seoOgImage")} 
                    className={inputClass}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-semibold dark:text-gray-300">
                    Twitter Card Type
                  </label>
                  <select 
                    {...register("seoTwitterCard")} 
                    className={inputClass} 
                    defaultValue=""
                  >
                    <option disabled value="">Select Twitter Card Type</option>
                    {twitterCardTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block mb-2 font-semibold dark:text-gray-300">
                    Canonical URL
                  </label>
                  <input 
                    {...register("seoCanonicalUrl")} 
                    className={inputClass}
                    placeholder="https://example.com/canonical-url"
                  />
                </div>
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-300 dark:border-gray-600">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white font-semibold px-8 py-3 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
              >
                {loading ? "Saving..." : editingId ? "Update Tournament" : "Create Tournament"}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  className="bg-gray-300 dark:bg-gray-700 rounded px-8 py-3 font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors flex-1"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
              
              <button
                type="button"
                className="bg-gray-200 dark:bg-gray-600 rounded px-8 py-3 font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex-1"
                onClick={resetForm}
              >
                Clear Form
              </button>
            </div>
          </form>
        </main>

        {/* Sidebar: Tournament List */}
        <aside className="md:w-1/3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 p-5 shadow-md overflow-y-auto max-h-[90vh] mb-6 md:mb-0">
          <h2 className="text-xl font-bold mb-4">
            Existing Tournaments ({pagination.totalItems})
          </h2>
          
          {/* Pagination Info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {pagination.totalItems} total tournaments
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loadingTournaments && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading tournaments...</p>
            </div>
          )}

          <div className="space-y-3">
            {tournaments.length === 0 && !loadingTournaments && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tournaments found.</p>
            )}
            {tournaments.map(tournament => (
              <div 
                key={tournament.tournamentId} 
                className={`border rounded-lg p-3 ${
                  !tournament.isActive 
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20" 
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{tournament.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {tournament.locationName} • {tournament.levelCategory}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tournament.status === "UPCOMING" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : tournament.status === "ONGOING"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : tournament.status === "COMPLETED"
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {tournament.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tournament.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {tournament.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(tournament.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <button 
                      onClick={() => editTournament(tournament.tournamentId!)}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => toggleActive(tournament.tournamentId!)}
                      className={`text-sm px-2 py-1 rounded ${
                        tournament.isActive
                          ? "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                          : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                      }`}
                    >
                      {tournament.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button 
                      onClick={() => deleteTournament(tournament.tournamentId!)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevPage}
                  disabled={!pagination.hasPrevious}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="hidden md:flex space-x-1">
                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pagination.currentPage
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <div className="md:hidden text-sm text-gray-500 dark:text-gray-400">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                
                <button
                  onClick={nextPage}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              
              {/* Page Size Selector */}
              <div className="mt-3 flex items-center justify-center">
                <label htmlFor="pageSize" className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                  Show:
                </label>
                <select
                  id="pageSize"
                  value={pagination.pageSize}
                  onChange={(e) => {
                    setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), currentPage: 1 }));
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">per page</span>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Media Library Modal */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                Select Featured Image ({mediaLibrary.length} images)
              </h3>
              <button 
                onClick={() => setShowImageSelector(false)} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            {mediaLibrary.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No images found in media library.</p>
                <p className="text-sm mt-2">Check if the media API endpoint is accessible.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaLibrary.map(img => (
                  <div 
                    key={img.id} 
                    className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      featuredImageId === img.id 
                        ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800" 
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                    }`}
                    onClick={() => selectFeatureImage(img.id)}
                  >
                    <img
                      src={img.mediaUrl}
                      alt={`${img.altText || img.id}`}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-2 bg-gray-50 dark:bg-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        ID: {img.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowImageSelector(false)} 
                className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}