import React from "react";
import PickleballPageClient from "@/app/components/LandingPage/PickleballPageClient/PickleballPageClient";
import Meta from "@/app/components/Meta";
import {
  ABOUT_FAQS,
  CHOICE_ITEMS,
  INSTRUCTION_ITEMS,
  LIST_ITEMS,
  OFFER_ITEMS,
} from "@/untils/constant";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface Course {
  id: number;
  name: string;
  sportName: string;
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

async function fetchPickleballData() {
  const [coursesRes, categoriesRes, mappingsRes] = await Promise.all([
    fetch(`${apiUrl}/api/public_api/courses`, { cache: "no-store" }),
    fetch(`${apiUrl}/api/public/categories`, { cache: "no-store" }),
    fetch(`${apiUrl}/api/public/course-category-mappings`, { cache: "no-store" }),
  ]);

  const allFetchedCourses: Course[] = await coursesRes.json();
  const allFetchedCategories: Category[] = await categoriesRes.json();
  const allFetchedMappings: CourseCategoryMapping[] = await mappingsRes.json();

  const bookableCourseIds = new Set(allFetchedMappings.map((m) => m.courseId));

  const filteredPickleballCourses = allFetchedCourses
    .filter(
      (c) =>
        c.isActive &&
        typeof c.sportName === "string" &&
        c.sportName.toLowerCase() === "pickleball" &&
        bookableCourseIds.has(c.id)
    )
    .map((c) => ({
      ...c,
      sportName: c.sportName ?? "",
    }));

  const visibleCategories = allFetchedCategories.filter(
    (c) => c.isPubliclyVisible
  );

  return {
    pickleballCourses: filteredPickleballCourses,
    categories: visibleCategories,
    mappings: allFetchedMappings,
  };
}

function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    'name': 'Team Hippa Pickleball Academy',
    'description':
      'Professional pickleball academy in Gilbert, AZ offering lessons, training, and clinics for all skill levels and ages.',
    'url': 'https://teamhippa.com/sports/pickleball',
    'telephone': '+1-602-341-3361',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Rose Mofford Sports Complex 9833 N 25th Ave Phoenix, AZ 85021',
      'addressLocality': 'Phoenix',
      'addressRegion': 'AZ',
      'postalCode': '852XX',
      'addressCountry': 'US',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '33.3528',
      'longitude': '-111.7890',
    },
    'openingHours': 'Mo-Fr 06:00-22:00, Sa-Su 07:00-20:00',
    'offers': {
      '@type': 'Offer',
      'description': 'Pickleball Lessons and Training Programs',
    },
    'sport': 'Pickleball',
    
  };
  
}

export default async function PickleballLandingPage() {
  const { pickleballCourses, categories, mappings } = await fetchPickleballData();
  const structuredData = generateStructuredData();

  return (
    <>
      <Meta
        title="Pickleball Academy Gilbert AZ | Lessons & Training | Team Hippa"
        description="Master pickleball in Gilbert, AZ with Team Hippa! We offer lessons for all levels, youth programs, and top-tier training."
        keywords="pickleball gilbert, pickleball lessons, pickleball training, pickleball academy, team hippa pickleball, pickleball coaching, pickleball clinics, youth pickleball, adult pickleball"
        image="https://teamhippa.com/images/pickleball.png"
        url="https://teamhippa.com/sports/pickleball"
        canonical="https://teamhippa.com/sports/pickleball"
        ogType="website"
        twitterCard="summary_large_image"
      />

      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <PickleballPageClient
        pickleballCourses={pickleballCourses}
        categories={categories}
        mappings={mappings}
        faqData={ABOUT_FAQS}
        choiceItems={CHOICE_ITEMS}
        instructionItems={INSTRUCTION_ITEMS}
        listItems={LIST_ITEMS}
        offerItems={OFFER_ITEMS}
      />
    </>
  );
}
