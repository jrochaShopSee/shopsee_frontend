"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import axiosClient from "@/app/utils/axiosClient";
import { toast } from "react-toastify";
import { setCookie } from "@/app/utils";
import { useMainStore } from "@/app/store/mainStore";

function ShopifyCompleteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const clearShopifyContext = useMainStore((state) => state.clearShopifyContext);
    const [processing, setProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const completeSignup = async () => {
            const userId = searchParams.get("userId");
            const subId = searchParams.get("subId");
            const annual = searchParams.get("annual") === "true";
            const chargeId = searchParams.get("charge_id");

            if (!userId || !subId || !chargeId) {
                setError("Missing required parameters. Please contact support.");
                setProcessing(false);
                return;
            }

            try {
                // Call backend to complete signup and get JWT
                const response = await axiosClient.post("/api/shopify/complete-signup", {
                    userId: parseInt(userId),
                    subId: parseInt(subId),
                    annual: annual,
                    chargeId: parseInt(chargeId),
                });

                if (response.data.status === "success" && response.data.access_token) {
                    // Store JWT token
                    setCookie("access_token", response.data.access_token, 7);

                    // Clear Shopify context from sessionStorage (user is now registered)
                    clearShopifyContext();

                    setSuccess(true);
                    toast.success("Your ShopSee account is now active!");

                    // Redirect to dashboard
                    setTimeout(() => {
                        router.push("/cms/home");
                    }, 2000);
                } else {
                    setError("Failed to complete signup. Please try again.");
                    setProcessing(false);
                }
            } catch (err: unknown) {
                const errorMessage = (err as {response?: {data?: {message?: string}}})?.response?.data?.message || "Failed to complete signup";
                setError(errorMessage);
                toast.error(errorMessage);
                setProcessing(false);
            }
        };

        completeSignup();
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Error</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/pricing")}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
            <div className="bg-white p-12 rounded-lg shadow-lg max-w-md text-center">
                {processing && !success ? (
                    <>
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Completing Your Setup...</h1>
                        <p className="text-gray-600">Please wait while we finalize your ShopSee account.</p>
                    </>
                ) : success ? (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Success!</h1>
                        <p className="text-gray-600">Your subscription is active. Redirecting to your dashboard...</p>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default function ShopifyCompletePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            }
        >
            <ShopifyCompleteContent />
        </Suspense>
    );
}
