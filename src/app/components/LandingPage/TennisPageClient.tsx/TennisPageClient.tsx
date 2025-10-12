"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import TennisCourseCard from "@/app/components/TennisCourseCard";
import FAQ from "@/app/components/FAQ";
import { Waitlist } from "@/app/components/WaitList";
import WaitlistForm from "@/app/components/WaitlistForm/WaitlistForm";
import SportsHeroSection from "@/app/components/SportsHeroSection";
import { PROGRAMS, ABOUT_FAQS } from "@/untils/constant";
import { Button } from "@/app/components/Button";
import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import { TennisProgram } from "@/app/components/TennisPrograms";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import ClassPoliciesAndRuleBook from "@/app/components/ClassPoliciesAndRuleBook";

interface Course {
  id: number;
  name: string;
  slug?: string;  
  sportName: string | null;
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

type SelectableItem = {
  id: number;
  name: string;
  type: string;
};

interface Props {
  tennisCourses: Course[];
  categories: Category[];
  mappings: CourseCategoryMapping[];
 
}

export default function TennisPageClient({ tennisCourses, categories, mappings}: Props) {
  const router = useRouter();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const handleBookNow = (item: SelectableItem) => {
    toast.info(`Redirecting to book "${item.name}"...`);
    router.push(`/booking/course/${item.id}`);
  };

  const handleNavigate = (slug: string) => {
    router.push(`/book-now/courses/${slug}`);
  };

  const groupedCourses = useMemo(() => {
    const courseMap = new Map(tennisCourses.map((c) => [c.id, c]));
    const groups: { [categoryName: string]: { courses: Course[]; order: number } } = {};

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

    return Object.entries(groups).sort(([, a], [, b]) => a.order - b.order);
  }, [tennisCourses, categories, mappings]);

  const handleTrialClick = () => {
    router.push("/contact");
  };

  return (
    <>
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Tennis Academy"
        description="Master the court with our world-class tennis programs, designed for all ages and skill levels, from beginner to high performance."
      />

      <main>
        {/* Render grouped courses, tennis programs, FAQ, waitlist, and more */}
        {/* Your existing components and content with same styling */}
        {/* Add button handlers, toast, modal states here*/}

<section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="space-y-16 max-w-screen-2xl mx-auto">
          {groupedCourses.length > 0 ? (
            groupedCourses.map(([categoryName, { courses: courseList }]) => (
              <div key={categoryName}>
                <h2 className="text-3xl font-bold text-black mb-6">
                  {categoryName}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courseList.map((course) => (
                    <TennisCourseCard
                      key={course.id}
                      course={{
                        ...course,
                        sportName: course.sportName ?? "",
                      }}
                      onNavigate={() => handleNavigate(course.slug || '')}
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
                No Tennis Courses Currently Available
              </h3>
              <p className="mt-2 text-base sm:text-lg text-gray-600 font-normal">
                Please check back soon for new offerings!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16 text-center bg-[url('/images/wait-list.png')] bg-center bg-no-repeat bg-cover">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-semibold text-left md:text-center text-black mb-4 capitalize">
            Interested in Joining?
          </h2>
          <p className="text-base sm:text-lg text-white font-normal mb-3">
            Our spots fill up fast. Join the waitlist to be notified of
            openings!
          </p>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setIsWaitlistOpen(true)}>
              Join Waitlist
            </Button>
          </div>
        </div>
      </section> */}

      <TennisProgram />

      <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-white">
        <div className="max-w-screen-2xl mx-auto">
          <h3 className="text-4xl sm:text-5xl font-semibold text-center text-black mb-4">
            Our Programs
          </h3>
          <Swiper
            slidesPerView={1.2}
            spaceBetween={16}
            loop={true}
            navigation={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: { slidesPerView: 2.5 },
              768: { slidesPerView: 2.5 },
              1024: { slidesPerView: 3.5 },
              1280: { slidesPerView: 3.5 },
            }}
            modules={[Navigation, Autoplay]}
            className="w-full custome-slide"
          >
            {PROGRAMS.map((program) => (
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
                    <h4 className="text-base font-semibold text-black line-clamp-1">
                      {program.title}
                    </h4>
                    <p className="text-base sm:text-lg text-gray-600 font-normal line-clamp-2 mt-1">
                      {program.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
      
      {/* <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto">
          <h3 className="text-4xl sm:text-5xl font-semibold text-center text-black mb-8">
            Meet Our Coaches
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {COACH_LIST.map((coach) => (
              <div
                key={coach.name}
                className="relative rounded-xl overflow-hidden shadow-lg group h-80"
              >
                <Image
                  src={coach.img}
                  alt={coach.name}
                  fill
                  style={{objectFit: 'cover'}}
                  className="group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-6">
                  <div>
                    <h4 className="text-xl font-semibold text-white text-center">
                      {coach.name}
                    </h4>
                    <p className="text-base sm:text-lg font-normal text-white text-center">
                      {coach.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-white text-center">
        <div className="max-w-screen-2xl mx-auto">
          <h3 className="text-4xl sm:text-5xl font-semibold text-center text-black mb-4">
            Flexible Training Schedules
          </h3>
          <p className="text-base sm:text-lg text-gray-600 font-normal mb-6">
            Morning and evening batches available. Join at your convenience.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleTrialClick}
              className="text-white px-6 py-3 transition"
            >
              Book Now
            </Button>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 text-center">
        <FAQ
          title="The fastest growing Tennis Academy"
          subtitle="Feel free to ping us incase there is any doubts you have. Our team will love to help you out."
          data={ABOUT_FAQS}
        />
      </section>
      <Waitlist
        title="Interested in Joining?"
        subtitle=" Our spots fill up fast. Join the waitlist to be notified of openings!"
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
      />

      <div>
      {/* Other page content */}

      <ClassPoliciesAndRuleBook href="/images/Rule-book-Website-Updated.pdf">
        Class policies / Rule Book
      </ClassPoliciesAndRuleBook>
    </div>
     
      {/* --- The Modal --- */}

      {/* <section className="bg-white py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto space-y-5 sm:space-y-10">
          {CAMP_DETAILS.map((item, index) => (
            <div key={index}>
              <h3 className="text-lg md:text-xl font-semibold uppercase text-[#91C13D] mb-2">
                {item.title}
              </h3>
              <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section> */}
      {isWaitlistOpen && (
        <WaitlistForm
          sportName="Tennis"
          onClose={() => setIsWaitlistOpen(false)}
        />
      )}


      </main>
    </>
  );
}
