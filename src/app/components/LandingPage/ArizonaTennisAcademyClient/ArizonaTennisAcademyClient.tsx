'use client';

import Image from "next/image";
import {
  PROGRAMS_MASTER,
} from "@/untils/constant";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "../../Button";
import CourseCard from "../../CourseCard/CourseCard";

// --- Interface Definitions (Keep these as they are) ---
interface Course { id: number; slug: string; name: string; sportName: string; sportId: number; shortDescription: string; basePriceInfo: string; description: string; imagePaths: string[]; isActive: boolean; duration: string; }
interface Category { categoryId: number; categoryName: string; isPubliclyVisible: boolean; displayOrder: number; }
interface CourseCategoryMapping { courseId: number; categoryId: number; }
interface ArizonaTennisAcademyClientProps {
  initialCourses: Course[];
  initialCategories: Category[];
  initialMappings: CourseCategoryMapping[];
}


const ArizonaTennisAcademyClient: React.FC<ArizonaTennisAcademyClientProps> = ({
  initialCourses,
  initialCategories,
  initialMappings,
}) => {
  // --- STATE AND HOOKS (Default to "All Courses") ---
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const router = useRouter();

  // The useEffect that set a default category has been removed to make "All Courses" the default.

  // --- MEMOIZED COURSE GROUPING (No changes needed here) ---
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

  // --- EVENT HANDLERS (No changes needed here) ---
  const handleBookNow = (courseId: number) => {
    toast.info("Redirecting to booking...");
    router.push(`/booking/course/${courseId}`);
  };
  const handleViewDetails = (course: Course) => {
    router.push(`/book-now/courses/${course.slug}`);
  };
  const handelJoinClicked = () => {
    router.push("/book-now");
  };

  return (
    <>
      {/* SECTION 1: SEO-driven Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold uppercase text-black mb-4">
            Arizona Premier Tennis Academy
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 font-medium max-w-3xl mx-auto">
            Welcome to Team Hippa! We offer elite, year-round tennis and pickleball training for all ages and skill levels across Phoenix, Gilbert, and Scottsdale. Discover our expert coaching, flexible programs, and vibrant community.
          </p>
        </div>
      </section>

      {/* SECTION 2: Course Offerings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 text-sm font-semibold !rounded-full shadow-sm transition-colors ${selectedCategoryId === null ? "bg-green-600 text-white" : "bg-white !text-gray-700 hover:bg-gray-100"}`}
            >
              All Courses
            </Button>
            {initialCategories.map((cat) => (
              <Button
                key={cat.categoryId}
                onClick={() => setSelectedCategoryId(cat.categoryId)}
                className={`px-4 py-2 text-sm font-semibold !rounded-full shadow-sm transition-colors ${selectedCategoryId === cat.categoryId ? "bg-green-600 text-white" : "bg-white !text-gray-700 hover:bg-gray-100"}`}
              >
                {cat.categoryName}
              </Button>
            ))}
          </div>

          {/* Course grid */}
          {groupedCourses.map(([categoryName, { courses: courseList }]) => (
            <section key={categoryName}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{categoryName}</h2>
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
          ))}
          {groupedCourses.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-700">No Courses Available</h3>
              <p className="mt-2 text-gray-500">No courses found in this category. Try another or view all courses.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* SECTION 3: Why Choose Team Hippa Section (NEW & EXPANDED) */}
      <section className="bg-gray-50 py-16 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold uppercase text-black mb-4">
              The Team Hippa Advantage in Arizona
            </h2>
            <p className="text-lg text-gray-700 mx-auto max-w-3xl">
              We are dedicated to providing a superior training experience that combines world-class coaching with unmatched flexibility and community spirit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Certified Coaches</h3>
              <p className="text-gray-600">Our team brings international experience from both European and American tennis traditions, providing a well-rounded and effective coaching philosophy.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">Life is busy. Thats why we offer flexible class schedules and booking options that fit your life, not the other way around.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Programs for All Levels</h3>
              <p className="text-gray-600">From a toddlers first swing to high-performance training for aspiring pros, we have a clear development pathway for every player.</p>
            </div>
            {/* Card 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vibrant Community</h3>
              <p className="text-gray-600">Join a welcoming and passionate community of tennis and pickleball players who support each other on and off the court.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Testimonials Section (NEW) 
      
      <section className="py-16 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold uppercase text-black mb-4">
              Hear From Our Players
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-gray-700 italic mb-4">"The coaches at Team Hippa are phenomenal. My daughter's confidence and skills have skyrocketed since she joined the junior program. We couldn't be happier!"</p>
              <p className="text-gray-900 font-bold text-right">- Jessica M., Phoenix</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-gray-700 italic mb-4">"As an adult player, I appreciate the flexible scheduling and the high-quality drills in the clinics. It's the best workout and a great community. Highly recommend!"</p>
              <p className="text-gray-900 font-bold text-right">- David R., Gilbert</p>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* SECTION 5: Locations Section (NEW) */}
      <section className="bg-gray-50 py-16 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold uppercase text-black mb-4">
                Find Us Across The Valley
            </h2>
            <p className="text-lg text-gray-700 mx-auto max-w-3xl mb-8">
                We offer programs at premier facilities in both Phoenix and Gilbert, making it easy for you to find a court near you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    {/* Replace this iframe with your own Google Maps embed code for best results */}
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d425439.5539515983!2d-112.23595088124998!3d33.4228833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b08eda7da2e21%3A0xde9da9346615b497!2sTeam%20Hippa%20Tennis%20Academy%20in%20Phoenix!5e0!3m2!1sen!2sus!4v1678886400000!5m2!1sen!2sus" 
                        width="100%" 
                        height="450" 
                        style={{ border: 0 }} 
                       // allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Team Hippa Locations Map">
                    </iframe>
                </div>
                <div className="text-left">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Phoenix Location</h3>
                        <p className="text-gray-700">Rose Mofford Sports Complex</p>
                        <p className="text-gray-700">9833 N 25th Ave, Phoenix, AZ 85021</p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Gilbert Location</h3>
                        <p className="text-gray-700">Gilbert Regional Park</p>
                        <p className="text-gray-700">Gilbert, AZ 85298</p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Serving the Greater Area</h3>
                        <p className="text-gray-700">We proudly serve players from Scottsdale, Chandler, Mesa, and the entire Valley.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* SECTION 6: Call to Action Section (Existing) */}
      <section className="relative w-full h-96 bg-gray-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-[url('/images/exclusive-deal.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/30 z-0" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <p className="text-base sm:text-lg font-bold text-[#b0db72] text-center mb-3">
            Join Arizona’s top tennis & pickleball community!
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-white text-center mb-4">
            Start Your Phoenix or Gilbert Tennis Journey Today!
          </h2>
          <div className="flex sm:justify-center">
            <Button
              onClick={handelJoinClicked}
              className="text-white px-4 py-2 rounded w-fit text-sm font-normal"
            >
              Book a Free Trial Lesson
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 7: Carousel Programs Section (Existing) */}
      <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-gray-100">
        <div className="max-w-screen-2xl mx-auto">
          <h3 className="text-4xl sm:text-5xl font-semibold text-center text-black mb-2">
            Discover All Arizona Tennis Programs
          </h3>
          <p className="mb-6 leading-relaxed text-base sm:text-lg text-gray-600 text-center font-normal">
            From beginners to nationally-ranked – Team Hippa coaches and class options for every goal.
          </p>
          <Swiper
            slidesPerView={1.2}
            spaceBetween={16}
            loop
            navigation
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2.5 },
              768: { slidesPerView: 2.5 },
              1024: { slidesPerView: 3.5 },
              1280: { slidesPerView: 3.5 },
            }}
            modules={[Navigation, Autoplay]}
            className="w-full custome-slide"
          >
            {PROGRAMS_MASTER.map((program) => (
              <SwiperSlide key={program.title}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                  <Image
                    src={program.img}
                    alt={program.title}
                    width={400}
                    height={300}
                    className="w-full h-52 object-cover rounded-t-xl"
                  />
                  <div className="p-4">
                    <h4 className="text-base font-semibold text-black line-clamp-1">{program.title}</h4>
                    <p className="text-base sm:text-lg text-gray-600 font-normal line-clamp-2 mt-1">{program.description}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  );
};

export default ArizonaTennisAcademyClient;