"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BankAccountPage() {
    const router = useRouter();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
            </button>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h1 className="text-3xl font-bold mb-4">Manage Bank Account</h1>
                <p className="text-gray-600">
                    This page is under construction. You can manage your bank account information here.
                </p>
            </div>
        </div>
    );
}
