"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "@/app/components/Button";
import Input from "@/app/components/Input";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Handle modal close
  const handleClose = () => {
    router.push("/login"); // Navigate to login page when closing
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, type } = target;
    const value = type === 'checkbox' ? target.checked : target.value;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}api/auth/register`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data?.success) {
        toast.success(response.data.message || "Registration successful!");
        handleClose(); // Close modal after successful registration
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full p-8 space-y-8 bg-white rounded-xl shadow-lg"
      >
        <CloseIcon
          onClick={handleClose}
          className="absolute right-5 top-4 cursor-pointer"
        />

        <div>
          <h2 className="text-3xl font-semibold text-[#b0db72]">Create Account</h2>
          <p className="mt-2 text-base font-semibold text-gray-600">
            Get started with your free account
          </p>
        </div>

        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
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
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <Input
              label="Last Name*"
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
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
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <Input
            label="Password*"
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <Input
            label="Confirm Password*"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <div className="flex items-center">
            <Input
              id="agreed"
              name="agreed"
              label="I agree to the Terms and Privacy Policy"
              type="checkbox"
              checked={formData.agreed}
              onChange={handleChange}
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
            onClick={handleClose}
            className="text-[#b0db72] hover:text-[#64a506] cursor-pointer font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;