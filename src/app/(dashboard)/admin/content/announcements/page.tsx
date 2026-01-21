'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useForm } from 'react-hook-form';

// --- API Configuration ---
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

// --- Types ---
interface Announcement {
    announcementId?: number;
    title: string;
    content: string;
    displayType: 'TICKER' | 'MODAL' | 'BANNER';
    scope: 'GLOBAL' | 'SPORT' | 'COURSE' | 'SCHEDULE';
    linkUrl?: string;
    bannerImageUrl?: string;
    modalTitle?: string;
    modalButtonText?: string;
    modalSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'FULLSCREEN';
    sportId?: number | null;
    courseId?: number | null;
    scheduleId?: number | null;
    startDatetime: string;
    endDatetime?: string | null;
    isActive: boolean;
}

interface MediaItem {
  id: number;
  url: string;
  mediaUrl?: string;
  originalUrl?: string;
  altText?: string;
  fileName: string;
  [key: string]: unknown;
}

// --- Helper Component: Simple Media Library Modal ---
const MediaLibraryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: MediaItem) => void;
    title?: string;
}> = ({ isOpen, onClose, onSelect, title = "Select Image" }) => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const fetchMedia = async () => {
            const headers = getAuthHeaders();
            if (!headers['Authorization']) return;
            try {
                const res = await axios.get<MediaItem[]>(`${apiUrl}/api/admin/media`, { headers });
                const formatted = res.data.map((item) => ({
                    ...item,
                    url: item.url || item.mediaUrl || item.originalUrl || '' 
                }));
                setMediaItems(formatted);
            } catch (error) {
                console.error("Failed to fetch media", error);
                toast.error("Could not load media library.");
            } finally {
                setLoading(false);
            }
        };
        fetchMedia();
    }, [isOpen]);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image (JPEG, PNG, GIF, WebP, SVG)');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size should be less than 10MB');
            return;
        }

        setUploading(true);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'announcements');
        formData.append('type', 'announcement');

        try {
            const headers = getAuthHeaders();
            const response = await axios.post(`${apiUrl}/api/admin/media/upload`, formData, {
                headers: {
                    'Authorization': headers['Authorization'],
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data) {
                const newItem = {
                    id: Date.now(),
                    url: response.data.url || response.data.mediaUrl,
                    fileName: response.data.fileName || file.name,
                    altText: ''
                };
                
                setMediaItems(prev => [newItem, ...prev]);
                setSelectedItem(newItem);
                toast.success('Image uploaded successfully!');
            }
        } catch (error: unknown) {
            console.error('Upload error:', error);
            const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message : 'Failed to upload image';
            toast.error(errorMessage || 'Failed to upload image');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-5xl w-full max-h-[80vh] overflow-y-auto shadow-lg">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="text-gray-500 hover:text-black dark:hover:text-white text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Upload Section */}
                <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Upload New Image</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">JPEG, PNG, GIF, WebP, SVG up to 10MB</p>
                        </div>
                        <label className="relative">
                            <input
                                type="file"
                                onChange={handleUpload}
                                accept="image/*"
                                className="hidden"
                                disabled={uploading}
                            />
                            <button
                                type="button"
                                disabled={uploading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </button>
                        </label>
                    </div>
                </div>

                {/* Media Grid */}
                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-500">Loading images...</p>
                    </div>
                ) : mediaItems.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-4xl mb-4">📁</div>
                        <p className="text-gray-500">No images found. Upload your first image.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {mediaItems.map(img => (
                                <div 
                                    key={img.id} 
                                    className={`border rounded-lg cursor-pointer hover:border-blue-500 transition ${
                                        selectedItem?.id === img.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                    onClick={() => setSelectedItem(img)}
                                >
                                    <img 
                                        src={img.url} 
                                        alt={img.altText || img.fileName} 
                                        className="w-full h-32 object-cover rounded-t-lg"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-size="10" fill="%239ca3af">Image</text></svg>';
                                        }}
                                    />
                                    <p className="text-xs p-2 truncate bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-b-lg">
                                        {img.fileName}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Selected Image Preview & Actions */}
                        {selectedItem && (
                            <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded overflow-hidden border">
                                        <img 
                                            src={selectedItem.url} 
                                            alt={selectedItem.altText || selectedItem.fileName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{selectedItem.fileName}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            URL: <span className="font-mono text-xs">{selectedItem.url.substring(0, 50)}...</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onSelect(selectedItem)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        >
                                            Use This Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [selectedMediaType, setSelectedMediaType] = useState<'banner' | null>(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Announcement>({
        defaultValues: {
            title: '',
            content: '',
            displayType: 'TICKER',
            scope: 'GLOBAL',
            linkUrl: '',
            bannerImageUrl: '',
            modalTitle: '',
            modalButtonText: 'OK',
            modalSize: 'MEDIUM',
            sportId: null,
            courseId: null,
            scheduleId: null,
            startDatetime: new Date().toISOString().slice(0, 16),
            endDatetime: null,
            isActive: true
        }
    });

    const displayType = watch('displayType');
    const bannerImageUrl = watch('bannerImageUrl');

    // --- Fetch Data ---
    const fetchAnnouncements = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers['Authorization']) return;

        try {
            const res = await axios.get(`${apiUrl}/api/admin/content/announcements`, { headers });
            setAnnouncements(res.data || []);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
            toast.error("Could not load announcements.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    // --- Form Actions ---
    const onSubmit = async (data: Announcement) => {
        const headers = getAuthHeaders();
        if (!headers['Authorization']) {
            toast.error("Session expired. Please log in.");
            return;
        }

        try {
            // Format dates
            const dataToSend = {
                ...data,
                startDatetime: new Date(data.startDatetime).toISOString(),
                endDatetime: data.endDatetime ? new Date(data.endDatetime).toISOString() : null,
                sportId: data.sportId || null,
                courseId: data.courseId || null,
                scheduleId: data.scheduleId || null,
                linkUrl: data.linkUrl || null,
                bannerImageUrl: data.bannerImageUrl || null,
                modalTitle: data.modalTitle || null
            };

            if (editingId) {
                await axios.put(`${apiUrl}/api/admin/content/announcements/${editingId}`, dataToSend, { headers });
                toast.success("Announcement updated successfully!");
            } else {
                await axios.post(`${apiUrl}/api/admin/content/announcements`, dataToSend, { headers });
                toast.success("Announcement created successfully!");
            }
            resetForm();
            fetchAnnouncements();
        } catch (error: unknown) {
            console.error("Save failed", error);
            const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
            toast.error(errorMessage || "Failed to save announcement.");
        }
    };

    // --- Error Handler ---
    const onError = (errors: Record<string, unknown>) => {
        if (errors.title) {
            toast.error("Title is required.");
        } else if (errors.content) {
            toast.error("Content is required.");
        } else {
            toast.error("Please fix the errors in the form.");
        }
    };

    const handleEdit = (item: Announcement) => {
        if (!item.announcementId) return;
        
        setEditingId(item.announcementId);
        
        // Format dates for input
        const formatDateForInput = (dateString: string | undefined) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
        };
        
        setValue('title', item.title);
        setValue('content', item.content);
        setValue('displayType', item.displayType);
        setValue('scope', item.scope);
        setValue('linkUrl', item.linkUrl || '');
        setValue('bannerImageUrl', item.bannerImageUrl || '');
        setValue('modalTitle', item.modalTitle || '');
        setValue('modalButtonText', item.modalButtonText || 'OK');
        setValue('modalSize', item.modalSize || 'MEDIUM');
        setValue('sportId', item.sportId || null);
        setValue('courseId', item.courseId || null);
        setValue('scheduleId', item.scheduleId || null);
        setValue('startDatetime', formatDateForInput(item.startDatetime));
        setValue('endDatetime', formatDateForInput(item.endDatetime || undefined));
        setValue('isActive', item.isActive);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        
        const headers = getAuthHeaders();
        try {
            await axios.delete(`${apiUrl}/api/admin/content/announcements/${id}`, { headers });
            toast.success("Deleted successfully.");
            fetchAnnouncements();
        } catch (error) {
            console.log("Delete failed", error);
            toast.error("Failed to delete.");
        }
    };

    const resetForm = () => {
        reset({
            title: '',
            content: '',
            displayType: 'TICKER',
            scope: 'GLOBAL',
            linkUrl: '',
            bannerImageUrl: '',
            modalTitle: '',
            modalButtonText: 'OK',
            modalSize: 'MEDIUM',
            sportId: null,
            courseId: null,
            scheduleId: null,
            startDatetime: new Date().toISOString().slice(0, 16),
            endDatetime: null,
            isActive: true
        });
        setEditingId(null);
    };

    const handleImageSelect = (item: MediaItem) => {
        const url = item.url || item.mediaUrl || item.originalUrl;
        if (url) {
            if (selectedMediaType === 'banner') {
                setValue('bannerImageUrl', url);
            }
        }
        setShowMediaModal(false);
        setSelectedMediaType(null);
    };

    const openMediaModal = (type: 'banner') => {
        setSelectedMediaType(type);
        setShowMediaModal(true);
    };

    const removeBannerImage = () => {
        setValue('bannerImageUrl', '');
        toast.info("Banner image removed");
    };

    // --- Common Styles ---
    const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
    const labelClass = "block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300";

    return (
        <div className="container mx-auto p-6">
            <ToastContainer position="bottom-right" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements Manager</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage site announcements, tickers, modals, and banners.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* --- Left Column: Form --- */}
                <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-fit sticky top-4">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {editingId ? "Edit Announcement" : "Create New Announcement"}
                    </h2>
                    
                    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
                        {/* Basic Info */}
                        <div>
                            <label className={labelClass}>Title *</label>
                            <input 
                                {...register('title', { required: "Title is required" })} 
                                placeholder="Announcement title" 
                                className={inputClass} 
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Content *</label>
                            <textarea 
                                {...register('content', { required: "Content is required", minLength: { value: 5, message: "Minimum 5 characters" } })} 
                                rows={3}
                                placeholder="Announcement message content"
                                className={inputClass}
                            />
                            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                        </div>

                        {/* Display Type */}
                        <div>
                            <label className={labelClass}>Display Type *</label>
                            <select {...register('displayType')} className={inputClass}>
                                <option value="TICKER">Scrolling Ticker</option>
                                <option value="MODAL">Popup Modal</option>
                                <option value="BANNER">Static Banner</option>
                            </select>
                        </div>

                        {/* Link URL */}
                        <div>
                            <label className={labelClass}>Link URL (Optional)</label>
                            <input 
                                {...register('linkUrl')} 
                                type="url" 
                                placeholder="https://example.com/page" 
                                className={inputClass} 
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL to redirect when clicked</p>
                        </div>

                        {/* Modal Settings */}
                        {displayType === 'MODAL' && (
                            <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <h3 className="text-lg font-medium mb-3 text-blue-800 dark:text-blue-300">Modal Settings</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className={labelClass}>Modal Title (Optional)</label>
                                        <input {...register('modalTitle')} placeholder="Modal window title" className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Button Text</label>
                                            <input {...register('modalButtonText')} placeholder="OK" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Modal Size</label>
                                            <select {...register('modalSize')} className={inputClass}>
                                                <option value="SMALL">Small</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="LARGE">Large</option>
                                                <option value="FULLSCREEN">Full Screen</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Banner Settings */}
                        {displayType === 'BANNER' && (
                            <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <h3 className="text-lg font-medium mb-3 text-green-800 dark:text-green-300">Banner Settings</h3>
                                <div>
                                    <label className={labelClass}>Banner Image</label>
                                    <div 
                                        className={`border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${
                                            errors.bannerImageUrl ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                                        }`} 
                                        onClick={() => openMediaModal('banner')}
                                    >
                                        {bannerImageUrl ? (
                                            <div className="relative">
                                                <img src={bannerImageUrl} alt="Banner preview" className="w-full h-32 object-cover rounded mb-2" />
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeBannerImage();
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 py-4">
                                                <div className="text-4xl mb-2">🖼️</div>
                                                <div>Click to select banner image</div>
                                            </div>
                                        )}
                                        <button type="button" className="text-green-600 dark:text-green-400 text-sm font-medium mt-2">
                                            Open Media Library
                                        </button>
                                    </div>
                                    <input type="hidden" {...register('bannerImageUrl')} />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Recommended size: 1200x400px (3:1 ratio)
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Scope */}
                        <div>
                            <label className={labelClass}>Scope</label>
                            <select {...register('scope')} className={inputClass}>
                                <option value="GLOBAL">Global (All Users)</option>
                                <option value="SPORT">Specific Sport</option>
                                <option value="COURSE">Specific Course</option>
                                <option value="SCHEDULE">Specific Schedule</option>
                            </select>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Start Date & Time *</label>
                                <input 
                                    type="datetime-local" 
                                    {...register('startDatetime', { required: "Start date is required" })} 
                                    className={inputClass} 
                                />
                                {errors.startDatetime && <p className="text-red-500 text-xs mt-1">{errors.startDatetime.message}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>End Date & Time (Optional)</label>
                                <input type="datetime-local" {...register('endDatetime')} className={inputClass} />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4 accent-indigo-600" />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active (Visible to users)
                            </label>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-2 pt-4">
                            <button 
                                type="submit" 
                                className="flex-1 bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {editingId ? "Update Announcement" : "Create Announcement"}
                            </button>
                            {editingId && (
                                <button 
                                    type="button" 
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* --- Right Column: List --- */}
                <div className="lg:col-span-7 space-y-4">
                    {loading ? (
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-10 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading announcements...</p>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-10 text-center">
                            <div className="text-4xl mb-4">📢</div>
                            <p className="text-gray-500 dark:text-gray-400">No announcements found. Create one to get started!</p>
                        </div>
                    ) : (
                        announcements.map((announcement) => (
                            <div key={announcement.announcementId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{announcement.title}</h3>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    announcement.isActive 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                }`}>
                                                    {announcement.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    announcement.displayType === 'TICKER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                                    announcement.displayType === 'MODAL' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                }`}>
                                                    {announcement.displayType}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                                    {announcement.scope}
                                                </span>
                                                {announcement.linkUrl && (
                                                    <span className="text-blue-600 dark:text-blue-400" title="Has link">
                                                        🔗
                                                    </span>
                                                )}
                                                {announcement.bannerImageUrl && (
                                                    <span className="text-green-600 dark:text-green-400" title="Has banner image">
                                                        🖼️
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{announcement.content}</p>
                                    
                                    {announcement.bannerImageUrl && (
                                        <div className="mb-4">
                                            <img 
                                                src={announcement.bannerImageUrl} 
                                                alt="Banner" 
                                                className="w-full h-32 object-cover rounded"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-3">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <div>
                                                <span className="font-medium">Starts:</span> {new Date(announcement.startDatetime).toLocaleString()}
                                            </div>
                                            {announcement.endDatetime && (
                                                <div>
                                                    <span className="font-medium">Ends:</span> {new Date(announcement.endDatetime).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-x-3">
                                            <button 
                                                onClick={() => handleEdit(announcement)} 
                                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(announcement.announcementId!)} 
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Media Library Modal */}
            <MediaLibraryModal 
                isOpen={showMediaModal} 
                onClose={() => {
                    setShowMediaModal(false);
                    setSelectedMediaType(null);
                }} 
                onSelect={handleImageSelect}
                title={selectedMediaType === 'banner' ? "Select Banner Image" : "Select Image"}
            />
        </div>
    );
}