import React from "react";
import { Metadata } from "next";
import EditCustomContentPage from "./EditCustomContentPage";

export const metadata: Metadata = {
    title: "Edit Custom Content",
    description: "Edit custom content item"
};

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return <EditCustomContentPage id={parseInt(id)} />;
}