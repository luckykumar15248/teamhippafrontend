import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CampDto } from '@/types/camp';


interface CampCardProps {
  camp: CampDto;
}

export function CampCard({ camp }: CampCardProps) {
  const featuredImageUrl = camp.featuredImage?.url || '/images/camp-placeholder.jpg';
  const startingPrice = camp.sessions?.[0]?.basePrice || 0;
  const availableSessions = camp.sessions?.filter(s => s.status === 'OPEN').length || 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/camps/${camp.slug}`}>
        <div className="relative h-48 bg-gray-200">
          <Image
            src={featuredImageUrl}
            alt={camp.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              camp.status === 'PUBLISHED' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {camp.status}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/camps/${camp.slug}`}>
          <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
            {camp.title}
          </h3>
        </Link>

        <p className="text-gray-600 mb-3 line-clamp-2">
          Location: {camp.location}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 capitalize">Catagory: {camp.category.toLowerCase()}</span>
          <span className="text-sm text-gray-500">
            {availableSessions} session{availableSessions !== 1 ? 's' : ''} available
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            ${startingPrice}
          </div>
          <Link 
            href={`/camps/${camp.slug}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}