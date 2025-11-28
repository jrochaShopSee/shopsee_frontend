import React from "react";
import { Metadata } from "next";
import CustomContentPage from "./CustomContentPage";

export const metadata: Metadata = {
    title: "Custom Content Management",
    description: "Manage custom content items"
};

export default function Page() {
    return <CustomContentPage />;
}