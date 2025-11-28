"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { settingsApi } from "@/app/services/settingsApi";
import { Capability } from "@/app/types/Role";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { ArrowLeft, Shield, Edit2, Save, X } from "lucide-react";

interface RoleCapabilitiesPageProps {
    id: string;
}

const RoleCapabilitiesPage: React.FC<RoleCapabilitiesPageProps> = ({ id }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [roleName, setRoleName] = useState("");

    const [allCapabilities, setAllCapabilities] = useState<Capability[]>([]);
    const [roleCapabilities, setRoleCapabilities] = useState<Capability[]>([]);
    const [selectedCapabilityIds, setSelectedCapabilityIds] = useState<number[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load role info
                const role = await settingsApi.getRoleById(parseInt(id));
                setRoleName(role.name);

                // Load all capabilities and role's current capabilities in parallel
                const [allCaps, roleCaps] = await Promise.all([
                    settingsApi.getAllCapabilities(),
                    settingsApi.getRoleCapabilities(parseInt(id)),
                ]);

                setAllCapabilities(allCaps);
                setRoleCapabilities(roleCaps);
                setSelectedCapabilityIds(roleCaps.map((c) => c.capabilityId));
            } catch (error) {
                toast.error("Failed to load capabilities");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleToggleCapability = (capabilityId: number) => {
        setSelectedCapabilityIds((prev) => {
            if (prev.includes(capabilityId)) {
                return prev.filter((id) => id !== capabilityId);
            } else {
                return [...prev, capabilityId];
            }
        });
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            await settingsApi.updateRoleCapabilities(parseInt(id), {
                roleId: parseInt(id),
                capabilityIds: selectedCapabilityIds,
            });
            toast.success("Capabilities updated successfully");

            // Reload role capabilities
            const updatedCaps = await settingsApi.getRoleCapabilities(parseInt(id));
            setRoleCapabilities(updatedCaps);
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update capabilities");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Reset to original selected capabilities
        setSelectedCapabilityIds(roleCapabilities.map((c) => c.capabilityId));
        setIsEditing(false);
    };

    const handleStartEdit = () => {
        setIsEditing(true);
    };

    if (loading) {
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
                <button
                    onClick={() => router.push("/cms/admin/settings/roles")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Roles
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Role Capabilities - {roleName}
                </h1>
                <p className="text-gray-600">
                    Manage permissions and capabilities for this role
                </p>
            </div>

            {/* Current Capabilities (View Mode) */}
            {!isEditing && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Shield className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Current Capabilities
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {roleCapabilities.length} capabilities assigned
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleStartEdit}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit Capabilities
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        {roleCapabilities.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No capabilities assigned to this role
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {roleCapabilities.map((capability) => (
                                    <div
                                        key={capability.capabilityId}
                                        className="p-3 bg-green-50 border border-green-200 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {capability.capabilityName}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Mode - All Capabilities with Checkboxes */}
            {isEditing && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Select Capabilities
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Choose which capabilities to assign to this role
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {allCapabilities.map((capability) => {
                                const isSelected = selectedCapabilityIds.includes(
                                    capability.capabilityId
                                );
                                return (
                                    <label
                                        key={capability.capabilityId}
                                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                                            isSelected
                                                ? "bg-purple-50 border-purple-300"
                                                : "bg-white border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() =>
                                                handleToggleCapability(
                                                    capability.capabilityId
                                                )
                                            }
                                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <Shield
                                            className={`h-5 w-5 ${
                                                isSelected
                                                    ? "text-purple-600"
                                                    : "text-gray-400"
                                            }`}
                                        />
                                        <span
                                            className={`text-sm font-medium flex-1 ${
                                                isSelected
                                                    ? "text-gray-900"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {capability.capabilityName}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleCancel}
                                disabled={submitting}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={submitting}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <LoadingSpinner />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleCapabilitiesPage;
