import React from "react";
import { EcommerceOrder } from "@/app/types/ecommerce";
import { Card } from "@/app/components/ui/Card";
import { Package } from "lucide-react";

interface OrderItemsProps {
    order: EcommerceOrder;
}

export const OrderItems: React.FC<OrderItemsProps> = ({ order }) => {
    // Parse variation data if available
    const parseVariation = (variationString?: string) => {
        if (!variationString) return null;

        try {
            const variation = JSON.parse(variationString);
            if (variation.combinations) {
                // eslint-disable-next-line
                return variation.combinations.map((combo: any) => `${combo.optionName}: ${combo.combinationItemName}`).join(", ");
            }
        } catch {
            // If parsing fails, return the raw string
            return variationString;
        }
        return null;
    };

    return (
        <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
                <Package className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {order.items?.length || order.itemsCount} {(order.items?.length || order.itemsCount) === 1 ? "item" : "items"}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Unit Price</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, index) => {
                            const variations = parseVariation(item.variation);

                            return (
                                <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-start space-x-4">
                                            {/* Product Image Placeholder */}
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Package className="w-6 h-6 text-gray-400" />
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>

                                                {variations && (
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        {
                                                            // eslint-disable-next-line
                                                            variations.split(", ").map((variation: any, idx: any) => (
                                                                <div key={idx} className="italic">
                                                                    {variation}
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                )}

                                                <div className="text-xs text-gray-500 mt-1">Product ID: {item.productId}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">{item.quantity}</span>
                                    </td>

                                    <td className="py-4 px-4 text-right">
                                        <span className="font-medium text-gray-900">${item.unitPrice.toFixed(2)}</span>
                                    </td>

                                    <td className="py-4 px-4 text-right">
                                        <span className="font-semibold text-gray-900">${item.totalPrice.toFixed(2)}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Items Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Total Items: {order.items?.reduce((sum, item) => sum + item.quantity, 0) || order.itemsCount}</span>
                    <span>Items Subtotal: ${order.items?.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2) || "0.00"}</span>
                </div>
            </div>
        </Card>
    );
};
