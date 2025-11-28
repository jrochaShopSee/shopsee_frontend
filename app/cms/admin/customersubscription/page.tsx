"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { customerSubscriptionApi } from "@/app/services/customerSubscriptionApi";
import { CustomerSubscription } from "@/app/types/CustomerSubscription";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { Search, Users, DollarSign, RotateCcw } from "lucide-react";

const CustomerSubscriptionListPage: React.FC = () => {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    // const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statistics, setStatistics] = useState({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
    });
    const [statisticsLoading, setStatisticsLoading] = useState(true);
    const [statisticsError, setStatisticsError] = useState<string | null>(null);

    // Memoize filters
    // const currentFilters = useMemo(() => ({ search: searchTerm }), [searchTerm]);

    // Load statistics (fetch all for accurate stats)
    const loadStatistics = useCallback(async () => {
        setStatisticsLoading(true);
        setStatisticsError(null);
        try {
            // Fetch all subscriptions (up to 10,000 for stats)
            const res = await customerSubscriptionApi.getAll({ skip: 0, take: 10000, search: searchTerm });
            setStatistics({
                totalSubscriptions: res.totalCount,
                activeSubscriptions: res.data.filter((s) => s.active).length,
                totalRevenue: res.data.reduce((sum, s) => sum + (s.recurringCost || 0), 0),
            });
        } catch (err) {
            setStatisticsError(err instanceof Error ? err.message : "Failed to load statistics");
        } finally {
            setStatisticsLoading(false);
        }
    }, [searchTerm]);

    // Load subscriptions (infinite scroll)
    const loadSubscriptions = useCallback(
        async (reset = false) => {
            if (!hasMore && !reset) return;
            setError(null);
            if (reset) setLoading(true);
            const skip = reset ? 0 : subscriptions.length;
            try {
                const res = await customerSubscriptionApi.getAll({ skip, take: 50, search: searchTerm });
                if (reset) {
                    setSubscriptions(res.data);
                } else {
                    setSubscriptions((prev) => [...prev, ...res.data]);
                }
                setHasMore(res.hasMore);
                // setTotalCount(res.totalCount);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load subscriptions");
            } finally {
                setLoading(false);
            }
        },
        [hasMore, subscriptions.length, searchTerm]
    );

    // Initial load
    useEffect(() => {
        setSubscriptions([]);
        setHasMore(true);
        setLoading(true);
        loadSubscriptions(true);
        loadStatistics();
    }, [searchTerm]);

    const handleStatusChange = async (id: number, enable: boolean) => {
        setUpdatingId(id);
        try {
            await customerSubscriptionApi.updateStatus(id, enable);
            toast.success(`Subscription ${enable ? "enabled" : "disabled"}`);
            await loadSubscriptions(true);
            await loadStatistics();
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
    };

    // UI
    if (loading && subscriptions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 max-w-7xl mx-auto text-red-600">{error}</div>;
    }

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
    };

    // Helper to display payment method
    const getPaymentMethodDisplay = (paymentMethod: string) => {
        if (!paymentMethod || paymentMethod.includes("Castle.Proxies")) return "Unknown";
        return paymentMethod;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Users className="w-8 h-8 mr-3 text-purple-500" />
                            Customer Subscriptions
                        </h1>
                        <p className="text-gray-600 mt-2">Manage customer subscriptions and billing</p>
                    </div>
                </div>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Total Subscriptions</p>
                                {statisticsLoading ? <div className="w-16 h-6 bg-purple-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-xl font-bold text-red-200">Error</p> : <p className="text-2xl font-bold">{statistics.totalSubscriptions.toLocaleString()}</p>}
                            </div>
                            <Users className="w-8 h-8 text-purple-200" />
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Active</p>
                                {statisticsLoading ? <div className="w-16 h-6 bg-green-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-xl font-bold text-red-200">Error</p> : <p className="text-2xl font-bold">{statistics.activeSubscriptions.toLocaleString()}</p>}
                            </div>
                            <DollarSign className="w-8 h-8 text-green-200" />
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Revenue</p>
                                {statisticsLoading ? <div className="w-20 h-6 bg-blue-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-xl font-bold text-red-200">Error</p> : <p className="text-2xl font-bold">{formatCurrency(statistics.totalRevenue)}</p>}
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-200" />
                        </div>
                    </Card>
                </div>
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input placeholder="Search subscriptions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                        <div>
                            <Button onClick={resetFilters} variant="outline" className="w-full flex items-center justify-center space-x-2">
                                <RotateCcw className="w-4 h-4" />
                                <span>Reset</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="text-red-600 text-sm">{error}</div>
                        <Button onClick={() => loadSubscriptions(true)} variant="outline" size="sm" className="ml-auto">
                            Retry
                        </Button>
                    </div>
                </div>
            )}
            {/* Subscriptions List */}
            <InfiniteScrollList
                data={subscriptions}
                loading={loading}
                hasMore={hasMore}
                endReached={() => {
                    if (!loading && hasMore) {
                        loadSubscriptions(false);
                    }
                }}
                itemContent={(index, sub) => (
                    <div className="flex flex-col md:flex-row items-center gap-4 p-4 cursor-pointer" onClick={() => router.push(`/cms/admin/customersubscription/${sub.id}`)}>
                        <div className="flex-1 w-full md:w-auto">
                            <div className="font-semibold text-gray-900 text-base md:text-lg">{sub.companyName}</div>
                            <div className="text-xs text-gray-500">{sub.subscriptionName}</div>
                        </div>
                        <div className="flex flex-col items-center w-32">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${sub.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>{sub.activeDisplay}</span>
                            <div className="text-xs text-gray-400 mt-1">{getPaymentMethodDisplay(sub.paymentMethod)}</div>
                        </div>
                        <div className="w-32 text-center text-xs">
                            <span className="block font-medium text-gray-900">{sub.orderDate ? new Date(sub.orderDate).toLocaleDateString() : "-"}</span>
                            <span className="text-gray-400">Sign-up</span>
                        </div>
                        <div className="w-32 text-center text-xs">
                            <span className="block font-medium text-gray-900">{sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : "-"}</span>
                            <span className="text-gray-400">Renewal</span>
                        </div>
                        <div className="w-32 text-center text-xs">
                            <span className="block font-medium text-green-700">{formatCurrency(sub.recurringCost)}</span>
                            <span className="text-gray-400">Recurring</span>
                        </div>
                        <div className="flex gap-2 ml-4">
                            {sub.active ? (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(sub.id, false);
                                    }}
                                    disabled={updatingId === sub.id}
                                >
                                    {updatingId === sub.id ? (
                                        <span className="flex items-center">
                                            <LoadingSpinner />
                                            &nbsp;Disabling...
                                        </span>
                                    ) : (
                                        "Disable"
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(sub.id, true);
                                    }}
                                    disabled={updatingId === sub.id}
                                >
                                    {updatingId === sub.id ? (
                                        <span className="flex items-center">
                                            <LoadingSpinner />
                                            &nbsp;Enabling...
                                        </span>
                                    ) : (
                                        "Enable"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
                emptyIcon={<Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
                emptyTitle="No subscriptions found"
                emptyMessage={searchTerm ? "Try adjusting your search criteria" : "Subscriptions will appear here once customers subscribe"}
                onResetFilters={resetFilters}
                showEmptyReset={!!searchTerm}
                height={600}
                footerLoading={<LoadingSpinner />}
                footerEnd={<span>All subscriptions loaded ({subscriptions.length} total)</span>}
            />
        </div>
    );
};

export default CustomerSubscriptionListPage;
