import React from "react";
import { Metadata } from "next";
import AddCustomContentPage from "../AddCustomContentPage";

export const metadata: Metadata = {
    title: "Add Custom Content",
    description: "Create a new custom content item"
};

interface PageProps {
    params: Promise<{
        companyId: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { companyId } = await params;
    return <AddCustomContentPage companyId={parseInt(companyId)} />;
}