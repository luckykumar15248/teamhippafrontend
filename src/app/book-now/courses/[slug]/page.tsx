// app/courses/[slug]/page.tsx
import CourseDetailClient from "@/app/components/courses/[slug]/CourseDetailClient";
import { Metadata } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
const frontendServerUrl = process.env.NEXT_PUBLIC_FRONTEND_SERVER_URL!;

// ---------------------------
// Server-side SEO Metadata
// ---------------------------
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // Await the params Promise for Next.js 15
  const { slug } = await params;
  
  try {
    const res = await fetch(`${apiUrl}/api/public/courses/byslug/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        title: "Course Not Found | Team Hippa",
        description: "The requested course could not be found.",
      };
    }

    const course = await res.json();

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.name,
      "description": course.shortDescription,
      "provider": {
        "@type": "Organization",
        "name": "Team Hippa",
        "url": "https://teamhippa.com"
      },
      "offers": {
        "@type": "Offer",
        "price": course.basePriceInfo,
        "priceCurrency": "USD"
      },
      "sport": course.sportName,
    };

    const metadata: Metadata = {
      title: course.seoMetadata?.metaTitle || `${course.name} | Team Hippa ${course.sportName} Academy`,
      description: course.seoMetadata?.metaDescription || course.shortDescription,
      keywords: course.seoMetadata?.metaKeywords || `${course.sportName.toLowerCase()} lessons, ${course.sportName.toLowerCase()} coaching, ${course.sportName.toLowerCase()} classes gilbert az`,
      alternates: {
        canonical: course.seoMetadata?.canonicalUrl || `${frontendServerUrl}/courses/${course.slug}`,
      },
      openGraph: {
        title: course.seoMetadata?.ogTitle || course.seoMetadata?.metaTitle || course.name,
        description: course.seoMetadata?.ogDescription || course.seoMetadata?.metaDescription || course.shortDescription,
        url: `${frontendServerUrl}/courses/${course.slug}`,
        type: 'website',
        images: course.seoMetadata?.ogImageUrl
          ? [{ url: course.seoMetadata.ogImageUrl }]
          : course.imagePaths?.map((img: string) => ({ 
              url: img,
              width: 1200,
              height: 630,
              alt: course.name 
            })) || [],
      },
      twitter: {
        card: "summary_large_image",
        title: course.seoMetadata?.twitterTitle || course.seoMetadata?.metaTitle || course.name,
        description: course.seoMetadata?.twitterDescription || course.seoMetadata?.metaDescription || course.shortDescription,
        images: course.seoMetadata?.twitterImageUrl
          ? [course.seoMetadata.twitterImageUrl]
          : course.imagePaths || [],
      },
      other: {
        'script:ld+json': JSON.stringify(structuredData),
      },
    };

    return metadata;
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Course Details | Team Hippa",
      description: "Learn more about our sports courses and training programs.",
    };
  }
}

// ---------------------------
// Server-side Page Wrapper
// ---------------------------
export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params Promise for Next.js 15
  const { slug } = await params;

  try {
    const res = await fetch(`${apiUrl}/api/public/courses/byslug/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center py-20 text-lg text-gray-600 max-w-md mx-auto px-4 dark:text-gray-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">Course Not Found</h2>
            <p className="mb-6">The course you are looking for does not exist or may have been moved.</p>
            <button 
              onClick={() => window.history.back()}
              className="bg-[#b0db72] text-white px-6 py-2 rounded-lg hover:bg-[#3a702b] transition-colors dark:bg-[#9acd50] dark:hover:bg-[#7cb342]"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    const course = await res.json();

    return <CourseDetailClient course={course} />;
  } catch (error) {
    console.error('Error loading course:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center py-20 text-lg text-gray-600 max-w-md mx-auto px-4 dark:text-gray-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">Error Loading Course</h2>
          <p className="mb-6">There was a problem loading the course details. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#b0db72] text-white px-6 py-2 rounded-lg hover:bg-[#3a702b] transition-colors dark:bg-[#9acd50] dark:hover:bg-[#7cb342]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}