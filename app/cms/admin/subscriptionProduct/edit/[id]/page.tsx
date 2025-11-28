"use client";

import React from "react";
import EditSubscriptionProductPage from "./EditSubscriptionProductPage";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function Page({ params }: PageProps) {
    const { id } = React.use(params);
    return <EditSubscriptionProductPage id={id} />;
}