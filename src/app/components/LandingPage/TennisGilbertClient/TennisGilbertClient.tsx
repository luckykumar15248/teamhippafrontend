'use client';

import Image from "next/image";
import {
  PROGRAMS_MASTER
} from "@/untils/constant";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { SparkleIcon, TrophyIcon } from "../../Icons";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "../../Button";
import CourseCard from "../../CourseCard/CourseCard";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from "lucide-react";

// --- Types ---
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
  const [activeTab, setActiveTab] = useState<'programs' | 'locations' | 'WhyChooseUs'>('programs');
  const router = useRouter();

  useEffect(() => {
    if (initialCategories.length > 0) {
      setSelectedCategoryId(initialCategories[0].categoryId);
    }
  }, [initialCategories]);

  const groupedCourses = useMemo(() => {
    const courseMap = new Map(initialCourses.map((c) => [c.id, c]));
    const groups: { [categoryName: string]: { courses: Course[]; order: number } } = {};

    initialMappings.forEach((mapping: CourseCategoryMapping) => {
      const category = initialCategories.find(
        (c: Category) => c.categoryId === mapping.categoryId
      );
      const course = courseMap.get(mapping.courseId);

      if (category && course && category.isPubliclyVisible) {
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

    if (selectedCategoryId) {
      const selectedCategoryName = initialCategories.find(
        (c: Category) => c.categoryId === selectedCategoryId
      )?.categoryName;
      return allGroupedCourses.filter(
        ([categoryName]: [string, { courses: Course[]; order: number }]) =>
          categoryName === selectedCategoryName
      );
    }

    return allGroupedCourses;
  }, [initialCourses, initialCategories, initialMappings, selectedCategoryId]);

  const handleBookNow = (courseId: number) => {
    toast.success("Redirecting to booking...");
    router.push(`/booking/course/${courseId}`);
  };

  const handleViewDetails = (course: Course) => {
    router.push(`/book-now/courses/${course.slug}`);
  };

  const handelJoinClicked = () => {
    router.push("/book-now");
  };

  const handelContactUsClicked = () => {
    router.push("/contact");
  };
  const handelBookPackageClicked = () => {
    router.push("/packages");
  };
  return (
    <>
      {/* Hero Section - Modern & Dynamic with Location Map */}
      <section className="relative bg-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <SparkleIcon className="w-4 h-4" />
                ⭐ Best Tennis Lessons in Gilbert, Arizona
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Top-Rated{' '}
                <span className="text-green-600 relative">
                  Tennis Coaching
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" preserveAspectRatio="none">
                    <path d="M0 0 L100 12 L100 0 Z" fill="currentColor" className="text-green-200/50" />
                  </svg>
                </span>
                <br />Near You in Gilbert
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                Looking for <strong>tennis lessons near me in Gilbert</strong>? Join Team Hippa at
                Gilbert Regional Park. Professional coaching for
                <strong> kids, adults, and seniors</strong>.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handelJoinClicked}
                  className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all hover:shadow-xl hover:shadow-green-200/50"
                >
                  Find Tennis Classes Near Me
                </Button>
                <Button onClick={handelBookPackageClicked} className=" text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-green-600 hover:text-green-600 transition-all">
                  View Gilbert Tennis Packages
                </Button>
              </div>

              {/* Local SEO Keywords */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="text-sm text-gray-500">Popular searches:</span>
                <Link href="/sports/tennis" className="text-sm text-green-600 hover:underline">tennis lessons gilbert az</Link>
                <span className="text-gray-300">•</span>
                <Link href="/book-now/courses/junior-beginners-gilbert" className="text-sm text-green-600 hover:underline">junior tennis gilbert</Link>
                <span className="text-gray-300">•</span>
                <Link href="/book-now/courses/adult-class-gilbert" className="text-sm text-green-600 hover:underline">adult tennis lessons near me</Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-100">
                <div>
                  <div className="text-3xl font-bold text-gray-900">80+</div>
                  <div className="text-sm text-gray-500">Local Players</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-500">Google Reviews</div>
                </div>
              </div>
            </div>

            {/* Location Map Component */}
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1">
              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-gray-900">
                      Gilbert Regional Park
                    </div>
                    <div className="mt-2 text-base leading-relaxed text-gray-600">
                      <div>3005 E Queen Creek Rd</div>
                      <div>Gilbert, AZ 85298</div>
                      <div>United States</div>
                    </div>
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                    <MapPinIcon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    Gilbert
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    Outdoor courts
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    Parking
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="h-10 rounded-full bg-green-600 px-5 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition">
                    Get Directions
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 bg-white p-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <iframe
                    title="Gilbert Regional Park Tennis Courts Map"
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=Gilbert%20Regional%20Park%2C%203005%20E%20Queen%20Creek%20Rd%2C%20Gilbert%2C%20AZ%2085298%2C%20United%20States&output=embed"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-gray-50 sticky top-0 z-10 backdrop-blur-md bg-white/90 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'programs', label: 'Tennis Programs Gilbert', icon: TrophyIcon },
              { id: 'locations', label: 'Tennis Courts Near Me', icon: MapPinIcon },
              { id: 'WhyChooseUs', label: 'Why Choose Us', icon: UsersIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'programs' | 'locations' | 'WhyChooseUs')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      {activeTab === 'programs' && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Best Tennis Programs in Gilbert, AZ
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find the perfect tennis class for your skill level — from beginners to tournament players
              </p>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${selectedCategoryId === null
                  ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                All Gilbert Tennis Programs
              </button>
              {initialCategories.map((cat: Category) => (
                <button
                  key={cat.categoryId}
                  onClick={() => setSelectedCategoryId(cat.categoryId)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${selectedCategoryId === cat.categoryId
                    ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {cat.categoryName} in Gilbert
                </button>
              ))}
            </div>

            {/* Course Grid */}
            <div className="space-y-20">
              {groupedCourses.map(([categoryName, { courses: courseList }]: [string, { courses: Course[]; order: number }]) => (
                <div key={categoryName}>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">{categoryName} in Gilbert</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-green-600 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courseList.map((course: Course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onViewDetails={() => handleViewDetails(course)}
                        onBookNow={() => handleBookNow(course.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Locations Section with Multiple Maps */}
      {activeTab === 'locations' && (
        <section className="py-24 px-6 lg:px-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <section id="locations" className="mx-auto max-w-7xl">
              {/* Heading */}
              <div className="grid gap-8 md:grid-cols-12 md:items-end">
                <h2 className="text-4xl md:text-4xl font-extrabold leading-tight md:col-span-5 text-gray-900">
                  Tennis Courts <span className="text-green-600">Near You</span> in Gilbert & Phoenix
                </h2>
                <p className="text-lg md:text-xl leading-relaxed text-gray-600 md:col-span-7">
                  Find <strong>tennis lessons near me</strong> at two convenient locations.
                  Each facility has indoor/outdoor courts with free parking.
                </p>
              </div>

              {/* Cards */}
              <div className="mt-14 grid gap-6 md:grid-cols-2">
                {/* Gilbert Location Card */}
                <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1">
                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-gray-900">
                          Gilbert Regional Park Tennis Center
                        </div>
                        <div className="mt-2 text-base leading-relaxed text-gray-600">
                          <div>3005 E Queen Creek Rd</div>
                          <div>Gilbert, AZ 85298</div>
                          <div>Open 7 days 6AM-10PM</div>
                        </div>
                      </div>
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <MapPinIcon className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                        Gilbert
                      </span>
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                        Regional park
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href="https://maps.google.com/?q=Gilbert+Regional+Park+Tennis+Courts"
                        target="_blank"
                        className="h-10 rounded-full bg-green-600 px-5 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition inline-flex items-center"
                      >
                        Get Directions
                      </a>
                      <Link
                        href="/tennis-gilbert"
                        className="h-10 rounded-full border border-gray-300 px-5 text-base font-semibold text-gray-800 hover:bg-gray-100 transition inline-flex items-center"
                      >
                        Gilbert Programs
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 bg-white p-3">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                      <iframe
                        title="Gilbert Regional Park Tennis Courts Map"
                        className="h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src="https://www.google.com/maps?q=Gilbert%20Regional%20Park%20Tennis%20Courts%2C%203005%20E%20Queen%20Creek%20Rd%2C%20Gilbert%2C%20AZ%2085298&output=embed"
                      ></iframe>
                    </div>
                  </div>
                </div>

                {/* Phoenix Location Card */}
                <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1">
                  <div className="p-7">

                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-gray-900">
                          Rose Mofford Sports Complex
                        </div>

                        <div className="mt-2 text-base leading-relaxed text-gray-600">
                          <div>9833 N 25th Ave</div>
                          <div>Phoenix, AZ 85021</div>
                          <div>United States</div>
                        </div>
                      </div>

                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                        Phoenix
                      </span>
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                        Outdoor courts
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button className="h-10 rounded-full bg-green-600 px-5 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition">
                        View
                      </button>

                      <a
                        href="/tennis-phoenix"
                        className="h-10 rounded-full border border-gray-300 px-5 text-base font-semibold text-gray-800 hover:bg-gray-100 transition"
                      >
                        See programs
                      </a>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 bg-white p-3">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                      <iframe
                        title="Rose Mofford Sports Complex Map"
                        className="h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src="https://www.google.com/maps?q=Rose%20Mofford%20Sports%20Complex%2C%209833%20N%2025th%20Ave%2C%20Phoenix%2C%20AZ%2085021%2C%20United%20States&output=embed"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      )}

      {/* Philosophy Section */}
      {activeTab === 'WhyChooseUs' && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Who We Are */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-6">
                  Best Tennis Coaching in Gilbert with European Philosophy
                </h2>
                <div className="prose prose-lg text-gray-600">
                  <p className="mb-4">
                    <span className="font-bold text-gray-900">Team Hippa</span> is the <strong>top-rated tennis academy in Gilbert</strong>,
                    bringing European coaching expertise to Arizona. Our certified coaches have helped hundreds of local
                    players improve their game.
                  </p>

                  <br />
                  <p>

                    Team Hippa is a high-level tennis academy based in Phoenix, Arizona, built by a team of certified, internationally experienced coaches. Known for our modern training methods and strong European coaching philosophy, we’ve helped players of all ages grow their game through a balanced focus on technique, fitness, and mental strength.  We offer the best tennis lessons for kids, adults, and seniors near you. After success in the Phoenix area, we’re excited to expand into Gilbert, bringing our proven programs to Gilbert Regional Park. Whether you’re just starting out or competing at a high level, our mission is to provide the structure, flexibility, and support needed to help every player reach their full potential. Looking for tennis lessons in Gilbert, Arizona?. Our academy offers tennis training for all ages and levels — including new tennis programs at Gilbert Regional Park.
                  </p>
                  <br />
                  <p>
                    Team Hippa offer the <strong>tennis lessons for all ages and levels near you</strong>.
                  </p>
                </div>
              </div>
              <div className="relative h-96">
                <Image
                  src="/images/coaching-philosophy.jpg"
                  alt="Tennis coaching in Gilbert Arizona"
                  fill
                  className="object-cover rounded-3xl"
                />
              </div>
            </div>

            {/* Philosophy Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-20">
              {[
                {
                  title: "Beginner to Advanced",
                  description: "Tennis lessons for all levels in Gilbert - from first-time players to tournament competitors.",
                  icon: TrophyIcon
                },
                {
                  title: "Kids & Adult Classes",
                  description: "Junior tennis programs and adult tennis lessons at Gilbert locations near you.",
                  icon: UsersIcon
                },
                {
                  title: "Community & Fun",
                  description: "More than just tennis lessons, we build a welcoming community for players of all ages in Gilbert. Join us for fun events, social mixers, and friendly competitions that make tennis enjoyable for everyone.",
                  icon: UsersIcon
                },
                {
                  title: "Flexible Scheduling",
                  description: "Book tennis courts and lessons in Gilbert when it works for you. No long-term contracts. We don’t lock players into rigid 8-week sessions or fixed times. With Team Hippa, you can:Purchase class packages at a discounted rate Use class credits to book sessions on your own schedule Train when it works for you, without sacrificing consistency This flexible structure is ideal for busy families, students, and adult players who want to stay active without the pressure of a fixed schedule.",
                  icon: ClockIcon
                },
                {
                  title: "European Coaching Philosophy, Right Here in Gilbert",
                  description: "Led by a team of highly educated, certified coaches, Team Hippa brings a European coaching philosophy focused on long-term player development, technical excellence, and a positive, competitive environment. Whether you’re picking up a racket for the first time or training for your next tournament, our mission is to provide the highest-quality tennis instruction in Gilbert.",
                  icon: TrophyIcon
                },

                {
                  title: "Proven Track Record in Phoenix",
                  description: "After years of success in the Phoenix area, we’re excited to bring our proven tennis programs to Gilbert. Our coaches have helped hundreds of local players improve their game, and we can’t wait to do the same for the Gilbert community.",
                  icon: TrophyIcon
                },

              ].map((item, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Programs Slider */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Tennis Programs in Gilbert
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Most booked tennis classes near you in Gilbert
            </p>
          </div>

          <Swiper
            slidesPerView={1}
            spaceBetween={24}
            loop={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            modules={[Navigation, Autoplay, Pagination]}
            className="w-full pb-12"
          >
            {PROGRAMS_MASTER.map((program, index) => (
              <SwiperSlide key={index}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={program.img}
                      alt={`${program.title} tennis lessons Gilbert AZ`}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{program.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{program.description}</p>
                    <Link
                      href={`${program.slug}`}
                      className="text-green-600 font-semibold text-sm hover:text-green-700 inline-flex items-center gap-1"
                    >
                      Book Tennis Classes →
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Camps, Tournaments & Coming Soon */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tennis Camps & Tournaments in Gilbert
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Competitive events, seasonal camps, and elite development opportunities for players in Gilbert.
            </p>
          </div>

          {/* Main Cards */}
          <div className="grid lg:grid-cols-2 gap-10 mb-20">

            {/* Tennis Camps */}
            <div className="group relative bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-10 text-white overflow-hidden hover:scale-[1.02] transition duration-300">

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <TrophyIcon className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold">
                  Tennis Camps in Gilbert
                </h3>
              </div>

              <p className="text-green-100 mb-8 leading-relaxed">
                Seasonal tennis camps designed for juniors and competitive players.
                Our Gilbert camps focus on technical development, match play,
                athletic training, and confidence building in a structured,
                high-energy environment.
              </p>

              <ul className="space-y-3 text-green-100 mb-10">
                <li>✔ Half-day & full-day options</li>
                <li>✔ Beginner to tournament-level training</li>
                <li>✔ Small group, high-quality coaching</li>
              </ul>

              <Link
                href="/camps"
                className="inline-block w-full bg-white text-green-600 py-4 rounded-xl font-semibold text-center hover:bg-green-50 transition"
              >
                Explore All Tennis Camps →
              </Link>
            </div>


            {/* Tennis Tournaments */}
            <div className="group relative bg-gray-900 rounded-3xl p-10 text-white hover:scale-[1.02] transition duration-300">

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-green-600/30 rounded-2xl flex items-center justify-center">
                  <CalendarIcon className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold">
                  Tennis Tournaments in Gilbert
                </h3>
              </div>

              <p className="text-gray-300 mb-8 leading-relaxed">
                Compete in professionally organized tournaments right here in Gilbert.
                Designed for juniors and adults looking to test their skills in
                a competitive yet supportive environment.
              </p>

              <ul className="space-y-3 text-gray-400 mb-10">
                <li>✔ Junior & adult divisions</li>
                <li>✔ Structured competitive formats</li>
                <li>✔ Local and sanctioned events</li>
              </ul>

              <Link
                href="/tournaments"
                className="inline-block w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-center hover:bg-green-700 transition"
              >
                View Tournament Schedule →
              </Link>
            </div>
          </div>


          {/* Coming Soon Section */}
          <div className="bg-gray-50 rounded-3xl p-12 text-center max-w-4xl mx-auto">

            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Coming Soon to Gilbert
            </h3>

            <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
              We’re expanding our tennis programs in Gilbert with new competitive leagues,
              specialty clinics, and performance training experiences launching soon.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 mb-10 text-left">
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="font-semibold text-gray-900 mb-2">Tennis programs for adults and juniors of all levels</div>
                <p className="text-sm text-gray-600">From beginner clinics to advanced training groups.</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="font-semibold text-gray-900 mb-2">Competitive Leagues</div>
                <p className="text-sm text-gray-600">Structured match play opportunities for all levels.</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="font-semibold text-gray-900 mb-2">Social clinics</div>
                <p className="text-sm text-gray-600">Fun, casual tennis sessions for all skill levels.</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="font-semibold text-gray-900 mb-2">Social clinics</div>
                <p className="text-sm text-gray-600">Fun, casual tennis sessions for all skill levels.</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="font-semibold text-gray-900 mb-2">High-performance training for competitive youth</div>
                <p className="text-sm text-gray-600">Advanced training for young athletes aiming to compete at higher levels.</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="font-semibold text-gray-900 mb-2">Private and semi-private tennis lessons</div>
                <p className="text-sm text-gray-600">Personalized instruction tailored to your skill level and goals.</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="font-semibold text-gray-900 mb-2">Pickleball classes and open play</div>
                <p className="text-sm text-gray-600">Learn pickleball skills or play casually with others in Gilbert.</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="font-semibold text-gray-900 mb-2">Tournaments and Match-Play opportunities</div>
                <p className="text-sm text-gray-600">Compete in organized tournaments and casual match-play events in Gilbert.</p>
              </div>



            </div>



          </div>

        </div>
      </section>


      {/* CTA Section */}
      <section className="relative bg-gray-900 py-24">
        <div className="absolute inset-0 bg-[url('/images/cta-bg.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent"></div>

        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Contact Us to Get Free Guidence for Tennis Lessons Near You in Gilbert
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join 80+ local players at Gilbert top-rated tennis academy.
            Book your first lesson today!
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handelContactUsClicked}
              className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all hover:shadow-xl hover:shadow-green-600/25"
            >
              Contact US
            </Button>
            <Button className="bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold backdrop-blur-sm border border-white/20 hover:bg-white/20 transition">
              Call Us:(+1)602-341-3361
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-400">
            <span>✓ Gilbert Top-Rated</span>
            <span>✓ 4.9★ Google Reviews</span>
            <span>✓ 80+ Local Students</span>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Our Philosophy</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              European Coaching Excellence in Gilbert
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We bring decades of European tennis methodology to Arizona, focusing on long-term player development
            </p>
          </div>

          {/* Main Philosophy Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/uploads/Team _Hippa_Method.png"
                alt="European tennis coaching philosophy in Gilbert"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <div className="text-2xl font-bold mb-2">Team Hippa Method</div>
                <div className="text-white/80">A long-standing track record of proven results</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">The European Difference</h3>
                <p className="text-gray-600 leading-relaxed">
                  Unlike traditional tennis academies that focus on quick wins, our <strong>European coaching philosophy</strong> emphasizes
                  <strong> long-term player development</strong>. We build champions from the ground up—starting with proper technique,
                  footwork, and mental strength before moving to advanced competition.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-6 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600 mb-2"> Proven Track Record</div>
                  <div className="text-gray-700 font-medium">A long-standing track record of proven results</div>
                  <div className="text-sm text-gray-500">in Arizona</div>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">Coach Ratio</div>
                  <div className="text-sm text-gray-500">Personal attention</div>
                </div>
              </div>
            </div>
          </div>

          {/* Philosophy Pillars */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">The Four Pillars of Our Philosophy</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icons: <SparkleIcon className="w-8 h-8" />,
                  title: "Technical Foundation",
                  description: "Master proper technique before power. We build muscle memory through repetition and precision."
                },
                {
                  icon: <ClockIcon className="w-8 h-8" />,
                  title: "Mental Toughness",
                  description: "Develop focus, resilience, and emotional control through guided match situations."
                },
                {
                  icon: <UsersIcon className="w-8 h-8" />,
                  title: "One Coach Journey",
                  description: "Work with the same dedicated coach for years, building trust and continuity."
                },
                {
                  icon: <TrophyIcon className="w-8 h-8" />,
                  title: "Competition Ready",
                  description: "Gradual progression from practice to tournament play with confidence."
                }
              ].map((pillar, index) => (
                <div key={index} className="bg-white border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                    {pillar.icon}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{pillar.title}</h4>
                  <p className="text-gray-600 text-sm">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Block */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-white mb-20">
            <div className="max-w-3xl mx-auto text-center">
              <svg className="w-12 h-12 mx-auto mb-6 text-white/60" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-4c0-1.1.9-2 2-2V8z" />
              </svg>
              <p className="text-2xl font-medium leading-relaxed mb-6">
                European coaching isnt just about tennis—its about developing character, discipline, and a love for the game that lasts a lifetime. We are not just building players; we are building people.
              </p>
              <div>
                <div className="font-bold text-xl">Team Hippa</div>
                <div className="text-green-200">Head Coach, Certified European Professional</div>
              </div>
            </div>
          </div>

          {/* Approach Breakdown */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Junior Players (Ages 4-17)</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Progressive skill development from red ball to yellow ball</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Fun, engaging sessions that build love for the game</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Tournament pathway for competitive juniors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>College recruitment guidance for advanced players</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Adult Players (18+)</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Technique refinement for consistent improvement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Tactical awareness and match strategy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Fitness integration tailored to tennis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Social play and league participation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Certifications 
          <div className="mt-16 pt-16 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Our Coaches Are Certified By</h3>
            <div className="flex flex-wrap justify-center gap-8">
              {["USPTA", "PTR", "ITF", "European Tennis Association"].map((cert, index) => (
                <div key={index} className="bg-gray-100 px-6 py-3 rounded-full text-gray-700 font-medium">
                  {cert}
                </div>
              ))}
            </div>
          </div>
          */}
        </div>
        
      </section>

      <section className="bg-gray-50 py-12 sm:py-16 md:py-20 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-green-800 leading-snug">
            Why the{" "}
            <span className="text-green-600">
              European Coaching Philosophy
            </span>{" "}
            Builds Champions
          </h2>
          <p className="mt-4 text-lg text-gray-600 font-semibold max-w-3xl mx-auto">
            Europe has produced some of the best tennis players on the planet.
            But what differs European tennis from American?
          </p>
        </div>

        {/* Redesigned Content Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* Card 1 */}
          <div className="relative bg-white border border-green-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
            <span className="absolute -top-6 left-6 text-7xl text-green-200 font-serif">
              “
            </span>
            <p className="text-gray-700 leading-relaxed mt-6">
              Regarding producing world-class tennis players, Europe has
              consistently led the way. From Rafael Nadal to Novak Djokovic, the
              continent has developed elite athletes known for their technical
              precision, mental toughness, and strategic play. But what exactly
              makes the{" "}
              <span className="font-semibold text-green-700">
                European tennis coaching philosophy
              </span>
              so effective — and why are we bringing it to our new{" "}
              <span className="font-semibold text-green-700">
                tennis academy in Gilbert, Arizona?
              </span>
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
            <span className="absolute -top-6 left-6 text-7xl text-green-200 font-serif">
              “
            </span>
            <p className="text-gray-700 leading-relaxed mt-6">
              At its core, European coaching emphasizes{" "}
              <span className="font-semibold text-green-700">
                long-term player development over short-term results
              </span>
              . Instead of pushing players into early competition, coaches focus
              on foundational skills — footwork, consistency, shot selection —
              and gradually build from there. One of the defining
              characteristics of this approach is the{" "}
              <span className="font-semibold text-green-700">
                strong coach-player relationship
              </span>
              , often formed by working with{" "}
              <span className="font-semibold text-green-700">
                one dedicated coach
              </span>
              over multiple years.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative bg-green-600 rounded-3xl p-8 text-white shadow-sm hover:shadow-md transition">
            <span className="absolute -top-6 left-6 text-7xl text-white/40 font-serif">
              “
            </span>
            <p className="leading-relaxed mt-6">
              Another hallmark of{" "}
              <span className="font-semibold">
                European-style junior tennis training
              </span>
              is a structured but flexible training model. Group sizes tend to
              be smaller, allowing for individualized attention, and coaches act
              as long-term mentors, not just instructors. At our{" "}
              <span className="font-semibold">
                tennis academy in Gilbert
              </span>,
              we embrace this mindset by designing sessions based on a player’s
              age, experience, and goals. Rather than rigid schedules, we offer
              flexible training packages so athletes — and parents — can choose
              when and how often to train. This freedom supports consistency and
              avoids burnout, especially for busy families.
            </p>
          </div>

          {/* Card 4 */}
          <div className="relative bg-white border border-green-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
            <span className="absolute -top-6 left-6 text-7xl text-green-200 font-serif">
              “
            </span>
            <p className="text-gray-700 leading-relaxed mt-6">
              Mental development is equally important. The{" "}
              <span className="font-semibold text-green-700">
                European coaching model
              </span>{" "}
              emphasizes emotional maturity, focus, and internal motivation.
              Through match-style drills, guided pressure situations, and
              strategic game play, players build the skills needed to compete
              confidently and independently. It’s an approach that develops not
              only great players, but strong individuals.
            </p>
          </div>

          {/* Final Full Width Card */}
          <div className="relative bg-white border-2 border-green-200 rounded-3xl p-10 shadow-md md:col-span-2">
            <span className="absolute -top-6 left-8 text-7xl text-green-300 font-serif">
              “
            </span>
            <p className="text-gray-700 leading-relaxed mt-6 text-lg">
              At <span className="font-semibold text-green-700">Team Hippa</span>, we bring
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
          </div>

        </div>
      </section>

    </>
  );
};

export default TennisGilbertClient;