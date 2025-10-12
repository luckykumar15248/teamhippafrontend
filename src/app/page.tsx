import { Metadata } from 'next';
import React, { Suspense } from 'react';
import HomePage from './pages/homepage/page';

// Structured data for Tennis Academy (for Google, rich results)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "name": "Team Hippa Tennis Academy",
  "description": "A top Tennis Academy in USA offering expert coaching and training for players of all ages and levels in Gilbert, AZ and Phoenix, AZ.  Join us to elevate your game!",
  "url": "https://teamhippa.com",
  "logo": "https://teamhippa.com/images/logo-big.png",
  "telephone": "+1-602-341-3361",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Rose Mofford Sports Complex 9833 N 25th Ave Phoenix, AZ 85021",
    "addressRegion": "AZ",
    "addressCountry": "US"
  },
  "sport": "Tennis"
};

export const metadata: Metadata = {
  title: 'Team Hippa | Tennis Academy in Arizona, USA | Best Tennis Training, AZ, USA',
  description: 'Team Hippa is a top Tennis Academy in the Arizona, USA offering expert coaching and training for players of all levels in Gilbert, AZ and Phoenix, AZ.',
  keywords: 'tennis academy usa,tennis academy Gilbert, tennis academy Phoenix, tennis academy in AZ, tennis academy usa tennis training, tennis coaching, team hippa, youth tennis, adult tennis',
  openGraph: {
    title: 'Tennis Academy in Arizona, USA | Best Tennis Training | Team Hippa',
    description: 'Team Hippa is a top Tennis Academy in the USA offering expert coaching and training for players of all levels.',
    url: 'https://teamhippa.com',
    type: 'website',
    images: [{ url: 'https://teamhippa.com/images/home.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tennis Academy in Arizona, USA | Best Tennis Training | Team Hippa',
    description: 'Team Hippa is a top Tennis Academy in the Arizona, USA offering expert coaching for all levels.',
    images: ['https://teamhippa.com/images/home.png'],
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
  alternates: { 
    canonical: "/" 
  },
  icons: {
    icon: '/favicon.ico',
  },
  // ✅ CORRECT WAY: Add structured data to head using 'other' property
  other: {
    'script:ld+json': JSON.stringify(structuredData),
  },
};

export default function Home() {
  return (
    <>
          
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }>
        <HomePage />
      </Suspense>
    </>
  );
}