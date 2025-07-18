"use client";
import { NAV_LINKS } from "@/untils/constant";
import Link from "next/link";
import React, { useState } from "react";
import { MenuIcon } from "../Icons/MenuIcon";
import Image from "next/image";
import { UserIcon } from "../Icons";
import Login from "@/app/(auth)/login/page";
import { Button } from "../Button";
import MobileMenu from "../MobileMenu";

const Header: React.FC = () => {
  const isLoggedIn = false;
  const [isLogin, setLogin] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const LoginClick = () => {
    setLogin((prev) => !prev);
  };

    const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
   <header className="bg-gray-100 shadow-md sticky top-0 z-20 py-3 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="eamHippa-logo"
                width={150}
                height={50}
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
            <nav className="hidden xl:flex space-x-6 items-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-black hover:hover:text-[#b0db72] px-3 py-2 rounded-md text-base font-medium transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Links / User Profile */}
            <div className="hidden xl:flex items-center space-x-4">
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="text-black hover:hover:text-[#b0db72] px-3 py-2 rounded-md text-base font-medium transition-colors duration-150"
              >
                Profile
              </Link>
            ) : (
              <>
                <Button
                  onClick={LoginClick}
                  className="flex gap-2 items-center bg-[#b0db72] hover:bg-[#64a506] text-white px-4 py-2 rounded-md text-base font-medium shadow-sm transition-colors duration-150"
                >
                  <UserIcon className="text-white" />
                  Login/Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button (functional example would require state and a click handler) */}
            <div className="xl:hidden flex items-center">
            <button
                onClick={toggleMobileMenu}
              >
                <MenuIcon className="cursor-pointer min-h-6 min-w-6"/>
              </button>
          </div>
        </div>
      </div>
      
      {/*Menu Side-Bar*/}
        {isMobileMenuOpen && (
          <MobileMenu
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
            isLoggedIn={isLoggedIn}
            LoginClick={LoginClick}
          />
        )}

      {isLogin && <Login />}
    </header>
  );
};

export default Header;
