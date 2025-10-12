import type { Metadata } from "next";
import GalleryPageClient from "../components/LandingPage/GalleryPageClient/GalleryPageClient";
 // your client component path

export const metadata: Metadata = {
  title: "Gallery | Team Hippa Tennis & Pickleball Academy",
  description: "Explore Team Hippa's gallery showcasing top tennis and pickleball moments, events, and camps in Gilbert and Phoenix, AZ.",
  keywords: "tennis gallery, pickleball gallery, Team Hippa events, tennis photos, pickleball videos, tennis camps photos",
  openGraph: {
    title: "Gallery | Team Hippa Tennis & Pickleball",
    description: "Discover photos and videos of tennis and pickleball programs at Team Hippa Academy.",
    url: "https://teamhippa.com/gallery",
    type: "website",
    images: [{ url: "https://teamhippa.com/images/gallery-og.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery | Team Hippa",
    description: "View tennis and pickleball event photos and videos.",
    images: ["https://teamhippa.com/images/gallery-og.jpg"],
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
    canonical: "/gallery",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// Structured Data for GalleryPage
const generateStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Gallery | Team Hippa Tennis & Pickleball Academy",
  description: "A collection of tennis and pickleball photos and videos by Team Hippa Academy.",
  url: "https://teamhippa.com/gallery",
  mainEntity: {
    "@type": "CreativeWork",
    name: "Sports Gallery",
    url: "https://teamhippa.com/gallery",
  },
});

export default function GalleryPage() {
  const structuredData = generateStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GalleryPageClient  />
    </>
  );
}
