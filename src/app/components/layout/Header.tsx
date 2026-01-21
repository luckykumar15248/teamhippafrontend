"use client";
import { NAV_LINKS } from "@/untils/constant";
import Link from "next/link";
import React, { useContext, useState } from "react";
import { MenuIcon } from "../Icons/MenuIcon";
import Image from "next/image";
import { LogOutIcon, UserIcon } from "../Icons";
import MobileMenu from "../MobileMenu";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "../Button";

const Header: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dashboardPath =
    user?.roleName === "ADMIN"
      ? "/dashboard"
      : user?.roleName === "VISITOR_REGISTERED"
      ? "/my-account"
      : "/dashboard";

  const LoginClick = () => {
    router.push("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="bg-gray-100 dark:bg-gray-800 shadow-md dark:shadow-gray-900 sticky top-0 z-20 py-3 px-6 lg:px-16 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="TeamHippa-logo"
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
                className="text-black dark:text-gray-100 hover:text-[#b0db72] dark:hover:text-[#9acd50] px-3 py-2 rounded-md text-base font-medium transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Links / User Profile */}
          <div className="hidden xl:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardPath}
                  className="flex gap-2 items-center bg-[#b0db72] hover:bg-[#64a506] dark:bg-[#7cb342] dark:hover:bg-[#64a506] text-white px-4 py-2 rounded-md text-base font-medium shadow-sm transition-colors duration-150"
                >
                  Dashboard
                </Link>
                <Button
                  onClick={logout}
                  className="flex gap-2 !font-medium !px-4 !py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition-colors"
                >
                  <LogOutIcon className="text-gray-800 dark:text-gray-100" />
                  Logout
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex gap-2 items-center bg-[#b0db72] hover:bg-[#64a506] dark:bg-[#7cb342] dark:hover:bg-[#64a506] text-white px-4 py-2 rounded-md text-base font-medium shadow-sm transition-colors duration-150"
              >
                <UserIcon className="text-white" />
                Login/Register
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center">
            <button onClick={toggleMobileMenu}>
              <MenuIcon className="cursor-pointer min-h-6 min-w-6 text-black dark:text-gray-100" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Side-Bar */}
      {isMobileMenuOpen && (
        <MobileMenu
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          isLoggedIn={isLoggedIn}
          user={user}
          LoginClick={LoginClick}
          logout={logout}
        />
      )}
    </header>
  );
};

export default Header;