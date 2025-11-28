"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { settingsApi } from "@/app/services/settingsApi";
import { Role } from "@/app/types/Role";
import { toast } from "react-toastify";
import { Search, Shield, Edit2, CheckCircle, XCircle } from "lucide-react";

const RolesPage: React.FC = () => {
    const router = useRouter();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalCount, setTotalCount] = useState(0);

    const loadRoles = useCallback(
        async (reset = false) => {
            if (loading && !reset) return;

            setLoading(true);
            try {
                const skip = reset ? 0 : roles.length;
                const response = await settingsApi.getRoles({
                    skip,
                    take: 50,
                    search: searchTerm,
                });

                if (reset) {
                    setRoles(response.data);
                } else {
                    setRoles((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
            } catch (error) {
                toast.error("Failed to load roles");
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [roles.length, searchTerm]
    );

    useEffect(() => {
        loadRoles(true);
    }, [searchTerm]);

    const handleEditRole = (roleId: number) => {
        router.push(`/cms/admin/settings/roles/${roleId}/edit`);
    };

    const handleManageCapabilities = (roleId: number) => {
        router.push(`/cms/admin/settings/roles/${roleId}/capabilities`);
    };

    const renderRoleItem = (index: number, role: Role) => {
        return (
            <div
                key={role.roleId}
                className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {role.name}
                                </h3>
                                {role.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {role.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 ml-14">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Order:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {role.order}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {role.isActive ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-600 font-medium">
                                            Active
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <span className="text-sm text-red-600 font-medium">
                                            Inactive
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEditRole(role.roleId)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => handleManageCapabilities(role.roleId)}
                            className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2"
                        >
                            <Shield className="h-4 w-4" />
                            Capabilities
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && roles.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Roles</h1>
                <p className="text-gray-600">
                    Manage system roles and their permissions
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search roles by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div className="text-sm text-gray-600">
                        Total: {totalCount} roles
                    </div>
                </div>
            </div>

            {/* Roles List */}
            <InfiniteScrollList
                data={roles}
                loading={loading}
                hasMore={hasMore}
                endReached={() => loadRoles(false)}
                itemContent={renderRoleItem}
                emptyIcon={<Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                emptyTitle="No Roles Found"
                emptyMessage="No roles match your search criteria"
                height={600}
                footerLoading={<LoadingSpinner />}
            />
        </div>
    );
};

export default RolesPage;
