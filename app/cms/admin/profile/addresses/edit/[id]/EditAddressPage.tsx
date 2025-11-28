"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { profileApi } from "@/app/services/profileApi";
import { AddEditAddressViewModel, AddressFormData, Address } from "@/app/types/Profile";
import { ArrowLeft, Save, MapPin, User, Building2, AlertTriangle, Home } from "lucide-react";

interface EditAddressPageProps {
    id: string;
}

const EditAddressPage: React.FC<EditAddressPageProps> = ({ id }) => {
    const router = useRouter();
    const [formData, setFormData] = useState<AddressFormData | null>(null);
    const [address, setAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<AddEditAddressViewModel>();

    const addressType = watch("addressType");
    const selectedCountry = watch("country");

    // Load form data and address details
    useEffect(() => {
        const loadData = async () => {
            try {
                const [formDataRes, addressRes] = await Promise.all([
                    profileApi.getAddressFormData(),
                    profileApi.getAddress(parseInt(id))
                ]);

                setFormData(formDataRes);
                setAddress(addressRes);

                // Set form values from existing address
                setValue("id", addressRes.id);
                setValue("firstName", addressRes.firstName || "");
                setValue("lastName", addressRes.lastName || "");
                setValue("company", addressRes.company || "");
                setValue("streetAddress", addressRes.streetAddress || "");
                setValue("streetAddress2", addressRes.streetAddress2 || "");
                setValue("city", addressRes.city || "");
                setValue("state", addressRes.state || "");
                setValue("zip", addressRes.zip || "");
                setValue("country", addressRes.country || "189");
                setValue("phone", addressRes.phone || "");
                setValue("email", addressRes.email || "");
                setValue("isPrimary", addressRes.isPrimary || false);
                // Determine address type based on whether company field exists
                setValue("addressType", addressRes.company ? "Company" : "Customer");
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load address");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, setValue]);

    // Format phone number based on country mask
    const formatPhoneNumber = (phoneNumber: string, mask: string) => {
        let formattedNumber = "";
        let digitIndex = 0;
        for (let i = 0; i < mask.length; i++) {
            if (digitIndex >= phoneNumber.length) {
                break;
            }
            if (mask[i] === "X") {
                formattedNumber += phoneNumber[digitIndex];
                digitIndex++;
            } else {
                formattedNumber += mask[i];
            }
        }
        return formattedNumber;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const phoneNumber = value.replace(/\D/g, "");

        const country = formData?.countriesWithMasks.find((c) => c.id.toString() === selectedCountry);
        if (country?.cellPhoneMask) {
            const formatted = formatPhoneNumber(phoneNumber, country.cellPhoneMask);
            setValue("phone", formatted);
        } else {
            setValue("phone", phoneNumber);
        }
    };

    const onSubmit = async (data: AddEditAddressViewModel) => {
        setSubmitting(true);
        try {
            await profileApi.updateAddress(parseInt(id), data);
            toast.success("Address updated successfully");
            router.push("/cms/admin/profile/addresses");
        } catch (err) {
            console.error("Error updating address:", err);
            toast.error(err instanceof Error ? err.message : "Failed to update address");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                    <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                        Try Again
                    </Button>
                </div>
            </Card>
        );
    }

    if (!formData || !address) return null;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/cms/admin/profile/addresses")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Address</h1>
                    <p className="text-gray-600">Update address information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Address Type Section */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                {addressType === "Company" ? (
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                ) : (
                                    <Home className="h-5 w-5 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Address Type</h2>
                                <p className="text-sm text-gray-600">
                                    Choose between shipping address or company address
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="relative flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    {...register("addressType")}
                                    value="Customer"
                                    className="w-4 h-4 text-blue-600"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Shipping Address</div>
                                    <div className="text-sm text-gray-600">
                                        For receiving orders and shipments
                                    </div>
                                </div>
                            </label>
                            <label className="relative flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    {...register("addressType")}
                                    value="Company"
                                    className="w-4 h-4 text-blue-600"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Company Address</div>
                                    <div className="text-sm text-gray-600">
                                        For business and tax purposes
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                                <p className="text-sm text-gray-600">Name and contact details</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("firstName", { required: "First name is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.firstName && (
                                    <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("lastName", { required: "Last name is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.lastName && (
                                    <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {errors.lastName.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {addressType === "Company" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("company", {
                                        required: addressType === "Company" ? "Company name is required" : false,
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.company && (
                                    <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {errors.company.message}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    {...register("phone", { required: "Phone is required" })}
                                    onChange={handlePhoneChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.phone && (
                                    <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address Details */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Address Details</h2>
                                <p className="text-sm text-gray-600">Complete address information</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Street Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("streetAddress", { required: "Street address is required" })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.streetAddress && (
                                <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.streetAddress.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Suite/Apt/Unit
                            </label>
                            <input
                                type="text"
                                {...register("streetAddress2")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("city", { required: "City is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.city && (
                                    <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {errors.city.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register("state", { required: "State is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select State</option>
                                    {formData.states.map((state) => (
                                        <option key={state.value} value={state.value}>
                                            {state.text}
                                        </option>
                                    ))}
                                </select>
                                {errors.state && (
                                    <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {errors.state.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Zip Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("zip", { required: "Zip code is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.zip && (
                                    <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {errors.zip.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("country", { required: "Country is required" })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Country</option>
                                {formData.countries.map((country) => (
                                    <option key={country.value} value={country.value}>
                                        {country.text}
                                    </option>
                                ))}
                            </select>
                            {errors.country && (
                                <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.country.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...register("isPrimary")}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Set as {addressType === "Company" ? "primary company" : "default shipping"} address
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/cms/admin/profile/addresses")}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {submitting ? (
                            <>
                                <LoadingSpinner />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Update Address
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditAddressPage;
