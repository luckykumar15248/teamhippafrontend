"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import { AppleIcon, GoogleIcon } from "@/app/components/Icons";
import Input from "@/app/components/Input";
import Image from "next/image";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";

const LoginPage = ({onClose}:{onClose: () => void}) => {
  const [activeModal, setActiveModal] = useState<"login" | "register">("login");
  const [loginFormData, setLoginFormData] = useState({
    identifier: "",
    password: "",
    agreed: false
  });
  const [registerFormData, setRegisterFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleLoginChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, type } = target;
    const value = type === 'checkbox' ? target.checked : target.value;

    setLoginFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, type } = target;
    const value = type === 'checkbox' ? target.checked : target.value;

    setRegisterFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/login`,
        {
          usernameOrEmail: loginFormData.identifier,
          password: loginFormData.password,
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
    } catch (err: unknown) {
      console.error("Login error:", err);
      let errorMessage = "Invalid credentials or server error.";

      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    
    if (registerFormData.password !== registerFormData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/signup`,
        {
          firstName: registerFormData.firstName,
          lastName: registerFormData.lastName,
          email: registerFormData.email,
          password: registerFormData.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data?.success) {
        toast.success(response.data.message || "Registration successful!");
        setActiveModal("login");
      } else {
        throw new Error(response.data?.message || "Registration failed.");
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      let errorMessage = "Registration failed. Please try again.";

      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || `Server error: ${err.response.status}`;
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
    <div
     className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
     onClick={onClose}
     >
      {activeModal === "login" ? (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-md md:max-w-4xl w-full flex space-y-8 bg-white rounded-xl shadow-lg"
        >
          <CloseIcon
            onClick={onClose}
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

          <div className="p-10 w-full md:w-1/2">
            <div>
              <h2 className="text-3xl font-semibold text-[#b0db72]">Sign In</h2>
              <p className="mt-2 text-base font-semibold text-gray-600">
                Welcome back! Please enter your details.
              </p>
            </div>

            <form className="mt-4 space-y-6" onSubmit={handleLoginSubmit}>
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
                  value={loginFormData.identifier}
                  onChange={handleLoginChange}
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
                  value={loginFormData.password}
                  onChange={handleLoginChange}
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
                    checked={loginFormData.agreed}
                    onChange={handleLoginChange}
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
                    onClick={() => setActiveModal("register")}
                    className="text-[#b0db72] hover:text-[#64a506] cursor-pointer font-medium"
                  >
                    Register
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-md w-full p-8 space-y-8 bg-white rounded-xl shadow-lg"
        >
          <CloseIcon
            onClick={() => setActiveModal("login")}
            className="absolute right-5 top-4 cursor-pointer"
          />

          <div>
            <h2 className="text-3xl font-semibold text-[#b0db72]">Create Account</h2>
            <p className="mt-2 text-base font-semibold text-gray-600">
              Get started with your free account
            </p>
          </div>

          <form className="mt-4 space-y-6" onSubmit={handleRegisterSubmit}>
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name*"
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                value={registerFormData.firstName}
                onChange={handleRegisterChange}
                required
                disabled={isLoading}
              />
              <Input
                label="Last Name*"
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                value={registerFormData.lastName}
                onChange={handleRegisterChange}
                required
                disabled={isLoading}
              />
            </div>

            <Input
              label="Email*"
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={registerFormData.email}
              onChange={handleRegisterChange}
              required
              disabled={isLoading}
            />

            <Input
              label="Password*"
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={registerFormData.password}
              onChange={handleRegisterChange}
              required
              disabled={isLoading}
            />

            <Input
              label="Confirm Password*"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={registerFormData.confirmPassword}
              onChange={handleRegisterChange}
              required
              disabled={isLoading}
            />

            <div className="flex items-center">
              <Input
                id="agreed"
                name="agreed"
                label="I agree to the Terms and Privacy Policy"
                type="checkbox"
                checked={registerFormData.agreed}
                onChange={handleRegisterChange}
                ClassName="accent-[#b0db72]"
                required
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-[#b0db72] hover:bg-[#64a506] text-white py-2 rounded transition-colors"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-base font-normal text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => setActiveModal("login")}
              className="text-[#b0db72] hover:text-[#64a506] cursor-pointer font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;