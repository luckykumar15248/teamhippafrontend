"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import SportsHeroSection from "@/app/components/SportsHeroSection";
import PackageCard from "@/app/components/PackageCard";
import { Button } from "@/app/components/Button";
import FAQ from "@/app/components/FAQ";
import GoogleReviewsWidget from "@/app/components/GoogleReviewsWidget/GoogleReviewsWidget";
import { PACKAGE_PAGE_FAQS } from "@/untils/constant";
import { toast } from "react-toastify";

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

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8091";

export default function PackagesClient() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState("Gilbert");
    const locations = ["Gilbert", "Phoenix"];
    const router = useRouter();

    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `${apiUrl}/api/public/packages/packages-by-location`,
                    { params: { location: selectedLocation } }
                );
                setPackages(res.data || []);
            } catch {
                toast.error("Unable to load packages");
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, [selectedLocation]);

    return (
        <main className="bg-white text-gray-900">
            <SportsHeroSection
                bgImage="/images/tennis.png"
                title="Tennis Training Packages"
                description="Elite tennis coaching programs designed for beginners to competitive players in Gilbert & Phoenix."
            />

            {/* SEO Content Intro */}
            <section className="max-w-6xl mx-auto px-6 py-16 text-center">
                <h1 className="text-5xl font-bold mb-6">
                    Professional Tennis Coaching Programs
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    At Team Hippa Tennis Academy, we provide structured tennis training
                    packages for juniors and adults. Our certified coaches deliver modern,
                    performance-driven coaching in Gilbert and Phoenix, helping players
                    achieve measurable improvement.
                </p>
            </section>

            {/* Location Tabs */}
            <section className="max-w-6xl mx-auto px-6">
                <div className="flex justify-center gap-10 border-b mb-10">
                    {locations.map((loc) => (
                        <button
                            key={loc}
                            onClick={() => setSelectedLocation(loc)}
                            className={`pb-3 text-lg font-semibold border-b-2 transition ${selectedLocation === loc
                                    ? "border-green-600 text-green-600"
                                    : "border-transparent text-gray-500 hover:text-green-600"
                                }`}
                        >
                            {loc}
                        </button>
                    ))}
                </div>
            </section>

            {/* Packages Grid */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {packages.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                onNavigate={() => router.push(`/packages/${pkg.slug}`)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* SEO Value Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Why Choose Team Hippa Tennis Academy?
                    </h2>
                    <p className="text-lg text-gray-600 mb-12">
                        Our tennis training programs combine technical mastery, athletic
                        development, and match-play strategy to produce long-term results.
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
                        {[
                            ["Certified Coaches", "National & international coaching experience."],
                            ["Modern Curriculum", "Progressive training system for all levels."],
                            ["Performance Tracking", "Skill assessments & match feedback."],
                            ["Junior Development", "Strong fundamentals for young players."],
                            ["Adult Programs", "Fitness-based learning for adults."],
                            ["Flexible Scheduling", "Morning & evening batches available."],
                        ].map(([title, desc]) => (
                            <div
                                key={title}
                                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                            >
                                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                                <p className="text-gray-600">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-12">How Our Training Works</h2>
                <div className="grid md:grid-cols-3 gap-10">
                    {[
                        ["1", "Select Your Program", "Choose the perfect package for your skill level."],
                        ["2", "Enroll & Schedule", "Pick convenient class timings."],
                        ["3", "Train & Improve", "Develop skills with expert coaching."],
                    ].map(([n, title, desc]) => (
                        <div key={n} className="bg-gray-50 p-8 rounded-xl shadow">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold mb-4 mx-auto">
                                {n}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{title}</h3>
                            <p className="text-gray-600">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Premium Google Reviews Section --- */}
            <section className="bg-white py-24">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="inline-block mb-4 text-sm font-semibold tracking-widest text-green-600 uppercase">
                            Parent & Player Reviews
                        </span>

                        <h2 className="text-4xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                            Trusted by <span className="text-green-600">1000+</span> Families
                        </h2>

                        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                            Discover why parents and players across Gilbert & Phoenix trust Team Hippa
                            for professional tennis coaching, junior development, and elite training programs.
                        </p>
                    </div>

                    {/* Reviews Widget */}
                    <div className="max-w-6xl mx-auto">
                        <div
                            className="embedsocial-reviews rounded-3xl border border-gray-200 shadow-sm bg-white p-6 md:p-10"
                            data-ref="1c1b7f2c374a3a7e8144775a7c2b2273"
                            data-width="100%"
                        >
                            <GoogleReviewsWidget />
                        </div>
                    </div>

                    {/* Trust Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-14 text-center">
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                            <div className="text-3xl font-extrabold text-green-600 mb-2">4.9★</div>
                            <p className="text-gray-600">Google Rating</p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                            <div className="text-3xl font-extrabold text-green-600 mb-2">1000+</div>
                            <p className="text-gray-600">Happy Families</p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                            <div className="text-3xl font-extrabold text-green-600 mb-2">10+ Years</div>
                            <p className="text-gray-600">Coaching Excellence</p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mt-16">

                        <a
                            href="https://www.google.com/maps/place/Team+Hippa+-+Tennis+Academy/@33.0264402,-111.6789136,15z/data=!4m8!3m7!1s0xda8ab47fa7a90cd:0xf4d832507b1651bb!8m2!3d33.0264402!4d-111.6789136!9m1!1b1!16s%2Fg%2F11wwm9klzg?entry=ttu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-xl shadow-sm transition"
                        >
                            Read All Google Reviews
                        </a>

                        <a
                            href="https://www.google.com/maps/place/Team+Hippa+-+Tennis+Academy/@33.0264402,-111.6789136,15z/data=!4m8!3m7!1s0xda8ab47fa7a90cd:0xf4d832507b1651bb!8m2!3d33.0264402!4d-111.6789136!9m1!1b1!16s%2Fg%2F11wwm9klzg?entry=ttu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-10 py-4 border border-gray-300 text-gray-800 font-semibold text-lg rounded-xl hover:bg-gray-50 transition"
                        >
                            Write a Review
                        </a>

                    </div>

                </div>
            </section>



            {/* CTA */}
            {/* Premium SEO CTA Section */}
            <section className="bg-gray-50 py-24">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">

                    {/* Left Content */}
                    <div>
                        <h2 className="text-5xl font-bold leading-tight mb-6">
                            Start Your Professional Tennis Journey Today
                        </h2>

                        <p className="text-lg text-gray-600 mb-6">
                            Whether you're a beginner learning the basics or a competitive player
                            chasing performance excellence, Team Hippa Tennis Academy provides
                            structured coaching programs that deliver measurable improvement.
                        </p>

                        <ul className="space-y-3 text-gray-700 mb-10">
                            <li>✔ Certified international tennis coaches</li>
                            <li>✔ Junior & adult professional training programs</li>
                            <li>✔ Flexible morning & evening schedules</li>
                            <li>✔ Proven results in player development</li>
                        </ul>

                        <div className="flex flex-wrap gap-4">
                            <Button
                                onClick={() => router.push("/book-now")}
                                className="px-10 py-4 rounded-xl text-lg shadow-lg"
                            >
                                Book Free Trial
                            </Button>

                            <a
                                href="/contact"
                                className="px-10 py-4 rounded-xl border-2 border-green-600 text-green-600 hover:bg-green-50 transition"
                            >
                                Talk to Our Coaches
                            </a>
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="relative">
                        <div className="absolute -top-6 -left-6 w-full h-full bg-green-100 rounded-3xl"></div>
                        <img
                            src="/images/cta-tennis.jpg"
                            alt="Professional Tennis Coaching"
                            className="relative z-10 rounded-3xl shadow-xl object-cover w-full h-[420px]"
                        />
                    </div>

                </div>
            </section>


            <FAQ
                title="Tennis Training Packages – Frequently Asked Questions"
                subtitle="Answers about our tennis coaching packages, pricing, customization, schedules, and enrollment options"
                data={PACKAGE_PAGE_FAQS}
            />
        </main>
    );
}
