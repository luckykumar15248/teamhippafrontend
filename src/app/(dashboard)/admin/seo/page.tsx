'use client';

import React, { useState, useEffect, useCallback} from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

interface SeoMetadata {
    seoId: number;
    entityType: string;
    entityId: number | null;
    pageSlugOrIdentifier: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
}

interface SelectableEntity {
    id: number;
    name: string;
}
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
        toast.error("Authentication session expired. Please log in again.");
        return null;
    }
    return { 'Authorization': `Bearer ${token}` };
};

// --- Main Page Component ---
const ManageSeoPage: React.FC = () => {
    const [allSeoData, setAllSeoData] = useState<SeoMetadata[]>([]);
    // Removed unused isLoading state
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [editingSeoId, setEditingSeoId] = useState<number | null>(null);
    const [entityType, setEntityType] = useState('GeneralPage');
    const [entityId, setEntityId] = useState<string>('');
    const [pageSlug, setPageSlug] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [metaKeywords, setMetaKeywords] = useState('');
    const [ogTitle, setOgTitle] = useState('');
    const [ogDescription, setOgDescription] = useState('');
    const [ogImageUrl, setOgImageUrl] = useState('');
    const [canonicalUrl, setCanonicalUrl] = useState('');

    // State for dynamic dropdowns
    const [linkableEntities, setLinkableEntities] = useState<SelectableEntity[]>([]);

    const router = useRouter();

    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }

        try {
            const response = await axios.get(`${apiUrl}/api/admin/seo`, { headers });
            setAllSeoData(response.data || []);
        } catch (error) {
            toast.error("Failed to load SEO data.");
            console.error(error);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Fetch linkable entities when entityType changes
    useEffect(() => {
        const fetchEntities = async () => {
            if (!entityType || entityType === 'GeneralPage') {
                setLinkableEntities([]);
                setEntityId('');
                return;
            }

            const headers = getAuthHeaders();
            if (!headers) return;
            
            let url = '';
            switch(entityType.toLowerCase()) {
                case 'course': url = `${apiUrl}/api/admin/courses`; break;
                case 'package': url = `${apiUrl}/api/admin/packages`; break;
                // Add cases for other entity types like Sport, Schedule etc.
                default: setLinkableEntities([]); return;
            }
            
            try {
                const response = await axios.get(url, { headers });
                // Handle potential nested data object
                const data = response.data.data || response.data || [];
                setLinkableEntities(data.map((item: SelectableEntity) => ({ id: item.id, name: item.name })));
            } catch {
                toast.error(`Failed to load ${entityType} list.`);
                setLinkableEntities([]);
            }
        };
        fetchEntities();
    }, [entityType]);

    const resetForm = () => {
        setEditingSeoId(null);
        setEntityType('GeneralPage');
        setEntityId('');
        setPageSlug('');
        setMetaTitle('');
        setMetaDescription('');
        setMetaKeywords('');
        setOgTitle('');
        setOgDescription('');
        setOgImageUrl('');
        setCanonicalUrl('');
    };
    
    const handleEditClick = (seo: SeoMetadata) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setEditingSeoId(seo.seoId);
        setEntityType(seo.entityType);
        setEntityId(String(seo.entityId || ''));
        setPageSlug(seo.pageSlugOrIdentifier);
        setMetaTitle(seo.metaTitle);
        setMetaDescription(seo.metaDescription);
        setMetaKeywords(seo.metaKeywords || '');
        setOgTitle(seo.ogTitle || '');
        setOgDescription(seo.ogDescription || '');
        setOgImageUrl(seo.ogImageUrl || '');
        setCanonicalUrl(seo.canonicalUrl || '');
    };

    const handleDelete = async (seoId: number) => {
        if(window.confirm("Are you sure you want to delete this SEO record?")) {
             const headers = getAuthHeaders();
             if (!headers) return;
             try {
                await axios.delete(`${apiUrl}/api/admin/seo/${seoId}`, { headers });
                toast.success("SEO record deleted successfully.");
                fetchData();
             } catch {
                toast.error("Failed to delete SEO record.");
             }
        }
    };
    
    const generateSlug = () => {
        const sourceText = metaTitle || pageSlug;
        const slug = sourceText
            .toLowerCase()
            .trim()
            .replace(/&/g, '-and-')
            .replace(/[\s\W-]+/g, '-');
        setPageSlug(slug);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const headers = getAuthHeaders();
        if (!headers) { setIsSubmitting(false); return; }

        const payload = { 
            entityType, 
            entityId: entityType === 'GeneralPage' ? null : parseInt(entityId),
            pageSlugOrIdentifier: pageSlug,
            metaTitle, metaDescription, metaKeywords,
            ogTitle, ogDescription, ogImageUrl, canonicalUrl,
        };

        const url = editingSeoId 
            ? `${apiUrl}/api/admin/seo/${editingSeoId}`
            : `${apiUrl}/api/admin/seo`;
        const method = editingSeoId ? 'put' : 'post';
        
        try {
            await axios[method](url, payload, { headers });
            toast.success(`SEO metadata ${editingSeoId ? 'updated' : 'created'} successfully!`);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to save SEO metadata.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Form Section */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
                 <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-semibold leading-7 text-gray-900 border-b border-gray-900/10 pb-6 mb-6">
                        {editingSeoId ? `Editing SEO Record (ID: ${editingSeoId})` : 'Create New SEO Metadata'}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        {/* Entity Linking */}
                        <div>
                            <label htmlFor="entityType" className="block text-sm font-medium text-gray-700">Link to</label>
                            <select id="entityType" value={entityType} onChange={e => setEntityType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="GeneralPage">General Page (e.g., /about-us)</option>
                                <option value="Course">Course</option>
                                <option value="Package">Package</option>
                                <option value="Sport">Sport</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="entityId" className="block text-sm font-medium text-gray-700">Specific Item</label>
                            <select id="entityId" value={entityId} onChange={e => setEntityId(e.target.value)} disabled={entityType === 'GeneralPage'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100">
                                <option value="">-- Select Item --</option>
                                {linkableEntities.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                             <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">Meta Title</label>
                             <input type="text" id="metaTitle" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"/>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="pageSlug" className="block text-sm font-medium text-gray-700">Page Slug / URL Identifier</label>
                            <div className="flex gap-2">
                                <input type="text" id="pageSlug" value={pageSlug} onChange={e => setPageSlug(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"/>
                                <button type="button" onClick={generateSlug} className="mt-1 px-3 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Generate</button>
                            </div>
                        </div>
                         <div className="md:col-span-2">
                             <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">Meta Description</label>
                             <textarea id="metaDescription" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"></textarea>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">Meta Keywords (comma-separated)</label>
                             <input type="text" id="metaKeywords" value={metaKeywords} onChange={e => setMetaKeywords(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"/>
                        </div>
                        
                        {/* Open Graph Section */}
                        <div className="md:col-span-2 border-t pt-8 mt-4">
                            <h3 className="text-lg font-medium text-gray-800">Social Sharing (Open Graph)</h3>
                        </div>
                        <div>
                            <label htmlFor="ogTitle" className="block text-sm font-medium text-gray-700">OG Title</label>
                            <input type="text" id="ogTitle" value={ogTitle} onChange={e => setOgTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"/>
                        </div>
                         <div>
                            <label htmlFor="ogImageUrl" className="block text-sm font-medium text-gray-700">OG Image URL</label>
                            <input type="url" id="ogImageUrl" value={ogImageUrl} onChange={e => setOgImageUrl(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"/>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="ogDescription" className="block text-sm font-medium text-gray-700">OG Description</label>
                             <textarea id="ogDescription" value={ogDescription} onChange={e => setOgDescription(e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"></textarea>
                        </div>

                    </div>
                    
                    <div className="mt-8 pt-5 border-t border-gray-200 flex items-center justify-end gap-x-4">
                        <button type="button" onClick={resetForm} className="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">{isSubmitting ? 'Saving...' : (editingSeoId ? 'Update Metadata' : 'Create Metadata')}</button>
                    </div>
                </form>
            </div>
            
            <div className="mt-12">
                <h3 className="text-2xl font-semibold leading-7 text-gray-900">Existing SEO Records</h3>
                <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Slug</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked To</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {allSeoData.map((seo) => (
                                <tr key={seo.seoId}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{seo.metaTitle}</div><div className="text-sm text-gray-500">{seo.pageSlugOrIdentifier}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seo.entityType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seo.entityId || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEditClick(seo)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(seo.seoId)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageSeoPage;