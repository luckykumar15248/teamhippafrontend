// app/tournaments/page.tsx
import { Metadata } from "next";
import TournamentsClient from "../components/LandingPage/TournamentsClient/TournamentsClient";

export const dynamic = "force-dynamic"; // prevent build-time API call crash

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const metadata: Metadata = {
  title: "Upcoming & Ongoing Tennis Tournaments | TeamHIPPA",
  description:
    "Discover upcoming, ongoing, and completed tennis tournaments. Filter by location, level, or status and explore tournament details.",
  openGraph: {
    title: "Upcoming & Ongoing Tennis Tournaments | TeamHIPPA",
    description:
      "Find tennis tournaments across all levels and locations. Check ongoing, upcoming, or completed events.",
    url: "https://teamhippa.com/tournaments",
    images: ["/images/tournaments-banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tennis Tournaments | TeamHIPPA",
    description:
      "Explore tennis tournaments by location, level, and status on TeamHIPPA.",
    images: ["/images/tournaments-banner.jpg"],
  },
};

interface Tournament {
  tournamentId: number;
  title: string;
  slug: string;
  locationName: string;
  startDate: string;
  endDate: string;
  levelCategory: string;
  status: string;
  featuredImage?: {
    id: number;
    url: string;
    fileName?: string;
    altText?: string | null;
  };
}

async function fetchTournaments(): Promise<Tournament[]> {
  try {
    const res = await fetch(`${apiUrl}/api/public_api/tournaments`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(
        "Failed to fetch tournaments:",
        res.status,
        await res.text()
      );
      return [];
    }

    const text = await res.text();
    if (!text || text.trim() === "") {
      console.warn("Empty tournament API response");
      return [];
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return [];
  }
}

export default async function TournamentsPage() {
  const tournaments = await fetchTournaments();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tournaments",
    itemListElement: tournaments.map((t, i) => ({
      "@type": "SportsEvent",
      position: i + 1,
      name: t.title,
      startDate: t.startDate,
      endDate: t.endDate,
      location: { "@type": "Place", name: t.locationName },
      eventStatus: t.status,
      url: `https://teamhippa.com/tournaments/${t.slug}`,
      image: t.featuredImage?.url || "",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative bg-gray-50 min-h-screen">
        <div className="bg-[url('/images/tournaments-banner.jpg')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center text-white py-20 px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Tennis Tournaments
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Explore upcoming, ongoing, and past tournaments across all levels.
            </p>
          </div>
        </div>

        {tournaments.length > 0 ? (
          <TournamentsClient initialTournaments={tournaments} />
        ) : (
          <div className="text-center text-gray-600 py-20">
            No tournaments available at the moment.
          </div>
        )}
      </div>
    </>
  );
}
