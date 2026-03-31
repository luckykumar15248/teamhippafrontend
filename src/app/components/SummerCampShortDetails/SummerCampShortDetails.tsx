// components/SummerCampShowcase.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/app/components/Button';
import { 
  CarFacilityIcon, 
  LocationIcon, 
  LunchIcon, 
  TimeIcon,
  
} from "../Icons";
import {
  SCHEDULE,
} from "@/untils/constant";

// Schedule data for the camp day
/*
const SCHEDULE = [
  {
    time: "8:30 AM",
    title: "Check-in & Warm-up",
    desc: "Arrival, check-in, and dynamic stretching to prepare for an exciting day",
    icon: <RunIcon className="w-5 h-5" />
  },
  {
    time: "9:00 AM",
    title: "Technical Drills",
    desc: "Small group stations focusing on footwork, strokes, and proper technique",
    icon: <TrophyIcon className="w-5 h-5" />
  },
  {
    time: "10:30 AM",
    title: "Match Play",
    desc: "Supervised matches with coach feedback and strategy development",
    icon: <TrophyIcon className="w-5 h-5" />
  },
  {
    time: "12:00 PM",
    title: "Lunch Break",
    desc: "Nutritious lunch provided - social time with new friends",
    icon: <LunchIcon className="w-5 h-5" />
  },
  {
    time: "1:00 PM",
    title: "Fun Games & Drills",
    desc: "Engaging tennis games that reinforce skills while having fun",
    icon: <UserIcon className="w-5 h-5" />
  },
  {
    time: "2:30 PM",
    title: "Cool-down & Pick-up",
    desc: "Stretching, recap of the day's achievements, and parent pick-up",
    icon: <TimeIcon className="w-5 h-5" />
  }
];*/

export const INFO_ITEMS = [
  {
    icon: <LocationIcon className="w-5 h-5 text-green-600" />,
    label: "Location:",
    text: "Gilbert Regional Park & Freestone Recreation Center",
  },
  {
    icon: <TimeIcon className="w-5 h-5 text-green-600" />,
    label: "Time:",
    text: "8:30 AM – 2:30 PM (Monday–Friday)",
  },
  {
    icon: <LunchIcon className="w-5 h-5 text-green-600" />,
    label: "Lunch included daily",
    text: "Healthy meals provided",
  },
  {
    icon: <CarFacilityIcon className="w-5 h-5 text-green-600" />,
    label: "Shuttles from select locations",
    text: "Scottsdale, PV, and Phoenix",
  },
];

export default function SummerCampShowcase() {
 

  const handleReadMore = () => {
    // Navigate to camp details page
  };

  return (
    <section className="w-full bg-white">
      {/* Two Division Layout */}
      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        
        {/* LEFT DIVISION - Camp Overview & Details */}
        <div className="bg-white p-8 lg:p-12">
          <div className="max-w-xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Limited spots available for Summer 2026 • Early bird discount ends March 31st
            </div>

            {/* Title */}
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Team Hippa 
              <span className="text-green-600 block mt-2">Youth Summer Tennis Camp</span>
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Get ready for an unforgettable summer on the court! Players of all levels – 
              from beginners to competitive athletes – will receive high-quality tennis 
              instruction, mental coaching, and a full day of fun in a dynamic and 
              supportive environment.
            </p>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {INFO_ITEMS.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                      <div className="text-gray-600 text-sm">{item.text}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price & CTA */}
            <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">$475</span>
                <span className="text-gray-500">/week</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Daily drop-in available • Daily Drop in $105</p>
              <p className="text-sm text-gray-600 mb-4">• Transportation from Scottsdale and Phoenix available (+$30 per week/person) </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleReadMore}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all hover:shadow-lg hover:shadow-green-200"
                >
                  Read More
                </Button>
                             </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">Ages 6-16</span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">All skill levels</span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">Certified coaches</span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">1:4 ratio</span>
            </div>
          </div>
        </div>

        {/* RIGHT DIVISION - A Day at Camp Schedule */}
        <div className="bg-gray-50 p-8 lg:p-12">
          <div className="max-w-xl mx-auto">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              A Day at 
              <span className="text-green-600 block">Our Summer Camp</span>
            </h3>
            <p className="text-gray-600 mb-10">
              Every day is carefully structured for maximum fun and development
            </p>

            {/* Timeline Schedule */}
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-600 to-green-300"></div>

              {/* Schedule Items */}
              <div className="space-y-6">
                {SCHEDULE.map((item, index) => (
                  <div key={index} className="relative flex gap-6">
                    {/* Time Bubble */}
                    <div className="relative z-10">
                      <div className="w-8 h-8 bg-white border-2 border-green-600 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                        {index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-600">{item.icon}</span>
                        <span className="font-semibold text-green-600 text-sm">{item.time}</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Camp Image Preview */}
            <div className="mt-10 relative h-48 rounded-xl overflow-hidden group">
              <Image
                src="/images/gilbert.jpg"
                alt="Summer tennis camp at Team Hippa"
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="font-bold">Gilbert Regional Park</div>
                <div className="text-sm text-white/80">Main camp location</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}