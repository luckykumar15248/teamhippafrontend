"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// --- Type Definitions ---
interface Course {
  id: number;
  name: string;
  sportName: string;
  location: string; // <-- Required field from your API
  shortDescription: string;
  basePriceInfo: string;
  description: string;
  imagePaths: string[];
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

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const frontendServerUrl = process.env.NEXT_PUBLIC_FRONTEND_SERVER_URL;

// --- Placeholder Components (to ensure the code runs) ---
const SportsHeroSection: React.FC<{ bgImage: string; title: string; description: string; }> = ({ bgImage, title, description }) => (
    <div className="relative bg-cover bg-center text-white py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bgImage})` }}>
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{title}</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300">{description}</p>
        </div>
    </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors ${className}`} {...props}>
        {children}
    </button>
);

// --- Course Card Component ---
const CourseCard: React.FC<{ course: Course; onBookNow: (id: number) => void; onViewDetails: (course: Course) => void; }> = ({ course, onBookNow, onViewDetails }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const imageUrls = course.imagePaths?.length > 0 ? course.imagePaths : ["https://placehold.co/600x400/a7a2ff/333333?text=TeamHippa"];

    return (
        <section className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-1 transition-transform duration-300">
            <div className="relative group">
                <Swiper
                    modules={[Pagination]}
                    pagination={{ clickable: true }}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    className="h-48 w-full"
                >
                    {imageUrls.map((url, index) => (
                        <SwiperSlide key={index}>
                            <img src={url} alt={course.name} className="h-48 w-full object-cover" />
                        </SwiperSlide>
                    ))}
                </Swiper>
                <span className="text-xs text-white mt-1 text-center bg-black/70 flex justify-center items-center w-fit rounded-full py-1 px-4 absolute right-6 bottom-6 z-10">
                    {activeIndex + 1} / {imageUrls.length}
                </span>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold text-black line-clamp-1">{course.name}</h3>
                <p className="mt-2 text-base text-gray-600 font-normal line-clamp-2">{course.shortDescription}</p>
                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <span className="text-lg font-bold text-black">{course.basePriceInfo || "Contact for Price"}</span>
                    <div className="flex justify-between gap-2">
                        <Button onClick={() => onViewDetails(course)} className="!text-indigo-600 hover:!text-white bg-transparent border border-indigo-600 w-full whitespace-nowrap">
                            View Details
                        </Button>
                        <Button onClick={() => onBookNow(course.id)} className="text-white px-4 py-2 rounded w-full whitespace-nowrap">
                            Book Now
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Reusable Landing Page Component ---
interface LocationLandingPageProps {
    location: string;
    sportName: string;
}

const LocationLandingPage: React.FC<LocationLandingPageProps> = ({ location, sportName }) => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mappings, setMappings] = useState<CourseCategoryMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
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

        const transformedCourses = (coursesRes.data || []).map((course: any) => ({
          ...course,
          imagePaths: (course.imagePaths || []).map((path: string) =>
            path.startsWith("http") ? path : `${frontendServerUrl}${path}`
          ),
        }));
        
        setAllCourses(transformedCourses);
        setCategories((categoriesRes.data || []).filter((c: Category) => c.isPubliclyVisible));
        setMappings(mappingsRes.data || []);

      } catch (error) {
        toast.error("Could not load offerings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedCourses = useMemo(() => {
    const locationAndSportCourses = allCourses.filter(
        (course) => course.location === location && course.sportName === sportName
    );

    const courseMap = new Map(locationAndSportCourses.map((c) => [c.id, c]));
    const groups: { [categoryName: string]: { courses: Course[]; order: number }; } = {};

    mappings.forEach((mapping) => {
      const category = categories.find((c) => c.categoryId === mapping.categoryId);
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

    const allGroupedCourses = Object.entries(groups).sort(([, groupA], [, groupB]) => groupA.order - groupB.order);

    if (selectedCategoryId) {
      const selectedCategoryName = categories.find(c => c.categoryId === selectedCategoryId)?.categoryName;
      return allGroupedCourses.filter(([categoryName]) => categoryName === selectedCategoryName);
    }
    return allGroupedCourses;
  }, [allCourses, categories, mappings, selectedCategoryId, location, sportName]);

  const handleViewDetails = (course: Course) => {
    router.push(`/course-categories/courses/${course.id}`);
  };

  const handleBookNow = (courseId: number) => {
    toast.info("Redirecting to booking...");
    router.push(`/booking/course/${courseId}`);
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
        title={`${sportName} in ${location}`}
        description={`Find the best ${sportName.toLowerCase()} training programs and courses available in ${location}.`}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors ${!selectedCategoryId ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => setSelectedCategoryId(cat.categoryId)}
                className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors ${selectedCategoryId === cat.categoryId ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>

          {groupedCourses.map(([categoryName, { courses: courseList }]) => (
            <section key={categoryName}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{categoryName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courseList.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onViewDetails={handleViewDetails}
                    onBookNow={handleBookNow}
                  />
                ))}
              </div>
            </section>
          ))}
          {groupedCourses.length === 0 && !isLoading && (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-700">
                No {sportName} Courses Available in {location}
              </h3>
              <p className="mt-2 text-gray-500">
                No courses were found for the selected category or location.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default LocationLandingPage;

