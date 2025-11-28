"use client";

import React from "react";
import EditUserPage from "./EditUserPage";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function Page({ params }: PageProps) {
    const { id } = React.use(params);
    return <EditUserPage id={id} />;
}