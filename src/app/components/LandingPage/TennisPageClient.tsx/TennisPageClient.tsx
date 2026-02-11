"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import TennisCourseCard from "@/app/components/TennisCourseCard";
import FAQ from "@/app/components/FAQ";
//import { Waitlist } from "@/app/components/WaitList";
import WaitlistForm from "@/app/components/WaitlistForm/WaitlistForm";
import SportsHeroSection from "@/app/components/SportsHeroSection";
import { PROGRAMS } from "@/untils/constant";
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
//import ClassPoliciesAndRuleBook from "@/app/components/ClassPoliciesAndRuleBook";
import Link from "next/link";
import Inquiry from "@/app/components/Inquiry-form";
import { TENNIS_PAGE_FAQS } from "@/untils/constant";

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
    router.push("/book-now");
  };

  return (
    <>
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Tennis Academy & Coaching Programs - Gilbert & Phoenix | Team Hippa"
        description=" Team Hippa is a leading tennis academy in Arizona offering elite tennis coaching, junior development programs, and adult tennis lessons. Whether you're a beginner or a competitive player, our expert coaches help you achieve peak performance."
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
                <h2 className="text-4xl md:text-4xl font-extrabold text-gray-900 mb-6 text-center">
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
             <div className="text-center mb-16">
              <h2 className="text-4xl md:text-4xl font-extrabold text-gray-900 mb-6">
               Tennis <span className="text-green-600"> Programs </span>for All Ages & Skill Levels
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                From beginner tennis lessons to elite performance training, we offer comprehensive tennis coaching programs tailored for every athlete.
              </p>
            </div>
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

       <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-gray-100 text-center">
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

       {/* Local SEO Section */}
<section className="py-24 px-6 lg:px-16 bg-white">
  <div className="max-w-6xl mx-auto text-center">

    <h2 className="text-4xl md:text-4xl font-extrabold text-gray-900 mb-6 ">
      Serving <span className="text-green-600">Tennis Players </span> Across Phoenix & Gilbert, Arizona
    </h2>

    <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
      Our tennis academy proudly serves families and athletes across
      <strong> Gilbert, Chandler, Mesa, Tempe, Scottsdale, and Phoenix AZ.</strong>
      If you are searching for <strong> tennis lessons near me</strong> or
      <strong> tennis coaching in Phoenix AZ </strong>, Team Hippa is your trusted training destination.
    </p>

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

     

      <section className="py-24 px-6 lg:px-16 bg-gray-100">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <h2 className="text-4xl md:text-4xl font-extrabold leading-tight text-gray-900 md:col-span-5">
            Why Choose <span className="text-green-600">Team Hippa</span> Tennis Academy?{" "}
            
          </h2>

          <p className="text-lg md:text-xl leading-relaxed text-gray-600 md:col-span-7">
           Trusted by hundreds of families across Phoenix & Gilbert
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">

          {/* Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 text-lg font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Elite Tennis Coaching
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                   Learn from certified coaches with international playing and coaching experience.
                </p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 text-lg font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Junior & Adult Programs
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                   Structured <strong>junior tennis classes</strong> and advanced
                  <strong> adult tennis training programs</strong> for every skill level.
                </p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 text-lg font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Phoenix & Gilbert Locations
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                 Convenient training locations offering world-class tennis facilities.
                </p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 text-lg font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Simple online booking
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                  Find a program, pick a time, and book in seconds from any device, with instant confirmations and reminders.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

      <section className="bg-gray-100 text-center">
        <FAQ
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about our tennis coaching programs"
           data={TENNIS_PAGE_FAQS}
        />
      </section>
    
      <section className="py-24 px-6 lg:px-16 bg-gradient-to-b from-white to-gray-100">
  <div className="max-w-5xl mx-auto text-center">

    {/* Heading */}
    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
      Tennis Academy Policies & Rule Book
    </h2>

    {/* SEO Content */}
    <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
      At <strong>Team Hippa Tennis Academy</strong>, we are committed to maintaining
      a professional, safe, and high-performance training environment for all players.
      Our official class policies outline attendance guidelines, cancellation terms,
      code of conduct, and academy expectations for juniors and adults participating in
      our <strong>tennis lessons in Gilbert and Phoenix, AZ</strong>.
    </p>

    <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-10">
      Whether you are enrolled in beginner tennis classes, competitive junior programs,
      or advanced tennis coaching sessions, we encourage all families and athletes
      to review our academy rules to ensure a smooth and positive training experience.
    </p>

    {/* CTA Button */}
    <div className="mt-8">
      <a
        href="/images/Rule-book-Website-Updated.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-300"
      >
        View Class Policies & Rule Book (PDF)
      </a>
    </div>

    {/* Optional Trust Line */}
    <p className="text-sm text-gray-500 mt-6">
      Serving tennis players across Gilbert, Chandler, Mesa, Tempe, Scottsdale & Phoenix, Arizona.
    </p>

  </div>
</section>


    {/* Training Philosophy */}
<section className="py-24 px-6 lg:px-16 bg-white">
  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">

    <div>
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
        Our Tennis Coaching Philosophy
      </h2>

      <p className="text-lg text-gray-600 leading-relaxed mb-5">
        At Team Hippa, we believe world-class tennis training is built on
        <strong> technique, discipline, mental strength, and long-term development.</strong>
      </p>

      <p className="text-lg text-gray-600 leading-relaxed mb-5">
        Our tennis academy in Gilbert & Phoenix follows a structured coaching pathway,
        designed to help players progress from beginner to advanced competitive levels.
      </p>

      <p className="text-lg text-gray-600 leading-relaxed">
        Every athlete receives personalized coaching, match play training, physical
        conditioning, and mental preparation — ensuring complete on-court and off-court growth.
      </p>
    </div>

    <div className="relative rounded-3xl overflow-hidden shadow-xl">
      <img
        src="/images/tennis-training.jpg"
        alt="Professional Tennis Coaching at Team Hippa"
        className="w-full h-full object-cover"
      />
    </div>

  </div>
</section>



        
{/* Contact Us Section */}
<section className="w-full py-20 px-6 lg:px-16 bg-[#f5f6f7]">
  <div className="max-w-6xl mx-auto">

    {/* Heading */}
    <div className="text-center mb-14">
      <p className="text-sm font-medium text-[#7cb342] uppercase tracking-wider mb-2">
        Contact Us
      </p>

      <h2 className="text-4xl sm:text-4xl font-semibold text-gray-800 mb-4">
        Let’s Start Your Training Journey
      </h2>

      <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Have questions or need personalized guidance? Our team is here to help
        you choose the perfect training program and get started confidently.
      </p>

      <p className="text-sm text-gray-500 mt-4">
        Already a member?{" "}
        <Link href="/login" className="text-[#7cb342] font-medium hover:underline">
          Sign in
        </Link>{" "}
        for faster support.
      </p>
    </div>

    {/* Form Card */}
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
      <Inquiry />
    </div>

  </div>
</section>


     
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
