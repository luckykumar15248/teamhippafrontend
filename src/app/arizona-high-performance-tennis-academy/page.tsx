import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import axios from 'axios';
import SportsHeroSection from "../components/SportsHeroSection";
import FAQ from "../components/FAQ";
import HighPerformanceClient from '../components/LandingPage/HighPerformanceClient/HighPerformanceClient';

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
  const pageUrl = `${baseUrl}/high-performance-academy`;
  
  return {
    title: "Arizona High-Performance Tennis Academy | Elite Junior Training",
    description: "Train for college scholarships and national rankings. Team Hippa's High-Performance Academy in Phoenix & Gilbert offers elite coaching, physical conditioning, and tournament travel.",
    keywords: "high performance tennis academy arizona, elite junior tennis phoenix, tennis college placement arizona, tournament training gilbert, usta junior coaching phoenix, advanced tennis drills",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "Arizona High-Performance Tennis Academy | Team Hippa",
      description: "The pathway to collegiate tennis starts here. Elite training for dedicated juniors in Phoenix & Gilbert.",
      url: pageUrl,
      siteName: "Team Hippa Tennis Academy",
      images: [
        {
          url: "/images/high-performance-og.jpg",
          width: 1200,
          height: 630,
          alt: "High performance tennis player serving",
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

// --- FAQs for High Performance ---
const HP_FAQS = [
  {
    question: "How do I get my child into the High-Performance program?",
    answer: "Admission is by evaluation only. We want to ensure every player is placed in a group that matches their skill level and commitment. You can book an evaluation using the form on this page."
  },
  {
    question: "Do you help with college recruiting?",
    answer: "Yes. Our coaching staff has extensive connections with collegiate programs. We assist with tournament scheduling, recruiting videos, and communicating with college coaches to help players find the right fit."
  },
  {
    question: "Is physical conditioning included?",
    answer: "Absolutely. Modern tennis requires elite athleticism. Our academy schedule includes specific blocks for footwork, strength, agility, and injury prevention training."
  },
  {
    question: "What is the student-to-coach ratio?",
    answer: "For our Academy groups, we maintain a strict 4:1 ratio to ensure high-intensity drilling and personalized feedback for every athlete."
  }
];

// --- JSON-LD Schema ---
function generateStructuredData() {
  const pageUrl = `${baseUrl}/high-performance-academy`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsOrganization",
        "name": "Team Hippa High-Performance Academy",
        "description": "Elite tennis training academy for competitive juniors in Arizona.",
        "url": pageUrl,
        "location": [
            { "@type": "Place", "name": "Rose Mofford Sports Complex", "address": { "@type": "PostalAddress", "addressLocality": "Phoenix", "addressRegion": "AZ" } },
            { "@type": "Place", "name": "Gilbert Regional Park", "address": { "@type": "PostalAddress", "addressLocality": "Gilbert", "addressRegion": "AZ" } }
        ],
        "memberOf": {
            "@type": "Organization",
            "name": "USTA Southwest"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "High-Performance Academy", "item": pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": HP_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      }
    ]
  };
}

// --- The Page Component ---
export default async function HighPerformancePage() {
  const structuredData = generateStructuredData();

  // --- DATA FETCHING ---
  let courses: Course[] = [];
  //let categories: Category[] = [];
  let mappings: CourseCategoryMapping[] = [];
  let hpCategories: Category[] = [];

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
    
    // --- FILTER LOGIC: HIGH PERFORMANCE ---
    hpCategories = allCategories.filter((cat: Category) => {
      const name = cat.categoryName.toLowerCase();
      return name.includes('performance') || 
             name.includes('academy') || 
             name.includes('elite') || 
             name.includes('tournament') ||
             name.includes('competitive');
    }).sort((a: Category, b: Category) => a.displayOrder - b.displayOrder);

    mappings = mappingsRes.data || [];

  } catch (error) { 
    console.error("Failed to fetch data for High Performance page:", error); 
  }

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-QLZS2FLVP4" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QLZS2FLVP4', { page_path: '/high-performance-academy' });
      `}</Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <SportsHeroSection
        bgImage="/images/high-performance-hero.jpg"
        title="Arizona High-Performance Tennis Academy"
        description="The pathway to collegiate success. Elite coaching, physical conditioning, and tournament training for dedicated juniors in Phoenix & Gilbert."
        showCallButton
      />
      
      <Suspense fallback={<div>Loading academy programs...</div>}>
        <HighPerformanceClient 
          initialCourses={courses}
          initialCategories={hpCategories}
          initialMappings={mappings}
        />
      </Suspense>

      <FAQ
        title="Academy FAQ"
        subtitle="Common questions about our competitive training."
        data={HP_FAQS}
      />
    </>
  );
}