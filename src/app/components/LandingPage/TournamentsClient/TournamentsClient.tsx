"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

interface Filters {
  location: string;
  level: string;
  status: string;
}

export default function TournamentsClient({
  initialTournaments,
}: {
  initialTournaments: Tournament[];
}) {
  const [tournaments, setTournaments] =
    useState<Tournament[]>(initialTournaments);
  const [filters, setFilters] = useState<Filters>({
    location: "",
    level: "",
    status: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchFiltered() {
      try {
        const url = `${apiUrl}/api/public_api/tournaments?page=${page}&location=${filters.location}&level=${filters.level}&status=${filters.status}`;
        const res = await fetch(url);
        const data = await res.json();
        setTournaments(data.content || data);
        if (data.totalPages) setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    }
    fetchFiltered();
  }, [filters, page]);

  return (
    <div className="container mx-auto px-4 py-10">
      <Filters filters={filters} setFilters={setFilters} resetPage={() => setPage(1)} />

      {tournaments.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-8">
          No tournaments found.
        </p>
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-10">
            {tournaments.map((t) => {
              const imageUrl =
                t.featuredImage?.url || "/images/default-tournament.jpg";

              return (
                <a
                  href={`/tournaments/${t.slug}`}
                  key={t.tournamentId}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="relative w-full aspect-[16/9] bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={t.featuredImage?.altText || t.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded-full text-xs font-semibold text-gray-700">
                      {t.levelCategory}
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-semibold mb-1 text-gray-900 line-clamp-2">
                      {t.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">{t.locationName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(t.startDate).toLocaleDateString()} –{" "}
                      {new Date(t.endDate).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}
    </div>
  );
}

function Filters({
  filters,
  setFilters,
  resetPage,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  resetPage: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 justify-center bg-white p-4 rounded-xl shadow-md">
      <select
        value={filters.location}
        onChange={(e) => {
          setFilters({ ...filters, location: e.target.value });
          resetPage();
        }}
        className="border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200"
      >
        <option value="">All Locations</option>
        <option value="Phoenix">Phoenix</option>
        <option value="Mesa">Mesa</option>
        <option value="Gilbert">Gilbert</option>
      </select>

      <select
        value={filters.level}
        onChange={(e) => {
          setFilters({ ...filters, level: e.target.value });
          resetPage();
        }}
        className="border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200"
      >
        <option value="">All Levels</option>
        <option value="JUNIOR">Junior</option>
        <option value="ADULT">Adult</option>
        <option value="OPEN">Open</option>
        <option value="PRO">Pro</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => {
          setFilters({ ...filters, status: e.target.value });
          resetPage();
        }}
        className="border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200"
      >
        <option value="">All Status</option>
        <option value="UPCOMING">Upcoming</option>
        <option value="ONGOING">Ongoing</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-10 gap-2">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50"
      >
        Prev
      </button>
      <span className="px-4 py-2 text-sm text-gray-700">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    UPCOMING: "bg-blue-100 text-blue-800",
    ONGOING: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded ${
        colors[status] || "bg-gray-200"
      }`}
    >
      {status}
    </span>
  );
}
