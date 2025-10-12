import type { Metadata } from "next";
import ContactClient from "../components/LandingPage/ContactClient/ContactClient";


// Static SEO meta for contact page
export const metadata: Metadata = {
  title: "Contact Team Hippa | Tennis and Pickleball Inquiries",
  description: "Have questions or need more info about Team Hippa's tennis and pickleball programs? Contact us via form, phone, or visit our locations.",
  keywords: "contact team hippa, tennis academy contact, pickleball gilbert contact, tennis phoenix contact, location, phone, email",
  openGraph: {
    title: "Contact Team Hippa | Tennis and Pickleball Inquiries",
    description: "Contact Team Hippa for program details, coaching, or booking inquiries.",
    url: "https://teamhippa.com/contact",
    type: "website",
    images: [{ url: "https://teamhippa.com/images/contact-og.jpg" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Team Hippa",
    description: "Reach out for tennis and pickleball info and support.",
    images: ["https://teamhippa.com/images/contact-og.jpg"],
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
    canonical: "/contact",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// Optional: Structured data for contact page/local business
const generateStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: "https://teamhippa.com/contact",
  contactOption: "Customer Service",
  contactType: "Customer Inquiry",
  areaServed: {
    "@type": "Place",
    name: "Phoenix, AZ & Gilbert, AZ"
  },
  description: "Contact Team Hippa for tennis and pickleball lessons, programs, and general inquiries.",
  telephone: "+1-602-341-3361",
 address: [
    {
      "@type": "PostalAddress",
      "streetAddress": "Gilbert Regional Park 3005 E Queen Creek Rd, Gilbert, AZ 85298, United States",
      "addressLocality": "Gilbert",
      "addressRegion": "AZ",
      "postalCode": "85298",
      "addressCountry": "US"
    },
    {
      "@type": "PostalAddress",
      "streetAddress": "Rose Mofford Sports Complex 9833 N 25th Ave",
      "addressLocality": "Phoenix",
      "addressRegion": "AZ",
      "postalCode": "85021",
      "addressCountry": "US"
    }
  ],
});

export default function ContactPage() {
  const structuredData = generateStructuredData();
  return (
    <>
      {/* JSON-LD for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Main UI */}
      <ContactClient />
    </>
  );
}
