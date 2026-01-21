'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import WinterCampShortDetails from '../../../components/WinterCampShortDetails/WinterCampShortDetails';
import CourseCard from '../../CourseCard/CourseCard';
import GoogleReviewsWidget from "@/app/components/GoogleReviewsWidget/GoogleReviewsWidget";
import Inquiry from '@/app/components/Inquiry-form';

// --- Interfaces ---
interface Course { id: number; slug: string; name: string; sportName: string; sportId: number; shortDescription: string; basePriceInfo: string; description: string; imagePaths: string[]; isActive: boolean; duration: string; }
interface Category { categoryId: number; categoryName: string; isPubliclyVisible: boolean; displayOrder: number; }
interface CourseCategoryMapping { courseId: number; categoryId: number; }

interface GilbertAdultClientProps {
  initialCourses: Course[];
  initialCategories: Category[];
  initialMappings: CourseCategoryMapping[];
}

export default function GilbertAdultClient({
  initialCourses,
  initialCategories,
  initialMappings,
}: GilbertAdultClientProps) {
  
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
      return allGroupedCourses.filter(([categoryName]) => categoryName === selectedCategoryName);
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
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Welcome to the team! Check your email for your 15% discount code.");
    router.push('/book-now');
  };*/}

  return (
    <>
      {/* --- Hero Section --- */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20 dark:from-green-700 dark:to-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Adult Tennis Programs in Gilbert
          </h2>
          <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto text-green-100">
            Whether you are looking to learn the basics, get a high-cardio workout, or refine your match strategy, we have a court waiting for you at <span className="font-semibold text-white">Gilbert Regional Park</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all dark:bg-gray-100 dark:text-green-800 dark:hover:bg-white"
            >
              View Programs
            </button>
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-800 border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 text-lg font-semibold rounded-lg transition-all dark:bg-green-900 dark:border-green-300 dark:hover:bg-white dark:hover:text-green-800"
            >
              Get Off First Class
            </button>
          </div>
          
          {/* Family Tennis CTA */}
          <div className="mt-8 pt-6 border-t border-green-500 border-opacity-30">
            <p className="text-green-200 mb-3">Looking for junior tennis programs?</p>
            <a
              href="https://teamhippa.com/phoenix-junior-tennis"
              className="inline-flex items-center gap-2 bg-green-500 bg-opacity-20 text-white px-6 py-2 rounded-lg hover:bg-opacity-30 transition-all border border-green-400 border-opacity-30"
            >
              <span>Explore Junior Programs in Phoenix</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <WinterCampShortDetails />

      {/* --- Benefits Section --- */}
      <section className="bg-white py-20 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              Why Choose Team Hippa Gilbert?
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto dark:text-gray-300">
              Experience the difference with Arizona leading adult tennis academy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "USTA Certified Coaches",
                description: "Learn from experienced, certified professionals focused on adult development",
                icon: "🎾"
              },
              {
                title: "All Skill Levels Welcome",
                description: "From first-time players to competitive tournament competitors",
                icon: "📈"
              },
              {
                title: "Premiere Gilbert Location",
                description: "Beautiful lighted courts at Gilbert Regional Park",
                icon: "🏟️"
              },
              {
                title: "Flexible Scheduling",
                description: "Morning, evening, and weekend classes to fit your busy lifestyle",
                icon: "🕒"
              },
              {
                title: "Social & Competitive Play",
                description: "Mix of technical training, match play, and social events",
                icon: "👥"
              },
              {
                title: "Modern Teaching Methods",
                description: "Game-based approach that makes learning fun and effective",
                icon: "💡"
              },
              {
                title: "Equipment Guidance",
                description: "Expert advice on racquets, strings, and gear for adult players",
                icon: "🎯"
              },
              {
                title: "Community Atmosphere",
                description: "Join a supportive network of tennis enthusiasts in Gilbert",
                icon: "🤝"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-800">
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Programs Section --- */}
      <section id="programs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50 dark:bg-gray-800">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
            Adult Tennis Programs in Gilbert
          </h2>
          <p className="text-lg text-gray-700 mx-auto max-w-3xl dark:text-gray-300">
            Comprehensive tennis instruction for every level, from beginner basics to advanced competition. 
            All programs held at <span className="font-semibold dark:text-white">Gilbert Regional Park</span>.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300 ${
              selectedCategoryId === null 
                ? 'bg-green-600 text-white shadow-lg transform scale-105 dark:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
            }`}
          >
            All Adult Programs
          </button>
          {initialCategories.map((cat) => (
            <button
              key={cat.categoryId}
              onClick={() => setSelectedCategoryId(cat.categoryId)}
              className={`px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300 ${
                selectedCategoryId === cat.categoryId 
                  ? 'bg-green-600 text-white shadow-lg transform scale-105 dark:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="space-y-16">
          {groupedCourses.length > 0 ? (
            groupedCourses.map(([categoryName, { courses: courseList }]) => (
              <section key={categoryName} className="bg-white rounded-xl shadow-lg p-8 dark:bg-gray-900 dark:shadow-gray-900">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4 dark:text-white dark:border-gray-700">
                  {categoryName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div className="text-center py-16 bg-white rounded-lg shadow dark:bg-gray-900 dark:shadow-gray-900">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">New Sessions Starting Soon</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">We are updating our adult program schedules. Contact us for current availability!</p>
              <button
                onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors dark:bg-green-700 dark:hover:bg-green-600"
              >
                Get Program Updates
              </button>
            </div>
          )}
        </div>
      </section>

      {/* --- Skill Level Guide --- */}
      <section className="bg-white py-20 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              Find Your Perfect Skill Level
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Not sure which program is right for you? Use our guide to find your fit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                level: "Beginner",
                description: "New to tennis or returning after a long break",
                skills: ["Learning basic strokes", "Introduction to scoring", "Court positioning"],
                recommended: "Beginner Clinics"
              },
              {
                level: "Intermediate",
                description: "Can rally consistently and play points",
                skills: ["Improving consistency", "Developing strategy", "Match play"],
                recommended: "Intermediate Drills"
              },
              {
                level: "Advanced",
                description: "Competitive player with tournament experience",
                skills: ["Advanced tactics", "Mental game", "Performance training"],
                recommended: "Advanced Sessions"
              },
              {
                level: "Cardio Tennis",
                description: "Fitness-focused players of all levels",
                skills: ["High-energy drills", "Cardio workout", "Social atmosphere"],
                recommended: "Cardio Tennis"
              }
            ].map((level, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-gray-800">
                <div className="text-center mb-4">
                  <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mb-2 dark:bg-green-900 dark:text-green-200">
                    {level.level}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3 dark:text-white">{level.level}</h3>
                <p className="text-gray-700 text-center mb-4 dark:text-gray-300">{level.description}</p>
                <ul className="space-y-2 mb-4">
                  {level.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="flex items-center text-gray-700 text-sm dark:text-gray-300">
                      <svg className="w-4 h-4 text-green-500 mr-2 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      {skill}
                    </li>
                  ))}
                </ul>
                <div className="text-center mt-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">{level.recommended}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Family Tennis CTA Section --- */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 dark:from-blue-700 dark:to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Tennis for the Whole Family
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            While you are improving your game, your kids can develop their skills too! 
            Check out our popular junior tennis programs in Phoenix.
          </p>
          <a
            href="https://teamhippa.com/phoenix-junior-tennis"
            className="inline-flex items-center gap-3 bg-white text-blue-700 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl dark:bg-blue-100 dark:text-blue-800 dark:hover:bg-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Explore Junior Tennis Programs
          </a>
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

      {/* --- CTA Section --- */}
      <section className="bg-green-700 text-white py-16 dark:bg-green-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Elevate Your Tennis Game?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-green-100">
            Join hundreds of Gilbert adults who have discovered the joy of tennis with Team Hippa. 
            Limited spots available in our upcoming sessions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all dark:bg-gray-100 dark:text-green-800 dark:hover:bg-white"
            >
              Claim Discount
            </button>
            <button
              onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 text-lg font-semibold rounded-lg transition-all dark:border-green-300 dark:hover:bg-white dark:hover:text-green-800"
            >
              View All Programs
            </button>
          </div>
          <p className="mt-4 text-green-200 dark:text-green-300">
            Have questions? Call us at +1 602-341-3361
          </p>
          
          {/* Family Tennis Link */}
          <div className="mt-8 pt-6 border-t border-green-500 border-opacity-30">
            <p className="text-green-200 mb-3">Interested in youth tennis?</p>
            <a
              href="https://teamhippa.com/phoenix-junior-tennis"
              className="inline-flex items-center gap-2 text-green-200 hover:text-white transition-colors"
            >
              <span>Explore our Junior Tennis Programs in Phoenix</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* --- Inquiry & Location Section --- */}
      <section id="inquiry-form" className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Offer Form */}
            <div className="bg-green-50 p-8 rounded-lg shadow-md border border-green-100 dark:bg-green-900 dark:border-green-800">
              <h2 className="text-3xl font-bold text-black mb-3 dark:text-white">Get Discount Your First Clinic!</h2>
              <p className="text-gray-700 mb-6 dark:text-gray-300">
                Join the Team Hippa community today. Enter your email below and we&aposll send you a discount code for your first adult group session.
              </p>
              
              <Inquiry />
            </div>

            {/* Gilbert Map */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-black mb-4 dark:text-white">Gilbert Regional Park</h2>
              <div className="mb-4">
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">141 E Guadalupe Rd, </p>
                <p className="text-lg text-gray-600 dark:text-gray-400">Gilbert, AZ 85234, United States</p>
              </div>
              <p className="text-lg text-gray-700 mb-6 dark:text-gray-300">
                Our pristine hard courts are located within the beautiful Gilbert Regional Park, 
                offering lighted courts for evening play and easy access from across the East Valley.
              </p>
              
              <div className="overflow-hidden rounded-lg shadow-xl dark:shadow-gray-900">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.7544773498735!2d-111.76679708696534!3d33.364119980101165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872ba92dac3c8385%3A0x67a5fd75b68390bb!2sFreestone%20Recreation%20Center!5e0!3m2!1sen!2sin!4v1762349687500!5m2!1sen!2sin"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Team Hippa Gilbert Tennis Location at Gilbert Regional Park"
                  className="dark:filter dark:brightness-90 dark:contrast-110"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}