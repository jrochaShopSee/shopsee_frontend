"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { AnalyticsApi, QuizAnalyticsData, QuizAnalyticsDetailData } from "@/app/services/analyticsApi";
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChevronDown, ChevronUp, BarChart3, ListChecks, Target } from "lucide-react";

const COLORS = ["#7c3aed", "#2563eb", "#059669", "#dc2626", "#f59e0b", "#8b5cf6", "#ec4899", "#10b981"];

export default function QuizAnalyticsPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [analyticsData, setAnalyticsData] = useState<QuizAnalyticsData | null>(null);
    const [filteredDetails, setFilteredDetails] = useState<QuizAnalyticsDetailData[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [selectedVideo, setSelectedVideo] = useState<string>("");
    const [allVideosChecked, setAllVideosChecked] = useState(true);
    const [dateTerm, setDateTerm] = useState("allTime");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.push("/cms/home");
            return;
        }

        loadAnalytics();
    }, [isLoading, user]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const data = await AnalyticsApi.getQuizAnalyticsSummary();
            setAnalyticsData(data);
            setFilteredDetails(data.quizDetails);
        } catch (error) {
            console.error("Failed to load quiz analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateTermChange = (term: string) => {
        setDateTerm(term);

        if (term === "custom") {
            return;
        }

        let end = new Date();
        end.setHours(23, 59, 59, 999);
        let start = new Date();

        switch (term) {
            case "today":
                start.setHours(0, 0, 0, 0);
                break;
            case "yesterday":
                start.setDate(start.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                end.setTime(start.getTime());
                end.setHours(23, 59, 59, 999);
                break;
            case "lastSevenDays":
                start.setDate(start.getDate() - 7);
                break;
            case "lastThirtyDays":
                start.setDate(start.getDate() - 30);
                break;
            case "thisWeek":
                const dayOfWeek = start.getDay();
                start.setDate(start.getDate() - dayOfWeek);
                start.setHours(0, 0, 0, 0);
                break;
            case "thisMonth":
                start = new Date(start.getFullYear(), start.getMonth(), 1);
                break;
            case "lastMonth":
                start = new Date(start.getFullYear(), start.getMonth() - 1, 1);
                end.setTime(new Date(start.getFullYear(), start.getMonth() + 1, 0).getTime());
                end.setHours(23, 59, 59, 999);
                break;
            case "thisYear":
                start = new Date(start.getFullYear(), 0, 1);
                break;
            case "lastYear":
                start = new Date(start.getFullYear() - 1, 0, 1);
                end = new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999);
                break;
            case "allTime":
                setStartDate("");
                setEndDate("");
                handleFilter(undefined, undefined);
                return;
        }

        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);
    };

    const handleFilter = async (start?: string, end?: string) => {
        setLoading(true);
        try {
            const startDateTime = start || (startDate ? new Date(startDate).toISOString() : undefined);
            const endDateTime = end || (endDate ? new Date(endDate + "T23:59:59").toISOString() : new Date().toISOString());

            const details = await AnalyticsApi.filterQuizAnalytics({
                videoId: allVideosChecked ? undefined : (selectedVideo ? parseInt(selectedVideo) : undefined),
                startDate: startDateTime,
                endDate: endDateTime,
            });

            setFilteredDetails(details);
        } catch (error) {
            console.error("Failed to filter quiz analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterClick = () => {
        if (dateTerm === "custom") {
            if (!startDate || !endDate) {
                alert("Please select both start and end dates for custom range");
                return;
            }
            handleFilter(startDate, endDate);
        } else {
            handleDateTermChange(dateTerm);
        }
    };

    const toggleRow = (quizId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(quizId)) {
            newExpanded.delete(quizId);
        } else {
            newExpanded.add(quizId);
        }
        setExpandedRows(newExpanded);
    };

    const convertToPieData = (data: { label: string; value: number }[]) => {
        return data.map((item) => ({
            name: item.label,
            value: item.value,
        }));
    };

    if (isLoading || !analyticsData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6">
            <h4 className="text-2xl font-bold text-gray-800 mb-6">Quiz Analytics</h4>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <ListChecks className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Total Quizzes</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-blue-600">{analyticsData.totalQuizzes}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-600 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Total Answers</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-green-600">{analyticsData.totalAnswers}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600 rounded-lg">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Average Correct Answers</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-purple-600">{analyticsData.correctAnswerAverage.toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Most Answered Quizzes</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analyticsData.mostAnsweredQuiz}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" angle={-45} textAnchor="end" height={100} interval={0} style={{ fontSize: "10px" }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#67001f" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Most Viewed Quizzes</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analyticsData.mostViewedQuiz}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" angle={-45} textAnchor="end" height={100} interval={0} style={{ fontSize: "10px" }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3c97da" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">General Status of Your Quizzes</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={convertToPieData(analyticsData.totalGeneralQuizInfo)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {convertToPieData(analyticsData.totalGeneralQuizInfo).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Choose a video or date to change the reports below</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Video Filter */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <input type="checkbox" id="allVideosCheck" checked={allVideosChecked} onChange={(e) => setAllVideosChecked(e.target.checked)} className="w-4 h-4" />
                            <label htmlFor="allVideosCheck" className="text-sm font-medium text-gray-700 cursor-pointer">
                                All Videos
                            </label>
                        </div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Video</label>
                        <select value={selectedVideo} onChange={(e) => setSelectedVideo(e.target.value)} disabled={allVideosChecked} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                            <option value="">Select Video</option>
                            {analyticsData.videoList.map((video) => (
                                <option key={video.value} value={video.value}>
                                    {video.text}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                        <select value={dateTerm} onChange={(e) => handleDateTermChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4">
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="lastSevenDays">Last 7 Days</option>
                            <option value="lastThirtyDays">Last 30 Days</option>
                            <option value="thisWeek">This Week</option>
                            <option value="thisMonth">This Month</option>
                            <option value="lastMonth">Last Month</option>
                            <option value="thisYear">This Year</option>
                            <option value="lastYear">Last Year</option>
                            <option value="allTime">All Time</option>
                            <option value="custom">Custom Range</option>
                        </select>

                        {dateTerm === "custom" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-4">
                    <button onClick={handleFilterClick} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {loading ? "Filtering..." : "Filter"}
                    </button>
                </div>
            </div>

            {/* Quiz Details Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users Completed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average time to answer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDetails.map((quiz) => (
                                <>
                                    <tr key={quiz.quizDetailId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => toggleRow(quiz.quizDetailId)} className="text-gray-600 hover:text-gray-900">
                                                {expandedRows.has(quiz.quizDetailId) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quiz.quizName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center gap-4">
                                                <span>
                                                    {quiz.usersCompleted}/{quiz.usersViewed}
                                                </span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-4 max-w-xs">
                                                    <div className="bg-blue-500 h-4 rounded-full flex items-center justify-center text-xs text-white" style={{ width: `${quiz.completionPercentage}%` }}>
                                                        {quiz.completionPercentage.toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quiz.averageTimeInSeconds}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quiz.averageScore}%</td>
                                    </tr>
                                    {expandedRows.has(quiz.quizDetailId) && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="flex flex-col items-center">
                                                        <h4 className="text-md font-semibold text-gray-800 mb-4">Quiz status</h4>
                                                        <ResponsiveContainer width="100%" height={200}>
                                                            <PieChart>
                                                                <Pie data={convertToPieData(quiz.generalQuizInfo)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                                                    {convertToPieData(quiz.generalQuizInfo).map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <h4 className="text-md font-semibold text-gray-800 mb-4">User top answers</h4>
                                                        <ResponsiveContainer width="100%" height={200}>
                                                            <PieChart>
                                                                <Pie data={convertToPieData(quiz.topAnswers)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                                                    {convertToPieData(quiz.topAnswers).map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
