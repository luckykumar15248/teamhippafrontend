// File: app/(auth)/reset-password/page.tsx
// This page receives the token from the URL query parameters.

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import Input from "@/app/components/Input";
import Image from "next/image";

const ResetPasswordFormComponent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const tokenFromQuery = searchParams.get("token");
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    } else {
      setError(
        "Password reset token is missing or invalid. Please request a new one."
      );
      toast.error("Invalid password reset link.");
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!token) {
      setError("Password reset token is missing.");
      toast.error("Token is missing.");
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
      // API endpoint to perform the password reset
      // You will need to create this in Spring Boot
      const response = await axios.post(
        `${apiUrl}api/auth/reset-password`,
        {
          token: token,
          newPassword: password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data && response.data.success) {
        setSuccessMessage(
          response.data.message || "Your password has been reset successfully!"
        );
        toast.success(
          response.data.message ||
            "Password reset successful! Redirecting to login..."
        );

        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(
          response.data.message ||
            "Failed to reset password. The link may have expired."
        );
        toast.error(response.data.message || "Failed to reset password.");
      }
    } catch (err: unknown) {
      console.error("Reset Password error:", err);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        errorMessage = errorObj.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage);
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
              Set New Password
            </h2>
            <p className="mt-2 text-base font-semibold text-gray-600">
              Please enter and confirm your new password below.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                <p>{error}</p>
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                <p>{successMessage}</p>
              </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="new-password" className="sr-only">
                  New Password
                </label>
                <Input
                  id="new-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || !!successMessage} // Disable if success
                />
              </div>
              <div className="mt-2">
                
                <Input
                  id="confirm-new-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || !!successMessage} // Disable if success
                />
              </div>
            </div>

            <div>
               <Button
                              type="submit"
                              disabled={isLoading || !token || !!successMessage}

                              className="text-white px-4 py-2 rounded w-full"
                            >
                              Reset Password
                            </Button>
            </div>
          </form>
          {successMessage && (
            <div className="text-center text-sm mt-4">
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Proceed to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Use Suspense to handle reading search params, which is recommended by Next.js
const ResetPasswordPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFormComponent />
    </Suspense>
  );
};

export default ResetPasswordPage;
