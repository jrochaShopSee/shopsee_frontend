"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { AlertTriangle, Search, Calendar, X, Info } from "lucide-react";
import { settingsApi } from "@/app/services/settingsApi";
import { SystemError, SystemErrorDetail } from "@/app/types/Role";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";

interface SystemErrorQueryParams {
    skip: number;
    take: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    statusCode?: number;
}

export default function SystemErrorsPage() {
    const [errors, setErrors] = useState<SystemError[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusCode, setStatusCode] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Detail modal state
    const [selectedError, setSelectedError] = useState<SystemError | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [errorDetail, setErrorDetail] = useState<SystemErrorDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const loadErrors = useCallback(
        async (reset = false) => {
            try {
                setIsLoading(true);
                const currentSkip = reset ? 0 : skip;

                const params: SystemErrorQueryParams = {
                    skip: currentSkip,
                    take: 50,
                };

                if (searchTerm) params.search = searchTerm;
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if (statusCode) params.statusCode = parseInt(statusCode);

                const response = await settingsApi.getSystemErrors(params);

                if (reset) {
                    setErrors(response.data);
                    setSkip(response.data.length);
                } else {
                    setErrors((prev) => [...prev, ...response.data]);
                    setSkip((prev) => prev + response.data.length);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error(err.response?.data?.message || "Failed to load system errors");
            } finally {
                setIsLoading(false);
            }
        },
        [skip, searchTerm, startDate, endDate, statusCode]
    );

    // Reset and load when filters change
    useEffect(() => {
        setSkip(0);
        setErrors([]);
        loadErrors(true);
    }, [searchTerm, startDate, endDate, statusCode]);

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
        setStatusCode("");
        setSearchTerm("");
    };

    const handleViewDetails = async (error: SystemError) => {
        setSelectedError(error);
        setShowDetailModal(true);
        setLoadingDetail(true);

        try {
            const detail = await settingsApi.getSystemErrorById(error.errorId);
            setErrorDetail(detail);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to load error details");
        } finally {
            setLoadingDetail(false);
        }
    };

    const getStatusCodeColor = (code: number) => {
        if (code >= 500) return "bg-red-100 text-red-800";
        if (code >= 400) return "bg-orange-100 text-orange-800";
        if (code >= 300) return "bg-blue-100 text-blue-800";
        return "bg-green-100 text-green-800";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">System Errors</h1>
                                <p className="text-sm text-gray-600">
                                    View and analyze system errors with advanced filtering
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="space-y-4">
                            {/* Search and Filter Toggle */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search errors (message, type, source)..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                    {showFilters ? "Hide Filters" : "Show Filters"}
                                </button>
                            </div>

                            {/* Expanded Filters */}
                            {showFilters && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status Code
                                            </label>
                                            <input
                                                type="number"
                                                value={statusCode}
                                                onChange={(e) => setStatusCode(e.target.value)}
                                                placeholder="e.g., 500"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={handleClearFilters}
                                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Active Filters Summary */}
                            {(startDate || endDate || statusCode || searchTerm) && (
                                <div className="flex flex-wrap gap-2">
                                    {searchTerm && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            Search: {searchTerm}
                                            <X
                                                className="w-3 h-3 cursor-pointer"
                                                onClick={() => setSearchTerm("")}
                                            />
                                        </span>
                                    )}
                                    {startDate && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                            From: {startDate}
                                            <X
                                                className="w-3 h-3 cursor-pointer"
                                                onClick={() => setStartDate("")}
                                            />
                                        </span>
                                    )}
                                    {endDate && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                            To: {endDate}
                                            <X
                                                className="w-3 h-3 cursor-pointer"
                                                onClick={() => setEndDate("")}
                                            />
                                        </span>
                                    )}
                                    {statusCode && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                            Status: {statusCode}
                                            <X
                                                className="w-3 h-3 cursor-pointer"
                                                onClick={() => setStatusCode("")}
                                            />
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Errors List */}
                    <div className="p-6">
                        <div className="mb-4 text-sm text-gray-600">
                            Showing {errors.length} of {totalCount} errors
                        </div>

                        <InfiniteScrollList
                            data={errors}
                            loading={isLoading}
                            hasMore={hasMore}
                            endReached={() => loadErrors(false)}
                            itemContent={(_, error) => (
                                <div
                                    className="flex items-start justify-between px-6 py-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                                    onClick={() => handleViewDetails(error)}
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                    {error.message}
                                                </p>
                                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                                    <span>Type: {error.type}</span>
                                                    <span>•</span>
                                                    <span>Source: {error.source}</span>
                                                    {error.user && (
                                                        <>
                                                            <span>•</span>
                                                            <span>User: {error.user}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusCodeColor(
                                                error.statusCode
                                            )}`}
                                        >
                                            {error.statusCode}
                                        </span>
                                        <span className="text-xs text-gray-500">{formatDate(error.timeUtc)}</span>
                                    </div>
                                </div>
                            )}
                            emptyTitle="No system errors found"
                            emptyMessage="There are no errors matching your criteria"
                            height={600}
                            footerEnd={`All errors loaded (${totalCount} total)`}
                        />
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Error Details</h2>
                                        {selectedError && (
                                            <p className="text-sm text-gray-600">{formatDate(selectedError.timeUtc)}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setErrorDetail(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingDetail ? (
                                <div className="flex items-center justify-center py-12">
                                    <LoadingSpinner />
                                </div>
                            ) : errorDetail && typeof errorDetail === 'object' && 'statusCode' in errorDetail ? (
                                <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status Code
                                            </label>
                                            <span
                                                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusCodeColor(
                                                    errorDetail.statusCode
                                                )}`}
                                            >
                                                {errorDetail.statusCode}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Application
                                            </label>
                                            <p className="text-sm text-gray-900">{errorDetail.application}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                                            <p className="text-sm text-gray-900">{errorDetail.host}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                                            <p className="text-sm text-gray-900">{errorDetail.user || "N/A"}</p>
                                        </div>
                                    </div>

                                    {/* Error Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Error Type
                                        </label>
                                        <p className="text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded">
                                            {errorDetail.type}
                                        </p>
                                    </div>

                                    {/* Source */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                                        <p className="text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded">
                                            {errorDetail.source}
                                        </p>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                        <p className="text-sm text-gray-900 bg-red-50 p-3 rounded border border-red-200">
                                            {errorDetail.message}
                                        </p>
                                    </div>

                                    {/* Stack Trace */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Details (XML)
                                        </label>
                                        <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-x-auto max-h-96">
                                            <pre className="whitespace-pre-wrap">{errorDetail.allXml}</pre>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Info className="w-12 h-12 mx-auto mb-3" />
                                    <p>No details available</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setErrorDetail(null);
                                }}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
