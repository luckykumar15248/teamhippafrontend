import type { Metadata } from "next";
import BookNowClient from "../components/LandingPage/BookNowClient/BookNowClient";
import "./styles.css";
// your client component path

export const metadata: Metadata = {
  title: "Professional Sports Courses & Packages | Team Hippa",
  description:
    "Explore a wide range of professional tennis and pickleball courses and packages designed for all skill levels at Team Hippa Academy.",
  keywords:
    "tennis courses, pickleball lessons, sports packages, Team Hippa, tennis coaching, pickleball coaching, sports academy",
  openGraph: {
    title: "Professional Sports Courses & Packages | Team Hippa",
    description:
      "Team Hippa offers tennis and pickleball training programs with expert coaches and flexible packages for all levels.",
    url: "https://teamhippa.com/courses",
    type: "website",
    images: [{ url: "https://teamhippa.com/images/tennis-programs.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports Courses & Packages | Team Hippa",
    description:
      "Join Team Hippa for tennis and pickleball courses and packages designed for beginners to pros.",
    images: ["https://teamhippa.com/images/tennis-programs.jpg"],
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
    canonical: "/courses",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// JSON-LD Structured Data for Courses Page
const generateStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Team Hippa Academy Sports Courses",
  description: "Professional tennis and pickleball courses and packages at Team Hippa Academy.",
  url: "https://teamhippa.com/courses",
  telephone: "+1-480-XXX-XXXX",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gilbert Regional Park",
    addressLocality: "Gilbert",
    addressRegion: "AZ",
    postalCode: "85296",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "33.3528",
    longitude: "-111.7890",
  },
  offers: {
    "@type": "Offer",
    description: "Tennis and pickleball training courses and packages",
  },
});

export default function CoursesAndPackagesPage() {
  const structuredData = generateStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BookNowClient />
    </>
  );
}
