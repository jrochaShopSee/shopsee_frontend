"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { settingsApi } from "@/app/services/settingsApi";
import { UpdateCountryRequest } from "@/app/types/Role";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { ArrowLeft, Globe, AlertTriangle } from "lucide-react";

interface EditCountryPageProps {
    id: string;
}

const EditCountryPage: React.FC<EditCountryPageProps> = ({ id }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<UpdateCountryRequest>();

    useEffect(() => {
        const loadCountry = async () => {
            try {
                const country = await settingsApi.getCountryById(parseInt(id));
                setValue("id", country.id);
                setValue("countryName", country.countryName);
                setValue("abbr", country.abbr);
                setValue("order", country.order);
                setValue("isActive", country.isActive);
            } catch (error) {
                toast.error("Failed to load country");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadCountry();
    }, [id, setValue]);

    const onSubmit = async (data: UpdateCountryRequest) => {
        setSubmitting(true);
        try {
            await settingsApi.updateCountry(parseInt(id), data);
            toast.success("Country updated successfully");
            router.push("/cms/admin/settings/countries");
        } catch (error) {
            toast.error("Failed to update country");
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
                    onClick={() => router.push("/cms/admin/settings/countries")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Countries
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Edit Country
                </h1>
                <p className="text-gray-600">Update country information</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Globe className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Country Information
                            </h2>
                            <p className="text-sm text-gray-600">
                                Modify the country details
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Country Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("countryName", {
                                required: "Country name is required",
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.countryName && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.countryName.message}
                            </div>
                        )}
                    </div>

                    {/* Abbreviation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Abbreviation <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("abbr", {
                                required: "Abbreviation is required",
                            })}
                            maxLength={10}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.abbr && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.abbr.message}
                            </div>
                        )}
                        <p className="mt-2 text-sm text-gray-500">
                            Usually 2-3 letter country code (ISO 3166)
                        </p>
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Order
                        </label>
                        <input
                            type="number"
                            {...register("order", {
                                valueAsNumber: true,
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            Lower numbers appear first in lists
                        </p>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="isActive"
                            {...register("isActive")}
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Active (Country is available for use)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.push("/cms/admin/settings/countries")}
                            disabled={submitting}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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

export default EditCountryPage;
