// components/CourseCard.tsx

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Button } from "@/app/components/Button";
import "./styles.css";
export interface Course {
  id: number;
  name: string;
  sportName: string;
  shortDescription: string;
  basePriceInfo: string;
  description: string;
  imagePaths: string[] | null;
  isActive: boolean;
}

interface CourseCardProps {
  course: Course;
   onBookNow: (courseId: number) => void;
  onNavigate: (courseId: number) => void;
}

const TennisCourseCard: React.FC<CourseCardProps> = ({
  course,
  onBookNow,
  onNavigate,
}) => {
    const imageUrls = course.imagePaths || [];
    const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-1 transition-transform duration-300">
          <div className="relative">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="h-48 w-full main-swiper"
            >
              {(imageUrls.length > 0
                ? imageUrls
                : ["https://placehold.co/600x400/818cf8/ffffff?text=Tennis"]
              ).map((url, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={url}
                    alt={`Slide ${index + 1}`}
                    className="h-48 w-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
    
            {/* Slide count shown below */}
            <span className="text-xs text-white mt-1 text-center bg-black/70 flex justify-center items-center w-fit rounded-full py-1 px-4 absolute right-6 bottom-6 z-[9]">
              {activeIndex + 1} / {imageUrls.length}
            </span>
          </div>
          <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-semibold text-black line-clamp-1">
              {course.name}
            </h3>
            <p className="mt-2 text-base sm:text-lg text-gray-600 font-normal line-clamp-2">
              {course.shortDescription}
            </p>
           
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
              <span className="text-lg font-bold text-black">
                {course.basePriceInfo || "Contact for Price"}
              </span>
              <div className="flex justify-between gap-2">
                <Button
                  onClick={() => onNavigate(course.id)}
                  className="!text-[#b0db72] hover:!text-white bg-transparent border border-[#b0db72] w-full whitespace-nowrap"
                >
                  View Details
                </Button>
                <Button
                  onClick={() => onBookNow(course.id)}
                  className="text-white px-4 py-2 rounded w-full whitespace-nowrap"
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </section>
  );
};

export default TennisCourseCard;
