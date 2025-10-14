import { Metadata } from 'next';
import SportsHeroSection from "../components/SportsHeroSection";
import "./styles.css";
import {
  GILBERT_FAQS,
} from "@/untils/constant";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css";
import "swiper/css/navigation";
import FAQ from "../components/FAQ";
import React from "react";
import axios from "axios";
import TennisGilbertClient from '../components/LandingPage/TennisGilbertClient/TennisGilbertClient';
import Script from 'next/script';
// --- Inline Type Definitions ---
interface Course {
  id: number;
  slug: string; 
  name: string;
  sportName: string;
  sportId: number;
  shortDescription: string;
  basePriceInfo: string;
  description: string;
  imagePaths: string[];
  isActive: boolean;
  duration: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  isPubliclyVisible: boolean;
  displayOrder: number;
}

interface CourseCategoryMapping {
  courseId: number;
  categoryId: number;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const frontendServerUrl = process.env.NEXT_PUBLIC_FRONTEND_SERVER_URL;

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teamhippa.com';
  
  return {
    title: "Tennis Academy in Gilbert, AZ | Youth & Adult Coaching | Team Hippa",
    description: "Professional tennis coaching in Gilbert, Arizona. Private lessons, youth programs, group sessions with European-trained coaches. Book your trial lesson today!",
    keywords: "tennis lessons Gilbert, tennis coaching Arizona, youth tennis Gilbert, adult tennis lessons, private tennis coaching, tennis academy Phoenix, European tennis coaching",
    authors: [{ name: "Team Hippa" }],
    creator: "Team Hippa",
    publisher: "Team Hippa",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/tennis-gilbert',
    },
    openGraph: {
      title: "Tennis Lessons in Gilbert, AZ | Youth & Adult Coaching | Team Hippa",
      description: "Professional tennis coaching in Gilbert, Arizona. Private lessons, youth programs with European-trained coaches. Book your trial lesson today!",
      url: `${baseUrl}/tennis-gilbert`,
      siteName: "Team Hippa Tennis Academy",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/images/tennis-gilbert-og.jpg",
          width: 1200,
          height: 630,
          alt: "Team Hippa Tennis Coaching in Gilbert, Arizona",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Tennis Lessons in Gilbert, AZ | Team Hippa",
      description: "Professional tennis coaching in Gilbert, Arizona. European-trained coaches. Book your trial lesson!",
      images: ["/images/tennis-gilbert-og.jpg"],
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
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

// Generate structured data for rich snippets
function generateStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teamhippa.com';
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsActivityLocation',
        '@id': `${baseUrl}/tennis-gilbert`,
        name: 'Team Hippa Tennis Academy - Gilbert',
        description: 'Professional tennis coaching and training facility in Gilbert, Arizona offering youth and adult programs with European-trained coaches.',
        url: `${baseUrl}/tennis-gilbert`,
        telephone: '+1-602-341-3361',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Gilbert Regional Park',
          addressLocality: 'Gilbert',
          addressRegion: 'AZ',
          postalCode: '85296',
          addressCountry: 'US'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 33.2886,
          longitude: -111.7387
        },
        openingHours: 'Mo-Su 06:00-22:00',
        areaServed: {
          '@type': 'City',
          name: 'Gilbert'
        },
        makesOffer: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Private Tennis Lessons',
              description: 'One-on-one tennis coaching with certified instructors'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Youth Tennis Programs',
              description: 'Tennis training for children and teenagers'
            }
          }
        ]
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Team Hippa Tennis Academy',
        url: baseUrl,
        logo: `${baseUrl}/images/logo.png`,
        description: 'Professional tennis academy in Phoenix and Gilbert, Arizona offering European-style coaching for all skill levels.',
        sameAs: [
          'https://www.facebook.com/p/Team-Hippa-61568839841383',
          'https://www.instagram.com/teamhippa_az'
        ]
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}/tennis-gilbert/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tennis',
            item: `${baseUrl}/tennis`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Gilbert Tennis Lessons',
            item: `${baseUrl}/tennis-gilbert`
          }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: GILBERT_FAQS.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    ]
  };
}

// Server component that fetches data
async function TennisGilbertPage() {
  let courses: Course[] = [];
  let categories: Category[] = [];
  let mappings: CourseCategoryMapping[] = [];

  try {
    const [coursesRes, categoriesRes, mappingsRes] = await Promise.all([
      axios.get(`${apiUrl}/api/public_api/courses`),
      axios.get(`${apiUrl}/api/public/categories`),
      axios.get(`${apiUrl}/api/public/course-category-mappings`),
    ]);

    // Transform courses with full image URLs
    courses = (coursesRes.data || []).map((course: Course) => ({
      ...course,
      imagePaths: (course.imagePaths || []).map((path) =>
        path.startsWith("http") ? path : `${frontendServerUrl}${path}`
      ),
    }));

    // Get visible categories only
    categories = (categoriesRes.data || []).filter(
      (c: Category) => c.isPubliclyVisible
    );

    mappings = mappingsRes.data || [];

  } catch (error) {
    console.error("Failed to fetch data:", error);
    // Continue with empty data - the page will still render
  }

  // Generate structured data
  const structuredData = generateStructuredData();

  return (
    <>
     <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QLZS2FLVP4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QLZS2FLVP4', { page_path: window.location.pathname });
          `}
        </Script>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Hero Section with proper H1 */}
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Tennis Lessons in Gilbert, AZ | Professional Coaching & Training "
        description="Professionl Trained tennis coaches offering private lessons, youth programs, and group sessions at Gilbert Regional Park. Serving Gilbert, Chandler, and Mesa areas by Team Hippa Tennis Academy"
        showCallButton
      />

      {/* Client component for interactive parts */}
      <TennisGilbertClient 
        initialCourses={courses}
        initialCategories={categories}
        initialMappings={mappings}
      />

       {/* FAQ Section */}     
      <FAQ
        title="Tennis Academy in Gilbert, AZ - Frequently Asked Questions"
        subtitle="Find answers to common questions about our tennis programs, coaching methods, and training facilities in Gilbert, Arizona."
        data={GILBERT_FAQS}
      />
    </>
  );
}

export default TennisGilbertPage;