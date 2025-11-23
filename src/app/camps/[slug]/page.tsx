import React from 'react';
import axios from 'axios';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/app/components/Button';
import { MediaItem, SeoMetadata} from '@/app/components/MediaLibraryTypes/MediaLibraryTypes';

// --- Type Definitions ---
interface CampSession {
  sessionId: number;
  session_id?: number;
  id?: number;
  sessionName: string;
  name?: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  price?: number;
  status: 'OPEN' | 'CLOSED' | 'FULL';
  availableSpots?: number;
}

interface CampData {
  campId: number;
  id?: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  featuredImage?: MediaItem;
  mediaGallery: MediaItem[];
  sessions: CampSession[];
  seoMetadata: SeoMetadata;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// --- Data Fetching ---
async function getCamp(slug: string): Promise<CampData | null> {
    try {
        const response = await axios.get(`${apiUrl}/api/public/camps/${slug}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch camp:", error);
        return null;
    }
}

// --- Dynamic SEO Metadata ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const camp = await getCamp(slug);
    if (!camp) return { title: 'Camp Not Found' };
    
    const seo = camp.seoMetadata || {};
    const canonicalUrl = seo.canonicalUrl || `${siteUrl}/camps/${camp.slug}`;

    return {
        title: seo.metaTitle || camp.title,
        description: seo.metaDescription,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: seo.ogTitle || camp.title,
            description: seo.ogDescription || camp.description,
            url: canonicalUrl,
            images: [seo.ogImageUrl || camp.featuredImage?.url || ''],
        },
    };
}

// --- Helper Components ---
const SessionCard: React.FC<{ session: CampSession }> = ({ session }) => {
    const getSessionName = () => {
        return session.sessionName || session.name || `Session ${session.sessionId || session.id}`;
    };

    const getSessionPrice = () => {
        return session.price || session.basePrice || 0;
    };

    const getAvailableSpots = () => {
        if (session.availableSpots !== undefined) return session.availableSpots;
        if (session.status === 'FULL') return 0;
        return null;
    };

    const availableSpots = getAvailableSpots();
    const isSessionOpen = session.status === 'OPEN';

    return (
        <div className={`p-6 rounded-lg border-2 transition-all duration-200 ${
            isSessionOpen 
                ? 'border-green-200 bg-green-50 hover:border-green-300 hover:shadow-md' 
                : 'border-gray-200 bg-gray-50 opacity-75'
        }`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{getSessionName()}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isSessionOpen 
                                ? 'bg-green-100 text-green-800' 
                                : session.status === 'FULL' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-gray-100 text-gray-800'
                        }`}>
                            {session.status}
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <CalendarIcon />
                            <span>
                                {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                            </span>
                        </div>
                        
                        {availableSpots !== null && (
                            <div className="flex items-center gap-1">
                                <UserIcon />
                                <span>{availableSpots} spots available</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">${getSessionPrice()}</p>
                    <p className="text-sm text-gray-500">per session</p>
                </div>
            </div>
        </div>
    );
};

const CalendarIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
);

const LocationIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// --- The Page Component ---
export default async function CampDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const camp = await getCamp(slug);

    if (!camp) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Camp Not Found</h1>
                    <p className="text-gray-600 mb-8">The camp you are looking for doesnt exist.</p>
                    <Link href="/camps">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            Browse All Camps
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

   // const campId = camp.campId || camp.id;
    const hasOpenSessions = camp.sessions?.some(session => session.status === 'OPEN');
    const openSessions = camp.sessions?.filter(session => session.status === 'OPEN') || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section with Featured Image */}
            <div className="relative">
                {camp.featuredImage ? (
                    <div className="w-full h-80 lg:h-96 relative overflow-hidden">
                        <img 
                            src={camp.featuredImage.url} 
                            alt={camp.title} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-opacity-40"></div>
                    </div>
                ) : (
                    <div className="w-full h-80 lg:h-96 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                        <h1 className="text-4xl lg:text-5xl font-bold text-white text-center px-4">
                            {camp.title}
                        </h1>
                    </div>
                )}
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8">
                    <div className="container mx-auto">
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{camp.title}</h1>
                        <div className="flex items-center gap-2 text-white/90">
                            <LocationIcon />
                            <p className="text-lg">{camp.location}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 -mt-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Camp</h2>
                            <div 
                                className="prose prose-lg max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: camp.description }} 
                            />
                        </div>

                        {/* Gallery Section */}
                        {camp.mediaGallery && camp.mediaGallery.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Camp Gallery</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {camp.mediaGallery.map((img, index) => (
                                        <div 
                                            key={img.id} 
                                            className={`relative overflow-hidden rounded-xl ${
                                                index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                                            }`}
                                        >
                                            <img 
                                                src={img.url} 
                                                alt={img.altText || 'Camp Gallery Image'} 
                                                className="w-full h-48 lg:h-56 object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Booking & Sessions */}
                    <div className="space-y-6">
                        {/* Booking Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Book?</h3>
                                <p className="text-gray-600">Choose your preferred session</p>
                            </div>
                            
                            {hasOpenSessions ? (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-4">
                                            {openSessions.length} session{openSessions.length > 1 ? 's' : ''} available
                                        </p>
                                        <Link href={`/booking/camp/${camp.slug}`} className="block">
                                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold">
                                                Book Now
                                            </Button>
                                        </Link>
                                    </div>
                                    
                                    {/* Quick Session Info */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Available Sessions:</h4>
                                        <div className="space-y-2">
                                            {openSessions.slice(0, 3).map(session => (
                                                <div key={session.sessionId || session.id} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600">
                                                        {session.sessionName || `Session ${session.sessionId}`}
                                                    </span>
                                                    <span className="font-semibold text-indigo-600">
                                                        ${session.basePrice || session.price}
                                                    </span>
                                                </div>
                                            ))}
                                            {openSessions.length > 3 && (
                                                <p className="text-xs text-gray-500 text-center">
                                                    +{openSessions.length - 3} more sessions available
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="text-yellow-600 bg-yellow-50 rounded-lg p-4 mb-4">
                                        <p className="font-semibold">No sessions currently available</p>
                                        <p className="text-sm mt-1">Please check back later for new sessions</p>
                                    </div>
                                    <Button disabled className="w-full bg-gray-400 cursor-not-allowed">
                                        Currently Unavailable
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* All Sessions Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">All Sessions</h3>
                            <div className="space-y-4">
                                {camp.sessions && camp.sessions.length > 0 ? (
                                    camp.sessions.map(session => (
                                        <SessionCard 
                                            key={session.sessionId || session.session_id || session.id} 
                                            session={session} 
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No sessions scheduled yet.</p>
                                        <p className="text-sm text-gray-400 mt-2">New sessions coming soon!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}