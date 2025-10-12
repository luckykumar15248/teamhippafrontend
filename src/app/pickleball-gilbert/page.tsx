// app/pickleball-gilbert/page.tsx
import type { Metadata } from "next";
import "./styles.css";
import PickleballGilbertClient from "../components/LandingPage/PickleballGilbertClient/PickleballGilbertClient";

// Generate structured data as string
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Team Hippa Pickleball Academy - Gilbert",
  description: "Premier pickleball lessons and community programs in Gilbert, AZ. All ages and skill levels.",
  url: "https://teamhippa.com/pickleball-gilbert",
  sport: "Pickleball",
  telephone: "+1-602-341-3361",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gilbert Regional Park",
    addressLocality: "Gilbert",
    addressRegion: "AZ",
    postalCode: "85296",
    addressCountry: "US"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "33.3528",
    longitude: "-111.7890"
  },
  openingHours: "Mo-Fr 06:00-22:00, Sa-Su 07:00-20:00",
  offers: {
    "@type": "Offer",
    description: "Pickleball classes, coaching, and summer camps"
  },
};

export const metadata: Metadata = {
  title: "Pickleball Lessons Gilbert AZ | Beginner to Expert Coaching",
  description: "Learn pickleball at Team Hippa's Academy in Gilbert, AZ. We offer lessons, competitive play, and events on premier courts for all ages.",
  keywords: "pickleball gilbert, pickleball lessons, pickleball coaching, team hippa, youth pickleball, adult pickleball, Arizona",
  openGraph: {
    title: "Pickleball Lessons Gilbert AZ | Team Hippa Academy",
    description: "Join pickleball lessons and events at Team Hippa Academy Gilbert. All ages welcome!",
    url: "https://teamhippa.com/pickleball-gilbert",
    type: "website",
    images: [{ url: "https://teamhippa.com/images/tennies-pickleball.jpg" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Pickleball Lessons Gilbert AZ",
    description: "Top beginner and advanced pickleball coaching in Gilbert, Arizona.",
    images: ["https://teamhippa.com/images/tennies-pickleball.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/pickleball-gilbert",
  },
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "script:ld+json": JSON.stringify(structuredData),
  },
};

export default function PickleballGilbertPage() {
  return <PickleballGilbertClient />;
}