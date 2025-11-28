"use client";

import React from "react";
import UserDetailsPage from "./UserDetailsPage";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function Page({ params }: PageProps) {
    const { id } = React.use(params);
    return <UserDetailsPage id={id} />;
}