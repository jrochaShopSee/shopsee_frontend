"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { settingsApi } from "@/app/services/settingsApi";
import { UpdateStateRequest, CountryDropdownItem } from "@/app/types/Role";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { ArrowLeft, MapPin, AlertTriangle } from "lucide-react";

interface EditStatePageProps {
    countryId: string;
    stateId: string;
}

const EditStatePage: React.FC<EditStatePageProps> = ({ countryId, stateId }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [countries, setCountries] = useState<CountryDropdownItem[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<UpdateStateRequest>();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [state, countryList] = await Promise.all([
                    settingsApi.getStateById(parseInt(stateId)),
                    settingsApi.getCountriesDropdown(),
                ]);

                setValue("id", state.id);
                setValue("stateName", state.stateName);
                setValue("abbreviation", state.abbreviation);
                setValue("countryId", state.countryId);
                setValue("order", state.order);
                setValue("isActive", state.isActive);
                setCountries(countryList);
            } catch (error) {
                toast.error("Failed to load state");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [stateId, setValue]);

    const onSubmit = async (data: UpdateStateRequest) => {
        setSubmitting(true);
        try {
            await settingsApi.updateState(parseInt(stateId), data);
            toast.success("State updated successfully");
            router.push(`/cms/admin/settings/countries/${countryId}/states`);
        } catch (error) {
            toast.error("Failed to update state");
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
                    onClick={() => router.push(`/cms/admin/settings/countries/${countryId}/states`)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to States
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Edit State
                </h1>
                <p className="text-gray-600">Update state or province information</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                State Information
                            </h2>
                            <p className="text-sm text-gray-600">
                                Modify the state or province details
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* State Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            State/Province Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("stateName", {
                                required: "State name is required",
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.stateName && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.stateName.message}
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
                            {...register("abbreviation", {
                                required: "Abbreviation is required",
                            })}
                            maxLength={10}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.abbreviation && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.abbreviation.message}
                            </div>
                        )}
                        <p className="mt-2 text-sm text-gray-500">
                            Usually 2-3 letter state code
                        </p>
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register("countryId", {
                                required: "Country is required",
                                valueAsNumber: true,
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a country</option>
                            {countries.map((country) => (
                                <option key={country.value} value={country.value}>
                                    {country.text}
                                </option>
                            ))}
                        </select>
                        {errors.countryId && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.countryId.message}
                            </div>
                        )}
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
                            Active (State is available for use)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.push(`/cms/admin/settings/countries/${countryId}/states`)}
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

export default EditStatePage;
