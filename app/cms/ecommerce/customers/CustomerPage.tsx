"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { ecommerceApi } from "@/app/services/ecommerceApi";
import { EcommerceCustomer, CustomerStatistics } from "@/app/types/ecommerce";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { Search, Download, Users, ShoppingBag, DollarSign, RotateCcw } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Card } from "@/app/components/ui/Card";
import { Select } from "@/app/components/ui/Select";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { CustomerItem } from "./CustomerItem";
import { useRouter } from "next/navigation";

const CustomersPage: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [customers, setCustomers] = useState<EcommerceCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("dateCreated");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Statistics state
    const [statistics, setStatistics] = useState<CustomerStatistics>({
        totalCustomers: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        averageCustomerValue: 0,
        formattedTotalRevenue: "$0.00",
        formattedAverageOrderValue: "$0.00",
        formattedAverageCustomerValue: "$0.00",
    });
    const [statisticsLoading, setStatisticsLoading] = useState(true);
    const [statisticsError, setStatisticsError] = useState<string | null>(null);

    // Memoize current filters to prevent unnecessary statistics reloads
    const currentFilters = useMemo(
        () => ({
            search: searchTerm,
        }),
        [searchTerm]
    );

    const loadStatistics = useCallback(async () => {
        try {
            setStatisticsError(null);
            setStatisticsLoading(true);
            const stats = await ecommerceApi.getCustomerStatistics(currentFilters);
            setStatistics(stats);
        } catch (err) {
            setStatisticsError(err instanceof Error ? err.message : "Failed to load statistics");
            console.error("Error loading statistics:", err);
        } finally {
            setStatisticsLoading(false);
        }
    }, [currentFilters]);

    const loadCustomers = useCallback(
        async (reset = false) => {
            if (!hasMore && !reset) return;

            try {
                setError(null);
                const skip = reset ? 0 : customers.length;

                const response = await ecommerceApi.getCustomers({
                    skip,
                    take: 50,
                    search: searchTerm,
                    sortBy,
                    sortDirection,
                });

                if (reset) {
                    setCustomers(response.data);
                } else {
                    setCustomers((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load customers");
                console.error("Error loading customers:", err);
            } finally {
                setLoading(false);
            }
        },
        [hasMore, customers.length, searchTerm, sortBy, sortDirection]
    );

    // Initial load - separate from filter changes to avoid loops
    useEffect(() => {
        if (!authLoading && user) {
            setLoading(true);
            loadCustomers(true);
            loadStatistics();
        }
    }, [authLoading, user]);

    // Handle filter changes - reload both customers and statistics
    useEffect(() => {
        if (user) {
            setCustomers([]);
            setHasMore(true);
            setLoading(true);
            loadCustomers(true);
            loadStatistics();
        }
    }, [sortBy, sortDirection]);

    // Search with debounce - separate from other filters
    useEffect(() => {
        if (!user) return;

        const timeoutId = setTimeout(() => {
            setCustomers([]);
            setHasMore(true);
            setLoading(true);
            loadCustomers(true);
            loadStatistics();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleCustomerClick = (customer: EcommerceCustomer) => {
        router.push(`/cms/ecommerce/customers/${customer.id}`);
    };

    const handleExport = () => {
        if (customers.length > 0) {
            ecommerceApi.exportCustomersToCSV(customers);
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSortBy("dateCreated");
        setSortDirection("desc");
    };

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
                            <Users className="w-8 h-8 mr-3 text-purple-500" />
                            Customers
                        </h1>
                        <p className="text-gray-600 mt-2">Manage customer information and purchase history</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2" disabled={customers.length === 0}>
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
                                <p className="text-purple-100 text-sm">Total Customers</p>
                                {statisticsLoading ? <div className="w-16 h-6 bg-purple-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-xl font-bold text-red-200">Error</p> : <p className="text-2xl font-bold">{statistics.totalCustomers.toLocaleString()}</p>}
                            </div>
                            <Users className="w-8 h-8 text-purple-200" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Total Revenue</p>
                                {statisticsLoading ? <div className="w-20 h-6 bg-green-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-xl font-bold text-red-200">Error</p> : <p className="text-2xl font-bold">{statistics.formattedTotalRevenue}</p>}
                            </div>
                            <DollarSign className="w-8 h-8 text-green-200" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Avg Order Value</p>
                                {statisticsLoading ? <div className="w-18 h-6 bg-blue-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-xl font-bold text-red-200">Error</p> : <p className="text-2xl font-bold">{statistics.formattedAverageOrderValue}</p>}
                            </div>
                            <ShoppingBag className="w-8 h-8 text-blue-200" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Avg Customer Value</p>
                                {statisticsLoading ? <div className="w-18 h-6 bg-orange-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-xl font-bold text-red-200">Error</p> : <p className="text-2xl font-bold">{statistics.formattedAverageCustomerValue}</p>}
                            </div>
                            <Users className="w-8 h-8 text-orange-200" />
                        </div>
                    </Card>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                        </div>

                        <div>
                            <Button onClick={resetFilters} variant="outline" className="w-full flex items-center justify-center space-x-2">
                                <RotateCcw className="w-4 h-4" />
                                <span>Reset</span>
                            </Button>
                        </div>
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Sort by:</span>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <option value="dateCreated">Date Created</option>
                                <option value="name">Customer Name</option>
                                <option value="email">Email</option>
                                <option value="orders">Total Orders</option>
                                <option value="spent">Total Spent</option>
                            </Select>
                            <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as "asc" | "desc")}>
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </Select>
                        </div>

                        <div className="text-sm text-gray-600">
                            {loading ? (
                                <span>Loading...</span>
                            ) : (
                                <span>
                                    Showing {customers.length} of {totalCount.toLocaleString()} customers
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <div className="text-red-600 text-sm">{error}</div>
                            <Button onClick={() => loadCustomers(true)} variant="outline" size="sm" className="ml-auto">
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                {/* Statistics Error Display */}
                {statisticsError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <div className="text-yellow-700 text-sm">Statistics unavailable: {statisticsError}</div>
                            <Button onClick={loadStatistics} variant="outline" size="sm" className="ml-auto">
                                Retry Stats
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Customers List */}
            <InfiniteScrollList
                data={customers}
                loading={loading}
                hasMore={hasMore}
                endReached={() => {
                    if (!loading && hasMore) {
                        loadCustomers(false);
                    }
                }}
                itemContent={(index, customer) => <CustomerItem key={customer.id} customer={customer} onClick={handleCustomerClick} />}
                emptyIcon={<Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
                emptyTitle="No customers found"
                emptyMessage={searchTerm ? "Try adjusting your search criteria" : "Customers will appear here once they start placing orders"}
                onResetFilters={resetFilters}
                showEmptyReset={!!searchTerm}
                height={600}
                footerLoading={<LoadingSpinner />}
                footerEnd={<span>All customers loaded ({customers.length} total)</span>}
            />
        </div>
    );
};

export default CustomersPage;
