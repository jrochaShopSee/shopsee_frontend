"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, MapPin, ShoppingBag, Calendar, Mail, Phone, Edit } from "lucide-react";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import axiosClient from "@/app/utils/axiosClient";

interface Address {
    id: number;
    addressName: string;
    streetAddress: string;
    streetAddress2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
}

interface AccountData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    signUp: string;
    image?: string;
    address?: Address;
    recentOrdersCount: number;
    totalOrdersCount: number;
}

export default function AccountPage() {
    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAccountData = async () => {
            try {
                const response = await axiosClient.get<AccountData>("/api/shop/account");
                setAccountData(response.data);
            } catch (error) {
                console.error("Failed to load account data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAccountData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!accountData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load account data</h2>
                    <p className="text-gray-600">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
                <p className="text-gray-600">
                    Hello{" "}
                    <Link href="/shop/profile" className="text-primary hover:underline font-medium">
                        {accountData.firstName} {accountData.lastName}
                    </Link>{" "}
                    (not {accountData.firstName}?{" "}
                    <Link href="/" className="text-primary hover:underline">
                        Sign out
                    </Link>
                    )
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-violet-100 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-violet-600" />
                        </div>
                        <Link
                            href="/shop/orders"
                            className="text-sm text-primary hover:underline"
                        >
                            View All
                        </Link>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{accountData.totalOrdersCount}</h3>
                    <p className="text-sm text-gray-600">Total Orders</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <Link
                            href="/shop/addresses"
                            className="text-sm text-primary hover:underline"
                        >
                            Manage
                        </Link>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                        {accountData.address ? "1" : "0"}
                    </h3>
                    <p className="text-sm text-gray-600">Saved Addresses</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{accountData.signUp}</h3>
                    <p className="text-sm text-gray-600">Member Since</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Info Card */}
                <div className="bg-white rounded-lg shadow border border-gray-200">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <User className="w-5 h-5 mr-2 text-violet-600" />
                            Profile Information
                        </h2>
                        <Link
                            href="/shop/profile"
                            className="text-sm text-primary hover:underline flex items-center"
                        >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                        </Link>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start space-x-4 mb-6">
                            {accountData.image ? (
                                <img
                                    src={accountData.image}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center border-2 border-gray-200">
                                    <User className="w-10 h-10 text-violet-600" />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {accountData.firstName} {accountData.lastName}
                                </h3>
                                <p className="text-sm text-gray-600">Customer</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {accountData.email && (
                                <div className="flex items-center text-sm">
                                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                                    <a
                                        href={`mailto:${accountData.email}`}
                                        className="text-gray-700 hover:text-primary"
                                    >
                                        {accountData.email}
                                    </a>
                                </div>
                            )}
                            {accountData.phone && (
                                <div className="flex items-center text-sm">
                                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="text-gray-700">{accountData.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Default Address Card */}
                <div className="bg-white rounded-lg shadow border border-gray-200">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-violet-600" />
                            Default Address
                        </h2>
                        <Link
                            href="/shop/addresses"
                            className="text-sm text-primary hover:underline flex items-center"
                        >
                            <Edit className="w-4 h-4 mr-1" />
                            Manage
                        </Link>
                    </div>
                    <div className="p-6">
                        {accountData.address ? (
                            <div className="space-y-2">
                                <p className="font-semibold text-gray-900">{accountData.address.addressName}</p>
                                <p className="text-sm text-gray-700">{accountData.address.streetAddress}</p>
                                {accountData.address.streetAddress2 && (
                                    <p className="text-sm text-gray-700">{accountData.address.streetAddress2}</p>
                                )}
                                <p className="text-sm text-gray-700">
                                    {accountData.address.city}, {accountData.address.state} {accountData.address.zip}
                                </p>
                                <p className="text-sm text-gray-700">{accountData.address.country}</p>
                                {accountData.address.phone && (
                                    <p className="text-sm text-gray-700 mt-3">
                                        <Phone className="w-4 h-4 inline mr-2 text-gray-400" />
                                        {accountData.address.phone}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4">No default address set</p>
                                <Link
                                    href="/shop/addresses"
                                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Add Address
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="mt-6 bg-white rounded-lg shadow border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <ShoppingBag className="w-5 h-5 mr-2 text-violet-600" />
                        Recent Orders
                    </h2>
                    {accountData.totalOrdersCount > 0 && (
                        <Link
                            href="/shop/orders"
                            className="text-sm text-primary hover:underline"
                        >
                            View All Orders
                        </Link>
                    )}
                </div>
                <div className="p-6">
                    {accountData.totalOrdersCount > 0 ? (
                        <div className="text-center py-8">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 mb-4">
                                You have {accountData.totalOrdersCount} order{accountData.totalOrdersCount !== 1 ? "s" : ""}
                            </p>
                            <Link
                                href="/shop/orders"
                                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                View Order History
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 mb-4">No orders yet</p>
                            <p className="text-sm text-gray-500">Start shopping to see your orders here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
