"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { ecommerceApi } from "@/app/services/ecommerceApi";
import { EcommerceOrder, OrderStatistics } from "@/app/types/ecommerce";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { Search, Download, ShoppingCart, Package, DollarSign, Calendar, RotateCcw } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Card } from "@/app/components/ui/Card";
import { Select } from "@/app/components/ui/Select";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { OrderItem } from "./OrderItem";
import type { OrderStatus } from "@/app/types/ecommerce";

const OrdersPage: React.FC = () => {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    // Data state
    const [orders, setOrders] = useState<EcommerceOrder[]>([]);
    const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
    const [statistics, setStatistics] = useState<OrderStatistics>({
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        formattedTotalRevenue: "$0.00",
        formattedAverageOrderValue: "$0.00",
    });

    // Loading states
    const [loading, setLoading] = useState(true);
    const [statisticsLoading, setStatisticsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Error states
    const [error, setError] = useState<string | null>(null);
    const [statisticsError, setStatisticsError] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortBy, setSortBy] = useState("orderDate");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // Ref to track if initial load has happened
    const initialLoadDone = useRef(false);
    const lastFiltersRef = useRef<string>("");

    // Memoize current filters for comparison
    const currentFilters = useMemo(
        () => ({
            search: searchTerm,
            status: statusFilter,
            dateFrom,
            dateTo,
        }),
        [searchTerm, statusFilter, dateFrom, dateTo]
    );

    // Create a stable string representation of filters for comparison
    const filtersKey = useMemo(() => JSON.stringify({ searchTerm, statusFilter, dateFrom, dateTo, sortBy, sortDirection }), [searchTerm, statusFilter, dateFrom, dateTo, sortBy, sortDirection]);

    // Load statistics function - stable reference
    const loadStatistics = useCallback(async () => {
        if (!user) return;

        try {
            setStatisticsError(null);
            setStatisticsLoading(true);
            const stats = await ecommerceApi.getOrderStatistics(currentFilters);
            setStatistics(stats);
        } catch (err) {
            setStatisticsError(err instanceof Error ? err.message : "Failed to load statistics");
            console.error("Error loading statistics:", err);
        } finally {
            setStatisticsLoading(false);
        }
    }, [user, currentFilters]);

    // Load orders function - stable reference
    const loadOrders = useCallback(
        async (reset = false) => {
            if (!user || (!hasMore && !reset)) return;

            try {
                setError(null);
                if (reset) {
                    setLoading(true);
                }

                const skip = reset ? 0 : orders.length;

                const response = await ecommerceApi.getOrders({
                    skip,
                    take: 50,
                    search: searchTerm,
                    status: statusFilter,
                    dateFrom,
                    dateTo,
                    sortBy,
                    sortDirection,
                });

                if (reset) {
                    setOrders(response.data);
                    setHasMore(response.hasMore);
                } else {
                    setOrders((prev) => [...prev, ...response.data]);
                    setHasMore(response.hasMore);
                }
                setTotalCount(response.totalCount);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load orders");
                console.error("Error loading orders:", err);
            } finally {
                setLoading(false);
            }
        },
        [user, hasMore, orders.length, searchTerm, statusFilter, dateFrom, dateTo, sortBy, sortDirection]
    );

    // Load order statuses - only once
    useEffect(() => {
        const loadStatuses = async () => {
            try {
                const statuses = await ecommerceApi.getOrderStatuses();
                setOrderStatuses(statuses);
            } catch (err) {
                console.error("Error loading order statuses:", err);
            }
        };

        loadStatuses();
    }, []); // Empty dependency array - only load once

    // Initial data load - only when auth is ready and user is available
    useEffect(() => {
        const performInitialLoad = async () => {
            if (authLoading || !user || initialLoadDone.current) return;

            initialLoadDone.current = true;

            try {
                // Load orders and statistics in parallel for initial load
                await Promise.all([loadOrders(true), loadStatistics()]);
            } catch (error) {
                console.error("Initial load failed:", error);
            }
        };

        performInitialLoad();
    }, [authLoading, user]); // Only depend on auth state

    // Handle filter changes with debouncing
    useEffect(() => {
        if (!user || !initialLoadDone.current) return;

        // Check if filters actually changed
        if (filtersKey === lastFiltersRef.current) return;
        lastFiltersRef.current = filtersKey;

        const timeoutId = setTimeout(async () => {
            try {
                // Reset pagination state
                setOrders([]);
                setHasMore(true);

                // Load fresh data with new filters
                await Promise.all([loadOrders(true), loadStatistics()]);
            } catch (error) {
                console.error("Filter change load failed:", error);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filtersKey, user]); // Only depend on the filters key and user

    // Event handlers
    const handleOrderClick = useCallback(
        (order: EcommerceOrder) => {
            const url = order.isShopifyOrder
                ? `/cms/ecommerce/orders/${order.id}?isShopify=true`
                : `/cms/ecommerce/orders/${order.id}`;
            router.push(url);
        },
        [router]
    );

    const handleExport = useCallback(() => {
        if (orders.length > 0) {
            ecommerceApi.exportOrdersToCSV(orders);
        }
    }, [orders]);

    const resetFilters = useCallback(() => {
        setSearchTerm("");
        setStatusFilter("");
        setDateFrom("");
        setDateTo("");
        setSortBy("orderDate");
        setSortDirection("desc");
    }, []);

    const handleLoadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadOrders(false);
        }
    }, [loading, hasMore, loadOrders]);

    // Loading states
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Please log in to access this page.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <ShoppingCart className="w-8 h-8 mr-3 text-orange-500" />
                            Orders
                        </h1>
                        <p className="text-gray-600 mt-2">Manage and track customer orders and fulfillment</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2" disabled={orders.length === 0}>
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Total Orders</p>
                                {statisticsLoading ? <div className="w-16 h-6 bg-purple-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-red-200 text-lg font-semibold">Error</p> : <p className="text-2xl font-bold">{statistics.totalOrders.toLocaleString()}</p>}
                            </div>
                            <ShoppingCart className="w-8 h-8 text-purple-200" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Total Revenue</p>
                                {statisticsLoading ? <div className="w-20 h-6 bg-green-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-red-200 text-lg font-semibold">Error</p> : <p className="text-2xl font-bold">{statistics.formattedTotalRevenue}</p>}
                            </div>
                            <DollarSign className="w-8 h-8 text-green-200" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Average Order</p>
                                {statisticsLoading ? <div className="w-16 h-6 bg-blue-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-red-200 text-lg font-semibold">Error</p> : <p className="text-2xl font-bold">{statistics.formattedAverageOrderValue}</p>}
                            </div>
                            <Package className="w-8 h-8 text-blue-200" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Pending Orders</p>
                                {statisticsLoading ? <div className="w-12 h-6 bg-orange-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-red-200 text-lg font-semibold">Error</p> : <p className="text-2xl font-bold">{statistics.pendingOrders.toLocaleString()}</p>}
                            </div>
                            <Calendar className="w-8 h-8 text-orange-200" />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                    </div>

                    <div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <option value="">All Statuses</option>
                            {orderStatuses.map((status) => (
                                <option key={status.id} value={status.statusName}>
                                    {status.statusName}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Input type="date" placeholder="From Date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>

                    <div>
                        <Input type="date" placeholder="To Date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>

                    <div>
                        <Button onClick={resetFilters} variant="outline" className="w-full flex items-center justify-center space-x-2">
                            <RotateCcw className="w-4 h-4" />
                            <span>Reset</span>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">{loading && orders.length === 0 ? "Loading orders..." : `Showing ${orders.length.toLocaleString()} of ${totalCount.toLocaleString()} orders`}</p>
            </div>

            {/* Error State */}
            {error && (
                <Card className="p-4 mb-4 bg-red-50 border-red-200">
                    <p className="text-red-600">{error}</p>
                </Card>
            )}

            <InfiniteScrollList
                data={orders}
                loading={loading}
                hasMore={hasMore}
                endReached={handleLoadMore}
                itemContent={(index, order) => <OrderItem key={order.id} order={order} onClick={() => handleOrderClick(order)} />}
                emptyIcon={<ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
                emptyTitle="No orders found"
                emptyMessage={searchTerm || statusFilter || dateFrom || dateTo ? "Try adjusting your filters to see more results." : "Orders will appear here once customers start placing them."}
                height={600}
                footerLoading={<LoadingSpinner />}
                footerEnd={<span>No more orders to load</span>}
            />
        </div>
    );
};

export default OrdersPage;
