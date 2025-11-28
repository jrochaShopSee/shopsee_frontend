"use client";

import { axiosClient, logout } from "@/app/utils";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Package, Users, CreditCard, UserCheck, BarChart3, FileText, ShoppingCart, Gift, Loader2, AlertTriangle, ChevronRight, Home, MapPin, Building, Receipt, IdCard, LogOut, Cog, StickyNote, Tag, Briefcase, Video, Image as ImageIcon, FileImage, PlusCircle, ChevronLeft, Menu } from "lucide-react";
import Image from "next/image";
import smallSizeLogo from "../../images/logo/favicon.png";
import fullLogo from "../../images/logo/logo.png";
import "../../css/cms-left-nav.css";

interface MenuItemProps {
    MenuItemId: number;
    MenuTitle: string;
    IconClass: string;
    Url: string;
    IsActive?: boolean;
    ChildMenuItems?: MenuItemProps[];
}

// Comprehensive icon mapping from FontAwesome classes to Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "fa-home": Home,
    "fa-shopping-cart": ShoppingCart,
    "fa-tags": Tag,
    "fa-users": Users,
    "fa-portrait": FileText,
    "fa-shopping-basket": Package,
    "fa-credit-card": CreditCard,
    "fa-map-marker-alt": MapPin,
    "fa-user-tie": Briefcase,
    "fa-chart-area": BarChart3,
    "fa-id-card": IdCard,
    "fa-sign-out-alt": LogOut,
    "fa-cogs": Cog,
    "fa-sticky-note": StickyNote,
    "fa-user-check": UserCheck,
    "fa-building": Building,
    "fa-receipt": Receipt,
    "fa-gift": Gift,
    "fa-box": Package,
    "fa-file-alt": FileText,
    "fa-chart-bar": BarChart3,
    "fa-file": FileText,
    "fa-video": Video,
    "fa-image": ImageIcon,
    "fa-media": ImageIcon,
    "fa-file-image": FileImage,
    "fa-plus-circle": PlusCircle,
};

interface CmsLeftNavProps {
    apiBaseUrl?: string;
    showLogo?: boolean;
    logoSrc?: string;
    onNavExpandChange?: (isExpanded: boolean) => void;
}

const CmsLeftNav: React.FC<CmsLeftNavProps> = ({ apiBaseUrl = "", showLogo = true, onNavExpandChange }) => {
    const [menuItems, setMenuItems] = useState<MenuItemProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedItem, setExpandedItem] = useState<number | null>(null);
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    const [isNavExpanded, setIsNavExpanded] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    // Load expanded state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem("cmsNavExpanded");
        const expanded = savedState === "true";
        setIsNavExpanded(expanded);
        onNavExpandChange?.(expanded);
    }, [onNavExpandChange]);

    // Save expanded state to localStorage when it changes
    const toggleNavExpanded = () => {
        const newState = !isNavExpanded;
        setIsNavExpanded(newState);
        localStorage.setItem("cmsNavExpanded", String(newState));
        onNavExpandChange?.(newState);
    };

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/api/MenuItems`);

                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                setMenuItems(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching menu items:", err);
                setError("Failed to load menu items");
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, [apiBaseUrl]);

    const handleMenuItemClick = (item: MenuItemProps) => {
        if (item.ChildMenuItems && item.ChildMenuItems.length > 0) {
            setExpandedItem(expandedItem === item.MenuItemId ? null : item.MenuItemId);
        } else if (item.Url && item.Url !== "javascript: void(0);" && item.Url !== "#") {
            // Check if it's a logout URL
            if (item.Url.toLowerCase().includes("logoff") || item.Url.toLowerCase().includes("logout")) {
                logout();
                return;
            }

            // Check if it's a Next.js route (starts with /cms)
            if (item.Url.startsWith("/cms")) {
                router.push(item.Url);
            } else {
                // Legacy MVC route - use window.location
                window.location.href = item.Url;
            }
        }
    };

    const handleChildMenuItemClick = (childItem: MenuItemProps) => {
        if (childItem.Url && childItem.Url !== "javascript: void(0);" && childItem.Url !== "#") {
            // Check if it's a logout URL
            if (childItem.Url.toLowerCase().includes("logoff") || childItem.Url.toLowerCase().includes("logout")) {
                logout();
                return;
            }

            if (childItem.Url.startsWith("/cms")) {
                router.push(childItem.Url);
            } else {
                window.location.href = childItem.Url;
            }
        }
    };

    const getIconComponent = (iconClass: string) => {
        const IconComponent = iconMap[iconClass] || Package;
        return <IconComponent className="h-5 w-5" />;
    };

    const isActiveRoute = (url: string) => {
        if (!url || url === "javascript: void(0);" || url === "#") return false;
        // Exact match only - don't highlight parent routes when on child routes
        return pathname === url;
    };

    const handleMouseLeave = () => {
        setExpandedItem(null);
        setHoveredItem(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 text-white">
                <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4 text-white" />
                    <p className="text-white text-xs">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-white p-5 text-center">
                <AlertTriangle className="h-5 w-5 mb-2 text-orange-300" />
                <p className="text-xs mb-2">Nav Error</p>
                <p className="text-xs opacity-80">{error}</p>
            </div>
        );
    }

    return (
        <div className={`admin-nav-container flex flex-col h-full relative transition-all duration-300 ${isNavExpanded ? "w-full nav-expanded" : "w-full"}`} style={{ backgroundColor: "#603493" }} onMouseLeave={handleMouseLeave}>
            {/* Logo section */}
            {showLogo && (
                <>
                    <div className={`admin-nav-logo flex items-center justify-center ${isNavExpanded ? "px-4 py-3" : ""} transition-all duration-300`}>
                        <button onClick={() => router.push("/")} className={`hover:opacity-80 transition-opacity flex-shrink-0 ${isNavExpanded ? "bg-white px-3 py-1.5 rounded" : ""}`} title="Go to Home">
                            {isNavExpanded ? <Image src={fullLogo} alt="ShopSee" width={120} height={32} className="h-8 w-auto" /> : <Image src={smallSizeLogo} alt="ShopSee" width={32} height={32} className="w-8 h-8 rounded bg-white p-0.5" />}
                        </button>
                    </div>
                    {/* Toggle button below logo - always shown */}
                    <div className="flex justify-center px-4 pb-2">
                        <button onClick={toggleNavExpanded} className="text-white hover:bg-purple-700 px-3 py-3 mt-2 rounded transition-colors text-xs flex items-center gap-1 " title={isNavExpanded ? "Collapse menu" : "Expand menu"}>
                            {isNavExpanded ? (
                                <>
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Collapse</span>
                                </>
                            ) : (
                                <Menu className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </>
            )}

            {/* Navigation content */}
            <div className="admin-nav-content">
                <div className="admin-nav-scroll">
                    <ul className="admin-nav-list">
                        {menuItems.map((item, index) => {
                            const isActive = isActiveRoute(item.Url);
                            const isExpanded = expandedItem === item.MenuItemId;
                            const isHovered = hoveredItem === item.MenuItemId;

                            return (
                                <li key={item.MenuItemId || index} style={{ position: "relative" }}>
                                    <div className={`admin-nav-item ${isActive || isExpanded ? "active" : ""} ${isNavExpanded ? "w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-700 transition-colors cursor-pointer" : ""}`} onClick={() => handleMenuItemClick(item)} onMouseEnter={() => setHoveredItem(item.MenuItemId)} onMouseLeave={() => setHoveredItem(null)} title={isNavExpanded ? "" : item.MenuTitle}>
                                        <div className={`flex-shrink-0 transition-transform duration-300 ${isHovered && !isNavExpanded ? "scale-110" : ""}`}>{getIconComponent(item.IconClass)}</div>
                                        {isNavExpanded && <span className="text-sm font-medium text-white whitespace-nowrap flex-1">{item.MenuTitle}</span>}
                                        {!isNavExpanded && <div className={`admin-nav-tooltip ${isHovered ? "opacity-100 translate-x-1" : "opacity-0"}`}>{item.MenuTitle}</div>}
                                    </div>
                                    {item.ChildMenuItems && item.ChildMenuItems.length > 0 && (
                                        <div className={`admin-nav-submenu ${isExpanded ? "show" : ""}`}>
                                            <div className="admin-nav-submenu-header">
                                                <h3 className="admin-nav-submenu-title">{item.MenuTitle}</h3>
                                            </div>
                                            {item.ChildMenuItems.map((childItem, childIndex) => {
                                                const isChildActive = isActiveRoute(childItem.Url);
                                                return (
                                                    <div key={childItem.MenuItemId || childIndex} className={`admin-nav-submenu-item ${isChildActive ? "bg-purple-50 text-purple-700 border-r-2 border-purple-700" : ""}`} onClick={() => handleChildMenuItemClick(childItem)}>
                                                        <div className="flex items-center">
                                                            <span>{childItem.MenuTitle}</span>
                                                            {isChildActive && <ChevronRight className="h-3 w-3 ml-auto" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CmsLeftNav;
