"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- SVG Icon ---
const KeyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-indigo-600 mx-auto"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.623 5.91l-4.621 4.622a2.25 2.25 0 01-3.182-3.182l4.622-4.621A6 6 0 0117 7z"
    />
  </svg>
);

// --- Main Content Component ---
const ClaimAccountForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  useEffect(() => {
    if (!token) {
      setError(
        "No booking token provided. This link may be invalid or expired."
      );
      setIsLoading(false);
      return;
    }

    const fetchGuestInfo = async () => {
      try {
        // TODO: You will need to create this backend endpoint.
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        const response = await axios.get(
          `${apiUrl}/api/public/booking-data/guest-details/${token}`
        );
        const guestInfo = response.data;
        console.log("Guest Info:", response.data);
        // MOCK DATA for demonstration:
        /*   const mockGuestInfo: GuestBookingInfo = {
                    email: 'guest.user@example.com',
                    firstName: 'Guest',
                    lastName: 'User'
                };*/

        //Pre-fill the form fields
        setEmail(guestInfo.email);
        setFirstName(guestInfo.firstName);
        setLastName(guestInfo.lastName);
      } catch (err) {
        setError(
          "Could not retrieve your booking information. This link may be invalid or expired."
        );
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuestInfo();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: You will need to create this backend endpoint.
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      await axios.post(`${apiUrl}/api/auth/convert-guest`, {
        token,
        username,
        password,
        firstName, // Send the potentially edited name
        lastName, // Send the potentially edited name
      });

      // MOCK SUCCESS for demonstration:
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Account created successfully! Please log in to continue.");
      router.push("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message ||
            "Failed to create account. The username may already be taken."
        );
      } else {
        toast.error(
          "Failed to create account. The username may already be taken."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your booking link...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto">
        <h2 className="text-2xl font-semibold text-red-600">Invalid Link</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <KeyIcon />
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
          Claim Your Account
        </h1>
        <p className="mt-2 text-md text-gray-600">
          Create a password to manage your bookings for{" "}
          <span className="font-semibold text-indigo-600">{email}</span>.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 shadow-lg rounded-lg"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Choose a Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Create a Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isSubmitting ? "Creating Account..." : "Create My Account"}
          </button>
        </div>
      </form>
    </div>
  );
};

// The main page component uses Suspense to handle the use of searchParams
const ClaimAccountPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      }
    >
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <ClaimAccountForm />
      </div>
    </Suspense>
  );
};

export default ClaimAccountPage;
