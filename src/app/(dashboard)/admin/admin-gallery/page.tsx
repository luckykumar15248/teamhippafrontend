'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Corrected import for Next.js App Router

// --- Global CSS Import ---
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
    category?: { id: number; name: string };
    tags?: { id: number; name: string }[];
}

interface Category {
    id: number;
    name: string;
    slug: string;
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

// --- Main Page Component ---
const AdminGalleryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'tags'>('items');
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

    const router = useRouter();

    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        setIsLoading(true);
        try {
            const [itemsRes, catsRes, tagsRes] = await Promise.all([
                axios.get(`${apiUrl}/api/admin/gallery`, { headers }), 
                axios.get(`${apiUrl}/api/public/gallery/categories`), 
                axios.get(`${apiUrl}/api/admin/tags`, { headers }) 
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
            {/* For Next.js, it's best to place ToastContainer in your root layout.tsx */}
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
            <div className="p-4 sm:p-6 lg:p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Upload, edit, and organize your media.</p>
                    </div>
                    {activeTab === 'items' && (
                        <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                            <UploadIcon /> Upload New Item
                        </button>
                    )}
                </header>

                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('items')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'items' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Gallery Items</button>
                        <button onClick={() => setActiveTab('categories')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Categories</button>
                        <button onClick={() => setActiveTab('tags')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tags' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Tags</button>
                    </nav>
                </div>

                <div>
                    {activeTab === 'items' && <GalleryItemsGrid items={galleryItems} onEdit={(item) => { setEditingItem(item); setModalOpen(true); }} onDelete={handleDeleteItem} />}
                    {activeTab === 'categories' && <CategoryManager initialCategories={categories} refreshData={fetchData} />}
                    {activeTab === 'tags' && <TagManager initialTags={tags} refreshData={fetchData} />}
                </div>

                {isModalOpen && (
                    <UploadEditModal 
                        isOpen={isModalOpen}
                        onClose={() => setModalOpen(false)}
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

// --- Sub-components ---

const GalleryItemsGrid: React.FC<{
    items: GalleryItem[],
    onEdit: (item: GalleryItem) => void,
    onDelete: (itemId: number) => void
}> = ({ items, onEdit, onDelete }) => {
    if (items.length === 0) {
        return <p className="text-center text-gray-500 py-8">No gallery items found. Click "Upload New Item" to get started.</p>;
    }
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map(item => (
                <div key={item.id} className="relative group bg-gray-100 rounded-lg overflow-hidden shadow">
                    <img src={item.thumbnailUrl || item.mediaUrl} alt={item.altText || item.title} className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => onEdit(item)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><EditIcon /></button>
                            <button onClick={() => onDelete(item.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><DeleteIcon /></button>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                        <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const CategoryManager: React.FC<{ initialCategories: Category[], refreshData: () => void }> = ({ initialCategories, refreshData }) => {
    return <div className="bg-white p-6 rounded-lg shadow">Manage your categories here. (Functionality to be added)</div>;
};

const TagManager: React.FC<{ initialTags: Tag[], refreshData: () => void }> = ({ initialTags, refreshData }) => {
    return <div className="bg-white p-6 rounded-lg shadow">Manage your tags here. (Functionality to be added)</div>;
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
    const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>(itemToEdit?.mediaType || 'IMAGE');
    const [categoryId, setCategoryId] = useState<string>(itemToEdit?.category?.id.toString() || '');
    const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set(itemToEdit?.tags?.map(t => t.id) || []));
    const [isActive, setIsActive] = useState(itemToEdit?.isActive ?? true);
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleTagChange = (tagId: number) => {
        setSelectedTags(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tagId)) {
                newSet.delete(tagId);
            } else {
                newSet.add(tagId);
            }
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
        const details = {
            title,
            description,
            mediaType,
            categoryId: categoryId ? parseInt(categoryId) : null,
            tagIds: Array.from(selectedTags),
            isActive,
            isFeatured: itemToEdit?.isFeatured || false
        };

        formData.append("details", new Blob([JSON.stringify(details)], { type: "application/json" }));
        
        if (file) {
            formData.append("file", file);
        }
        
        try {
            if (itemToEdit) {
                await axios.put(`${apiUrl}/api/admin/gallery/${itemToEdit.id}`, details, { headers });
                toast.success("Item updated successfully.");
            } else {
                await axios.post(`${apiUrl}/api/admin/gallery`, formData, {
                    headers: { ...headers, "Content-Type": "multipart/form-data" }
                });
                toast.success("Item uploaded successfully.");
            }
            onSuccess();
            onClose();
        } catch {
            toast.error(`Failed to ${itemToEdit ? 'update' : 'upload'} item.`);
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
                        {!itemToEdit && <input type="file" onChange={handleFileChange} className="mt-1 w-full text-sm" />}
                        {preview && <img src={preview} alt="Preview" className="mt-2 rounded-md max-h-48" />}
                    </div>

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

                     <div className="flex items-center">
                        <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded" />
                        <label htmlFor="isActive" className="ml-2 text-sm">Active (Visible on public site)</label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminGalleryPage;

