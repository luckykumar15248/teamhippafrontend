import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import axios from 'axios';
import SportsHeroSection from "../components/SportsHeroSection";
import FAQ from "../components/FAQ";
import ChandlerClient from '../components/LandingPage/ChandlerClient/ChandlerClient';

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
  const pageUrl = `${baseUrl}/chandler-tennis-lessons`;
  
  return {
    title: "Chandler Tennis Lessons & Coaching | TeamHippa Academy",
    description: "Looking for tennis lessons in Chandler? Join Team Hippa at Gilbert Regional Park—just minutes away! Expert junior programs, adult clinics, and private coaching.",
    keywords: "chandler tennis lessons, tennis coach chandler az, junior tennis programs chandler, adult tennis clinics chandler, tennis academy near chandler",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "Chandler's Top Choice for Tennis | TeamHippa",
      description: "Elite coaching, affordable prices, and a great community just minutes from Chandler.",
      url: pageUrl,
      siteName: "Team Hippa Tennis Academy",
      images: [
        {
          url: "/images/chandler-tennis-og.jpg",
          width: 1200,
          height: 630,
          alt: "Tennis players on court near Chandler",
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

// --- FAQs for Chandler ---
const CHANDLER_FAQS = [
  {
    question: "How far is the facility from Chandler?",
    answer: "We are located at Gilbert Regional Park, which is a short 10-15 minute drive from most parts of Chandler. It's an easy commute for top-tier coaching."
  },
  {
    question: "Do you offer lessons for beginners?",
    answer: "Absolutely! We have specific 'Tennis 101' clinics for adults and 'Red Ball' classes for kids who are picking up a racquet for the first time."
  },
  {
    question: "Can I book a court for practice?",
    answer: "While we focus on instructional clinics and lessons, the courts at Gilbert Regional Park are public. We recommend checking with the park for open play availability outside of our lesson times."
  }
];

// --- JSON-LD Schema ---
function generateStructuredData() {
  const pageUrl = `${baseUrl}/chandler-tennis-lessons`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsActivityLocation",
        "name": "TeamHippa Tennis - Serving Chandler",
        "description": "Professional tennis coaching for Chandler residents at Gilbert Regional Park.",
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
        "areaServed": [
            { "@type": "City", "name": "Chandler" },
            { "@type": "City", "name": "Sun Lakes" },
            { "@type": "City", "name": "Gilbert" }
        ],
        "priceRange": "$$"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Chandler Tennis", "item": pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": CHANDLER_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      }
    ]
  };
}

// --- The Page Component ---
export default async function ChandlerTennisPage() {
  const structuredData = generateStructuredData();

  // --- DATA FETCHING ---
  let courses: Course[] = [];
  //let categories: Category[] = [];
  let mappings: CourseCategoryMapping[] = [];
  let chandlerCategories: Category[] = [];

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
    
    const allCategories = ((categoriesRes.data || []) as Category[]).filter((c) => c.isPubliclyVisible);
    
    // --- FILTER LOGIC: CHANDLER ---
    // Show categories relevant to Gilbert (the location) or Chandler explicitly
    chandlerCategories = allCategories.filter((cat) => {
        const name = cat.categoryName.toLowerCase();
        return name.includes('chandler') || 
               name.includes('gilbert') || 
               name.includes('adult') || 
               name.includes('junior');
    }).sort((a: Category, b: Category) => a.displayOrder - b.displayOrder);

    mappings = mappingsRes.data || [];

  } catch (error) { 
    console.error("Failed to fetch data for Chandler page:", error); 
  }

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-QLZS2FLVP4" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QLZS2FLVP4', { page_path: '/chandler-tennis-lessons' });
      `}</Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <SportsHeroSection
        bgImage="/images/chandler-tennis-hero.jpg"
        title="Tennis Lessons for Chandler Families"
        description="Top-rated coaching just minutes away. Join the Chandler players who choose Team Hippa for expert instruction and fun at Gilbert Regional Park."
        showCallButton
      />
      
      <Suspense fallback={<div>Loading programs...</div>}>
        <ChandlerClient 
          initialCourses={courses}
          initialCategories={chandlerCategories}
          initialMappings={mappings}
        />
      </Suspense>

      <FAQ
        title="Chandler Tennis FAQ"
        subtitle="Questions about our location and programs."
        data={CHANDLER_FAQS}
      />
    </>
  );
}