"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { AnalyticsApi, MobileAnalyticsSummary } from "@/app/services/analyticsApi";
import { Smartphone, Users, TrendingUp, ThumbsUp, Heart, Clock, Eye, Play, Info, Filter, Search, Video } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Cell } from "recharts";

interface ChartData {
    label: string;
    value?: number;
    count?: number;
    gains?: number;
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

export default function MobileAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<MobileAnalyticsSummary | null>(null);

    // Chart data state
    const [popularVideos, setPopularVideos] = useState<ChartData[]>([]);
    const [topActionsAll, setTopActionsAll] = useState<ChartData[]>([]);
    const [frequencyAll, setFrequencyAll] = useState<FrequencyData[]>([]);
    const [likesGrowth, setLikesGrowth] = useState<ChartData[]>([]);
    const [favoritesGrowth, setFavoritesGrowth] = useState<ChartData[]>([]);
    const [videoViews, setVideoViews] = useState<ChartData[]>([]);
    const [topActionsVideo, setTopActionsVideo] = useState<ChartData[]>([]);
    const [frequencyVideo, setFrequencyVideo] = useState<FrequencyData[]>([]);
    const [searchAppearances, setSearchAppearances] = useState<{ value: number; searchGains: ChartData[] } | null>(null);

    // Filter state
    const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
    const [term, setTerm] = useState<string>("monthly");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [selectedDayAll, setSelectedDayAll] = useState<string>("All");
    const [selectedDayVideo, setSelectedDayVideo] = useState<string>("All");

    const [chartsLoading, setChartsLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (data) {
            loadInitialCharts();
        }
    }, [data]);

    useEffect(() => {
        if (data && selectedVideo !== null) {
            loadVideoSpecificCharts();
        }
    }, [selectedVideo, term, startDate, endDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const summary = await AnalyticsApi.getMobileAnalyticsSummary();
            setData(summary);
        } catch (error) {
            console.error("Failed to load mobile analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadInitialCharts = async () => {
        try {
            const [popularVids, topActs, freq] = await Promise.all([
                AnalyticsApi.getPopularVideos("Mobile"),
                AnalyticsApi.getTopActionsForAllVideos("Mobile"),
                AnalyticsApi.getFrequencyForAllVideos({ platform: "Mobile" })
            ]);

            setPopularVideos(popularVids);
            setTopActionsAll(topActs);
            setFrequencyAll(freq);
        } catch (error) {
            console.error("Failed to load initial charts:", error);
        }
    };

    const loadVideoSpecificCharts = async () => {
        if (selectedVideo === null) return;

        try {
            setChartsLoading(true);

            const [likes, favs, views, topActs, freq, search] = await Promise.all([
                AnalyticsApi.getMobileLikesGrowth({ episodeId: selectedVideo, term, startDate, endDate }),
                AnalyticsApi.getMobileFavoritesGrowth({ episodeId: selectedVideo, term, startDate, endDate }),
                AnalyticsApi.getVideoViews({ videoId: selectedVideo, term, startDate, endDate, platform: "Mobile" }),
                AnalyticsApi.getTopActionsByVideo({ videoId: selectedVideo, startDate, endDate, platform: "Mobile" }),
                AnalyticsApi.getFrequencyForVideo({ videoId: selectedVideo, startDate, endDate, platform: "Mobile" }),
                AnalyticsApi.getMobileSearchAppearances({ episodeId: selectedVideo, term, startDate, endDate })
            ]);

            setLikesGrowth(likes);
            setFavoritesGrowth(favs);
            setVideoViews(views);
            setTopActionsVideo(topActs);
            setFrequencyVideo(freq);
            setSearchAppearances(search);
        } catch (error) {
            console.error("Failed to load video charts:", error);
        } finally {
            setChartsLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        return num.toLocaleString('en-US');
    };

    const getHourlyData = (dayData: FrequencyData[], selectedDay: string) => {
        if (selectedDay === "All") {
            const hourlyTotals: Record<string, number> = {};
            dayData.forEach(day => {
                Object.entries(day.hourFrequency).forEach(([hour, freq]) => {
                    hourlyTotals[hour] = (hourlyTotals[hour] || 0) + freq;
                });
            });
            return Object.entries(hourlyTotals)
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                .map(([hour, frequency]) => ({ label: `${hour}:00`, value: frequency }));
        } else {
            const dayFreq = dayData.find(d => d.weekDay === selectedDay);
            if (!dayFreq) return [];
            return Object.entries(dayFreq.hourFrequency)
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                .map(([hour, frequency]) => ({ label: `${hour}:00`, value: frequency }));
        }
    };

    interface TooltipProps {
        text: string;
    }

    const Tooltip = ({ text }: TooltipProps) => (
        <div className="group relative inline-block ml-1">
            <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
            <div className="invisible group-hover:visible absolute z-10 w-64 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-6 transform opacity-0 group-hover:opacity-100 transition-all duration-200">
                {text}
                <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-gray-600">No data available</p>
            </div>
        );
    }

    const isAdmin = data.userRole === "Admin";
    const sortedFrequencyAll = [...frequencyAll].sort((a, b) => DAY_ORDER.indexOf(a.weekDay) - DAY_ORDER.indexOf(b.weekDay));
    const sortedFrequencyVideo = [...frequencyVideo].sort((a, b) => DAY_ORDER.indexOf(a.weekDay) - DAY_ORDER.indexOf(b.weekDay));
    const hourlyDataAll = getHourlyData(frequencyAll, selectedDayAll);
    const hourlyDataVideo = getHourlyData(frequencyVideo, selectedDayVideo);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mobile Videos Analytics</h1>

            {/* Role-based Summary Cards */}
            {isAdmin ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center">
                                    <h3 className="text-sm font-semibold text-gray-800">Daily Active Users</h3>
                                    <Tooltip text="Unique users who signed in within the last 24 hours, tracked by IP address" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-4xl font-bold text-blue-600">{formatNumber(data.dailyActiveUsers)}</p>
                            <p className="text-xs text-gray-500 mt-1">DAU</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-600 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center">
                                    <h3 className="text-sm font-semibold text-gray-800">Monthly Active Users</h3>
                                    <Tooltip text="Unique users who signed in within the last 30 days, tracked by IP address" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-4xl font-bold text-purple-600">{formatNumber(data.monthlyActiveUsers)}</p>
                            <p className="text-xs text-gray-500 mt-1">MAU</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-600 rounded-lg">
                                    <Smartphone className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-800">Total Videos</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-4xl font-bold text-emerald-600">{formatNumber(data.totalVideos)}</p>
                            <p className="text-xs text-gray-500 mt-1">Active videos</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-600 rounded-lg">
                                    <Eye className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center">
                                    <h3 className="text-sm font-semibold text-gray-800">Search Appearances</h3>
                                    <Tooltip text="Total number of times videos appeared in search results" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-4xl font-bold text-orange-600">{formatNumber(data.appearedInSearchsCount)}</p>
                            <p className="text-xs text-gray-500 mt-1">Times shown</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-600 rounded-lg">
                                    <Smartphone className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-800">Total Videos</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-4xl font-bold text-emerald-600">{formatNumber(data.totalVideos)}</p>
                            <p className="text-xs text-gray-500 mt-1">Active videos</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-600 rounded-lg">
                                    <Eye className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center">
                                    <h3 className="text-sm font-semibold text-gray-800">Search Appearances</h3>
                                    <Tooltip text="Total number of times videos appeared in search results" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-4xl font-bold text-orange-600">{formatNumber(data.appearedInSearchsCount)}</p>
                            <p className="text-xs text-gray-500 mt-1">Times shown</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Engagement Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-600 rounded-lg">
                                <ThumbsUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex items-center">
                                <h3 className="text-sm font-semibold text-gray-800">Total Likes</h3>
                                <Tooltip text="Total number of likes across all mobile videos" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-rose-600">{formatNumber(data.totalLikes)}</p>
                        <p className="text-xs text-gray-500 mt-1">Engagement metric</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-600 rounded-lg">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex items-center">
                                <h3 className="text-sm font-semibold text-gray-800">Total Favorites</h3>
                                <Tooltip text="Total number of times videos were added to favorites" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-red-600">{formatNumber(data.totalFavorites)}</p>
                        <p className="text-xs text-gray-500 mt-1">Engagement metric</p>
                    </div>
                </div>
            </div>

            {/* Watch Time Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex items-center">
                                <h3 className="text-sm font-semibold text-gray-800">Total Watch Time</h3>
                                <Tooltip text="Cumulative time users have spent watching videos" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-2xl font-bold text-indigo-600">{data.totalWatchedTime.totalTimeWatchedReadable}</p>
                        <p className="text-xs text-gray-500 mt-1">{data.totalWatchedTime.totalTimeWatched}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-cyan-50 to-sky-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-600 rounded-lg">
                                <Play className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex items-center">
                                <h3 className="text-sm font-semibold text-gray-800">Watch Count</h3>
                                <Tooltip text="Total number of video play sessions" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-cyan-600">{formatNumber(data.totalWatchedTime.watchedTimes)}</p>
                        <p className="text-xs text-gray-500 mt-1">Play sessions</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-600 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex items-center">
                                <h3 className="text-sm font-semibold text-gray-800">Average Time</h3>
                                <Tooltip text="Average watch time per video session" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-2xl font-bold text-violet-600">{data.totalWatchedTime.average}</p>
                        <p className="text-xs text-gray-500 mt-1">Per session</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-600 rounded-lg">
                                <Eye className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex items-center">
                                <h3 className="text-sm font-semibold text-gray-800">Total Viewers</h3>
                                <Tooltip text="Unique users who have watched videos" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-teal-600">{formatNumber(data.totalWatchedTime.viewers)}</p>
                        <p className="text-xs text-gray-500 mt-1">Unique users</p>
                    </div>
                </div>
            </div>

            {/* Charts Section for All Videos */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Video Analytics</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Popular Videos Chart */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Total Views</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={popularVideos}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <ChartTooltip />
                                <Bar dataKey="value" fill={COLORS[0]}>
                                    {popularVideos.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Actions Chart */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Top Actions (For All Videos)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topActionsAll}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <ChartTooltip />
                                <Bar dataKey="value" fill={ACTION_COLORS[0]}>
                                    {topActionsAll.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={ACTION_COLORS[index % ACTION_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Frequency Charts for All Videos */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Popular Week Days</h3>

                    {/* Day Selector Container */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select a day to see popular hours</label>
                        <div className="flex gap-4 items-center">
                            <select
                                value={selectedDayAll}
                                onChange={(e) => setSelectedDayAll(e.target.value)}
                                className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All">All Days</option>
                                {DAY_ORDER.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedDayAll("All")}
                                    className={`px-4 py-2 rounded transition-colors ${selectedDayAll === "All" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}
                                >
                                    All
                                </button>
                                {DAY_ORDER.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDayAll(day)}
                                        className={`px-4 py-2 rounded transition-colors ${selectedDayAll === day ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Weekday Frequency */}
                        <div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={sortedFrequencyAll.map(d => ({ label: d.weekDay, value: d.frequency }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <ChartTooltip />
                                    <Bar dataKey="value" fill={FREQUENCY_COLOR} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Hourly Frequency */}
                        <div>
                            <h4 className="text-md font-semibold text-gray-700 mb-2 text-center">
                                Popular Hours {selectedDayAll !== "All" && `for ${selectedDayAll}`}
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={hourlyDataAll}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <ChartTooltip />
                                    <Bar dataKey="value" fill={FREQUENCY_COLOR} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Filter Section */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <Filter className="w-6 h-6 text-gray-700" />
                    <h2 className="text-2xl font-bold text-gray-900">Filter by Video</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Video className="w-4 h-4 inline mr-1" />
                            Select Video
                        </label>
                        <select
                            value={selectedVideo || ""}
                            onChange={(e) => setSelectedVideo(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Videos</option>
                            {data.programList.map((video) => (
                                <option key={video.value} value={video.value}>
                                    {video.text}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                        <select
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!selectedVideo}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!selectedVideo}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!selectedVideo}
                        />
                    </div>
                </div>
            </div>

            {/* Video-Specific Charts */}
            {selectedVideo && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                    {chartsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Video-Specific Analytics</h2>

                            {/* Likes and Favorites Growth Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Likes Growth</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={likesGrowth}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <ChartTooltip />
                                            <Line type="monotone" dataKey="count" stroke={GROWTH_COLOR} strokeWidth={2} name="Total Likes" />
                                            <Line type="monotone" dataKey="gains" stroke="#4c8bd6" strokeWidth={2} name="New Likes" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Favorites Growth</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={favoritesGrowth}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <ChartTooltip />
                                            <Line type="monotone" dataKey="count" stroke={GROWTH_COLOR} strokeWidth={2} name="Total Favorites" />
                                            <Line type="monotone" dataKey="gains" stroke="#4c8bd6" strokeWidth={2} name="New Favorites" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Video Views and Top Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Total Views</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={videoViews}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <ChartTooltip />
                                            <Bar dataKey="value" fill={COLORS[0]}>
                                                {videoViews.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Top Actions By Video</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={topActionsVideo}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <ChartTooltip />
                                            <Bar dataKey="value" fill={ACTION_COLORS[0]}>
                                                {topActionsVideo.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={ACTION_COLORS[index % ACTION_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Search Appearances */}
                            {searchAppearances && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <Search className="w-6 h-6 text-gray-700" />
                                        <h3 className="text-2xl font-semibold text-gray-800">Times this video appeared in searches</h3>
                                    </div>
                                    <p className="text-center text-5xl font-bold text-blue-600 mb-6">{formatNumber(searchAppearances.value)}</p>

                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Video Searches Over Time</h4>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={searchAppearances.searchGains}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <ChartTooltip />
                                            <Line type="monotone" dataKey="count" stroke="#0f6fc6" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Frequency Charts for Video */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Popular Week Days</h3>

                                {/* Day Selector Container */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select a day to see popular hours</label>
                                    <div className="flex gap-4 items-center">
                                        <select
                                            value={selectedDayVideo}
                                            onChange={(e) => setSelectedDayVideo(e.target.value)}
                                            className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="All">All Days</option>
                                            {DAY_ORDER.map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setSelectedDayVideo("All")}
                                                className={`px-4 py-2 rounded transition-colors ${selectedDayVideo === "All" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}
                                            >
                                                All
                                            </button>
                                            {DAY_ORDER.map(day => (
                                                <button
                                                    key={day}
                                                    onClick={() => setSelectedDayVideo(day)}
                                                    className={`px-4 py-2 rounded transition-colors ${selectedDayVideo === day ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={sortedFrequencyVideo.map(d => ({ label: d.weekDay, value: d.frequency }))}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" />
                                                <YAxis />
                                                <ChartTooltip />
                                                <Bar dataKey="value" fill={FREQUENCY_COLOR} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-semibold text-gray-700 mb-2 text-center">
                                            Popular Hours {selectedDayVideo !== "All" && `for ${selectedDayVideo}`}
                                        </h4>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={hourlyDataVideo}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" />
                                                <YAxis />
                                                <ChartTooltip />
                                                <Bar dataKey="value" fill={FREQUENCY_COLOR} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
