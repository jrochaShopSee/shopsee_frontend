"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { ecommerceApi } from "@/app/services/ecommerceApi";
import { EcommerceOrder } from "@/app/types/ecommerce";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Select } from "@/app/components/ui/Select";
import { Input } from "@/app/components/ui/Input";
import { ArrowLeft, User, Receipt, Package, DollarSign, Calendar, Mail, Phone, Check, ShoppingBag, MessageCircle, Send, Truck, FileText, Store } from "lucide-react";
import type { OrderStatus } from "@/app/types/ecommerce";

// Enhanced interfaces for missing data
interface OrderNote {
    id: number;
    content: string;
    isCustomerNote: boolean;
    dateAdded: string;
    addedBy: string;
    formattedDate: string;
}

const OrderDetailsPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading } = useAuth();

    // Order data
    const [order, setOrder] = useState<EcommerceOrder | null>(null);
    const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
    const [orderNotes, setOrderNotes] = useState<OrderNote[]>([]);

    // Form states
    const [selectedStatus, setSelectedStatus] = useState("");
    const [newNote, setNewNote] = useState("");
    const [isCustomerNote, setIsCustomerNote] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState("");

    // Loading states
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [notesLoading, setNotesLoading] = useState(false);
    const [noteSubmitting, setNoteSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const orderId = params?.id ? parseInt(params.id as string) : null;
    const isShopify = searchParams?.get('isShopify') === 'true';

    // Calculate order totals
    const calculateTotals = (order: EcommerceOrder) => {
        const subtotal = order.orderTotal - (order.orderTax || 0) - (order.orderShipping || 0) + (order.orderDiscount || 0);
        return {
            subtotal,
            tax: order.orderTax || 0,
            shipping: order.orderShipping || 0,
            discount: order.orderDiscount || 0,
            total: order.orderTotal,
        };
    };

    // Load order data
    useEffect(() => {
        const loadOrder = async () => {
            if (!orderId || !user) return;

            try {
                setError(null);
                const orderData = await ecommerceApi.getOrder(orderId, isShopify);
                console.log(orderData);
                setOrder(orderData);
                setSelectedStatus(orderData.orderStatus);
                setTrackingNumber(orderData.trackingNumber || "");
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load order");
                console.error("Error loading order:", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            loadOrder();
        }
    }, [orderId, user, authLoading, isShopify]);

    // Load order statuses
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
    }, []);

    // Load order notes
    useEffect(() => {
        const loadNotes = async () => {
            if (!orderId) return;

            try {
                setNotesLoading(true);
                const notes = await ecommerceApi.getOrderNotes(orderId);
                setOrderNotes(notes);
            } catch (err) {
                console.error("Error loading order notes:", err);
            } finally {
                setNotesLoading(false);
            }
        };

        if (orderId) {
            loadNotes();
        }
    }, [orderId]);

    const handleStatusUpdate = async () => {
        if (!order || selectedStatus === order.orderStatus) return;

        try {
            setStatusLoading(true);
            await ecommerceApi.updateOrderStatus(order.id, selectedStatus);

            // Update local state
            setOrder((prev) => (prev ? { ...prev, orderStatus: selectedStatus } : null));
        } catch (err) {
            console.error("Error updating order status:", err);
            // Reset to original status on error
            setSelectedStatus(order.orderStatus);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!order || !newNote.trim()) return;

        try {
            setNoteSubmitting(true);
            await ecommerceApi.addOrderNote(order.id, newNote, isCustomerNote);

            // Refresh notes
            const updatedNotes = await ecommerceApi.getOrderNotes(order.id);
            setOrderNotes(updatedNotes);

            // Clear form
            setNewNote("");
            setIsCustomerNote(false);
        } catch (err) {
            console.error("Error adding order note:", err);
        } finally {
            setNoteSubmitting(false);
        }
    };

    // Parse and format variation display
    const formatVariation = (variation: string | undefined): string => {
        if (!variation || variation === "null") return "";

        try {
            const parsed = JSON.parse(variation);

            // If it has an options object, extract the values
            if (parsed.options) {
                return Object.entries(parsed.options)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ");
            }

            // Otherwise return as is
            return variation;
        } catch {
            // If parsing fails, return the original string
            return variation;
        }
    };

    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case "pending":
            case "pending payment":
                return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200";
            case "in process":
            case "processing":
                return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200";
            case "complete":
            case "completed":
                return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200";
            case "cancelled":
                return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200";
            case "on hold":
                return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-300";
            case "refunded":
                return "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200";
            case "failed":
                return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200";
            default:
                return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-300";
        }
    };

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

    if (!orderId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Invalid order ID.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <Card className="p-6 bg-red-50 border-red-200 text-center">
                    <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Order</h3>
                    <p className="text-red-700 mb-4">{error || "Order not found"}</p>
                    <Button onClick={() => router.push("/cms/ecommerce/orders")} className="bg-red-600 text-white hover:bg-red-700">
                        Back to Orders
                    </Button>
                </Card>
            </div>
        );
    }

    const totals = calculateTotals(order);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
            <div className="p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Button onClick={() => router.push("/cms/ecommerce/orders")} variant="outline" className="flex items-center space-x-2 bg-white hover:bg-gray-50 border-gray-200">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Orders</span>
                            </Button>

                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Receipt className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                                        {order.isShopifyOrder && (
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200 flex items-center space-x-1">
                                                <Store className="w-4 h-4" />
                                                <span>Shopify Order</span>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-lg">
                                        {order.formattedDate} • {order.customerName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`px-6 py-3 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Order Summary with Enhanced Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                        <Package className="w-4 h-4 text-white" />
                                    </div>
                                    Order Summary
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-emerald-700">Total Amount</p>
                                                <p className="text-xl font-bold text-emerald-900">{order.formattedTotal}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-blue-700">Order Date</p>
                                                <p className="text-lg font-bold text-blue-900">{order.formattedDate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                                <ShoppingBag className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-purple-700">Items Count</p>
                                                <p className="text-lg font-bold text-purple-900">{order.itemsCount} items</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Totals Breakdown */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="font-bold text-gray-900 mb-6 text-lg">Order Totals</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 font-medium">Subtotal:</span>
                                            <span className="font-semibold text-gray-900">${totals.subtotal.toFixed(2)}</span>
                                        </div>
                                        {totals.shipping > 0 && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600 font-medium">Shipping:</span>
                                                <span className="font-semibold text-gray-900">${totals.shipping.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {totals.tax > 0 && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600 font-medium">Tax:</span>
                                                <span className="font-semibold text-gray-900">${totals.tax.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {totals.discount > 0 && (
                                            <div className="flex justify-between items-center py-2 text-emerald-600">
                                                <span className="font-medium">Discount:</span>
                                                <span className="font-semibold">-${totals.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center py-3 border-t border-gray-200">
                                            <span className="text-lg font-bold text-gray-900">Total:</span>
                                            <span className="text-xl font-bold text-gray-900">${totals.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-5 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                                            <ShoppingBag className="w-4 h-4 text-white" />
                                        </div>
                                        Order Items
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item, index) => {
                                            const formattedVariation = formatVariation(item.variation);
                                            return (
                                                <div key={item.id || index} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-900 text-lg mb-2">{item.productName}</h4>
                                                            {formattedVariation && (
                                                                <div className="mb-3">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{formattedVariation}</span>
                                                                </div>
                                                            )}
                                                            <p className="text-sm text-gray-600 font-medium">
                                                                Unit Price: <span className="text-gray-900">${item.unitPrice.toFixed(2)}</span>
                                                            </p>
                                                        </div>
                                                        <div className="text-center px-6">
                                                            <p className="text-sm text-gray-600 mb-1">Quantity</p>
                                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <span className="font-bold text-blue-800 text-lg">{item.quantity}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600 mb-1">Total</p>
                                                            <p className="font-bold text-gray-900 text-xl">${item.totalPrice.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Customer Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        Customer Information
                                    </h2>

                                    {order.customer?.id && (
                                        <Button onClick={() => router.push(`/cms/ecommerce/customers/${order?.customer?.id}`)} variant="outline" className="flex items-center space-x-2 bg-white hover:bg-gray-50 border-gray-200">
                                            <User className="w-4 h-4" />
                                            <span>View Details</span>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">Customer Name</p>
                                                    <p className="font-bold text-gray-900 text-lg">{order.customer?.name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {order.customer?.email && (
                                            <div className="bg-blue-50 rounded-xl p-4">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                                        <Mail className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-700 mb-1">Email</p>
                                                        <a href={`mailto:${order.customer?.email}`} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                                            {order.customer?.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {order.customer?.phone && (
                                            <div className="bg-purple-50 rounded-xl p-4">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                                        <Phone className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-purple-700 mb-1">Phone</p>
                                                        <a href={`tel:${order.customer.phone}`} className="font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                                                            {order.customer.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions and Notes */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Status Update */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    Update Status
                                </h3>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Current Status</label>
                                    <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Change Status To</label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={statusLoading} placeholder="Select new status..." className="rounded-xl border-gray-200">
                                        {orderStatuses.map((status) => (
                                            <option key={status.id} value={status.statusName}>
                                                {status.statusName}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <Button onClick={handleStatusUpdate} disabled={statusLoading || selectedStatus === order.orderStatus} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center space-x-2">
                                    {statusLoading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Update Status</span>
                                        </>
                                    )}
                                </Button>

                                {selectedStatus !== order.orderStatus && (
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <p className="text-xs text-blue-700 text-center font-medium">
                                            Status will change from "{order.orderStatus}" to "{selectedStatus}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tracking Information */}
                        {trackingNumber && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                            <Truck className="w-4 h-4 text-white" />
                                        </div>
                                        Tracking Information
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Tracking Number</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <p className="text-sm font-mono text-gray-900 font-medium">{trackingNumber}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add Note */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-5 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                        <MessageCircle className="w-4 h-4 text-white" />
                                    </div>
                                    Add Note
                                </h3>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <Input placeholder="Add a note about this order..." value={newNote} onChange={(e) => setNewNote(e.target.value)} disabled={noteSubmitting} className="rounded-xl border-gray-200 h-12" />
                                </div>

                                {order.customer?.email && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center space-x-3">
                                            <input type="checkbox" id="customerNote" checked={isCustomerNote} onChange={(e) => setIsCustomerNote(e.target.checked)} disabled={noteSubmitting} className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500" />
                                            <label htmlFor="customerNote" className="text-sm font-medium text-gray-700">
                                                Send to customer
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <Button onClick={handleAddNote} disabled={noteSubmitting || !newNote.trim()} className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center space-x-2">
                                    {noteSubmitting ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Add Note</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Order Notes */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    Order Notes
                                </h3>
                            </div>

                            <div className="p-6">
                                {notesLoading ? (
                                    <div className="flex justify-center py-8">
                                        <LoadingSpinner />
                                    </div>
                                ) : orderNotes.length > 0 ? (
                                    <div className="space-y-4 max-h-64 overflow-y-auto">
                                        {orderNotes.map((note) => (
                                            <div key={note.id} className={`rounded-xl p-4 border ${note.isCustomerNote ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"}`}>
                                                <p className="text-sm text-gray-800 font-medium mb-3">{note.content}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-600 font-medium">{note.addedBy}</span>
                                                    <span className="text-xs text-gray-500">{note.formattedDate}</span>
                                                </div>
                                                {note.isCustomerNote && (
                                                    <div className="mt-3">
                                                        <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">Customer Note</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">No notes for this order yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
