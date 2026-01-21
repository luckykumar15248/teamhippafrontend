'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // <--- Added Link import
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../../Button';
import CourseCard from '../../CourseCard/CourseCard';
import { SparkleIcon } from "../../Icons"; // Assuming you have this
import Inquiry from '@/app/components/Inquiry-form';

// --- Interfaces ---
interface Course { id: number; slug: string; name: string; sportName: string; sportId: number; shortDescription: string; basePriceInfo: string; description: string; imagePaths: string[]; isActive: boolean; duration: string; }
interface Category { categoryId: number; categoryName: string; isPubliclyVisible: boolean; displayOrder: number; }
interface CourseCategoryMapping { courseId: number; categoryId: number; }

interface HighPerformanceClientProps {
  initialCourses: Course[];
  initialCategories: Category[];
  initialMappings: CourseCategoryMapping[];
}

export default function HighPerformanceClient({
  initialCourses,
  initialCategories,
  initialMappings,
}: HighPerformanceClientProps) {
  
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // --- Dynamic Grouping Logic ---
  const groupedCourses = useMemo(() => {
    const courseMap = new Map(initialCourses.map((c) => [c.id, c]));
    const groups: { [categoryName: string]: { courses: Course[]; order: number } } = {};
    
    // 1. Try to group by category mappings
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

    // 2. FALLBACK: If no categories matched but we have courses, show all under one generic header
    // This fixes the "Admission by Evaluation Only" issue if categories aren't set up perfectly yet.
    if (allGroupedCourses.length === 0 && initialCourses.length > 0) {
      allGroupedCourses = [
        ['Academy Programs', { courses: initialCourses, order: 0 }]
      ];
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
{/*
  const handleAssessmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Application received. Coach will contact you within 24 hours.");
    // Submit logic here
  };*/}

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* --- Section 1: Intro / Philosophy --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold uppercase text-black dark:text-white mb-4">
            Forging Arizona Future Champions
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mx-auto max-w-4xl">
            The Team Hippa High-Performance Academy is not for everyone. It is for the dedicated athlete committed to excellence. Our proven methodology prepares players for state, national, and collegiate competition through a holistic training regimen.
          </p>
        </div>

        {/* --- The 4 Pillars --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-gray-900 dark:bg-black text-white p-6 rounded-lg shadow-lg text-center hover:-translate-y-1 transition-transform border border-gray-800 dark:border-gray-700">
            <div className="text-4xl mb-3">🎾</div>
            <h3 className="text-xl font-bold mb-2">Technical</h3>
            <p className="text-gray-400 text-sm">Flawless biomechanics and weapon development.</p>
          </div>
          <div className="bg-gray-900 dark:bg-black text-white p-6 rounded-lg shadow-lg text-center hover:-translate-y-1 transition-transform border border-gray-800 dark:border-gray-700">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="text-xl font-bold mb-2">Tactical</h3>
            <p className="text-gray-400 text-sm">Match IQ, pattern play, and situational awareness.</p>
          </div>
          <div className="bg-gray-900 dark:bg-black text-white p-6 rounded-lg shadow-lg text-center hover:-translate-y-1 transition-transform border border-gray-800 dark:border-gray-700">
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-xl font-bold mb-2">Physical</h3>
            <p className="text-gray-400 text-sm">Strength, agility, and injury prevention conditioning.</p>
          </div>
          <div className="bg-gray-900 dark:bg-black text-white p-6 rounded-lg shadow-lg text-center hover:-translate-y-1 transition-transform border border-gray-800 dark:border-gray-700">
            <div className="text-4xl mb-3">🧘</div>
            <h3 className="text-xl font-bold mb-2">Mental</h3>
            <p className="text-gray-400 text-sm">Composure, resilience, and winning routines.</p>
          </div>
        </div>

        {/* --- Section 2: Academy Courses --- */}
        {/* Filters */}
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
              All Academy Groups
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

        {/* Grid */}
        <div className="space-y-12">
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
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Admission by Evaluation Only</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Our Academy groups are not always listed for public booking. Please submit an assessment request below to inquire about current openings.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* --- Section 3: The College Pathway --- */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-4xl font-bold uppercase text-black dark:text-white mb-6">The College Pathway</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                        For many of our athletes, the goal is collegiate tennis. We guide you through the complex recruiting process.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <SparkleIcon className="text-green-600 dark:text-green-400 w-6 h-6" />
                            <span className="text-gray-800 dark:text-gray-200 font-medium">UTR & Ranking Strategy</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <SparkleIcon className="text-green-600 dark:text-green-400 w-6 h-6" />
                            <span className="text-gray-800 dark:text-gray-200 font-medium">Recruiting Video Analysis</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <SparkleIcon className="text-green-600 dark:text-green-400 w-6 h-6" />
                            <span className="text-gray-800 dark:text-gray-200 font-medium">College Showcase Tournaments</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <SparkleIcon className="text-green-600 dark:text-green-400 w-6 h-6" />
                            <span className="text-gray-800 dark:text-gray-200 font-medium">Coach Communication Mentorship</span>
                        </li>
                    </ul>
                </div>
                <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden shadow-2xl">
                     <Image 
                        src="" 
                        alt="College Tennis Pathway"
                        fill
                        className="object-cover"
                     />
                </div>
            </div>
        </div>
      </section>

      {/* --- Section 4: Assessment Application --- */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 dark:bg-gray-800  p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-800 dark:border-gray-700">
              <h2 className="text-3xl font-bold mb-4 text-center">Apply for an Evaluation</h2>
              <p className="dark:text-gray-400 mb-8 text-center">
                  Academy placement requires a 30-minute on-court assessment. Fill out the form below to schedule your evaluation with our Head of High Performance.
              </p>
              
               <Inquiry />
            </div>
        </div>
      </section>

      {/* --- Section 5: Other Programs --- */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors duration-300 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-6">Not Quite Ready for High Performance?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Build your foundation first. We offer world-class developmental programs for juniors and adults to help you reach the next level.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/phoenix-junior-tennis" className="group block bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 w-full sm:w-96">
              <h3 className="text-xl font-bold text-green-600 dark:text-green-500 mb-2 group-hover:underline">Junior Developmental Pathway</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start with our fun, game-based clinics for ages 4-18 in Phoenix. Perfect for beginners and intermediates.
              </p>
            </Link>
            <Link href="/gilbert-adult-tennis-clinics" className="group block bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 w-full sm:w-96">
              <h3 className="text-xl font-bold text-green-600 dark:text-green-500 mb-2 group-hover:underline">Adult Clinics & Leagues</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join our vibrant adult community in Gilbert for social play, cardio tennis, and skill-building clinics.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}