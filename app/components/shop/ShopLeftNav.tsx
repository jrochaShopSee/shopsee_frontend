"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    User,
    Lock,
    MapPin,
    ShoppingBag,
    LogOut,
    LayoutDashboard
} from "lucide-react";
import axiosClient from "@/app/utils/axiosClient";
import { deleteCookie } from "@/app/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/components/ui/Dialog";
import { Button } from "@/app/components/ui/Button";

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive }) => (
    <Link
        href={href}
        className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
            isActive
                ? "bg-violet-700 text-white border-l-4 border-white"
                : "text-violet-100 hover:bg-violet-700 hover:text-white"
        }`}
    >
        <span className="mr-3">{icon}</span>
        {label}
    </Link>
);

export const ShopLeftNav: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const handleLogout = async () => {
        setShowLogoutDialog(false);
        try {
            await axiosClient.post("/api/members/logout");
            deleteCookie("access_token");
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
            // Still redirect to home even if API call fails
            deleteCookie("access_token");
            router.push("/");
        }
    };

    const navItems = [
        {
            href: "/",
            icon: <Home className="w-5 h-5" />,
            label: "Home",
        },
        {
            href: "/shop/account",
            icon: <LayoutDashboard className="w-5 h-5" />,
            label: "Dashboard",
        },
        {
            href: "/shop/profile",
            icon: <User className="w-5 h-5" />,
            label: "My Profile",
        },
        {
            href: "/shop/change-password",
            icon: <Lock className="w-5 h-5" />,
            label: "Change Password",
        },
        {
            href: "/shop/addresses",
            icon: <MapPin className="w-5 h-5" />,
            label: "My Addresses",
        },
        {
            href: "/shop/orders",
            icon: <ShoppingBag className="w-5 h-5" />,
            label: "Order History",
        },
    ];

    return (
        <nav className="h-screen w-64 bg-[#603493] text-white flex flex-col sticky top-0 left-0">
            {/* Header */}
            <div className="p-6 border-b border-violet-700">
                <h2 className="text-xl font-bold">My Account</h2>
                <p className="text-sm text-violet-200 mt-1">Customer Portal</p>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-4">
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        isActive={pathname === item.href}
                    />
                ))}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-violet-700">
                <button
                    onClick={() => setShowLogoutDialog(true)}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-violet-100 hover:bg-violet-700 hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>

            {/* Logout Confirmation Dialog */}
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Confirm Logout</DialogTitle>
                        <DialogDescription>
                            <div className="flex items-start gap-3 mt-2">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5">
                                    <span className="text-yellow-600 text-sm font-bold">!</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-700 font-medium">Are you sure you want to log out?</p>
                                    <p className="text-gray-500 text-sm mt-1">You will need to sign in again to access your account.</p>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowLogoutDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </nav>
    );
};

export default ShopLeftNav;
