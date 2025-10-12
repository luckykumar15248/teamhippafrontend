"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import TennisCourseCard from "@/app/components/TennisCourseCard";
import FAQ from "@/app/components/FAQ";
import { Waitlist } from "@/app/components/WaitList";
import WaitlistForm from "@/app/components/WaitlistForm/WaitlistForm";

import SportsHeroSection from "@/app/components/SportsHeroSection";
import Image from "next/image";

interface Course {
  id: number;
  name: string;
  slug?: string;  // Optional slug field for navigation 
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
interface PickleballPageClientProps {
  pickleballCourses: Course[];
  categories: Category[];
  mappings: CourseCategoryMapping[];
  faqData: { question: string; answer: string }[];
  choiceItems: string[];
  instructionItems: string[];
  listItems: string[];
  offerItems: { title: string; description: string }[];
}

export default function PickleballPageClient({
  pickleballCourses,
  categories,
  mappings,
  faqData,
  choiceItems,
  instructionItems,
  listItems,
  offerItems,
}: PickleballPageClientProps) {
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
    const courseMap = new Map(pickleballCourses.map((c) => [c.id, c]));
    const groups: { [categoryName: string]: { courses: Course[]; order: number } } = {};

    mappings.forEach((mapping) => {
      const category = categories.find((c) => c.categoryId === mapping.categoryId);
      const course = courseMap.get(mapping.courseId);

      if (category && course) {
        if (!groups[category.categoryName]) {
          groups[category.categoryName] = {
            courses: [],
            order: category.displayOrder,
          };
        }
        if (!groups[category.categoryName].courses.some((c) => c.id === course.id)) {
          groups[category.categoryName].courses.push(course);
        }
      }
    });

    return Object.entries(groups).sort(([, a], [, b]) => a.order - b.order);
  }, [pickleballCourses, categories, mappings]);

  return (
    <>
      <SportsHeroSection
        bgImage="/images/pickleball.png"
        title="Pickleball Programs"
        description="Join the fastest-growing sport! Our pickleball programs are perfect for all ages, focusing on fun, strategy, and social play."
        showCallButton
      />

      <main className="py-12 px-6 lg:px-16 max-w-screen-2xl mx-auto">
        {groupedCourses.length ? (
          groupedCourses.map(([categoryName, { courses }]) => (
            <section key={categoryName} aria-labelledby={`category-${categoryName}`}>
              <h2 id={`category-${categoryName}`} className="text-3xl font-bold text-gray-900 mb-6">
                {categoryName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <TennisCourseCard
                    key={course.id}
                    course={course}
                    onBookNow={() => handleBookNow({ ...course, type: "course" })}
                     onNavigate={() => handleNavigate(course.slug || '')}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <section className="text-center py-16 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700">No Pickleball Courses Currently Available</h3>
            <p className="mt-2 text-base sm:text-lg text-gray-600">Please check back soon for new offerings!</p>
          </section>
        )}
      </main>

      {/* Your content sections */}

      <section className="bg-gray-100 text-gray-800 pt-4 sm:pt-8 md:pt-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="flex flex-col space-y-6">
            <p className="text-base text-[#b0db72] font-normal uppercase tracking-wide">Coaching</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">What is a Pickleball Academy?</h1>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              Unlike casual classes or drop-in play, a{" "}
              <span className="font-bold">pickleball academy</span> offers structured, progressive instruction—similar to what you&apos;d find in tennis, soccer, or martial arts academies.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              We are not just teaching technique—we are building players from the ground up with skill pathways, competitive prep, and community-based development.
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4">Key Features:</h3>
            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-700">
              {listItems.map((item, index) => <li key={index}>{item}</li>)}
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

      <section className="bg-gray-100 text-gray-800 pt-4 sm:pt-8 md:pt-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto flex flex-col-reverse md:grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="w-full flex justify-center items-center p-4 bg-[#b0db72] rounded-lg h-full">
            <Image
              src="/images/offerings.jpg"
              width={100}
              height={100}
              alt="coaching"
              className="rounded-lg shadow-lg w-full h-auto object-cover min-h-full"
            />
          </div>
          <div className="flex flex-col space-y-6">
            <p className="text-base sm:text-lg text-[#b0db72] font-normal uppercase tracking-wide">Offerings</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">What We Offer</h1>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              Team Hippa’s Pickleball Academy is designed to serve{" "}
              <span className="font-bold">all ages and skill levels,</span> from complete beginners to competitive players.
            </p>
            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-600 font-normal">
              {offerItems.map((item, index) => (
                <li key={index}>
                  <strong>{item.title}:</strong> {item.description}
                </li>
              ))}
            </ul>
            <h2 className="text-xl font-semibold mb-2">COMING SOON:</h2>
            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-600 font-normal">
              <li>Earn your official DUPR Rating through Team Hippa</li>
              <li>Online Platform to engage with the local pickleball community, schedule matches, ranking system for Team Hippa members</li>
              <li><strong>Online Community & Local Rankings:</strong> Connect, schedule matches, log scores</li>
              <li><strong>PPA/DUPR Ratings:</strong> Earn an official pickleball rating for tournaments</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 text-gray-800 pt-4 sm:pt-8 md:pt-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="flex flex-col space-y-6">
            <p className="text-base sm:text-lg text-[#b0db72] font-normal uppercase tracking-wide">Importance</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Why Pickleball Instruction Matters</h1>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              Whether you’re just getting started or trying to level up, structured coaching matters—in{" "}
              <span className="font-bold">every sport</span>.
            </p>
            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-600 font-normal">
              {instructionItems.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
          <div className="w-full flex justify-center items-center p-4 bg-[#b0db72] rounded-lg h-full">
            <Image
              src="/images/importance.jpg"
              width={100}
              height={100}
              alt="coaching"
              className="rounded-lg shadow-lg w-full h-auto object-cover min-h-full"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto flex flex-col-reverse md:grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="w-full flex justify-center items-center p-4 bg-[#b0db72] rounded-lg h-full">
            <Image
              src="/images/coaching.jpeg"
              width={100}
              height={100}
              alt="coaching"
              className="rounded-lg shadow-lg w-full h-auto object-cover min-h-full"
            />
          </div>
          <div className="flex flex-col space-y-6">
            <p className="text-base sm:text-lg text-[#b0db72] font-normal uppercase tracking-wide">Choice</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Why Team Hippa?</h1>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              <span className="font-bold">Team Hippa has delivered high-performance tennis coaching to athletes across the valley.</span> 
              Offers a modern training philosophy blending competitive tennis & professional pickleball.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              Pickleball is a fast, demanding, and strategic sport — and we bring that energy, structure, and community into <span className="font-bold">pickleball</span> in Gilbert.
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4">Our Strengths:</h3>
            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-600 font-normal">
              {choiceItems.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <FAQ title="The fastest growing Tennis Academy" subtitle="Feel free to ping us incase there is any doubts you have. Our team will love to help you out." data={faqData} />

      <Waitlist
        title="Interested in Joining?"
        subtitle=" Our spots fill up fast. Join the waitlist to be notified of openings!"
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
      />

      {isWaitlistOpen && <WaitlistForm sportName="Pickleball" onClose={() => setIsWaitlistOpen(false)} />}
    </>
  );
}
