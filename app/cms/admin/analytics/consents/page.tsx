"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalyticsApi, ConsentAnalyticsData } from "@/app/services/analyticsApi";
import { useAuth } from "@/app/hooks/useAuth";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FileVideo, FileSignature, Eye, Clock, TrendingUp, Users } from "lucide-react";

// Color palette from MVC view
const ACTION_COLORS = [
    "#ef5350", // red
    "#009688", // teal
    "#ff9800", // orange
    "#007bff", // blue
    "#28a745", // green
    "#ffc107", // yellow
    "#dc3545", // red-dark
    "#17a2b8", // cyan
];

const BAR_COLORS = {
    openedSection: "#67001f",
    sectionConfirmation: "#3498db",
    openedDischarge: "#2ecc71",
    dischargeConfirmation: "#e74c3c",
    documentViewed: "#f1c40f",
    submittedSignatures: "#9b59b6",
    surveyViewed: "#85c1e9",
    surveyClicked: "#a9dfbf",
};

export default function ConsentAnalyticsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, canAddConsentVideo, isAdmin } = useAuth();
    const [analyticsData, setAnalyticsData] = useState<ConsentAnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [selectedVideo, setSelectedVideo] = useState<string>("");
    const [selectedSigner, setSelectedSigner] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [dateTerm, setDateTerm] = useState<string>("last7days");

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            toast.error("Please log in to access this page");
            router.push("/cms/home");
            return;
        }
        // Redirect if user doesn't have consent capability and is not admin
        if (!isAdmin && !canAddConsentVideo) {
            toast.error("You don't have permission to access this page");
            router.push("/cms/home");
            return;
        }
        loadInitialData();
    }, [authLoading, user, canAddConsentVideo, isAdmin, router]);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            // Default to last 7 days
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 7);

            setStartDate(start.toISOString().split("T")[0]);
            setEndDate(end.toISOString().split("T")[0]);

            const data = await AnalyticsApi.getConsentAnalyticsSummary(undefined, undefined, start.toISOString(), end.toISOString());
            console.log(data);
            setAnalyticsData(data);
        } catch (error) {
            console.error("Failed to load consent analytics:", error);
            toast.error("Failed to load consent analytics");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateTermChange = (term: string) => {
        setDateTerm(term);

        const end = new Date();
        end.setHours(23, 59, 59, 999);
        let start = new Date();

        switch (term) {
            case "today":
                start.setHours(0, 0, 0, 0);
                break;
            case "last7days":
                start.setDate(start.getDate() - 7);
                break;
            case "last30days":
                start.setDate(start.getDate() - 30);
                break;
            case "thisMonth":
                start = new Date(start.getFullYear(), start.getMonth(), 1);
                break;
            case "lastMonth":
                start = new Date(start.getFullYear(), start.getMonth() - 1, 1);
                end.setTime(new Date(start.getFullYear(), start.getMonth() + 1, 0).getTime());
                break;
            case "allTime":
                start = new Date(2000, 0, 1);
                break;
            case "custom":
                return; // Don't filter yet, wait for manual date selection
        }

        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);

        if (term !== "custom") {
            handleFilterChange(undefined, undefined, start.toISOString(), end.toISOString());
        }
    };

    const handleFilterChange = async (video?: string, signer?: string, start?: string, end?: string) => {
        try {
            setIsLoading(true);

            const videoId = video !== undefined ? video : selectedVideo;
            const signerName = signer !== undefined ? signer : selectedSigner;
            const startDateTime = start || (startDate ? new Date(startDate).toISOString() : undefined);
            const endDateTime = end || (endDate ? new Date(endDate + "T23:59:59").toISOString() : undefined);

            const data = await AnalyticsApi.filterConsentAnalytics({
                selectedVideo: videoId ? parseInt(videoId) : undefined,
                signerName: signerName || undefined,
                startDate: startDateTime,
                endDate: endDateTime,
            });

            setAnalyticsData(data);
        } catch (error) {
            console.error("Failed to filter consent analytics:", error);
            toast.error("Failed to filter data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVideoChange = (video: string) => {
        setSelectedVideo(video);
        handleFilterChange(video, undefined);
    };

    const handleSignerChange = (signer: string) => {
        setSelectedSigner(signer);
        handleFilterChange(undefined, signer);
    };

    // Convert dictionary to chart data
    const convertToChartData = (data: Record<string, number>) => {
        return Object.entries(data).map(([label, value]) => ({
            label,
            value,
        }));
    };

    // Convert and sort top actions by value (descending)
    const convertTopActionsData = (data: Record<string, number>) => {
        return Object.entries(data)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600">No data available</p>
            </div>
        );
    }

    const showTotalVideosCard = !selectedVideo;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Consent Analytics</h1>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Video and Signer Filters */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Video</label>
                            <select value={selectedVideo} onChange={(e) => handleVideoChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All</option>
                                {analyticsData.videosList.map((video) => (
                                    <option key={video.value} value={video.value}>
                                        {video.text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Signers</label>
                            <select value={selectedSigner} onChange={(e) => handleSignerChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All</option>
                                {analyticsData.signersName.map((signer) => (
                                    <option key={signer.value} value={signer.value}>
                                        {signer.text}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Right Column - Date Filters */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <select value={dateTerm} onChange={(e) => handleDateTermChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="today">Today</option>
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                                <option value="thisMonth">This Month</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="allTime">All Time</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>

                        {dateTerm === "custom" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            if (endDate) {
                                                handleFilterChange();
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            if (startDate) {
                                                handleFilterChange();
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards - Top Row */}
            <div className={`grid ${showTotalVideosCard ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6 mb-6`}>
                {showTotalVideosCard && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200">
                        <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-600 rounded-lg">
                                    <FileVideo className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Total Consent Videos</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-4xl font-bold text-violet-600">{analyticsData.totalConsentVideos}</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <FileSignature className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Total Signatures</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-blue-600">{analyticsData.totalConsentSignatures}</p>
                    </div>
                </div>
            </div>

            {/* Watch Time Statistics - Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <h4 className="text-sm font-medium text-gray-700">Watched Time</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.videoWatchedTime.totalTimeWatchedReadable}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-green-600" />
                        <h4 className="text-sm font-medium text-gray-700">Watched Count</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.videoWatchedTime.watchedTimes}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h4 className="text-sm font-medium text-gray-700">Average Time</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.videoWatchedTime.average}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        <h4 className="text-sm font-medium text-gray-700">Viewers</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.videoWatchedTime.viewers}</p>
                </div>
            </div>

            {/* Top Actions Chart - Full Width Horizontal Bar */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Top Actions</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={convertTopActionsData(analyticsData.topActionTypes)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="label" width={140} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                            {convertTopActionsData(analyticsData.topActionTypes).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={ACTION_COLORS[index % ACTION_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Section Confirmations - Two Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Opened View Sections Confirmations</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={convertToChartData(analyticsData.openedSectionConfirmations)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill={BAR_COLORS.openedSection} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Confirmed View Sections Confirmations</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={convertToChartData(analyticsData.sectionConfirmations)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill={BAR_COLORS.sectionConfirmation} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Discharge Charts - Two Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Opened Discharges</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={convertToChartData(analyticsData.openedDischarge)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill={BAR_COLORS.openedDischarge} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Discharge Confirmations</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={convertToChartData(analyticsData.dischargeConfirmation)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill={BAR_COLORS.dischargeConfirmation} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Survey Charts - Two Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Survey Viewed</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={convertToChartData(analyticsData.surveyViewed)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill={BAR_COLORS.surveyViewed} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Survey Button Clicked</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={convertToChartData(analyticsData.surveyClicked)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill={BAR_COLORS.surveyClicked} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* DocuSign Charts - Two Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">DocuSign Document Opened</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={convertToChartData(analyticsData.documentViewed)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill={BAR_COLORS.documentViewed} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">DocuSign Document Signed</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={convertToChartData(analyticsData.submittedSignatures)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill={BAR_COLORS.submittedSignatures} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
