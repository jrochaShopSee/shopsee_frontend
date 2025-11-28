"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalyticsApi } from "@/app/services/analyticsApi";
import { useAuth } from "@/app/hooks/useAuth";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { CreditCard, TrendingUp, ArrowLeft, Filter } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "react-toastify";

interface SubscriptionData {
    name: string;
    subCategoryInfo: Array<{
        name: string;
        customerCount: number;
        totalPrice: string;
    }>;
}

interface GrowthData {
    label: string;
    genericList: Array<{
        dateAdded: string;
        renewalDate?: string;
        active: boolean;
    }>;
    growth: string;
}

const COLORS = ["#d7191c", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#00441b"];
const GROWTH_COLOR = "#67bea5";

export default function SubscriptionAnalyticsPage() {
    const router = useRouter();
    const { isAdmin, isLoading: authLoading } = useAuth();

    // Data states
    const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
    const [growthData, setGrowthData] = useState<GrowthData[]>([]);
    const [categories, setCategories] = useState<Array<{ text: string; value: string }>>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [term, setTerm] = useState<string>("monthly");
    const [dateTerm, setDateTerm] = useState<string>("allTime");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

    useEffect(() => {
        if (authLoading) return;

        if (!isAdmin) {
            toast.error("Only administrators can access this page");
            router.push("/cms/home");
            return;
        }

        loadCategories();
    }, [authLoading, isAdmin, router]);

    useEffect(() => {
        if (!authLoading && isAdmin && categories.length > 0) {
            loadAnalytics();
        }
    }, [selectedCategory, term, dateTerm, startDate, endDate, authLoading, isAdmin, categories.length]);

    const loadCategories = async () => {
        try {
            const cats = await AnalyticsApi.getSubscriptionCategories();
            setCategories(cats);
            if (cats.length > 0) {
                setSelectedCategory(cats[0].value);
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
            toast.error("Failed to load subscription categories");
        }
    };

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            const request = {
                category: selectedCategory,
                startDate: dateTerm === "allTime" ? undefined : startDate,
                endDate: endDate,
                term: term,
            };

            const [subData, growData] = await Promise.all([
                AnalyticsApi.getSubscriptionData(request),
                AnalyticsApi.getSubscriptionGrowth(request),
            ]);

            setSubscriptionData(subData);
            setGrowthData(growData);
        } catch (error) {
            console.error("Failed to load subscription analytics:", error);
            toast.error("Failed to load subscription analytics");
        } finally {
            setLoading(false);
        }
    };

    const handleDateTermChange = (value: string) => {
        setDateTerm(value);
        if (value === "allTime") {
            setStartDate("");
        } else if (value === "custom") {
            // Custom date range - user will set dates manually
        } else {
            // Calculate start date based on term
            const now = new Date();
            const start = new Date();

            switch (value) {
                case "lastWeek":
                    start.setDate(now.getDate() - 7);
                    break;
                case "lastMonth":
                    start.setMonth(now.getMonth() - 1);
                    break;
                case "lastQuarter":
                    start.setMonth(now.getMonth() - 3);
                    break;
                case "lastYear":
                    start.setFullYear(now.getFullYear() - 1);
                    break;
            }

            setStartDate(start.toISOString().split("T")[0]);
        }
    };

    if (authLoading || (loading && !subscriptionData)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

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

    // Prepare chart data
    const barChartData = subscriptionData?.subCategoryInfo
        .filter((item) => item.name && item.name.trim() !== "")
        .map((item) => ({
            name: item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name,
            fullName: item.name,
            value: item.customerCount,
            price: item.totalPrice,
        })) || [];

    const lineChartData = growthData.map((item) => ({
        name: item.label,
        value: item.genericList.length,
        growth: item.growth,
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Subscription Analytics</h1>
                                <p className="text-sm text-gray-600 mt-1">Monitor subscription performance and growth trends</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-violet-100 rounded-lg">
                            <Filter className="h-5 w-5 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Term Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">View By</label>
                            <select
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <select
                                value={dateTerm}
                                onChange={(e) => handleDateTermChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="allTime">All Time</option>
                                <option value="lastWeek">Last Week</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="lastQuarter">Last Quarter</option>
                                <option value="lastYear">Last Year</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>

                        {/* Custom Date Inputs - Show when custom is selected */}
                        {dateTerm === "custom" && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Subscription Count Chart (Bar) */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <CreditCard className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{subscriptionData?.name || "Subscription Count"}</h3>
                        </div>

                        {barChartData.length > 0 ? (
                            <div className="w-full" style={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData} margin={{ top: 20, right: 10, left: 10, bottom: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11, fill: "#6b7280" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length > 0) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                                            <p className="font-semibold text-gray-900 mb-1">{data.fullName}</p>
                                                            <p className="text-sm text-gray-600">Subscribers: {data.value}</p>
                                                            <p className="text-sm text-gray-600">Total Value: {data.price}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                            {barChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <p>No subscription data available</p>
                            </div>
                        )}
                    </div>

                    {/* Growth Chart (Line) */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Growth Status for the Period</h3>
                        </div>

                        {lineChartData.length > 0 ? (
                            <div className="w-full" style={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineChartData} margin={{ top: 20, right: 10, left: 10, bottom: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11, fill: "#6b7280" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length > 0) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                                            <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
                                                            <p className="text-sm text-gray-600">Subscribers: {data.value}</p>
                                                            <p className="text-sm text-gray-600">Growth: {data.growth}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke={GROWTH_COLOR}
                                            strokeWidth={2}
                                            dot={{ r: 4, fill: GROWTH_COLOR }}
                                            fill={GROWTH_COLOR}
                                            fillOpacity={0.2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <p>No growth data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
