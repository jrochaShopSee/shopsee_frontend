"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnalyticsApi } from "@/app/services/analyticsApi";
import { useAuth } from "@/app/hooks/useAuth";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { Video, Users, Eye, Clock, TrendingUp, ArrowLeft, Filter } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "react-toastify";

interface VideoSummary {
    totalVideos: number;
    totalViewers: number;
    totalViews: number;
    totalWatchedTime: string;
    totalWatchedTimeReadable: string;
    averageTime: string;
}

interface VideoStats {
    totalWatchedTime: string;
    totalWatchedTimeReadable: string;
    watchedCount: number;
    average: string;
    viewers: number;
}

interface ChartData {
    label: string;
    value: number;
}

interface FrequencyData {
    weekDay: string;
    frequency: number;
    hourFrequency: Record<string, number>;
}

const COLORS = ["#d7191c", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#00441b"];
const ACTION_COLORS = ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3"];
const GROWTH_COLOR = "#67bea5";
const FREQUENCY_COLOR = "#0f6fc6";

const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function VideoAnalyticsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    // Summary data state
    const [summary, setSummary] = useState<VideoSummary | null>(null);
    const [popularVideos, setPopularVideos] = useState<ChartData[]>([]);
    const [topActionsAll, setTopActionsAll] = useState<ChartData[]>([]);
    const [frequencyAll, setFrequencyAll] = useState<FrequencyData[]>([]);

    // Video-specific data state
    const [videos, setVideos] = useState<Array<{ id: number; name: string }>>([]);
    const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
    const [videoStats, setVideoStats] = useState<VideoStats | null>(null);
    const [videoViews, setVideoViews] = useState<ChartData[]>([]);
    const [topActionsVideo, setTopActionsVideo] = useState<ChartData[]>([]);
    const [frequencyVideo, setFrequencyVideo] = useState<FrequencyData[]>([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(false);

    // Filter states for overall data
    const [frequencyDateTerm, setFrequencyDateTerm] = useState<string>("allTime");
    const [frequencyStartDate, setFrequencyStartDate] = useState<string>("");
    const [frequencyEndDate, setFrequencyEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [selectedDayAll, setSelectedDayAll] = useState<string>("All");

    // Filter states for video-specific data
    const [term, setTerm] = useState<string>("monthly");
    const [dateTerm, setDateTerm] = useState<string>("allTime");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [selectedDayVideo, setSelectedDayVideo] = useState<string>("All");

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            toast.error("Please log in to access this page");
            router.push("/cms/home");
            return;
        }

        loadInitialData();
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!authLoading && user && frequencyDateTerm) {
            loadFrequencyAll();
        }
    }, [frequencyDateTerm, frequencyStartDate, frequencyEndDate, authLoading, user]);

    useEffect(() => {
        if (selectedVideo && !authLoading && user) {
            loadVideoData();
        }
    }, [selectedVideo, term, dateTerm, startDate, endDate, authLoading, user]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            const [summaryData, popularData, actionsData, freqData, videosList] = await Promise.all([
                AnalyticsApi.getVideoAnalyticsSummary(),
                AnalyticsApi.getPopularVideos(),
                AnalyticsApi.getTopActionsForAllVideos(),
                AnalyticsApi.getFrequencyForAllVideos({ platform: "Web" }),
                AnalyticsApi.getVideos(),
            ]);

            setSummary(summaryData);
            setPopularVideos(popularData);
            setTopActionsAll(actionsData);
            setFrequencyAll(freqData);
            setVideos(videosList);
        } catch (error) {
            console.error("Failed to load video analytics:", error);
            toast.error("Failed to load video analytics");
        } finally {
            setLoading(false);
        }
    };

    const loadFrequencyAll = async () => {
        try {
            const request: { startDate?: string; endDate?: string; platform?: string } = {
                platform: "Web",
            };

            if (frequencyDateTerm !== "allTime") {
                request.startDate = frequencyStartDate;
                request.endDate = frequencyEndDate;
            }

            const data = await AnalyticsApi.getFrequencyForAllVideos(request);
            setFrequencyAll(data);
        } catch (error) {
            console.error("Failed to load frequency data:", error);
            toast.error("Failed to load frequency data");
        }
    };

    const loadVideoData = async () => {
        if (!selectedVideo) return;

        try {
            setVideoLoading(true);

            const request: {
                videoId: number;
                startDate?: string;
                endDate?: string;
                platform?: string;
                term?: string;
            } = {
                videoId: selectedVideo,
                platform: "Web",
            };

            if (dateTerm !== "allTime") {
                request.startDate = startDate;
                request.endDate = endDate;
            }

            const [stats, views, actions, freq] = await Promise.all([
                AnalyticsApi.getVideoStats(request),
                AnalyticsApi.getVideoViews({ ...request, term }),
                AnalyticsApi.getTopActionsByVideo(request),
                AnalyticsApi.getFrequencyForVideo(request),
            ]);

            setVideoStats(stats);
            setVideoViews(views);
            setTopActionsVideo(actions);
            setFrequencyVideo(freq);
        } catch (error) {
            console.error("Failed to load video data:", error);
            toast.error("Failed to load video data");
        } finally {
            setVideoLoading(false);
        }
    };

    const handleFrequencyDateTermChange = (value: string) => {
        setFrequencyDateTerm(value);
        if (value === "allTime") {
            setFrequencyStartDate("");
        } else if (value !== "custom") {
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

            setFrequencyStartDate(start.toISOString().split("T")[0]);
        }
    };

    const handleDateTermChange = (value: string) => {
        setDateTerm(value);
        if (value === "allTime") {
            setStartDate("");
        } else if (value !== "custom") {
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

    const getHourlyData = useCallback((frequencies: FrequencyData[], selectedDay: string) => {
        if (frequencies.length === 0) return [];

        if (selectedDay === "All") {
            const allHours: Record<string, number> = {};
            frequencies.forEach((freq) => {
                Object.entries(freq.hourFrequency).forEach(([hour, count]) => {
                    allHours[hour] = (allHours[hour] || 0) + count;
                });
            });
            return Object.entries(allHours)
                .map(([hour, count]) => ({ label: `${hour}:00`, value: count }))
                .sort((a, b) => parseInt(a.label) - parseInt(b.label));
        } else {
            const dayData = frequencies.find((f) => f.weekDay === selectedDay);
            if (!dayData) return [];
            return Object.entries(dayData.hourFrequency)
                .map(([hour, count]) => ({ label: `${hour}:00`, value: count }))
                .sort((a, b) => parseInt(a.label) - parseInt(b.label));
        }
    }, []);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">Unauthorized Access</p>
                    <p className="text-gray-600 text-sm mt-2">Please log in to access this page</p>
                </div>
            </div>
        );
    }

    const dayChartDataAll = frequencyAll
        .sort((a, b) => DAY_ORDER.indexOf(a.weekDay) - DAY_ORDER.indexOf(b.weekDay))
        .map((item) => ({
            name: item.weekDay.substring(0, 3),
            fullName: item.weekDay,
            value: item.frequency,
        }));

    const hourlyChartDataAll = getHourlyData(frequencyAll, selectedDayAll);

    const dayChartDataVideo = frequencyVideo
        .sort((a, b) => DAY_ORDER.indexOf(a.weekDay) - DAY_ORDER.indexOf(b.weekDay))
        .map((item) => ({
            name: item.weekDay.substring(0, 3),
            fullName: item.weekDay,
            value: item.frequency,
        }));

    const hourlyChartDataVideo = getHourlyData(frequencyVideo, selectedDayVideo);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button onClick={() => router.push("/cms/home")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-600 rounded-lg">
                                <Video className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Video Analytics</h1>
                                <p className="text-sm text-gray-600 mt-1">Monitor video performance and viewer engagement</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Video className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Videos</p>
                        <h2 className="text-3xl font-bold text-gray-900">{summary?.totalVideos || 0}</h2>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Viewers</p>
                        <h2 className="text-3xl font-bold text-gray-900">{summary?.totalViewers || 0}</h2>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Eye className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Views</p>
                        <h2 className="text-3xl font-bold text-gray-900">{summary?.totalViews || 0}</h2>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Watched Time</p>
                        <h2 className="text-3xl font-bold text-gray-900">{summary?.totalWatchedTimeReadable || "0 min"}</h2>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-teal-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-teal-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Average View Duration</p>
                        <h2 className="text-3xl font-bold text-gray-900">{summary?.averageTime ? `${summary.averageTime}s` : "0s"}</h2>
                    </div>
                </div>

                {/* Charts Grid - Popular Videos and Top Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Total Views by Video</h3>
                        {popularVideos.length > 0 ? (
                            <div className="w-full" style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={popularVideos} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="label" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11, fill: "#6b7280" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                            {popularVideos.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <p>No data available</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Top Actions (For All Videos)</h3>
                        {topActionsAll.length > 0 ? (
                            <div className="w-full" style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topActionsAll} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="label" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11, fill: "#6b7280" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                            {topActionsAll.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={ACTION_COLORS[index % ACTION_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <p>No data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Frequency Analysis for All Videos */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Popular Week Days - Select an option below to check the popular hours</h3>

                    {/* Frequency Filters */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-violet-100 rounded-lg">
                            <Filter className="h-5 w-5 text-violet-600" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                <select
                                    value={frequencyDateTerm}
                                    onChange={(e) => handleFrequencyDateTermChange(e.target.value)}
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

                            {frequencyDateTerm === "custom" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={frequencyStartDate}
                                            onChange={(e) => setFrequencyStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={frequencyEndDate}
                                            onChange={(e) => setFrequencyEndDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Day of Week Chart */}
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-4 text-center">Day of Week</h4>
                            <div className="w-full" style={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dayChartDataAll}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                        <Tooltip content={({ active, payload }) => {
                                            if (active && payload && payload.length > 0) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                                        <p className="font-semibold text-gray-900">{data.fullName}</p>
                                                        <p className="text-sm text-gray-600">Views: {data.value}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Bar dataKey="value" fill={FREQUENCY_COLOR} radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Hourly Breakdown */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-md font-semibold text-gray-800">Hourly Breakdown</h4>
                                <div className="w-48">
                                    <select
                                        value={selectedDayAll}
                                        onChange={(e) => setSelectedDayAll(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="All">All Days</option>
                                        {DAY_ORDER.map((day) => (
                                            <option key={day} value={day}>
                                                {day}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="w-full" style={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyChartDataAll}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill={FREQUENCY_COLOR} radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-gray-300" />

                {/* Video-Specific Analytics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Choose a video from the list below to view the reports</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Video</label>
                            <select
                                value={selectedVideo || ""}
                                onChange={(e) => setSelectedVideo(Number(e.target.value) || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a video to filter the results</option>
                                {videos.map((video) => (
                                    <option key={video.id} value={video.id}>
                                        {video.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">View By</label>
                            <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <select value={dateTerm} onChange={(e) => handleDateTermChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="allTime">All Time</option>
                                <option value="lastWeek">Last Week</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="lastQuarter">Last Quarter</option>
                                <option value="lastYear">Last Year</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>

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

                    {selectedVideo && videoLoading && (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    )}

                    {selectedVideo && !videoLoading && videoStats && (
                        <>
                            {/* Video Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Total Watched Time</p>
                                    <p className="text-2xl font-bold text-gray-900">{videoStats.totalWatchedTimeReadable}</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Watched Count</p>
                                    <p className="text-2xl font-bold text-gray-900">{videoStats.watchedCount}</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Average Time</p>
                                    <p className="text-2xl font-bold text-gray-900">{videoStats.average}s</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Viewers</p>
                                    <p className="text-2xl font-bold text-gray-900">{videoStats.viewers}</p>
                                </div>
                            </div>

                            {/* Video Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Total Views</h3>
                                    <div className="w-full" style={{ height: 250 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={videoViews}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
                                                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="value" stroke={GROWTH_COLOR} strokeWidth={2} dot={{ r: 4, fill: GROWTH_COLOR }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Top Actions By Video</h3>
                                    <div className="w-full" style={{ height: 250 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topActionsVideo}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10, fill: "#6b7280" }} />
                                                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                                <Tooltip />
                                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                                    {topActionsVideo.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={ACTION_COLORS[index % ACTION_COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Frequency for Selected Video */}
                            <div className="space-y-6">
                                {/* Day of Week Chart */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 mb-4 text-center">Day of Week</h4>
                                    <div className="w-full" style={{ height: 250 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={dayChartDataVideo}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                                                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                                <Tooltip content={({ active, payload }) => {
                                                    if (active && payload && payload.length > 0) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                                                <p className="font-semibold text-gray-900">{data.fullName}</p>
                                                                <p className="text-sm text-gray-600">Views: {data.value}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }} />
                                                <Bar dataKey="value" fill={FREQUENCY_COLOR} radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Hourly Breakdown */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-md font-semibold text-gray-800">Hourly Breakdown</h4>
                                        <div className="w-48">
                                            <select
                                                value={selectedDayVideo}
                                                onChange={(e) => setSelectedDayVideo(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="All">All Days</option>
                                                {DAY_ORDER.map((day) => (
                                                    <option key={day} value={day}>
                                                        {day}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="w-full" style={{ height: 250 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={hourlyChartDataVideo}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} />
                                                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill={FREQUENCY_COLOR} radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
