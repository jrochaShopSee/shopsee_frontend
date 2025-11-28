"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { settingsApi } from "@/app/services/settingsApi";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { DollarSign, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

const currencySchema = z.object({
    currencyName: z.string().min(1, "Currency name is required"),
    currencyCode: z.string().min(1, "Currency code is required").max(10, "Currency code must be 10 characters or less"),
    isActive: z.boolean(),
});

type CurrencyFormData = z.infer<typeof currencySchema>;

interface EditCurrencyPageProps {
    id: string;
}

export default function EditCurrencyPage({ id }: EditCurrencyPageProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CurrencyFormData>({
        resolver: zodResolver(currencySchema),
        defaultValues: {
            currencyName: "",
            currencyCode: "",
            isActive: true,
        },
    });

    useEffect(() => {
        const loadCurrency = async () => {
            try {
                const currency = await settingsApi.getCurrencyById(parseInt(id));
                reset({
                    currencyName: currency.currencyName,
                    currencyCode: currency.currencyCode,
                    isActive: currency.isActive,
                });
            } catch (error: unknown) {
                const errorMessage = error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data?.message
                    : undefined;
                toast.error(errorMessage || "Failed to load currency");
                router.push("/cms/admin/settings/currency");
            } finally {
                setIsLoading(false);
            }
        };

        loadCurrency();
    }, [id, reset, router]);

    const onSubmit = async (data: CurrencyFormData) => {
        setIsSubmitting(true);
        try {
            const result = await settingsApi.updateCurrency(parseInt(id), {
                id: parseInt(id),
                ...data,
            });
            toast.success(result.message || "Currency updated successfully");
            router.push("/cms/admin/settings/currency");
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data?.message
                : undefined;
            toast.error(errorMessage || "Failed to update currency");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/cms/admin/settings/currency");
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
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Currencies
                    </button>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Currency</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Update currency information
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Currency Name <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("currencyName")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., US Dollar"
                                />
                                {errors.currencyName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.currencyName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Currency Code <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("currencyCode")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., USD"
                                    maxLength={10}
                                />
                                {errors.currencyCode && (
                                    <p className="mt-1 text-sm text-red-600">{errors.currencyCode.message}</p>
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
