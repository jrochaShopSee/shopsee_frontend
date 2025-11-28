import React from "react";
import EditProductPage from "./EditProductPage";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

const Page: React.FC<PageProps> = async ({ params }) => {
    const { id } = await params;
    return <EditProductPage productId={id} />;
};

export default Page;