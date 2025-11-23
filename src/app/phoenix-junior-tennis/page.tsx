import { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import SportsHeroSection from "../components/SportsHeroSection"; // Assuming this is your existing hero component
import FAQ from "../components/FAQ"; // Assuming this is your existing FAQ component
import PhoenixJuniorClient from '../components/LandingPage/PhoenixJuniorClient/PhoenixJuniorClient'; // We will create this client component
import { PHOENIX_JUNIOR_FAQS } from "@/untils/constant";
// --- SEO Metadata ---
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teamhippa.com';

export async function generateMetadata(): Promise<Metadata> {
  const pageUrl = `${baseUrl}/phoenix-junior-tennis`;
  
  return {
    title: "Junior Tennis Lessons in Phoenix, AZ | TeamHippa Academy",
    description: "Enroll your child in fun, professional junior tennis lessons in Phoenix, AZ. TeamHippa offers year-round programs for all ages (4-18) at the Rose Mofford Sports Complex. Book a free trial!",
    keywords: "junior tennis lessons phoenix, kids tennis classes phoenix, youth tennis programs phoenix, phoenix beginner tennis for kids, rose mofford sports complex tennis, teamhippa phoenix",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "Junior Tennis Lessons in Phoenix, AZ | TeamHippa Academy",
      description: "Fun, expert-led tennis programs for kids and teens in Phoenix. We train at the Rose Mofford Sports Complex. Sign up for a free trial lesson today!",
      url: pageUrl,
      siteName: "Team Hippa Tennis Academy",
      images: [
        {
          url: "/images/phoenix-junior-tennis-og.jpg", // Create a specific OG image for this page
          width: 1200,
          height: 630,
          alt: "Junior tennis players in Phoenix, AZ at Team Hippa",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Junior Tennis Lessons in Phoenix, AZ | TeamHippa Academy",
      description: "Get your child on the court! We offer the best junior tennis lessons in Phoenix. All ages and skill levels welcome.",
      images: [`${baseUrl}/images/phoenix-junior-tennis-og.jpg`],
    },
    robots: { // Ensure Google can crawl and index this new page
      index: true,
      follow: true,
    },
  };
}

// --- FAQs for this specific page ---


// --- JSON-LD Schema (Structured Data) ---
function generateStructuredData() {
  const pageUrl = `${baseUrl}/phoenix-junior-tennis`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsActivityLocation",
        "name": "TeamHippa Junior Tennis - Phoenix",
        "description": "Premier junior tennis lessons for kids and teens in Phoenix, AZ. Offering beginner classes, youth programs, and elite training at the Rose Mofford Sports Complex.",
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
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 33.5755, // Specific coords for Rose Mofford
          "longitude": -112.0991
        },
        "areaServed": {
          "@type": "City",
          "name": "Phoenix"
        },
        "image": `${baseUrl}/images/phoenix-junior-tennis-og.jpg`,
        "priceRange": "$$"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Phoenix Junior Tennis Lessons", "item": pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": PHOENIX_JUNIOR_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      },
      {
        "@type": "Course",
        "name": "Phoenix Junior Tennis Programs (Ages 4-18)",
        "description": "A comprehensive set of tennis programs for kids, from Tots (4-6) and Beginners (7-10) to Teens (11+) and High-Performance training.",
        "provider": {
          "@type": "Organization",
          "name": "Team Hippa Tennis Academy",
          "sameAs": baseUrl
        }
      }
    ]
  };
}


// --- The Page Component (Server-Side) ---
export default async function PhoenixJuniorTennisPage() {
  const structuredData = generateStructuredData();

  return (
    <>
      {/* --- Google Analytics (from your original code) --- */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-QLZS2FLVP4" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QLZS2FLVP4', { page_path: '/phoenix-junior-tennis' });
      `}</Script>
      
      {/* --- Schema --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* --- Hero Section --- */}
      <SportsHeroSection
        bgImage="/images/phoenix-junior-hero.jpg" // Use a specific, high-energy photo of kids in Phoenix
        title="Phoenix Junior Tennis Lessons"
        description="Fun, professional tennis programs for kids and teens of all ages (4-18) at the Rose Mofford Sports Complex. Book a free trial today!"
        showCallButton
      />
      
      {/* --- Client Component (for all interactive content) --- */}
      <Suspense fallback={<div>Loading programs...</div>}>
        <PhoenixJuniorClient />
      </Suspense>

      {/* --- FAQ Section --- */}
      <FAQ
        title="Phoenix Junior Tennis FAQ"
        subtitle="Your questions about our kids' programs at Rose Mofford, answered."
        data={PHOENIX_JUNIOR_FAQS}
      />
    </>
  );
}