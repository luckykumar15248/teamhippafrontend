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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-16">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="TeamHippa-logo"
              width={160}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-gray-700 hover:text-[#7cb342] text-base font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden xl:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardPath}
                  className="px-5 py-2 rounded-lg bg-[#7cb342] text-white text-sm font-medium hover:opacity-90 transition"
                >
                  Dashboard
                </Link>

                <Button
                  onClick={logout}
                  className="!px-5 !py-2 !bg-[#f5f6f7] hover:!bg-gray-200 !text-gray-700 !font-medium !rounded-lg transition"
                >
                  <LogOutIcon className="text-gray-600" />
                  Logout
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 rounded-lg bg-[#7cb342] text-white text-sm font-medium hover:opacity-90 transition flex items-center gap-2"
              >
                <UserIcon className="text-white" />
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="xl:hidden">
            <button onClick={toggleMobileMenu}>
              <MenuIcon className="w-7 h-7 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
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
