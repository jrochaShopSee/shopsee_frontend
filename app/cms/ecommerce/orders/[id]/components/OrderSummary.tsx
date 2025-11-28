import React from "react";
import { EcommerceOrder } from "@/app/types/ecommerce";
import { Card } from "@/app/components/ui/Card";
import { DollarSign, Package, Truck, CreditCard } from "lucide-react";

interface OrderSummaryProps {
    order: EcommerceOrder;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Information */}
                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <Package className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">Order ID</p>
                            <p className="font-semibold">{order.guid || `#${order.id}`}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-semibold text-lg">{order.formattedTotal}</p>
                        </div>
                    </div>

                    {order.orderTax && order.orderTax > 0 && (
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Tax</p>
                                <p className="font-medium">${order.orderTax.toFixed(2)}</p>
                            </div>
                        </div>
                    )}

                    {order.orderShipping && order.orderShipping > 0 && (
                        <div className="flex items-start space-x-3">
                            <Truck className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Shipping</p>
                                <p className="font-medium">${order.orderShipping.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment & Customer Info */}
                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="font-semibold">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.customerEmail}</p>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Notes</p>
                                <p className="text-sm text-gray-800">{order.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">${(order.orderTotal - (order.orderTax || 0) - (order.orderShipping || 0)).toFixed(2)}</span>
                        </div>

                        {order.orderTax && order.orderTax > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium">${order.orderTax.toFixed(2)}</span>
                            </div>
                        )}

                        {order.orderShipping && order.orderShipping > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">${order.orderShipping.toFixed(2)}</span>
                            </div>
                        )}

                        {order.orderDiscount && order.orderDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span className="font-medium">-${order.orderDiscount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-bold text-lg text-gray-900">{order.formattedTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
