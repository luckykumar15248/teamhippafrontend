// app/courses/[slug]/page.tsx
import CourseDetailClient from "@/app/components/courses/[slug]/CourseDetailClient";
import { Metadata } from "next";


const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
const frontendServerUrl = process.env.NEXT_PUBLIC_FRONTEND_SERVER_URL!;

// ---------------------------
// Server-side SEO Metadata
// ---------------------------
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const res = await fetch(`${apiUrl}/api/public_api/courses/${params.slug}`, {
    next: { revalidate: 60 }, // revalidate every 60s
  });

  if (!res.ok) return { title: "Course Not Found" };

  const course = await res.json();

  return {
    title: course.seoMetadata?.metaTitle || course.name,
    description: course.seoMetadata?.metaDescription || course.shortDescription,
    keywords: course.seoMetadata?.metaKeywords || undefined,
    alternates: {
      canonical: course.seoMetadata?.canonicalUrl || `${frontendServerUrl}/courses/${course.slug}`,
    },
    openGraph: {
      title: course.seoMetadata?.ogTitle || course.seoMetadata?.metaTitle || course.name,
      description:
        course.seoMetadata?.ogDescription || course.seoMetadata?.metaDescription || course.shortDescription,
      url: `${frontendServerUrl}/courses/${course.slug}`,
      images: course.seoMetadata?.ogImageUrl
        ? [course.seoMetadata.ogImageUrl]
        : course.imagePaths?.map((img: string) => ({ url: img })) || [],
    },
    twitter: {
      card: "summary_large_image",
      title: course.seoMetadata?.twitterTitle || course.seoMetadata?.metaTitle || course.name,
      description:
        course.seoMetadata?.twitterDescription || course.seoMetadata?.metaDescription || course.shortDescription,
      images: course.seoMetadata?.twitterImageUrl
        ? [course.seoMetadata.twitterImageUrl]
        : course.imagePaths || [],
    },
  };
}

// ---------------------------
// Server-side Page Wrapper
// ---------------------------
export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const res = await fetch(`${apiUrl}/api/public_api/courses/${params.slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return (
      <div className="text-center py-20 text-lg text-gray-600">
        <h2>Course Not Found</h2>
        <p className="mt-2">The course you are looking for does not exist or may have been moved.</p>
      </div>
    );
  }

  const course = await res.json();

  // ✅ Pass data to client component
  return <CourseDetailClient course={course} />;
}
