'use client';

import Image from "next/image";
import {
  FLEXIBLE_TRAINING,
  PROGRAMS_MASTER,
  PROGRAMS_TENNIES,
} from "@/untils/constant";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { SparkleIcon } from "../../Icons";


import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "../../Button";
import CourseCard from "../../CourseCard/CourseCard";
import SummerCampShortDetails from '../../../components/SummerCampShortDetails/SummerCampShortDetails';
// --- Inline Type Definitions ---
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

interface TennisGilbertClientProps {
  initialCourses: Course[];
  initialCategories: Category[];
  initialMappings: CourseCategoryMapping[];
}

const TennisGilbertClient: React.FC<TennisGilbertClientProps> = ({
  initialCourses,
  initialCategories,
  initialMappings,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const router = useRouter();

  // Set default category on first render (keep your existing logic)
  useEffect(() => {
    if (initialCategories.length > 0) {
      setSelectedCategoryId(initialCategories[0].categoryId);
    }
  }, [initialCategories]);

  // Group courses by category - keep your existing logic
  const groupedCourses = useMemo(() => {
    const courseMap = new Map(initialCourses.map((c) => [c.id, c]));
    const groups: { [categoryName: string]: { courses: Course[]; order: number } } = {};

    initialMappings.forEach((mapping: CourseCategoryMapping) => {
      const category = initialCategories.find(
        (c: Category) => c.categoryId === mapping.categoryId
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
          !groups[category.categoryName].courses.some((c: Course) => c.id === course.id)
        ) {
          groups[category.categoryName].courses.push(course);
        }
      }
    });

    const allGroupedCourses = Object.entries(groups).sort(
      ([, groupA], [, groupB]) => groupA.order - groupB.order
    );
/*
    if (selectedCategoryId) {
      const selectedCategoryName = initialCategories.find(
        (c: Category) => c.categoryId === selectedCategoryId
      )?.categoryName;
      return allGroupedCourses.filter(
        ([categoryName]: [string, any]) => categoryName === selectedCategoryName
      );
    }*/

  if (selectedCategoryId) {
  const selectedCategoryName = initialCategories.find(
    (c: Category) => c.categoryId === selectedCategoryId
  )?.categoryName;

  // Filter using correct tuple structure
  return allGroupedCourses.filter(
    ([categoryName]: [string, { courses: Course[]; order: number }]) =>
      categoryName === selectedCategoryName
  );
}

    return allGroupedCourses;
  }, [initialCourses, initialCategories, initialMappings, selectedCategoryId]);

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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-16">
        {/* Category filters - KEEP YOUR EXISTING STYLING */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 text-sm font-semibold !rounded-full shadow-sm transition-colors ${
              selectedCategoryId === null
                ? "bg-green-600 text-white"
                : "bg-white !text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Courses
          </Button>
          {initialCategories.map((cat: Category) => (
            <Button
              key={cat.categoryId}
              onClick={() => setSelectedCategoryId(cat.categoryId)}
              className={`px-4 py-2 text-sm font-semibold !rounded-full shadow-sm transition-colors ${
                selectedCategoryId === cat.categoryId
                  ? "bg-green-600 text-white"
                  : "bg-white !text-gray-700 hover:bg-gray-100"
              }`}
            >
              {cat.categoryName}
            </Button>
          ))}
        </div>

        {/* Course grid - KEEP YOUR EXISTING STYLING */}
        {groupedCourses.map(([categoryName, { courses: courseList }]: [string, { courses: Course[]; order: number }]) => (
          <section key={categoryName}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {categoryName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courseList.map((course: Course) => (
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

  
</section>
<section className="relative bg-gradient-to-r from-[#b0db72] to-[#3a702b] py-12 sm:py-16 md:py-20 px-6 lg:px-16 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative max-w-screen-xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 capitalize">
            Book Our Summer Camp At{" "}
            <span className="relative">Teamhippa Academy</span>&nbsp; For Your
            Junior!
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-3xl mx-auto mb-8 leading-relaxed">
            Join us at the Teamhippa Academy for an exceptional tennis training
            experience! Whether you’re an adult or a child, and regardless of
            your current skill level, our camps offer a premier opportunity to
            improve your game.
          </p>

          <div className="flex justify-center">
            <Button
              //onClick={handleClick}
              className="bg-white !text-[#64a506] px-6 py-3 !rounded-full font-medium shadow-md hover:shadow-lg hover:bg-gray-100 transition-all duration-300"
            >
              Register Now
            </Button>
          </div>
        </div>
      </section>

    <SummerCampShortDetails />

      <section className="bg-white py-10 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-semibold uppercase text-black">
              New Tennis Program in Gilbert
            </h1>
            <div className="mt-2 h-1 w-20 bg-green-600 mx-auto rounded"></div>
          </div>

          {/* WHO ARE WE */}
          <div className="mb-12 bg-white shadow-md rounded-2xl p-6 md:p-10">
            <h2 className="text-2xl text-green-600 font-semibold sm:text-center uppercase mb-4">
              Who Are We?
            </h2>

            <p className="mb-4 leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              <span className="font-bold">Team Hippa</span> is a high-level
              tennis academy based in{" "}
              <span className="font-bold">Phoenix, Arizona</span>, built by a
              team of certified, internationally experienced coaches. Known for
              our modern training methods and strong European coaching
              philosophy, we’ve helped players of all ages grow their game
              through a balanced focus on technique, fitness, and mental
              strength. After success in the Phoenix area, we’re excited to
              expand into <span className="font-bold">Gilbert</span>, bringing
              our proven programs to
              <span className="font-bold"> Gilbert Regional Park</span>. Whether
              you’re just starting out or competing at a high level, our mission
              is to provide the structure, flexibility, and support needed to
              help every player reach their full potential.
            </p>

            <Link
              href="/sports/tennis"
              target="_blank"
              className="text-base sm:text-lg font-medium text-blue-600 underline cursor-pointer"
            >
              Looking for tennis lessons in Gilbert, Arizona?
            </Link>
            <p className="leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              Team Hippa is launching soon with exciting new&nbsp;
              <span className="font-bold">tennis programs</span> at&nbsp;
              <span className="font-bold">Gilbert Regional Park </span> and{" "}
              <span className="font-bold">Freestone Recreation Center </span>.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              Our academy offers tennis training for all ages and levels —
              including
              <span className="font-bold"> new tennis programs</span> at Gilbert
              Regional Park and Freestone Recreation Center.
            </p>
          </div>

          {/* Flexible Training */}
          <div className="mb-12 bg-green-50 border-l-4 border-green-600 rounded-md p-6">
            <h2 className="text-2xl text-green-600 font-semibold uppercase mb-4">
              Flexible, Player-Centered Training – No Set Schedules
            </h2>
            <p className="mb-4 leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              Unlike many tennis programs in Gilbert, we don’t lock players into
              rigid 8-week sessions or fixed times. With Team Hippa, you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-600 font-normal">
              {FLEXIBLE_TRAINING.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              This flexible structure is ideal for busy families, students, and
              adult players who want to stay active without the pressure of a
              fixed schedule.
            </p>
          </div>

          {/* Coaching Philosophy */}
          <div className="mb-12 bg-white shadow-md rounded-2xl p-6 md:p-10">
            <h2 className="text-2xl text-green-600 font-semibold uppercase mb-4">
              European Coaching Philosophy, Right Here in Gilbert
            </h2>
            <p className="mb-4 leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              Led by a team of{" "}
              <span className="font-bold">
                highly educated, certified coaches
              </span>
              , Team Hippa brings a{" "}
              <span className="font-bold">European coaching philosophy</span>{" "}
              focused on long-term player development, technical excellence, and
              a positive, competitive environment.
            </p>
            <p className="leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              Whether you’re picking up a racket for the first time or training
              for your next tournament, our mission is to provide the
              highest-quality tennis instruction in Gilbert.
            </p>
          </div>

          {/* Programs Coming Soon */}
          {/* <div className="bg-green-600 text-white text-base sm:text-lg font-normal rounded-2xl shadow-lg p-6 md:p-10">
            <h2 className="text-2xl font-semibold uppercase mb-4">
              Programs Coming Soon
            </h2>
            <ul className="list-disc list-inside space-y-2">
              {PROGRAMS_TENNIES.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-500 flex flex-col items-start justify-center rounded-2xl shadow-lg p-8">
              <div className="flex gap-2 items-center mb-1">
                <SparkleIcon className="text-yellow-300  min-w-6 min-h-6" />
                <h2 className="text-white text-2xl font-semibold uppercase">
                  Tennis & Pickleball Events
                </h2>
              </div>
              <p className="text-white text-base sm:text-lg font-normal">
                Exciting activities • Community vibes • Fun for everyone
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white text-black rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                Programs Coming Soon
              </h2>
              {/* <p className="text-sm opacity-90 mb-3">
      Exciting activities • Community vibes • Fun for everyone
    </p> */}
              <ul className="text-base space-y-2">
                {PROGRAMS_TENNIES.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-gray-100">
        <div className="max-w-screen-2xl mx-auto">
          <h3 className="text-4xl sm:text-5xl font-semibold text-center text-black mb-2">
            Master Your Game, Your Way
          </h3>
          <p className="mb-6 leading-relaxed text-base sm:text-lg text-gray-600 text-center font-normal">
            From Beginners to Pros, We Have the Perfect Tennis Coaching for
            Every Level and Goal!
          </p>
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
      <section className="relative w-full h-96 bg-gray-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-[url('/images/exclusive-deal.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/30 z-0" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <p className="text-base sm:text-lg font-bold text-[#b0db72] text-center mb-3">
            Join us
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-white text-center mb-4">
            Our program is always open for new players. Join today!
          </h2>
          <div className="flex sm:justify-center">
            <Button
              onClick={handelJoinClicked}
              className="text-white px-4 py-2 rounded w-fit text-sm font-normal"
            >
              Book A Lession
            </Button>
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-b from-green-50 via-white to-green-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-green-800 leading-snug">
            Why the{" "}
            <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              European Coaching Philosophy
            </span>{" "}
            Builds Champions
          </h2>
          <p className="mt-4 text-lg text-gray-700 font-semibold max-w-3xl mx-auto">
            Europe has produced some of the best tennis players on the planet.
            But what differs European tennis from American?
          </p>
        </div>

        {/* Quote Style Content Boxes */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="relative bg-black text-white rounded-2xl p-6 shadow-lg">
            <span className="absolute -top-5 -left-3 text-8xl leading-[92px] text-green-600">
              “
            </span>
            <p>
              Regarding producing world-class tennis players, Europe has
              consistently led the way. From Rafael Nadal to Novak Djokovic, the
              continent has developed elite athletes known for their technical
              precision, mental toughness, and strategic play. But what exactly
              makes the{" "}
              <span className="font-semibold">
                European tennis coaching philosophy
              </span>
              so effective — and why are we bringing it to our new{" "}
              <span className="font-semibold">
                tennis academy in Gilbert, Arizona?
              </span>
            </p>
            <span className="absolute -bottom-7 -right-3 text-8xl leading-[6px] text-green-600">
              ”
            </span>
          </div>

          <div className="relative bg-white text-gray-800 rounded-2xl p-6 shadow-lg">
            <span className="absolute -top-5 -left-3 text-8xl leading-[92px] text-black">
              “
            </span>

            <p>
              At its core, European coaching emphasizes{" "}
              <span className="font-semibold">
                long-term player development over short-term results
              </span>
              . Instead of pushing players into early competition, coaches focus
              on foundational skills — footwork, consistency, shot selection —
              and gradually build from there. One of the defining
              characteristics of this approach is the{" "}
              <span className="font-semibold">
                strong coach-player relationship
              </span>
              , often formed by working with{" "}
              <span className="font-semibold">one dedicated coach</span>
              over multiple years.
            </p>

            <span className="absolute -bottom-7 -right-3 text-8xl leading-[6px] text-black">
              ”
            </span>
          </div>

          <div className="relative bg-green-600 text-white rounded-2xl p-6 shadow-lg">
            <span className="absolute -top-5 -left-3 text-8xl leading-[92px] text-black">
              “
            </span>

            <p>
              Another hallmark of{" "}
              <span className="font-semibold">
                European-style junior tennis training
              </span>
              is a structured but flexible training model. Group sizes tend to
              be smaller, allowing for individualized attention, and coaches act
              as long-term mentors, not just instructors. At our{" "}
              <span className="font-semibold">tennis academy in Gilbert</span>,
              we embrace this mindset by designing sessions based on a player’s
              age, experience, and goals. Rather than rigid schedules, we offer
              flexible training packages so athletes — and parents — can choose
              when and how often to train. This freedom supports consistency and
              avoids burnout, especially for busy families.
            </p>

            <span className="absolute -bottom-7 -right-3 text-8xl leading-[6px] text-black">
              ”
            </span>
          </div>

          <div className="relative bg-black text-white rounded-2xl p-6 shadow-xl">
            <span className="absolute -top-5 -left-3 text-8xl leading-[92px] text-green-600">
              “
            </span>

            <p>
              Mental development is equally important. The{" "}
              <span className="font-semibold">European coaching model</span>{" "}
              emphasizes emotional maturity, focus, and internal motivation.
              Through match-style drills, guided pressure situations, and
              strategic game play, players build the skills needed to compete
              confidently and independently. It’s an approach that develops not
              only great players, but strong individuals.
            </p>

            <span className="absolute -bottom-7 -right-3 text-8xl leading-[6px] text-green-600">
              ”
            </span>
          </div>

          <div className="relative bg-white text-gray-800 rounded-2xl p-6 shadow-lg md:col-span-2">
            <span className="absolute -top-5 -left-3 text-8xl leading-[92px] text-black">
              “
            </span>

            <p>
              At <span className="font-semibold">Team Hippa</span>, we bring
              this proven system to our high-performance tennis programs in
              Arizona. With deep roots in European methodology and years of
              experience in junior tennis development, our mission is to offer
              players the tools, environment, and coaching they need to reach
              their full potential. Just as importantly, we’re creating a
              family-oriented, competitive atmosphere where both players and
              parents feel they’re part of something meaningful. That’s why we
              chose the name Team Hippa — because growth happens best when it’s
              shared.
            </p>

            <span className="absolute -bottom-7 -right-3 text-8xl leading-[6px] text-black">
              ”
            </span>
          </div>
        </div>
      </section>




 
</>
  );
};

export default TennisGilbertClient;