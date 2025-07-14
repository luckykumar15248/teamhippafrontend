// File: app/courses/page.tsx
'use client';

import React, { useState } from 'react';

import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions (Updated to match API response) ---
interface Course {
    id: number;
    name: string;
    sportName: string;
    sportId: number;
    shortDescription: string;
    basePriceInfo: string;
    description: string;
    imagePaths: string[];
    isActive: boolean;
    duration: string;
}






// --- SVG Icons ---
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;


// --- Course Card Component ---
interface CourseCardProps {
    course: Course;
    onBookNow: (courseId: number) => void;
    onViewDetails: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onBookNow, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasMultipleImages = course.imagePaths && course.imagePaths.length > 1;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        setCurrentImageIndex(prev => (prev + 1) % course.imagePaths.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev - 1 + course.imagePaths.length) % course.imagePaths.length);
    };

    return (
        <article className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-1 transition-transform duration-300">
            <div className="relative">
                <img 
                    src={course.imagePaths?.[currentImageIndex] || 'https://placehold.co/600x400/a7a2ff/333333?text=TeamHippa'} 
                    alt={course.name} 
                    className="h-48 w-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {hasMultipleImages && (
                    <>
                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronLeftIcon />
                        </button>
                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRightIcon />
                        </button>
                    </>
                )}
                <span className="absolute top-3 left-3 bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded-full">{course.sportName}</span>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                <p className="mt-2 text-gray-600 text-sm flex-grow h-20">{course.shortDescription}</p>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">{course.basePriceInfo || 'Contact for Price'}</span>
                    <div className="flex gap-2">
                        <button onClick={() => onViewDetails(course)} className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-100">Details</button>
                        <button onClick={() => onBookNow(course.id)} className="bg-indigo-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 transition-transform transform group-hover:scale-105">Book Now</button>
                    </div>
                </div>
            </div>
        </article>
    );
};
export default CourseCard