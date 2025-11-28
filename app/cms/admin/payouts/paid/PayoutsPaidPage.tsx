"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { DollarSign, Package, Monitor, Heart, ChevronDown, ChevronUp, Search } from "lucide-react";

import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { Button } from "@/app/components/ui/Button";
import { AdminPayoutsApi } from "@/app/services/adminPayoutsApi";
import type { PaidPayoutListItem, PaidPayoutsParams, VendorListItem } from "@/app/types/Payouts";

interface PaidPayoutItemProps {
    payout: PaidPayoutListItem;
    onUndo: (vendorId: number, payoutIds: number[]) => void;
}

function PaidPayoutItem({ payout, onUndo }: PaidPayoutItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedPayouts, setExpandedPayouts] = useState<Set<number>>(new Set());
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);

    const togglePayoutExpansion = (payoutId: number) => {
        const newExpanded = new Set(expandedPayouts);
        if (newExpanded.has(payoutId)) {
            newExpanded.delete(payoutId);
        } else {
            newExpanded.add(payoutId);
        }
        setExpandedPayouts(newExpanded);
    };

    const toggleOrderExpansion = (orderId: number) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const handleUndoAll = async () => {
        setIsProcessing(true);
        try {
            const payoutIds = payout.vendorPayouts.map((vp) => vp.payoutId);
            await onUndo(payout.vendorId, payoutIds);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUndoSpecific = async (payoutId: number) => {
        setIsProcessing(true);
        try {
            await onUndo(payout.vendorId, [payoutId]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Vendor Info */}
                    <div>
                        <p className="text-sm font-medium text-gray-900">{payout.vendorName}</p>
                        <p className="text-sm text-gray-500">Vendor ID: {payout.vendorId}</p>
                    </div>

                    {/* Financial Info */}
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Total Paid:</span>
                            <span className="text-sm font-semibold text-gray-900">${payout.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Payouts:</span>
                            <span className="text-sm text-gray-600">{payout.vendorPayouts.length}</span>
                        </div>
                    </div>

                    {/* Date and Actions */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Last Payout Date:</p>
                            <p className="text-sm font-medium text-gray-900">{new Date(payout.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Button onClick={handleUndoAll} disabled={isProcessing} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm">
                                {isProcessing ? <LoadingSpinner /> : "Undo All"}
                            </Button>
                            <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)} className="px-3 py-2 text-sm">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Payouts */}
            {isExpanded && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Vendor Payouts ({payout.vendorPayouts.length})</h4>
                    <div className="space-y-4">
                        {payout.vendorPayouts.map((vendorPayout) => (
                            <div key={vendorPayout.payoutId} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Payout #{vendorPayout.payoutId}</p>
                                            <p className="text-sm text-gray-500">{new Date(vendorPayout.lastOrderDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total:</p>
                                            <p className="text-sm font-medium text-gray-900">${vendorPayout.total.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Orders:</p>
                                            <p className="text-sm font-medium text-gray-900">{vendorPayout.orders.length}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button onClick={() => handleUndoSpecific(vendorPayout.payoutId)} disabled={isProcessing} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                            {isProcessing ? <LoadingSpinner /> : "Undo"}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => togglePayoutExpansion(vendorPayout.payoutId)}>
                                            {expandedPayouts.has(vendorPayout.payoutId) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Orders for this Payout */}
                                {expandedPayouts.has(vendorPayout.payoutId) && (
                                    <div className="border-t border-gray-200 pt-3">
                                        <h5 className="text-sm font-medium text-gray-900 mb-2">Orders ({vendorPayout.orders.length})</h5>
                                        <div className="space-y-3">
                                            {vendorPayout.orders.map((order) => (
                                                <div key={order.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                                                                <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Total:</p>
                                                                <p className="text-sm font-medium text-gray-900">${order.total.toFixed(2)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">ShopSee Fee:</p>
                                                                <p className="text-sm font-medium text-gray-900">${order.applicationFee.toFixed(2)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Items:</p>
                                                                <p className="text-sm font-medium text-gray-900">{order.items.length}</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm" onClick={() => toggleOrderExpansion(order.id)}>
                                                            {expandedOrders.has(order.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        </Button>
                                                    </div>

                                                    {/* Order Items */}
                                                    {expandedOrders.has(order.id) && (
                                                        <div className="mt-3 border-t border-gray-200 pt-3">
                                                            <h6 className="text-sm font-medium text-gray-900 mb-2">Order Items</h6>
                                                            <div className="space-y-2">
                                                                {order.items.map((item, index) => (
                                                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                                                        <div>
                                                                            <span className="text-gray-900">{item.productName}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">Qty: </span>
                                                                            <span className="text-gray-900">{item.quantity}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">Unit: </span>
                                                                            <span className="text-gray-900">${item.subtotal.toFixed(2)}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">Total: </span>
                                                                            <span className="text-gray-900">${item.total.toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PayoutsPaidPage() {
    const [paidPayouts, setPaidPayouts] = useState<PaidPayoutListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [stats, setStats] = useState({
        totalPaid: 0,
        totalPhysicalProducts: 0,
        totalDigitalProducts: 0,
        totalDonationProducts: 0,
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"Vendor" | "Total" | "LastOrder">("Total");
    const [sortOrder, setSortOrder] = useState<"Asc" | "Desc">("Desc");
    const [, setVendorsList] = useState<VendorListItem[]>([]);

    const loadPayouts = useCallback(
        async (reset = false) => {
            try {
                if (reset) {
                    setLoading(true);
                    setPaidPayouts([]);
                    setHasMore(true);
                }

                const params: PaidPayoutsParams = {
                    skip: reset ? 0 : paidPayouts.length,
                    take: 10,
                    search: searchTerm || undefined,
                    sortBy,
                    sortOrder,
                };

                const response = await AdminPayoutsApi.getPaidPayouts(params);

                if (reset) {
                    setPaidPayouts(response.data);
                } else {
                    setPaidPayouts((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setVendorsList(response.vendorsList);

                // Update stats only on reset/first load
                if (reset || paidPayouts.length === 0) {
                    setStats({
                        totalPaid: response.totalPaid,
                        totalPhysicalProducts: response.totalPhysicalProducts,
                        totalDigitalProducts: response.totalDigitalProducts,
                        totalDonationProducts: response.totalDonationProducts,
                    });
                }
            } catch (error) {
                console.error("Error loading paid payouts:", error);
                toast.error("Failed to load paid payouts");
            } finally {
                setLoading(false);
            }
        },
        [paidPayouts.length, searchTerm, sortBy, sortOrder]
    );

    // Initial load
    useEffect(() => {
        loadPayouts(true);
    }, [searchTerm, sortBy, sortOrder]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const handleUndo = async (vendorId: number, payoutIds: number[]) => {
        try {
            await AdminPayoutsApi.undoPayout({ payoutIds });
            toast.success("Payout undone successfully");
            loadPayouts(true); // Reload the list
        } catch (error) {
            console.error("Error undoing payout:", error);
            toast.error("Failed to undo payout");
        }
    };

    const renderPayoutItem = (index: number, payout: PaidPayoutListItem) => <PaidPayoutItem key={`${payout.vendorId}-${payout.orderDate}`} payout={payout} onUndo={handleUndo} />;

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Paid Payouts</h1>
                <p className="text-gray-600">View and manage completed vendor payouts</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Total Paid</p>
                            <p className="text-2xl font-bold">${stats.totalPaid.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Physical Products</p>
                            <p className="text-2xl font-bold">${stats.totalPhysicalProducts.toFixed(2)}</p>
                        </div>
                        <Package className="w-8 h-8 text-purple-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Digital Products</p>
                            <p className="text-2xl font-bold">${stats.totalDigitalProducts.toFixed(2)}</p>
                        </div>
                        <Monitor className="w-8 h-8 text-orange-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm">Donations</p>
                            <p className="text-2xl font-bold">${stats.totalDonationProducts.toFixed(2)}</p>
                        </div>
                        <Heart className="w-8 h-8 text-red-200" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input type="text" placeholder="Search vendors..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="flex gap-2">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "Vendor" | "Total" | "LastOrder")} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="Total">Sort by Total</option>
                            <option value="Vendor">Sort by Vendor</option>
                            <option value="LastOrder">Sort by Last Order</option>
                        </select>
                        <Button variant="outline" onClick={() => setSortOrder(sortOrder === "Desc" ? "Asc" : "Desc")} className="px-3 py-2">
                            {sortOrder === "Desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Payouts List */}
            <InfiniteScrollList data={paidPayouts} loading={loading} hasMore={hasMore} endReached={() => loadPayouts(false)} itemContent={renderPayoutItem} emptyIcon={<DollarSign />} emptyTitle="No Paid Payouts Found" emptyMessage="There are no paid payouts to display at the moment." />
        </div>
    );
}
