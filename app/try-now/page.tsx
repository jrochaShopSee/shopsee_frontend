"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";

const Page = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home page - signup is now handled via modal
        router.push("/");
    }, [router]);

    return <LoadingSpinner />;
};

export default Page;
