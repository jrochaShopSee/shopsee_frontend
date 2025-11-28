"use client";

import React from "react";
import { EcommerceCustomer } from "@/app/types/ecommerce";
import { ShoppingBag, DollarSign, Calendar } from "lucide-react";

import { Card } from "@/app/components/ui/Card";

interface CustomerItemProps {
    customer: EcommerceCustomer;
    onClick: (customer: EcommerceCustomer) => void;
}

export const CustomerItem: React.FC<CustomerItemProps> = ({ customer, onClick }) => {
    return (
        <Card className="p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-orange-300">
            <div className="flex items-center justify-between" onClick={() => onClick(customer)}>
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">{customer.name?.charAt(0)?.toUpperCase() || "C"}</div>

                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{customer.name || "Unknown Customer"}</h3>
                        <p className="text-gray-600 text-sm">{customer.email}</p>
                        {customer.phone && <p className="text-gray-500 text-xs">{customer.phone}</p>}
                    </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                    <div className="text-center">
                        <div className="flex items-center text-gray-600 mb-1">
                            <ShoppingBag className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">Orders</span>
                        </div>
                        <p className="font-bold text-lg text-gray-900">{customer.totalOrders || 0}</p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center text-gray-600 mb-1">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">Total Spent</span>
                        </div>
                        <p className="font-bold text-lg text-green-600">${(customer.totalSpent || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center text-gray-600 mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">Since</span>
                        </div>
                        <p className="text-sm text-gray-700">{customer.customerSince}</p>
                    </div>

                    <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Last Order</div>
                        <p className="text-sm text-gray-700">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "Never"}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
