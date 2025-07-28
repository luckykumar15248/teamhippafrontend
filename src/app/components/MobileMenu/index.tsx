"use client";

import Link from "next/link";
import React from "react";
import { Button } from "../Button";
import { UserIcon } from "../Icons";
import { NAV_LINKS } from "@/untils/constant";
import { CloseIcon } from "../Icons/CloseIcon";

type MobileMenuProps = {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  isLoggedIn: boolean;
  user: { roleName: string } | null;
  LoginClick: () => void;
};

const MobileMenu: React.FC<MobileMenuProps> = ({
  isMobileMenuOpen,
  toggleMobileMenu,
  isLoggedIn,
  user,
  LoginClick,
}) => {

  const dashboardPath =
    user?.roleName === "ADMIN"
      ? "/dashboard"
      : user?.roleName === "VISITOR_REGISTERED"
      ? "/my-account"
      : "/dashboard";
  
  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 xl:hidden z-40"
        onClick={toggleMobileMenu}
      />

      <div
        className={`xl:hidden fixed inset-y-0 right-0 w-full sm:w-72 bg-white shadow-lg transition-transform ease-in-out duration-400 transform z-50 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
        id="mobile-menu"
      >
        <CloseIcon
          onClick={toggleMobileMenu}
          className="absolute right-5 top-4 cursor-pointer"
        />

        <div className="px-2 pt-10 pb-3 space-y-1 sm:px-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-gray-600 hover:bg-gray-50 hover:text-[#b0db72] block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMobileMenu}
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-2 border-gray-300" />
          {isLoggedIn ? (
            <Link
                href={dashboardPath} 
                className="flex gap-2 justify-center sm:justify-normal items-center bg-[#b0db72] hover:bg-[#64a506] text-white px-4 py-2 rounded-md text-base font-medium shadow-sm transition-colors duration-150"
              >
                Dashboard
              </Link>
          ) : (
            <Button
              onClick={() => {
                LoginClick();
                toggleMobileMenu();
              }}
              className="flex gap-2 items-center bg-[#b0db72] hover:bg-[#64a506] text-white px-4 py-2 rounded-md text-base font-medium shadow-sm transition-colors duration-150 w-full justify-center"
            >
              <UserIcon className="text-white" />
              Login/Register
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
