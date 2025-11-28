"use client";
import React, { useEffect, useState } from "react";
import { rootUrl } from "./utils/host";
import { LoadingSpinner } from "./components/shared/LoadingSpinner";

export default function ApplicationClient({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const scriptSrc = `${rootUrl}/js/stv-internal.js`;

        if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
            const script = document.createElement("script");
            script.src = scriptSrc;
            script.async = true;

            script.onload = () => setLoaded(true);
            script.onerror = () => console.error("Failed to load the script:", script.src);

            document.head.appendChild(script);
        } else {
            setLoaded(true);
        }
    }, []);
    return <div>{loaded ? children : <LoadingSpinner />}</div>;
}
