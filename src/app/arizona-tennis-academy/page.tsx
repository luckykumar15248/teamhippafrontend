import { Metadata } from 'next';
import SportsHeroSection from "../components/SportsHeroSection";
import "./styles.css";
import { ARIZONA_TENNIS_ACADEMY } from "@/untils/constant";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import FAQ from "../components/FAQ";
import React from "react";
import axios from "axios";
import TennisGilbertClient from '../components/LandingPage/ArizonaTennisAcademyClient/ArizonaTennisAcademyClient';
import Script from 'next/script';

// ...Inline Type Definitions for Course, Category, CourseCategoryMapping (as in your code)...

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const frontendServerUrl = process.env.NEXT_PUBLIC_FRONTEND_SERVER_URL;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teamhippa.com';
  return {
    title: "Arizona Tennis Academy | Arizona Tennis Coaching & Camps",
    description: "Join Team Hippa top Arizona Tennis Academy. Premium youth and adult lessons, clinics, private coaching, camps, and leagues in Phoenix and Gilbert. Book a class today!",
    keywords: "Arizona tennis coaching, Phoenix tennis academy, pickleball lessons Arizona, Gilbert tennis classes, Scottsdale tennis camps, tennis trainers Arizona, youth tennis programs",
    alternates: {
      canonical: '/arizona-tennis-academy',
    },
    openGraph: {
      title: "Arizona Tennis Academy | Team Hippa",
      description: "Elite tennis lessons, clinics, camps, and private coaching in Arizona. Phoenix, Gilbert locations.",
      url: `${baseUrl}/arizona-tennis-academy`,
      siteName: "Team Hippa Tennis Academy",
      locale: "en_US",
      type: "website",
      images: [
        { url: "/images/arizona-tennis-academy.jpg", width: 1200, height: 630, alt: "Team Hippa Arizona Tennis" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Arizona Tennis Academy | Team Hippa",
      description: "Arizona’s best tennis training for youth and adults.",
      images: ["/images/arizona-tennis-academy.jpg"],
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

function generateStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teamhippa.com';
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsActivityLocation",
        "@id": `${baseUrl}/arizona-tennis-academy`,
        name: "Arizona Tennis Academy – Team Hippa",
        description: "Premier tennis coaching, lessons, and camps across Phoenix,and Gilbert, Arizona.",
        url: `${baseUrl}/arizona-tennis-academy`,
        telephone: "+1-602-341-3361",
        address: [
          {
            "@type": "PostalAddress",
            streetAddress: "Rose Mofford Sports Complex 9833 N 25th Ave",
            addressLocality: "Phoenix",
            addressRegion: "AZ",
            postalCode: "85021",
            addressCountry: "US"
          },
          {
            "@type": "PostalAddress",
            streetAddress: "Gilbert Regional Park",
            addressLocality: "Gilbert",
            addressRegion: "AZ",
            postalCode: "85296",
            addressCountry: "US"
          }
        ],
        geo: {
          "@type": "GeoCoordinates",
          latitude: 33.4484,
          longitude: -112.0740
        },
        openingHours: "Mo-Su 06:00-22:00",
        areaServed: [{ "@type": "City", name: "Phoenix" }, { "@type": "City", name: "Gilbert" }, { "@type": "City", name: "Scottsdale" }]
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "Team Hippa Tennis Academy",
        url: baseUrl,
        logo: `${baseUrl}/images/logo.png`,
        description: "Professional tennis academy in Arizona offering European and Amrican style coaching for all skill levels.",
        sameAs: [
          "https://www.facebook.com/p/Team-Hippa-61568839841383",
          "https://www.instagram.com/teamhippa_az"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/arizona-tennis-academy/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
          { "@type": "ListItem", position: 2, name: "Arizona Tennis Academy", item: `${baseUrl}/arizona-tennis-academy` }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: ARIZONA_TENNIS_ACADEMY.map(faq => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer }
        }))
      }
    ]
  };
}

async function ArizonaTennisAcademy() {
  let courses = [];
  let categories = [];
  let mappings = [];
  try {
    const [coursesRes, categoriesRes, mappingsRes] = await Promise.all([
      axios.get(`${apiUrl}/api/public_api/courses`),
      axios.get(`${apiUrl}/api/public/categories`),
      axios.get(`${apiUrl}/api/public/course-category-mappings`),
    ]);
    courses = (coursesRes.data || []).map((course: { imagePaths?: string[] }) => ({
      ...course,
      imagePaths: (course.imagePaths || []).map(
        path => path.startsWith("http") ? path : `${frontendServerUrl}${path}`
      ),
    }));
    categories = (categoriesRes.data || []).filter((c: { isPubliclyVisible: boolean }) => c.isPubliclyVisible);
    mappings = mappingsRes.data || [];
  } catch (error) { console.error("Failed to fetch data:", error); }

  const structuredData = generateStructuredData();

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-QLZS2FLVP4" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QLZS2FLVP4', { page_path: window.location.pathname });
      `}</Script>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Arizona Tennis Academy – Team Hippa"
        description="Elite tennis lessons, coaching, and camps in Phoenix, Gilbert. Youth and adult programs, certified coaches, modern facilities."
        showCallButton
      />
      <TennisGilbertClient initialCourses={courses} initialCategories={categories} initialMappings={mappings} />
      <FAQ
        title="Arizona Tennis Academy FAQ"
        subtitle="Frequently asked questions about tennis in Arizona."
        data={ARIZONA_TENNIS_ACADEMY}
      />
    </>
  );
}

export default ArizonaTennisAcademy;
