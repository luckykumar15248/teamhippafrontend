"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Button } from "@/app/components/Button";

interface Course {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  sportName: string;
  description: string;
  duration: string;
  basePriceInfo: string;
  imagePaths: string[];
}

export default function CourseDetailClient({ course }: { course: Course }) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen py-10 px-4 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <p className="text-base sm:text-lg text-black dark:text-gray-300 font-medium">
            Courses /{" "}
            <span className="text-lg text-[#b0db72] font-bold dark:text-[#9acd50]">{course.sportName}</span>
          </p>
          <h1 className="text-4xl font-bold mt-4 text-black dark:text-white mb-2">{course.name}</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-normal">{course.shortDescription}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Swiper Image Gallery */}
          <div className="space-y-4 lg:w-[60%]">
            <Swiper
              loop={true}
              spaceBetween={10}
              navigation={true}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              modules={[FreeMode, Navigation, Thumbs]}
              className="mySwiper2 w-full h-[500px] rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 custom-thumb"
            >
              {course.imagePaths.map((url, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={url}
                    alt={`Course image ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {course.imagePaths.length > 1 && (
              <Swiper
                onSwiper={setThumbsSwiper}
                loop={true}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="mySwiper"
              >
                {course.imagePaths.map((url, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-28 object-cover rounded-xl border border-gray-300 dark:border-gray-600"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* Course Info */}
          <div className="space-y-2 lg:w-[40%]">
            <h3 className="text-2xl font-bold text-[#b0db72] dark:text-[#9acd50] mb-2">Price : $ {course.basePriceInfo}</h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-normal">Inclusive of all taxes</p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-[#b0db72] dark:border-[#7cb342] shadow-md dark:shadow-gray-900">
              <h3 className="text-xl dark:text-white font-semibold mb-4">Course Info</h3>
              <ul className="space-y-2 text-base sm:text-lg text-gray-600 dark:text-gray-300 font-normal">
                <li>
                  <strong className="dark:text-white">Sport:</strong> <span className="text-base dark:text-gray-300">{course.sportName}</span>
                </li>
                <li>
                  <strong className="dark:text-white">Duration:</strong> <span className="text-base dark:text-gray-300">{course.duration}</span>
                </li>
                <li>
                  <strong className="dark:text-white">Status:</strong>{" "}
                  <span className="text-[#b0db72] dark:text-[#9acd50] text-base">Open for Booking</span>
                </li>
              </ul>

              <Button
                onClick={() => {
                  toast.info("Redirecting to booking page...");
                  router.push(`/booking/course/${course.id}`);
                }}
                className="mt-6 w-full text-white font-bold py-3 px-6 shadow transition duration-200 bg-[#b0db72] hover:bg-[#9acd50] dark:bg-[#7cb342] dark:hover:bg-[#64a506]"
              >
                Book This Course
              </Button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="p-6 rounded-xl border border-[#b0db72] dark:border-[#7cb342] bg-white dark:bg-gray-800">
              <h2 className="text-2xl font-semibold text-black dark:text-white mb-3">About this Course</h2>
              <div
                className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 prose-headings:dark:text-white prose-strong:dark:text-white prose-li:dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}