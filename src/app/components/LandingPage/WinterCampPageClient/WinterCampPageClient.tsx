// app/winter-camp/WinterCampPageClient.tsx
'use client';


import "swiper/css";
import "swiper/css/pagination";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import React, { useState } from 'react';
import Image from 'next/image';
import SportsHeroSection from '../../../components/SportsHeroSection';
import FAQ from '../../../components/FAQ';

import WaitlistForm from '../../../components/WaitlistForm/WaitlistForm';
import { Waitlist } from '../../WaitList';
import WinterCampShortDetails from '../../../components/WinterCampShortDetails/WinterCampShortDetails';
import {
 WINTER_CAMP_FAQS,
  PROGRAMS_MASTER,
  SCHEDULE,
  CAMP_FEATURES,
} from "@/untils/constant";
import Link from "next/link";
export default function WinterCampPageClient() {
 // const [activeTab, , setActiveTab}] = useState('history');
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    const facilities = [
  { src: "/images/Freestone-Recreation-Center.jpg", title: "Freestone-Recreation-Center" },
  { src: "/images/Freestone-Recreation-Center-indor-tennis.jpg", title: "Indoor Courts" },
  { src: "/images/Freestone-Recreation-Center-outdoor-tennis-court.jpeg", title: "Outdoor Courts" },
  { src: "/images/gym-two.jpg", title: "High-Tech Training Arena" },
  { src: "/images/gym.jpg", title: "Fitness & Gym Area" },
];


  {/*
  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return <p className="text-base text-gray-700 leading-relaxed">Founded by tennis lovers dedicated to sharing their passion, our academy has been serving players for years.</p>;
      case 'mission':
        return <p className="text-base text-gray-700 leading-relaxed">To empower players of all ages and skill levels to achieve their tennis goals with excellence.</p>;
      case 'value':
        return <p className="text-base text-gray-700 leading-relaxed">Commitment to quality, fostering inclusivity, encouraging growth, and building a strong community through tennis.</p>;
      default:
        return null;
    }
  };*/}

  return (
    <>
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Winter Tennis Camp 2025"
        description="Train with top coaches, improve your skills, and enjoy the winter vibes."
        showCallButton
      />

      

      {/* Your camp info, schedule, amenities, FAQ, etc. 
      
      <section className="w-full bg-gray-white py-4 sm:py-8 md:py-12 px-6 lg:px-16">
                <div className="mx-auto max-w-screen-2xl">
                  <h2 className="text-4xl sm:text-5xl font-semibold text-black mb-3">
                    Our Story
                  </h2>
                  <p className="text-lg font-medium leading-relaxed text-gray-600 mb-8">
                    Our Passion, Your Game
                  </p>
      
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                    <div className="lg:w-1/2 w-full">
                      <p className="text-base text-gray-700 leading-relaxed mb-6">
                        Building a Community of Tennis Enthusiasts, One Swing at a
                        Time
                      </p>
      
                      <p className="text-base text-gray-700 leading-relaxed mb-6">
                        At our tennis academy, we’re committed to helping players
                        unlock their potential and love for the game through expert
                        coaching and personalized training.
                      </p>
                      <p className="text-base text-gray-700 leading-relaxed mb-8">
                        From beginners to seasoned players, we create a supportive
                        environment that encourages growth, fosters friendships, and
                        makes every swing a step closer to success.
                      </p>
      
                   
                      <div className="flex border-b border-gray-300 mb-6">
                        <span
                          className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-colors duration-300
                              ${
                                activeTab === "history"
                                  ? "text-[#b0db72] border-b-2 border-[#b0db72]"
                                  : "text-gray-600 hover:text-[#b0db72]"
                              }`}
                          onClick={() => setActiveTab("history")}
                        >
                          History
                        </span>
                        <span
                          className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-colors duration-300
                              ${
                                activeTab === "mission"
                                  ? "text-[#b0db72] border-b-2 border-[#b0db72]"
                                  : "text-gray-600 hover:text-[#b0db72]"
                              }`}
                          onClick={() => setActiveTab("mission")}
                        >
                          Mission
                        </span>
                        <span
                          className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-colors duration-300
                              ${
                                activeTab === "value"
                                  ? "text-[#b0db72] border-b-2 border-[#b0db72]"
                                  : "text-gray-600 hover:text-[#b0db72]"
                              }`}
                          onClick={() => setActiveTab("value")}
                        >
                          Value
                        </span>
                      </div>
      
                    
                      <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                        {renderTabContent()}
                      </div>
                    </div>
      
                    <div className="lg:w-1/2 w-full flex justify-center items-center p-4 bg-[#b0db72] rounded-lg">
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
              */}

              
              <WinterCampShortDetails />
              <section className="bg-white w-full bg-gray-white py-4 sm:py-8 md:py-12 px-6 lg:px-16">
                <div className="mx-auto max-w-screen-2xl">
                  <h3 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-14">
                    A Day at Our Winter Camp
                  </h3>
      
                  <div className="relative">
                    {/* Middle line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#64a506] to-[#b0db72]"></div>
      
                    <div className="space-y-16">
                      {SCHEDULE.map((item, index) => (
                        <div key={index} className="relative flex items-center">
                          {/* Left side */}
                          {index % 2 === 0 ? (
                            <>
                              <div className="w-1/2 pr-8 text-right">
                                <h4 className="text-xl font-semibold text-gray-900">
                                  {item.icon} {item.time} – {item.title}
                                </h4>
                                <p className="text-base sm:text-lg text-gray-600 mt-2">
                                  {item.desc}
                                </p>
                              </div>
                              <div className="w-10 h-10 bg-[#64a506] text-white rounded-full flex items-center justify-center shadow-md mx-auto z-10">
                                {index + 1}
                              </div>
                              <div className="w-1/2"></div>
                            </>
                          ) : (
                            <>
                              <div className="w-1/2"></div>
                              <div className="w-10 h-10 bg-[#64a506] text-white rounded-full flex items-center justify-center shadow-md mx-auto z-10">
                                {index + 1}
                              </div>
                              <div className="w-1/2 pl-8">
                                <h4 className="text-xl font-semibold text-gray-900">
                                  {item.icon} {item.time} – {item.title}
                                </h4>
                                <p className="text-base sm:text-lg text-gray-600 mt-2">
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
      
              <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
        Facilities
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side — Swiper Image Carousel */}
        <div className="w-full">
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
                        <div className="overflow-hidden shadow-lg group relative">
                          <Image
                            src={facility.src}
                            alt={facility.title}
                            width={800}
                            height={300}
                            className="!w-full !h-72 object-cover transform group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <h3 className="text-white text-lg font-semibold">
                              {facility.title}
                            </h3>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
        </div>

        {/* Right Side — Google Map & Contact Info */}
        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-lg h-[300px]">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.7544773498735!2d-111.76679708696534!3d33.364119980101165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872ba92dac3c8385%3A0x67a5fd75b68390bb!2sFreestone%20Recreation%20Center!5e0!3m2!1sen!2sin!4v1762349687500!5m2!1sen!2sin" width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Contact Us</h3>
            <p className="text-gray-600 mb-1">
              📍 <strong>Address:</strong> 1141 E Guadalupe Rd, Gilbert, AZ 85234, United States
            </p>
            <p className="text-gray-600 mb-1">
              📞 <strong>Phone:</strong> (+1) 602-341-3361
            </p>
            <p className="text-gray-600">
              ✉️ <strong>Email:</strong> info@teamhippa.com
            </p>
          </div>
        </div>
      </div>
    </section>
                    <section className="py-12 px-6 lg:px-16 bg-gradient-to-r from-[#b0db72] to-[#64a506] text-white">
                <div className="max-w-screen-xl mx-auto text-center">
                  <h3 className="text-3xl sm:text-5xl font-semibold mb-8">
                    Why Join Our Winter Camp?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {CAMP_FEATURES.map((feature, index) => (
                      <div
                        key={index}
                        className="p-6 bg-white/10 rounded-2xl shadow-md"
                      >
                        <span className="text-4xl flex justify-center">
                          {feature.icon}
                        </span>
                        <h4 className="text-xl font-semibold mt-4">
                          {feature.title}
                        </h4>
                        <p className="text-base sm:text-lg font-normal mt-2">
                          {feature.desc}
                        </p>
                      </div>
                    ))}
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
              <section className="bg-gradient-to-r bg-white py-12 sm:py-16 md:py-20 px-6 lg:px-16 text-center text-white overflow-hidden">
                <div className="relative max-w-screen-xl mx-auto">
                  <h3 className="text-black text-3xl sm:text-5xl font-semibold mb-6 capitalize">
                    Book Our Winter Camp At{" "}
                    <span className="relative">Teamhippa Academy</span>
                  </h3>
      
                  <p className="text-gray-600 text-base sm:text-lg md:text-xl font-light max-w-3xl mx-auto mb-8 leading-relaxed">
                    Join us at the Teamhippa Academy for an exceptional tennis
                    training experience! Whether you’re an adult or a child, and
                    regardless of your current skill level, our winter camps offer a
                    premier opportunity to improve your game.
                  </p>
      
                  <div className="flex justify-center">
                    
                      <div className="flex justify-center mt-10">
          <Link
            href="https://teamhippa.com/booking/camp/tennis-winter-camp"
            className="inline-block bg-[#64a506] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-[#538604] hover:shadow-xl transition-all duration-300"
          >
            Register Now
          </Link>
        </div>
                  </div>
                </div>
              </section>

      {/* FAQ and waitlist components */}
      <FAQ
        title="The fastest growing Tennis Academy"
        subtitle="Feel free to ping us if you have doubts. Our team will love to help!"
        data={WINTER_CAMP_FAQS}
      />
      
      <Waitlist
        title="Interested in Joining?"
        subtitle="Our spots fill up fast. Join the waitlist!"
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
      />
      {isWaitlistOpen && (
        <WaitlistForm sportName="Winter Camp" onClose={() => setIsWaitlistOpen(false)} />
      )}
    </>
  );
}
