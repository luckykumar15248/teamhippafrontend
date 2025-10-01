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
    <div className="bg-white text-gray-800 min-h-screen py-10 px-4 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <p className="text-base sm:text-lg text-black font-medium">
            Courses /{" "}
            <span className="text-lg text-[#b0db72] font-bold">{course.sportName}</span>
          </p>
          <h1 className="text-4xl font-bold mt-4 text-black mb-2">{course.name}</h1>
          <p className="text-base sm:text-lg text-gray-600 font-normal">{course.shortDescription}</p>
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
              className="mySwiper2 w-full h-[500px] rounded-xl overflow-hidden border border-gray-300 custom-thumb"
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
                      className="w-full h-28 object-cover rounded-xl border border-gray-300 "
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* Course Info */}
          <div className="space-y-2 lg:w-[40%]">
            <h3 className="text-2xl font-bold text-[#b0db72] mb-2">Price : $ {course.basePriceInfo}</h3>
            <p className="text-base sm:text-lg text-gray-600 font-normal">Inclusive of all taxes</p>

            <div className="bg-white p-6 rounded-xl border border-[#b0db72] shadow-md">
              <h3 className="text-xl font-semibold mb-4">Course Info</h3>
              <ul className="space-y-2 text-base sm:text-lg text-gray-600 font-normal">
                <li>
                  <strong>Sport:</strong> <span className="text-base">{course.sportName}</span>
                </li>
                <li>
                  <strong>Duration:</strong> <span className="text-base">{course.duration}</span>
                </li>
                <li>
                  <strong>Status:</strong>{" "}
                  <span className="text-[#b0db72] text-base">Open for Booking</span>
                </li>
              </ul>

              <Button
                onClick={() => {
                  toast.info("Redirecting to booking page...");
                  router.push(`/booking/course/${course.id}`);
                }}
                className="mt-6 w-full text-white font-bold py-3 px-6 shadow transition duration-200"
              >
                Book This Course
              </Button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white text-gray-800 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="p-6 rounded-xl border border-[#b0db72]">
              <h2 className="text-2xl font-semibold !text-black mb-3">About this Course</h2>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
