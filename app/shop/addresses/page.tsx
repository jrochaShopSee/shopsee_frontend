"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import axiosClient from "@/app/utils/axiosClient";
import { MapPin, Plus, Edit, Trash2, Star, X, Save, Check } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

const addressSchema = z.object({
    addressName: z.string().min(1, "Address name is required"),
    contactFirstName: z.string().min(1, "First name is required"),
    contactLastName: z.string().min(1, "Last name is required"),
    streetAddress: z.string().min(1, "Street address is required"),
    streetAddress2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/Province is required"),
    zip: z.string().min(1, "ZIP/Postal code is required"),
    country: z.string().min(1, "Country is required"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address extends AddressFormData {
    id: number;
    isDefault: boolean;
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const response = await axiosClient.get<Address[]>("/api/shop/addresses");
            setAddresses(response.data);
        } catch (error) {
            console.error("Failed to load addresses:", error);
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingAddress(null);
        reset({
            addressName: "",
            contactFirstName: "",
            contactLastName: "",
            streetAddress: "",
            streetAddress2: "",
            city: "",
            state: "",
            zip: "",
            country: "United States",
            phone: "",
            email: "",
        });
        setShowModal(true);
    };

    const openEditModal = (address: Address) => {
        setEditingAddress(address);
        setValue("addressName", address.addressName);
        setValue("contactFirstName", address.contactFirstName);
        setValue("contactLastName", address.contactLastName);
        setValue("streetAddress", address.streetAddress);
        setValue("streetAddress2", address.streetAddress2 || "");
        setValue("city", address.city);
        setValue("state", address.state);
        setValue("zip", address.zip);
        setValue("country", address.country);
        setValue("phone", address.phone || "");
        setValue("email", address.email || "");
        setShowModal(true);
    };

    const onSubmit = async (data: AddressFormData) => {
        setSubmitting(true);
        try {
            if (editingAddress) {
                // Update existing address
                await axiosClient.put(`/api/shop/addresses/${editingAddress.id}`, data);
                toast.success("Address updated successfully");
            } else {
                // Add new address
                await axiosClient.post("/api/shop/addresses", data);
                toast.success("Address added successfully");
            }
            setShowModal(false);
            loadAddresses();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to save address");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetDefault = async (addressId: number) => {
        try {
            await axiosClient.put(`/api/shop/addresses/${addressId}/set-default`);
            toast.success("Default address updated");
            loadAddresses();
        } catch (error) {
            console.error("Failed to set default address:", error);
            toast.error("Failed to set default address");
        }
    };

    const handleDelete = async (addressId: number) => {
        if (!window.confirm("Are you sure you want to delete this address?")) {
            return;
        }

        try {
            await axiosClient.delete(`/api/shop/addresses/${addressId}`);
            toast.success("Address deleted successfully");
            loadAddresses();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to delete address");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Addresses</h1>
                    <p className="text-gray-600">Manage your saved addresses</p>
                </div>
                <Button onClick={openAddModal} variant="default">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                </Button>
            </div>

            {/* Addresses Grid */}
            {addresses.length === 0 ? (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Addresses Yet</h2>
                    <p className="text-gray-600 mb-6">Add your first address to get started</p>
                    <Button onClick={openAddModal} variant="default">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`bg-white rounded-lg shadow border-2 ${
                                address.isDefault ? "border-primary" : "border-gray-200"
                            } p-6 relative`}
                        >
                            {address.isDefault && (
                                <div className="absolute top-4 right-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                                        <Star className="w-3 h-3 mr-1 fill-current" />
                                        Default
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">{address.addressName}</h3>
                                <div className="text-sm text-gray-700 space-y-1">
                                    <p className="font-medium">
                                        {address.contactFirstName} {address.contactLastName}
                                    </p>
                                    <p>{address.streetAddress}</p>
                                    {address.streetAddress2 && <p>{address.streetAddress2}</p>}
                                    <p>
                                        {address.city}, {address.state} {address.zip}
                                    </p>
                                    <p>{address.country}</p>
                                    {address.phone && <p className="mt-2">{address.phone}</p>}
                                    {address.email && (
                                        <p className="text-primary">{address.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openEditModal(address)}
                                        className="text-primary hover:text-primary-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        title="Edit address"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Delete address"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="text-sm text-gray-600 hover:text-primary flex items-center"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Address Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingAddress ? "Edit Address" : "Add New Address"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            {/* Address Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("addressName")}
                                    className={`w-full px-4 py-2 border ${
                                        errors.addressName ? "border-red-500" : "border-gray-300"
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                    placeholder="e.g., Home, Work, Office"
                                />
                                {errors.addressName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.addressName.message}</p>
                                )}
                            </div>

                            {/* Contact Name Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("contactFirstName")}
                                        className={`w-full px-4 py-2 border ${
                                            errors.contactFirstName ? "border-red-500" : "border-gray-300"
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                    />
                                    {errors.contactFirstName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.contactFirstName.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("contactLastName")}
                                        className={`w-full px-4 py-2 border ${
                                            errors.contactLastName ? "border-red-500" : "border-gray-300"
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                    />
                                    {errors.contactLastName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.contactLastName.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Street Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Street Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("streetAddress")}
                                    className={`w-full px-4 py-2 border ${
                                        errors.streetAddress ? "border-red-500" : "border-gray-300"
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                    placeholder="123 Main St"
                                />
                                {errors.streetAddress && (
                                    <p className="text-red-500 text-sm mt-1">{errors.streetAddress.message}</p>
                                )}
                            </div>

                            {/* Street Address 2 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Apartment, Suite, etc. (Optional)
                                </label>
                                <input
                                    type="text"
                                    {...register("streetAddress2")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Apt 4B"
                                />
                            </div>

                            {/* City, State, ZIP Row */}
                            <div className="grid grid-cols-6 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("city")}
                                        className={`w-full px-4 py-2 border ${
                                            errors.city ? "border-red-500" : "border-gray-300"
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                    />
                                    {errors.city && (
                                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("state")}
                                        className={`w-full px-4 py-2 border ${
                                            errors.state ? "border-red-500" : "border-gray-300"
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                    />
                                    {errors.state && (
                                        <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                                    )}
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ZIP <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("zip")}
                                        className={`w-full px-4 py-2 border ${
                                            errors.zip ? "border-red-500" : "border-gray-300"
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                    />
                                    {errors.zip && (
                                        <p className="text-red-500 text-sm mt-1">{errors.zip.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("country")}
                                    className={`w-full px-4 py-2 border ${
                                        errors.country ? "border-red-500" : "border-gray-300"
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                />
                                {errors.country && (
                                    <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                                )}
                            </div>

                            {/* Phone and Email Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        {...register("phone")}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        {...register("email")}
                                        className={`w-full px-4 py-2 border ${
                                            errors.email ? "border-red-500" : "border-gray-300"
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="default" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            {editingAddress ? "Update Address" : "Add Address"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
