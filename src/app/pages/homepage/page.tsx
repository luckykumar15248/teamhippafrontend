'use client';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";
import { ABOUT_FAQS } from "@/untils/constant";
import { Button } from "@/app/components/Button";
import FAQ from "@/app/components/FAQ";
import { PhoneIcon } from "@/app/components/Icons";
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
export default function HomePage() {
  const router = useRouter();

  const handelJoinClicked = () => {
    router.push("/contact");
  };

  return (
    <>
    <HeroSlide />
    <NewsTicker />
    <AnnouncementModal />
    <AnnouncementBanner />
    
        <TennisProgram />
      
      {/* Join Us Section */}
      <section className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-[url('/images/exclusive-deal.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50 z-0" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <p className="text-base sm:text-lg font-bold text-[#b0db72] dark:text-[#9acd50] mb-3">
            Join us
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4">
           Join the Best Tennis Academy in USA | Personalized Coaching with an Exclusive Deal!
          </h2>
          <Button
            onClick={handelJoinClicked}
            className="text-white px-4 py-2 rounded w-fit text-sm font-normal bg-[#b0db72] hover:bg-[#9acd50] dark:bg-[#7cb342] dark:hover:bg-[#64a506]"
          >
            Join Now
          </Button>
        </div>
      </section>

       {/* --- Google Reviews Section --- */}
      <section className="bg-gray-50 py-20 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              What Players Say
            </h2>
            <p className="text-lg text-gray-700 mb-8 dark:text-gray-300">
              Read genuine reviews from players on Google
            </p>
          </div>
          
          {/* EmbedReviews Widget */}
          <div className="max-w-6xl mx-auto">
            <div 
              className="embedsocial-reviews" 
              data-ref="1c1b7f2c374a3a7e8144775a7c2b2273"
              data-width="100%"
            > 
              <GoogleReviewsWidget />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <a
              href="https://www.google.com/maps/place/Team+Hippa+-+Tennis+Academy/@33.0264402,-111.6789136,15z/data=!4m8!3m7!1s0xda8ab47fa7a90cd:0xf4d832507b1651bb!8m2!3d33.0264402!4d-111.6789136!9m1!1b1!16s%2Fg%2F11wwm9klzg?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors shadow-lg dark:bg-green-700 dark:hover:bg-green-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-8 8z"/>
              </svg>
              Read All Reviews on Google
            </a>
            <a
              href="https://www.google.com/maps/place/Team+Hippa+-+Tennis+Academy/@33.0264402,-111.6789136,15z/data=!4m8!3m7!1s0xda8ab47fa7a90cd:0xf4d832507b1651bb!8m2!3d33.0264402!4d-111.6789136!9m1!1b1!16s%2Fg%2F11wwm9klzg?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg hover:bg-green-50 transition-colors dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900"
            >
              Write a Review
            </a>
          </div>
        </div>
      </section>
      
      {/* Membership Section */}
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="container mx-auto w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row transform transition-all duration-500 hover:scale-[1.01] dark:shadow-gray-900">
          <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center text-gray-800 dark:text-gray-100">
            <p className="text-base sm:text-lg font-normal text-[#b0db72] dark:text-[#9acd50] mb-2 uppercase tracking-wide">
              Membership
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              JOIN THE <span className="text-[#b0db72] dark:text-[#9acd50]">TEAM HIPPA TENNIS ACADEMY</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-normal mb-8 max-w-md">
              Don&apos;t miss this chance to level up your game. Feel free to
              &nbsp;
              <Link
                href="tel:+1234567890"
                className="text-[#b0db72] dark:text-[#9acd50] hover:underline font-medium transition-colors"
              >
                Call us now &nbsp;
              </Link>
              or visit our website &nbsp;
              <Link
                href="/book-now"
                className="text-[#b0db72] dark:text-[#9acd50] hover:underline font-medium transition-colors"
              >
                Book Your Spot
              </Link>
              &nbsp; today!
            </p>
            <div className="flex items-center bg-green-100 dark:bg-gray-700 p-4 rounded-lg mb-8 shadow-sm">
              <span className="text-lg text-[#b0db72] dark:text-[#9acd50] font-bold">
                NEW MEMBER{" "}
                <span className="text-xl capitalize dark:text-white">
                  15% off your first class
                </span>
              </span>
            </div>
            <Link
              href="tel:+16023413361"
              className="text-white px-4 py-2 bg-[#b0db72] hover:bg-[#64a506] dark:bg-[#7cb342] dark:hover:bg-[#64a506] rounded w-fit text-sm font-normal flex gap-2 items-center transition-colors"
            >
              <PhoneIcon />
              CALL US NOW
            </Link>
          </div>
           
          <div className="flex-1 relative min-h-[300px] lg:min-h-full">
            <Image
              src="/images/tennis-grip.jpg"
              alt="tennis-grip"
              layout="fill"
              objectFit="cover"
              className="rounded-b-xl lg:rounded-l-none lg:rounded-r-xl"
              quality={90}
              priority
            />
          </div>
        </div>
      </section>

      <FAQ
        title="The fastest growing Tennis Academy"
        subtitle="Feel free to ping us incase there is any doubts you have. Our team will love to help you out."
        data={ABOUT_FAQS}
      />

      {/* Contact Us Section */}
      <section className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
        <div className="w-full bg-[#b0db72] dark:bg-[#7cb342] pt-6 md:pt-12 pb-12 md:pb-42 px-6 lg:px-16 text-center shadow-lg dark:shadow-gray-900">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
            Contact Us
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto leading-relaxed">
            Questions, bug reports, feedback, feature requests — we are here for
            it all?
          </p>
          <p className="text-base sm:text-lg font-normal text-white">
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
            >
              Sign in
            </Link>{" "}
            so we can tailor your support experience. If thats not
            possible, we still like to hear from you.
          </p>
        </div>
        
        {/* Form Section */}
        <section className="w-full max-w-screen-md mx-auto -mt-6 md:-mt-32 z-10 px-6 lg:px-16 pb-6 md:pb-12">
          <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 dark:shadow-gray-900">
            <Inquiry />
          </div>
        </section>
      </section>
    </>
  );
}