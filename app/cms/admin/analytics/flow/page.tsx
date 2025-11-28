"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { AnalyticsApi, FlowAnalyticsActionVariation, FlowAnalyticsUser } from "@/app/services/analyticsApi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Users, ArrowRight, ArrowLeft } from "lucide-react";

export default function FlowAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [loadingActions, setLoadingActions] = useState(false);
    const [loadingFlowData, setLoadingFlowData] = useState(false);
    const [screens, setScreens] = useState<Array<{ text: string; value: string }>>([]);
    const [topActions, setTopActions] = useState<Array<Record<string, number>>>([]);
    const [selectedScreen, setSelectedScreen] = useState("");
    const [actions, setActions] = useState<string[]>([]);
    const [selectedAction, setSelectedAction] = useState("");
    const [users, setUsers] = useState<FlowAnalyticsUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");

    // Date filters for top actions
    const [topActionsDateTerm, setTopActionsDateTerm] = useState("allTime");
    const [topActionsStartDate, setTopActionsStartDate] = useState("");
    const [topActionsEndDate, setTopActionsEndDate] = useState("");

    // Date filters for action flow
    const [actionFlowDateTerm, setActionFlowDateTerm] = useState("allTime");
    const [actionFlowStartDate, setActionFlowStartDate] = useState("");
    const [actionFlowEndDate, setActionFlowEndDate] = useState("");

    // Flow data
    const [actionsCount, setActionsCount] = useState(0);
    const [usersCount, setUsersCount] = useState(0);
    const [lastActionsCount, setLastActionsCount] = useState(0);
    const [nextActionsCount, setNextActionsCount] = useState(0);
    const [variations, setVariations] = useState<FlowAnalyticsActionVariation[]>([]);
    const [variationsIndex, setVariationsIndex] = useState(0);
    const [hasMoreVariations, setHasMoreVariations] = useState(false);
    const [lastActions, setLastActions] = useState<Record<string, number>>({});
    const [nextActions, setNextActions] = useState<Record<string, number>>({});

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [allVariations, setAllVariations] = useState<FlowAnalyticsActionVariation[]>([]);
    const [selectedVariation, setSelectedVariation] = useState("");
    const [flowPage, setFlowPage] = useState(0);
    const [flowVisualization, setFlowVisualization] = useState<{
        lastActionVariations: FlowAnalyticsActionVariation[];
        nextActionVariations: FlowAnalyticsActionVariation[];
        currentActionAndVariation: FlowAnalyticsActionVariation | null;
        hasMore: boolean;
        total: number;
    }>({
        lastActionVariations: [],
        nextActionVariations: [],
        currentActionAndVariation: null,
        hasMore: false,
        total: 0
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const data = await AnalyticsApi.getFlowAnalyticsSummary();
            setScreens(data.screensList);
            setTopActions(data.topActions);
        } catch (error) {
            console.error("Failed to load flow analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScreenChange = async (screen: string) => {
        setSelectedScreen(screen);
        setSelectedAction("");
        setActions([]);
        setUsers([]);
        setVariationsIndex(0);
        resetFlowData();

        if (!screen) {
            setLoadingActions(false);
            return;
        }

        try {
            setLoadingActions(true);
            const data = await AnalyticsApi.getActionsAndUsersFromScreen(screen === "" ? "all" : screen);
            setActions(data.actionList);
            setUsers(data.userList);
        } catch (error) {
            console.error("Failed to load actions and users:", error);
        } finally {
            setLoadingActions(false);
        }
    };

    const handleActionChange = async (action: string) => {
        setSelectedAction(action);
        if (!action) {
            resetFlowData();
            setLoadingFlowData(false);
            return;
        }
        await updateFlowData(action, selectedUser);
    };

    const handleUserChange = async (userName: string) => {
        setSelectedUser(userName);
        if (selectedAction) {
            await updateFlowData(selectedAction, userName);
        }
    };

    const updateFlowData = async (action: string, userName: string) => {
        if (!selectedScreen || !action) return;

        const user = users.find(u => u.name === userName);
        const userId = user ? user.id : undefined;

        const startDate = actionFlowDateTerm === "allTime" ? undefined : actionFlowStartDate;
        const endDate = actionFlowDateTerm === "allTime" ? undefined : actionFlowEndDate;

        try {
            setLoadingFlowData(true);
            const data = await AnalyticsApi.getFlowDataFromActionAndUser({
                screen: selectedScreen,
                action: action.split("-")[0].trim(),
                userId,
                startDate,
                endDate
            });

            setActionsCount(data.actionsCount);
            setUsersCount(data.usersCount);
            setLastActionsCount(data.lastActionsCount);
            setNextActionsCount(data.nextActionsCount);
            setVariations(data.variations);
            setVariationsIndex(data.variationsIndex);
            setHasMoreVariations(data.hasMoreVariations);
            setLastActions(data.lastActions);
            setNextActions(data.nextActions);
        } catch (error) {
            console.error("Failed to update flow data:", error);
        } finally {
            setLoadingFlowData(false);
        }
    };

    const updateVariations = async (skip: number) => {
        if (!selectedScreen || !selectedAction) return;

        const user = users.find(u => u.name === selectedUser);
        const userId = user ? user.id : undefined;

        const startDate = actionFlowDateTerm === "allTime" ? undefined : actionFlowStartDate;
        const endDate = actionFlowDateTerm === "allTime" ? undefined : actionFlowEndDate;

        try {
            const data = await AnalyticsApi.getActionVariations({
                screen: selectedScreen,
                action: selectedAction.split("-")[0].trim(),
                userId,
                startDate,
                endDate,
                skipVariations: skip * 10,
                take: 10
            });

            setVariations(data.variations);
            setVariationsIndex(skip);
            setHasMoreVariations(data.hasMoreVariations);
        } catch (error) {
            console.error("Failed to update variations:", error);
        }
    };

    const loadAllVariations = async () => {
        if (!selectedScreen || !selectedAction) return;

        const user = users.find(u => u.name === selectedUser);
        const userId = user ? user.id : undefined;

        const startDate = actionFlowDateTerm === "allTime" ? undefined : actionFlowStartDate;
        const endDate = actionFlowDateTerm === "allTime" ? undefined : actionFlowEndDate;

        try {
            const data = await AnalyticsApi.getActionVariations({
                screen: selectedScreen,
                action: selectedAction.split("-")[0].trim(),
                userId,
                startDate,
                endDate,
                skipVariations: 0,
                take: 150
            });

            setAllVariations(data.variations);
        } catch (error) {
            console.error("Failed to load all variations:", error);
        }
    };

    const loadFlowVisualization = async (variation: string, page: number) => {
        if (!variation || !selectedScreen || !selectedAction) return;

        const user = users.find(u => u.name === selectedUser);
        const userId = user ? user.id : undefined;

        const startDate = actionFlowDateTerm === "allTime" ? undefined : actionFlowStartDate;
        const endDate = actionFlowDateTerm === "allTime" ? undefined : actionFlowEndDate;

        try {
            const data = await AnalyticsApi.getFlow({
                screen: selectedScreen,
                action: selectedAction.split("-")[0].trim(),
                userId,
                variation,
                startDate,
                endDate,
                page
            });

            setFlowVisualization(data);
            setFlowPage(page);
        } catch (error) {
            console.error("Failed to load flow visualization:", error);
        }
    };

    const handleVariationDetailsClick = async () => {
        await loadAllVariations();
        setShowModal(true);
        setFlowPage(0);
        setSelectedVariation("");
        setFlowVisualization({
            lastActionVariations: [],
            nextActionVariations: [],
            currentActionAndVariation: null,
            hasMore: false,
            total: 0
        });
    };

    const handleVariationSelect = async (variation: string) => {
        setSelectedVariation(variation);
        setFlowPage(0);
        await loadFlowVisualization(variation, 0);
    };

    const handleTopActionsDateTermChange = (term: string) => {
        setTopActionsDateTerm(term);

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
            case "lastSevenDays":
                start.setDate(start.getDate() - 7);
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
                setTopActionsStartDate("");
                setTopActionsEndDate("");
                updateTopActions(undefined, undefined);
                return;
        }

        const startDateStr = start.toISOString().split("T")[0];
        const endDateStr = end.toISOString().split("T")[0];
        setTopActionsStartDate(startDateStr);
        setTopActionsEndDate(endDateStr);
        updateTopActions(startDateStr, endDateStr);
    };

    const handleActionFlowDateTermChange = (term: string) => {
        setActionFlowDateTerm(term);

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
            case "lastSevenDays":
                start.setDate(start.getDate() - 7);
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
                setActionFlowStartDate("");
                setActionFlowEndDate("");
                if (selectedAction) {
                    updateFlowData(selectedAction, selectedUser);
                }
                return;
        }

        const startDateStr = start.toISOString().split("T")[0];
        const endDateStr = end.toISOString().split("T")[0];
        setActionFlowStartDate(startDateStr);
        setActionFlowEndDate(endDateStr);
        if (selectedAction) {
            updateFlowData(selectedAction, selectedUser);
        }
    };

    const updateTopActions = async (startDate?: string, endDate?: string) => {
        try {
            const data = await AnalyticsApi.getTopActionsFlow({
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            setTopActions(data);
        } catch (error) {
            console.error("Failed to update top actions:", error);
        }
    };

    const resetFlowData = () => {
        setActionsCount(0);
        setUsersCount(0);
        setLastActionsCount(0);
        setNextActionsCount(0);
        setVariations([]);
        setLastActions({});
        setNextActions({});
        setVariationsIndex(0);
        setHasMoreVariations(false);
    };

    const convertToBarChartData = (data: Record<string, number>) => {
        return Object.entries(data).map(([key, value]) => ({
            name: key,
            value
        }));
    };

    const convertTopActionsToBarChartData = (data: Array<Record<string, number>>) => {
        return data.map(item => {
            const [key, value] = Object.entries(item)[0];
            return { name: key, value };
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Flow Analytics</h1>

            {/* Top 10 Actions Chart */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Top 10 Actions</h3>
                    <div className="flex items-center gap-4">
                        <select
                            value={topActionsDateTerm}
                            onChange={(e) => handleTopActionsDateTermChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="allTime">All Time</option>
                            <option value="today">Today</option>
                            <option value="lastSevenDays">Last 7 Days</option>
                            <option value="thisMonth">This Month</option>
                            <option value="lastMonth">Last Month</option>
                            <option value="thisYear">This Year</option>
                            <option value="lastYear">Last Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        {topActionsDateTerm === "custom" && (
                            <>
                                <input
                                    type="date"
                                    value={topActionsStartDate}
                                    onChange={(e) => {
                                        setTopActionsStartDate(e.target.value);
                                        if (topActionsEndDate) {
                                            updateTopActions(e.target.value, topActionsEndDate);
                                        }
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Start Date"
                                />
                                <input
                                    type="date"
                                    value={topActionsEndDate}
                                    onChange={(e) => {
                                        setTopActionsEndDate(e.target.value);
                                        if (topActionsStartDate) {
                                            updateTopActions(topActionsStartDate, e.target.value);
                                        }
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="End Date"
                                />
                            </>
                        )}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={convertTopActionsToBarChartData(topActions)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#ef8a62" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Screen and Action Selection */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="screen" className="block text-sm font-medium text-gray-700 mb-2">
                            Select a Screen
                        </label>
                        <select
                            id="screen"
                            value={selectedScreen}
                            onChange={(e) => handleScreenChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            disabled={loadingActions}
                        >
                            <option value="">Select Screen</option>
                            {screens.map((screen) => (
                                <option key={screen.value} value={screen.value}>
                                    {screen.text}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loadingActions && (
                        <div className="col-span-2 flex items-center justify-center">
                            <LoadingSpinner />
                            <span className="ml-2 text-sm text-gray-600">Loading actions and users...</span>
                        </div>
                    )}

                    {!loadingActions && actions.length > 0 && (
                        <div>
                            <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
                                Select an Action
                            </label>
                            <select
                                id="action"
                                value={selectedAction}
                                onChange={(e) => handleActionChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Select Action</option>
                                {actions.map((action) => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!loadingActions && users.length > 0 && (
                        <div>
                            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by User
                            </label>
                            <input
                                id="user"
                                type="text"
                                list="userList"
                                value={selectedUser}
                                onChange={(e) => handleUserChange(e.target.value)}
                                placeholder="Enter a username"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <datalist id="userList">
                                <option value="All" />
                                {users.map((user) => (
                                    <option key={user.id} value={user.name} />
                                ))}
                            </datalist>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Flow Date Filter */}
            {selectedAction && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Action Flow Date Filter</h3>
                        <div className="flex items-center gap-4">
                            <select
                                value={actionFlowDateTerm}
                                onChange={(e) => handleActionFlowDateTermChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="allTime">All Time</option>
                                <option value="today">Today</option>
                                <option value="lastSevenDays">Last 7 Days</option>
                                <option value="thisMonth">This Month</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="thisYear">This Year</option>
                                <option value="lastYear">Last Year</option>
                                <option value="custom">Custom Range</option>
                            </select>
                            {actionFlowDateTerm === "custom" && (
                                <>
                                    <input
                                        type="date"
                                        value={actionFlowStartDate}
                                        onChange={(e) => {
                                            setActionFlowStartDate(e.target.value);
                                            if (actionFlowEndDate && selectedAction) {
                                                updateFlowData(selectedAction, selectedUser);
                                            }
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="Start Date"
                                    />
                                    <input
                                        type="date"
                                        value={actionFlowEndDate}
                                        onChange={(e) => {
                                            setActionFlowEndDate(e.target.value);
                                            if (actionFlowStartDate && selectedAction) {
                                                updateFlowData(selectedAction, selectedUser);
                                            }
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="End Date"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State for Flow Data */}
            {loadingFlowData && selectedAction && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 mb-6">
                    <div className="flex flex-col items-center justify-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600 text-center">Loading flow analytics data...</p>
                        <p className="mt-2 text-sm text-gray-500 text-center">This may take a few moments</p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            {!loadingFlowData && selectedAction && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Actions Count</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-blue-600">{actionsCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Users Count</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-blue-600">{usersCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <ArrowLeft className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Last Actions Count</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-blue-600">{lastActionsCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <ArrowRight className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Next Actions Count</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-blue-600">{nextActionsCount}</p>
                    </div>
                </div>
            </div>
            )}

            {/* Current Action Variations Chart */}
            {!loadingFlowData && variations.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Current Action Variations</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={variations.map(v => ({ name: v.displayData, value: v.count }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#6076b4" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Variation Navigation Buttons */}
            {!loadingFlowData && variations.length > 0 && (
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                        {variationsIndex > 0 && (
                            <>
                                <button
                                    onClick={() => updateVariations(0)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => updateVariations(variationsIndex - 1)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Back
                                </button>
                            </>
                        )}
                    </div>
                    <button
                        onClick={handleVariationDetailsClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Variation Details
                    </button>
                    <div className="flex gap-2">
                        {hasMoreVariations && (
                            <button
                                onClick={() => updateVariations(variationsIndex + 1)}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Last and Next Actions Charts */}
            {!loadingFlowData && selectedAction && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Last Actions</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={convertToBarChartData(lastActions)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#ca0020" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Next Actions</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={convertToBarChartData(nextActions)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#ef8a62" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Variation Details Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">Variation Details</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-600 hover:text-gray-900 text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-6">
                            <h5 className="text-lg font-semibold text-gray-800">Screen: {selectedScreen}</h5>
                            <h5 className="text-lg font-semibold text-gray-800 mb-4">
                                Action: {selectedAction.split("-")[0].trim()}
                            </h5>
                            <hr className="mb-4" />

                            <div className="mb-4">
                                <label htmlFor="variation" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                    Select an Action Variation
                                </label>
                                <select
                                    id="variation"
                                    value={selectedVariation}
                                    onChange={(e) => handleVariationSelect(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Select Action Variation</option>
                                    {allVariations.map((v, idx) => (
                                        <option key={idx} value={v.originalData}>
                                            {v.displayData}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {flowVisualization.currentActionAndVariation && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h5 className="text-center font-semibold mb-2">Current Action - Variation</h5>
                                    <p><strong>Screen:</strong> {flowVisualization.currentActionAndVariation.screen}</p>
                                    <p><strong>Action:</strong> {flowVisualization.currentActionAndVariation.action}</p>
                                    <p><strong>Variation:</strong> {flowVisualization.currentActionAndVariation.displayData}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                {flowVisualization.lastActionVariations.length > 0 && (
                                    <div>
                                        <h5 className="font-semibold mb-2">Last 10 Actions:</h5>
                                        {flowVisualization.lastActionVariations.map((v, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-lg p-3 mb-2">
                                                <p><strong>Screen:</strong> {v.screen}</p>
                                                <p><strong>Action:</strong> {v.action}</p>
                                                <p><strong>Variation:</strong> {v.displayData}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {flowVisualization.nextActionVariations.length > 0 && (
                                    <div>
                                        <h5 className="font-semibold mb-2">Next 10 Actions:</h5>
                                        {flowVisualization.nextActionVariations.map((v, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-lg p-3 mb-2">
                                                <p><strong>Screen:</strong> {v.screen}</p>
                                                <p><strong>Action:</strong> {v.action}</p>
                                                <p><strong>Variation:</strong> {v.displayData}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                            <div className="flex gap-2">
                                {flowPage > 0 && (
                                    <>
                                        <button
                                            onClick={() => loadFlowVisualization(selectedVariation, 0)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        >
                                            First
                                        </button>
                                        <button
                                            onClick={() => loadFlowVisualization(selectedVariation, flowPage - 1)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Back
                                        </button>
                                    </>
                                )}
                            </div>
                            {flowVisualization.total > 0 && (
                                <p className="font-semibold">
                                    {flowPage + 1}/{flowVisualization.total}
                                </p>
                            )}
                            <div>
                                {flowVisualization.hasMore && (
                                    <button
                                        onClick={() => loadFlowVisualization(selectedVariation, flowPage + 1)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Next Flow
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
