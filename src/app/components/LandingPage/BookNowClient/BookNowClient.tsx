"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SportsHeroSection from "../../../components/SportsHeroSection";
import { Button } from "../../../components/Button";

// --- Type Definitions (Updated to match API response) ---
interface Course {
  id: number;
  slug: string;
  name: string;
  sportName: string;
  sportId: number;
  shortDescription: string;
  basePriceInfo: string;
  description: string;
  imagePaths: string[];
  isActive: boolean;
  duration: string;
}

interface Package {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  imageUrls: string[];
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
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const frontendServerUrl = process.env.NEXT_PUBLIC_FRONTEND_SERVER_URL;
type SelectableItem = (Course | Package) & { type: "course" | "package" };

// --- SVG Icons ---
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Details Modal Component ---
interface DetailsModalProps {
  item: SelectableItem | null;
  onClose: () => void;
  onBookNow: (item: SelectableItem) => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  item,
  onClose,
  onBookNow,
}) => {
  if (!item) return null;

  const animationClasses =
    "transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div
        className={`bg-white  rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col ${animationClasses}`}
      >
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XIcon />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <img
                src={
                  "imagePaths" in item
                    ? item.imagePaths?.[0] ||
                      "https://placehold.co/600x400/a7a2ff/333333?text=TeamHippa"
                    : item.imageUrls?.[0] ||
                      "https://placehold.co/600x400/a7a2ff/333333?text=TeamHippa"
                }
                alt={item.name}
                className="w-full h-64 object-cover rounded-lg mb-4 shadow dark:shadow-gray-900"
              />
              <div className="grid grid-cols-4 gap-2">
                {("imagePaths" in item ? item.imagePaths : item.imageUrls)
                  ?.slice(1, 5)
                  .map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${item.name} ${index + 2}`}
                      className="w-full h-20 object-cover rounded-md"
                    />
                  ))}
              </div>
            </div>
            {/* Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    item.type === "package"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {item.type === "course"
                    ? (item as Course).basePriceInfo
                    : `₹${(item as Package).price.toFixed(2)}`}
                </span>
              </div>
              <div
                className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 prose-headings:dark:text-white prose-strong:dark:text-white"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
              {"duration" in item && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong className="dark:text-white">Duration:</strong> {item.duration}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 sticky bottom-0">
          <button
            onClick={() => onBookNow(item)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Course Card Component ---
interface CourseCardProps {
  course: Course;
  onBookNow: (courseId: number) => void;
  onViewDetails: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onBookNow,
  onViewDetails,
}) => {
  const imageUrls = course.imagePaths || [];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-white dark:bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-1 transition-transform duration-300 dark:shadow-gray-900 dark:hover:shadow-gray-700">
      <div className="relative group">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="h-48 w-full main-swiper"
        >
          {(imageUrls.length > 0
            ? imageUrls
            : ["https://placehold.co/600x400/a7a2ff/333333?text=TeamHippa"]
          ).map((url, index) => (
            <SwiperSlide key={index}>
              <img
                src={url}
                alt={course.name}
                className="h-48 w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Slide count display */}
        <span className="text-xs text-white mt-1 text-center  bg-black/70 flex justify-center items-center w-fit rounded-full py-1 px-4 absolute right-6 bottom-6 z-10">
          {activeIndex + 1} / {imageUrls.length > 0 ? imageUrls.length : 1}
        </span>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold text-black dark:text-gray-900 line-clamp-1">
          {course.name}
        </h3>
        <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-black font-normal line-clamp-2">
          {course.shortDescription}
        </p>
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-black flex flex-col gap-2">
          <span className="text-lg font-bold text-black dark:text-gray-900">
            ${course.basePriceInfo || "Contact for Price"}
          </span>
          <div className="flex justify-between gap-2">
            <Button
              onClick={() => onViewDetails(course)}
              className="!text-[#b0db72] hover:!text-white bg-transparent border border-[#b0db72] w-full whitespace-nowrap dark:!text-[#9acd50] dark:border-[#9acd50] dark:hover:!text-gray-900"
            >
              View Details
            </Button>
            <Button
              onClick={() => onBookNow(course.id)}
              className="text-white px-4 py-2 rounded w-full whitespace-nowrap bg-[#b0db72] hover:bg-[#9acd50] dark:bg-[#7cb342] dark:hover:bg-[#64a506]"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Main Page Component ---
const BookNowClient: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mappings, setMappings] = useState<CourseCategoryMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
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
        console.log("Courses response:", coursesRes.data);

        const bookableCategory = (categoriesRes.data || []).find(
          (cat: Category) => cat.categoryName === "Available for Booking"
        );
        if (!bookableCategory) {
          console.warn("'Available for Booking' category not found.");
        }

        // Transform courses to include full image URLs and ensure imagePaths exists
        const transformedCourses = (coursesRes.data || []).map(
          (course: Course) => ({
            ...course,
            imagePaths: (course.imagePaths || []).map((path) =>
              path.startsWith("http") ? path : `${frontendServerUrl}${path}`
            ),
          })
        );

        setCourses(transformedCourses);
        setCategories(
          (categoriesRes.data || []).filter(
            (c: Category) => c.isPubliclyVisible
          )
        );
        setMappings(mappingsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Could not load our offerings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedCourses = useMemo(() => {
    const courseMap = new Map(courses.map((c) => [c.id, c]));
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

    const allGroupedCourses = Object.entries(groups).sort(
      ([, groupA], [, groupB]) => groupA.order - groupB.order
    );

    if (selectedCategoryId) {
      const selectedCategoryName = categories.find(
        (c) => c.categoryId === selectedCategoryId
      )?.categoryName;
      return allGroupedCourses.filter(
        ([categoryName]) => categoryName === selectedCategoryName
      );
    }

    return allGroupedCourses;
  }, [courses, categories, mappings, selectedCategoryId]);

  const handleViewDetails = (course: Course) => {
    router.push(`/book-now/courses/${course.slug}`);
  };

  const handleBookNow = (item: SelectableItem) => {
    console.log(`Navigating to book ${item.type} with ID ${item.id}`);
    toast.info(`Redirecting to book "${item.name}"...`);
    router.push(`/booking/course/${item.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <>
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Find Your Passion"
        description="Explore our wide range of professional sports courses and packages designed for all skill levels."
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white ">
        <div className="space-y-16">
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 text-sm font-semibold !rounded-full shadow-sm transition-colors ${
                !selectedCategoryId
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Courses
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => setSelectedCategoryId(cat.categoryId)}
                className={`px-4 py-2 text-sm font-semibold !rounded-full shadow-sm transition-colors ${
                  selectedCategoryId === cat.categoryId
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 "
                }`}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>

          {groupedCourses.map(([categoryName, { courses: courseList }]) => (
            <section key={categoryName}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {categoryName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courseList.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onViewDetails={() => handleViewDetails({ ...course })}
                    onBookNow={() =>
                      handleBookNow({ ...course, type: "course" })
                    }
                  />
                ))}
              </div>
            </section>
          ))}
          {groupedCourses.length === 0 && !isLoading && (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-700">
                No Courses Available
              </h3>
              <p className="mt-2 text-gray-500">
                No courses were found for the selected category. Please try
                another one or view all courses.
              </p>
            </div>
          )}
        </div>
      </main>

      {selectedItem && (
        <DetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onBookNow={handleBookNow}
        />
      )}
    </>
  );
};

export default BookNowClient;