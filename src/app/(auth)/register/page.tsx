// File: app/(auth)/register/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import Input from "@/app/components/Input";
import { Button } from "@/app/components/Button";
//import { AppleIcon, GoogleIcon } from "@/app/components/Icons";
import Image from "next/image";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const usPhoneRegex = /^(\+?1\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/;

     if (!usPhoneRegex.test(phoneNumber)) {
      const msg = "Please enter a valid American phone number.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${apiUrl}/api/auth/signup`,
        // ✅ FIX: Added firstName and lastName to the API request payload
        { firstName, lastName, username, phoneNumber, email, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Registration successful! Please verify your email.");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        const errorMessage = res.data?.message || "Registration failed.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      let errorMessage = "An unexpected error occurred.";
      
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.message || `Registration failed: ${err.response.statusText}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div
        className="relative max-w-md md:max-w-4xl w-full flex bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="hidden w-1/2 md:flex flex-col p-6 justify-between items-center bg-[url('/images/login-banner.png')] bg-cover bg-center rounded-l-xl">
          <div className="w-full flex justify-start">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="TeamHippa-logo"
                width={150}
                height={50}
                className="w-22 h-16"
              />
            </Link>
          </div>
          <div>
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">TeamHippa</h1>
            </Link>
          </div>
        </div>
        <div className="p-10 w-full md:w-1/2">
          <div>
            <h2 className="text-3xl font-semibold text-[#b0db72]">
              Create an Account
            </h2>
            <p className="mt-2 text-base font-semibold text-gray-600">
              Enter your information to get started.
            </p>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                <p>{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isLoading}
              />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
             <Input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              autoComplete="tel"
              required
              placeholder="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
            />
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Input
              id="password_register"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />

            <div>
              <Button
                type="submit"
                isLoading={isLoading}
                className="text-white px-4 py-2 rounded w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6">
             <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            {/*
            <div className="mt-6 grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  isLoading={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm !font-medium !text-black hover:bg-gray-50 disabled:opacity-50"
                >
                  <GoogleIcon className="min-w-4 min-h-4" />
                  Sign up with Google
                </Button>
                <Button
                  type="button"
                  isLoading={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm !font-medium !text-black hover:bg-gray-50 disabled:opacity-50"
                >
                  <AppleIcon className="min-w-4 min-h-4" />
                  Sign up with Apple
                </Button>
            </div> */}
            <p className="mt-4 text-center text-sm text-gray-600">
              <Link href="/login">
                Already have an account?{" "}
                <span className="font-medium text-[#b0db72] hover:text-[#64a506]">
                  Log in
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;