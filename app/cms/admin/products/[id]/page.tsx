import React from "react";
import ProductDetailsPage from "./ProductDetailsPage";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

const Page: React.FC<PageProps> = async ({ params }) => {
    const { id } = await params;
    return <ProductDetailsPage productId={id} />;
};

export default Page;