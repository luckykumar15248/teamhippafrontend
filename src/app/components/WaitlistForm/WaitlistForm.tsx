"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../Button";

interface WaitlistSubmission {
  sportName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  age?: number;
  skillLevel?: string;
  notes?: string;
  userId?: number;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const WaitlistForm: React.FC<{
  sportName: "Pickleball" | "Tennis" | "Winter Camp" | "Summer Camp";
  onClose: () => void;
}> = ({ sportName, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      axios
        .get(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const user = response.data;
          setCurrentUser(user);
          setName(`${user.firstName} ${user.lastName}`);
          setEmail(user.email);
          if (user.phone) setPhone(user.phone);
        });
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setIsSubmitting(true);

    const payload: WaitlistSubmission = {
      sportName,
      guestName: name,
      guestEmail: email,
      guestPhone: phone,
      age: age ? Number(age) : undefined,
      skillLevel,
      notes,
      userId: currentUser?.id,
    };

    try {
      // This endpoint will need to be created on your backend
      await axios.post(`${apiUrl}/api/public/waitlist/join`, payload);

      toast.success(
        `You've been added to the ${sportName} waitlist! We'll be in touch.`
      );
       onClose();
      // Reset form fields after successful submission
      if (!currentUser) {
        setName("");
        setEmail("");
        setPhone("");
      }              
      setAge("");
      setSkillLevel("Beginner");
      setNotes("");
    } catch (error) {
      toast.error(
        "There was an error submitting your request. Please try again."
      );
      console.error("Waitlist submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50  flex items-center justify-center p-4 z-50"
    >
      <div className="max-w-lg w-full">
        <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white p-8 rounded-xl shadow-lg border border-gray-200"
        >
          <CloseIcon
            onClick={onClose}
            className="absolute top-4 right-4 cursor-pointer"
          />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Join the {sportName} Waitlist
          </h2>
          <p className="text-gray-600 mb-6">
            Spots are limited. Be the first to know when a new opening is
            available!
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`name-${sportName}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id={`name-${sportName}`}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor={`email-${sportName}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id={`email-${sportName}`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`phone-${sportName}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  id={`phone-${sportName}`}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor={`age-${sportName}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Age
                </label>
                <input
                  id={`age-${sportName}`}
                  type="number"
                  value={age}
                  onChange={(e) =>
                    setAge(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor={`skill-${sportName}`}
                className="block text-sm font-medium text-gray-700"
              >
                Skill Level
              </label>
              <select
                id={`skill-${sportName}`}
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Not Sure</option>
              </select>
            </div>
            <div>
              <label
                htmlFor={`notes-${sportName}`}
                className="block text-sm font-medium text-gray-700"
              >
                Additional Notes (Optional)
              </label>
              <textarea
                id={`notes-${sportName}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                rows={3}
              ></textarea>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Join Waitlist"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WaitlistForm;
