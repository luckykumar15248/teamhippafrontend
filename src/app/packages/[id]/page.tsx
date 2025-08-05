'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/app/components/Button';

interface Course {
    id: number;
    name: string;
    sportName: string;
    description: string;
    imagePaths: string[] | null;
}

interface Package {
    id: number;
    name: string;
    description: string;
    shortDescription: string;
    price: number;
    imageUrls: string[];
    includedCourses: Course[]; 
}
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;

interface CourseDetailModalProps {
    course: Course | null;
    onClose: () => void;
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ course, onClose }) => {
    if (!course) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">{course.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XIcon /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <img 
                        src={course.imagePaths?.[0] || 'https://placehold.co/600x400/a7a2ff/333333?text=Course'} 
                        alt={course.name} 
                        className="w-full h-56 object-cover rounded-lg mb-4"
                    />
                    <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: course.description }} />
                </div>
                 <div className="p-4 bg-gray-50 border-t mt-auto">
                    <button onClick={onClose} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Close</button>
                </div>
            </div>
        </div>
    );
};


const PackageDetailPage: React.FC = () => {
    const [pkg, setPackage] = useState<Package | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        const packageId = params.id as string;
        if (!packageId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${apiUrl}/api/public/packages/${packageId}`);
                console.log("package details is",response.data);
                setPackage(response.data);
                setMainImage(response.data.imageUrls?.[0] || null);
            } catch (error) {
                console.log(error)
                toast.error("Package not found.");
                router.push('/packages');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params.id, router]);

    const handleBookNow = () => {
        if (!pkg) return;
        toast.info(`Redirecting to booking page for ${pkg.name}...`);
         router.push(`../booking/package-booking/${pkg.id}`);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div></div>;
    }

    if (!pkg) {
        return <div className="text-center p-20 text-xl text-gray-600">Sorry, we couldn&apos;t find that package.</div>;
    }

    return (
        <div className="bg-gray-50">
            <div className="relative h-80 md:h-96">
                <img src={mainImage || 'https://placehold.co/1200x400/c7a2ff/333333?text=Package'} alt={pkg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 md:p-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4">{pkg.name}</h1>
                    <p className="mt-2 text-lg text-purple-200 max-w-2xl">{pkg.shortDescription}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    
                    <div className="lg:col-span-2 space-y-8">
                         <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Package Description</h2>
                            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: pkg.description }} />
                        </div>

                         {pkg.imageUrls && pkg.imageUrls.length > 1 && (
                            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Gallery</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {pkg.imageUrls.map((url, index) => (
                                        <img 
                                            key={index} 
                                            src={url} 
                                            alt={`${pkg.name} gallery image ${index + 1}`} 
                                            className={`w-full h-28 object-cover rounded-lg cursor-pointer transition-all duration-200 ${mainImage === url ? 'ring-4 ring-indigo-500' : 'hover:opacity-80'}`}
                                            onClick={() => setMainImage(url)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                             <h2 className="text-2xl font-bold text-gray-800 mb-4">What&apos;s Included</h2>
                             <div className="space-y-4">
                                {pkg.includedCourses.map(course => (
                                    <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                                        <div>
                                            <p className="font-semibold text-gray-900">{course.name}</p>
                                            <p className="text-sm text-gray-500">{course.sportName}</p>
                                        </div>
                                        <Button
                                         onClick={() => setSelectedCourse(course)}
                                          className="!text-[#b0db72] hover:!text-white bg-transparent border border-[#b0db72] w-auto whitespace-nowrap"
                                          >
                                            View Details
                                            </Button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                            <div className="space-y-4">
                                <div className="flex items-center text-gray-700">
                                    <span className="font-semibold text-lg">Total Price:</span>
                                    <span className="ml-auto font-bold text-3xl text-[#b0db72]">₹{pkg.price.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center text-gray-700 pt-2 border-t">
                                    <CheckCircleIcon />
                                    <span className="font-semibold">Includes:</span>
                                    <span className="ml-2 font-bold text-gray-900">{pkg.includedCourses.length} Courses</span>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Button
                                    onClick={handleBookNow}
                                    className='w-full'
                                >
                                    Book This Package Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {selectedCourse && <CourseDetailModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
        </div>
    );
};

export default PackageDetailPage;
