"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import { AppleIcon, GoogleIcon } from "@/app/components/Icons";
import Input from "@/app/components/Input";
import Image from "next/image";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (!email) {
      toast.error("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/forgot-password`,
        { email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data && response.data.success) {
        toast.success(
          response.data.message ||
            "If an account exists for this email, a password reset link has been sent."
        );
        setMessage(
          response.data.message ||
            "If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder)."
        );
        setEmail("");
      } else {

        const errMsg =
          response.data.message ||
          "Could not process password reset request. Please try again.";
        toast.error(errMsg);
        setMessage(errMsg);
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again later.";
      toast.error(errorMessage);
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md md:max-w-4xl w-full flex space-y-8 bg-white rounded-xl shadow-lg">
          <div className="hidden w-1/2 md:flex flex-col p-6 justify-between items-center  mb-0 bg-[url('/images/login-banner.png')] bg-cover bg-center rounded-l-xl">
            <div className="w-full flex justify-baseline">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="eamHippa-logo"
                width={150}
                height={50}
                className="w-22 h-16"
              />
            </Link>
          </div>
            <div className="">
              <Link href="/" className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">TeamHippa</h1>
              </Link>
            </div>
          </div>
          <div className="p-10 w-full md:w-1/2">
          <div>
            <h2 className="text-3xl font-semibold text-[#b0db72]">
              Forgot Password?
            </h2>
            <p className="mt-2 text-base font-semibold text-gray-600">
              Enter your email to reset your password.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.toLowerCase().includes("error") ||
                  message.toLowerCase().includes("could not") ||
                  message.toLowerCase().includes("failed")
                    ? "bg-red-100 border border-red-400 text-red-700"
                    : "bg-green-100 border border-green-400 text-green-700"
                }`}
              >
                <p>{message}</p>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <Input
                  id="email-address-forgot"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="text-white px-4 py-2 rounded w-full"
                >
                  Send Reset Instructions
                </Button>
              </div>
            </div>
          </form>
           <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or sign in with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <div>

                  <Button
                    type="button"
                    isLoading={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm !font-medium !text-black hover:bg-gray-50 disabled:opacity-50"
                  >
                    <GoogleIcon className="min-w-4 min-h-4" />
                    Sign in with Google
                  </Button>
                </div>
                <div>
                  <Button
                    type="button"
                    isLoading={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm !font-medium !text-black hover:bg-gray-50 disabled:opacity-50"
                  >
                    <AppleIcon className="min-w-4 min-h-4" />
                    Sign in with Apple
                  </Button>
                </div>
                <p className="mt-2 text-center text-base font-normal text-gray-600">
                  <Link href="/login">
                    Don’t have an account?{" "}
                    <span className="text-[#b0db72] hover:text-[#64a506]">
                      Login
                    </span>
                  </Link>
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
