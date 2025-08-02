import React from "react";
import { Button } from "../Button";

interface WaitlistProps {
  title?: string;
  subtitle?: string;
  bgImageUrl?: string;
  onOpenWaitlist: () => void;
  className?: string;
}

export const Waitlist: React.FC<WaitlistProps> = ({
  title ,
  subtitle ,
  onOpenWaitlist,
}) => {
  return (
     <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16 text-center bg-[url('/images/wait-list.png')] bg-center bg-no-repeat bg-cover">
            <div className="max-w-screen-2xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-semibold text-left md:text-center text-black mb-4 capitalize">
                  {title}
              </h2>
              <p className="text-base sm:text-lg text-white font-normal mb-3">
                {subtitle}
              </p>
              <div className="mt-4 flex justify-center">
                <Button
                 onClick={onOpenWaitlist}
                 >
                  Join Waitlist
                </Button>
              </div>
            </div>
          </section>
  );
};
