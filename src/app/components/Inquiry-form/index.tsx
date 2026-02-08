"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Button } from "../Button";
import Input from "../Input";

interface Sport {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
  sportId: number;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const referralOptions = [
  "Google Search",
  "Social Media (Facebook, Instagram, etc.)",
  "Friend or Family",
  "Advertisement",
  "Other",
];

const ContactForm: React.FC = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [message, setMessage] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [otherReferralSource, setOtherReferralSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sports, setSports] = useState<Sport[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sportsRes, coursesRes] = await Promise.all([
          axios.get(`${apiUrl}/api/public_api/sports`),
          axios.get(`${apiUrl}/api/public_api/courses`),
        ]);
        setSports(sportsRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        toast.error("Failed to load sports or courses");
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSport) {
      const filtered = courses.filter(
        (c) => c.sportId === parseInt(selectedSport, 10)
      );
      setFilteredCourses(filtered);
      setSelectedCourse("");
    } else {
      setFilteredCourses([]);
    }
  }, [selectedSport, courses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!executeRecaptcha) {
      toast.error("reCAPTCHA has not loaded, please try again later.");
      return;
    }

    setIsSubmitting(true);

    try {
      const recaptchaToken = await executeRecaptcha("contact_form");
      if (!recaptchaToken) {
        toast.error("reCAPTCHA verification failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const finalReferral =
        referralSource === "Other" ? otherReferralSource : referralSource;

      const data = {
        visitorName: name,
        visitorEmail: email,
        visitorPhone: phone,
        sportId: selectedSport ? parseInt(selectedSport, 10) : undefined,
        courseId: selectedCourse ? parseInt(selectedCourse, 10) : undefined,
        message,
        referralSource: finalReferral,
        recaptchaToken,
      };

      await axios.post(`${apiUrl}/api/public_api/inquiries`, data);

      toast.success("Inquiry submitted successfully!");

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setSelectedSport("");
      setSelectedCourse("");
      setMessage("");
      setReferralSource("");
      setOtherReferralSource("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("reCAPTCHA validation failed from server. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <form onSubmit={handleSubmit} className="space-y-8">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Name */}
      <div>
        <Input
          label="Full Name *"
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
        />
      </div>

      {/* Email */}
      <div>
        <Input
          label="Email Address *"
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>
    </div>

    {/* Phone */}
    <div>
      <Input
        label="Phone Number *"
        id="phone"
        name="phone"
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1 234 567 890"
        required
      />
    </div>

    {/* Sport & Course */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Select Sport
        </label>
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b0db72] focus:border-[#b0db72] transition"
        >
          <option value="">Choose a sport</option>
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          disabled={!selectedSport}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b0db72] focus:border-[#b0db72] transition disabled:bg-gray-100"
        >
          <option value="">Choose a course</option>
          {filteredCourses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* Message */}
    <div>
      <Input
        label="Message *"
        id="message"
        name="message"
        type="textarea"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tell us about your goals, experience, or questions..."
        required
      />
    </div>

    {/* Referral */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        How did you hear about us?
      </label>
      <select
        value={referralSource}
        onChange={(e) => setReferralSource(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b0db72] focus:border-[#b0db72] transition"
      >
        <option value="">Select an option</option>
        {referralOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>

    {referralSource === "Other" && (
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Please specify
        </label>
        <input
          type="text"
          value={otherReferralSource}
          onChange={(e) => setOtherReferralSource(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#b0db72] focus:border-[#b0db72] transition"
        />
      </div>
    )}

    {/* Submit */}
    <div className="pt-4">
      <Button
        className="w-full py-4 text-lg rounded-xl bg-[#b0db72] hover:bg-[#9acd50] transition"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
      </Button>
    </div>

    {/* Footer Note */}
    <p className="text-xs text-gray-500 text-center pt-4 leading-relaxed">
      This site is protected by reCAPTCHA and the Google{" "}
      <a
        href="https://policies.google.com/privacy"
        className="text-[#7aa63a] hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Privacy Policy
      </a>{" "}
      and{" "}
      <a
        href="https://policies.google.com/terms"
        className="text-[#7aa63a] hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Terms of Service
      </a>{" "}
      apply.
    </p>

  </form>


  );
};

export default ContactForm;
