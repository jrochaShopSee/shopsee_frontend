"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { settingsApi } from "@/app/services/settingsApi";
import { EcommerceStatus } from "@/app/types/Role";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { AlertCircle, Mail, UserCog, Building2, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const EcommerceStatusPage: React.FC = () => {
    const router = useRouter();
    const [statuses, setStatuses] = useState<EcommerceStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const loadStatuses = useCallback(
        async (reset = false) => {
            if (loading && !reset) return;

            setLoading(true);
            try {
                const skip = reset ? 0 : statuses.length;
                const response = await settingsApi.getEcommerceStatuses({
                    skip,
                    take: 50,
                    search: searchTerm,
                });

                if (reset) {
                    setStatuses(response.data);
                } else {
                    setStatuses((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
            } catch (error) {
                toast.error("Failed to load ecommerce statuses");
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [statuses.length, searchTerm]
    );

    useEffect(() => {
        loadStatuses(true);
    }, [searchTerm]);

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            await settingsApi.toggleEcommerceStatusStatus(id);
            toast.success(`Status ${currentStatus ? "deactivated" : "activated"} successfully`);

            // Update local state
            setStatuses((prev) =>
                prev.map((status) =>
                    status.id === id ? { ...status, isActive: !currentStatus } : status
                )
            );
        } catch (error) {
            toast.error("Failed to toggle status");
            console.error(error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id: number, statusName: string) => {
        if (!confirm(`Are you sure you want to delete "${statusName}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(id);
        try {
            await settingsApi.deleteEcommerceStatus(id);
            toast.success("Status deleted successfully");
            loadStatuses(true);
        } catch (error) {
            toast.error("Failed to delete status");
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/cms/admin/settings/ecommerce-status/edit/${id}`);
    };

    const handleAddNew = () => {
        router.push("/cms/admin/settings/ecommerce-status/add");
    };

    const renderStatusItem = (index: number, status: EcommerceStatus) => {
        const isDeleting = deletingId === status.id;
        const isToggling = togglingId === status.id;

        return (
            <div
                key={status.id}
                className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-center gap-3">
                        <div className={`p-2 ${status.isActive ? 'bg-green-100' : 'bg-gray-100'} rounded-lg`}>
                            <AlertCircle className={`h-5 w-5 ${status.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {status.statusName}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                    status.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}>
                                    {status.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                {status.emailTriggered && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        <Mail className="w-3 h-3" />
                                        Customer Email
                                    </span>
                                )}
                                {status.adminEmailTriggered && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                        <UserCog className="w-3 h-3" />
                                        Admin Email
                                    </span>
                                )}
                                {status.companyEmailTriggered && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                        <Building2 className="w-3 h-3" />
                                        Company Email
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={status.isActive}
                                onChange={() => handleToggleStatus(status.id, status.isActive)}
                                disabled={isToggling || isDeleting}
                                className="sr-only"
                            />
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                status.isActive ? 'bg-green-600' : 'bg-gray-300'
                            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    status.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </div>
                        </label>
                        <button
                            onClick={() => handleEdit(status.id)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(status.id, status.statusName)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <LoadingSpinner />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && statuses.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Ecommerce Status Management
                    </h1>
                    <p className="text-gray-600">
                        Manage order statuses and configure email notifications
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Add New Status
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search statuses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="text-sm text-gray-600">
                        Total: {totalCount} statuses
                    </div>
                </div>
            </div>

            {/* Statuses List */}
            <InfiniteScrollList
                data={statuses}
                loading={loading}
                hasMore={hasMore}
                endReached={() => loadStatuses(false)}
                itemContent={renderStatusItem}
                emptyIcon={<AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                emptyTitle="No Statuses Found"
                emptyMessage="Get started by adding your first ecommerce status"
                height={600}
                footerLoading={<LoadingSpinner />}
            />

            {/* Legend */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Email Notification Types:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span><strong>Customer Email</strong> - Sent to customer when order reaches this status</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <UserCog className="w-4 h-4 text-purple-600" />
                        <span><strong>Admin Email</strong> - Sent to administrators when order reaches this status</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span><strong>Company Email</strong> - Sent to company contacts when order reaches this status</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EcommerceStatusPage;
