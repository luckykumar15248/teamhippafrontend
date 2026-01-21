import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import axios from 'axios';
import SportsHeroSection from "../components/SportsHeroSection";
import FAQ from "../components/FAQ";
import ScottsdaleClient from '../components/LandingPage/ScottsdaleClient/ScottsdaleClient';

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
  const pageUrl = `${baseUrl}/scottsdale-tennis-lessons`;
  
  return {
    title: "Tennis Lessons for Scottsdale Players | TeamHippa Academy",
    description: "Looking for top-tier tennis coaching near Scottsdale? Join Team Hippa at the Rose Mofford Sports Complex. Elite junior programs, adult clinics, and private lessons just minutes away.",
    keywords: "tennis lessons scottsdale, scottsdale junior tennis, adult tennis clinics scottsdale, tennis coach near scottsdale, tennis academy scottsdale az",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "Premier Tennis Training for Scottsdale Residents | TeamHippa",
      description: "World-class coaching without the country club price. Join us at Rose Mofford Sports Complex.",
      url: pageUrl,
      siteName: "Team Hippa Tennis Academy",
      images: [
        {
          url: "/images/scottsdale-tennis-og.jpg",
          width: 1200,
          height: 630,
          alt: "Tennis player serving",
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

// --- FAQs for Scottsdale ---
const SCOTTSDALE_FAQS = [
  {
    question: "Where are the lessons located?",
    answer: "Our classes are held at the Rose Mofford Sports Complex in North Phoenix. It is conveniently located just off the I-17, making it a quick 15-20 minute drive for many Scottsdale residents."
  },
  {
    question: "Do you have programs for competitive juniors?",
    answer: "Yes! Many of our top high-performance players live in Scottsdale but train with us for our elite coaching methodology and competitive group dynamics."
  },
  {
    question: "Do I need a membership?",
    answer: "No. Unlike many Scottsdale clubs, Team Hippa is open to the public. You pay only for the clinics or lessons you book, with no initiation fees or monthly dues."
  }
];

// --- JSON-LD Schema ---
function generateStructuredData() {
  const pageUrl = `${baseUrl}/scottsdale-tennis-lessons`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsActivityLocation",
        "name": "TeamHippa Tennis - Serving Scottsdale",
        "description": "Professional tennis coaching for Scottsdale residents at Rose Mofford Sports Complex.",
        "url": pageUrl,
        "telephone": "+1-602-341-3361",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Rose Mofford Sports Complex, 9833 N 25th Ave",
          "addressLocality": "Phoenix",
          "addressRegion": "AZ",
          "postalCode": "85021",
          "addressCountry": "US"
        },
        "areaServed": [
            { "@type": "City", "name": "Scottsdale" },
            { "@type": "City", "name": "Paradise Valley" },
            { "@type": "City", "name": "North Phoenix" }
        ],
        "priceRange": "$$"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Scottsdale Tennis", "item": pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": SCOTTSDALE_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      }
    ]
  };
}

// --- The Page Component ---
export default async function ScottsdaleTennisPage() {
  const structuredData = generateStructuredData();

  // --- DATA FETCHING ---
  let courses: Course[] = [];
  //let categories: Category[] = [];
  let mappings: CourseCategoryMapping[] = [];
  let scottsdaleCategories: Category[] = [];

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
    
    const allCategories: Category[] = ((categoriesRes.data || []) as Category[]).filter((c) => c.isPubliclyVisible);
    
    // --- FILTER LOGIC: SCOTTSDALE ---
    // Since we don't have a physical location in Scottsdale, we want to show categories
    // that might appeal to them (High Performance) OR categories from the nearest location (Phoenix).
    scottsdaleCategories = allCategories
      .filter((cat) => {
        const name = cat.categoryName.toLowerCase();
        return name.includes('scottsdale') ||
               name.includes('phoenix') || // Include Phoenix because that's the location
               name.includes('academy') ||
               name.includes('elite');
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);

    mappings = mappingsRes.data || [];

  } catch (error) { 
    console.error("Failed to fetch data for Scottsdale page:", error); 
  }

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-QLZS2FLVP4" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QLZS2FLVP4', { page_path: '/scottsdale-tennis-lessons' });
      `}</Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <SportsHeroSection
        bgImage="/images/scottsdale-tennis-hero.jpg"
        title="Tennis Lessons for Scottsdale Players"
        description="World-class coaching, just minutes away. Join the many Scottsdale families who choose Team Hippa for elite training and inclusive community."
        showCallButton
      />
      
      <Suspense fallback={<div>Loading programs...</div>}>
        <ScottsdaleClient 
          initialCourses={courses}
          initialCategories={scottsdaleCategories}
          initialMappings={mappings}
        />
      </Suspense>

      <FAQ
        title="Scottsdale Tennis FAQ"
        subtitle="Common questions from our Scottsdale members."
        data={SCOTTSDALE_FAQS}
      />
    </>
  );
}