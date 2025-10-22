"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

interface Division {
  name: string;
}

interface TournamentDetails {
  title: string;
  description: string;
  locationName: string;
  locationAddress?: string;
  startDate: string;
  endDate: string;
  levelCategory: string;
  divisions?: Division[] | string; // handle string or array
  bookingLink?: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
  };
  status: string;
  organizerName?: string;
  organizerContact?: string;
}

export default function TournamentDetailsClient({
  tournament,
}: {
  tournament: TournamentDetails;
}) {
  const [showMore, setShowMore] = useState(false);

  // ✅ Safely parse divisions whether it's a string or an array
  const divisions = useMemo<Division[]>(() => {
    if (!tournament.divisions) return [];
    if (typeof tournament.divisions === "string") {
      try {
        const parsed = JSON.parse(tournament.divisions) as Division[];
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.warn("Invalid divisions JSON:", err);
        return [];
      }
    }
    return tournament.divisions;
  }, [tournament.divisions]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* ✅ Featured Image */}
        {tournament.featuredImage?.url && (
          <div className="relative w-full h-72">
            <Image
              src={tournament.featuredImage.url}
              alt={tournament.featuredImage.altText || tournament.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-md text-sm font-semibold text-gray-800">
              {tournament.locationName}
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{tournament.title}</h1>
            <StatusBadge status={tournament.status} />
          </div>

          <p className="text-gray-600 text-sm mb-1">
            📍 {tournament.locationName}
            {tournament.locationAddress && `, ${tournament.locationAddress}`}
          </p>
          <p className="text-gray-600 text-sm mb-4">
            📅 {new Date(tournament.startDate).toLocaleDateString()} –{" "}
            {new Date(tournament.endDate).toLocaleDateString()}
          </p>

          {/* ✅ Divisions */}
          {divisions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">🏅 Divisions</h2>
              <ul className="list-disc list-inside text-gray-700">
                {divisions.map((d, idx) => (
                  <li key={idx}>{d.name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ✅ Description */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Overview</h2>
          <div
            className={`prose prose-gray max-w-none text-gray-700 ${
              !showMore ? "line-clamp-6" : ""
            } transition-all duration-300`}
            dangerouslySetInnerHTML={{ __html: tournament.description }}
          />
          {tournament.description?.length > 300 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-blue-600 text-sm mt-2 hover:underline"
            >
              {showMore ? "Show less" : "Read more"}
            </button>
          )}

          {/* ✅ Footer Info */}
          <div className="mt-8 flex flex-wrap items-center justify-between border-t pt-4">
            <div>
              <p className="text-sm text-gray-600">
                <strong>Level:</strong> {tournament.levelCategory}
              </p>
              {tournament.organizerName && (
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Organizer:</strong> {tournament.organizerName}
                  {tournament.organizerContact && ` (${tournament.organizerContact})`}
                </p>
              )}
            </div>

            {tournament.bookingLink && (
              <a
                href={tournament.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition"
              >
                Book Now →
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    UPCOMING: "bg-blue-100 text-blue-800",
    ONGOING: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
