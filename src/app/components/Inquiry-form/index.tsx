"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
const Inquiry: React.FC = () => {
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

  const referralOptions = [
    "Google Search",
    "Social Media (Facebook, Instagram, etc.)",
    "Friend or Family",
    "Advertisement",
    "Other",
  ];

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
        (c) => c.sportId === parseInt(selectedSport)
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

    setIsSubmitting(true);
    const finalReferral =
      referralSource === "Other" ? otherReferralSource : referralSource;

    const data = {
      visitorName: name,
      visitorEmail: email,
      visitorPhone: phone,
      sportId: selectedSport ? parseInt(selectedSport) : undefined,
      courseId: selectedCourse ? parseInt(selectedCourse) : undefined,
      message,
      referralSource: finalReferral,
    };

    try {
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
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <Input
          label="Full Name *"
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
        />
      </div>

      {/* Email */}
      <div>
        <Input
          label="Email *"
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
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
          placeholder="+1 123-456-7890"
        />
      </div>

      {/* Sport & Course */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Sport</label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="rounded relative block w-full px-3 py-3 border border-gray-300
   placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#b0db72] focus:border-[#b0db72]
   focus:z-10 sm:text-sm"
          >
              {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedSport}
            className="rounded relative block w-full px-3 py-3 border border-gray-300
   placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#b0db72] focus:border-[#b0db72]
   focus:z-10 sm:text-sm"
          >
            <option value="">Select a course</option>
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
          label="Message"
          id="message"
          name="message"
          type="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here..."
          required
        />
      </div>

      {/* Referral */}
      <div>
        <label className="block text-sm font-semibold mb-1">
          How did you hear about us?
        </label>
        <select
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
          className="rounded relative block w-full px-3 py-3 border border-gray-300
   placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#b0db72] focus:border-[#b0db72]
   focus:z-10 sm:text-sm"
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
          <label className="block text-sm font-semibold mb-1">
            Please specify
          </label>
          <input
            type="text"
            value={otherReferralSource}
            onChange={(e) => setOtherReferralSource(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Submit */}
      <div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Inquiry"}
        </Button>
      </div>
    </form>
  );
};

export default Inquiry;
