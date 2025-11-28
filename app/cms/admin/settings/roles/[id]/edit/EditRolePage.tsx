"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { settingsApi } from "@/app/services/settingsApi";
import { UpdateRoleRequest } from "@/app/types/Role";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";

interface EditRolePageProps {
    id: string;
}

const EditRolePage: React.FC<EditRolePageProps> = ({ id }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<UpdateRoleRequest>();

    useEffect(() => {
        const loadRole = async () => {
            try {
                const role = await settingsApi.getRoleById(parseInt(id));
                setValue("roleId", role.roleId);
                setValue("name", role.name);
                setValue("description", role.description);
                setValue("order", role.order);
                setValue("isActive", role.isActive);
            } catch (error) {
                toast.error("Failed to load role");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadRole();
    }, [id, setValue]);

    const onSubmit = async (data: UpdateRoleRequest) => {
        setSubmitting(true);
        try {
            await settingsApi.updateRole(parseInt(id), data);
            toast.success("Role updated successfully");
            router.push("/cms/admin/settings/roles");
        } catch (error) {
            toast.error("Failed to update role");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.push("/cms/admin/settings/roles")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Roles
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Role</h1>
                <p className="text-gray-600">Update role information</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Role Information
                            </h2>
                            <p className="text-sm text-gray-600">
                                Configure role settings and status
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register("name", {
                                required: "Name is required",
                            })}
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {errors.name && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.name.message}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            {...register("description")}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Order
                        </label>
                        <input
                            {...register("order", {
                                valueAsNumber: true,
                            })}
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Display order (lower numbers appear first)
                        </p>
                    </div>

                    {/* Is Active */}
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                {...register("isActive")}
                                type="checkbox"
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Active
                            </span>
                        </label>
                        <p className="mt-1 text-sm text-gray-500 ml-6">
                            Inactive roles cannot be assigned to users
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.push("/cms/admin/settings/roles")}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <LoadingSpinner />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRolePage;
