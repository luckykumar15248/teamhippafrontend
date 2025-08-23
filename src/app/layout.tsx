"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./context/AuthContext";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hiddenPaths = [
    "/dashboard",
    "/admin/bookings",
    "/admin/booking-calendar",
    "/admin/manage-user-packages",
    "/admin/analytics",
    "/admin/waitlist",
    "/admin/manage-sports-courses",
    "/admin/manage-sports-courses/package/create-package",
    "/admin/promotions-management",
    "/admin/inquiries",
    "/admin/waitlist",
  ];
  const showLayout = !hiddenPaths.includes(pathname);

  return (
    <html lang="en">
      <link rel="icon" href="/images/logo.png" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          {showLayout && <Header />}
          <main className="">{children}</main>
          {showLayout && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}
