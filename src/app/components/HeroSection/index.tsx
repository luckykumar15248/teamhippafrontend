"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import { useState } from "react";
import { SLIDES_IMG } from "@/untils/constant";
import { Button } from "@/app/components/Button";
import "./styles.css";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const handelBookNow = () => {
    router.push("/course-categories");
  };
  return (
    <>
      <section className="px-0 py-7">
        <Swiper
          loop={true}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          speed={200}
          spaceBetween={20}
          centeredSlides={true}
          slidesPerView={1.4}
          navigation={true}
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination, Autoplay]}
          className="custom-swiper"
        >
          {SLIDES_IMG.map((slide, i) => (
            <SwiperSlide key={i}>
              <div
                className={`relative rounded-4xl overflow-hidden transition-transform duration-500 ${
                  i === activeIndex ? "scale-100" : "scale-100"
                }`}
              >
                <Image
                  src={slide.image}
                  alt={`Slide ${i + 1}`}
                  width={1200}
                  height={550}
                  className="w-full h-[550px] object-fill rounded-4xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent p-6 text-white flex flex-col justify-center">
                  <h3 className="text-3xl font-bold mb-2">{slide.heading}</h3>
                  <p className="text-lg font-medium mb-4">{slide.subtext}</p>
                  <Button
                    onClick={handelBookNow}
                    className="text-white px-4 py-2 rounded w-fit"
                  >
                    {slide.buttonText}
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </>
  );
}
