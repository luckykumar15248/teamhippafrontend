"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { ABOUT_FAQS } from "@/untils/constant";
import SportsHeroSection from "@/app/components/SportsHeroSection";
import PackageCard from "@/app/components/PackageCard";
import { Button } from "@/app/components/Button";
import FAQ from "@/app/components/FAQ";
import Meta from "../components/Meta";
import GoogleReviewsWidget from "@/app/components/GoogleReviewsWidget/GoogleReviewsWidget";

// --- Type Definitions ---
interface Package {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  imageUrls: string[];
  isActive: boolean;
}
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8091';

// --- Main Page Component ---
const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [locations] = useState<string[]>(['Gilbert', 'Phoenix']);
  const [selectedLocation, setSelectedLocation] = useState<string>('Gilbert');
  const router = useRouter();

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = 
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleTrialClick = () => {
    router.push("/book-now");
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/api/public/packages/packages-by-location`, {
            params: {
                location: selectedLocation,
            }
        });
        setPackages(response.data || []);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
        toast.error("Could not load our packages. Please try again later.");
        setPackages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedLocation]);

  const handleNavigate = (packageId: number, packageSlug: string) => {
    router.push(`/packages/${packageSlug}`);
  };

  return (
    <>
      <Meta
        title="Our Packages | Value-Packed Tennis Training"
        description="Discover value-packed tennis bundles combining our best courses to accelerate your skills."
        image="/images/package.png"
        url="https://teamhippa.com/packages"
      />
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Our Packages"
        description="Discover value-packed bundles that combine our best courses to accelerate your skills."
      />
      
      {/* Main Packages Section */}
      <div className={`space-y-12 container mx-auto sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        
        {/* Location Filter Tabs */}
        <div className={`mb-8 flex justify-center border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <nav className="-mb-px flex space-x-8" aria-label="Locations">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${
                  selectedLocation === location
                    ? `border-[#64a506] ${
                        isDarkMode ? 'text-green-400' : 'text-[#64a506]'
                      }`
                    : `border-transparent ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`
                }`}
              >
                {location}
              </button>
            ))}
          </nav>
        </div>

        {/* Packages Grid or Loading/Empty States */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${
              isDarkMode ? 'border-green-500' : 'border-[#64a506]'
            }`}></div>
          </div>
        ) : packages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {packages.map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                pkg={pkg} 
                onNavigate={(id, slug) => handleNavigate(id, slug)}
          
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 rounded-lg shadow ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white'
          }`}>
            <h3 className={`text-xl font-semibold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              No Packages Currently Available for {selectedLocation}
            </h3>
            <p className={`mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Please check back soon or select another location.
            </p>
          </div>
        )}
      </div>
      
      {/* Why Choose Our Packages Section */}
      <section className={`py-4 sm:py-8 md:py-12 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-4xl sm:text-5xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            Why Choose Our Packages?
          </h2>
          <p className={`text-lg mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Our programs are carefully curated to meet the needs of beginners to
            advanced players. With certified coaches, flexible schedules, and
            personalized guidance, we ensure you progress confidently.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 text-left">
            <div className={`p-6 rounded-lg shadow transition-transform duration-300 hover:scale-[1.02] ${
              isDarkMode 
                ? 'bg-gray-900 border border-gray-700 hover:border-green-500/30' 
                : 'bg-white hover:shadow-lg'
            }`}>
              <h4 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Certified Coaches
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Train under experienced professionals with national and
                international exposure.
              </p>
            </div>
            <div className={`p-6 rounded-lg shadow transition-transform duration-300 hover:scale-[1.02] ${
              isDarkMode 
                ? 'bg-gray-900 border border-gray-700 hover:border-green-500/30' 
                : 'bg-white hover:shadow-lg'
            }`}>
              <h4 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Structured Curriculum
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Progressive training plans tailored to your skill level and
                goals.
              </p>
            </div>
            <div className={`p-6 rounded-lg shadow transition-transform duration-300 hover:scale-[1.02] ${
              isDarkMode 
                ? 'bg-gray-900 border border-gray-700 hover:border-green-500/30' 
                : 'bg-white hover:shadow-lg'
            }`}>
              <h4 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Affordable Bundles
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Get maximum value from competitively priced packages.
              </p>
            </div>
          </div>
        </div>
      </section>

     {/* --- Google Reviews Section --- */}
      <section className="bg-gray-50 py-20 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              What Families Say
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
      
      {/* How It Works Section */}
      <section className={`py-4 sm:py-8 md:py-12 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-4xl sm:text-5xl font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-left max-w-5xl mx-auto">
            <div className={`p-6 rounded-lg shadow ${
              isDarkMode 
                ? 'bg-gray-900 border border-gray-700' 
                : 'bg-white'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                isDarkMode 
                  ? 'bg-green-900/30 text-green-400' 
                  : 'bg-green-100 text-[#64a506]'
              }`}>
                <span className="text-xl font-bold">1</span>
              </div>
              <h4 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Browse Packages and Courses
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Explore various training bundles designed for different skill levels.
              </p>
            </div>
            <div className={`p-6 rounded-lg shadow ${
              isDarkMode 
                ? 'bg-gray-900 border border-gray-700' 
                : 'bg-white'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                isDarkMode 
                  ? 'bg-green-900/30 text-green-400' 
                  : 'bg-green-100 text-[#64a506]'
              }`}>
                <span className="text-xl font-bold">2</span>
              </div>
              <h4 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Enroll and Purchase Package
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Get a feel for our training sessions with a no-obligation free trial.
              </p>
            </div>
            <div className={`p-6 rounded-lg shadow ${
              isDarkMode 
                ? 'bg-gray-900 border border-gray-700' 
                : 'bg-white'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                isDarkMode 
                  ? 'bg-green-900/30 text-green-400' 
                  : 'bg-green-100 text-[#64a506]'
              }`}>
                <span className="text-xl font-bold">3</span>
              </div>
              <h4 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Book Classes & Confirm Attendance
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Choose your schedule and begin your tennis journey with our expert coaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 px-4 text-center ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800' 
          : 'bg-gradient-to-r from-green-50 to-white'
      }`}>
        <div className="max-w-3xl mx-auto">
          <h3 className={`text-4xl sm:text-5xl font-semibold text-center mb-4 ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            Flexible Training Schedules
          </h3>
          <p className={`text-base sm:text-lg font-normal mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Morning and evening batches available. Join at your convenience.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleTrialClick}
              className={`px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ${
                isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-[#64a506] hover:bg-[#559105] text-white'
              }`}
            >
              Book Now
            </Button>
          </div>
        </div>
      </section>

      <FAQ
        title="The fastest growing Tennis Academy"
        subtitle="Feel free to ping us in case there is any doubts you have. Our team will love to help you out."
        data={ABOUT_FAQS}
  
      />
    </>
  );
};

export default PackagesPage;