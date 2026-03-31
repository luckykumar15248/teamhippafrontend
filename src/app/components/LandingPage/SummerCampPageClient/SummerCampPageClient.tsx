// app/Summer-camp/SummerCampPageClient.tsx
'use client';

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import React, { useState } from 'react';
import Image from 'next/image';
import SportsHeroSection from '../../SportsHeroSection';
import FAQ from '../../FAQ';
import { Button } from '../../Button';
import WaitlistForm from '../../WaitlistForm/WaitlistForm';
import { Waitlist } from '../../WaitList';
import Link from "next/link";
import Head from 'next/head';
import {
  SUMMER_CAMP_FAQS,
  PROGRAMS_MASTER,
  CAMP_FEATURES,
} from "@/untils/constant";
import { useRouter } from "next/navigation";
import SummerCampShortDetails from '../../../components/SummerCampShortDetails/SummerCampShortDetails';
import { CalendarIcon, MapPinIcon, UsersIcon, TrophyIcon, CameraIcon, } from "lucide-react";
import { SparkleIcon } from "../../Icons";
import GoogleReviewsWidget from "../../GoogleReviewsWidget/GoogleReviewsWidget";

export default function SummerCampPageClient() {
  const [activeTab, setActiveTab] = useState('history');
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeGalleryCategory, setActiveGalleryCategory] = useState('all');
  const router = useRouter();

  const facilities = [
    { src: "/images/courts-one.jpg", title: "Professional Clay Courts", category: "courts" },
    { src: "/images/outdoor-tennis.jpg", title: "Outdoor Hard Courts", category: "courts" },
    { src: "/images/gym-two.jpg", title: "High-Tech Training Center", category: "facilities" },
    { src: "/images/gym.jpg", title: "Fitness & Conditioning Area", category: "facilities" },
    { src: "/images/camp-action1.jpg", title: "Junior Training Session", category: "camp" },
    { src: "/images/camp-action2.jpg", title: "Match Play Practice", category: "camp" },
    { src: "/images/camp-group.jpg", title: "Camp Group Activity", category: "camp" },
    { src: "/images/camp-awards.jpg", title: "Award Ceremony", category: "camp" },
    { src: "/images/camp-fun.jpg", title: "Fun Games & Activities", category: "camp" },
    { src: "/images/camp-coaching.jpg", title: "One-on-One Coaching", category: "camp" },
  ];

  const galleryCategories = [
    { id: 'all', label: 'All Photos' },
    { id: 'courts', label: 'Courts' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'camp', label: 'Camp Action' },
  ];

  const filteredFacilities = activeGalleryCategory === 'all' 
    ? facilities 
    : facilities.filter(f => f.category === activeGalleryCategory);

  const handleClick = () => {
    router.push("/register");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJoinClicked = () => {
    router.push("/book-now");
  };

  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <div className="text-base leading-relaxed text-gray-600">
            <p className="mb-4">Founded in 2015 by former professional tennis players, <strong className="text-green-600">Team Hippa Academy</strong> began with a simple mission: to bring European-style tennis coaching to Arizona. What started as a small program with just 12 students has grown into one of Phoenix most respected tennis academies.</p>
            <p>Over the past decade, we helped hundreds of players—from beginners picking up a racket for the first time to nationally ranked juniors—develop their skills and passion for the game.</p>
          </div>
        );
      case 'mission':
        return (
          <div className="text-base leading-relaxed text-gray-600">
            <p className="mb-4">Our mission is to <strong className="text-green-600">empower players of all ages and skill levels</strong> to achieve their tennis goals through expert coaching, personalized attention, and a supportive community environment.</p>
            <p>We believe tennis is more than just a sport—its a vehicle for building character, discipline, and lifelong friendships. Every player who walks through our doors deserves the opportunity to reach their full potential.</p>
          </div>
        );
      case 'value':
        return (
          <div className="text-base leading-relaxed text-gray-600">
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="font-semibold">Excellence:</span> We maintain the highest standards in coaching and facilities</li>
              <li><span className="font-semibold">Inclusivity:</span> Everyone is welcome, regardless of age, background, or skill level</li>
              <li><span className="font-semibold">Community:</span> We foster a supportive family atmosphere</li>
              <li><span className="font-semibold">Growth:</span> We focus on long-term player development, not quick fixes</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  // SEO Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SummerCamp",
    "name": "Team Hippa Summer Tennis Camp 2026",
    "description": "Professional tennis summer camp in Phoenix for kids and adults. European coaching methodology, all skill levels welcome.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Phoenix",
      "addressRegion": "AZ",
      "addressCountry": "US"
    },
    "startDate": "2026-06-01",
    "endDate": "2026-08-15",
    "offers": {
      "@type": "Offer",
      "price": "399",
      "priceCurrency": "USD",
      "availability": "https://schema.org/LimitedAvailability"
    }
  };

  return (
    <>
      <Head>
        <title>Summer Tennis Camp Phoenix 2026 | Team Hippa Academy</title>
        <meta name="description" content="🏆 Best Summer Tennis Camp in Phoenix for kids & adults. European coaching, all skill levels, flexible schedules. Limited spots available for 2026!" />
        <meta name="keywords" content="summer tennis camp phoenix, tennis camp for kids near me, adult tennis camp arizona, junior tennis camp, tennis lessons summer, best summer camp for tennis, youth tennis camp 2026" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Summer Tennis Camp Phoenix 2026 | Team Hippa Academy" />
        <meta property="og:description" content="Join the best summer tennis camp in Phoenix. Professional coaching for all ages and skill levels." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://teamhippa.com/summer-camp" />
        <meta property="og:image" content="/images/summer-camp-og.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://teamhippa.com/summer-camp" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* 1. Sports Hero Section */}
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Summer Tennis Camp 2026"
        description="Train with top coaches, improve your skills, and enjoy the Summer vibes."
        showCallButton
      />
      
      {/* 2. Hero Section with Map */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <SparkleIcon className="w-4 h-4" />
                ⭐ Best Summer Tennis Camp in Phoenix, Arizona
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Top-Rated{' '}
                <span className="text-green-600 relative">
                  Summer Camp 2026
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" preserveAspectRatio="none">
                    <path d="M0 0 L100 12 L100 0 Z" fill="currentColor" className="text-green-200/50" />
                  </svg>
                </span>
                <br />Near You in Phoenix
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                Looking for the <strong>best summer tennis camp near me in Phoenix</strong>? Join Team Hippa at
                Rose Mofford Sports Complex. Professional coaching for
                <strong> kids, teens, and adults</strong> of all skill levels.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleJoinClicked}
                  className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all hover:shadow-xl hover:shadow-green-200/50"
                >
                  Reserve Your Spot
                </Button>
                
              </div>

              {/* Local SEO Keywords */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="text-sm text-gray-500">Popular searches:</span>
                <Link href="/summer-camp/kids" className="text-sm text-green-600 hover:underline">tennis camp for kids near me</Link>
                <span className="text-gray-300">•</span>
                <Link href="/summer-camp/teens" className="text-sm text-green-600 hover:underline">junior tennis camp phoenix</Link>
                <span className="text-gray-300">•</span>
                <Link href="/summer-camp/adults" className="text-sm text-green-600 hover:underline">adult tennis camp arizona</Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-100">
                <div>
                  <div className="text-3xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-500">Campers 2025</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-500">Parent Reviews</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-500">Weeks Available</div>
                </div>
              </div>
            </div>

            {/* Location Map Component */}
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1">
              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-gray-900">
                      Rose Mofford Sports Complex
                    </div>
                    <div className="mt-2 text-base leading-relaxed text-gray-600">
                      <div>9833 N 25th Ave</div>
                      <div>Phoenix, AZ 85021</div>
                      <div>Summer Camp Headquarters</div>
                    </div>
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                    <MapPinIcon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    Phoenix
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    8 Lighted Courts
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    Free Parking
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="h-10 rounded-full bg-green-600 px-5 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition">
                    Get Directions
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 bg-white p-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <iframe
                    title="Rose Mofford Sports Complex Map"
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=Rose%20Mofford%20Sports%20Complex%2C%209833%20N%2025th%20Ave%2C%20Phoenix%2C%20AZ%2085021%2C%20United%20States&output=embed"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Summer Camp Short Details */}
      <SummerCampShortDetails />

       {/* 12. What to Bring Section */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-green-50 text-green-600">
                Camp Preparation
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
                What to Bring to Camp
              </h2>
              <p className="text-lg mb-6 text-gray-600">
                Everything you need for a fun and successful week at Team Hippa Summer Camp
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { item: "Tennis racquet", icon: "🎾" },
                  { item: "Athletic shoes", icon: "👟" },
                  { item: "Water bottle", icon: "💧" },
                  { item: "Sunscreen", icon: "☀️" },
                  { item: "Hat/visor", icon: "🧢" },
                  { item: "Snacks", icon: "🍎" },
                  { item: "Change of clothes", icon: "👕" },
                  { item: "Positive attitude", icon: "😊" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-green-50">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-green-600">Note:</span> Demo racquets available for beginners. 
                  Lunch and snacks are provided daily.
                </p>
              </div>
            </div>

            <div className="relative h-96 rounded-3xl overflow-hidden">
              <Image
                src="/images/camp-prep.jpg"
                alt="Campers ready for tennis camp"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-lg font-bold">Ready for an amazing week!</p>
                <p className="text-sm opacity-90">We provide everything else</p>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* 7. Camp Dates & Pricing Table */}
      <section className="py-16 px-6 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-green-50 text-green-600">
              2026 Summer Schedule
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Choose Your Camp Week
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Flexible sessions to fit your summer schedule
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { week: "June 1-5", theme: "Fundamentals Week", price: 399, spots: 12 },
              { week: "June 8-12", theme: "Match Play Week", price: 399, spots: 8 },
              { week: "June 15-19", theme: "Advanced Skills", price: 449, spots: 6 },
              { week: "June 22-26", theme: "Tournament Prep", price: 449, spots: 10 },
              { week: "July 6-10", theme: "All Skills Week", price: 399, spots: 15 },
              { week: "July 13-17", theme: "Fun & Games", price: 399, spots: 12 },
              { week: "July 20-24", theme: "High Performance", price: 449, spots: 8 },
              { week: "July 27-31", theme: "Champions Week", price: 399, spots: 10 },
            ].map((camp, index) => (
              <div key={index} className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-2 bg-white shadow-sm hover:shadow-xl">
                <div className={`p-1 ${camp.spots < 10 ? 'bg-orange-500' : 'bg-green-600'}`}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {camp.week}
                      </h3>
                      <p className="text-green-600 font-semibold text-sm">{camp.theme}</p>
                    </div>
                    {camp.spots < 10 && (
                      <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                        Only {camp.spots} left
                      </span>
                    )}
                  </div>
                  
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    ${camp.price}
                    <span className="text-sm font-normal text-gray-500">/week</span>
                  </div>
                  
                  <Button className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition">
                    Book This Week
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Early Bird & Multi-Week Discounts */}
          <div className="mt-8 p-6 rounded-2xl bg-white border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1 text-gray-900">
                  💰 Early Bird Discount
                </h3>
                <p className="text-sm text-gray-600">
                  Save 10% when you book by March 31 • Multi-week packages available
                </p>
              </div>
              <Link 
                href="/summer-camp/discounts"
                className="text-green-600 font-semibold hover:underline"
              >
                View All Discounts →
              </Link>
            </div>
          </div>
        </div>
      </section>

       {/* 6. Why Join Our Summer Camp? */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-green-50 text-green-600">
              Why Choose Us
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Why Join Our Summer Camp?
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              The premier tennis camp experience in Phoenix for players of all ages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CAMP_FEATURES.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl transition-all hover:-translate-y-1 bg-white border border-gray-100 shadow-sm hover:border-green-600"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-green-50 text-green-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
       {/* --- Google Reviews Section --- */}
<section className="py-24 px-6 lg:px-16 bg-gray-50">
  <div className="max-w-7xl mx-auto">

    {/* Section Header */}
    <div className="text-center mb-16">

      <span className="inline-block mb-4 text-sm font-semibold tracking-widest text-green-600 uppercase">
        Happy Campers & Parents
      </span>

      <h2 className="text-4xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
        What Players <span className="text-green-600">and Families Say</span>
      </h2>

      <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
        Real stories and genuine feedback from our players, camp community and parents on Google.
      </p>

    </div>

    {/* Reviews Card */}
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-12">

      <div
        className="embedsocial-reviews"
        data-ref="1c1b7f2c374a3a7e8144775a7c2b2273"
        data-width="100%"
      >
        <GoogleReviewsWidget />
      </div>

    </div>

    {/* CTA Buttons */}
    <div className="flex flex-wrap justify-center gap-6 mt-12">

      <a
        href="https://www.google.com/maps/place/Team+Hippa+-+Tennis+Academy/@33.0264402,-111.6789136,15z/data=!4m8!3m7!1s0xda8ab47fa7a90cd:0xf4d832507b1651bb!8m2!3d33.0264402!4d-111.6789136!9m1!1b1!16s%2Fg%2F11wwm9klzg?entry=ttu"
        target="_blank"
        rel="noopener noreferrer"
        className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-xl shadow-sm transition-all"
      >
        Read All Reviews
      </a>

      <a
        href="https://www.google.com/maps/place/Team+Hippa+-+Tennis+Academy/@33.0264402,-111.6789136,15z/data=!4m8!3m7!1s0xda8ab47fa7a90cd:0xf4d832507b1651bb!8m2!3d33.0264402!4d-111.6789136!9m1!1b1!16s%2Fg%2F11wwm9klzg?entry=ttu"
        target="_blank"
        rel="noopener noreferrer"
        className="px-12 py-4 border border-gray-300 text-gray-800 font-semibold text-lg rounded-xl hover:bg-gray-100 transition"
      >
        Write a Review
      </a>

    </div>

  </div>
</section>



     
      {/* 4. Our Story Section */}
      <section className="w-full py-16 px-6 lg:px-16 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-green-50 text-green-600">
              Our Legacy
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              The Team Hippa Story
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Building champions and creating community for over a decade in Phoenix
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 p-1 rounded-xl bg-gray-100">
                {['history', 'mission', 'value'].map((tab) => (
                  <button
                    key={tab}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 rounded-2xl bg-gray-50">
                {renderTabContent()}
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl text-center bg-gray-50">
                  <div className="text-2xl font-bold text-green-600">10+</div>
                  <div className="text-sm text-gray-600">Years</div>
                </div>
                <div className="p-4 rounded-xl text-center bg-gray-50">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-gray-600">Campers</div>
                </div>
                <div className="p-4 rounded-xl text-center bg-gray-50">
                  <div className="text-2xl font-bold text-green-600">4.9★</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            {/* Image Gallery Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-48 rounded-2xl overflow-hidden group bg-gray-100">
                  <Image
                    src="/images/our-story-1.jpg"
                    alt="Team Hippa coaching session"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden group bg-gray-100">
                  <Image
                    src="/images/our-story-2.jpg"
                    alt="Summer camp group photo"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              </div>
              <div className="pt-8">
                <div className="relative h-72 rounded-2xl overflow-hidden group bg-gray-100">
                  <Image
                    src="/images/our-story-3.jpg"
                    alt="Junior tennis tournament"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* 5. Meet the Coaches Section */}
      <section className="py-16 px-6 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-green-50 text-green-600">
              Expert Coaching Team
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Meet Your Camp Coaches
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Learn from certified professionals with decades of experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Coach Stefan Hippa",
                role: "Head Coach",
                exp: "15+ years",
                cert: "USPTA Elite",
                img: "/images/coach-stefan.jpg",
                bio: "Former European junior champion, specialized in technical development"
              },
              {
                name: "Coach Maria Santos",
                role: "Junior Development",
                exp: "12+ years",
                cert: "PTR Certified",
                img: "/images/coach-maria.jpg",
                bio: "Expert in youth tennis, former Division 1 college coach"
              },
              {
                name: "Coach David Chen",
                role: "High Performance",
                exp: "10+ years",
                cert: "ITF Level 3",
                img: "/images/coach-david.jpg",
                bio: "Trained multiple national-level junior players"
              },
              {
                name: "Coach Sarah Johnson",
                role: "Adult Programs",
                exp: "8+ years",
                cert: "CPR/First Aid",
                img: "/images/coach-sarah.jpg",
                bio: "Specializes in adult beginners and fitness integration"
              }
            ].map((coach, index) => (
              <div key={index} className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-2 bg-white shadow-sm">
                <div className="relative h-64">
                  <Image
                    src={coach.img}
                    alt={`${coach.name} - Team Hippa Summer Camp Coach`}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-900">
                    {coach.name}
                  </h3>
                  <p className="text-green-600 font-semibold text-sm mb-2">{coach.role}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {coach.exp}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {coach.cert}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {coach.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Coach-to-Camper Ratio */}
          <div className="mt-8 p-6 rounded-2xl text-center bg-white border border-gray-100">
            <p className="text-lg text-gray-600">
              <span className="font-bold text-green-600">1:4 coach-to-camper ratio</span> ensures every player gets personalized attention
            </p>
          </div>
        </div>
      </section>
   

      {/* 8. Gallery Section */}
      <section className="py-16 px-6 lg:px-16 bg-white" id="gallery">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-green-50 text-green-600">
              Camp Memories
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Summer Camp Gallery
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-8 text-gray-600">
              Take a peek at the fun, learning, and friendships at Team Hippa Summer Camp
            </p>

            {/* Gallery Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {galleryCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveGalleryCategory(cat.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeGalleryCategory === cat.id
                      ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Masonry Grid Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[200px]">
            {filteredFacilities.map((item, index) => {
              const rowSpan = index % 3 === 0 ? 'row-span-2' : 'row-span-1';
              const colSpan = index === 0 ? 'lg:col-span-2' : '';

              return (
                <div
                  key={index}
                  className={`relative group overflow-hidden rounded-2xl cursor-pointer ${rowSpan} ${colSpan}`}
                  onClick={() => setSelectedImage(item.src)}
                >
                  <Image
                    src={item.src}
                    alt={`Summer camp ${item.title} - Team Hippa Phoenix`}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  
                  {/* Overlay with category badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                        item.category === 'courts' ? 'bg-green-600 text-white' :
                        item.category === 'facilities' ? 'bg-blue-600 text-white' :
                        'bg-orange-600 text-white'
                      }`}>
                        {item.category}
                      </span>
                      <h3 className="text-white font-semibold">{item.title}</h3>
                    </div>
                  </div>

                  {/* View icon on hover */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <CameraIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <button className="px-6 py-3 rounded-xl font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200">
              View Full Gallery
            </button>
          </div>
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh]">
              <Image
                src={selectedImage}
                alt="Gallery preview"
                width={1200}
                height={800}
                className="object-contain rounded-2xl"
              />
              <button 
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 9. Facilities Section */}
      <section className="py-16 px-6 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-green-50 text-green-600">
              World-Class Facilities
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Train Like a Pro
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Professional-grade courts and training facilities in Phoenix
            </p>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {facilities.slice(0, 4).map((facility, index) => (
              <SwiperSlide key={index}>
                <div className="relative h-80 rounded-2xl overflow-hidden group">
                  <Image
                    src={facility.src}
                    alt={facility.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-xl font-bold mb-2">{facility.title}</h3>
                      <p className="text-white/80 text-sm">Professional grade • Air conditioned</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
  
      {/* 13. Camp Highlights Video */}
      <section className="py-16 px-6 lg:px-16 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-green-50 text-green-600">
            Camp Highlights
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            See Camp in Action
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-600">
            Watch what a typical day looks like at Team Hippa Summer Camp
          </p>

          <div className="relative aspect-video rounded-3xl overflow-hidden group cursor-pointer">
            <Image
              src="/images/camp-video-thumb.jpg"
              alt="Summer camp video preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition"></div>
            
            {/* Play Button */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition shadow-xl">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-green-600 border-b-[12px] border-b-transparent ml-1"></div>
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              2:30 min tour
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {["Fun Drills", "Match Play", "Awards Ceremony"].map((item, index) => (
              <div key={index} className="p-3 rounded-xl bg-white shadow-sm">
                <p className="text-sm font-medium text-gray-700">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. Master Your Game Section */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Master Your Game, Your Way
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              From Beginners to Pros, We Have the Perfect Tennis Coaching for Every Level and Goal!
            </p>
          </div>

          <Swiper
            slidesPerView={1}
            spaceBetween={24}
            loop={true}
            navigation={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            modules={[Navigation, Autoplay]}
            className="w-full"
          >
            {PROGRAMS_MASTER.map((program, index) => (
              <SwiperSlide key={index}>
                <div className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-2 bg-white shadow-sm hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={program.img}
                      alt={`${program.title} at Team Hippa Summer Camp`}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">
                      {program.title}
                    </h3>
                    <p className="text-sm mb-4 text-gray-600">
                      {program.description}
                    </p>
                    <Link 
                      href={`/programs/${program.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center text-sm font-semibold text-green-600 hover:text-green-700"
                    >
                      Learn More →
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 15. Nearby Activities for Parents */}
      <section className="py-16 px-6 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-green-50 text-green-600">
              For Parents
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              While Your Kids Are at Camp
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Things to do nearby while your children enjoy tennis camp
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "North Mountain Park",
                desc: "Beautiful hiking trails just 10 min away",
                icon: "🥾",
                time: "10 min drive"
              },
              {
                title: "Desert Ridge Marketplace",
                desc: "Shopping, dining, and entertainment",
                icon: "🛍️",
                time: "15 min drive"
              },
              {
                title: "Lookout Mountain Preserve",
                desc: "Scenic views and walking paths",
                icon: "🌵",
                time: "12 min drive"
              }
            ].map((place, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white shadow-sm">
                <div className="text-4xl mb-4">{place.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  {place.title}
                </h3>
                <p className="text-sm mb-3 text-gray-600">
                  {place.desc}
                </p>
                <p className="text-green-600 font-semibold text-sm">{place.time}</p>
              </div>
            ))}
          </div>

          {/* Parent Lounge */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Parent Lounge Available</h3>
                <p className="text-green-100">Free WiFi • Coffee • Shaded seating • Live court viewing</p>
              </div>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm">Stay & watch!</span>
            </div>
          </div>
        </div>
      </section>

      {/* 16. Camp Blog / Updates Section */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-green-50 text-green-600">
              Camp News & Tips
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Latest Updates
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Helpful articles for parents and young players
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "5 Tips for First-Time Campers",
                excerpt: "Help your child prepare for their first tennis camp experience",
                date: "March 1, 2026",
                readTime: "3 min read",
                category: "Parent Guide"
              },
              {
                title: "Summer Tennis Training: What to Expect",
                excerpt: "How we structure training for different age groups",
                date: "Feb 15, 2026",
                readTime: "5 min read",
                category: "Training"
              },
              {
                title: "Nutrition Tips for Young Athletes",
                excerpt: "What to eat before, during, and after camp",
                date: "Feb 1, 2026",
                readTime: "4 min read",
                category: "Health"
              }
            ].map((post, index) => (
              <div key={index} className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-2 bg-white shadow-sm border border-gray-100">
                <div className="p-6">
                  <span className="text-xs text-green-600 font-semibold">{post.category}</span>
                  <h3 className="text-lg font-bold mt-2 mb-3 text-gray-900">
                    {post.title}
                  </h3>
                  <p className="text-sm mb-4 text-gray-600">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all bg-white text-gray-700 border border-gray-200 hover:border-green-600 hover:text-green-600"
            >
              View All Articles
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 17. CTA Section */}
      <section className="py-16 px-6 lg:px-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-white shadow-sm">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Book Our Summer Camp
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-600">
              Join us at Team Hippa Academy for an exceptional tennis training experience! 
              Whether you are a junior or adult, beginner or advanced, our summer camps offer 
              the premier opportunity to improve your game.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <UsersIcon className="w-5 h-5 text-green-600" />
                <span>Ages 6-16</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TrophyIcon className="w-5 h-5 text-green-600" />
                <span>All Levels</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarIcon className="w-5 h-5 text-green-600" />
                <span>June - August</span>
              </div>
            </div>
<div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleClick}
              className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all hover:shadow-xl hover:shadow-green-200/50 "
            >
              Reserve Your Spot Now
            </Button>
            </div>

            <p className="text-sm mt-4 text-gray-400">
              Limited spots available • Early bird discount ends March 31
            </p>
          </div>
        </div>
      </section>

      {/* 18. FAQ Section */}
      <FAQ
        title="The fastest growing Tennis Academy in Phoenix"
        subtitle="Have questions about our summer camp? We're here to help!"
        data={SUMMER_CAMP_FAQS}
      />
      
      {/* 19. Waitlist Section */}
      <Waitlist
        title="Interested in Joining Our Summer Camp?"
        subtitle="Spots fill up fast! Join the waitlist for priority access."
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
      />
      {isWaitlistOpen && (
        <WaitlistForm sportName="Summer Camp" onClose={() => setIsWaitlistOpen(false)} />
      )}

     
    </>
  );
}