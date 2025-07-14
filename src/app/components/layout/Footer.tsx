import { FOOTER_NAV, SOCIAL_LINKS } from "@/untils/constant";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { EmailIcon, PhoneIcon } from "../Icons";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[url('/images/footer-banner.jpg')] text-gray-300 py-12 px-6 lg:px-16">
      <div className="absolute inset-0 bg-black/50 z-0" />
      <div className="relative z-10 mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="eamHippa-logo"
                width={250}
                height={50}
                className="max-w-28 h-24 mb-4"
              />
            </Link>
            <p className="text-base font-medium text-white">
              Your premier destination for sports course bookings and academy
              management. Join us to unlock your potential!
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#b0db72] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {FOOTER_NAV.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#b0db72] transition-colors duration-150 text-base font-medium text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#b0db72] transition-colors duration-150 text-base font-medium text-white"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#b0db72] mb-4">
              Get In Touch
            </h3>
            <p className="text-base font-medium text-white mb-2">
              Rose Mofford Sports Complex 9833 N 25th Ave Phoenix, AZ 85021
              United States
            </p>
            <span className="flex items-center gap-3 mb-2">
              <EmailIcon />
              <Link
                href="mailto:info@teamhippa.com"
                className="text-base font-medium text-white hover:text-[#b0db72]"
              >
                info@teamhippa.com
              </Link>
            </span>
            <span className="flex items-center gap-3 mb-4">
             <PhoneIcon />
              <Link href="tel:+1 602-341-3361" className="text-base font-medium text-white hover:text-[#b0db72]">
              +1 602-341-3361
              </Link>
            </span>

            <h4 className="text-md font-bold text-[#b0db72] mb-2">Follow Us</h4>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#b0db72] transition-colors duration-150 w-8 h-8 rounded-full flex items-center justify-center bg-white"
                  aria-label={social.name}
                >
                  <span className="">{social.icon}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white text-center">
          <p className="text-base font-medium text-white">
            &copy; {currentYear} TeamHippa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
