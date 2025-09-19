'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// --- Type Definitions ---
interface MediaItem {
    id: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    originalUrl: string;
    altText?: string;
    caption?: string;
    createdAt: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : null;
};

// --- Helper Functions ---
const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// --- NEW: Full Screen Image Preview Component ---
const ImagePreviewModal: React.FC<{ imageUrl: string; onClose: () => void; }> = ({ imageUrl, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
            <div className="relative max-w-4xl max-h-[90vh]">
                <img src={imageUrl} alt="Full size preview" className="w-full h-full object-contain" />
            </div>
        </div>
    );
};

// --- Main Media Library Page ---
const MediaLibraryPage: React.FC = () => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null); // State for the lightbox
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12); // Adjusted for larger items

    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/admin/media`, { headers });
            setMediaItems(response.data.sort((a: MediaItem, b: MediaItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || []);
        } catch (error) {
            toast.error("Failed to load media library.");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('image', file);
        const headers = getAuthHeaders();
        if (!headers) return;

        setIsUploading(true);
        toast.info("Uploading file...");
        try {
            await axios.post(`${apiUrl}/api/admin/media/upload`, formData, { headers });
            toast.success("File uploaded successfully!");
            await fetchData(); // Refresh the library
        } catch {
            toast.error("File upload failed.");
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    
    const handleUpdateDetails = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        const headers = getAuthHeaders();
        if (!headers) return;
        
        const payload = {
            fileName: selectedItem.fileName,
            altText: selectedItem.altText,
            caption: selectedItem.caption,
        };

        try {
            await axios.put(`${apiUrl}/api/admin/media/${selectedItem.id}`, payload, { headers });
            toast.success("Media details updated!");
            await fetchData();
        } catch {
            toast.error("Failed to update details.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to permanently delete this file? This action is irreversible.")) return;
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            await axios.delete(`${apiUrl}/api/admin/media/${id}`, { headers });
            toast.success("Media deleted successfully.");
            setSelectedItem(null);
            await fetchData();
        } catch {
            toast.error("Failed to delete media.");
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("URL copied to clipboard!");
    };
    
    
    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = mediaItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(mediaItems.length / itemsPerPage);

    return (
        <>
            <ToastContainer position="bottom-right" autoClose={3000} />
            <div className="p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
                {/* Main Content Area */}
                <div className="flex-1">
                    <header className="mb-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
                            <p className="mt-1 text-sm text-gray-600">Manage all your uploaded images and videos.</p>
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-indigo-400">
                            {isUploading ? 'Uploading...' : 'Upload New Media'}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*"/>
                    </header>
                    
                    {isLoading ? <p>Loading media library...</p> : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {currentItems.map(item => (
                                    <div key={item.id} onClick={() => setSelectedItem(item)} className={`relative group border-2 rounded-lg overflow-hidden shadow-sm cursor-pointer aspect-square ${selectedItem?.id === item.id ? 'border-indigo-500' : 'border-transparent hover:border-indigo-300'}`}>
                                        <img src={item.originalUrl} alt={item.altText || item.fileName} className="w-full h-full object-cover"/>
                                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewImageUrl(item.originalUrl); }} className="opacity-0 group-hover:opacity-100 py-1 px-3 bg-white/80 text-black text-sm rounded-full">View</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center items-center space-x-4">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Previous</button>
                                    <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Next</button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Details Sidebar */}
                <aside className="w-full lg:w-96 bg-white p-6 rounded-lg shadow-md lg:sticky top-6 h-fit">
                    <h3 className="text-xl font-bold mb-4">Attachment Details</h3>
                    {selectedItem ? (
                        <form onSubmit={handleUpdateDetails} className="space-y-4">
                            <img src={selectedItem.originalUrl} alt="Preview" className="w-full h-48 object-contain bg-gray-100 rounded-lg mb-4" />
                            <div className="text-xs text-gray-500 break-all space-y-1">
                                <p><strong>Filename:</strong> {selectedItem.fileName}</p>
                                <p><strong>File Type:</strong> {selectedItem.fileType}</p>
                                <p><strong>File Size:</strong> {formatBytes(selectedItem.fileSize)}</p>
                                <p><strong>Uploaded On:</strong> {new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label htmlFor="altText" className="block text-sm font-medium text-gray-700">Alt Text</label>
                                <input id="altText" type="text" value={selectedItem.altText || ''} onChange={e => setSelectedItem({...selectedItem, altText: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                                <p className="text-xs text-gray-500 mt-1">For SEO and accessibility.</p>
                            </div>
                            <div>
                                <label htmlFor="caption" className="block text-sm font-medium text-gray-700">Caption</label>
                                <textarea id="caption" value={selectedItem.caption || ''} onChange={e => setSelectedItem({...selectedItem, caption: e.target.value})} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"></textarea>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">File URL</label>
                                <div className="flex items-center">
                                <input type="text" value={selectedItem.originalUrl} readOnly className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm p-2 text-xs" />
                                <button type="button" onClick={() => handleCopyToClipboard(selectedItem.originalUrl)} className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300">Copy</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t">
                                <button type="button" onClick={() => handleDelete(selectedItem.id)} className="text-red-600 hover:underline text-sm font-semibold">Delete Permanently</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Update Details</button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Select an item to view its details.</p>
                        </div>
                    )}
                </aside>
            </div>

            {/* Full-size Image Preview Modal */}
            {previewImageUrl && <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />}
        </>
    );
};

export default MediaLibraryPage;