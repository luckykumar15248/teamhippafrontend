'use client';

import React from 'react';
import Image from 'next/image';
import { MediaItem } from '@/app/components/MediaLibraryTypes/MediaLibraryTypes';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: MediaItem) => void;
    mediaItems: MediaItem[];
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    mediaItems
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                        Select Media
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                    >
                        &times;
                    </button>
                </div>
                
                {mediaItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No images found in media library.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {mediaItems.map(img => (
                            <div 
                                key={img.id} 
                                className="border-2 rounded-lg overflow-hidden cursor-pointer transition-all border-gray-300 hover:border-indigo-500"
                                onClick={() => onSelect(img)}
                            >
                                <Image 
                                    src={img.url || img.mediaUrl || img.originalUrl || ''} 
                                    alt={img.altText || img.fileName} 
                                    width={200} 
                                    height={150} 
                                    className="w-full h-24 object-cover" 
                                />
                                <p className="text-xs p-1 truncate bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {img.fileName}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};