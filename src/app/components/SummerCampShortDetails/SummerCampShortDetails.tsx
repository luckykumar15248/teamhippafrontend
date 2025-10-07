// components/SummerCampSection.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/app/components/Button'; // Adjust path
import { CarFacilityIcon, LocationIcon, LunchIcon, TimeIcon } from "../Icons";

export const INFO_ITEMS = [
  {
    icon: <LocationIcon className="text-green-700" />,
    label: "Location:",
    text: "Added Soon",
  },
  {
    icon: <TimeIcon className="text-green-700" />,
    label: "Time:",
    text: "Publish Soon (Monday–Friday)",
  },
  {
    icon: <LunchIcon className="text-green-700" />,
    label: "Lunch included daily",
    text: "",
  },
  {
    icon: <CarFacilityIcon className="text-green-700" />,
    label: "Shuttles from select locations in Scottsdale, PV and Phoenix",
    text: "Added Soon",
  },
];

export default function SummerCampSection() {
  const handleClick = () => {
    alert('registration Open Soon!');
  };

  return (
    <>
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
                    onClick={handleClick}
                    className="bg-white !text-[#64a506] px-6 py-3 !rounded-full font-medium shadow-md hover:shadow-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    Register Now
                  </Button>
                </div>
              </div>
            </section>
      
            <section className="bg-yellow-100 py-10 px-6 lg:px-16">
              <div className="max-w-screen-2xl mx-auto">
                <div className="w-full flex flex-col md:flex-row items-center gap-8 ">
                  <div className="w-full md:w-96">
                    <Image
                      src="/images/gilbert.jpg"
                      alt="eamHippa-logo"
                      width={500}
                      height={600}
                      className="w-full h-[450px] object-fill md:object-contain"
                    />
                  </div>
      
                  <div className="space-y-4 w-full md:w-[calc(100%-364px)]">
                    <h3 className="text-[#8ecf4f] font-semibold text-lg uppercase">
                      Youth Summer Camps{" "}
                      <span className="text-black">
                        Starting at <strong>Display Soon</strong>
                      </span>
                    </h3>
      
                    <p className="text-gray-900 font-semibold">
                      For all players and levels | For daily drop-in, please contact
                      us directly
                    </p>
      
                    <h4 className="text-lg font-bold text-gray-900">
                      Up Coming Team Hippa Junior Summer Tennis Camp 2026
                    </h4>
      
                    <p className="text-gray-700 leading-relaxed">
                      Get ready for an unforgettable summer on the court! At the{" "}
                      <span className="font-semibold">
                        Team Hippa Youth Summer Tennis Camp
                      </span>
                      , players of all levels – from beginners to competitive athletes
                      – will receive high-quality tennis instruction, mental coaching,
                      and a full day of fun in a dynamic and supportive environment.
                    </p>
      
                    <ul className="space-y-2 text-gray-800">
                      {INFO_ITEMS.map((item, index) => (
                        <li
                          key={index}
                          className="flex gap-2 items-start sm:items-center"
                        >
                          {item.icon}{" "}
                          <span className="font-semibold">{item.label}</span>{" "}
                          {item.text}
                        </li>
                      ))}
                    </ul>
                    <Button className="transition">Read More</Button>
                  </div>
                </div>
              </div>
            </section>
    </>
  );
}
