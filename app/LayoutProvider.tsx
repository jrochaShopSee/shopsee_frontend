"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface LayoutProviderProps {
    cmsLayout: ReactNode;
    unauthLayout: ReactNode;
    children?: ReactNode;
}

export default function LayoutProvider({ cmsLayout, unauthLayout, children }: LayoutProviderProps) {
    const pathname = usePathname();

    // Check if the current path starts with /cms or /shop
    const isCmsRoute = pathname.startsWith("/cms");
    const isShopRoute = pathname.startsWith("/shop");

    // Shop routes use their own layout (no navbar/footer from unauth layout)
    if (isShopRoute) {
        return <>{children}</>;
    }

    return <>{isCmsRoute ? cmsLayout : unauthLayout}</>;
}
