"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { ecommerceApi } from "@/app/services/ecommerceApi";
import { EcommerceCustomer, EcommerceOrder } from "@/app/types/ecommerce";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { Button } from "@/app/components/ui/Button";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign, CreditCard, Package, Activity, FileText, Clock } from "lucide-react";

const CustomerDetailsPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    // Data states
    const [customer, setCustomer] = useState<EcommerceCustomer | null>(null);
    const [recentOrders, setRecentOrders] = useState<EcommerceOrder[]>([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const customerId = params?.id ? parseInt(params.id as string, 10) : null;

    useEffect(() => {
        if (!authLoading && user && customerId) {
            loadCustomerData();
        }
    }, [authLoading, user, customerId]);

    const loadCustomerData = async () => {
        if (!customerId) return;

        try {
            setLoading(true);
            setError(null);

            // Load customer details
            const customerData = await ecommerceApi.getCustomer(customerId);
            setCustomer(customerData);

            // Load recent orders for this customer
            setOrdersLoading(true);
            const ordersResponse = await ecommerceApi.getOrders({
                skip: 0,
                take: 5,
                customerId: customerId,
                sortBy: "orderDate",
                sortDirection: "desc",
            });
            setRecentOrders(ordersResponse.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load customer data");
            console.error("Error loading customer:", err);
        } finally {
            setLoading(false);
            setOrdersLoading(false);
        }
    };

    const handleGoBack = () => {
        router.push("/cms/ecommerce/customers");
    };

    const handleViewOrder = (orderId: number) => {
        router.push(`/cms/ecommerce/orders/${orderId}`);
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    };

    // eslint-disable-next-line
    const formatAddress = (address: any) => {
        if (!address) return "No address provided";

        const parts = [address.streetAddress, address.streetAddress2, address.city, address.state, address.zip, address.country].filter(Boolean);

        return parts.join(", ");
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                    <Package className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold">{error || "Customer not found"}</p>
                </div>
                <Button onClick={handleGoBack} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Customers
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Button onClick={handleGoBack} variant="outline" className="flex items-center space-x-2">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Customers</span>
                        </Button>

                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">{customer.name?.charAt(0)?.toUpperCase() || "C"}</div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                                {customer.email && (
                                    <p className="text-gray-600 flex items-center">
                                        <Mail className="w-4 h-4 mr-1" />
                                        {customer.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className={`px-6 py-3 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(customer.isActive)}`}>{customer.isActive ? "Active" : "Inactive"}</div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-700">Total Orders</p>
                                <p className="text-2xl font-bold text-blue-900">{customer.totalOrders || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-emerald-700">Total Spent</p>
                                <p className="text-2xl font-bold text-emerald-900">${customer.totalSpent?.toFixed(2) || "0.00"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-purple-700">Customer Since</p>
                                <p className="text-lg font-bold text-purple-900">{customer.customerSince}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-orange-700">Last Order</p>
                                <p className="text-sm font-bold text-orange-900">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "No orders yet"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Customer Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Contact Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                Contact Information
                            </h2>
                        </div>

                        <div className="p-6">
                            {customer.email || customer.phone ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {customer.email && (
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                                                    <p className="font-bold text-gray-900">{customer.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {customer.phone && (
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                                    <Phone className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                                                    <p className="font-bold text-gray-900">{customer.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No contact information on file</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                    <MapPin className="w-4 h-4 text-white" />
                                </div>
                                Addresses
                            </h2>
                        </div>

                        <div className="p-6">
                            {customer.addresses && customer.addresses.length > 0 ? (
                                <div className="space-y-4">
                                    {customer.addresses.map((address, index) => (
                                        <div key={index} className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="w-5 h-5 text-gray-500" />
                                                    <span className="font-semibold text-gray-900">{address.type === "default" ? "Default Address" : "Additional Address"}</span>
                                                </div>
                                                {address.type === "default" && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Primary</span>}
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{formatAddress(address)}</p>
                                            {address.phone && (
                                                <p className="text-sm text-gray-500 mt-2 flex items-center">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    {address.phone}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No addresses on file</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                                        <Package className="w-4 h-4 text-white" />
                                    </div>
                                    Recent Orders
                                </h2>
                            </div>
                        </div>

                        <div className="p-6">
                            {ordersLoading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner />
                                </div>
                            ) : recentOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {recentOrders.map((order) => (
                                        <div key={order.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleViewOrder(order.id)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Order #{order.id}</p>
                                                        <p className="text-sm text-gray-600">{order.formattedDate}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{order.formattedTotal}</p>
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus.toLowerCase() === "complete" ? "bg-green-100 text-green-800" : order.orderStatus.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>{order.orderStatus}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No orders found for this customer</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Payment Methods & Activity */}
                <div className="space-y-8">
                    {/* Payment Methods */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                    <CreditCard className="w-4 h-4 text-white" />
                                </div>
                                Payment Methods
                            </h2>
                        </div>

                        <div className="p-6">
                            {customer.paymentMethods && customer.paymentMethods.length > 0 ? (
                                <div className="space-y-3">
                                    {customer.paymentMethods.map((method, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <CreditCard className="w-4 h-4 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{method.name}</p>
                                                        {method.mask && <p className="text-sm text-gray-500">•••• {method.mask}</p>}
                                                        {method.brand && <p className="text-xs text-gray-400 uppercase">{method.brand}</p>}
                                                    </div>
                                                </div>
                                                {method.isDefault && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Default</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No payment methods on file</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Status */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                                    <Activity className="w-4 h-4 text-white" />
                                </div>
                                Account Status
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(customer.isActive)}`}>{customer.isActive ? "Active" : "Inactive"}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Customer ID</span>
                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{customer.id}</span>
                            </div>

                            {customer.merchantId && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Merchant ID</span>
                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{customer.merchantId}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Date Created</span>
                                <span className="text-sm text-gray-900">{new Date(customer.dateCreated).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsPage;
