'use client';

import React, { useState, useMemo } from 'react';
//import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../../Button';
import CourseCard from '../../CourseCard/CourseCard';
import { SparkleIcon } from "../../Icons";

// --- Interfaces ---
interface Course { id: number; slug: string; name: string; sportName: string; sportId: number; shortDescription: string; basePriceInfo: string; description: string; imagePaths: string[]; isActive: boolean; duration: string; }
interface Category { categoryId: number; categoryName: string; isPubliclyVisible: boolean; displayOrder: number; }
interface CourseCategoryMapping { courseId: number; categoryId: number; }

interface PickleballClientProps {
  initialCourses: Course[];
  initialCategories: Category[];
  initialMappings: CourseCategoryMapping[];
}

export default function PickleballClient({
  initialCourses,
  initialCategories,
  initialMappings,
}: PickleballClientProps) {
  
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

    let allGroupedCourses = Object.entries(groups).sort(
      ([, groupA], [, groupB]) => groupA.order - groupB.order
    );

    // Fallback if filtering was strict but no specific pickleball categories exist yet
    // This ensures we don't show an empty page if you have pickleball courses tagged differently
    if (allGroupedCourses.length === 0) {
       // Filter raw courses for sportName 'Pickleball' just in case
       const pickleballCourses = initialCourses.filter(c => c.sportName.toLowerCase().includes('pickleball'));
       if(pickleballCourses.length > 0){
           allGroupedCourses = [['Pickleball Programs', { courses: pickleballCourses, order: 0 }]];
       }
    }

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
      
      {/* --- Section 1: Intro / Why Pickleball --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold uppercase text-black dark:text-white mb-4">
            Arizonas Fastest Growing Sport
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mx-auto max-w-4xl">
            Pickleball combines the best elements of tennis, badminton, and ping-pong into a fun, social game that is easy to learn but hard to put down. Join the Team Hippa community in Phoenix and Gilbert!
          </p>
        </div>

        {/* --- Feature Grid (Why Play) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
               <div className="text-5xl mb-4">🤝</div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Social & Fun</h3>
               <p className="text-gray-600 dark:text-gray-400">Smaller courts mean easier conversation. Its the perfect way to meet new people in the Valley.</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
               <div className="text-5xl mb-4">🚀</div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Easy to Learn</h3>
               <p className="text-gray-600 dark:text-gray-400">Most beginners can play a full game with scoring after just one 60-minute intro clinic.</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
               <div className="text-5xl mb-4">❤️</div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Active Living</h3>
               <p className="text-gray-600 dark:text-gray-400">A great low-impact cardio workout that improves balance, agility, and reflexes without the strain.</p>
           </div>
        </div>

        {/* --- Section 2: Course Listings --- */}
        {/* Filters */}
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
              All Pickleball Programs
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

        {/* Grid */}
        <div className="space-y-12">
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
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No Upcoming Clinics</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                We are currently updating our Pickleball schedule. Please check our Packages page for bulk class options or contact us for private lessons.
              </p>
              <div className="mt-6">
                <Link href="/packages">
                    <Button className="bg-green-600 text-white px-6 py-2 rounded-lg">View Packages</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- Section 3: Interlinking (Strategic Cross-Selling) --- */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                    Explore Our Tennis Universe
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Team Hippa is a complete racquet sports academy. Looking for something else? Check out our dedicated tennis programs.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Link 1: Phoenix Junior */}
                <Link href="/phoenix-junior-tennis" className="group block bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                        <SparkleIcon className="text-green-600 w-5 h-5" />
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">Junior Tennis</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fun, developmental programs for kids ages 4-18 in Phoenix.</p>
                </Link>

                {/* Link 2: Gilbert Adult */}
                <Link href="/gilbert-adult-tennis-clinics" className="group block bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                        <SparkleIcon className="text-green-600 w-5 h-5" />
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">Adult Clinics</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Drills, cardio tennis, and social leagues in Gilbert.</p>
                </Link>

                {/* Link 3: High Performance */}
                <Link href="/arizona-high-performance-tennis-academy" className="group block bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                        <SparkleIcon className="text-orange-500 w-5 h-5" />
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">Elite Academy</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Advanced tournament training for competitive juniors.</p>
                </Link>

                 {/* Link 4: Packages */}
                 <Link href="/packages" className="group block bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">SAVE</div>
                    <div className="flex items-center gap-3 mb-3">
                        <SparkleIcon className="text-blue-500 w-5 h-5" />
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">Class Packages</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Save money on Pickleball and Tennis lessons with our bulk packs.</p>
                </Link>
            </div>
        </div>
      </section>

    </div>
  );
}