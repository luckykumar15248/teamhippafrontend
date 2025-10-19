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
import HeroSection from "@/app/components/HeroSection";
import { useRouter } from "next/navigation";
import GoogleReviewsWidget from "@/app/components/GoogleReviewsWidget/GoogleReviewsWidget";

export default function HomePage() {
  const router = useRouter();

  const handelJoinClicked = () => {
    router.push("/contact");
  };

  return (
    <>
      <HeroSection />
      <TennisProgram />
      
      <section className="relative w-full h-96 bg-gray-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-[url('/images/exclusive-deal.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/30 z-0" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <p className="text-base sm:text-lg font-bold text-[#b0db72] mb-3">
            Join us
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4">
           Join the Best Tennis Academy in USA | Personalized Coaching with an Exclusive Deal!
          </h2>
          <Button
            onClick={handelJoinClicked}
            className="text-white px-4 py-2 rounded w-fit text-sm font-normal"
          >
            Join Now
          </Button>
        </div>
        
      </section>
      <GoogleReviewsWidget />
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="container mx-auto w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row transform transition-all duration-500 hover:scale-[1.01]">
          <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center text-gray-800">
            <p className="text-base sm:text-lg font-normal text-[#b0db72] mb-2 uppercase tracking-wide">
              Membership
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              JOIN THE <span className="text-[#b0db72]">TEAM HIPPA TENNIS ACADEMY</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-8 max-w-md">
              Don&apos;t miss this chance to level up your game. Feel free to
              &nbsp;
              <Link
                href="tel:+1234567890"
                className="text-[#b0db72] hover:underline font-medium"
              >
                Call us now &nbsp;
              </Link>
              or visit our website &nbsp;
              <Link
                href="/book-now"
                className="text-[#b0db72] hover:underline font-medium"
              >
                Book Your Spot
              </Link>
              &nbsp; today!
            </p>
            <div className="flex items-center bg-green-100 p-4 rounded-lg mb-8 shadow-sm">
              <span className="text-lg text-[#b0db72] font-bold">
                NEW MEMBER{" "}
                <span className="text-xl capitalize">
                  15% off your first class
                </span>
              </span>
            </div>
            <Link
              href="tel:+1234567890"
              className="text-white px-4 py-2 bg-[#b0db72] hover:bg-[#64a506] rounded w-fit text-sm font-normal flex gap-2 items-center"
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
      <section className="min-h-screen bg-gray-100 flex flex-col items-center">
        <div className="w-full bg-[#b0db72] pt-6 md:pt-12 pb-12 md:pb-42 px-6 lg:px-16 text-center shadow-lg">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
            Contact Us
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto leading-relaxed">
            Questions, bug reports, feedback, feature requests — we’re here for
            it all?
          </p>
          <p className="text-base sm:text-lg font-normal text-white">
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>{" "}
            so we can tailor your support experience. If that&apos;s not
            possible, we&apos;d still like to hear from you.
          </p>
        </div>
        {/* Form Section */}
        <section className="w-full max-w-screen-md mx-auto -mt-6 md:-mt-32 z-10 px-6 lg:px-16 pb-6 md:pb-12">
          <div className="bg-white p-8 md:p-10 rounded-lg shadow-xl border border-gray-200">
            <Inquiry />
          </div>
        </section>
      </section>
    </>
  );
}
