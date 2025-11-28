"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { adminLocationsApi } from "@/app/services/adminLocationsApi";
import { LocationFormData, CreateLocationRequest } from "@/app/types/Location";
import { ArrowLeft, Save, MapPin, User, Building2, AlertTriangle } from "lucide-react";

const AddLocationPage: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<LocationFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateLocationRequest>({
        defaultValues: {
            firstName: "",
            lastName: "",
            addressName: "",
            streetAddress: "",
            streetAddress2: "",
            city: "",
            state: "",
            zip: "",
            country: "US", // Default to US
            phone: "",
            email: "",
            company: "",
            addressType: "Shipping",
            isPrimary: false,
            selectedRole: "",
            companyId: undefined,
            customerId: undefined,
            adminId: undefined,
            salesId: undefined,
        },
    });

    const selectedRole = watch("selectedRole");
    const addressType = watch("addressType");
    const selectedCountry = watch("country");

    // Load form data
    useEffect(() => {
        const loadFormData = async () => {
            try {
                const data = await adminLocationsApi.getFormData();
                console.log(data);
                setFormData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load form data");
            } finally {
                setLoading(false);
            }
        };

        loadFormData();
    }, []);

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

    const onSubmit = async (data: CreateLocationRequest) => {
        setSubmitting(true);
        try {
            await adminLocationsApi.create(data);
            toast.success("Location created successfully");
            router.push("/cms/admin/locations");
        } catch (err) {
            console.error("Error creating location:", err);
            toast.error(err instanceof Error ? err.message : "Failed to create location");
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

    if (!formData) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/cms/admin/locations")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Location</h1>
                    <p className="text-gray-600">Create a new location</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Account</h2>
                                <p className="text-sm text-gray-600">Associate location with an account</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select {...register("selectedRole", { required: "Role is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                    <option value="">Select Role</option>
                                    {formData.roles.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.text}
                                        </option>
                                    ))}
                                </select>
                                {errors.selectedRole && (
                                    <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                        <AlertTriangle className="h-3 w-3 text-red-500" />
                                        {errors.selectedRole.message}
                                    </p>
                                )}
                            </div>

                            {selectedRole === "Company" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company <span className="text-red-500">*</span>
                                    </label>
                                    <select {...register("companyId", { required: "Company is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                        <option value="">Select Company</option>
                                        {formData.companies.map((company) => (
                                            <option key={company.value} value={company.value}>
                                                {company.text}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.companyId && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.companyId.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedRole === "Customer" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Customer <span className="text-red-500">*</span>
                                    </label>
                                    <select {...register("customerId", { required: "Customer is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                        <option value="">Select Customer</option>
                                        {formData.customers.map((customer) => (
                                            <option key={customer.value} value={customer.value}>
                                                {customer.text}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.customerId && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.customerId.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedRole === "Admin" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Admin <span className="text-red-500">*</span>
                                    </label>
                                    <select {...register("adminId", { required: "Admin is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                        <option value="">Select Admin</option>
                                        {formData.admins.map((admin) => (
                                            <option key={admin.value} value={admin.value}>
                                                {admin.text}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.adminId && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.adminId.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedRole === "Sales" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sales <span className="text-red-500">*</span>
                                    </label>
                                    <select {...register("salesId", { required: "Sales is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                        <option value="">Select Sales</option>
                                        {formData.sales.map((sales) => (
                                            <option key={sales.value} value={sales.value}>
                                                {sales.text}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.salesId && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.salesId.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Address Details</h2>
                                    <p className="text-sm text-gray-600">Location address information</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" {...register("streetAddress", { required: "Address is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" />
                                    {errors.streetAddress && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.streetAddress.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Suite/Apt/Unit</label>
                                    <input type="text" {...register("streetAddress2")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" {...register("city", { required: "City is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" />
                                    {errors.city && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.city.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <select {...register("state", { required: "State is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                                        <option value="">Select State</option>
                                        {formData.states.map((state) => (
                                            <option key={state.value} value={state.value}>
                                                {state.text}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.state && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.state.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <select {...register("country", { required: "Country is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                                        {formData.countries.map((country) => (
                                            <option key={country.value} value={country.value}>
                                                {country.text}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.country && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.country.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Zip/Postal Code <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" {...register("zip", { required: "Zip/Postal code is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" />
                                    {errors.zip && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.zip.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    />
                                    {errors.email && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" {...register("phone", { required: "Phone is required" })} onChange={handlePhoneChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" />
                                    {errors.phone && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <User className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                                    <p className="text-sm text-gray-600">Contact details for this location</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" {...register("firstName", { required: "First name is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" />
                                    {errors.firstName && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.firstName.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" {...register("lastName", { required: "Last name is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" />
                                    {errors.lastName && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.lastName.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Nickname</label>
                                    <input type="text" {...register("addressName")} placeholder="Home" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" />
                                </div>

                                {selectedRole !== "Customer" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                                        <select {...register("addressType")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                                            {formData.addressTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.text}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {addressType === "Company" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                    <input type="text" {...register("company")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" />
                                </div>
                            )}

                            {selectedRole === "Customer" && (
                                <div className="flex items-center">
                                    <input type="checkbox" {...register("isPrimary")} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                                    <label className="ml-2 text-sm text-gray-700">Make this your default address</label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.push("/cms/admin/locations")} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? (
                            <>
                                <LoadingSpinner />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddLocationPage;
