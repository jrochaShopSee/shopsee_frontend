"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalyticsApi } from "@/app/services/analyticsApi";
import { useAuth } from "@/app/hooks/useAuth";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { BarChart3, Package, TrendingUp, Building2, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "react-toastify";

interface BrandAnalytics {
    brandsCount: number;
    productsCount: number;
    avgProducts: number;
    topBrandsByProducts: Array<{ brandName: string; productCount: number }>;
}

const COLORS = ["#7c3aed", "#2563eb", "#059669", "#dc2626", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4"];

export default function BrandAnalyticsPage() {
    const router = useRouter();
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [analytics, setAnalytics] = useState<BrandAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait for auth to load
        if (authLoading) return;

        // Check admin role
        if (!isAdmin) {
            toast.error("Only administrators can access this page");
            router.push("/cms/home");
            return;
        }

        // Load analytics data
        loadAnalytics();
    }, [authLoading, isAdmin, router]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const data = await AnalyticsApi.getBrandAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to load brand analytics:", error);
            toast.error("Failed to load brand analytics");
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while auth or data is loading
    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    // Show error if not admin (shouldn't reach here due to redirect, but just in case)
    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">Unauthorized Access</p>
                    <p className="text-gray-600 text-sm mt-2">Only administrators can access this page</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 font-semibold">No data available</p>
                </div>
            </div>
        );
    }

    // Prepare chart data - filter out empty brand names
    const chartData = analytics.topBrandsByProducts
        .filter((item) => item.brandName && item.brandName.trim() !== "")
        .map((item) => ({
            name: item.brandName.length > 15 ? `${item.brandName.substring(0, 15)}...` : item.brandName,
            fullName: item.brandName,
            value: item.productCount,
        }));

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button onClick={() => router.push("/cms/home")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-6 border border-violet-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-600 rounded-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Brand Analytics</h1>
                                <p className="text-sm text-gray-600 mt-1">Overview of brands and their products</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Brands Count Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Number of Brands</p>
                        <h2 className="text-3xl font-bold text-gray-900">{analytics.brandsCount}</h2>
                    </div>

                    {/* Products Count Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Package className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Number of Products</p>
                        <h2 className="text-3xl font-bold text-gray-900">{analytics.productsCount}</h2>
                    </div>

                    {/* Average Products Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Average Products per Brand</p>
                        <h2 className="text-3xl font-bold text-gray-900">{analytics.avgProducts.toFixed(2)}</h2>
                    </div>
                </div>

                {/* Chart Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-violet-100 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Top 10 Brands with Most Products</h3>
                    </div>

                    {chartData.length > 0 ? (
                        <div className="w-full" style={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12, fill: "#6b7280" }} />
                                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} label={{ value: "Products", angle: -90, position: "insideLeft", style: { fontSize: 14, fill: "#6b7280" } }} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length > 0) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                                        <p className="font-semibold text-gray-900 mb-1">{data.fullName}</p>
                                                        <p className="text-sm text-gray-600">{data.value} {data.value === 1 ? "Product" : "Products"}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <p>No data available to display</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
