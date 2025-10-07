import React from "react";
import TennisPageClient from "@/app/components/LandingPage/TennisPageClient.tsx/TennisPageClient";
import Meta from "@/app/components/Meta";


const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface Course {
  id: number;
  name: string;
  sportName: string | null;
  shortDescription: string;
  basePriceInfo: string;
  description: string;
  imagePaths: string[] | null;
  isActive: boolean;
}

interface Category {
  categoryId: number;
  categoryName: string;
  isPubliclyVisible: boolean;
  displayOrder: number;
}

interface CourseCategoryMapping {
  courseId: number;
  categoryId: number;
}


// Fetch tennis data as before
async function fetchTennisData() {
  const [coursesRes, categoriesRes, mappingsRes] = await Promise.all([
    fetch(`${apiUrl}/api/public_api/courses`, { cache: "no-store" }),
    fetch(`${apiUrl}/api/public/categories`, { cache: "no-store" }),
    fetch(`${apiUrl}/api/public/course-category-mappings`, { cache: "no-store" }),
  ]);
  const allFetchedCourses: Course[] = await coursesRes.json();
  const allFetchedCategories: Category[] = await categoriesRes.json();
  const allFetchedMappings: CourseCategoryMapping[] = await mappingsRes.json();

  const bookableCourseIds = new Set(allFetchedMappings.map((m) => m.courseId));

  const filteredTennisCourses = allFetchedCourses
    .filter(
      (c) =>
        c.isActive &&
        c.sportName &&
        c.sportName.toLowerCase() === "tennis" &&
        bookableCourseIds.has(c.id)
    )
    .map((c) => ({ ...c, sportName: c.sportName ?? "" }));

  const visibleCategories = allFetchedCategories.filter((c) => c.isPubliclyVisible);

  return {
    tennisCourses: filteredTennisCourses,
    categories: visibleCategories,
    mappings: allFetchedMappings,
  };
}

function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsActivityLocation",
        "name": "Team Hippa Tennis Academy - Gilbert",
        "description":
          "World-class tennis programs for all ages and skill levels at Gilbert location.",
        "url": "https://teamhippa.com/tennis-gilbert  ",
        "telephone": "+1-602-341-3361",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Gilbert Regional Park",
          "addressLocality": "Gilbert",
          "addressRegion": "AZ",
          "postalCode": "85296",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "33.3528",
          "longitude": "-111.7890"
        },
        "openingHours": "Mo-Fr 06:00-22:00, Sa-Su 07:00-20:00",
        "offers": {
          "@type": "Offer",
          "description": "Tennis lessons and training programs"
        },
        "sport": "Tennis"
      },
      {
        "@type": "SportsActivityLocation",
        "name": "Team Hippa Tennis Academy - Phoenix",
        "description":
          "World-class tennis programs for all ages and skill levels at Phoenix location.",
        "url": "https://teamhippa.com/tennis-phoenix",
        "telephone": "+1-602-341-3361",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Rose Mofford Sports Complex 9833 N 25th Ave",
          "addressLocality": "Phoenix",
          "addressRegion": "AZ",
          "postalCode": "85021",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "33.58",
          "longitude": "-112.07"
        },
        "openingHours": "Mo-Fr 06:00-22:00, Sa-Su 07:00-20:00",
        "offers": {
          "@type": "Offer",
          "description": "Tennis lessons and training programs"
        },
        "sport": "Tennis"
      }
    ],
  };
}

export default async function TennisLandingPage() {
  const { tennisCourses, categories, mappings } = await fetchTennisData();
  const structuredData = generateStructuredData();

  return (
    <>
      <Meta
        title="Tennis Academy | World-Class Programs in Gilbert & Phoenix"
        description="Top tennis coaching and training programs for all ages and skill levels at our Gilbert and Phoenix locations."
        keywords="tennis gilbert, tennis phoenix, tennis coaching, tennis lessons, tennis programs, team hippa tennis"
        image="https://teamhippa.com/images/tennis.png"
        url="https://teamhippa.com/sports/tennis"
        canonical="https://teamhippa.com/sports/tennis"
        ogType="website"
        twitterCard="summary_large_image"
      />

      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <TennisPageClient
        tennisCourses={tennisCourses}
        categories={categories}
        mappings={mappings}
       
      />
    </>
  );
}
