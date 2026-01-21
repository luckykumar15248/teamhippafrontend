// components/AnnouncementBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
//import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface BannerAnnouncement {
    announcementId: number;
    title: string;
    content: string;
    bannerImageUrl: string;
    linkUrl?: string;
}

export default function AnnouncementBanner() {
    const [announcement, setAnnouncement] = useState<BannerAnnouncement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasDismissed, setHasDismissed] = useState<string[]>([]);

    useEffect(() => {
        const fetchBannerAnnouncement = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/content/banner`);
                if (response.data && !hasDismissed.includes(response.data.announcementId.toString())) {
                    setAnnouncement(response.data);
                    setIsVisible(true);
                }
            } catch (error) {
                console.error('Failed to fetch banner announcement:', error);
            }
        };
        fetchBannerAnnouncement();
    }, [hasDismissed]);

    const handleDismiss = () => {
        if (announcement) {
            setHasDismissed(prev => [...prev, announcement.announcementId.toString()]);
            localStorage.setItem('dismissedBanners', JSON.stringify([
                ...hasDismissed,
                announcement.announcementId.toString()
            ]));
        }
        setIsVisible(false);
    };

    if (!isVisible || !announcement) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-lg border-b">
            <div className="container mx-auto">
                <div className="relative">
                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 z-10 p-1 text-gray-400 hover:text-gray-600"
                    >
                          {/* Close button XMarkIcon className="h-5 w-5" /> */}
                    </button>
                    
                    {/* Banner content */}
                    <div className="flex items-center">
                        {announcement.bannerImageUrl && (
                            <div className="relative w-24 h-24 flex-shrink-0">
                                <Image
                                    src={announcement.bannerImageUrl}
                                    alt={announcement.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        
                        <div className="flex-1 p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">
                                {announcement.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                                {announcement.content}
                            </p>
                            
                            {announcement.linkUrl && (
                                <a
                                    href={announcement.linkUrl}
                                    className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Learn more →
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}