// app/summer-camp/page.tsx
import { Metadata } from 'next';
import React from 'react';
import SummerCampPageClient from '../components/LandingPage/SummerCampPageClient/SummerCampPageClient';

export const metadata: Metadata = {
  title: 'Winter Camp Gilbert & Phoenix | Kids Sports & Activities',
  description: 'Join our fun summer camp in Gilbert and Phoenix! Sports, games, and learning activities for kids of all ages.',
  keywords: 'summer camp, sports camp, kids activities, Gilbert, Phoenix, tennis camp, youth sports',
  openGraph: {
    title: 'Winter Camp in Gilbert & Phoenix',
    description: 'Join the best summer sports camp for kids and teens.',
    url: 'https://teamhippa.com/summer-camp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Winter Camp Gilbert & Phoenix',
    description: 'Register your kids for our exciting summer camp.',
    images: 'https://teamhippa.com/images/summer-camp.jpg',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

// Generate structured data as JSON-LD
const generateStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsActivityLocation',
        'name': 'Team Hippa Winter Camp - Gilbert',
        'description': 'Winter sports camp for kids in Gilbert, AZ.',
        'url': 'https://teamhippa.com/summer-camp',
        'telephone': '+1-602-341-3361',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Rose Mofford Sports Complex 9833 N 25th Ave Phoenix',
          'addressLocality': 'Gilbert',
          'addressRegion': 'AZ',
          'postalCode': '85296',
          'addressCountry': 'US',
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': '33.3528',
          'longitude': '-111.7890',
        },
        'openingHours': 'Mo-Fr 06:00-22:00, Sa-Su 07:00-20:00',
        'offers': {
          '@type': 'Offer',
          'description': 'Kids and adult summer sports activities and training',
        },
        'sport': 'Tennis',
      },
      {
        '@type': 'SportsActivityLocation',
        'name': 'Team Hippa Winter Camp - Phoenix',
        'description': 'Winter sports camp for kids in Phoenix, AZ.',
        'url': 'https://teamhippa.com/summer-camp',
        'telephone': '+1-602-341-3361',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Rose Mofford Sports Complex 9833 N 25th Ave',
          'addressLocality': 'Phoenix',
          'addressRegion': 'AZ',
          'postalCode': '85021',
          'addressCountry': 'US',
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': '33.58',
          'longitude': '-112.07',
        },
        'openingHours': 'Mo-Fr 06:00-22:00, Sa-Su 07:00-20:00',
        'offers': {
          '@type': 'Offer',
          'description': 'Kids summer sports activities and training',
        },
        'sport': 'Tennis',
      }
    ],
  };
};

export default function tennisSummerCampPageClient() {
  const structuredData = generateStructuredData();

  return (
    <>
      {/* Meta tags and SEO */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      {/* JSON-LD Structured Data for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Call the client component */}
     
     <SummerCampPageClient />

          </>
  );
}
