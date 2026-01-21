'use client';

import React, { useState, useMemo } from 'react';
//import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../../Button';
import CourseCard from '../../CourseCard/CourseCard';
//import { SparkleIcon } from "../../Icons";

// --- Interfaces ---
interface Course { id: number; slug: string; name: string; sportName: string; sportId: number; shortDescription: string; basePriceInfo: string; description: string; imagePaths: string[]; isActive: boolean; duration: string; }
interface Category { categoryId: number; categoryName: string; isPubliclyVisible: boolean; displayOrder: number; }
interface CourseCategoryMapping { courseId: number; categoryId: number; }

interface ScottsdaleClientProps {
  initialCourses: Course[];
  initialCategories: Category[];
  initialMappings: CourseCategoryMapping[];
}

export default function ScottsdaleClient({
  initialCourses,
  initialCategories,
  initialMappings,
}: ScottsdaleClientProps) {
  
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // --- Dynamic Grouping Logic ---
  const groupedCourses = useMemo(() => {
    const courseMap = new Map(initialCourses.map((c) => [c.id, c]));
    const groups: { [categoryName: string]: { courses: Course[]; order: number } } = {};
    
    initialMappings.forEach(mapping => {
      const category = initialCategories.find(c => c.categoryId === mapping.categoryId);
      const course = courseMap.get(mapping.courseId);
      
      if (category && course) {
        if (!groups[category.categoryName]) {
          groups[category.categoryName] = { courses: [], order: category.displayOrder };
        }
        if (!groups[category.categoryName].courses.some((c) => c.id === course.id)) {
          groups[category.categoryName].courses.push(course);
        }
      }
    });

    const allGroupedCourses = Object.entries(groups).sort(
      ([, groupA], [, groupB]) => groupA.order - groupB.order
    );

    if (selectedCategoryId) {
      const selectedCategoryName = initialCategories.find(c => c.categoryId === selectedCategoryId)?.categoryName;
      if (selectedCategoryName) {
        return allGroupedCourses.filter(([categoryName]) => categoryName === selectedCategoryName);
      }
    }
    return allGroupedCourses;
  }, [initialCourses, initialCategories, initialMappings, selectedCategoryId]);

  // --- Handlers ---
  const handleBookNow = (courseId: number) => {
    toast.info("Redirecting to booking...");
    router.push(`/booking/course/${courseId}`);
  };
  const handleViewDetails = (course: Course) => {
    router.push(`/book-now/courses/${course.slug}`);
  };

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      
      {/* --- Section 1: Intro / Why Drive? --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold uppercase text-black dark:text-white mb-4">
            Scottsdales Best Kept Tennis Secret
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mx-auto max-w-4xl">
            You dont need a country club membership to get world-class coaching. Located just minutes from Scottsdale, Team Hippa offers elite instruction, pristine courts, and a welcoming community without the high fees.
          </p>
        </div>

        {/* --- Feature Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
               <div className="text-4xl mb-3">🏆</div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Elite Coaching</h3>
               <p className="text-gray-600 dark:text-gray-400">Our High-Performance staff includes former collegiate and pro-tour coaches.</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
               <div className="text-4xl mb-3">💲</div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Hidden Fees</h3>
               <p className="text-gray-600 dark:text-gray-400">Pay only for what you play. No initiation fees, no monthly minimums.</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
               <div className="text-4xl mb-3">🚗</div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Easy Access</h3>
               <p className="text-gray-600 dark:text-gray-400">Conveniently located at Rose Mofford Sports Complex, a quick drive from North Scottsdale.</p>
           </div>
        </div>

        {/* --- Section 2: Course Listings --- */}
        {initialCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 text-sm font-semibold !rounded-full shadow-sm transition-colors ${
                selectedCategoryId === null 
                  ? "bg-green-600 text-white dark:bg-green-500" 
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
              }`}
            >
              All Programs
            </Button>
            {initialCategories.map((cat) => (
              <Button
                key={cat.categoryId}
                onClick={() => setSelectedCategoryId(cat.categoryId)}
                className={`px-4 py-2 text-sm font-semibold !rounded-full shadow-sm transition-colors ${
                  selectedCategoryId === cat.categoryId 
                    ? "bg-green-600 text-white dark:bg-green-500" 
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                }`}
              >
                {cat.categoryName}
              </Button>
            ))}
          </div>
        )}

        <div className="space-y-12 mb-16">
          {groupedCourses.length > 0 ? (
            groupedCourses.map(([categoryName, { courses: courseList }]) => (
              <section key={categoryName}>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b-2 border-green-500 pb-2 inline-block">
                  {categoryName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courseList.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onViewDetails={() => handleViewDetails(course)}
                      onBookNow={() => handleBookNow(course.id)}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">View All Programs</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                We have extensive programming available. Browse our main schedule to see all classes at our nearby Rose Mofford location.
              </p>
              <div className="mt-6">
                <Link href="/phoenix-junior-tennis">
                    <Button className="bg-green-600 text-white px-6 py-2 rounded-lg">View Phoenix Schedule</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- Section 3: Strategic Interlinking --- */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16 transition-colors duration-300 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                    Explore Team Hippa Programs
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    A comprehensive academy for every age and skill level.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                
                {/* 1. Junior Tennis */}
                <Link href="/phoenix-junior-tennis" className="block bg-white dark:bg-gray-900 p-4 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Junior Tennis</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Developmental (4-18)</p>
                    <div className="mt-2 text-xs text-green-600 dark:text-green-500 font-semibold uppercase">View →</div>
                </Link>

                {/* 2. Adult Clinics */}
                <Link href="/gilbert-adult-tennis-clinics" className="block bg-white dark:bg-gray-900 p-4 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Adult Clinics</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Social & Cardio</p>
                    <div className="mt-2 text-xs text-green-600 dark:text-green-500 font-semibold uppercase">View →</div>
                </Link>

                {/* 3. High Performance */}
                <Link href="/arizona-high-performance-tennis-academy" className="block bg-white dark:bg-gray-900 p-4 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">High Performance</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Elite Academy</p>
                    <div className="mt-2 text-xs text-orange-600 dark:text-orange-500 font-semibold uppercase">Apply →</div>
                </Link>

                {/* 4. Pickleball */}
                <Link href="/sports/pickleball" className="block bg-white dark:bg-gray-900 p-4 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Pickleball</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Lessons & Play</p>
                    <div className="mt-2 text-xs text-green-600 dark:text-green-500 font-semibold uppercase">Start →</div>
                </Link>

                {/* 5. Private Coaching (NEW) */}
                <Link href="/private-tennis-coaching-in-phoenix-and-gilbert" className="block bg-white dark:bg-gray-900 p-4 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Private Coaching</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1-on-1 Instruction</p>
                    <div className="mt-2 text-xs text-purple-600 dark:text-purple-500 font-semibold uppercase">Book →</div>
                </Link>

                {/* 6. Packages */}
                <Link href="/packages" className="block bg-green-50 dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition-all border border-green-200 dark:border-green-800 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-bl-md font-bold uppercase">Save</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Packages</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bulk Savings</p>
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">Buy →</div>
                </Link>

            </div>
        </div>
      </section>

    </div>
  );
}