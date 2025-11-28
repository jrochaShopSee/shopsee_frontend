"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { DollarSign, Package, Monitor, Heart, ChevronDown, ChevronUp, Search, AlertTriangle } from "lucide-react";

import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { Button } from "@/app/components/ui/Button";
import { AdminPayoutsApi } from "@/app/services/adminPayoutsApi";
import type { PayoutListItem, PendingPayoutsParams, VendorListItem } from "@/app/types/Payouts";

interface PayoutItemProps {
    payout: PayoutListItem;
    section: "above" | "below";
    onPay: (vendorId: number, orderIds: number[]) => void;
}

function PayoutItem({ payout, section, onPay }: PayoutItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleOrderExpansion = (orderId: number) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const handlePay = async () => {
        setIsProcessing(true);
        try {
            const orderIds = payout.orders.map((order) => order.id);
            await onPay(payout.vendorId, orderIds);
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
                            <span className="text-sm text-gray-500">Total Pending:</span>
                            <span className={`text-sm font-semibold ${section === "below" ? "text-red-600" : "text-gray-900"}`}>${payout.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Subtotal:</span>
                            <span className="text-sm text-gray-600">${payout.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Tax:</span>
                            <span className="text-sm text-gray-600">${payout.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Shipping:</span>
                            <span className="text-sm text-gray-600">${payout.shipping.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Date and Actions */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Last Order Date:</p>
                            <p className="text-sm font-medium text-gray-900">{new Date(payout.lastOrderDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            {section === "above" && (
                                <Button onClick={handlePay} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm">
                                    {isProcessing ? <LoadingSpinner /> : "Pay"}
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)} className="px-3 py-2 text-sm">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Orders */}
            {isExpanded && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Orders ({payout.orders.length})</h4>
                    <div className="space-y-3">
                        {payout.orders.map((order) => (
                            <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
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
                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                        <h5 className="text-sm font-medium text-gray-900 mb-2">Order Items</h5>
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
    );
}

export default function PayoutsPendingPage() {
    const [pendingPayouts, setPendingPayouts] = useState<PayoutListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [stats, setStats] = useState({
        totalPending: 0,
        minimumCost: 0,
        totalPhysicalProducts: 0,
        totalDigitalProducts: 0,
        totalDonationProducts: 0,
        aboveMinimumCount: 0,
        belowMinimumCount: 0,
    });

    // Filter states
    const [currentSection, setCurrentSection] = useState<"above" | "below">("above");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"Vendor" | "Total" | "LastOrder">("Total");
    const [sortOrder, setSortOrder] = useState<"Asc" | "Desc">("Desc");
    const [, setVendorsList] = useState<VendorListItem[]>([]);

    const loadPayouts = useCallback(
        async (reset = false) => {
            try {
                if (reset) {
                    setLoading(true);
                    setPendingPayouts([]);
                    setHasMore(true);
                }

                const params: PendingPayoutsParams = {
                    skip: reset ? 0 : pendingPayouts.length,
                    take: 10,
                    section: currentSection,
                    search: searchTerm || undefined,
                    sortBy,
                    sortOrder,
                };

                const response = await AdminPayoutsApi.getPendingPayouts(params);

                if (reset) {
                    setPendingPayouts(response.data);
                } else {
                    setPendingPayouts((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setVendorsList(response.vendorsList);

                // Update stats only on reset/first load
                if (reset || pendingPayouts.length === 0) {
                    setStats({
                        totalPending: response.totalPending,
                        minimumCost: response.minimumCost,
                        totalPhysicalProducts: response.totalPhysicalProducts,
                        totalDigitalProducts: response.totalDigitalProducts,
                        totalDonationProducts: response.totalDonationProducts,
                        aboveMinimumCount: response.aboveMinimumCount,
                        belowMinimumCount: response.belowMinimumCount,
                    });
                }
            } catch (error) {
                console.error("Error loading payouts:", error);
                toast.error("Failed to load payouts");
            } finally {
                setLoading(false);
            }
        },
        [pendingPayouts.length, currentSection, searchTerm, sortBy, sortOrder]
    );

    // Initial load
    useEffect(() => {
        loadPayouts(true);
    }, [currentSection, searchTerm, sortBy, sortOrder]);

    const handleSectionChange = (section: "above" | "below") => {
        setCurrentSection(section);
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const handlePay = async (vendorId: number, orderIds: number[]) => {
        try {
            await AdminPayoutsApi.payPayout({ orderIds });
            toast.success("Payout submitted successfully");
            loadPayouts(true); // Reload the list
        } catch (error) {
            console.error("Error submitting payout:", error);
            toast.error("Failed to submit payout");
        }
    };

    const renderPayoutItem = (index: number, payout: PayoutListItem) => <PayoutItem key={`${payout.vendorId}-${payout.payoutId}`} payout={payout} section={currentSection} onPay={handlePay} />;

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Payouts</h1>
                <p className="text-gray-600">Manage vendor payouts above and below minimum threshold</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Pending</p>
                            <p className="text-2xl font-bold">${stats.totalPending.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Minimum Cost</p>
                            <p className="text-2xl font-bold">${stats.minimumCost.toFixed(2)}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-green-200" />
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

            {/* Section Toggle & Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Section Toggle */}
                    <div className="flex gap-2">
                        <Button onClick={() => handleSectionChange("above")} className={`${currentSection === "above" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                            Above Minimum ({stats.aboveMinimumCount})
                        </Button>
                        <Button onClick={() => handleSectionChange("below")} className={`${currentSection === "below" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                            Below Minimum ({stats.belowMinimumCount})
                        </Button>
                    </div>

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
            <InfiniteScrollList data={pendingPayouts} loading={loading} hasMore={hasMore} endReached={() => loadPayouts(false)} itemContent={renderPayoutItem} emptyIcon={<DollarSign />} emptyTitle={`No ${currentSection === "above" ? "Above" : "Below"} Minimum Payouts Found`} emptyMessage={currentSection === "above" ? "There are no pending payouts above the minimum cost at the moment." : "There are no pending payouts below the minimum cost at the moment."} />
        </div>
    );
}
