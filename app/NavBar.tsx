"use client";
import React, { useEffect, useState } from "react";
import normalSizeLogo from "./images/logo/shopsee-logo.png";
import smallSizeLogo from "./images/logo/favicon.png";
import Link from "next/link";
import SignInModal from "./components/shared/SignInModal";
import SignUpModal from "./components/shared/SignUpModal";
import axiosClient from "./utils/axiosClient";
import { IUserInfo } from "./types/UserInfoProps";
import { LoadingSpinner } from "./components/shared/LoadingSpinner";
import { Menu, X, User } from "lucide-react";
import { Button } from "./components/ui/Button";
import { SignUpInfoResponse } from "./types/getSignUpInfoProps";

const navigationLinks = [
    { href: "/what-we-do", label: "What We Do" },
    { href: "/solutions", label: "Solutions" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact-us", label: "Contact" },
    { href: "/about-us", label: "About Us" },
];

export default function NavBar() {
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [userInfo, setUserInfo] = useState<IUserInfo>({
        authenticated: false,
        userName: "",
        redirect: "",
    });
    const [signUpInfo, setSignUpInfo] = useState<SignUpInfoResponse>({
        Categories: [],
        CountryList: [],
        HintQuestionsList: [],
        States: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoaded(false);
                const [userInfoResponse, signUpInfoResponse] = await Promise.all([
                    axiosClient.get<IUserInfo>("api/members/userInfo"),
                    axiosClient.get<SignUpInfoResponse>("api/members/SignUpInfo"),
                ]);
                setUserInfo(userInfoResponse.data);
                setSignUpInfo(signUpInfoResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoaded(true);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const closeMenu = () => setIsMenuOpen(false);

    const openSignUpModal = () => {
        setIsSignInModalOpen(false);
        setIsSignUpModalOpen(true);
    };

    return (
        <>
            {!loaded && <LoadingSpinner />}
            <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Main navigation">
                    {/* Logo */}
                    <div className="flex lg:flex-1">
                        <Link href="/" className="-m-1.5 p-1.5 transition-opacity hover:opacity-80">
                            <span className="sr-only">ShopSee - Home</span>
                            <img className="h-10 w-auto" src={isMobile ? smallSizeLogo.src : normalSizeLogo.src} alt="ShopSee Logo" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex gap-x-8">
                        {navigationLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Section */}
                    <div className="hidden md:flex lg:flex-1 lg:justify-end items-center gap-3">
                        <Link href="/pricing">
                            <Button variant="outline" size="sm">
                                Try Now
                            </Button>
                        </Link>
                        {userInfo.authenticated ? (
                            <a href={userInfo.redirect} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
                                <User className="w-4 h-4" />
                                {userInfo.userName}
                            </a>
                        ) : (
                            <Button variant="default" size="sm" onClick={() => setIsSignInModalOpen(true)}>
                                Log in
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100" aria-label="Toggle menu" aria-expanded={isMenuOpen} aria-controls="mobile-menu">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div id="mobile-menu" className="md:hidden absolute inset-x-0 top-full bg-white shadow-lg z-40 border-t border-gray-100 animate-slide-down">
                        <div className="p-4 space-y-1">
                            {navigationLinks.map((link) => (
                                <Link key={link.href} onClick={closeMenu} href={link.href} className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                            <hr className="my-3 border-gray-200" />
                            <Link onClick={closeMenu} href="/pricing" className="block px-4 py-3 text-sm font-semibold text-primary hover:bg-primary-50 rounded-md transition-colors">
                                Try Now
                            </Link>
                            {userInfo.authenticated ? (
                                <a href={userInfo.redirect} className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                                    <User className="w-4 h-4" />
                                    {userInfo.userName}
                                </a>
                            ) : (
                                <button onClick={() => { setIsSignInModalOpen(true); closeMenu(); }} className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                                    Log in
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <SignInModal isOpen={isSignInModalOpen} closeModal={() => setIsSignInModalOpen(false)} openSignUpModal={openSignUpModal} />
            <SignUpModal isOpen={isSignUpModalOpen} closeModal={() => setIsSignUpModalOpen(false)} data={signUpInfo} />
        </>
    );
}
