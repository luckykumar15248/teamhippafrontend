'use client';

import React, { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import dynamic from "next/dynamic";
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from "next/navigation";

// --- Component Imports ---
import { Button } from "@/app/components/Button";
import { MediaItem, SeoMetadata } from "@/app/components/MediaLibraryTypes/MediaLibraryTypes";
import { MediaLibraryModal } from "@/app/components/MediaLibraryModal/MediaLibraryModal";

// Dynamically import JoditEditor to avoid SSR issues
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- Type Definitions ---
interface CampAddonOptionDto {
    optionId?: number;
    optionName: string;
    priceAdjustment: number;
}

interface CampAddonGroupDto {
    groupId?: number;
    groupName: string;
    selectionType: 'SINGLE' | 'MULTIPLE';
    options: CampAddonOptionDto[];
}

interface CampSessionDto {
    sessionId?: number;
    sessionName: string;
    startDate: string;
    endDate: string;
    basePrice: number;
    maxCapacity: number;
    status: 'OPEN' | 'CLOSED' | 'FULL';
}

// Update the category type to include empty string for initial state
export interface CampFormData {
    campId?: number;
    title: string;
    slug: string;
    description: string;
    location: string;
    category: 'JUNIOR' | 'ADULT' | 'OPEN' | 'OTHER' | 'ALL' | '';
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
    isActive: boolean;
    featuredImageId: number | null;
    mediaGalleryIds: number[];
    sessions: CampSessionDto[];
    addonGroups: CampAddonGroupDto[];
    seoMetadata: Partial<SeoMetadata>;
    featuredImage?: { id: number; url: string } | null;
}

// --- Camp Data Interface for Editing ---
interface CampData {
    campId?: number;
    title: string;
    slug: string;
    description: string;
    location: string;
    category: 'JUNIOR' | 'ADULT' | 'OPEN' | 'OTHER' | 'ALL' | '';
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
    isActive: boolean;
    featuredImage?: { id: number; url: string } | null;
    mediaGallery?: Array<{ id: number; url: string }>;
    sessions?: CampSessionDto[];
    addonGroups?: CampAddonGroupDto[];
    seoMetadata?: Partial<SeoMetadata>;
}

// --- Helper Functions ---
const slugify = (str: string) => {
    if (!str) return '';
    return str
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

const getAuthHeaders = () => {
    if (typeof window === 'undefined') {
        return { 'Content-Type': 'application/json' };
    }
    const token = localStorage.getItem('authToken');
    return token 
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
        : { 'Content-Type': 'application/json' };
};

// --- Constants ---
const levels = [ 
    { value: "ALL", label: "All Levels" },
    { value: "JUNIOR", label: "Junior" },
    { value: "ADULT", label: "Adult" },
    { value: "OPEN", label: "Open" },
    { value: "OTHER", label: "Other" }
];

const statuses: CampFormData['status'][] = ["PUBLISHED", "DRAFT", "ARCHIVED"];
const twitterCardTypes = ["summary", "summary_large_image", "app", "player"] as const;

// --- Error Response Interface ---
interface ApiErrorResponse {
    message?: string;
    error?: string;
    details?: string;
}

// --- Main Editor Component ---
interface CampEditorProps {
    campToEdit?: CampData | null;
    mediaLibrary: MediaItem[];
    onSaveSuccess: () => void;
}

export const CampEditor: React.FC<CampEditorProps> = ({ campToEdit, mediaLibrary, onSaveSuccess }) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSlugAuto, setIsSlugAuto] = useState(!campToEdit);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaModalTarget, setMediaModalTarget] = useState<'featured' | 'gallery' | 'og' | 'twitter' | null>(null);
    const editor = useRef(null);

    const { 
        register, 
        handleSubmit, 
        control, 
        reset, 
        watch, 
        setValue, 
        getValues, 
        formState: { errors },
        trigger
    } = useForm<CampFormData>({
        defaultValues: {
            title: '', 
            slug: '', 
            description: '', 
            location: '',
            category: 'JUNIOR', 
            status: 'DRAFT', 
            isActive: true,
            featuredImageId: null, 
            mediaGalleryIds: [],
            sessions: [], 
            addonGroups: [], 
            seoMetadata: {},
        }
    });

    
console.log("CampEditor received props:", {
  campToEdit,
  mediaLibrary: mediaLibrary?.length,
  sessions: campToEdit?.sessions,
  addonGroups: campToEdit?.addonGroups,
  mediaGallery: campToEdit?.mediaGallery,
  seoMetadata: campToEdit?.seoMetadata
});

    // --- Watch Form Values ---
    const title = watch('title');
    const seoMetaTitle = watch('seoMetadata.metaTitle', '');
    const seoMetaDescription = watch('seoMetadata.metaDescription', '');
    const featuredImageId = watch('featuredImageId');
    const mediaGalleryIds = watch('mediaGalleryIds', []);
    const ogImageUrl = watch('seoMetadata.ogImageUrl');

    const { fields: sessionFields, append: appendSession, remove: removeSession } = useFieldArray({ 
        control, 
        name: 'sessions' 
    });
    
    const { fields: addonGroupFields, append: appendAddonGroup, remove: removeAddonGroup } = useFieldArray({ 
        control, 
        name: 'addonGroups' 
    });

    // --- Slug Auto-Generation ---
    useEffect(() => {
        if (title && isSlugAuto) {
            const newSlug = slugify(title);
            setValue('slug', newSlug, { shouldValidate: true });
        }
    }, [title, isSlugAuto, setValue]);

    // --- Load Data for Editing ---
    useEffect(() => {
    if (campToEdit) {
        // Validate category using the predefined levels array
        const validCategory = levels.some(level => level.value === campToEdit.category)
            ? campToEdit.category as CampFormData['category']
            : 'JUNIOR';

        const data: CampFormData = {
            ...campToEdit,
            category: validCategory,
            sessions: campToEdit.sessions || [],
            addonGroups: campToEdit.addonGroups || [],
            mediaGalleryIds: (campToEdit.mediaGallery || []).map((img) => img.id),
            featuredImageId: campToEdit.featuredImage?.id || null,
            seoMetadata: campToEdit.seoMetadata || {},
        };
        reset(data);
        setIsSlugAuto(false);
    }
}, [campToEdit, reset]);

    // --- Form Submission ---
    const onSubmit = async (data: CampFormData) => {
        setIsSubmitting(true);
        const headers = getAuthHeaders();
        
        if (!headers['Authorization']) {
            toast.error("Authentication error. Please log in again.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Prepare the data for submission
            const submitData = {
                ...data,
                sessions: (data.sessions || []).filter(session => session.sessionName?.trim()).map(session => ({
                    ...session,
                    basePrice: Number(session.basePrice) || 0,
                    maxCapacity: Number(session.maxCapacity) || 0
                })),
                addonGroups: (data.addonGroups || []).filter(group => group.groupName?.trim()).map(group => ({
                    ...group,
                    options: (group.options || []).filter(option => option.optionName?.trim()).map(option => ({
                        ...option,
                        priceAdjustment: Number(option.priceAdjustment) || 0
                    }))
                })),
                featuredImageId: data.featuredImageId || null,
                mediaGalleryIds: data.mediaGalleryIds || []
            };

            const url = campToEdit ? `${apiUrl}/api/admin/camps/${campToEdit.campId}` : `${apiUrl}/api/admin/camps`;
            const method = campToEdit ? 'PUT' : 'POST';

            await axios({ method, url, data: submitData, headers });
            
            toast.success(`Camp ${campToEdit ? 'updated' : 'created'} successfully!`);
            onSaveSuccess();
            
            if (!campToEdit) {
                reset();
                setValue("description", "");
                setIsSlugAuto(true);
            }
            
            router.push('/admin/camps');
        } catch (error: unknown) {
            console.error("Failed to save camp:", error);
            let errorMessage = 'Unknown error occurred';
            
            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data as ApiErrorResponse;
                errorMessage = responseData?.message || responseData?.error || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            toast.error(`Failed to save camp: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle form submission with validation
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Only validate required basic fields
        const basicFields = ['title', 'slug', 'location', 'category'] as const;
        const isValid = await trigger(basicFields);
        
        if (isValid) {
            handleSubmit(onSubmit)();
        } else {
            toast.error("Please fill in all required fields (Title, Slug, Location, Category)");
        }
    };

    // --- Media Library Handlers ---
    const openMediaModal = (target: 'featured' | 'gallery' | 'og' | 'twitter') => {
        setMediaModalTarget(target);
        setShowMediaModal(true);
    };

    const handleMediaSelect = (item: MediaItem) => {
        const imageUrl = item.url || item.mediaUrl || item.originalUrl || '';
        if (mediaModalTarget === 'featured') {
            setValue('featuredImageId', item.id);
        } else if (mediaModalTarget === 'gallery') {
            const currentIds = getValues('mediaGalleryIds') || [];
            if (!currentIds.includes(item.id)) {
                setValue('mediaGalleryIds', [...currentIds, item.id]);
            }
        } else if (mediaModalTarget === 'og') {
            setValue('seoMetadata.ogImageUrl', imageUrl);
        } else if (mediaModalTarget === 'twitter') {
            setValue('seoMetadata.twitterImageUrl', imageUrl);
        }
        setShowMediaModal(false);
    };

    const removeGalleryImageById = (idToRemove: number) => {
        const currentIds = getValues('mediaGalleryIds') || [];
        const newIds = currentIds.filter(id => id !== idToRemove);
        setValue('mediaGalleryIds', newIds);
    };

    const getMediaUrl = (id: number | null | undefined): string | null => {
        if (!id) return null;
        const media = mediaLibrary.find(m => m.id === id);
        return media ? (media.url || media.mediaUrl || media.originalUrl || null) : null;
    };

    const handleGenerateSlug = () => {
        if (title) {
            const newSlug = slugify(title);
            setValue('slug', newSlug, { shouldValidate: true });
        } else {
            toast.error("Please enter a title first");
        }
    };

    // --- Session and Addon Handlers ---
    const handleAddSession = () => {
        appendSession({ 
            sessionName: '', 
            startDate: '', 
            endDate: '', 
            basePrice: 0, 
            maxCapacity: 10, 
            status: 'OPEN' 
        });
    };

    const handleAddAddonGroup = () => {
        appendAddonGroup({ 
            groupName: '', 
            selectionType: 'SINGLE', 
            options: [] 
        });
    };

    // --- SEO Indicator Colors ---
    const safeSeoMetaTitle = String(seoMetaTitle || '');
    const safeSeoMetaDescription = String(seoMetaDescription || '');
    const seoTitleColor = safeSeoMetaTitle.length < 40 || safeSeoMetaTitle.length > 70 ? "text-red-600" : "text-green-600";
    const seoDescColor = safeSeoMetaDescription.length < 120 || safeSeoMetaDescription.length > 160 ? "text-red-600" : "text-green-600";
    const inputClass = "w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
    
    return (
        <>
            <form onSubmit={handleFormSubmit} className="flex flex-col lg:flex-row-reverse gap-6">
                
                {/* --- Right Sidebar Column --- */}
                <aside className="w-full lg:w-[400px] space-y-6 flex-shrink-0">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-semibold mb-4 text-lg text-gray-800">Publish</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                                <select 
                                    id="status" 
                                    {...register("status")} 
                                    className={inputClass}
                                >
                                    {statuses.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="isActive" 
                                    {...register("isActive")} 
                                    className="w-4 h-4 accent-indigo-600" 
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                    Show on public website
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors duration-200"
                            >
                                {isSubmitting ? "Saving..." : campToEdit ? "Update Camp" : "Create Camp"}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-semibold mb-4 text-lg text-gray-800">Featured Image</h3>
                        <button
                            type="button"
                            onClick={() => openMediaModal('featured')}
                            className="w-full border-2 border-dashed border-gray-300 p-4 text-center rounded-lg hover:border-indigo-500 transition-colors duration-200 bg-gray-50 hover:bg-gray-100"
                        >
                            {getMediaUrl(featuredImageId) ? (
                                <div className="relative w-full h-32 rounded overflow-hidden">
                                    <img 
                                        src={getMediaUrl(featuredImageId)!} 
                                        alt="Featured" 
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                            ) : (
                                <span className="text-gray-500">Set featured image</span>
                            )}
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-semibold mb-4 text-lg text-gray-800">Image Gallery</h3>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {mediaGalleryIds.map((id, index) => (
                                <div key={index} className="relative group">
                                    <img 
                                        src={getMediaUrl(id) || ''} 
                                        alt="Gallery item" 
                                        className="w-full h-20 object-cover rounded border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImageById(id)}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            type="button" 
                            onClick={() => openMediaModal('gallery')} 
                            className="w-full text-sm py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                        >
                            + Add Gallery Image
                        </button>
                    </div>
                </aside>

                {/* --- Main Content Column --- */}
                <main className="flex-1 space-y-6">
                    {/* General Information Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-semibold mb-4 text-lg text-gray-800">General Information</h3>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-700">
                                Camp Title *
                            </label>
                            <input
                                id="title"
                                {...register("title", { 
                                    required: "Camp title is required",
                                    minLength: {
                                        value: 3,
                                        message: "Title must be at least 3 characters"
                                    }
                                })} 
                                placeholder="e.g., Junior Summer Camp"
                                className={inputClass}
                            />
                            {errors.title && (
                                <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700">Slug *</label>
                            <div className="flex items-center gap-3 mb-2">
                                <input 
                                    type="checkbox" 
                                    id="autoSlug" 
                                    checked={isSlugAuto} 
                                    onChange={(e) => setIsSlugAuto(e.target.checked)} 
                                    className="w-4 h-4 accent-indigo-600" 
                                />
                                <label htmlFor="autoSlug" className="text-sm select-none cursor-pointer text-gray-700">
                                    Auto-generate from Title
                                </label>
                                {!isSlugAuto && (
                                    <button 
                                        type="button" 
                                        className="ml-auto text-indigo-600 underline text-sm hover:text-indigo-700"
                                        onClick={handleGenerateSlug}
                                    >
                                        Regenerate
                                    </button>
                                )}
                            </div>
                            <input 
                                id="slug" 
                                {...register("slug", { 
                                    required: "Slug is required",
                                    pattern: {
                                        value: /^[a-z0-9-]+$/,
                                        message: "Slug can only contain lowercase letters, numbers, and hyphens"
                                    }
                                })} 
                                disabled={isSlugAuto} 
                                className={`${inputClass} ${isSlugAuto ? "bg-gray-100 text-gray-500" : ""}`}
                                placeholder="camp-slug"
                            />
                            {errors.slug && (
                                <p className="text-red-600 text-xs mt-1">{errors.slug.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <JoditEditor
                                        ref={editor}
                                        value={field.value || ""}
                                        config={{ 
                                            height: 400, 
                                            placeholder: "Enter camp details...",
                                            buttons: ['bold', 'italic', 'underline', 'link', 'ul', 'ol', 'font', 'fontsize', 'image']
                                        }}
                                        onBlur={(content) => field.onChange(content)}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Camp Details Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-semibold mb-4 text-lg text-gray-800">Camp Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium mb-1 text-gray-700">
                                    Location Name *
                                </label>
                                <input
                                    id="location"
                                    {...register("location", { 
                                        required: "Location is required",
                                        minLength: {
                                            value: 3,
                                            message: "Location must be at least 3 characters"
                                        }
                                    })} 
                                    placeholder="e.g., Gilbert Regional Park"
                                    className={inputClass}
                                />
                                {errors.location && (
                                    <p className="text-red-600 text-xs mt-1">{errors.location.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Category *</label>
                                <select 
                                    {...register("category", { required: "Category is required" })} 
                                    className={inputClass}
                                >
                                    {levels.map(l => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Camp Sessions Manager - OPTIONAL */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-semibold mb-4 text-lg text-gray-800">Camp Sessions (Optional)</h3>
                        <div className="space-y-4">
                        {sessionFields.map((field, index) => (
                            <div key={field.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50 space-y-3">
                                <div>
                                    <label htmlFor={`session-${index}-name`} className="block text-sm font-medium mb-1 text-gray-700">
                                        Session Name
                                    </label>
                                    <input
                                        id={`session-${index}-name`}
                                        {...register(`sessions.${index}.sessionName`)} 
                                        placeholder="e.g., Week 1 (June 10-14)"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor={`session-${index}-start`} className="block text-sm font-medium mb-1 text-gray-700">
                                            Start Date
                                        </label>
                                        <input
                                            id={`session-${index}-start`}
                                            type="date"
                                            {...register(`sessions.${index}.startDate`)} 
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`session-${index}-end`} className="block text-sm font-medium mb-1 text-gray-700">
                                            End Date
                                        </label>
                                        <input
                                            id={`session-${index}-end`}
                                            type="date"
                                            {...register(`sessions.${index}.endDate`)} 
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label htmlFor={`session-${index}-price`} className="block text-sm font-medium mb-1 text-gray-700">
                                            Base Price ($)
                                        </label>
                                        <input
                                            id={`session-${index}-price`}
                                            type="number"
                                            step="0.01"
                                            {...register(`sessions.${index}.basePrice`, { 
                                                valueAsNumber: true
                                            })} 
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`session-${index}-capacity`} className="block text-sm font-medium mb-1 text-gray-700">
                                            Max Slots
                                        </label>
                                        <input
                                            id={`session-${index}-capacity`}
                                            type="number"
                                            {...register(`sessions.${index}.maxCapacity`, { 
                                                valueAsNumber: true
                                            })} 
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                                        <select
                                            {...register(`sessions.${index}.status`)}
                                            className={inputClass}
                                        >
                                            <option value="OPEN">OPEN</option>
                                            <option value="CLOSED">CLOSED</option>
                                            <option value="FULL">FULL</option>
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeSession(index)} 
                                    className="text-red-500 text-sm font-medium hover:underline hover:text-red-700"
                                >
                                    Remove Session
                                </button>
                            </div>
                        ))}
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAddSession} 
                            className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 transition-colors duration-200"
                        >
                            + Add New Session
                        </button>
                    </div>

                    {/* Add-ons Manager - OPTIONAL */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-semibold mb-4 text-lg text-gray-800">Camp Add-ons (Optional)</h3>
                        <div className="space-y-4">
                        {addonGroupFields.map((groupField, groupIndex) => (
                            <div key={groupField.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50 space-y-3">
                                <div className="flex justify-between items-end gap-2">
                                    <div className="flex-grow">
                                        <label htmlFor={`addon-group-${groupIndex}-name`} className="block text-sm font-medium mb-1 text-gray-700">
                                            Group Name
                                        </label>
                                        <input
                                            id={`addon-group-${groupIndex}-name`}
                                            {...register(`addonGroups.${groupIndex}.groupName`)} 
                                            placeholder="e.g., Transportation"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Selection Type</label>
                                        <select
                                            {...register(`addonGroups.${groupIndex}.selectionType`)}
                                            className={inputClass}
                                        >
                                            <option value="SINGLE">Single</option>
                                            <option value="MULTIPLE">Multiple</option>
                                        </select>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeAddonGroup(groupIndex)} 
                                        className="text-red-500 text-sm font-medium hover:underline hover:text-red-700 mb-2"
                                    >
                                        Remove Group
                                    </button>
                                </div>
                                <Controller
                                    name={`addonGroups.${groupIndex}.options`}
                                    control={control}
                                    render={({ field: { onChange, value = [] } }) => (
                                        <div className="pl-4 border-l-2 border-indigo-200 space-y-2">
                                            <h4 className="text-sm font-medium text-gray-600">Options for this group:</h4>
                                            {value.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex gap-2 items-center">
                                                    <input 
                                                        {...register(`addonGroups.${groupIndex}.options.${optionIndex}.optionName`)} 
                                                        placeholder="Option Name (e.g., Pickup at Gilbert)" 
                                                        className="text-sm border border-gray-300 p-2 rounded-md w-2/3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                    <input 
                                                        {...register(`addonGroups.${groupIndex}.options.${optionIndex}.priceAdjustment`, { 
                                                            valueAsNumber: true
                                                        })} 
                                                        type="number" 
                                                        step="0.01"
                                                        placeholder="Price ($)" 
                                                        className="text-sm border border-gray-300 p-2 rounded-md w-1/3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            const newOptions = [...value];
                                                            newOptions.splice(optionIndex, 1);
                                                            onChange(newOptions);
                                                        }} 
                                                        className="text-red-500 text-sm font-bold hover:text-red-700"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                type="button" 
                                                onClick={() => onChange([...value, { optionName: '', priceAdjustment: 0 }])} 
                                                className="text-indigo-600 text-sm font-medium hover:underline hover:text-indigo-700"
                                            >
                                                + Add Option
                                            </button>
                                        </div>
                                    )}
                                />
                            </div>
                        ))}
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAddAddonGroup} 
                            className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 transition-colors duration-200"
                        >
                            + Add New Add-on Group
                        </button>
                    </div>

                    {/* SEO Section */}
                    <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">SEO Settings</h2>
                        {/* SERP Preview */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-semibold mb-2 text-gray-600">Google SERP Preview</h4>
                            <div className="space-y-1">
                                <div className="text-blue-700 text-lg truncate font-medium">
                                    {watch("seoMetadata.metaTitle") || watch("title") || "New Camp Title"}
                                </div>
                                <div className="text-green-700 text-sm">
                                    {`${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/camps/${watch("slug") || "new-camp-slug"}`}
                                </div>
                                <div className="text-gray-600 text-sm line-clamp-2">
                                    {watch("seoMetadata.metaDescription") || "Enter your meta description here. This will be shown in search results."}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Meta Title</label>
                                <input 
                                    {...register("seoMetadata.metaTitle")} 
                                    maxLength={70} 
                                    className={inputClass} 
                                />
                                <p className={`${seoTitleColor} text-xs mt-1`}>
                                    {safeSeoMetaTitle.length} / 70 characters
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Meta Description</label>
                                <textarea 
                                    {...register("seoMetadata.metaDescription")} 
                                    maxLength={160} 
                                    rows={3} 
                                    className={inputClass} 
                                />
                                <p className={`${seoDescColor} text-xs mt-1`}>
                                    {safeSeoMetaDescription.length} / 160 characters
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Open Graph Title</label>
                                <input 
                                    {...register("seoMetadata.ogTitle")} 
                                    className={inputClass} 
                                    placeholder="Defaults to Meta Title" 
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Open Graph Description</label>
                                <textarea 
                                    {...register("seoMetadata.ogDescription")} 
                                    rows={2} 
                                    className={inputClass} 
                                    placeholder="Defaults to Meta Description" 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-1 font-semibold text-gray-700">Open Graph Image</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        {...register("seoMetadata.ogImageUrl")} 
                                        className={inputClass} 
                                        placeholder="Image URL (e.g., https://.../image.png)" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => openMediaModal('og')} 
                                        className="py-2 px-3 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                                    >
                                        Select
                                    </button>
                                </div>
                                {ogImageUrl && (
                                    <div className="mt-2">
                                        <img src={ogImageUrl} alt="OG Preview" className="w-32 h-auto rounded border border-gray-200" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Twitter Card Type</label>
                                <select 
                                    {...register("seoMetadata.twitterCard")} 
                                    className={inputClass} 
                                    defaultValue="summary_large_image"
                                >
                                    {twitterCardTypes.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-1 font-semibold text-gray-700">Canonical URL</label>
                                <input 
                                    {...register("seoMetadata.canonicalUrl")} 
                                    className={inputClass} 
                                    placeholder="Leave blank to use default URL" 
                                />
                            </div>
                        </div>
                    </section>
                </main>
            </form>

            {/* Media Library Modal */}
            {showMediaModal && (
                <MediaLibraryModal
                    isOpen={showMediaModal}
                    onClose={() => setShowMediaModal(false)}
                    onSelect={handleMediaSelect}
                    mediaItems={mediaLibrary}
                />
            )}
        </>
    );
};