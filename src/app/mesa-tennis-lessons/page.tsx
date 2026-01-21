import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import axios from 'axios';
import SportsHeroSection from "../components/SportsHeroSection";
import FAQ from "../components/FAQ";
import MesaClient from '../components/LandingPage/MesaClient/MesaClient';

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
  const pageUrl = `${baseUrl}/mesa-tennis-lessons`;
  
  return {
    title: "Mesa Tennis Lessons & Coaching | TeamHippa Academy",
    description: "Looking for top-tier tennis lessons near Mesa? Team Hippa offers expert coaching just minutes away at Gilbert Regional Park. Junior programs, adult clinics, and private lessons.",
    keywords: "mesa tennis lessons, tennis coach mesa az, junior tennis programs mesa, adult tennis clinics mesa, tennis academy near mesa",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "The Best Tennis Lessons for Mesa Residents | TeamHippa",
      description: "Professional coaching without the commute. Join us at Gilbert Regional Park or Rose Mofford.",
      url: pageUrl,
      siteName: "Team Hippa Tennis Academy",
      images: [
        {
          url: "/images/mesa-tennis-og.jpg",
          width: 1200,
          height: 630,
          alt: "Tennis coaching near Mesa, AZ",
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

// --- FAQs for Mesa ---
const MESA_FAQS = [
  {
    question: "Which location is closest to Mesa?",
    answer: "For most Mesa residents (especially Eastmark and South Mesa), our Gilbert Regional Park location is just a 10-15 minute drive. For West Mesa, our Phoenix location might be convenient."
  },
  {
    question: "Do you have competitive programs for juniors?",
    answer: "Yes! We run a High-Performance Academy that attracts top juniors from Mesa, Gilbert, and Chandler. It's the perfect environment for serious improvement."
  },
  {
    question: "Are there pickleball lessons available too?",
    answer: "Absolutely. We offer beginner and intermediate pickleball clinics at both of our locations, perfect for Mesa residents looking to join the craze."
  }
];

// --- JSON-LD Schema ---
function generateStructuredData() {
  const pageUrl = `${baseUrl}/mesa-tennis-lessons`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsActivityLocation",
        "name": "TeamHippa Tennis - Serving Mesa",
        "description": "Professional tennis coaching for Mesa residents.",
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
            { "@type": "City", "name": "Mesa" },
            { "@type": "City", "name": "East Mesa" },
            { "@type": "City", "name": "Gilbert" }
        ],
        "priceRange": "$$"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Mesa Tennis", "item": pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": MESA_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      }
    ]
  };
}

// --- The Page Component ---
export default async function MesaTennisPage() {
  const structuredData = generateStructuredData();

  // --- DATA FETCHING ---
  let courses: Course[] = [];
  //let categories: Category[] = [];
  let mappings: CourseCategoryMapping[] = [];
  let mesaCategories: Category[] = [];

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
    
    // --- FILTER LOGIC: MESA ---
    // Mesa residents usually go to Gilbert (closest) or Phoenix.
    mesaCategories = allCategories.filter((cat: Category) => {
        const name = cat.categoryName.toLowerCase();
        return name.includes('mesa') || 
               name.includes('gilbert') || 
               name.includes('adult') || 
               name.includes('junior');
    }).sort((a: Category, b: Category) => a.displayOrder - b.displayOrder);

    mappings = mappingsRes.data || [];

  } catch (error) { 
    console.error("Failed to fetch data for Mesa page:", error); 
  }

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-QLZS2FLVP4" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QLZS2FLVP4', { page_path: '/mesa-tennis-lessons' });
      `}</Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <SportsHeroSection
        bgImage="/images/mesa-tennis-hero.jpg"
        title="Tennis Lessons for Mesa Families"
        description="Elite coaching within easy reach. Join Mesa players who choose Team Hippa for expert instruction at Gilbert Regional Park."
        showCallButton
      />
      
      <Suspense fallback={<div>Loading programs...</div>}>
        <MesaClient 
          initialCourses={courses}
          initialCategories={mesaCategories}
          initialMappings={mappings}
        />
      </Suspense>

      <FAQ
        title="Mesa Tennis FAQ"
        subtitle="Questions about our programs for Mesa residents."
        data={MESA_FAQS}
      />
    </>
  );
}