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
  LoginClick: () => void;
};

const MobileMenu: React.FC<MobileMenuProps> = ({
  isMobileMenuOpen,
  toggleMobileMenu,
  isLoggedIn,
  LoginClick,
}) => {
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
              href="/profile"
              className="text-black hover:hover:text-[#b0db72] px-3 py-2 rounded-md text-base font-medium transition-colors duration-150"
              onClick={toggleMobileMenu}
            >
              Profile
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
