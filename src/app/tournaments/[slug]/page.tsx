// app/tournaments/[slug]/page.tsx
import TournamentDetailsClient from "@/app/components/LandingPage/TournamentDetailsClient/TournamentDetailsClient";
import { Metadata } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ✅ Fetch tournament data (SSR)
async function getTournament(slug: string) {
  const res = await fetch(`${apiUrl}/api/public_api/tournaments/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

// ✅ This async signature works for all Next versions
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const tournament = await getTournament(slug);

  if (!tournament) {
    return {
      title: "Tournament Not Found | TeamHipaa",
      description: "This tournament does not exist or has been removed.",
    };
  }

  const seo = tournament.seo || {};
  const pageTitle = seo.metaTitle || tournament.title;
  const pageDescription =
    seo.metaDescription ||
    `Details, schedule, and registration for ${tournament.title} at ${tournament.locationName}.`;
  const canonicalUrl = seo.canonicalUrl || `https://yourdomain.com/tournaments/${tournament.slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: seo.ogImage ? [seo.ogImage] : tournament.featuredImageUrl ? [tournament.featuredImageUrl] : [],
      url: canonicalUrl,
    },
    alternates: { canonical: canonicalUrl },
  };
}

// ✅ Same async `params` signature for the page itself
export default async function TournamentDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tournament = await getTournament(slug);

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <h1 className="text-2xl font-semibold">Tournament not found</h1>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: tournament.title,
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    eventStatus: tournament.status,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: tournament.locationName,
      address: tournament.locationAddress || "",
    },
    organizer: {
      "@type": "Organization",
      name: tournament.organizerName || "TeamHipaa",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        telephone: tournament.organizerContact || "",
      },
    },
    image: tournament.featuredImageUrl || "",
    description: tournament.description?.replace(/<[^>]+>/g, "").slice(0, 160),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TournamentDetailsClient tournament={tournament} />
    </>
  );
}
