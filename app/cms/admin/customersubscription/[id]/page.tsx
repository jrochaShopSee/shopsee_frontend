"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { customerSubscriptionApi } from "@/app/services/customerSubscriptionApi";
import { CustomerSubscriptionDetail, SubscriptionHistoryEntry } from "@/app/types/CustomerSubscription";
import { ArrowLeft, User, Mail, Calendar, DollarSign, Activity, FileText } from "lucide-react";

const CustomerSubscriptionDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [detail, setDetail] = useState<CustomerSubscriptionDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<boolean>(false);

    const loadDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await customerSubscriptionApi.getDetail(id);
            setDetail(data);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("Error loading detail");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) loadDetail();
    }, [id, loadDetail]);

    const handleStatusChange = async (enable: boolean) => {
        setUpdating(true);
        try {
            await customerSubscriptionApi.updateStatus(id, enable);
            toast.success(`Subscription ${enable ? "enabled" : "disabled"}`);
            await loadDetail();
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !detail) {
        return <div className="p-6 max-w-7xl mx-auto text-red-600">{error || "Not found"}</div>;
    }

    const { customerSubscription, company, paymentAddress, history } = detail as CustomerSubscriptionDetail;

    // Helper for status badge
    const getStatusColor = (isActive: boolean) => (isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800");

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Button onClick={() => router.push("/cms/admin/customersubscription")} variant="outline" className="flex items-center space-x-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Subscriptions</span>
                </Button>
                <div className={`px-6 py-3 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(customerSubscription.active)}`}>{customerSubscription.active ? "Active" : "Inactive"}</div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-purple-700">Subscription</p>
                            <p className="text-lg font-bold text-purple-900">{customerSubscription.subscriptionName}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-700">Sign-up Date</p>
                            <p className="text-lg font-bold text-blue-900">{customerSubscription.orderDate ? new Date(customerSubscription.orderDate).toLocaleDateString() : "-"}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-700">Recurring Amount</p>
                            <p className="text-lg font-bold text-green-900">${customerSubscription.recurringCost}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Subscription & Customer Info */}
                <div className="md:col-span-2 space-y-8">
                    {/* Subscription Details */}
                    <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <User className="w-5 h-5 text-purple-500 mr-2" />
                                Subscription Details
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-gray-600 mb-1">Subscription</p>
                                <p className="font-bold text-gray-900">{customerSubscription.subscriptionName}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Sign-up Date</p>
                                <p className="font-bold text-gray-900">{customerSubscription.orderDate ? new Date(customerSubscription.orderDate).toLocaleDateString() : "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Renewal Date</p>
                                <p className="font-bold text-gray-900">{customerSubscription.renewalDate ? new Date(customerSubscription.renewalDate).toLocaleDateString() : "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Active</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(customerSubscription.active)}`}>{customerSubscription.activeDisplay}</span>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Max Videos</p>
                                <p className="font-bold text-gray-900">{customerSubscription.numberOfVideos}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Max Products/Video</p>
                                <p className="font-bold text-gray-900">{customerSubscription.numberOfProductsPerVideo}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Payment Method</p>
                                <p className="font-bold text-gray-900">{customerSubscription.paymentMethod}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Customer Info */}
                    <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Mail className="w-5 h-5 text-blue-500 mr-2" />
                                Customer Information
                            </h2>
                        </div>
                        <div className="p-6 space-y-2 text-sm">
                            <div className="font-bold text-gray-900">{company?.name}</div>
                            <div>{paymentAddress && (paymentAddress.contactFirstName || paymentAddress.contactLastName) ? `${paymentAddress.contactFirstName ?? ""} ${paymentAddress.contactLastName ?? ""}`.trim() : ""}</div>
                            <div>
                                {paymentAddress?.streetAddress} {paymentAddress?.streetAddress2}
                            </div>
                            <div>
                                {paymentAddress?.city}, {paymentAddress?.state} {paymentAddress?.zip}
                            </div>
                            <div>{paymentAddress?.phone}</div>
                            <div>
                                <a href={`mailto:${paymentAddress?.email}`}>{paymentAddress?.email}</a>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Actions & History */}
                <div className="space-y-8">
                    {/* Actions */}
                    <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Activity className="w-5 h-5 text-green-500 mr-2" />
                                Actions
                            </h2>
                        </div>
                        <div className="p-6 flex flex-col gap-2">
                            {customerSubscription.active ? (
                                <Button variant="destructive" onClick={() => handleStatusChange(false)} disabled={updating}>
                                    {updating ? (
                                        <span className="flex items-center">
                                            <LoadingSpinner />
                                            &nbsp;Disabling...
                                        </span>
                                    ) : (
                                        "Disable Subscription"
                                    )}
                                </Button>
                            ) : (
                                <Button variant="default" onClick={() => handleStatusChange(true)} disabled={updating}>
                                    {updating ? (
                                        <span className="flex items-center">
                                            <LoadingSpinner />
                                            &nbsp;Enabling...
                                        </span>
                                    ) : (
                                        "Enable Subscription"
                                    )}
                                </Button>
                            )}
                        </div>
                    </Card>

                    {/* Subscription History */}
                    <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <FileText className="w-5 h-5 text-orange-500 mr-2" />
                                Subscription History
                            </h2>
                        </div>
                        <div className="overflow-x-auto p-6">
                            <table className="table-auto w-full text-sm">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history && history.length > 0 ? (
                                        history.map((h: SubscriptionHistoryEntry, idx: number) => (
                                            <tr key={idx} className="border-b last:border-b-0">
                                                <td>{h.date ? new Date(h.date).toLocaleDateString() : "-"}</td>
                                                <td>{typeof h.amount === "number" ? `$${h.amount}` : "-"}</td>
                                                <td>{h.status || "-"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center text-gray-400 py-6">
                                                No history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CustomerSubscriptionDetailPage;
