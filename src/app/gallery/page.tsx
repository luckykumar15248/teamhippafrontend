'use client';

import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

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
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Video Icon Component
const VideoIcon = () => (
    <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    </div>
);

// --- Custom Lightbox Component ---
const CustomLightbox: React.FC<{
    items: GalleryItem[];
    index: number;
    onClose: () => void;
}> = ({ items, index, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(index);

    const goToPrevious = () => {
        setCurrentIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : items.length - 1));
    };

    const goToNext = () => {
        setCurrentIndex(prevIndex => (prevIndex < items.length - 1 ? prevIndex + 1 : 0));
    };
    
    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (index < 0 || !items[currentIndex]) return null;

    const currentItem = items[currentIndex];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
                {currentItem.mediaType === 'VIDEO' ? (
                    <video 
                        src={currentItem.mediaUrl} 
                        controls
                        autoPlay
                        className="w-full h-auto max-h-[80vh] object-contain" 
                    />
                ) : (
                    <img 
                        src={currentItem.mediaUrl} 
                        alt={currentItem.altText || currentItem.title} 
                        className="w-full h-auto max-h-[80vh] object-contain" 
                    />
                )}
                <div className="text-white text-center mt-2 p-4 bg-black bg-opacity-50 rounded-b-lg">
                    <h3 className="text-lg font-bold">{currentItem.title}</h3>
                    <p className="text-sm text-gray-300">{currentItem.description}</p>
                </div>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 text-2xl leading-none">&times;</button>
                
                {/* Navigation Buttons */}
                <button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 text-2xl">&larr;</button>
                <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 text-2xl">&rarr;</button>
            </div>
        </div>
    );
};

// --- Custom Masonry Grid Component ---
const MasonryGrid: React.FC<{
    items: GalleryItem[];
    onClick: (index: number) => void;
}> = ({ items, onClick }) => {
    return (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.map((item, index) => (
                <div key={item.id} className="break-inside-avoid cursor-pointer group relative" onClick={() => onClick(index)}>
                    {item.mediaType === 'VIDEO' ? (
                        <>
                            <video 
                                src={item.mediaUrl}
                                poster={item.thumbnailUrl}
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full h-auto object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                            />
                            <VideoIcon />
                        </>
                    ) : (
                        <img 
                            src={item.thumbnailUrl || item.mediaUrl} 
                            alt={item.altText || item.title} 
                            className="w-full h-auto object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                    )}
                </div>
            ))}
        </div>
    );
};


// --- Main Page Component ---
const GalleryPage: React.FC = () => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/public/gallery/categories`);
                setCategories([{ id: 0, name: 'All', slug: 'all' }, ...response.data]);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Could not load gallery categories.");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            try {
                const params: { category?: string } = {};
                if (activeCategory !== 'All') {
                    params.category = activeCategory;
                }
                const response = await axios.get(`${apiUrl}/api/public/gallery`, { params });
                setItems(response.data || []);
            } catch (error) {
                console.error("Error fetching gallery items:", error);
                toast.error("Could not load gallery items.");
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchItems();
    }, [activeCategory]);

    return (
        <>
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
            <div className="bg-gray-900 text-white text-center py-20 px-4">
                <h1 className="text-5xl font-extrabold">Gallery</h1>
                <p className="mt-4 text-lg text-gray-300">A glimpse into our world of tennis excellence.</p>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 flex justify-center flex-wrap gap-2">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.name)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                                activeCategory === category.name
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : items.length > 0 ? (
                    <MasonryGrid items={items} onClick={(index) => setLightboxIndex(index)} />
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-semibold text-gray-700">No Items Found</h3>
                        <p className="mt-2 text-gray-500">There are no items in this category yet. Please check back later!</p>
                    </div>
                )}
            </div>

            <CustomLightbox
                items={items}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(-1)}
            />
        </>
    );
};

export default GalleryPage;