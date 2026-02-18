import type { Metadata } from "next";
import PackagesClient from "./PackagesClient";

export const metadata: Metadata = {
  title: "Tennis Training Packages in Gilbert & Phoenix | Team Hippa",
  description:
    "Explore premium tennis training packages in Gilbert & Phoenix. Beginner to advanced programs, flexible schedules, certified coaches & proven results.",
  keywords: [
    "tennis academy",
    "tennis lessons Gilbert AZ",
    "tennis coaching Phoenix AZ",
    "tennis training programs",
    "junior tennis classes",
    "adult tennis coaching",
    "tennis packages",
  ],
  openGraph: {
    title: "Tennis Training Packages | Team Hippa Academy",
    description:
      "High-performance tennis coaching programs in Gilbert & Phoenix. Join our proven training system today.",
    url: "https://teamhippa.com/packages",
    siteName: "Team Hippa Tennis Academy",
    images: [
      {
        url: "https://teamhippa.com/images/package.png",
        width: 1200,
        height: 630,
        alt: "Tennis Training Packages",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tennis Training Packages | Team Hippa",
    description:
      "Professional tennis coaching programs for juniors & adults in Gilbert & Phoenix.",
    images: ["https://teamhippa.com/images/package.png"],
  },
  alternates: {
    canonical: "https://teamhippa.com/packages",
  },
};

export default function Page() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            name: "Team Hippa Tennis Academy",
            url: "https://teamhippa.com/packages",
            areaServed: ["Gilbert AZ", "Phoenix AZ"],
            description:
              "Professional tennis training programs for juniors and adults in Gilbert and Phoenix.",
          }),
        }}
      />
      <PackagesClient />
    </>
  );
}
