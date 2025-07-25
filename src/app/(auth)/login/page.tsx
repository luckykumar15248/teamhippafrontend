"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import Input from "@/app/components/Input";
import Image from "next/image";
import { AppleIcon, GoogleIcon } from "@/app/components/Icons";

// Define a type for the user data to be parsed from localStorage


const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/login`,
        {
          usernameOrEmail: identifier,
          password: password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data?.success) {
        toast.success(response.data.message || "Login successful!");
        const responseData = response.data.data;
        const token = responseData?.token;
        const user = responseData?.user || responseData;

        if (token && user) {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userData", JSON.stringify(user));

          switch (user.roleName) {
            case "ADMIN":
              router.push("/dashboard");
              break;
            case "VISITOR_REGISTERED":
              router.push("/my-account");
              break;
            default:
              toast.error("Unauthorized user role.");
              router.push("/");
          }
        } else {
          throw new Error("Login successful, but no token or user data received.");
        }
      } else {
        throw new Error(response.data?.message || "Login failed. Please check your credentials.");
      }
    } catch (err: unknown) {
      let errorMessage = "Invalid credentials or server error.";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
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
                  <form className="space-y-6" onSubmit={handleLoginSubmit}>
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email or Username"
              id="identifier"
              name="identifier"
              type="text"
              placeholder="Enter your email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username email"
              required
              disabled={isLoading}
            />
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <Link href="/forgot-password" className="font-medium text-[#b0db72] hover:text-[#64a506]">
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md transition-colors"
          >
            Sign in
          </Button>
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
            </div>
            <p className="mt-4 text-center text-sm text-gray-600">
              <Link href="/register">
                 Not a member?{" "}
                <span className="font-medium text-[#b0db72] hover:text-[#64a506]">
                   Register here
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;