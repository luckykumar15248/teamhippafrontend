import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import axios from 'axios';
import SportsHeroSection from "../components/SportsHeroSection";
import FAQ from "../components/FAQ";
import PrivateCoachingClient from '../components/LandingPage/PrivateCoachingClient/PrivateCoachingClient';

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
  const pageUrl = `${baseUrl}/private-tennis-coaching`;
  
  return {
    title: "Private Tennis Coaching in Phoenix & Gilbert | TeamHippa",
    description: "Accelerate your game with 1-on-1 private tennis lessons. Expert coaches in Phoenix and Gilbert for adults and juniors. Book a private session today!",
    keywords: "private tennis lessons phoenix, tennis coach gilbert, 1 on 1 tennis instruction arizona, private tennis coach near me, individual tennis lessons phoenix",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "Private Tennis Coaching | TeamHippa",
      description: "The fastest way to improve. Book expert private tennis coaches in Phoenix and Gilbert.",
      url: pageUrl,
      siteName: "Team Hippa Tennis Academy",
      images: [
        {
          url: "/images/private-coaching-og.jpg",
          width: 1200,
          height: 630,
          alt: "Coach giving private tennis instruction",
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

// --- FAQs for Private Lessons ---
const PRIVATE_FAQS = [
  {
    question: "How much do private lessons cost?",
    answer: "Rates vary by coach tier, typically ranging from $70 to $120 per hour. We also offer lesson packages that reduce the per-hour cost significantly."
  },
  {
    question: "Can I do a semi-private lesson with a friend?",
    answer: "Yes! Semi-private lessons (2 players) are a great way to get personalized attention while splitting the cost. Just select 'Semi-Private' when booking or contact us."
  },
  {
    question: "Do I pick my coach or do you assign one?",
    answer: "You have the freedom to choose! You can browse our coach profiles on this page and book directly with the pro that fits your style and schedule."
  },
  {
    question: "What is the cancellation policy for private lessons?",
    answer: "We require 24-hour notice for cancellations to avoid being charged for the session. This allows our coaches to fill the slot with another student."
  }
];

// --- JSON-LD Schema ---
function generateStructuredData() {
  const pageUrl = `${baseUrl}/private-tennis-coaching`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "name": "TeamHippa Private Tennis Coaching",
        "description": "Expert 1-on-1 tennis instruction in Arizona.",
        "url": pageUrl,
        "telephone": "+1-602-341-3361",
        "address": [
            { "@type": "PostalAddress", "addressLocality": "Phoenix", "addressRegion": "AZ" },
            { "@type": "PostalAddress", "addressLocality": "Gilbert", "addressRegion": "AZ" }
        ],
        "priceRange": "$$"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Private Coaching", "item": pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": PRIVATE_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      }
    ]
  };
}

// --- The Page Component ---
export default async function PrivateCoachingPage() {
  const structuredData = generateStructuredData();

  // --- DATA FETCHING ---
  let courses: Course[] = [];
  //let categories: Category[] = [];
  let mappings: CourseCategoryMapping[] = [];
  let privateCategories: Category[] = [];

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
    
    const allCategories: Category[] = (categoriesRes.data || []).filter((c: { isPubliclyVisible: boolean }) => c.isPubliclyVisible);
    
    // --- FILTER LOGIC: PRIVATE / INDIVIDUAL ---
    privateCategories = allCategories.filter((cat: Category) => {
        const name = cat.categoryName.toLowerCase();
        return name.includes('private') || name.includes('individual') || name.includes('1-on-1') || name.includes('semi-private');
    }).sort((a: Category, b: Category) => a.displayOrder - b.displayOrder);

    mappings = mappingsRes.data || [];

  } catch (error) { 
    console.error("Failed to fetch data for Private Coaching page:", error); 
  }

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-QLZS2FLVP4" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QLZS2FLVP4', { page_path: '/private-tennis-coaching' });
      `}</Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <SportsHeroSection
        bgImage="/images/private-coaching-hero.jpg"
        title="Private Tennis Coaching in Arizona"
        description="The fastest way to improve. Personalized 1-on-1 instruction with expert coaches in Phoenix and Gilbert."
        showCallButton
      />
      
      <Suspense fallback={<div>Loading private coaches...</div>}>
        <PrivateCoachingClient 
          initialCourses={courses}
          initialCategories={privateCategories}
          initialMappings={mappings}
        />
      </Suspense>

      <FAQ
        title="Private Lessons FAQ"
        subtitle="Common questions about 1-on-1 training."
        data={PRIVATE_FAQS}
      />
    </>
  );
}