import React from "react";
import { EcommerceOrder } from "@/app/types/ecommerce";
import { ArrowLeft, Printer, User, Receipt } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

interface OrderHeaderProps {
    order: EcommerceOrder;
    onBack: () => void;
    onPrint: () => void;
    onViewCustomer: () => void;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ order, onBack, onPrint, onViewCustomer }) => {
    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case "pending":
            case "pending payment":
                return "bg-yellow-100 text-yellow-800";
            case "in process":
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "complete":
            case "completed":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            case "on hold":
                return "bg-gray-100 text-gray-800";
            case "refunded":
                return "bg-purple-100 text-purple-800";
            case "failed":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="mb-8">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button onClick={onBack} variant="outline" className="flex items-center space-x-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Orders</span>
                    </Button>

                    <div className="flex items-center space-x-3">
                        <Receipt className="w-8 h-8 text-orange-500" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                            <p className="text-gray-600">
                                {order.formattedDate} • {order.customerName}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Button onClick={onViewCustomer} variant="outline" className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>View Customer</span>
                    </Button>

                    <Button onClick={onPrint} variant="outline" className="flex items-center space-x-2">
                        <Printer className="w-4 h-4" />
                        <span>Print Order</span>
                    </Button>
                </div>
            </div>

            {/* Quick Status Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-1">Order Date</p>
                        <p className="font-semibold text-gray-900">{order.formattedDate}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="font-semibold text-gray-900 text-lg">{order.formattedTotal}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-1">Items</p>
                        <p className="font-semibold text-gray-900">
                            {order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}
                        </p>
                    </div>
                </div>

                {order.trackingNumber && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                            <p className="text-sm text-gray-600">Tracking Number:</p>
                            <p className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">{order.trackingNumber}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
