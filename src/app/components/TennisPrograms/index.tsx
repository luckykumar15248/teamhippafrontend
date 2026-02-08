import React from "react";
import { SERVICES } from "@/untils/constant";

export const TennisProgram = () => {
  return (
    <section className="w-full bg-gray-100 py-16 px-6 lg:px-16">
      <div className="max-w-screen-2xl mx-auto">
        
        {/* Heading */}
       
      <h1 className="text-4xl md:text-4xl font-extrabold text-center text-gray-900 leading-tight mb-6">
        Join the <span className="text-green-600">Premier</span> Tennis academy in Arizona |  Team Hippa
      </h1>
  <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed mb-10">
        Professional Coaching for Everyone — From Beginners to High-Performance Players
      </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Image Section */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white">
            <div
              className="min-h-[480px] bg-cover bg-center"
              style={{ backgroundImage: "url('/images/tennis-journey.jpeg')" }}
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-lg">
              <p className="text-lg italic text-gray-700 mb-3 leading-relaxed">
                <span className="text-3xl font-bold text-[#64a506] mr-1">“</span>
                Ace Your Tennis Journey with Expert and Tailored Coaching!
              </p>
              <p className="text-gray-500 font-medium">— Ricky Stokes</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl">
            <p className="text-base sm:text-lg text-gray-600 mb-4 leading-relaxed">
              Team Hippa Tennis Academy offers comprehensive tennis programs and expert coaching for all ages and skill levels in Gilbert, AZ and Phoenix, AZ.
            </p>

            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              Whether you’re a beginner learning the basics or a seasoned player aiming for high-performance success, we have the perfect program for you. Our Tennis Trainers bring years of experience to help players of all levels improve their skills.
            </p>

            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              For young enthusiasts, our Junior Tennis Classes create a fun and engaging environment to build a strong foundation. Adults can refine their techniques and stay active with our Adult Tennis Lessons, while competitive players can push their limits in our High-Performance Coaching sessions.
            </p>

            {/* Services List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {SERVICES.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#64a506]" />
                  <p className="text-gray-700 text-base font-medium">{service}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
