'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useForm } from 'react-hook-form';
// Removed style import - this should be in your app/layout.tsx

// --- API Configuration ---
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

// --- Types ---
interface HeroSlide {
    id?: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    displayOrder: number;
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

// --- Helper Component: Media Library Modal ---
const MediaLibraryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: MediaItem) => void;
}> = ({ isOpen, onClose, onSelect }) => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-5xl w-full max-h-[80vh] overflow-y-auto shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Hero Image</h3>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white text-2xl">&times;</button>
                </div>
                {loading ? <p className="text-center py-10 text-gray-500">Loading images...</p> : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {mediaItems.map(img => (
                            <div key={img.id} className="border rounded cursor-pointer hover:border-indigo-500 transition" onClick={() => onSelect(img)}>
                                <img src={img.url} alt={img.fileName} className="w-full h-24 object-cover rounded-t" />
                                <p className="text-xs p-2 truncate bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{img.fileName}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function AdminHeroPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showMediaModal, setShowMediaModal] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<HeroSlide>({
        defaultValues: {
            title: '', subtitle: '', imageUrl: '',
            ctaText: 'Learn More', ctaLink: '/book-now',
            displayOrder: 0, isActive: true
        }
    });

    const imageUrl = watch('imageUrl');

    // --- Fetch Data ---
    const fetchSlides = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers['Authorization']) return;

        try {
            const res = await axios.get(`${apiUrl}/api/admin/content/hero-slides`, { headers });
            setSlides(res.data);
        } catch (error) {
            console.error("Failed to fetch slides", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSlides();
    }, [fetchSlides]);

    // --- Form Actions ---
    const onSubmit = async (data: HeroSlide) => {
        const headers = getAuthHeaders();
        if (!headers['Authorization']) {
            toast.error("Session expired. Please log in.");
            return;
        }

        try {
            if (editingId) {
                await axios.put(`${apiUrl}/api/admin/content/hero-slides/${editingId}`, data, { headers });
                toast.success("Slide updated successfully!");
            } else {
                await axios.post(`${apiUrl}/api/admin/content/hero-slides`, data, { headers });
                toast.success("Slide created successfully!");
            }
            resetForm();
            fetchSlides();
        } catch (error: unknown) {
            console.error("Save failed", error);
            const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message : "Failed to save slide.";
            toast.error(errorMessage || "Failed to save slide.");
        }
    };

    // --- Error Handler ---
    const onError = (errors: unknown) => {
        const typedErrors = errors as Record<string, unknown>;
        if (typedErrors.imageUrl) {
            toast.error("Please select an image for the slide.");
        } else if (typedErrors.title) {
            toast.error("Title is required.");
        } else {
            toast.error("Please fix the errors in the form.");
        }
    };

    const handleEdit = (item: HeroSlide) => {
        setEditingId(item.id!); 
        setValue('title', item.title);
        setValue('subtitle', item.subtitle);
        setValue('imageUrl', item.imageUrl);
        setValue('ctaText', item.ctaText);
        setValue('ctaLink', item.ctaLink);
        setValue('displayOrder', item.displayOrder);
        setValue('isActive', item.isActive);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this slide?")) return;
        const headers = getAuthHeaders();
        try {
            await axios.delete(`${apiUrl}/api/admin/content/hero-slides/${id}`, { headers });
            toast.success("Deleted successfully.");
            fetchSlides();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete.");
        }
    };

    const resetForm = () => {
        reset({
            title: '', subtitle: '', imageUrl: '',
            ctaText: 'Learn More', ctaLink: '/book-now',
            displayOrder: 0, isActive: true
        });
        setEditingId(null);
    };

    const handleImageSelect = (item: MediaItem) => {
        setValue('imageUrl', item.url);
        setShowMediaModal(false);
    };

    // --- Common Styles ---
    const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
    const labelClass = "block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300";

    return (
        <div className="container mx-auto p-6">
            <ToastContainer position="bottom-right" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hero Section Manager</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage the slides that appear on your homepage.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* --- Left Column: Form --- */}
                <div className="lg:col-span-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-fit sticky top-4">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {editingId ? "Edit Slide" : "Create New Slide"}
                    </h2>
                    
                    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
                        <div>
                            <label className={labelClass}>Slide Image *</label>
                            <div 
                                className={`border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${errors.imageUrl ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}`} 
                                onClick={() => setShowMediaModal(true)}
                            >
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                                ) : (
                                    <div className="text-gray-400 py-4">Click to select image</div>
                                )}
                                <button type="button" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Open Library</button>
                            </div>
                            <input type="hidden" {...register('imageUrl', { required: "Image is required" })} />
                            {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Title (Headline) *</label>
                            <input {...register('title', { required: "Title is required" })} placeholder="e.g., Winter Camp 2025" className={inputClass} />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Subtitle</label>
                            <input {...register('subtitle')} placeholder="e.g., Registration Now Open" className={inputClass} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Button Text</label>
                                <input {...register('ctaText')} placeholder="Book Now" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Button Link</label>
                                <input {...register('ctaLink')} placeholder="/camps" className={inputClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Order</label>
                                <input type="number" {...register('displayOrder')} className={inputClass} />
                            </div>
                            <div className="flex items-center pt-6">
                                <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4 accent-indigo-600 mr-2" />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button 
                                type="submit" 
                                className="flex-1 bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {editingId ? "Update" : "Create"}
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
                <div className="lg:col-span-8 space-y-4">
                    {loading ? (
                        <p className="text-center py-10 text-gray-500">Loading slides...</p>
                    ) : slides.length === 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-10 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No slides found. Create one to get started!</p>
                        </div>
                    ) : (
                        slides.map((slide) => (
                            <div key={slide.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row">
                                <div className="w-full sm:w-48 h-48 sm:h-auto relative bg-gray-200">
                                    <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover absolute inset-0" />
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{slide.title}</h3>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{slide.subtitle}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${slide.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                                {slide.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {slide.ctaText} &rarr; {slide.ctaLink}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Order: {slide.displayOrder}</span>
                                        <div className="space-x-3">
                                            <button onClick={() => handleEdit(slide)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">Edit</button>
                                            <button onClick={() => handleDelete(slide.id!)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <MediaLibraryModal isOpen={showMediaModal} onClose={() => setShowMediaModal(false)} onSelect={handleImageSelect} />
        </div>
    );
}