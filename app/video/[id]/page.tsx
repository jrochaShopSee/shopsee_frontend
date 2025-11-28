import { Suspense } from "react";
import VideoPublicPage from "./VideoPublicPage";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <VideoPublicPage id={id} />
        </Suspense>
    );
}
