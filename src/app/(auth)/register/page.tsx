"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import Input from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { AppleIcon, GoogleIcon } from "@/app/components/Icons";
import Image from "next/image";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";

interface RegisterProps {
  onClick?: () => void;
}
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const Register: React.FC<RegisterProps> = ({ onClick }) => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

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
        `${apiUrl}api/auth/signup`,
        { username, email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: false,
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
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div
      onClick={onClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div
       onClick={(e) => e.stopPropagation()}
       className="relative max-w-md md:max-w-4xl w-full flex space-y-8 bg-white rounded-xl shadow-lg"
       >
        
        <CloseIcon
          onClick={onClick}
          className="absolute right-5 top-4 cursor-pointer"
        />
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
              Register Yourself!
            </h2>
            <p className="mt-2 text-base font-semibold text-gray-600">
              Enter your information to register for
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p>{error}</p>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
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
              </div>
              <div className="mt-2">
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
              </div>
              <div className="mt-2">
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
              </div>
              <div className="mt-2">
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
              </div>
            </div>

            <div>
              <Button
                type="submit"
                isLoading={isLoading}
                className="text-white px-4 py-2 rounded w-full"
              >
                Create Account
              </Button>
            </div>
          </form>

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
                Already have an account?{" "}
                <span className="text-[#b0db72] hover:text-[#64a506]">
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

export default Register;
