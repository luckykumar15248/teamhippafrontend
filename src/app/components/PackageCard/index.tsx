'use client';

import { Button } from "../Button";


interface Package {
    id: number;
    name: string;
    shortDescription: string;
    description: string;
    price: number;
    imageUrls: string[];
    isActive: boolean;
}

interface PackageCardProps {
    pkg: Package;
    onNavigate: (packageId: number) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onNavigate }) => {
    
    return (
        <section 
            className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-1 transition-transform duration-300"
            onClick={() => onNavigate(pkg.id)}
        >
            <div className="relative">
                <img 
                    src={pkg.imageUrls?.[0] || '/images/empty-img.jpg'} 
                    alt={pkg.name} 
                    className="h-48 w-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold text-black line-clamp-1">{pkg.name}</h3>
                <p className="mt-2 text-base sm:text-lg text-gray-600 font-normal line-clamp-2">{pkg.shortDescription}</p>
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <span className="text-lg font-bold text-black">${pkg.price.toFixed(2)}</span>
                    <Button
                        onClick={() => {
                            onNavigate(pkg.id);
                        }} 
                       className="text-white px-4 py-2 rounded w-full whitespace-nowrap"
                    >
                        View Details
                    </Button>
                 
                </div>
            </div>
        </section>
    );
};
export default PackageCard;
