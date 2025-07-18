"use client";

import React, {
  useState,
  useEffect,
  KeyboardEvent,
  useRef,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Input from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import Image from "next/image";
import Link from "next/link";

const OTP_LENGTH = 6;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const VerifyEmailPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    } else {
      setError(
        "Email address not found. Please try registering again or contact support."
      );
    }
  }, [searchParams]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmitOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const enteredOtp = otp.join("");
    if (enteredOtp.length !== OTP_LENGTH) {
      setError(`Please enter a ${OTP_LENGTH}-digit OTP.`);
      // toast.error(`Please enter a ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (!email) {
      setError("Email is required for verification.");
      // toast.error("Email is required for verification.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}api/auth/verify-email`,
        null,
        { params: { email, otp: enteredOtp } }
      );

      if (response.data && response.data.success) {
        setSuccessMessage(
          response.data.message ||
            "Email verified successfully! You can now login."
        );
        // toast.success(response.data.message || 'Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          router.push("/verify-email");
        }, 3000);
      } else {
        setError(
          response.data.message || "OTP verification failed. Please try again."
        );
        toast.error(
          response.data.message || "OTP verification failed. Please try again."
        );
      }
    } 
    catch (err: unknown) {
      console.error("OTP Verification error:", err);

      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "An unexpected error occurred during verification.";
      setError(errorMessage);
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setSuccessMessage(null);
    if (!email) {
      setError("Email address is missing. Cannot resend OTP.");
      // toast.error("Email address is missing.");
      return;
    }

    setIsResending(true);
    try {
      const response = await axios.post(
        `${apiUrl}api/auth/resend-otp`,
        null,
        {
          params: { email },
        }
      );

      if (response.data && response.data.success) {
        setSuccessMessage(
          response.data.message ||
            "A new OTP has been sent to your email address."
        );
        // toast.success(response.data.message || 'A new OTP has been sent.');
        setOtp(new Array(OTP_LENGTH).fill(""));
      } else {
        setError(
          response.data.message || "Failed to resend OTP. Please try again."
        );
        // toast.error(response.data.message || 'Failed to resend OTP.');
      }
   } catch (err: unknown) {
      console.error("Resend OTP error:", err);

      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "An unexpected error occurred while resending OTP.";
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (!email && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading verification details...</p>
      </div>
    );
  }

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
              Verify Your Email Address
            </h2>
            <p className="mt-2 text-base font-semibold text-gray-600">
              We&apos;ve sent a {OTP_LENGTH}-digit code to{" "}
              <strong className="font-medium text-gray-800">
                {email || "your email"}
              </strong>
              . Please enter it below to activate your account.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmitOtp}>
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

            <div className="flex justify-center space-x-2" dir="ltr">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading || isResending}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-medium border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                  required
                />
              ))}
            </div>

            <div>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading || isResending}
                className="text-white px-4 py-2 rounded w-full"
              >
                Verify Account
              </Button>
            </div>
          </form>

          <div className="mt-6 grid grid-cols-1 gap-3">
          
            <p className="mt-2 text-center text-base font-normal text-gray-600">
              <Link href="/login">
                Didn&apos;t receive the code?{" "}
              <span
              onClick={handleResendOtp}
               className="text-[#b0db72] hover:text-[#64a506]">
                  {isResending ? "Sending..." : "Resend OTP"}
                </span>
              </Link>
            </p>
            <p className="mt-2 text-center">
              <Link
                href="/login"
                className="text-base font-medium text-[#b0db72] hover:text-[#64a506]"
              >
                Back to Login
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
