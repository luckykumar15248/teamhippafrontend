'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// For Next.js, it's best to import CSS files in your root layout.tsx file.
// Please add the following line to your app/layout.tsx:
// import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions ---
interface GalleryItem {
    id: number;
    title: string;
    description: string;
    mediaType: 'IMAGE' | 'VIDEO';
    mediaUrl: string;
    thumbnailUrl?: string;
    altText?: string;
    isActive: boolean;
    isFeatured: boolean;
    displayOrder?: number;
    category?: { id: number; name: string };
    tags?: { id: number; name: string }[];
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface Tag {
    id: number;
    name: string;
    slug: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- API Helper ---
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
};

// --- SVG Icons ---
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /></svg>;


// --- Main Page Component ---
const AdminGalleryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'tags'>('items');
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isItemModalOpen, setItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

    const router = useRouter();

    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        setIsLoading(true);
        try {
            const [itemsRes, catsRes, tagsRes] = await Promise.all([
                axios.get(`${apiUrl}/api/admin/gallery`, { headers }), 
                axios.get(`${apiUrl}/api/admin/gallery/categories`, { headers }), 
                axios.get(`${apiUrl}/api/admin/gallery/tags`, { headers }) 
            ]);
            setGalleryItems(itemsRes.data || []);
            setCategories(catsRes.data || []);
            setTags(tagsRes.data || []);
        } catch (error) {
            toast.error("Failed to load gallery data.");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteItem = async (itemId: number) => {
        if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
        
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            await axios.delete(`${apiUrl}/api/admin/gallery/${itemId}`, { headers });
            toast.success("Item deleted successfully.");
            fetchData(); 
        } catch {
            toast.error("Failed to delete item.");
        }
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>;
    }

    return (
        <>
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Upload, edit, and organize your media.</p>
                    </div>
                </header>

                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('items')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'items' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Gallery Items</button>
                        <button onClick={() => setActiveTab('categories')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Categories</button>
                        <button onClick={() => setActiveTab('tags')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tags' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Tags</button>
                    </nav>
                </div>

                <div>
                    {activeTab === 'items' && <GalleryPage items={galleryItems} onEdit={(item) => { setEditingItem(item); setItemModalOpen(true); }} onDelete={handleDeleteItem} onAdd={() => { setEditingItem(null); setItemModalOpen(true); }} />}
                    {activeTab === 'categories' && <CategoryManager initialCategories={categories} refreshData={fetchData} />}
                    {activeTab === 'tags' && <TagManager initialTags={tags} refreshData={fetchData} />}
                </div>

                {isItemModalOpen && (
                    <UploadEditModal 
                        isOpen={isItemModalOpen}
                        onClose={() => setItemModalOpen(false)}
                        itemToEdit={editingItem}
                        categories={categories}
                        tags={tags}
                        onSuccess={fetchData}
                    />
                )}
            </div>
        </>
    );
};

// --- Simplified Gallery Page Component ---
const GalleryPage: React.FC<{
    items: GalleryItem[],
    onEdit: (item: GalleryItem) => void,
    onDelete: (itemId: number) => void,
    onAdd: () => void;
}> = ({ items, onEdit, onDelete, onAdd }) => {
    return (
        <div>
            <div className="flex justify-end mb-4">
                 <button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <UploadIcon /> Upload New Item
                </button>
            </div>
            
            {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No gallery items found. Click "Upload New Item" to get started.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            {/* Media display */}
                            <div className="relative h-48 bg-gray-800">
                                {item.mediaType === 'VIDEO' ? (
                                    <video 
                                        src={item.thumbnailUrl || item.mediaUrl} 
                                        muted 
                                        playsInline 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img 
                                        src={item.thumbnailUrl || item.mediaUrl} 
                                        alt={item.altText || item.title} 
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                
                                {/* Video indicator */}
                                {item.mediaType === 'VIDEO' && (
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                                        <VideoIcon />
                                    </div>
                                )}
                                
                                {/* Status badges */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    {!item.isActive && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Inactive</span>
                                    )}
                                    {item.isFeatured && (
                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Featured</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-semibold text-lg mb-1 truncate">{item.title}</h3>
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                                
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {item.category && (
                                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                            {item.category.name}
                                        </span>
                                    )}
                                    {item.tags?.map(tag => (
                                        <span key={tag.id} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                            #{tag.name}
                                        </span>
                                    ))}
                                </div>
                                
                                {/* Action buttons */}
                                <div className="flex justify-between items-center mt-3">
                                    <div className="text-xs text-gray-500">
                                        Order: {item.displayOrder || 0}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onEdit(item)} 
                                            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                                        >
                                            <EditIcon />
                                            <span className="ml-1 text-sm">Edit</span>
                                        </button>
                                        <button 
                                            onClick={() => onDelete(item.id)} 
                                            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                                        >
                                            <DeleteIcon />
                                            <span className="ml-1 text-sm">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoryManager: React.FC<{ initialCategories: Category[], refreshData: () => void }> = ({ initialCategories, refreshData }) => {
    const [categories, setCategories] = useState(initialCategories);
    const [isCatModalOpen, setCatModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    
    useEffect(() => { setCategories(initialCategories) }, [initialCategories]);

    const handleSave = async (categoryData: { name: string, slug: string, description: string }) => {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            if (editingCategory) {
                await axios.put(`${apiUrl}/api/admin/gallery/categories/${editingCategory.id}`, categoryData, { headers });
                toast.success("Category updated!");
            } else {
                await axios.post(`${apiUrl}/api/admin/gallery/categories`, categoryData, { headers });
                toast.success("Category created!");
            }
            setCatModalOpen(false);
            refreshData();
        } catch {
            toast.error(`Failed to save category.`);
        }
    };

    const handleDelete = async (categoryId: number) => {
        if (!window.confirm("Are you sure? Deleting a category will not delete its items.")) return;
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            await axios.delete(`${apiUrl}/api/admin/gallery/categories/${categoryId}`, { headers });
            toast.success("Category deleted.");
            refreshData();
        } catch {
            toast.error("Failed to delete category.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manage Categories</h2>
                <button onClick={() => { setEditingCategory(null); setCatModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"><PlusIcon /> Add Category</button>
            </div>
            <ul className="space-y-2">
                {categories.map(cat => (
                    <li key={cat.id} className="flex justify-between items-center p-2 border rounded-md">
                        <span>{cat.name} ({cat.slug})</span>
                        <div className="space-x-2">
                            <button onClick={() => { setEditingCategory(cat); setCatModalOpen(true); }} className="text-blue-500 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:underline">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
            {isCatModalOpen && <CategoryModal isOpen={isCatModalOpen} onClose={() => setCatModalOpen(false)} onSave={handleSave} categoryToEdit={editingCategory} />}
        </div>
    );
};

const CategoryModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (data: any) => void, categoryToEdit: Category | null }> = ({ isOpen, onClose, onSave, categoryToEdit }) => {
    const [name, setName] = useState(categoryToEdit?.name || '');
    const [slug, setSlug] = useState(categoryToEdit?.slug || '');
    const [description, setDescription] = useState(categoryToEdit?.description || '');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({ name, slug, description });
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold">{categoryToEdit ? 'Edit' : 'Add'} Category</h3>
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded" />
                    <input type="text" placeholder="Slug (e.g., 'summer-camp')" value={slug} onChange={e => setSlug(e.target.value)} required className="w-full p-2 border rounded" />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded"></textarea>
                    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Cancel</button><button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button></div>
                </form>
            </div>
        </div>
    );
};

const TagManager: React.FC<{ initialTags: Tag[], refreshData: () => void }> = ({ initialTags, refreshData }) => {
    const [tags, setTags] = useState(initialTags);
    const [isTagModalOpen, setTagModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    
    useEffect(() => { setTags(initialTags) }, [initialTags]);

    const handleSave = async (tagData: { name: string, slug: string }) => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            if (editingTag) {
                await axios.put(`${apiUrl}/api/admin/gallery/tags/${editingTag.id}`, tagData, { headers });
                toast.success("Tag updated!");
            } else {
                await axios.post(`${apiUrl}/api/admin/gallery/tags`, tagData, { headers });
                toast.success("Tag created!");
            }
            setTagModalOpen(false);
            refreshData();
        } catch {
            toast.error(`Failed to save tag.`);
        }
    };

    const handleDelete = async (tagId: number) => {
        if (!window.confirm("Are you sure? Deleting a tag will remove it from all gallery items.")) return;
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            await axios.delete(`${apiUrl}/api/admin/gallery/tags/${tagId}`, { headers });
            toast.success("Tag deleted.");
            refreshData();
        } catch {
            toast.error("Failed to delete tag.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manage Tags</h2>
                <button onClick={() => { setEditingTag(null); setTagModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"><PlusIcon /> Add Tag</button>
            </div>
            <ul className="space-y-2">
                {tags.map(tag => (
                    <li key={tag.id} className="flex justify-between items-center p-2 border rounded-md">
                        <span>{tag.name} ({tag.slug})</span>
                        <div className="space-x-2">
                            <button onClick={() => { setEditingTag(tag); setTagModalOpen(true); }} className="text-blue-500 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(tag.id)} className="text-red-500 hover:underline">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
            {isTagModalOpen && <TagModal isOpen={isTagModalOpen} onClose={() => setTagModalOpen(false)} onSave={handleSave} tagToEdit={editingTag} />}
        </div>
    );
};

const TagModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (data: any) => void, tagToEdit: Tag | null }> = ({ isOpen, onClose, onSave, tagToEdit }) => {
    const [name, setName] = useState(tagToEdit?.name || '');
    const [slug, setSlug] = useState(tagToEdit?.slug || '');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({ name, slug });
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold">{tagToEdit ? 'Edit' : 'Add'} Tag</h3>
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded" />
                    <input type="text" placeholder="Slug (e.g., 'summer-camp')" value={slug} onChange={e => setSlug(e.target.value)} required className="w-full p-2 border rounded" />
                    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Cancel</button><button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button></div>
                </form>
            </div>
        </div>
    );
};

const UploadEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    itemToEdit: GalleryItem | null;
    categories: Category[];
    tags: Tag[];
    onSuccess: () => void;
}> = ({ isOpen, onClose, itemToEdit, categories, tags, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(itemToEdit?.thumbnailUrl || itemToEdit?.mediaUrl || null);
    const [title, setTitle] = useState(itemToEdit?.title || '');
    const [description, setDescription] = useState(itemToEdit?.description || '');
    const [altText, setAltText] = useState(itemToEdit?.altText || '');
    const [displayOrder, setDisplayOrder] = useState(itemToEdit?.displayOrder || 0);
    const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>(itemToEdit?.mediaType || 'IMAGE');
    const [categoryId, setCategoryId] = useState<string>(itemToEdit?.category?.id.toString() || '');
    const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set(itemToEdit?.tags?.map(t => t.id) || []));
    const [isActive, setIsActive] = useState(itemToEdit?.isActive ?? true);
    const [isFeatured, setIsFeatured] = useState(itemToEdit?.isFeatured ?? false);
    
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setMediaType(selectedFile.type.startsWith('video') ? 'VIDEO' : 'IMAGE');
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleTagChange = (tagId: number) => {
        setSelectedTags(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tagId)) newSet.delete(tagId);
            else newSet.add(tagId);
            return newSet;
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!itemToEdit && !file) {
            toast.error("Please select a file to upload.");
            return;
        }

        const headers = getAuthHeaders();
        if (!headers) return;

        const formData = new FormData();
        const details = { title, description, altText, displayOrder, mediaType, categoryId: categoryId ? parseInt(categoryId) : null, tagIds: Array.from(selectedTags), isActive, isFeatured };

        formData.append("details", new Blob([JSON.stringify(details)], { type: "application/json" }));
        
        if (file) {
            formData.append("file", file);
        }
        
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const config = {
                headers: { ...headers, "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent: any) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            };

            if (itemToEdit) {
                await axios.put(`${apiUrl}/api/admin/gallery/${itemToEdit.id}`, details, { headers });
                toast.success("Item updated successfully.");
            } else {
                await axios.post(`${apiUrl}/api/admin/gallery`, formData, config);
                toast.success("Item uploaded successfully.");
            }
            onSuccess();
            onClose();
        } catch {
            toast.error(`Failed to ${itemToEdit ? 'update' : 'upload'} item.`);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold">{itemToEdit ? "Edit" : "Upload New"} Gallery Item</h2>
                    
                    <div>
                        <label className="block text-sm font-medium">Media File</label>
                        {!itemToEdit && <input type="file" required onChange={handleFileChange} className="mt-1 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />}
                        {preview && (
                            <div className="mt-2">
                                {mediaType === 'VIDEO' ? 
                                <video src={preview} controls className="rounded-md max-h-48" /> :
                                <img src={preview} alt="Preview" className="rounded-md max-h-48" />
                                }
                            </div>
                        )}
                    </div>

                    {isUploading && (
                        <div>
                            <label className="block text-sm font-medium">Uploading...</label>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <p className="text-xs text-right text-gray-600 mt-1">{uploadProgress}%</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Media Type</label>
                            <select value={mediaType} onChange={(e) => setMediaType(e.target.value as any)} className="w-full p-2 border rounded-md">
                                <option value="IMAGE">Image</option>
                                <option value="VIDEO">Video</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded-md"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Alt Text (for SEO)</label>
                        <input type="text" value={altText} onChange={(e) => setAltText(e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full p-2 border rounded-md">
                            <option value="">-- No Category --</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Tags</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <button key={tag.id} type="button" onClick={() => handleTagChange(tag.id)} className={`px-3 py-1 text-sm rounded-full ${selectedTags.has(tag.id) ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Display Order</label>
                            <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} className="w-full p-2 border rounded-md" />
                        </div>
                        <div className="space-y-2 pt-6">
                             <div className="flex items-center">
                                <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded" />
                                <label htmlFor="isActive" className="ml-2 text-sm">Active (Visible on public site)</label>
                            </div>
                             <div className="flex items-center">
                                <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded" />
                                <label htmlFor="isFeatured" className="ml-2 text-sm">Featured (Highlight on homepage)</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} disabled={isUploading} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isUploading} className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 flex items-center justify-center min-w-[120px]">
                            {isUploading ? `Uploading...` : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminGalleryPage;