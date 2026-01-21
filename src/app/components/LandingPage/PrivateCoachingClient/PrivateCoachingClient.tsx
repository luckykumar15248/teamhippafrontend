'use client';

import React, { useState, useMemo } from 'react';
//import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../../Button';
import CourseCard from '../../CourseCard/CourseCard';
//import { SparkleIcon } from "../../Icons";
import GoogleReviewsWidget from "@/app/components/GoogleReviewsWidget/GoogleReviewsWidget";
import Inquiry from '@/app/components/Inquiry-form';

// --- Interfaces ---
interface Course { id: number; slug: string; name: string; sportName: string; sportId: number; shortDescription: string; basePriceInfo: string; description: string; imagePaths: string[]; isActive: boolean; duration: string; }
interface Category { categoryId: number; categoryName: string; isPubliclyVisible: boolean; displayOrder: number; }
interface CourseCategoryMapping { courseId: number; categoryId: number; }

interface PrivateCoachingClientProps {
  initialCourses: Course[];
  initialCategories: Category[];
  initialMappings: CourseCategoryMapping[];
}

export default function PrivateCoachingClient({
  initialCourses,
  initialCategories,
  initialMappings,
}: PrivateCoachingClientProps) {
  
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

    // Fallback logic if specific "Private" categories aren't set up
    if (allGroupedCourses.length === 0 && initialCourses.length > 0) {
        // Filter for courses with "Private" in the name
        const privateCourses = initialCourses.filter(c => c.name.toLowerCase().includes('private') || c.name.toLowerCase().includes('individual'));
        if(privateCourses.length > 0) {
            allGroupedCourses = [['Private Lessons', { courses: privateCourses, order: 0 }]];
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
      
      {/* --- Section 1: Intro / Value Prop --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold uppercase text-black dark:text-white mb-4">
            Accelerate Your Game
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mx-auto max-w-4xl">
            Group clinics are great for reps, but private coaching is where technique is mastered. Get 100% of the coachs attention to fix mechanics, develop strategy, and reach your personal goals faster.
          </p>
        </div>

        {/* --- Why Private? (3 Cards) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Technical Correction</h3>
               <p className="text-gray-600 dark:text-gray-400">Fix that hitch in your serve or smooth out your backhand. We use video analysis to show you exactly what to change.</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Custom Game Plans</h3>
               <p className="text-gray-600 dark:text-gray-400">Preparing for a tournament? We will build a tactical roadmap based on your strengths and your opponents weaknesses.</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Flexible Scheduling</h3>
               <p className="text-gray-600 dark:text-gray-400">Book lessons that fit your busy life. Mornings, evenings, or weekends—our team is available when you are.</p>
           </div>
        </div>

        {/* --- Section 2: Course Listings (Private Options) --- */}
        {initialCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 text-sm font-semibold !rounded-full shadow-sm transition-colors ${
                selectedCategoryId === null 
                  ? "bg-black text-white dark:bg-green-600" 
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
              }`}
            >
              All Private Options
            </Button>
            {initialCategories.map((cat) => (
              <Button
                key={cat.categoryId}
                onClick={() => setSelectedCategoryId(cat.categoryId)}
                className={`px-4 py-2 text-sm font-semibold !rounded-full shadow-sm transition-colors ${
                  selectedCategoryId === cat.categoryId 
                    ? "bg-black text-white dark:bg-green-600" 
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
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b-2 border-black dark:border-white pb-2 inline-block">
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
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Contact to Book</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Private lessons are often booked directly with coaches based on availability. Please browse our Packages page for savings or contact us.
              </p>
              <div className="mt-6">
                <Link href="/packages">
                    <Button className="bg-green-600 text-white px-6 py-2 rounded-lg">View Lesson Packages</Button>
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
                    From elite competition to social fun, we have a program for every player.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                
                {/* 1. Junior Tennis */}
                <Link href="/phoenix-junior-tennis" className="block bg-white dark:bg-gray-900 p-5 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Junior Tennis</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phoenix & Gilbert</p>
                    <div className="mt-3 text-sm text-green-600 dark:text-green-500 font-semibold">View Programs →</div>
                </Link>

                {/* 2. Adult Clinics */}
                <Link href="/gilbert-adult-tennis-clinics" className="block bg-white dark:bg-gray-900 p-5 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Adult Clinics</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Social & Cardio</p>
                    <div className="mt-3 text-sm text-green-600 dark:text-green-500 font-semibold">View Programs →</div>
                </Link>

                {/* 3. High Performance */}
                <Link href="/arizona-high-performance-tennis-academy" className="block bg-white dark:bg-gray-900 p-5 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">High Performance</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Elite Academy</p>
                    <div className="mt-3 text-sm text-orange-600 dark:text-orange-500 font-semibold">Apply Now →</div>
                </Link>

                {/* 4. Pickleball */}
                <Link href="/sports/pickleball" className="block bg-white dark:bg-gray-900 p-5 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Pickleball</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Lessons & Play</p>
                    <div className="mt-3 text-sm text-green-600 dark:text-green-500 font-semibold">Start Playing →</div>
                </Link>

                {/* 5. Packages (Highlighted) */}
                <Link href="/packages" className="block bg-green-50 dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition-all border border-green-200 dark:border-green-800 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-md font-bold uppercase">Save $$</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Lesson Packages</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bulk Savings</p>
                    <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-semibold">Buy Now →</div>
                </Link>

            </div>
        </div>
      </section>

       {/* --- Google Reviews Section --- */}
      <section className="bg-gray-50 py-20 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              What Gilbert Players Say
            </h2>
            <p className="text-lg text-gray-700 mb-8 dark:text-gray-300">
              Read genuine reviews from players on Google
            </p>
          </div>
          
          {/* EmbedReviews Widget */}
          <div className="max-w-6xl mx-auto">
            <div 
              className="embedsocial-reviews" 
              data-ref="1c1b7f2c374a3a7e8144775a7c2b2273"
              data-width="100%"
            > 
              <GoogleReviewsWidget />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <a
              href="https://www.google.com/maps/place/Team+Hippa+-+Tennis+Academy/@33.0264402,-111.6789136,15z/data=!4m8!3m7!1s0xda8ab47fa7a90cd:0xf4d832507b1651bb!8m2!3d33.0264402!4d-111.6789136!9m1!1b1!16s%2Fg%2F11wwm9klzg?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors shadow-lg dark:bg-green-700 dark:hover:bg-green-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-8 8z"/>
              </svg>
              Read All Reviews on Google
            </a>
            <a
              href="https://www.google.com/maps/place/Team+Hippa+-+Tennis+Academy/@33.0264402,-111.6789136,15z/data=!4m8!3m7!1s0xda8ab47fa7a90cd:0xf4d832507b1651bb!8m2!3d33.0264402!4d-111.6789136!9m1!1b1!16s%2Fg%2F11wwm9klzg?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg hover:bg-green-50 transition-colors dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900"
            >
              Write a Review
            </a>
          </div>
        </div>
      </section>

        {/* --- Section 4: Assessment Application --- */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-800  p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-800 dark:border-gray-700">
              <h2 className="text-3xl font-bold mb-4 text-center">Get Discount Your First Private Lession!</h2>
              <p className="dark:text-gray-400 mb-8 text-center">
                 Join the Team Hippa community today. Enter your email below and we send you a discount code for your first adult group session.
              </p>
              
               <Inquiry />
            </div>
        </div>
      </section>

    </div>
  );
}