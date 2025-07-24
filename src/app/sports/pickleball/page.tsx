"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import SportsHeroSection from "@/app/components/SportsHeroSection";
import TennisCourseCard from "@/app/components/TennisCourseCard";
import {
  ABOUT_FAQS,
  CHOICE_ITEMS,
  INSTRUCTION_ITEMS,
  LIST_ITEMS,
  OFFER_ITEMS,
} from "@/untils/constant";
import FAQ from "@/app/components/FAQ";

// --- Type Definitions ---
interface Course {
  id: number;
  name: string;
  sportName: string; // sportName must be a string
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

// --- Type for Book Now ---
type SelectableItem = {
  id: number;
  name: string;
  type: string;
};

// --- Main Page Component ---
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const PickleballLandingPage: React.FC = () => {
  const [pickleballCourses, setPickleballCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mappings, setMappings] = useState<CourseCategoryMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesRes, categoriesRes, mappingsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/public_api/courses`),
          axios.get(`${apiUrl}/api/public/categories`),
          axios.get(`${apiUrl}/api/public/course-category-mappings`),
        ]);

        const allFetchedCourses = coursesRes.data || [];
        const allFetchedCategories = categoriesRes.data || [];
        const allFetchedMappings = mappingsRes.data || [];

        const bookableCategory = allFetchedCategories.find(
          (cat: Category) => cat.categoryName === "Available for Booking"
        );
        if (!bookableCategory)
          console.warn("'Available for Booking' category not found.");

        const bookableCourseIds = new Set(
          allFetchedMappings
            .map((m: CourseCategoryMapping) => m.courseId)
        );

        // Ensure sportName is a string and filter out courses with null sportName
        const filteredPickleballCourses = allFetchedCourses
          .filter(
            (c: Course) =>
              c.isActive &&
              typeof c.sportName === "string" &&
              c.sportName.toLowerCase() === "pickleball" &&
              bookableCourseIds.has(c.id)
          )
          .map((c: Course) => ({
            ...c,
            sportName: c.sportName ?? "", // fallback to empty string if null
          }));

        setPickleballCourses(filteredPickleballCourses);
        setCategories(
          allFetchedCategories.filter((c: Category) => c.isPubliclyVisible)
        );
        setMappings(allFetchedMappings);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error(
          "Could not load our Pickleball programs. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedCourses = useMemo(() => {
    const courseMap = new Map(pickleballCourses.map((c) => [c.id, c]));
    const groups: {
      [categoryName: string]: { courses: Course[]; order: number };
    } = {};

    mappings.forEach((mapping) => {
      const category = categories.find(
        (c) => c.categoryId === mapping.categoryId
      );
      const course = courseMap.get(mapping.courseId);

      if (category && course) {
        if (!groups[category.categoryName]) {
          groups[category.categoryName] = {
            courses: [],
            order: category.displayOrder,
          };
        }
        if (
          !groups[category.categoryName].courses.some((c) => c.id === course.id)
        ) {
          groups[category.categoryName].courses.push(course);
        }
      }
    });

    return Object.entries(groups).sort(
      ([, groupA], [, groupB]) => groupA.order - groupB.order
    );
  }, [pickleballCourses, categories, mappings]);

  const handleNavigate = (courseId: number) => {
    router.push(`/course-categories/courses/${courseId}`);
  };

  const handleBookNow = (item: SelectableItem) => {
    console.log(`Navigating to book ${item.type} with ID ${item.id}`);
    toast.info(`Redirecting to book "${item.name}"...`);
    router.push(`/booking/course/${item.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Pickleball Programs"
        description="Join the fastest-growing sport! Our pickleball programs are perfect for all ages, focusing on fun, strategy, and social play."
      />

      <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="space-y-16 max-w-screen-2xl mx-auto">
          {groupedCourses.length > 0 ? (
            groupedCourses.map(([categoryName, { courses: courseList }]) => (
              <div key={categoryName}>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {categoryName}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courseList.map((course) => (
                    <TennisCourseCard
                      key={course.id}
                      course={course}
                      onNavigate={handleNavigate}
                      onBookNow={() =>
                        handleBookNow({ ...course, type: "course" })
                      }
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-700">
                No Pickleball Courses Currently Available
              </h3>
              <p className="mt-2 text-base sm:text-lg text-gray-600 font-normal">
                Please check back soon for new offerings!
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="bg-gray-100 text-gray-800 pt-4 sm:pt-8 md:pt-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="flex flex-col space-y-6">
            <p className="text-base text-[#b0db72] font-normal uppercase tracking-wide">
              Coaching
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              What is a Pickleball Academy?
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              {" "}
              Unlike casual classes or drop-in play, a{" "}
              <span className="font-bold">pickleball academy</span> offers
              structured, progressive instruction—similar to what you&apos;d
              find in tennis, soccer, or martial arts academies.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              {" "}
              We&apos;re not just teaching technique—we&apos;re building players
              from the ground up with skill pathways, competitive prep, and
              community-based development.
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4">
              Key Features:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-700">
              {LIST_ITEMS.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="w-full flex justify-center items-center p-4 bg-[#b0db72] rounded-lg h-full">
            <img
              src="/images/coaching.jpeg"
              alt="coaching"
              className="rounded-lg shadow-lg w-full h-auto object-cover min-h-full"
            />
          </div>
        </div>
      </section>
      <section className="bg-gray-100  text-gray-800 pt-4 sm:pt-8 md:pt-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto flex flex-col-reverse  md:grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="w-full flex justify-center items-center p-4 bg-[#b0db72] rounded-lg h-full">
            <img
              src="/images/offerings.jpg"
              alt="coaching"
              className="rounded-lg shadow-lg w-full h-auto object-cover min-h-full"
            />
          </div>
          <div className="flex flex-col space-y-6">
            <p className="text-base sm:text-lg text-[#b0db72] font-normal uppercase tracking-wide">
              Offerings
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              What We Offer
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              Team Hippa’s Pickleball Academy is designed to serve{" "}
              <span className="font-bold">all ages and skill levels,</span> from
              complete beginners to competitive players.
            </p>

            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-600 font-normal">
              {OFFER_ITEMS.map((item, index) => (
                <li key={index}>
                  <strong>{item.title}:</strong> {item.description}
                </li>
              ))}
            </ul>
            <h2 className="text-xl font-semibold mb-2">COMING SOON:</h2>
            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-600 font-normal">
              <li>Earn your official DUPR Rating through Team Hippa</li>
              <li>
                Online Platform to engage with the local pickleball community,
                schedule matches, ranking system for Team Hippa members
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 text-gray-800 pt-4 sm:pt-8 md:pt-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="flex flex-col space-y-6">
            <p className="text-base sm:text-lg text-[#b0db72] font-normal uppercase tracking-wide">
              Importance
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Why Pickleball Instruction Matters
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              Whether you’re just getting started or trying to level up,
              structured coaching matters—in{" "}
              <span className="font-bold">every sport</span>.
            </p>

            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-600 font-normal">
              {INSTRUCTION_ITEMS.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="w-full flex justify-center items-center p-4 bg-[#b0db72] rounded-lg h-full">
            <img
              src="/images/importance.jpg"
              alt="coaching"
              className="rounded-lg shadow-lg w-full h-auto object-cover min-h-full"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto flex flex-col-reverse md:grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="w-full flex justify-center items-center p-4 bg-[#b0db72] rounded-lg h-full">
            <img
              src="/images/coaching.jpeg"
              alt="coaching"
              className="rounded-lg shadow-lg w-full h-auto object-cover min-h-full"
            />
          </div>
          <div className="flex flex-col space-y-6">
            <p className="text-base sm:text-lg text-[#b0db72] font-normal uppercase tracking-wide">
              Choice
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Why Team Hippa?
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              <span className="font-bold">
                Team Hippa has delivered high-performance tennis coaching to
                athletes across the valley.
              </span>{" "}
              offers With a team deeply rooted in racquet sports, we’ve turned
              our focus to pickleball — developing a modern training philosophy
              that blends the speed, intensity, and physicality of competitive
              tennis with today’s professional-level pickleball.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              Pickleball is no longer a slow-paced backyard game. It’s fast,
              demanding, and strategic — Now we’re bringing that same energy,
              structure, and community into{" "}
              <span className="font-bold">pickleball</span>—right here in
              Gilbert.
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4">
              Our Strengths:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-600 font-normal">
              {CHOICE_ITEMS.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <FAQ
        title="The fastest growing Tennis Academy"
        subtitle="Feel free to ping us incase there is any doubts you have. Our team will love to help you out."
        data={ABOUT_FAQS}
      />
    </>
  );
};

export default PickleballLandingPage;