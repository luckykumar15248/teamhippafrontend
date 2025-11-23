import React from 'react';
//import Link from 'next/link';
import { CampCard } from '@/app/components/CampCard/CampCard';
import { CampDto } from '@/types/camp';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';



async function getCamps(): Promise<CampDto[]> {
  try {
    
    const response = await fetch(`${apiUrl}/api/public/camps`, {
      cache: 'no-store', // or 'force-cache' for better performance
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch camps');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching camps:', error);
    return [];
  }
}

export default async function CampsPage() {
  const camps = await getCamps();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Amazing Camps</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            Discover unforgettable experiences for all ages. Adventure, learning, and fun await!
          </p>
        </div>
      </section>

      {/* Camps Grid */}
      <section className="container mx-auto px-4 py-12">
        {camps.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No camps available at the moment.
            </div>
            <p className="text-gray-400">
              Check back soon for new camp offerings!
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Available Camps ({camps.length})
              </h2>
              <div className="text-sm text-gray-500">
                Showing all active camps
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {camps.map((camp) => (
                <CampCard key={camp.campId} camp={camp} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export const metadata = {
  title: 'Our Camps - Team Hippa',
  description: 'Discover amazing camps for all ages. Adventure, learning, and fun experiences await at Team Hippa.',
};