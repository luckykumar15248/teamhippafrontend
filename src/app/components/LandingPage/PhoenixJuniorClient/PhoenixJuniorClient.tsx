'use client';
/* eslint-disable react/no-unescaped-entities */

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PHOENIX_COURSES } from '@/untils/constant';
import Inquiry from '@/app/components/Inquiry-form';
import WinterCampShortDetails from '../../../components/WinterCampShortDetails/WinterCampShortDetails';
import GoogleReviewsWidget from "@/app/components/GoogleReviewsWidget/GoogleReviewsWidget";

// --- Simple Icon ---
const CheckIcon = () => (
  <svg
    className="w-6 h-6 text-green-500 dark:text-green-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function PhoenixJuniorClient() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('beginners');

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'tots':
        return (
          <div>
            <h3 className="text-2xl font-bold mb-3 dark:text-white">Tots Program (Ages 4-6)</h3>
            <p className="text-gray-700 mb-4 dark:text-gray-300">
              The perfect introduction to tennis! Our Tots program focuses on developing essential
              motor skills like balance, coordination, and agility in a high-energy, game-based
              environment. We use fun props and soft balls to make learning easy.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Develops hand-eye coordination</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Fun, safe, and positive environment</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Prepares kids for future classes</span>
              </li>
            </ul>
          </div>
        );

      case 'beginners':
        return (
          <div>
            <h3 className="text-2xl font-bold mb-3 dark:text-white">Beginners Program (Ages 7-10)</h3>
            <p className="text-gray-700 mb-4 dark:text-gray-300">
              This is where the fundamentals are built. Players learn the basics of all major
              strokes (forehand, backhand, volley, serve) and begin to understand how to rally and
              keep score. Our coaches use a "game-based" approach, so kids are playing and having
              fun from day one.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Learn all major tennis strokes</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Introduction to rallying and scoring</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Focus on fun and sportsmanship</span>
              </li>
            </ul>
          </div>
        );

      case 'teens':
        return (
          <div>
            <h3 className="text-2xl font-bold mb-3 dark:text-white">Teens Program (Ages 11-18)</h3>
            <p className="text-gray-700 mb-4 dark:text-gray-300">
              Whether they are new to the game or have some experience, our teen program is the
              perfect fit. It's a great mix of technical instruction, fitness drills, and social
              match play. It's an awesome way for teens to stay active and meet new friends.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Ideal for middle & high school players</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Great workout and social outlet</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Prepares players for school teams</span>
              </li>
            </ul>
          </div>
        );

      case 'high-performance':
        return (
          <div>
            <h3 className="text-2xl font-bold mb-3 dark:text-white">High-Performance Academy (Invitation Only)</h3>
            <p className="text-gray-700 mb-4 dark:text-gray-300">
              For the serious junior player. Our High-Performance Academy focuses on advanced
              strategy, off-court conditioning, and tournament preparation. This program is for
              dedicated players looking to compete in USTA tournaments and play at the collegiate
              level.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Advanced tactical and strategic drills</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Off-court strength & conditioning</span>
              </li>
              <li className="flex items-center">
                <CheckIcon />
                <span className="ml-2 dark:text-gray-300">Focused tournament scheduling & coaching</span>
              </li>
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* --- Hero Section --- */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20 dark:from-green-700 dark:to-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            Junior Tennis Programs in Phoenix
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-green-100">
            Professional tennis coaching for children and teens at Rose Mofford Sports Complex. 
            Build skills, confidence, and lifelong friendships through our structured programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all dark:bg-gray-100 dark:text-green-800 dark:hover:bg-white"
            >
              Get Trial
            </button>
            <button
              onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-800 border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 text-lg font-semibold rounded-lg transition-all dark:bg-green-900 dark:border-green-300 dark:hover:bg-white dark:hover:text-green-800"
            >
              View Programs
            </button>
          </div>
          
          {/* Adult Tennis CTA */}
          <div className="mt-8 pt-6 border-t border-green-500 border-opacity-30">
            <p className="text-green-200 mb-3">Interested in adult tennis programs?</p>
            <a
              href="https://teamhippa.com/gilbert-adult-tennis-clinics"
              className="inline-flex items-center gap-2 bg-green-500 bg-opacity-20 text-white px-6 py-2 rounded-lg hover:bg-opacity-30 transition-all border border-green-400 border-opacity-30"
            >
              <span>Explore Adult Programs in Gilbert</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* --- Benefits Section --- */}
      <section className="bg-gray-50 py-20 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              Why Choose Team Hippa Phoenix Junior Tennis?
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto dark:text-gray-300">
              Our comprehensive approach to youth tennis development sets us apart as Phoenix's premier junior tennis academy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "USTA Certified Coaches",
                description: "All coaches are certified, background-checked professionals with extensive youth coaching experience",
                icon: "🎾"
              },
              {
                title: "Progressive Curriculum",
                description: "Structured pathway from beginner to competitive player with clear milestones and achievements",
                icon: "📈"
              },
              {
                title: "Safe & Modern Facilities",
                description: "Professional courts and equipment at Rose Mofford Sports Complex in North Phoenix",
                icon: "🏟️"
              },
              {
                title: "Tournament Preparation",
                description: "Comprehensive training for USTA tournaments and high school competition",
                icon: "🏆"
              },
              {
                title: "Small Class Sizes",
                description: "Low student-to-coach ratio ensures personalized attention and rapid progress",
                icon: "👥"
              },
              {
                title: "Character Development",
                description: "We teach sportsmanship, discipline, and teamwork alongside tennis skills",
                icon: "⭐"
              },
              {
                title: "Flexible Scheduling",
                description: "Multiple class times available to fit your family's busy schedule",
                icon: "🕒"
              },
              {
                title: "Performance Tracking",
                description: "Regular progress assessments and parent-coach conferences",
                icon: "📊"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-gray-900 dark:shadow-gray-900 dark:hover:shadow-gray-800">
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Program Details Section --- */}
      <section id="programs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 dark:bg-gray-900">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 dark:text-white">
            Junior Tennis Programs in Phoenix
          </h2>
          <p className="text-lg text-gray-700 mx-auto max-w-3xl dark:text-gray-300">
            We have a clear pathway for every child, from their first time holding a racquet to
            competing in tournaments. All Phoenix programs are held at the{' '}
            <span className="font-semibold dark:text-white">Rose Mofford Sports Complex</span>.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {(() => {
            const tabNames: Record<string, string> = {
              tots: 'Tots (Ages 4-6)',
              beginners: 'Beginners (Ages 7-10)',
              teens: 'Teens (Ages 11-18)',
              'high-performance': 'High-Performance',
            };
            return (['tots', 'beginners', 'teens', 'high-performance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300 ${
                  selectedTab === tab
                    ? 'bg-green-600 text-white shadow-lg transform scale-105 dark:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                {tabNames[tab]}
              </button>
            ));
          })()}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 min-h-[300px] dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900">
          {renderTabContent()}
        </div>
      </section>

      {/* --- Age Group Comparison Section --- */}
      <section className="bg-white py-20 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              Find the Perfect Program for Your Child
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Our age-appropriate programs are designed to match your child's developmental stage
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[
              {
                age: "4-6 Years",
                program: "Tots Program",
                focus: "Motor Skills & Fun",
                skills: ["Basic coordination", "Introduction to tennis", "Social skills"],
                duration: "45-minute sessions"
              },
              {
                age: "7-10 Years",
                program: "Beginners Program",
                focus: "Fundamentals & Rallying",
                skills: ["All basic strokes", "Scoring & rules", "Court movement"],
                duration: "1-hour sessions"
              },
              {
                age: "11-14 Years",
                program: "Intermediate Teens",
                focus: "Skill Development",
                skills: ["Advanced techniques", "Match strategy", "Fitness training"],
                duration: "2 hour sessions"
              },
              {
                age: "15-18 Years",
                program: "Advanced/Competitive",
                focus: "Tournament Play",
                skills: ["High-level strategy", "Mental toughness", "College preparation"],
                duration: "2-hour sessions"
              }
            ].map((group, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-gray-800">
                <div className="text-center mb-4">
                  <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full dark:bg-green-900 dark:text-green-200">
                    {group.age}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3 dark:text-white">{group.program}</h3>
                <p className="text-green-600 font-semibold text-center mb-4 dark:text-green-400">{group.focus}</p>
                <ul className="space-y-2 mb-4">
                  {group.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckIcon />
                      <span className="ml-2">{skill}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-600 text-center dark:text-gray-400">{group.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Related Courses Section --- */}
      <section className="bg-gradient-to-br from-gray-100 to-white py-20 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2 dark:text-white">
              Explore Related Tennis Programs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover other tennis programs in Phoenix to match every skill and age level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {PHOENIX_COURSES.map((course) => (
              <div
                key={course.id}
                className="flex flex-col justify-between bg-white rounded-xl shadow-lg border border-gray-200 min-h-[400px] transition-transform hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-800"
              >
                <Image
                  src={course.image}
                  alt={course.title}
                  width={320}
                  height={160}
                  className="rounded-t-xl object-cover w-full h-40"
                />
                <div className="p-6 flex flex-col flex-grow">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold rounded-full px-3 py-1 mb-3 dark:bg-green-900 dark:text-green-200">
                    {course.ageRange}
                  </span>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{course.title}</h3>
                  <p className="text-gray-700 mb-5 flex-grow dark:text-gray-300">{course.description}</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <button
                      onClick={() => router.push(`/courses/${course.courseURL}`)}
                      className="border-2 border-green-600 text-green-600 bg-white rounded-lg px-6 py-2 font-semibold transition hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/booking/course/${course.id}`)}
                      className="bg-green-600 text-white rounded-lg px-6 py-2 font-semibold shadow-md transition hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WinterCampShortDetails />

      {/* --- Adult Tennis CTA Section --- */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 dark:from-blue-700 dark:to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Tennis for the Whole Family
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            While your kids are developing their skills, you can improve your game too! 
            Check out our adult tennis programs in Gilbert.
          </p>
          <a
            href="https://teamhippa.com/gilbert-adult-tennis-clinics"
            className="inline-flex items-center gap-3 bg-white text-blue-700 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl dark:bg-blue-100 dark:text-blue-800 dark:hover:bg-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Explore Adult Tennis Programs
          </a>
        </div>
      </section>

      {/* --- Google Reviews Section --- */}
      <section className="bg-gray-50 py-20 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              What Phoenix Families Say
            </h2>
            <p className="text-lg text-gray-700 mb-8 dark:text-gray-300">
              Read genuine reviews from parents and players on Google
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

      {/* --- CTA Section --- */}
      <section className="bg-green-700 text-white py-16 dark:bg-green-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Child's Tennis Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-green-100">
            Join hundreds of Phoenix families who have discovered the joy of tennis at Team Hippa. 
            Limited spots available for the upcoming season.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all dark:bg-gray-100 dark:text-green-800 dark:hover:bg-white"
            >
              Book Trial Class
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="bg-green-800 border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 text-lg font-semibold rounded-lg transition-all dark:bg-green-900 dark:border-green-300 dark:hover:bg-white dark:hover:text-green-800"
            >
              Contact Our Coaches
            </button>
          </div>
          <p className="mt-4 text-green-200 dark:text-green-300">
            Have questions? Call us at +1 602-341-3361 and Email: info@teamhippa.com
          </p>
          
          {/* Adult Tennis Link */}
          <div className="mt-8 pt-6 border-t border-green-500 border-opacity-30">
            <p className="text-green-200 mb-3">Looking for adult tennis programs?</p>
            <a
              href="https://teamhippa.com/gilbert-adult-tennis-clinics"
              className="inline-flex items-center gap-2 text-green-200 hover:text-white transition-colors"
            >
              <span>Explore our Adult Tennis Programs in Gilbert</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* --- Inquiry Form Section --- */}
      <section id="inquiry-form" className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Lead Form */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-md dark:bg-gray-800 dark:shadow-gray-900">
              <h2 className="text-3xl font-bold text-black mb-3 dark:text-white">Book Your Free Trial Class!</h2>
              <p className="text-gray-700 mb-6 dark:text-gray-300">
                Enter your details and we'll contact you to schedule a{' '}
                <span className="font-bold dark:text-white">free trial class</span> at our Phoenix location. No
                commitment, just fun!
              </p>
              <Inquiry />
            </div>

            {/* Location Info */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-black mb-4 dark:text-white">Our Phoenix Tennis Facility</h2>
              <div className="mb-4">
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">Rose Mofford Sports Complex</p>
                <p className="text-lg text-gray-600 dark:text-gray-400">9833 N 25th Ave</p>
                <p className="text-lg text-gray-600 dark:text-gray-400">Phoenix, AZ 85021</p>
              </div>
              <p className="text-lg text-gray-700 mb-6 dark:text-gray-300">
                We are conveniently located at the beautiful Rose Mofford complex, easily accessible
                from the I-17 and serving all of North Phoenix.
              </p>

              <div className="overflow-hidden rounded-lg shadow-xl dark:shadow-gray-900">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.155823150244!2d-112.1016834847995!3d33.57551938075328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b1a8300000001%3A0xb3e64522606b2b5f!2sRose%20Mofford%20Sports%20Complex!5e0!3m2!1sen!2sus!4v1678886400000!5m2!1sen!2sus"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Team Hippa Phoenix Location Map"
                  className="dark:filter dark:brightness-90 dark:contrast-110"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}