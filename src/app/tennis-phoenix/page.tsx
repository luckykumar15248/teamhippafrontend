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
import TennisPhoenixClient from "../components/LandingPage/TennisPhoenixClient/TennisPhoenixClient";


// --- Type Definitions ---
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
    title: "Tennis Lessons in Phoenix, AZ | Professional Coaching & Training | Team Hippa",
    description: "Professional tennis coaching in Phoenix, Arizona. Private lessons, youth programs, group sessions with European-trained coaches. Book your trial lesson today!",
    keywords: "tennis lessons Phoenix, tennis coaching Arizona, youth tennis Phoenix, adult tennis lessons, private tennis coaching, tennis academy Phoenix, European tennis coaching, Phoenix Regional Park tennis",
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
      canonical: '/tennis-phoenix',
    },
    openGraph: {
      title: "Tennis Lessons in Phoenix, AZ | Youth & Adult Coaching | Team Hippa",
      description: "Professional tennis coaching in Phoenix, Arizona. Private lessons, youth programs with European-trained coaches. Book your trial lesson today!",
      url: `${baseUrl}/tennis-phoenix`,
      siteName: "Team Hippa Tennis Academy",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/images/tennis-phoenix-og.jpg",
          width: 1200,
          height: 630,
          alt: "Team Hippa Tennis Coaching in Phoenix, Arizona",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Tennis Lessons in Phoenix, AZ | Team Hippa",
      description: "Professional tennis coaching in Phoenix, Arizona. European-trained coaches. Book your trial lesson!",
      images: ["/images/tennis-phoenix-og.jpg"],
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
        '@id': `${baseUrl}/tennis-phoenix`,
        name: 'Team Hippa Tennis Academy - Phoenix',
        description: 'Professional tennis coaching and training facility in Phoenix, Arizona offering youth and adult programs with European-trained coaches.',
        url: `${baseUrl}/tennis-phoenix`,
        telephone: '+1-602-341-3361',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Phoenix Regional Park',
          addressLocality: 'Phoenix',
          addressRegion: 'AZ',
          postalCode: '85001',
          addressCountry: 'US'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 33.4484,
          longitude: -112.0740
        },
        openingHours: 'Mo-Su 06:00-22:00',
        areaServed: {
          '@type': 'City',
          name: 'Phoenix'
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
        '@id': `${baseUrl}/tennis-phoenix/#breadcrumb`,
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
            name: 'Phoenix Tennis Lessons',
            item: `${baseUrl}/tennis-phoenix`
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
async function TennisPhoenixPage() {
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
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Keep your exact existing hero section */}
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Tennis Phoenix – Team Hippa Tennis Academy in Phoenix, AZ"
        description="Join Team Hippa Tennis Academy near Phoenix, AZ. Coaching, juniors & adult programs in Phoenix."
        showCallButton
      />

      {/* Client component for interactive parts */}
      <TennisPhoenixClient 
        initialCourses={courses}
        initialCategories={categories}
        initialMappings={mappings}
      />

      

      <FAQ
        title="The fastest growing Tennis Academy"
        subtitle="Feel free to ping us incase there is any doubts you have. Our team will love to help you out."
        data={GILBERT_FAQS}
      />
    </>
  );
}

export default TennisPhoenixPage;