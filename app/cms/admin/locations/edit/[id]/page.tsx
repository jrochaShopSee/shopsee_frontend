import React from "react";
import EditLocationPage from "./EditLocationPage";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

const Page: React.FC<PageProps> = async ({ params }) => {
    const { id } = await params;
    return <EditLocationPage id={id} />;
};

export default Page;