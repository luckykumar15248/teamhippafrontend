'use client';
import { CampEditor } from '../CampEditor';
import { MediaItem } from '@/app/components/MediaLibraryTypes/MediaLibraryTypes';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Type for backend media item response
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
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (!token) return null;
  return { 'Authorization': `Bearer ${token}` };
};

export default function NewCampPage() {
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const router = useRouter();

  const loadMediaLibrary = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers || !headers['Authorization']) return;
    try {
      const res = await axios.get(`${apiUrl}/api/admin/media`, { headers });
      
      // Transform backend media items to MediaItem format with proper typing
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
    loadMediaLibrary();
  }, [loadMediaLibrary]);

  // Correct handler for save success
  const handleSaveSuccess = () => {
    toast.success("Camp created successfully!");
    router.push('/admin/camps'); // Redirect to camp dashboard or camp list
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Camp</h1>
      <CampEditor
        mediaLibrary={mediaLibrary}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}