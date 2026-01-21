'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "./styles.css";

// Types
interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const HeroSlider = () => {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const swiperRef = useRef<SwiperCore | null>(null);

    // Fetch slides from API
    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await axios.get(`${apiUrl}/api/public/content/hero-slides`);
                setSlides(res.data);
            } catch (err) {
                console.error("Failed to load hero slides", err);
                // Fallback data for demonstration if API fails or is empty
                setSlides([
                   {
                       id: 1,
                       title: "Welcome to Team Hippa",
                       subtitle: "Elite Tennis & Pickleball Coaching",
                       imageUrl: "https://placehold.co/1200x550/1a202c/ffffff?text=Team+Hippa",
                       ctaText: "Book Now",
                       ctaLink: "/book-now"
                   },
                   {
                       id: 2,
                       title: "Professional Coaching",
                       subtitle: "Learn from certified professionals",
                       imageUrl: "https://placehold.co/1200x550/2d3748/ffffff?text=Professional+Coaching",
                       ctaText: "View Programs",
                       ctaLink: "/programs"
                   },
                   {
                       id: 3,
                       title: "Youth Summer Tennis Camp 2026",
                       subtitle: "Find the best summer camps in the USA 2026",
                       imageUrl: "https://placehold.co/1200x550/4a5568/ffffff?text=Youth+Summer+Camp",
                       ctaText: "Register Now",
                       ctaLink: "/summer-camp"
                   }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSlides();
    }, []);

    // Initialize swiper with loop
    const handleSwiperInit = (swiper: SwiperCore) => {
        swiperRef.current = swiper;
    };

    if (isLoading) {
        return (
            <div className="w-full h-[400px] sm:h-[550px] bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center rounded-4xl">
                <div className="text-gray-500 dark:text-gray-400">Loading slides...</div>
            </div>
        );
    }

    if (slides.length === 0) return null;

    return (
        <section className="px-0 py-7">
            <Swiper
                // Loop is enabled - this automatically handles returning to first slide
                loop={true}
                // Speed and transitions
                speed={200}
                spaceBetween={20}
                centeredSlides={true}
                slidesPerView={1.4}
                // Autoplay with proper loop handling
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                    waitForTransition: true,
                }}
                // Responsive breakpoints
                breakpoints={{
                    320: {
                        slidesPerView: 1.1,
                        spaceBetween: 10,
                        centeredSlides: false,
                    },
                    640: {
                        slidesPerView: 1.2,
                        spaceBetween: 15,
                        centeredSlides: true,
                    },
                    768: {
                        slidesPerView: 1.3,
                        spaceBetween: 15,
                    },
                    1024: {
                        slidesPerView: 1.4,
                        spaceBetween: 20,
                    },
                }}
                // Navigation
                navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                    disabledClass: 'swiper-button-disabled',
                }}
                // Pagination
                pagination={{ 
                    clickable: true,
                    el: '.swiper-pagination',
                    type: 'bullets',
                }}
                // Modules
                modules={[Navigation, Pagination, Autoplay]}
                className="custom-swiper"
                onSwiper={handleSwiperInit}
                // This ensures loop works correctly
                onSlideChange={() => {
                    if (swiperRef.current) {
                        const swiper = swiperRef.current;
                        // Force loop to work properly
                        if (swiper.isEnd && !swiper.params.loop) {
                            swiper.slideTo(0, 600);
                        }
                    }
                }}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative rounded-4xl overflow-hidden transition-all duration-500 h-[400px] sm:h-[550px]">
                            {/* Background Image */}
                            <div className="relative w-full h-full">
                                <Image
                                    src={slide.imageUrl}
                                    alt={slide.title}
                                    fill
                                    className="object-cover sm:object-fill rounded-4xl"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                    priority={index === 0}
                                    quality={85}
                                />
                            </div>
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20 p-6 sm:p-8 md:p-10 text-white flex flex-col justify-center rounded-4xl">
                                <div className="max-w-2xl">
                                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-lg">
                                        {slide.title}
                                    </h3>
                                    {slide.subtitle && (
                                        <p className="text-base sm:text-lg md:text-xl font-medium mb-4 sm:mb-6 drop-shadow-md">
                                            {slide.subtitle}
                                        </p>
                                    )}
                                    {slide.ctaText && slide.ctaLink && (
                                        <a 
                                            href={slide.ctaLink}
                                            className="inline-flex items-center justify-center text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full w-fit bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base font-semibold min-h-[44px]"
                                        >
                                            {slide.ctaText}
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                className="ml-2 w-4 h-4 sm:w-5 sm:h-5" 
                                                viewBox="0 0 20 20" 
                                                fill="currentColor"
                                            >
                                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
                
                {/* Navigation Buttons */}
                <div className="swiper-button-next !text-white !bg-black/30 hover:!bg-black/50 !w-10 !h-10 sm:!w-12 sm:!h-12 !rounded-full transition-colors !right-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </div>
                <div className="swiper-button-prev !text-white !bg-black/30 hover:!bg-black/50 !w-10 !h-10 sm:!w-12 sm:!h-12 !rounded-full transition-colors !left-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </div>
                
                {/* Pagination Dots */}
                <div className="swiper-pagination !bottom-4"></div>
            </Swiper>
        </section>
    );
};

export default HeroSlider;