// app/Summer-camp/SummerCampPageClient.tsx
'use client';

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import SportsHeroSection from '../../SportsHeroSection';
import FAQ from '../../FAQ';
import { Button } from '../../Button';
import WaitlistForm from '../../WaitlistForm/WaitlistForm';
import { Waitlist } from '../../WaitList';
import {
  SUMMER_CAMP_FAQS,
  PROGRAMS_MASTER,
  SCHEDULE,
  CAMP_FEATURES,
} from "@/untils/constant";
import router from "next/router";
import SummerCampShortDetails from '../../../components/SummerCampShortDetails/SummerCampShortDetails';

export default function SummerCampPageClient() {
  const [activeTab, setActiveTab] = useState('history');
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = 
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const facilities = [
    { src: "/images/courts-one.jpg", title: "Indoor Clay Courts" },
    { src: "/images/outdoor-tennis.jpg", title: "Outdoor Green Courts" },
    { src: "/images/gym-two.jpg", title: "High-Tech Training Arena" },
    { src: "/images/gym.jpg", title: "Fitness & Gym Area" },
  ];

  const handleClick = () => {
    router.push("/register");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderTabContent = () => {
    const baseClasses = "text-base leading-relaxed";
    const lightClasses = "text-gray-700";
    const darkClasses = "text-gray-300";
    
    switch (activeTab) {
      case 'history':
        return <p className={`${baseClasses} ${isDarkMode ? darkClasses : lightClasses}`}>
          Founded by tennis lovers dedicated to sharing their passion, our academy has been serving players for years.
        </p>;
      case 'mission':
        return <p className={`${baseClasses} ${isDarkMode ? darkClasses : lightClasses}`}>
          To empower players of all ages and skill levels to achieve their tennis goals with excellence.
        </p>;
      case 'value':
        return <p className={`${baseClasses} ${isDarkMode ? darkClasses : lightClasses}`}>
          Commitment to quality, fostering inclusivity, encouraging growth, and building a strong community through tennis.
        </p>;
      default:
        return null;
    }
  };

  return (
    <>
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Summer Tennis Camp 2026"
        description="Train with top coaches, improve your skills, and enjoy the Summer vibes."
        showCallButton
      />
      <SummerCampShortDetails />

      {/* Our Story Section */}
      <section className={`w-full py-4 sm:py-8 md:py-12 px-6 lg:px-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="mx-auto max-w-screen-2xl">
          <h2 className={`text-4xl sm:text-5xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Our Story
          </h2>
          <p className={`text-lg font-medium leading-relaxed mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Our Passion, Your Game
          </p>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
            <div className="lg:w-1/2 w-full">
              <p className={`text-base leading-relaxed mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Building a Community of Tennis Enthusiasts, One Swing at a Time
              </p>

              <p className={`text-base leading-relaxed mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                At our tennis academy, we are committed to helping players unlock their potential and love for the game through expert coaching and personalized training.
              </p>
              <p className={`text-base leading-relaxed mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                From beginners to seasoned players, we create a supportive environment that encourages growth, fosters friendships, and makes every swing a step closer to success.
              </p>

              {/* Tab Navigation */}
              <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} mb-6`}>
                <button
                  className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-colors duration-300 ${
                    activeTab === "history"
                      ? `${isDarkMode ? 'text-green-400 border-b-2 border-green-400' : 'text-[#b0db72] border-b-2 border-[#b0db72]'}`
                      : `${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-[#b0db72]'}`
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  History
                </button>
                <button
                  className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-colors duration-300 ${
                    activeTab === "mission"
                      ? `${isDarkMode ? 'text-green-400 border-b-2 border-green-400' : 'text-[#b0db72] border-b-2 border-[#b0db72]'}`
                      : `${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-[#b0db72]'}`
                  }`}
                  onClick={() => setActiveTab("mission")}
                >
                  Mission
                </button>
                <button
                  className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-colors duration-300 ${
                    activeTab === "value"
                      ? `${isDarkMode ? 'text-green-400 border-b-2 border-green-400' : 'text-[#b0db72] border-b-2 border-[#b0db72]'}`
                      : `${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-[#b0db72]'}`
                  }`}
                  onClick={() => setActiveTab("value")}
                >
                  Value
                </button>
              </div>

              {/* Tab Content */}
              <div className={`p-6 rounded-lg shadow-md border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                {renderTabContent()}
              </div>
            </div>

            {/* Right Column: Image */}
            <div className={`lg:w-1/2 w-full flex justify-center items-center p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-gradient-to-r from-green-900/30 to-green-700/20 border border-green-800/30' 
                : 'bg-[#b0db72]'
            }`}>
              <Image
                src="/images/our-story.png"
                alt="Man playing tennis at an academy"
                width={100}
                height={100}
                className="rounded-lg shadow-lg w-full h-auto object-cover max-h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Our Summer Camp? */}
      <section className={`py-12 px-6 lg:px-16 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800' 
          : 'bg-gradient-to-r from-[#b0db72] to-[#64a506]'
      } text-white`}>
        <div className="max-w-screen-xl mx-auto text-center">
          <h3 className="text-3xl sm:text-5xl font-semibold mb-8">
            Why Join Our Summer Camp?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {CAMP_FEATURES.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl shadow-md ${
                  isDarkMode 
                    ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700' 
                    : 'bg-white/10'
                }`}
              >
                <span className="text-4xl flex justify-center">
                  {feature.icon}
                </span>
                <h4 className="text-xl font-semibold mt-4">
                  {feature.title}
                </h4>
                <p className={`text-base sm:text-lg font-normal mt-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-100'
                }`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A Day at Our Summer Camp */}
      <section className={`w-full py-4 sm:py-8 md:py-12 px-6 lg:px-16 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="mx-auto max-w-screen-2xl">
          <h3 className={`text-4xl md:text-5xl font-bold text-center mb-14 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            A Day at Our Summer Camp
          </h3>

          <div className="relative">
            {/* Middle line */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 h-full w-1 ${
              isDarkMode 
                ? 'bg-gradient-to-b from-green-600 to-green-400' 
                : 'bg-gradient-to-b from-[#64a506] to-[#b0db72]'
            }`}></div>

            <div className="space-y-16">
              {SCHEDULE.map((item, index) => (
                <div key={index} className="relative flex items-center">
                  {/* Left side */}
                  {index % 2 === 0 ? (
                    <>
                      <div className="w-1/2 pr-8 text-right">
                        <h4 className={`text-xl font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.icon} {item.time} – {item.title}
                        </h4>
                        <p className={`text-base sm:text-lg mt-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {item.desc}
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md mx-auto z-10 ${
                        isDarkMode 
                          ? 'bg-green-600 text-white' 
                          : 'bg-[#64a506] text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="w-1/2"></div>
                    </>
                  ) : (
                    <>
                      <div className="w-1/2"></div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md mx-auto z-10 ${
                        isDarkMode 
                          ? 'bg-green-600 text-white' 
                          : 'bg-[#64a506] text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="w-1/2 pl-8">
                        <h4 className={`text-xl font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.icon} {item.time} – {item.title}
                        </h4>
                        <p className={`text-base sm:text-lg mt-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {item.desc}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="w-full">
          <h2 className={`text-4xl sm:text-5xl font-semibold text-center mb-12 ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            Facilities
          </h2>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1.2}
            centeredSlides={false}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              1024: { slidesPerView: 1.5 },
            }}
            className="pb-12 custome-slide"
          >
            {facilities.map((facility, index) => (
              <SwiperSlide key={index}>
                <div className="overflow-hidden shadow-lg group relative rounded-xl">
                  <Image
                    src={facility.src}
                    alt={facility.title}
                    width={800}
                    height={300}
                    className="!w-full !h-72 object-cover transform group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-xl">
                    <h3 className="text-white text-lg font-semibold">
                      {facility.title}
                    </h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Master Your Game Section */}
      <section className={`py-4 sm:py-8 md:py-12 px-6 lg:px-16 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="max-w-screen-2xl mx-auto">
          <h3 className={`text-4xl sm:text-5xl font-semibold text-center mb-2 ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            Master Your Game, Your Way
          </h3>
          <p className={`mb-6 leading-relaxed text-base sm:text-lg text-center font-normal ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            From Beginners to Pros, We Have the Perfect Tennis Coaching for Every Level and Goal!
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
                <div className={`rounded-xl shadow-md hover:shadow-lg transition overflow-hidden ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-white hover:bg-gray-50'
                }`}>
                  <Image
                    src={program.img}
                    alt={program.title}
                    width={400}
                    height={300}
                    className="w-full h-52 object-cover rounded-t-xl"
                  />
                  <div className="p-4">
                    <h4 className={`text-base font-semibold line-clamp-1 ${
                      isDarkMode ? 'text-white' : 'text-black'
                    }`}>
                      {program.title}
                    </h4>
                    <p className={`text-base sm:text-lg font-normal line-clamp-2 mt-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {program.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`bg-gradient-to-r py-12 sm:py-16 md:py-20 px-6 lg:px-16 text-center overflow-hidden ${
        isDarkMode 
          ? 'from-gray-800 to-gray-900' 
          : 'from-white to-gray-50'
      }`}>
        <div className="relative max-w-screen-xl mx-auto">
          <h3 className={`text-3xl sm:text-5xl font-semibold mb-6 capitalize ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            Book Our Summer Camp At{" "}
            <span className="relative">Teamhippa Academy</span>
          </h3>

          <p className={`text-base sm:text-lg md:text-xl font-light max-w-3xl mx-auto mb-8 leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join us at the Teamhippa Academy for an exceptional tennis training experience! Whether you are an adult or a child, and regardless of your current skill level, our Summer camps offer a premier opportunity to improve your game.
          </p>

          <div className="flex justify-center">
            <Button
              onClick={handleClick}
              className={`px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-[#64a506] hover:bg-[#559105] text-white'
              }`}
            >
              Register Now
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ and waitlist components */}
      <FAQ
        title="The fastest growing Tennis Academy"
        subtitle="Feel free to ping us if you have doubts. Our team will love to help!"
        data={SUMMER_CAMP_FAQS}
      />
      
      <Waitlist
        title="Interested in Joining?"
        subtitle="Our spots fill up fast. Join the waitlist!"
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
      />
      {isWaitlistOpen && (
        <WaitlistForm sportName="Summer Camp" onClose={() => setIsWaitlistOpen(false)} />
      )}
    </>
  );
}