import React from "react";
import { ShopLeftNav } from "../components/shop/ShopLeftNav";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <ShopLeftNav />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
