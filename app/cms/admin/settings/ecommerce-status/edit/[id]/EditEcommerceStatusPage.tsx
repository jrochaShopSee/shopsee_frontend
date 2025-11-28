"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { settingsApi } from "@/app/services/settingsApi";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { AlertCircle, ArrowLeft, Mail, UserCog, Building2 } from "lucide-react";
import { toast } from "react-toastify";

const ecommerceStatusSchema = z.object({
    statusName: z.string().min(1, "Status name is required"),
    isActive: z.boolean(),
    emailTriggered: z.boolean(),
    emailSubject: z.string(),
    emailMessage: z.string(),
    adminEmailTriggered: z.boolean(),
    adminEmailSubject: z.string(),
    adminEmailMessage: z.string(),
    companyEmailTriggered: z.boolean(),
    companyEmailSubject: z.string(),
    companyEmailMessage: z.string(),
});

type EcommerceStatusFormData = z.infer<typeof ecommerceStatusSchema>;

interface EditEcommerceStatusPageProps {
    id: string;
}

export default function EditEcommerceStatusPage({ id }: EditEcommerceStatusPageProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<EcommerceStatusFormData>({
        resolver: zodResolver(ecommerceStatusSchema),
        defaultValues: {
            statusName: "",
            isActive: true,
            emailTriggered: false,
            emailSubject: "",
            emailMessage: "",
            adminEmailTriggered: false,
            adminEmailSubject: "",
            adminEmailMessage: "",
            companyEmailTriggered: false,
            companyEmailSubject: "",
            companyEmailMessage: "",
        },
    });

    const emailTriggered = watch("emailTriggered");
    const adminEmailTriggered = watch("adminEmailTriggered");
    const companyEmailTriggered = watch("companyEmailTriggered");

    useEffect(() => {
        const loadStatus = async () => {
            try {
                const status = await settingsApi.getEcommerceStatusById(parseInt(id));
                reset({
                    statusName: status.statusName,
                    isActive: status.isActive,
                    emailTriggered: status.emailTriggered,
                    emailSubject: status.emailSubject || "",
                    emailMessage: status.emailMessage || "",
                    adminEmailTriggered: status.adminEmailTriggered,
                    adminEmailSubject: status.adminEmailSubject || "",
                    adminEmailMessage: status.adminEmailMessage || "",
                    companyEmailTriggered: status.companyEmailTriggered,
                    companyEmailSubject: status.companyEmailSubject || "",
                    companyEmailMessage: status.companyEmailMessage || "",
                });
            } catch (error: unknown) {
                const errorMessage = error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data?.message
                    : undefined;
                toast.error(errorMessage || "Failed to load status");
                router.push("/cms/admin/settings/ecommerce-status");
            } finally {
                setIsLoading(false);
            }
        };

        loadStatus();
    }, [id, reset, router]);

    const onSubmit = async (data: EcommerceStatusFormData) => {
        setIsSubmitting(true);
        try {
            const result = await settingsApi.updateEcommerceStatus(parseInt(id), {
                id: parseInt(id),
                ...data,
            });
            toast.success(result.message || "Status updated successfully");
            router.push("/cms/admin/settings/ecommerce-status");
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data?.message
                : undefined;
            toast.error(errorMessage || "Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/cms/admin/settings/ecommerce-status");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Ecommerce Statuses
                    </button>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Ecommerce Status</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Update order status and email notification settings
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status Name <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("statusName")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter status name"
                                />
                                {errors.statusName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.statusName.message}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("isActive")}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="text-sm font-medium text-gray-700">Active</label>
                            </div>
                        </div>
                    </div>

                    {/* Customer Email Notification */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Customer Email Notification</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("emailTriggered")}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Send email to customer when order reaches this status
                                </label>
                            </div>

                            {emailTriggered && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Subject
                                        </label>
                                        <input
                                            type="text"
                                            {...register("emailSubject")}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter email subject"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Message
                                        </label>
                                        <textarea
                                            {...register("emailMessage")}
                                            rows={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter email message"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Admin Email Notification */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <UserCog className="w-5 h-5 text-purple-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Admin Email Notification</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("adminEmailTriggered")}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Send email to administrators when order reaches this status
                                </label>
                            </div>

                            {adminEmailTriggered && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Admin Email Subject
                                        </label>
                                        <input
                                            type="text"
                                            {...register("adminEmailSubject")}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Enter admin email subject"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Admin Email Message
                                        </label>
                                        <textarea
                                            {...register("adminEmailMessage")}
                                            rows={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Enter admin email message"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Company Email Notification */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Company Email Notification</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("companyEmailTriggered")}
                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Send email to company contacts when order reaches this status
                                </label>
                            </div>

                            {companyEmailTriggered && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Email Subject
                                        </label>
                                        <input
                                            type="text"
                                            {...register("companyEmailSubject")}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            placeholder="Enter company email subject"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Email Message
                                        </label>
                                        <textarea
                                            {...register("companyEmailMessage")}
                                            rows={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            placeholder="Enter company email message"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <LoadingSpinner />}
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
