"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { adminBrandsApi } from "@/app/services/adminBrandsApi";
import { BrandDetails } from "@/app/types/Brand";
import { ArrowLeft, Building2, Globe, Package, Video, MapPin, CreditCard, User, Mail, Phone, Home } from "lucide-react";

interface BrandDetailsPageProps {
    id: string;
}

const BrandDetailsPage: React.FC<BrandDetailsPageProps> = ({ id }) => {
    const router = useRouter();
    const [brand, setBrand] = useState<BrandDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBrandDetails = async () => {
            try {
                const data = await adminBrandsApi.getById(id);
                setBrand(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load brand details");
                toast.error("Failed to load brand details");
            } finally {
                setLoading(false);
            }
        };

        loadBrandDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !brand) {
        return (
            <Card className="p-6">
                <div className="text-center text-red-600">
                    <p>{error || "Brand not found"}</p>
                    <Button variant="outline" onClick={() => router.push("/cms/admin/brands")} className="mt-4">
                        Back to Brands
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/cms/admin/brands")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
                    <p className="text-gray-600">Brand Details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 -mt-6 px-6 py-4 border-b border-gray-200 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">General</h2>
                                <p className="text-sm text-gray-600">Basic brand information</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                            <p className="text-gray-900">{brand.name}</p>
                        </div>

                        {brand.website && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Website
                                </label>
                                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {brand.website}
                                </a>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                                <div className="flex items-center">
                                    <input type="checkbox" checked={brand.isActive} disabled className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-600">Products:</span>
                                <span className="font-medium text-gray-900">{brand.productCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Video className="h-4 w-4 text-purple-500" />
                                <span className="text-sm text-gray-600">Videos:</span>
                                <span className="font-medium text-gray-900">{brand.videosCount}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Payout Information */}
                <Card className="p-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 -mx-6 -mt-6 px-6 py-4 border-b border-gray-200 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Payout Information</h2>
                                <p className="text-sm text-gray-600">Bank account details</p>
                            </div>
                        </div>
                    </div>

                    {brand.bankAccount ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name on Account</label>
                                <p className="text-gray-900">{brand.bankAccount.accountHolderName || "N/A"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Routing Number</label>
                                <p className="text-gray-900">{brand.bankAccount.routingNumber || "N/A"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                                <p className="text-gray-900">{brand.bankAccount.accountNumber || "N/A"}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No payout information available</p>
                    )}
                </Card>
            </div>

            {/* Billing Address */}
            <Card className="p-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 -mx-6 -mt-6 px-6 py-4 border-b border-gray-200 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Home className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Billing</h2>
                            <p className="text-sm text-gray-600">Billing address information</p>
                        </div>
                    </div>
                </div>

                {brand.billingAddress ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Contact First Name
                            </label>
                            <p className="text-gray-900">{brand.billingAddress.firstName || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Last Name</label>
                            <p className="text-gray-900">{brand.billingAddress.lastName || "N/A"}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                            <p className="text-gray-900">{brand.billingAddress.company || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Address
                            </label>
                            <p className="text-gray-900">{brand.billingAddress.streetAddress || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address 2</label>
                            <p className="text-gray-900">{brand.billingAddress.streetAddress2 || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <p className="text-gray-900">{brand.billingAddress.city || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                            <p className="text-gray-900">{brand.billingAddress.zip || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <p className="text-gray-900">{brand.billingAddress.country || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <p className="text-gray-900">{brand.billingAddress.state || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </label>
                            <p className="text-gray-900">{brand.billingAddress.email || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone
                            </label>
                            <p className="text-gray-900">{brand.billingAddress.phone || "N/A"}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No billing address available</p>
                )}
            </Card>

            {/* Shipping/Company Address */}
            <Card className="p-6">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 -mx-6 -mt-6 px-6 py-4 border-b border-gray-200 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Shipping / Ship From Address</h2>
                            <p className="text-sm text-gray-600">Company address information</p>
                        </div>
                    </div>
                </div>

                {brand.companyAddress ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Contact First Name
                            </label>
                            <p className="text-gray-900">{brand.companyAddress.firstName || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Last Name</label>
                            <p className="text-gray-900">{brand.companyAddress.lastName || "N/A"}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                            <p className="text-gray-900">{brand.companyAddress.company || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Address
                            </label>
                            <p className="text-gray-900">{brand.companyAddress.streetAddress || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address 2</label>
                            <p className="text-gray-900">{brand.companyAddress.streetAddress2 || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <p className="text-gray-900">{brand.companyAddress.city || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                            <p className="text-gray-900">{brand.companyAddress.zip || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <p className="text-gray-900">{brand.companyAddress.country || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <p className="text-gray-900">{brand.companyAddress.state || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </label>
                            <p className="text-gray-900">{brand.companyAddress.email || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone
                            </label>
                            <p className="text-gray-900">{brand.companyAddress.phone || "N/A"}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No company address available</p>
                )}
            </Card>
        </div>
    );
};

export default BrandDetailsPage;
