"use client";

import React from "react";
import { EcommerceOrder } from "@/app/types/ecommerce";
import { ShoppingCart, Package, DollarSign, Calendar, Truck, User, Store } from "lucide-react";
import { Card } from "@/app/components/ui/Card";

interface OrderItemProps {
    order: EcommerceOrder;
    onClick: (order: EcommerceOrder) => void;
}
// title of each row
const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

    const statusColors: { [key: string]: string } = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        processing: "bg-blue-100 text-blue-800 border-blue-200",
        shipped: "bg-purple-100 text-purple-800 border-purple-200",
        delivered: "bg-green-100 text-green-800 border-green-200",
        cancelled: "bg-red-100 text-red-800 border-red-200",
        refunded: "bg-gray-100 text-gray-800 border-gray-200",
        completed: "bg-green-100 text-green-800 border-green-200",
        complete: "bg-green-100 text-green-800 border-green-200",
        "in process": "bg-blue-100 text-blue-800 border-blue-200",
        "payment success": "bg-green-100 text-green-800 border-green-200",
        "on hold": "bg-orange-100 text-orange-800 border-orange-200",
        failed: "bg-red-100 text-red-800 border-red-200",
    };
    return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const OrderItem: React.FC<OrderItemProps> = ({ order, onClick }) => {
    function getFirstOrderItemName(order: EcommerceOrder): React.ReactNode {
        return order.items != null && order.items.length > 0 ? order.items[0].productName : `#${order.guid}`;
    }

    return (
        <Card className="p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-orange-300">
            <div className="flex items-center justify-between" onClick={() => onClick(order)}>
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                        <ShoppingCart className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{getFirstOrderItemName(order)}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>{order.orderStatus || "Unknown"}</span>
                            {order.isShopifyOrder && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 flex items-center space-x-1">
                                    <Store className="w-3 h-3" />
                                    <span>Shopify</span>
                                </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                <span>{order.customerName || "Guest Customer"}</span>
                            </div>

                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center">
                                <Package className="w-4 h-4 mr-1" />
                                <span>{order.itemsCount || 0} items</span>
                            </div>

                            {order.trackingNumber && (
                                <div className="flex items-center">
                                    <Truck className="w-4 h-4 mr-1" />
                                    <span className="text-blue-600">{order.trackingNumber}</span>
                                </div>
                            )}
                        </div>

                        {order.customer?.email && <p className="text-gray-500 text-xs mt-1">{order.customer.email}</p>}
                    </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                    <div className="text-center">
                        <div className="flex items-center text-gray-600 mb-1">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">Total</span>
                        </div>
                        <p className="font-bold text-lg text-green-600">${order.orderTotal?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}</p>
                    </div>

                    <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Date</div>
                        <p className="text-sm text-gray-700">
                            {new Date(order.orderDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
