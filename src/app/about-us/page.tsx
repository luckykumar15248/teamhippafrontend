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
          <p className="text-base text-gray-700 leading-relaxed">
            Founded by tennis lovers dedicated to sharing their passion, our
            academy has been serving players for years.
          </p>
        );
      case "mission":
        return (
          <p className="text-base text-gray-700 leading-relaxed">
            Our mission is to foster a supportive and empowering environment
            where players of all levels can develop their skills, build lasting
            friendships, and cultivate a lifelong love for tennis.
          </p>
        );
      case "value":
        return (
          <p className="text-base text-gray-700 leading-relaxed">
            We value passion, integrity, growth, community, and excellence.
            These values guide our coaching, our interactions, and our
            commitment to every player&apos;s journey.
          </p>
        );
      default:
        return null;
    }
  };
  return (
    <>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#b0db72] to-[#3a702b]  py-20 px-4 text-center">
          <div className="max-w-screen-xl  mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              About Teamhippa
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-white">
              We are a passionate team dedicated to shaping tennis experiences
              that inspire, train, and transform players at every level.
            </p>
          </div>
        </section>

        <section className="py-16 px-4 bg-white font-[Inter]">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-semibold text-black mb-3">
              Our Story
            </h2>
            <p className="text-lg font-medium leading-relaxed text-gray-600 mb-8">
              Driven by passion, we’re building a thriving tennis community—one
              swing, one player, and one unforgettable experience at a time.
            </p>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
              <div className="lg:w-1/2 w-full">
                <p className="text-base text-gray-700 leading-relaxed mb-6">
                  At our tennis academy, we&apos;re committed to helping players
                  unlock their potential and love for the game through expert
                  coaching and personalized training.
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
                <img
                  src="/images/our-story.png"
                  alt="Man playing tennis at an academy"
                  className="rounded-lg shadow-lg w-full h-auto object-cover max-h-96"
                />
              </div>
            </div>
          </div>
        </section>

        <TennisProgram />

        {/* Team Section */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-semibold text-black mb-12">Meet the Team</h2>

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
        </section>

       
    </>
  );
}
