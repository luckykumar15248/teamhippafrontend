"use client";

import { useState } from "react";
import Image from "next/image";
import { TennisProgram } from "@/app/components/TennisPrograms";

const teamMembers = [
  {
    name: "Jane Doe",
    role: "CEO & Founder",
    image: "/images/our-story.png",
  },
  {
    name: "John Smith",
    role: "CTO",
    image: "/images/our-story.png",
  },
  {
    name: "John Smith",
    role: "CTO",
    image: "/images/our-story.png",
  },
  {
    name: "John Smith",
    role: "CTO",
    image: "/images/our-story.png",
  },
];

export default function About() {
  const [activeTab, setActiveTab] = useState("history");

  const renderTabContent = () => {
    switch (activeTab) {
      case "history":
        return (
          <>
            <p className="text-base text-gray-700 leading-relaxed">
              Founded by tennis lovers dedicated to sharing their passion, our
              academy has been serving players for years.
            </p>
          </>
        );
      case "mission":
        return (
          <p className="text-base text-gray-700 leading-relaxed">
            To empower players of all ages and skill levels to achieve their
            tennis goals with excellence.
          </p>
        );
      case "value":
        return (
          <p className="text-base text-gray-700 leading-relaxed">
            Commitment to quality, fostering inclusivity, encouraging growth,
            and building a strong community through tennis.
          </p>
        );
      default:
        return null;
    }
  };
  return (
    <>
      <section className="bg-gradient-to-r from-[#b0db72] to-[#3a702b]  py-20 px-4 text-center">
        <div className="mx-auto max-w-screen-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            About Team Hippa
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-white">
            We are a passionate team dedicated to shaping tennis experiences
            that inspire, train, and transform players at every level.
          </p>
        </div>
      </section>

      <section className="w-full bg-gray-white py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="mx-auto max-w-screen-2xl">
          <h2 className="text-4xl sm:text-5xl font-semibold text-black mb-3">
            Our Story
          </h2>
          <p className="text-lg font-medium leading-relaxed text-gray-600 mb-8">
            Our Passion, Your Game
          </p>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
            <div className="lg:w-1/2 w-full">
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                Building a Community of Tennis Enthusiasts, One Swing at a Time
              </p>

              <p className="text-base text-gray-700 leading-relaxed mb-6">
                At our tennis academy, we’re committed to helping players unlock
                their potential and love for the game through expert coaching
                and personalized training.
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-8">
                From beginners to seasoned players, we create a supportive
                environment that encourages growth, fosters friendships, and
                makes every swing a step closer to success.
              </p>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-300 mb-6">
                <span
                  className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-colors duration-300
                  ${
                    activeTab === "history"
                      ? "text-[#b0db72] border-b-2 border-[#b0db72]"
                      : "text-gray-600 hover:text-[#b0db72]"
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  History
                </span>
                <span
                  className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-colors duration-300
                  ${
                    activeTab === "mission"
                      ? "text-[#b0db72] border-b-2 border-[#b0db72]"
                      : "text-gray-600 hover:text-[#b0db72]"
                  }`}
                  onClick={() => setActiveTab("mission")}
                >
                  Mission
                </span>
                <span
                  className={`py-2 px-4 text-lg font-medium rounded-t-lg transition-colors duration-300
                  ${
                    activeTab === "value"
                      ? "text-[#b0db72] border-b-2 border-[#b0db72]"
                      : "text-gray-600 hover:text-[#b0db72]"
                  }`}
                  onClick={() => setActiveTab("value")}
                >
                  Value
                </span>
              </div>

              {/* Tab Content */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                {renderTabContent()}
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="lg:w-1/2 w-full flex justify-center items-center p-4 bg-[#b0db72] rounded-lg">
              <Image
                src="/images/our-story.png"
                alt="Man playing tennis at an academy"
                width={100}
                height={100}
                className="rounded-lg shadow-lg w-full h-auto object-cover max-h-96"
              />
            </div>
          </div>
        </div>
      </section>

      <TennisProgram />

      {/* Team Section */}
      {/* <section className="w-full bg-gray-white py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="mx-auto max-w-screen-2xl text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold text-black mb-12">
            Meet the Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-gray-100 shadow-md rounded-lg p-6 hover:shadow-xl transition duration-300"
              >
                <div className="mb-4 flex justify-center">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="object-cover rounded-full"
                  />{" "}
                </div>

                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section className="w-full bg-gray-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="bg-white shadow-lg rounded-xl p-8 md:p-12 mx-auto max-w-screen-2xl">
          <h2 className="text-4xl sm:text-5xl font-semibold text-left md:text-center text-black mb-8">
            Our Location
          </h2>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-base sm:text-2xl text-black font-semibold mb-3">
                You can find us at:
              </h4>
              <address className="not-italic text-base sm:text-lg text-gray-600 font-normal mb-3">
                Rose Mofford Sports Complex
                <br />
                9833 N 25th Ave
                <br />
                Phoenix, AZ 85021
              </address>
            </div>

            <div className="flex-1 w-full md:w-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.1794646497406!2d-112.1134139252084!3d33.57468934279706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b6c44c6203c0b%3A0x88b61e1b9fc77660!2sRose%20Mofford%20Sports%20Complex!5e0!3m2!1sen!2sin!4v1753349497969!5m2!1sen!2sin"
                width="700"
                height="350"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-gray-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="bg-white shadow-lg rounded-xl p-8 md:p-12 mx-auto max-w-screen-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-1 w-full md:w-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106697.3061383907!2d-111.8384995237223!3d33.31121176115423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872ba92dac3c8385%3A0x67a5fd75b68390bb!2sFreestone%20Recreation%20Center!5e0!3m2!1sen!2sin!4v1756745524925!5m2!1sen!2sin"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-base sm:text-2xl text-black font-semibold mb-3">
                You can find us at:
              </h4>
              <address className="not-italic text-base sm:text-lg text-gray-600 font-normal mb-3">
                Gilbert Regional Park, AZ |
                <br />
                Freestone Rec Center Gilbert,
                <br />
                AZ
              </address>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
