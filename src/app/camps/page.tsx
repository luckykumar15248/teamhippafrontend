import React from 'react';
import { Metadata } from 'next';
import { CampCard } from '@/app/components/CampCard/CampCard';
import { CampDto } from '@/types/camp';

export const metadata: Metadata = {
  title: 'Tennis Camps in Gilbert & Phoenix, AZ | Summer & Winter Clinics',
  description: 'Join Team Hippa\'s top-rated tennis camps in Gilbert and Phoenix. Junior and adult programs, expert coaching, and fun match play at Freestone Rec Center. Register now!',
  keywords: ['Tennis camp Gilbert', 'Winter sports camp Phoenix', 'Junior tennis clinics', 'Summer tennis camp AZ', 'Team Hippa'],
  openGraph: {
    title: 'Tennis Camps in Gilbert & Phoenix, AZ | Team Hippa',
    description: 'Expert coaching, fun drills, and match play for all ages. Join our upcoming Winter & Summer sessions.',
    type: 'website',
  }
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getCamps(): Promise<CampDto[]> {
  try {
    const response = await fetch(`${apiUrl}/api/public/camps`, {
      cache: 'no-store',
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Team Hippa Tennis Camps',
    description: 'Upcoming tennis camps and clinics in Gilbert and Phoenix, Arizona.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: camps.map((camp, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://teamhippa.com/camps/${camp.campId}`,
        name: camp.title || 'Tennis Camp'
      }))
    }
  };

  return (
    // ADDED: dark:bg-gray-900 for the main background
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Premier Tennis Camps in Gilbert & Phoenix
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed text-blue-50 dark:text-gray-200">
            From <strong>Winter Holiday Clinics</strong> to high-performance Summer intensives, 
            Team Hippa provides structured tennis training for juniors and adults. 
            Join us at the <strong>Freestone Rec Center</strong> and other top locations to 
            improve your technique, agility, and match strategy.
          </p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      {/* ADDED: dark:bg-gray-800 dark:border-gray-700 */}
      <section className="bg-white dark:bg-gray-800 py-12 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            
            {/* Feature 1 */}
            <div className="p-4">
              {/* ADDED: dark:bg-blue-900/50 dark:text-blue-400 */}
              <div className="bg-blue-100 dark:bg-blue-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              {/* ADDED: dark:text-white */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Expert Coaching</h3>
              {/* ADDED: dark:text-gray-300 */}
              <p className="text-gray-600 dark:text-gray-300">Train with D1 college-level coaches dedicated to junior development and technical mastery.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Top Locations</h3>
              <p className="text-gray-600 dark:text-gray-300">Conveniently located at Freestone Rec Center (Gilbert) and Phoenix facilities.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Skill Levels</h3>
              <p className="text-gray-600 dark:text-gray-300">From beginners learning the basics to tournament players refining strategy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Camps Grid */}
      <section className="container mx-auto px-4 py-12">
        {camps.length === 0 ? (
          // ADDED: dark:bg-gray-800 dark:border-gray-700
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No upcoming camps are currently scheduled.
            </div>
            <p className="text-gray-400 dark:text-gray-500">
              Please join our waitlist or check back for Summer 2026 dates!
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div>
                {/* ADDED: dark:text-white */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Upcoming Camp Schedule
                </h2>
                {/* ADDED: dark:text-gray-400 */}
                <p className="text-gray-600 dark:text-gray-400 mt-1">Select a camp below to view details and register.</p>
              </div>
              {/* ADDED: dark:bg-blue-900 dark:text-blue-200 */}
              <div className="text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-4 py-2 rounded-full">
                {camps.length} Active {camps.length === 1 ? 'Event' : 'Events'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {camps.map((camp) => (
                <CampCard key={camp.campId} camp={camp} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer / Internal Linking */}
      {/* ADDED: dark:bg-gray-800 */}
      <section className="bg-gray-100 dark:bg-gray-800 py-12 mt-8 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
            {/* ADDED: dark:text-white */}
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Looking for regular training?</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">We also offer weekly group clinics and private lessons year-round.</p>
            {/* ADDED: dark:bg-gray-700 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-600 */}
            <a href="/contact" className="inline-block bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 font-semibold px-6 py-2 rounded hover:bg-blue-50 dark:hover:bg-gray-600 transition">
                Contact Team Hippa
            </a>
        </div>
      </section>
    </div>
  );
}