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

// --- Type Definitions ---
interface Package {
  id: number;
  name: string;
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
  const [locations] = useState<string[]>(['Gilbert', 'Phoenix']); // Your locations
  const [selectedLocation, setSelectedLocation] = useState<string>('Gilbert'); // Default location
  const router = useRouter();

  const handleTrialClick = () => {
    router.push("/book-now");
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Updated API call to fetch packages based on the selected location
        const response = await axios.get(`${apiUrl}/api/public/packages/packages-by-location`, {
            params: {
                location: selectedLocation,
            }
        });
        setPackages(response.data || []);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
        toast.error("Could not load our packages. Please try again later.");
        setPackages([]); // Clear packages on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedLocation]); // Re-fetch data when selectedLocation changes

  const handleNavigate = (packageId: number) => {
    router.push(`/packages/${packageId}`);
  };

  return (
    <>
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Our Packages"
        description="Discover value-packed bundles that combine our best courses to accelerate your skills."
      />
      <div className="space-y-12 container mx-auto sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12">
        
        {/* --- LOCATION FILTER TABS --- */}
        <div className="mb-8 flex justify-center border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Locations">
                {locations.map((location) => (
                    <button
                        key={location}
                        onClick={() => setSelectedLocation(location)}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
                            selectedLocation === location
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {location}
                    </button>
                ))}
            </nav>
        </div>

        {isLoading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
             </div>
        ) : packages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onNavigate={handleNavigate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700">
              No Packages Currently Available for {selectedLocation}
            </h3>
            <p className="mt-2 text-gray-500">
              Please check back soon or select another location.
            </p>
          </div>
        )}
      </div>
      
      <section className="bg-gray-50 py-4 sm:py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold text-black mb-4">
            Why Choose Our Packages?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our programs are carefully curated to meet the needs of beginners to
            advanced players. With certified coaches, flexible schedules, and
            personalized guidance, we ensure you progress confidently.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-white rounded-lg shadow">
              <h4 className="text-xl font-semibold mb-2">Certified Coaches</h4>
              <p className="text-gray-600">
                Train under experienced professionals with national and
                international exposure.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h4 className="text-xl font-semibold mb-2">
                Structured Curriculum
              </h4>
              <p className="text-gray-600">
                Progressive training plans tailored to your skill level and
                goals.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h4 className="text-xl font-semibold mb-2">Affordable Bundles</h4>
              <p className="text-gray-600">
                Get maximum value from competitively priced packages.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-4 sm:py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold text-black mb-6">Success Stories</h2>
          <p className="text-lg text-gray-600 mb-10">
            Hear from our students who trained with us and achieved their
            dreams.
          </p>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-gray-100 rounded-lg">
              <p className="text-gray-700 italic">
                &quot;Joining this academy changed my game! I went from amateur to
                tournament-ready in 6 months.&quot;
              </p>
              <p className="mt-4 font-semibold">— Rohan, Student</p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg">
              <p className="text-gray-700 italic">
                &quot;Their customized packages helped my daughter train at her pace
                while keeping up with school.&quot;
              </p>
              <p className="mt-4 font-semibold">— Priya, Parent</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-gray-50 py-4 sm:py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold text-black mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-4">
              <h4 className="text-xl font-semibold mb-2">Browse Packages and Courses</h4>
              <p className="text-gray-600">
                Explore various training bundles designed for different skill
                levels.
              </p>
            </div>
            <div className="p-4">
              <h4 className="text-xl font-semibold mb-2">Enroll and Purchase Package</h4>
              <p className="text-gray-600">
                Get a feel for our training sessions with a no-obligation free
                trial.
              </p>
            </div>
            <div className="p-4">
              <h4 className="text-xl font-semibold mb-2">Book into the class, and your attendance is confirmed</h4>
              <p className="text-gray-600">
                Choose your schedule and begin your tennis journey with our
                expert coaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-4xl sm:text-5xl font-semibold text-center text-black mb-4">
            Flexible Training Schedules
          </h3>
          <p className="text-base sm:text-lg text-gray-600 font-normal mb-6">
            Morning and evening batches available. Join at your convenience.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleTrialClick}
              className="text-white px-6 py-3 transition"
            >
              Book Now
            </Button>
          </div>
        </div>
      </section>

      <FAQ
        title="The fastest growing Tennis Academy"
        subtitle="Feel free to ping us incase there is any doubts you have. Our team will love to help you out."
        data={ABOUT_FAQS}
      />
    </>
  );
};

export default PackagesPage;