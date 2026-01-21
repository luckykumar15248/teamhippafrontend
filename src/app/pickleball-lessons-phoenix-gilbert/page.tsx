import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import axios from 'axios';
import SportsHeroSection from "../components/SportsHeroSection";
import FAQ from "../components/FAQ";
import PickleballClient from '../components/LandingPage/PickleballClient/PickleballClient';

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
  const pageUrl = `${baseUrl}/pickleball-lessons-phoenix-gilbert`;
  
  return {
    title: "Pickleball Lessons in Phoenix & Gilbert, AZ | TeamHippa",
    description: "Learn to play Pickleball! Beginner lessons, drill sessions, and social play in Phoenix and Gilbert. Join Arizona's fastest-growing sports community today.",
    keywords: "pickleball lessons phoenix, learn pickleball gilbert, beginner pickleball classes arizona, pickleball clinics phoenix, pickleball coach gilbert, rose mofford pickleball",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "Pickleball Lessons in Phoenix & Gilbert, AZ | TeamHippa",
      description: "Fun, social, and easy to learn. Join our Pickleball clinics in Phoenix & Gilbert today!",
      url: pageUrl,
      siteName: "Team Hippa Tennis & Pickleball Academy",
      images: [
        {
          url: "/images/pickleball-lessons-og.jpg",
          width: 1200,
          height: 630,
          alt: "Pickleball players high-fiving in Arizona",
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

// --- FAQs for Pickleball ---
const PICKLEBALL_FAQS = [
  {
    question: "I've never played before. Is Pickleball hard to learn?",
    answer: "Not at all! Pickleball is famous for being easy to pick up. Our 'Intro to Pickleball' clinics will have you playing real games within the first hour."
  },
  {
    question: "Do I need my own paddle?",
    answer: "No paddle? No problem! We provide high-quality demo paddles for all our beginner clinics. Once you get hooked (and you will!), our coaches can recommend the best paddle for your style."
  },
  {
    question: "What is the difference between Pickleball and Tennis?",
    answer: "Pickleball is played on a smaller court with a solid paddle and a plastic ball. There is less running than tennis, making it easier on the joints, but it still requires quick reflexes and strategy."
  },
  {
    question: "Where are the lessons held?",
    answer: "We offer Pickleball programs at both of our main locations: Rose Mofford Sports Complex in Phoenix and Gilbert Regional Park."
  }
];

// --- JSON-LD Schema ---
function generateStructuredData() {
  const pageUrl = `${baseUrl}/pickleball-lessons-phoenix-gilbert`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsActivityLocation",
        "name": "TeamHippa Pickleball Academy",
        "description": "Professional Pickleball coaching and clinics in Phoenix and Gilbert, AZ.",
        "url": pageUrl,
        "telephone": "+1-602-341-3361",
        "address": [
            { "@type": "PostalAddress", "addressLocality": "Phoenix", "addressRegion": "AZ" },
            { "@type": "PostalAddress", "addressLocality": "Gilbert", "addressRegion": "AZ" }
        ],
        "areaServed": ["Phoenix", "Gilbert", "Scottsdale"],
        "priceRange": "$$"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Pickleball Lessons", "item": pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": PICKLEBALL_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      }
    ]
  };
}

// --- The Page Component ---
export default async function PickleballPage() {
  const structuredData = generateStructuredData();

  // --- DATA FETCHING ---
  let courses: Course[] = [];
  //let categories: Category[] = [];
  let mappings: CourseCategoryMapping[] = [];
  let pickleballCategories: Category[] = [];

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
    
    // --- FILTER LOGIC: PICKLEBALL ONLY ---
    pickleballCategories = allCategories
      .filter((cat) => cat.categoryName.toLowerCase().includes('pickle'))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    mappings = mappingsRes.data || [];

  } catch (error) { 
    console.error("Failed to fetch data for Pickleball page:", error); 
  }

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-QLZS2FLVP4" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QLZS2FLVP4', { page_path: '/pickleball-lessons-phoenix-gilbert' });
      `}</Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <SportsHeroSection
        bgImage="/images/pickleball-hero.jpg"
        title="Pickleball Lessons in Phoenix & Gilbert"
        description="Join the craze! Fun, social, and easy-to-learn clinics for beginners and intermediates. Serving Phoenix, Gilbert, and Scottsdale."
        showCallButton
      />
      
      <Suspense fallback={<div>Loading pickleball programs...</div>}>
        <PickleballClient 
          initialCourses={courses}
          initialCategories={pickleballCategories}
          initialMappings={mappings}
        />
      </Suspense>

      <FAQ
        title="Pickleball FAQ"
        subtitle="Questions about getting started with Pickleball."
        data={PICKLEBALL_FAQS}
      />
    </>
  );
}