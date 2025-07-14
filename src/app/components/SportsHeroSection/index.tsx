// components/HeroSection.tsx

import Image from "next/image";

interface HeroSectionProps {
  bgImage: string;
  title: string;
  description: string;
}

const SportsHeroSection = ({ bgImage, title, description }: HeroSectionProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <Image
          src={bgImage}
          alt="background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
};

export default SportsHeroSection;
