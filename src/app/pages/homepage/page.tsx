'use client';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

//import Image from "next/image";
import { ABOUT_FAQS } from "@/untils/constant";
//import { Button } from "@/app/components/Button";
import FAQ from "@/app/components/FAQ";
//import { PhoneIcon } from "@/app/components/Icons";
import Link from "next/link";
import Inquiry from "@/app/components/Inquiry-form";
import { TennisProgram } from "@/app/components/TennisPrograms";
//import HeroSection from "@/app/components/HeroSection";
import { useRouter } from "next/navigation";
import GoogleReviewsWidget from "@/app/components/GoogleReviewsWidget/GoogleReviewsWidget";
import HeroSlide from "@/app/components/HeroSlider/HeroSlider";
import NewsTicker from "@/app/components/NewsTicker/NewsTicker";
import AnnouncementModal from "@/app/components/AnnouncementModal/AnnouncementModal";
import AnnouncementBanner from "@/app/components/AnnouncementBanner/AnnouncementBanner";
import Programs from "@/app/components/home/Programs";
import WhyChoose from "@/app/components/home/WhyChoose";
import CTA from "@/app/components/home/CTA";
import Location from "@/app/components/home/Location";
export default function HomePage() {
  const router = useRouter();

  const handelJoinClicked = () => {
    router.push("/contact");
  };

  return (

    <>
      <main className="bg-slate-50">
             
    <HeroSlide />   
    <NewsTicker />
    <AnnouncementModal />
    <AnnouncementBanner />
    <TennisProgram />
    <WhyChoose />
      <CTA />
      <Location />
      <Programs />
      
     {/* Join Us – Premium CTA Section */}
<section className="relative isolate overflow-hidden py-24 px-6 lg:px-16 bg-[#0B1220]">

  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="/images/exclusive-deal.jpg"
      alt="Join Team Hippa"
      className="h-full w-full object-cover opacity-30"
    />
  </div>

  {/* Gradient Overlays */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />
  <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-green-500/20 blur-[120px] rounded-full" />
  <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-emerald-400/20 blur-[120px] rounded-full" />

  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

    {/* Left Content */}
    <div>
      <span className="inline-block mb-4 text-sm font-semibold tracking-wider text-green-400 uppercase">
        Limited Time Offer
      </span>

      <h2 className="text-4xl md:text-4xl font-extrabold leading-tight text-white">
        Train With The  
        <span className="block text-green-400">Best Tennis Academy</span>
        In The Arizona, USA
      </h2>

      <p className="mt-6 text-lg text-gray-300 max-w-xl">
        Personalized coaching • Elite trainers • Proven success model • Exclusive membership offers.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-6">
        <button
          onClick={handelJoinClicked}
          className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-xl shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all"
        >
          Join Now
        </button>

        <a
          href="/programs"
          className="text-white font-semibold underline underline-offset-4 hover:text-green-400 transition"
        >
          View Programs →
        </a>
      </div>
    </div>

    {/* Right Floating Glass Card */}
    <div className="relative">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-2xl font-bold text-white">
          Why Choose Team Hippa?
        </h3>

        <ul className="mt-6 space-y-4 text-gray-200">
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Elite international coaching staff
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Structured long-term development programs
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Proven athlete success pathway
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Scholarships + competitive exposure
          </li>
        </ul>
      </div>
    </div>

  </div>
</section>


       {/* --- Google Reviews Section --- */}
<section className="py-24 px-6 lg:px-16 bg-gray-50">
  <div className="max-w-7xl mx-auto">

    {/* Section Header */}
    <div className="text-center mb-16">

      <span className="inline-block mb-4 text-sm font-semibold tracking-widest text-green-600 uppercase">
        Testimonials
      </span>

      <h2 className="text-4xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
        What Players <span className="text-green-600">Say</span>
      </h2>

      <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
        Real stories and genuine feedback from our players and parents on Google.
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

      
      <FAQ
        title="The fastest growing Tennis Academy"
        subtitle="Feel free to ping us incase there is any doubts you have. Our team will love to help you out."
        data={ABOUT_FAQS}
      />

      {/* Contact Us Section */}
{/* Contact Us Section */}
<section className="w-full py-20 px-6 lg:px-16 bg-[#f5f6f7]">
  <div className="max-w-6xl mx-auto">

    {/* Heading */}
    <div className="text-center mb-14">
      <p className="text-sm font-medium text-[#7cb342] uppercase tracking-wider mb-2">
        Contact Us
      </p>

      <h2 className="text-4xl sm:text-4xl font-semibold text-gray-800 mb-4">
        Let’s Start Your Training Journey
      </h2>

      <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Have questions or need personalized guidance? Our team is here to help
        you choose the perfect training program and get started confidently.
      </p>

      <p className="text-sm text-gray-500 mt-4">
        Already a member?{" "}
        <Link href="/login" className="text-[#7cb342] font-medium hover:underline">
          Sign in
        </Link>{" "}
        for faster support.
      </p>
    </div>

    {/* Form Card */}
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
      <Inquiry />
    </div>

  </div>
</section>


       </main>
    </>
  );
}





  
