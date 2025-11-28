"use client";
import React, { useState } from "react";
import CmsLeftNav from "./CmsLeftNav";
import CmsTopBar from "./CmsTopBar";
import { useCmsAuth } from "./CmsAuthWrapper";

interface CmsLayoutProps {
    children: React.ReactNode;
}

const CmsLayout: React.FC<CmsLayoutProps> = ({ children }) => {
    const { userInfo } = useCmsAuth();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isNavExpanded, setIsNavExpanded] = useState(false);

    const toggleMobileNav = () => {
        setIsMobileNavOpen(!isMobileNavOpen);
    };

    const handleNavExpandChange = (expanded: boolean) => {
        setIsNavExpanded(expanded);
    };

    return (
        <div className="cms-layout min-h-screen bg-gray-50">
            <style jsx global>{`
                body.cms {
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                }

                .left-navigation {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: ${isNavExpanded ? "170px" : "70px"};
                    height: 100vh;
                    background-color: #603493;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    transition: width 0.3s ease, transform 0.3s ease;
                }

                @media (max-width: 768px) {
                    .left-navigation {
                        transform: translateX(-100%);
                    }

                    .left-navigation.show {
                        transform: translateX(0);
                    }
                }

                .main-content {
                    margin-left: ${isNavExpanded ? "170px" : "70px"};
                    margin-top: 30px;
                    min-height: calc(100vh - 60px);
                    padding: 20px;
                    background-color: #f8f9fa;
                    transition: margin-left 0.3s ease;
                }

                @media (max-width: 768px) {
                    .main-content {
                        margin-left: 0;
                    }
                }

                .mobile-nav-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    display: none;
                }

                @media (max-width: 768px) {
                    .mobile-nav-overlay.show {
                        display: block;
                    }
                }
            `}</style>

            {/* Mobile Navigation Overlay */}
            {isMobileNavOpen && <div className="mobile-nav-overlay show" onClick={() => setIsMobileNavOpen(false)} />}

            {/* Fixed Left Navigation */}
            <nav className={`left-navigation ${isMobileNavOpen ? "show" : ""}`}>
                <CmsLeftNav apiBaseUrl={typeof window !== "undefined" ? window.location.origin : ""} showLogo={true} logoSrc="/img/logo/favicon.png" onNavExpandChange={handleNavExpandChange} />
            </nav>

            {/* Fixed Top Bar */}
            <CmsTopBar userInfo={userInfo} onToggleMobileNav={toggleMobileNav} />

            {/* Main Content Area */}
            <main className="main-content">
                {children}

                {/* Footer */}
                <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
                    <span>
                        &copy; {new Date().getFullYear()} ShopSee, Inc. |
                        <a href="/terms" className="ml-1 text-purple-600 hover:text-purple-800">
                            Terms of Use
                        </a>{" "}
                        |
                        <a href="/privacy" className="ml-1 text-purple-600 hover:text-purple-800">
                            Privacy Policy
                        </a>
                    </span>
                </footer>
            </main>
        </div>
    );
};

export default CmsLayout;
