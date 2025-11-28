import React from "react";
import { Metadata } from "next";
import AddCustomContentPage from "./AddCustomContentPage";

export const metadata: Metadata = {
    title: "Add Custom Content",
    description: "Create a new custom content item"
};

export default function Page() {
    return <AddCustomContentPage />;
}