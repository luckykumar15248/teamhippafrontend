// components/HeroSection.tsx

import Image from "next/image";
import Link from "next/link";
import { PhoneIcon } from "../Icons";

interface HeroSectionProps {
  bgImage: string;
  title: string;
  description: string;
  showCallButton?: boolean;
}

const SportsHeroSection = ({
  bgImage,
  title,
  description,
  showCallButton = false,
}: HeroSectionProps) => {
  return (
    <section className="relative">
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
        {showCallButton && (
          <div className="flex justify-center mt-5">
            <Link
              href="tel:+1234567890"
              className="text-white px-4 py-2 bg-[#b0db72] hover:bg-[#64a506] rounded w-fit text-sm font-normal flex gap-2 items-center relative"
            >
              <PhoneIcon />
              CALL US NOW
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default SportsHeroSection;
