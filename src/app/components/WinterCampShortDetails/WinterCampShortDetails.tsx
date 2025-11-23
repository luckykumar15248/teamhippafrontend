'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CarFacilityIcon, 
  FitnessIcon, 
  LocationIcon, 
  LunchIcon, 
  TimeIcon 
} from "../Icons";
import { FootballIcon } from '../Icons/FootballIcon';
import { PriceIcon } from '../Icons/PriceIcon';
import { DateIcon } from '../Icons/DateIcon';

export const INFO_ITEMS = [
  {
    icon: <LocationIcon className="text-green-700" />,
    label: "Location:",
    text: "Freestone Rec Center, Gilbert.",
  },
  {
    icon: <DateIcon className="text-green-700" />,
    label: "Dates:",
    text: "Week 1 :- Dec 22 to Dec 24, Week 2 :- Dec 29 to Jan 2, 2026 (Excl. Jan 1).",
  },
  {
    icon: <TimeIcon className="text-green-700" />,
    label: "Time:",
    text: "09 AM TO 2 PM (Monday–Friday).",
  },
  {
    icon: <LunchIcon className="text-green-700" />,
    label: "Meals:",
    text: "Lunch provided.",
  },
  {
    icon: <CarFacilityIcon className="text-green-700" />,
    label: "Shuttle Services:",
    text: "Only from select locations (Phoenix and Scottsdale).",
  },
  {
    icon: <FitnessIcon className="text-green-700" />,
    label: "Training:",
    text: "Tennis training for all levels and all ages.",
  },
  {
    icon: <FootballIcon className="text-green-700" />,
    label: "Activity:",
    text: "Games and fun activities in Freestone Rec Center, Gilbert.",
  },
  {
    icon: <PriceIcon className="text-green-700" />,
    label: "Price:",
    text: "Week 1: $285, Week 2: $380",
  },
];

export default function WinterCampShortDetails() {
  return (
    <section className="bg-yellow-100 py-16 px-6 lg:px-16">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Image Section */}
          <div className="w-full md:w-96 flex-shrink-0">
            <Image
              src="/images/WinterTennisCamp.jpg"
              alt="Winter Tennis Camp"
              width={500}
              height={600}
              className="w-full h-[450px] object-cover rounded-lg shadow-md"
            />
          </div>

          {/* Text Section */}
          <div className="space-y-4 w-full md:flex-1">
            <h3 className="text-[#8ecf4f] font-semibold text-lg uppercase">
              Winter Tennis Camp{" "}
              <span className="text-black">
                Starting <strong>December 22, 2025</strong>
              </span>
            </h3>

            <p className="text-gray-900 font-semibold">
              For all players and levels | For daily drop-in, please contact us directly at{" "}
              <a href="tel:+16023413361" className="underline">+1 602-341-3361</a>{" "}
              or email:{" "}
              <a href="mailto:info@teamhippa.com" className="underline">info@teamhippa.com</a>
            </p>

            <h4 className="text-lg font-bold text-gray-900">
              Upcoming Team Hippa Winter Tennis Camp 2025
            </h4>

            <p className="text-gray-700 leading-relaxed">
              Get ready for an unforgettable winter on the court! At the{" "}
              <span className="font-semibold">Team Hippa Winter Tennis Camp 2025</span>, 
              players of all levels – from beginners to competitive athletes – will receive 
              high-quality tennis instruction, mental coaching, and a full day of fun in a 
              dynamic and supportive environment.
            </p>

            <ul className="space-y-2 text-gray-800">
              {INFO_ITEMS.map((item, index) => (
                <li key={index} className="flex gap-2 items-start sm:items-center">
                  {item.icon}
                  <span className="font-semibold">{item.label}</span> {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Button at bottom */}
        <div className="flex justify-center mt-10">
          <Link
            href="https://teamhippa.com/booking/camp/tennis-winter-camp"
            className="inline-block bg-[#64a506] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-[#538604] hover:shadow-xl transition-all duration-300"
          >
            Register Now
          </Link>
        </div>
      </div>
    </section>
  );
}
