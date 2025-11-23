'use client';
import { CampEditor, type CampFormData } from '../../CampEditor';
import { MediaItem } from '@/app/components/MediaLibraryTypes/MediaLibraryTypes';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useParams } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (!token) return null;
  return { 'Authorization': `Bearer ${token}` };
};

// --- Type Definitions for Backend Data ---
interface BackendMediaItem {
  id: number;
  fileName?: string;
  originalUrl?: string;
  url?: string;
  mediaUrl?: string;
  fileType?: string;
  fileSize?: number;
  altText?: string;
  caption?: string;
  dimensions?: { width: number; height: number };
  status?: string;
  folder?: string;
  uploadedById?: number;
  createdAt?: string;
  mediaId?: number;
}

interface BackendSession {
  sessionId?: number;
  sessionName?: string;
  startDate?: string;
  endDate?: string;
  basePrice?: number;
  maxCapacity?: number;
  status?: 'OPEN' | 'CLOSED' | 'FULL';
  bookedSlots?: number;
}

interface BackendAddonOption {
  optionId?: number;
  optionName?: string;
  priceAdjustment?: number;
}

interface BackendAddonGroup {
  groupId?: number;
  groupName?: string;
  selectionType?: 'SINGLE' | 'MULTIPLE';
  options?: BackendAddonOption[];
}

interface BackendSeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageUrl?: string;
  canonicalUrl?: string;
}

interface BackendCampData {
  campId?: number;
  title?: string;
  slug?: string;
  description?: string;
  location?: string;
  category?: 'JUNIOR' | 'ADULT' | 'OPEN' | 'OTHER' | 'ALL';
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  active?: boolean;
  featuredImage?: BackendMediaItem;
  featuredImageId?: number;
  mediaGallery?: BackendMediaItem[];
  sessions?: BackendSession[];
  addonGroups?: BackendAddonGroup[];
  seoMetadata?: BackendSeoMetadata;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
}

// Helper function to transform backend data to CampEditor format
const transformCampData = (backendData: BackendCampData): CampFormData & { campId: number } => {
  console.log("Transforming camp data from backend:", backendData);
  
  return {
    campId: backendData.campId || 0,
    title: backendData.title || '',
    slug: backendData.slug || '',
    description: backendData.description || '',
    location: backendData.location || '',
    category: backendData.category || 'JUNIOR',
    status: backendData.status || 'DRAFT',
    isActive: backendData.active !== undefined ? backendData.active : true,
    
    // Featured image - handle both object and ID formats
    featuredImageId: backendData.featuredImage?.id || backendData.featuredImageId || null,
    featuredImage: backendData.featuredImage ? {
      id: backendData.featuredImage.id,
      url: backendData.featuredImage.originalUrl || backendData.featuredImage.url || ''
    } : null,
    
    // Media gallery - ensure it's an array of objects with id and url
    mediaGalleryIds: Array.isArray(backendData.mediaGallery) 
      ? backendData.mediaGallery.map((item) => item.id || item.mediaId || 0)
      : [],
    
    // Sessions - ensure it's an array
    sessions: Array.isArray(backendData.sessions) 
      ? backendData.sessions.map((session) => ({
          sessionId: session.sessionId,
          sessionName: session.sessionName || '',
          startDate: session.startDate || '',
          endDate: session.endDate || '',
          basePrice: session.basePrice || 0,
          maxCapacity: session.maxCapacity || 0,
          status: session.status || 'OPEN',
          bookedSlots: session.bookedSlots || 0
        }))
      : [],
    
    // Addon groups - ensure it's an array with nested options
    addonGroups: Array.isArray(backendData.addonGroups) 
      ? backendData.addonGroups.map((group) => ({
          groupId: group.groupId,
          groupName: group.groupName || '',
          selectionType: group.selectionType || 'SINGLE',
          options: Array.isArray(group.options) 
            ? group.options.map((option) => ({
                optionId: option.optionId,
                optionName: option.optionName || '',
                priceAdjustment: option.priceAdjustment || 0
              }))
            : []
        }))
      : [],
    
    // SEO metadata - ensure it's an object with proper structure
    seoMetadata: backendData.seoMetadata || {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImageUrl: '',
      twitterCard: 'summary_large_image',
      twitterTitle: '',
      twitterDescription: '',
      twitterImageUrl: '',
      canonicalUrl: ''
    }
  };
};

export default function EditCampPage() {
  const params = useParams();
  const [camp, setCamp] = useState<CampFormData & { campId: number } | undefined>(undefined);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get campId from useParams
  const campId = params?.id as string;

  const loadMediaLibrary = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers || !headers['Authorization']) {
        console.warn('No auth token for media library');
        return;
      }
      
      const res = await axios.get(`${apiUrl}/api/admin/media`, { headers });
      console.log("Media library response:", res.data);
      
      // Transform media items to consistent format
      const transformedMedia: MediaItem[] = res.data.map((item: BackendMediaItem) => ({
        id: item.id,
        fileName: item.fileName || '',
        url: item.originalUrl || item.url || item.mediaUrl || '',
        originalUrl: item.originalUrl,
        mediaUrl: item.mediaUrl,
        fileType: item.fileType || '',
        fileSize: item.fileSize || 0,
        altText: item.altText || '',
        caption: item.caption || '',
        dimensions: item.dimensions || { width: 0, height: 0 },
        status: item.status || 'ACTIVE',
        folder: item.folder || '',
        uploadedById: item.uploadedById || 0,
        createdAt: item.createdAt || ''
      }));
      
      setMediaLibrary(transformedMedia);
    } catch (error: unknown) {
      console.error("Error loading media library:", error);
      let errorMessage = 'Failed to load media library';
      
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as ApiErrorResponse;
        errorMessage = responseData?.message || responseData?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  }, []);

  useEffect(() => {
    const fetchCamp = async () => {
      if (!campId) {
        toast.error('No camp ID provided');
        setLoading(false);
        return;
      }

      try {
        const headers = getAuthHeaders();
        if (!headers || !headers['Authorization']) {
          toast.error('Please log in to continue');
          setLoading(false);
          return;
        }

        console.log("Fetching camp with ID:", campId);
        const response = await axios.get(`${apiUrl}/api/admin/camps/${campId}`, { headers });
        const backendData: BackendCampData = response.data;
        console.log("Raw backend camp data:", backendData);

        // Transform the backend data to match CampEditor format
        const transformedData = transformCampData(backendData);
        console.log("Transformed camp data for editor:", transformedData);

        setCamp(transformedData);
        
      } catch (error: unknown) {
        console.error("Error fetching camp:", error);
        let errorMessage = 'Failed to load camp data';
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            errorMessage = 'Access denied - You do not have permission to edit this camp';
          } else if (error.response?.status === 404) {
            errorMessage = 'Camp not found';
          } else {
            const responseData = error.response?.data as ApiErrorResponse;
            errorMessage = responseData?.message || responseData?.error || error.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCamp();
    loadMediaLibrary();
  }, [campId, loadMediaLibrary]);

  const handleSaveSuccess = () => {
    toast.success("Camp updated successfully!");
    router.push('/admin/camps');
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading camp details...</div>
        </div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Camp not found
          </div>
          <p className="text-red-500 mb-4">
            The camp you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have permission to access it.
          </p>
          <button
            onClick={() => router.push('/admin/camps')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Camps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Camp</h1>
      <CampEditor
        campToEdit={camp}
        mediaLibrary={mediaLibrary}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}