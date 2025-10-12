// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./context/AuthContext";

import type { Metadata } from "next";
import RecaptchaProvider from "./components/RecaptchaProvider/RecaptchaProvider";

// Set your root metadata and canonical base for the whole app
export const metadata: Metadata = {
  metadataBase: new URL('https://teamhippa.com'),
  title: {
    default: 'Tennis Academy in USA | Best Tennis Training | Team Hippa',
    template: '%s | Team Hippa',
  },
  description:
    'Team Hippa is a top Tennis Academy in the USA offering expert coaching and training for players of all levels.',
  icons: {
    icon: '/images/logo.png',
  },
};

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
       
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
          {/* Header and Footer should only use client logic in subcomponents, not here */}
          <Header />
          <RecaptchaProvider>
          <main>{children}</main></RecaptchaProvider>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
