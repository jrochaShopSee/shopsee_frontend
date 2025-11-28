"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { profileApi } from "@/app/services/profileApi";
import { Address } from "@/app/types/Profile";
import ConfirmationModal from "@/app/components/shared/ConfirmationModal";
import { ArrowLeft, MapPin, Edit2, Trash2, Star, Home, Building2 } from "lucide-react";

const AddressesPage: React.FC = () => {
    const router = useRouter();
    const [customerAddresses, setCustomerAddresses] = useState<Address[]>([]);
    const [companyAddresses, setCompanyAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionId, setActionId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "warning" | "danger" | "info" | "success";
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", type: "warning", onConfirm: () => {} });

    const loadAddresses = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await profileApi.getAddresses();
            setCustomerAddresses(data.customerAddresses || []);
            setCompanyAddresses(data.companyAddresses || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load addresses");
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    const handleDelete = async (id: number) => {
        setActionId(id);
        try {
            await profileApi.deleteAddress(id);
            toast.success("Address deleted successfully");
            await loadAddresses();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete address");
        } finally {
            setActionId(null);
        }
    };

    const handleMarkPrimary = async (id: number, type: string) => {
        setActionId(id);
        try {
            await profileApi.markPrimaryAddress(id, type);
            toast.success(`${type} address marked as primary successfully`);
            await loadAddresses();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to mark as primary");
        } finally {
            setActionId(null);
        }
    };

    const showDeleteConfirmation = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Address",
            message: "Are you sure you want to delete this address?",
            type: "danger",
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                handleDelete(id);
            },
        });
    };

    const showMarkPrimaryConfirmation = (id: number, type: string, addressName: string) => {
        const typeLabel = type === "Company" ? "Company" : "Shipping";
        const tooltipMessage = type === "Company" ? "Tax for your products will be based on this location" : "";

        setConfirmModal({
            isOpen: true,
            title: `Set as ${typeLabel} Address`,
            message: `Do you want to set "${addressName}" as the primary ${typeLabel.toLowerCase()} address?${tooltipMessage ? ` ${tooltipMessage}` : ""}`,
            type: "info",
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                handleMarkPrimary(id, type);
            },
        });
    };

    const getFullAddress = (address: Address) => {
        const parts = [
            address.streetAddress,
            address.streetAddress2,
            address.city,
            address.state,
            address.zip,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "N/A";
    };

    const renderAddressCard = (address: Address, type: "Customer" | "Company") => {
        const contactName = address.firstName || address.lastName
            ? `${address.firstName || ""} ${address.lastName || ""}`.trim()
            : "N/A";

        return (
            <Card key={address.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${type === "Company" ? "bg-purple-50" : "bg-blue-50"}`}>
                            {type === "Company" ? (
                                <Building2 className="h-5 w-5 text-purple-600" />
                            ) : (
                                <Home className="h-5 w-5 text-blue-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {address.name || "Address"}
                                </h3>
                                {address.isPrimary && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Star className="h-3 w-3 fill-current" />
                                        {type === "Company" ? "Primary Company" : "Default"}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{contactName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/cms/admin/profile/addresses/edit/${address.id}`)}
                            disabled={actionId === address.id}
                            className="text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50"
                            title="Edit Address"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => showDeleteConfirmation(address.id!)}
                            disabled={actionId === address.id}
                            className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                            title="Delete Address"
                        >
                            {actionId === address.id ? (
                                <LoadingSpinner />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{getFullAddress(address)}</span>
                    </div>
                    {address.phone && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Phone:</span>
                            <span>{address.phone}</span>
                        </div>
                    )}
                    {address.email && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Email:</span>
                            <span>{address.email}</span>
                        </div>
                    )}
                    {address.company && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Company:</span>
                            <span>{address.company}</span>
                        </div>
                    )}
                </div>

                {!address.isPrimary && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                showMarkPrimaryConfirmation(
                                    address.id!,
                                    type,
                                    address.name || getFullAddress(address)
                                )
                            }
                            disabled={actionId === address.id}
                            className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
                        >
                            <Star className="h-4 w-4 mr-2" />
                            Set as {type === "Company" ? "Primary Company" : "Default Shipping"} Address
                        </Button>
                    </div>
                )}
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <button
                    onClick={() => router.push("/cms/admin/profile")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Profile
                </button>
                <Card className="p-6">
                    <div className="text-center text-red-600">
                        <p>{error}</p>
                        <Button variant="outline" onClick={loadAddresses} className="mt-4">
                            Try Again
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <button
                        onClick={() => router.push("/cms/admin/profile")}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Profile
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
                    <p className="text-gray-600 mt-1">Manage your shipping and company addresses</p>
                </div>
                <Button
                    onClick={() => router.push("/cms/admin/profile/addresses/add")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Add New Address
                </Button>
            </div>

            {/* Shipping Addresses Section */}
            {customerAddresses.length > 0 && (
                <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Home className="h-5 w-5 text-blue-600" />
                            Shipping Addresses
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Addresses used for shipping orders
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {customerAddresses.map((address) => renderAddressCard(address, "Customer"))}
                    </div>
                </div>
            )}

            {/* Company Addresses Section */}
            {companyAddresses.length > 0 && (
                <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-purple-600" />
                            Company Addresses
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Tax for your products are being calculated based on your primary address
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {companyAddresses.map((address) => renderAddressCard(address, "Company"))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {customerAddresses.length === 0 && companyAddresses.length === 0 && (
                <Card className="p-12">
                    <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Addresses Found</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't added any addresses yet. Add your first address to get started.
                        </p>
                        <Button
                            onClick={() => router.push("/cms/admin/profile/addresses/add")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Add New Address
                        </Button>
                    </div>
                </Card>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                loading={actionId !== null}
                confirmText="Confirm"
            />
        </div>
    );
};

export default AddressesPage;
