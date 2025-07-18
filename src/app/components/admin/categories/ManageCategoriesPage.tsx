'use client';

import React, { useState, useEffect, useMemo, useCallback, JSX } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Category {
  categoryId: number;
  parentCategoryId: number | null;
  categoryName: string;
  slug: string;
  description: string | null;
  isPubliclyVisible: boolean;
  displayOrder: number;
}

type HierarchicalCategory = Category & { children: HierarchicalCategory[] };
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
        toast.error("Authentication session expired. Please log in again.");
        return null;
    }
    return { 'Authorization': `Bearer ${token}` };
};

// --- SVG Icon Components ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

// --- Category List Item Component (Recursive) ---
interface CategoryItemProps {
    category: HierarchicalCategory;
    level: number;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, level, onEdit, onDelete }) => {
    return (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50">
            <div className="flex-1" style={{ paddingLeft: `${level * 20}px` }}>
                <p className="font-medium text-gray-800">{category.categoryName}</p>
                <p className="text-xs text-gray-500">Slug: {category.slug} | Order: {category.displayOrder}</p>
            </div>
            <div className="flex-shrink-0">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.isPubliclyVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {category.isPubliclyVisible ? 'Public' : 'Hidden'}
                </span>
            </div>
            <div className="flex-shrink-0 ml-4 space-x-4">
                <button onClick={() => onEdit(category)} className="text-indigo-600 hover:text-indigo-900" title="Edit"><EditIcon /></button>
                <button onClick={() => onDelete(category)} className="text-red-600 hover:text-red-900" title="Delete"><TrashIcon /></button>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const ManageCategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [slug, setSlug] = useState('');
    const [parentCategoryId, setParentCategoryId] = useState<string>('none');
    const [description, setDescription] = useState('');
    const [isPubliclyVisible, setIsPubliclyVisible] = useState(true);
    const [displayOrder, setDisplayOrder] = useState<number | ''>(0);

    const router = useRouter();

    const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setCategoryName(newName);
        setSlug(generateSlug(newName));
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }

        try {
            const response = await axios.get(`${apiUrl}api/admin/categories`, { headers });
            setCategories(response.data);
        } catch (error) {
            toast.error("Failed to load categories.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const hierarchicalCategories = useMemo(() => {
        const map = new Map<number, HierarchicalCategory>();
        categories.forEach(cat => map.set(cat.categoryId, { ...cat, children: [] }));
        
        const roots: HierarchicalCategory[] = [];
        map.forEach(cat => {
            if (cat.parentCategoryId && map.has(cat.parentCategoryId)) {
                // This check is important to prevent errors if a parent doesn't exist
                map.get(cat.parentCategoryId)?.children.push(cat);
            } else {
                roots.push(cat);
            }
        });
        return roots;
    }, [categories]);
    
    const resetForm = () => {
        setEditingCategory(null);
        setCategoryName('');
        setSlug('');
        setParentCategoryId('none');
        setDescription('');
        setIsPubliclyVisible(true);
        setDisplayOrder(0);
    };

    const handleEditClick = (category: Category) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setEditingCategory(category);
        setCategoryName(category.categoryName);
        setSlug(category.slug);
        setParentCategoryId(category.parentCategoryId?.toString() || 'none');
        setDescription(category.description || '');
        setIsPubliclyVisible(category.isPubliclyVisible);
        setDisplayOrder(category.displayOrder);
    };
    
    const handleDeleteClick = async (category: Category) => {
        if (window.confirm(`Are you sure you want to delete "${category.categoryName}"? Sub-categories will become top-level.`)) {
            const headers = getAuthHeaders();
            if (!headers) return;
            try {
                await axios.delete(`${apiUrl}api/admin/categories/${category.categoryId}`, { headers });
                toast.success("Category deleted successfully.");
                fetchData();
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data?.message || "Failed to delete category.");
                } else {
                    toast.error("Failed to delete category.");
                }
            }
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const headers = getAuthHeaders();
        if (!headers) return;

        setIsSubmitting(true);
        const payload = {
            categoryName,
            slug,
            parentCategoryId: parentCategoryId === 'none' ? null : parseInt(parentCategoryId),
            description,
            isPubliclyVisible,
            displayOrder: Number(displayOrder) || 0,
        };

        try {
            if (editingCategory) {
                await axios.put(`${apiUrl}api/admin/categories/${editingCategory.categoryId}`, payload, { headers });
                toast.success("Category updated successfully!");
            } else {
                await axios.post(`${apiUrl}api/admin/categories`, payload, { headers });
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to save category.");
            } else {
                toast.error("Failed to save category.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // CORRECTED: Added explicit return type JSX.Element[]
    const renderCategories = (cats: HierarchicalCategory[], level = 0): JSX.Element[] => {
        return cats.flatMap(cat => [
            <CategoryItem key={cat.categoryId} category={cat} level={level} onEdit={handleEditClick} onDelete={handleDeleteClick} />,
            ...renderCategories(cat.children, level + 1)
        ]);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Course Categories</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Form Column */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md sticky top-24">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
                        <div>
                            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
                            <input type="text" id="categoryName" value={categoryName} onChange={handleNameChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
                            <input type="text" id="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"/>
                        </div>
                        <div>
                            <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700">Parent Category</label>
                            <select id="parentCategory" value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="none">-- None (Top Level) --</option>
                                {categories
                                  .filter(cat => cat.categoryId !== editingCategory?.categoryId)
                                  .map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700">Display Order</label>
                            <input type="number" id="displayOrder" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                         <div className="flex items-center">
                            <input type="checkbox" id="isPubliclyVisible" checked={isPubliclyVisible} onChange={(e) => setIsPubliclyVisible(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" />
                            <label htmlFor="isPubliclyVisible" className="ml-2 block text-sm text-gray-900">Visible on Public Site</label>
                        </div>
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                            <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">Clear</button>
                            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                                {isSubmitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List Column */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
                    <div className="p-4 border-b">
                        <h3 className="text-xl font-semibold text-gray-800">Category List</h3>
                    </div>
                    <div className="max-h-[80vh] overflow-y-auto">
                        {isLoading ? <p className="p-4 text-center">Loading...</p> : renderCategories(hierarchicalCategories)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCategoriesPage;
