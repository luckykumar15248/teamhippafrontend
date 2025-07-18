"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import { AppleIcon, GoogleIcon } from "@/app/components/Icons";
import Input from "@/app/components/Input";
import Image from "next/image";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import RegisterPage from "../register/page";

interface LoginProps {
  onClick?: () => void;
  isOpen?: boolean;
}

const Login: React.FC<LoginProps> = ({ onClick, isOpen = true }) => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    agreed: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isVisible, setIsVisible] = useState(isOpen);

  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Sync visibility with parent component
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClose = () => {
    setIsVisible(false);
    onClick?.();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}api/auth/login`,
        {
          usernameOrEmail: formData.identifier,
          password: formData.password,
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

          handleClose();

          switch (user.roleName) {
            case "ADMIN":
              router.push("/dashboard");
              break;
            case "VISITOR_REGISTERED":
              router.push("/my-account");
              break;
            case "USER":
              router.push("/user-dashboard");
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
    }

        catch (err: unknown) { 
      console.error("Login error:", err);
      let errorMessage = "Invalid credentials or server error.";

      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.message || 
                      err.response.data?.error || 
                      `Server error: ${err.response.status}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    }

     finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md md:max-w-4xl w-full flex space-y-8 bg-white rounded-xl shadow-lg"
      >
        <CloseIcon
          onClick={handleClose}
          className="absolute right-5 top-4 cursor-pointer"
        />

        <div className="hidden w-1/2 md:flex flex-col p-6 justify-between items-center mb-0 bg-[url('/images/login-banner.png')] bg-cover bg-center rounded-l-xl">
          <div className="w-full flex justify-baseline">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="TeamHippa-logo"
                width={150}
                height={50}
                className="w-22 h-16"
                priority
              />
            </Link>
          </div>
          <div>
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">TeamHippa</h1>
            </Link>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-10 w-full md:w-1/2">
          <div>
            <h2 className="text-3xl font-semibold text-[#b0db72]">Sign In</h2>
            <p className="mt-2 text-base font-semibold text-gray-600">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email*"
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Enter your email"
                value={formData.identifier}
                onChange={handleChange}
                autoComplete="username email"
                required
                disabled={isLoading}
              />
              <Input
                label="Password*"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Input
                  id="remember-me"
                  name="agreed"
                  label="Remember me"
                  type="checkbox"
                  checked={formData.agreed}
                  onChange={handleChange}
                  ClassName="accent-[#b0db72]"
                />
              </div>
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-[#b0db72] hover:text-[#64a506]"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-[#b0db72] hover:bg-[#64a506] text-white py-2 rounded transition-colors"
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
                  Or sign in with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button
                type="button"
                isLoading={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-black hover:bg-gray-50"
              >
                <GoogleIcon className="w-4 h-4" />
                Sign in with Google
              </Button>

              <Button
                type="button"
                isLoading={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-black hover:bg-gray-50"
              >
                <AppleIcon className="w-4 h-4" />
                Sign in with Apple
              </Button>

              <p className="mt-2 text-center text-base font-normal text-gray-600">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-[#b0db72] hover:text-[#64a506] cursor-pointer font-medium"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showRegister && (
        <RegisterPage onClick={() => setShowRegister(false)} />
      )}
    </div>
  );
};

export default Login;