"use client";

import Inquiry from "@/app/components/Inquiry-form";
import Link from "next/link";


export default function Contact() {

  return (
    <>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#b0db72] to-[#3a702b] py-20 px-4 text-center">
          <div className="max-w-screen-xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Contact Us
            </h1>
             <p className="max-w-2xl mx-auto text-lg text-white leading-relaxed">
            Questions, bug reports, feedback, feature requests — we’re here for
            it all?
          </p>
          <p className="text-base text-white">
            <Link
              href="#"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>{" "}
            so we can tailor your support experience. If that&apos;s not
            possible, we&apos;d still like to hear from you.
          </p>
          </div>
        </section>
         <section className="w-full max-w-screen-md mx-auto -mt-16 z-10 px-4 pb-6 md:pb-12">
          <div className="bg-white p-8 md:p-10 rounded-lg shadow-xl border border-gray-200">
            <Inquiry />
          </div>
        </section>
         <section className="w-full pt-8 pb-16 bg-white">
         <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.1794646497406!2d-112.1134139252084!3d33.57468934279706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b6c44c6203c0b%3A0x88b61e1b9fc77660!2sRose%20Mofford%20Sports%20Complex!5e0!3m2!1sen!2sin!4v1749874965994!5m2!1sen!2sin"
           width="600" 
           height="450"
            style={{ border: 0 }}
             allowFullScreen
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade"
             className="w-full"
             >
            </iframe> 
            </section>
    </>
  );
}
