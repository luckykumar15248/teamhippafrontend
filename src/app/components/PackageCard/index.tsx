'use client';

import { Button } from "../Button";

interface Package {
    id: number;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    price: number;
    imageUrls: string[];
    isActive: boolean;
}

interface PackageCardProps {
    pkg: Package;
    onNavigate: (packageId: number, packageSlug: string) => void;
    darkMode?: boolean; // Optional dark mode prop
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onNavigate, darkMode = false }) => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_SERVER_URL || "";
    
    // Check if we're in dark mode via prop or system preference
    const isDark = darkMode || 
        (typeof window !== 'undefined' && 
         (window.matchMedia('(prefers-color-scheme: dark)').matches || 
          document.documentElement.classList.contains('dark')));
    
    const handleCardClick = () => {
        onNavigate(pkg.id, pkg.slug);
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click from firing
        onNavigate(pkg.id, pkg.slug);
    };
    
    return (
        <article 
            className={`rounded-xl shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-1 
                transition-all duration-300 cursor-pointer border hover:shadow-xl ${
                isDark 
                    ? 'bg-[#b0db72]/10 border-[#b0db72]/20 hover:border-[#b0db72]/40' 
                    : 'bg-[#b0db72]/5 border-[#b0db72]/10 hover:border-[#b0db72]/30'
            }`}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
            aria-label={`View details for ${pkg.name} package`}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden h-48">
                <img 
                    src={`${frontendUrl}${pkg.imageUrls?.[0] || '/images/empty-img.jpg'}`} 
                    alt={pkg.name} 
                    className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                />
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${
                    isDark 
                        ? 'from-gray-900/70 via-gray-900/20 to-transparent' 
                        : 'from-black/60 via-transparent to-transparent'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Price Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full shadow-lg ${
                    isDark 
                        ? 'bg-[#b0db72] text-gray-900' 
                        : 'bg-[#b0db72] text-gray-900'
                } font-semibold text-sm backdrop-blur-sm border border-white/20`}>
                    ${pkg.price.toFixed(2)}
                </div>
            </div>
            
            {/* Content Container */}
            <div className="p-5 flex-grow flex flex-col">
                {/* Title */}
                <h3 className={`text-xl font-bold line-clamp-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                }`}>
                    {pkg.name}
                </h3>
                
                {/* Description */}
                <p className={`mt-3 text-base font-normal line-clamp-2 flex-grow ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                    {pkg.shortDescription}
                </p>
                
                {/* Divider & Actions */}
                <div className={`mt-6 pt-4 border-t ${
                    isDark ? 'border-[#b0db72]/20' : 'border-[#b0db72]/20'
                } flex flex-col gap-3`}>
                    {/* Price Display */}
                    <div className="flex justify-between items-center">
                        <span className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Starting from
                        </span>
                        <span className={`text-xl font-bold ${
                            isDark ? 'text-[#b0db72]' : 'text-[#64a506]'
                        }`}>
                            ${pkg.price.toFixed(2)}
                        </span>
                    </div>
                    
                    {/* Action Button */}
                    <Button
                        onClick={() => handleButtonClick({} as React.MouseEvent)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 
                            transform hover:scale-[1.02] active:scale-[0.98] w-full whitespace-nowrap ${
                            isDark 
                                ? 'bg-[#b0db72] hover:bg-[#a5cf68] text-gray-900 shadow-lg hover:shadow-[#b0db72]/30' 
                                : 'bg-[#64a506] hover:bg-[#559105] text-white shadow-md hover:shadow-lg'
                        }`}
                        aria-label={`View full details for ${pkg.name}`}
                    >
                        View Details
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="ml-2 w-4 h-4 inline-block" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Button>
                </div>
            </div>
            
            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 
                transition-opacity duration-300 ${
                isDark 
                    ? 'bg-gradient-to-r from-[#b0db72]/5 to-transparent' 
                    : 'bg-gradient-to-r from-[#b0db72]/10 to-transparent'
            }`}></div>
        </article>
    );
};

export default PackageCard;