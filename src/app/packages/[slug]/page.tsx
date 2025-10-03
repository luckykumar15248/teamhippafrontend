import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link'
import axios from 'axios';
import PackageDetailClient from '@/app/components/PackageDetailClient/PackageDetailClient';

interface Course {
    id: number;
    name: string;
    sportName: string;
    description: string;
    imagePaths: string[] | null;
}

interface Package {
    id: number;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    imageUrls: string[];
    includedCourses: Course[];
    seoMetadata?: {
        metaTitle?: string;
        metaTitleSuffix?: string;
        metaDescription?: string;
        metaKeywords?: string;
        canonicalUrl?: string;
        ogTitle?: string;
        ogDescription?: string;
        ogImage?: string;
        twitterCard?: string;
        twitterTitle?: string;
        twitterDescription?: string;
        twitterImage?: string;
        structuredData?: object;
        customMetaTags?: object;
    };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        // Await the params Promise
        const { slug } = await params;
        
        const response = await axios.get(`${apiUrl}/api/public/packagesandcourses/byslug/${slug}`);
        const pkg: Package = response.data;

        if (!pkg) {
            return {
                title: 'Package Not Found',
                description: 'The requested package could not be found.',
            };
        }

        const seo = pkg.seoMetadata || {};
        const metaTitle = seo.metaTitle || pkg.name;
        const metaDescription = seo.metaDescription || pkg.shortDescription || `Discover ${pkg.name} - ${pkg.includedCourses.length} courses included at $${pkg.price}`;
        const canonicalUrl = seo.canonicalUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/packages/${pkg.slug}`;
        const ogImage = seo.ogImage || pkg.imageUrls?.[0] || '/default-og-image.jpg';

        return {
            title: `${metaTitle} ${seo.metaTitleSuffix || ''}`.trim(),
            description: metaDescription,
            keywords: seo.metaKeywords || `${pkg.name}, sports package, training package, ${pkg.includedCourses.map(c => c.sportName).join(', ')}`,
            alternates: {
                canonical: canonicalUrl,
            },
            openGraph: {
                title: seo.ogTitle || metaTitle,
                description: seo.ogDescription || metaDescription,
                url: canonicalUrl,
                siteName: 'Your Sports Academy',
                images: [
                    {
                        url: ogImage,
                        width: 1200,
                        height: 630,
                        alt: pkg.name,
                    },
                ],
                locale: 'en_US',
                type: 'website',
            },
            twitter: {
                card: (seo.twitterCard as 'summary_large_image' | 'summary' | 'player' | 'app') || 'summary_large_image',
                title: seo.twitterTitle || seo.ogTitle || metaTitle,
                description: seo.twitterDescription || seo.ogDescription || metaDescription,
                images: [seo.twitterImage || ogImage],
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
            // Additional meta tags
            other: {
                ...(seo.structuredData && {
                    'script:ld+json': JSON.stringify(seo.structuredData),
                }),
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Package Details',
            description: 'Discover our sports training packages.',
        };
    }
}

// Generate structured data for rich snippets
function generateStructuredData(pkg: Package) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: pkg.name,
        description: pkg.shortDescription,
        image: pkg.imageUrls?.[0] || '',
        offers: {
            '@type': 'Offer',
            price: pkg.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
        },
        brand: {
            '@type': 'Brand',
            name: 'Your Sports Academy',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '125',
        },
    };

    return structuredData;
}

// Server component that fetches data
async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    try {
        // Await the params Promise
        const { slug } = await params;
        
        const response = await axios.get(`${apiUrl}/api/public/packagesandcourses/byslug/${slug}`);
        const pkg: Package = response.data;

        if (!pkg) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">Package Not Found</h1>
                        <p className="text-gray-600 mb-8">The package you are looking for doesnt exist.</p>
                        <Link href="/packages" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                          Browse All Packages
                        </Link>
                    </div>
                </div>
            );
        }

        // Generate structured data
        const structuredData = generateStructuredData(pkg);

        return (
            <>
                {/* Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
                
                {/* Client component for interactivity */}
                <PackageDetailClient pkg={pkg} />
            </>
        );

    } catch (error) {
        console.error('Error fetching package:', error);
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Error Loading Package</h1>
                    <p className="text-gray-600 mb-8">There was an error loading the package details.</p>
                    <Link 
                        href="/packages" 
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Browse All Packages
                    </Link>
                </div>
            </div>
        );
    }
}

export default PackageDetailPage;