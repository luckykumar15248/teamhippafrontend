import React from "react";
import { SERVICES } from "@/untils/constant";
import { RightArrowIcon } from "../Icons";

export const TennisProgram = () => {
  return (
    <section className="relative w-full bg-gray-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16">
      <div className="mx-auto max-w-screen-2xl">
        <h1 className="text-4xl sm:text-5xl font-semibold text-left md:text-center text-black mb-8">
          Comprehensive Tennis Programs for All Levels
        </h1>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center mb-8 md:mb-0">
            <div className="pb-8 bg-[url('/images/tennis-journey.jpeg')] bg-cover bg-center w-full min-h-[450px] bg-gray-300 rounded-lg overflow-hidden relative flex justify-center items-end">
              <div className="p-6 rounded-lg shadow-md mt-8 max-w-md bg-[#00000066]">
                <p className="text-white text-base sm:text-lg font-normal italic mb-4">
                  <span className="text-white text-3xl font-bold mr-2">❝</span>
                  Ace Your Tennis Journey with Expert and Tailored Coaching!
                </p>
                <p className="text-base font-normal text-white">- Ricky Stokes</p>
              </div>
            </div>
          </div>

         <div className="w-full md:w-1/2 md:pl-12 text-left">
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-3">
              Whether you’re a beginner learning the basics or a seasoned player aiming for
              high-performance success, we have the perfect program for you. Our Tennis Trainers
              bring years of experience to help players of all levels improve their skills.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-3">
              For young enthusiasts, our Junior Tennis Classes create a fun and engaging environment
              to build a strong foundation. Adults can refine their techniques and stay active with
              our Adult Tennis Lessons, while competitive players can push their limits in our
              High-Performance Coaching sessions.
            </p>
            <div>
              {SERVICES.map((service, index) => (
                <div className="flex items-center mb-1" key={index}>
                  <div className="bg-garden-green rounded-full p-2 mr-2">
                    <RightArrowIcon className="text-[#64a506]" />
                  </div>
                   <p className="text-base sm:text-lg text-gray-600 font-normal">{service}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
