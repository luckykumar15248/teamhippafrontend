import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import axios from 'axios';
import SportsHeroSection from "../components/SportsHeroSection";
import FAQ from "../components/FAQ";
import GilbertAdultClient from '../components/LandingPage/GilbertAdultClient/GilbertAdultClient';

// --- Types ---
interface Course { id: number; slug: string; name: string; sportName: string; sportId: number; shortDescription: string; basePriceInfo: string; description: string; imagePaths: string[]; isActive: boolean; duration: string; }
interface Category { categoryId: number; categoryName: string; isPubliclyVisible: boolean; displayOrder: number; }
interface CourseCategoryMapping { courseId: number; categoryId: number; }

// --- API Config ---
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const frontendServerUrl = process.env.NEXT_PUBLIC_FRONTEND_SERVER_URL;
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teamhippa.com';

// --- SEO Metadata ---
export async function generateMetadata(): Promise<Metadata> {
  const pageUrl = `${baseUrl}/gilbert-adult-tennis`;
  
  return {
    title: "Adult Tennis Lessons & Clinics in Gilbert, AZ | TeamHippa",
    description: "Join the best adult tennis clinics in Gilbert! We offer beginner lessons, drill & play, and cardio tennis at Gilbert Regional Park. Get 15% off your first class!",
    keywords: "adult tennis lessons gilbert az, beginner tennis for adults gilbert, gilbert tennis clinics, adult tennis programs gilbert, cardio tennis gilbert, tennis lessons for seniors gilbert",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "Adult Tennis Lessons & Clinics in Gilbert, AZ | TeamHippa",
      description: "Get fit and have fun! Expert adult tennis coaching, clinics, and social play at Gilbert Regional Park.",
      url: pageUrl,
      siteName: "Team Hippa Tennis Academy",
      images: [
        {
          url: "/images/gilbert-adult-tennis-og.jpg",
          width: 1200,
          height: 630,
          alt: "Adult tennis clinic in Gilbert, AZ",
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

// --- FAQs for Gilbert Adults ---
const GILBERT_ADULT_FAQS = [
  {
    question: "Do I need to be a member to take a clinic?",
    answer: "Not at all! Our adult clinics at Gilbert Regional Park are open to everyone. You can drop in for a single class or buy a package to save money. No long-term contracts required."
  },
  {
    question: "I haven't played in years. Is there a class for me?",
    answer: "Absolutely. Our 'Tennis 101' or 'Rusty Racquets' clinics are designed exactly for you. We focus on getting your groove back in a low-pressure, fun environment."
  },
  {
    question: "Do I need my own racquet?",
    answer: "We recommend having your own racquet, but if you're just starting, we have demo racquets available for your first few sessions. Our coaches can also help you choose the right one to buy."
  },
  {
    question: "What is the difference between a Clinic and a Drill Session?",
    answer: "Clinics usually focus on learning specific techniques (like how to serve). Drill Sessions are faster-paced, focusing on movement, hitting lots of balls, and getting a great workout."
  }
];

// --- JSON-LD Schema ---
function generateStructuredData() {
  const pageUrl = `${baseUrl}/gilbert-adult-tennis`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsActivityLocation",
        "name": "TeamHippa Adult Tennis - Gilbert",
        "description": "Premier adult tennis clinics, lessons, and leagues in Gilbert, AZ. Located at Gilbert Regional Park.",
        "url": pageUrl,
        "telephone": "+1-602-341-3361",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Gilbert Regional Park, 3005 E Queen Creek Rd",
          "addressLocality": "Gilbert",
          "addressRegion": "AZ",
          "postalCode": "85298",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 33.2612,
          "longitude": -111.7169
        },
        "areaServed": {
          "@type": "City",
          "name": "Gilbert"
        },
        "priceRange": "$$"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Gilbert Adult Tennis", "item": pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": GILBERT_ADULT_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      }
    ]
  };
}

// --- The Page Component ---
export default async function GilbertAdultTennisPage() {
  const structuredData = generateStructuredData();

  // --- DATA FETCHING ---
  let courses: Course[] = [];
  // categories: Category[] = [];
  let mappings: CourseCategoryMapping[] = [];
  let gilbertAdultCategories: Category[] = [];

  try {
    const [coursesRes, categoriesRes, mappingsRes] = await Promise.all([
      axios.get(`${apiUrl}/api/public_api/courses`),
      axios.get(`${apiUrl}/api/public/categories`),
      axios.get(`${apiUrl}/api/public/course-category-mappings`),
    ]);

    courses = (coursesRes.data || []).map((course: { imagePaths?: string[] }) => ({
      ...course,
      imagePaths: (course.imagePaths || []).map(
        (path: string) => path.startsWith("http") ? path : `${frontendServerUrl}${path}`
      ),
    }));
    
    const allCategories = (categoriesRes.data || []).filter((c: { isPubliclyVisible: boolean }) => c.isPubliclyVisible);
    
    // --- FILTER LOGIC: GILBERT + ADULT ---
    gilbertAdultCategories = allCategories.filter((cat: Category) => 
      cat.categoryName.toLowerCase().includes('gilbert') &&
      (
        cat.categoryName.toLowerCase().includes('adult') ||
        cat.categoryName.toLowerCase().includes('clinic') ||
        cat.categoryName.toLowerCase().includes('private') ||
        cat.categoryName.toLowerCase().includes('drill') ||
        cat.categoryName.toLowerCase().includes('cardio')
      )
    ).sort((a: Category, b: Category) => a.displayOrder - b.displayOrder);
    
    // Fallback: If no specific "Adult" categories found, show all Gilbert categories
    if (gilbertAdultCategories.length === 0) {
      gilbertAdultCategories = allCategories.filter((cat: Category) => 
        cat.categoryName.toLowerCase().includes('gilbert')
      ).sort((a: Category, b: Category) => a.displayOrder - b.displayOrder);
    }

    mappings = mappingsRes.data || [];

  } catch (error) { 
    console.error("Failed to fetch data for Gilbert Adult page:", error); 
  }

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-QLZS2FLVP4" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QLZS2FLVP4', { page_path: '/gilbert-adult-tennis' });
      `}</Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <SportsHeroSection
        bgImage="/images/gilbert-adult-hero.jpg"
        title="Adult Tennis Clinics in Gilbert"
        description="Get in the game! Social, instructional, and fitness-focused tennis programs for adults of all levels at Gilbert Regional Park."
        showCallButton
      />
      
      <Suspense fallback={<div>Loading programs...</div>}>
        <GilbertAdultClient 
          initialCourses={courses}
          initialCategories={gilbertAdultCategories}
          initialMappings={mappings}
        />
      </Suspense>

      <FAQ
        title="Gilbert Adult Tennis FAQ"
        subtitle="Everything you need to know about playing tennis in Gilbert."
        data={GILBERT_ADULT_FAQS}
      />
    </>
  );
}