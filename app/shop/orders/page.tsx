"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import axiosClient from "@/app/utils/axiosClient";
import { ShoppingBag, Package, ChevronRight } from "lucide-react";

interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    guid: string;
    orderDate: string;
    orderStatus: string;
    companyName: string;
    companyImage?: string;
    total: number;
    currency: string;
    items: OrderItem[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const response = await axiosClient.get<Order[]>("/api/shop/orders");
                setOrders(response.data);
            } catch (error) {
                console.error("Failed to load orders:", error);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
                <p className="text-gray-600">View and track all your orders</p>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
                    <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Order Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            {order.companyImage ? (
                                                <img
                                                    src={order.companyImage}
                                                    alt={order.companyName}
                                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-violet-100 flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-violet-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{order.companyName}</h3>
                                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                <span>Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end md:space-x-6">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Total</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {order.currency === "USD" ? "$" : order.currency}
                                                {order.total.toFixed(2)}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/shop/orders/${order.guid}`}
                                            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                        >
                                            Details
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {order.items.slice(0, 6).map((item) => (
                                        <div key={item.id} className="group relative">
                                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                {item.productImage ? (
                                                    <img
                                                        src={item.productImage}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-2 text-xs text-gray-700 line-clamp-2" title={item.productName}>
                                                {item.productName}
                                            </p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    ))}
                                    {order.items.length > 6 && (
                                        <div className="aspect-square rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-gray-400">+{order.items.length - 6}</p>
                                                <p className="text-xs text-gray-500 mt-1">more items</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
