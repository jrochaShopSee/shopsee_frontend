"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/Label";
import { Select } from "@/app/components/ui/Select";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { subscriptionProductApi } from "@/app/services/subscriptionProductApi";
import { SubscriptionProduct, SubscriptionType, UpdateSubscriptionProductRequest } from "@/app/types/SubscriptionProduct";
import { ArrowLeft, Package, Save } from "lucide-react";

interface EditSubscriptionProductPageProps {
    id: string;
}

const EditSubscriptionProductPage: React.FC<EditSubscriptionProductPageProps> = ({ id }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([]);
    const [subscriptionProduct, setSubscriptionProduct] = useState<SubscriptionProduct | null>(null);
    const [formData, setFormData] = useState<UpdateSubscriptionProductRequest>({
        subscriptionName: "",
        subscriptionDescription: "",
        isActive: true,
        price: 0,
        annualDiscount: 0,
        videosPerMonth: 1,
        maxLength: 1,
        maxProducts: 1,
        revenueSplit: undefined,
        subscriptionTypeId: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load subscription types
    useEffect(() => {
        const loadSubscriptionTypes = async () => {
            try {
                const types = await subscriptionProductApi.getSubscriptionTypes();
                setSubscriptionTypes(types);
            } catch {
                toast.error("Failed to load subscription types");
            }
        };
        loadSubscriptionTypes();
    }, []);

    // Load subscription product data
    useEffect(() => {
        const loadSubscriptionProduct = async () => {
            try {
                const data = await subscriptionProductApi.getById(id);
                setSubscriptionProduct(data);
                setFormData({
                    subscriptionName: data.subscriptionName,
                    subscriptionDescription: data.subscriptionDescription,
                    isActive: data.isActive,
                    price: data.price,
                    annualDiscount: data.annualDiscount,
                    videosPerMonth: data.videosPerMonth,
                    maxLength: data.maxLength,
                    maxProducts: data.maxProducts,
                    revenueSplit: data.revenueSplit,
                    subscriptionTypeId: data.subscriptionTypeId,
                });
            } catch (err) {
                if (err instanceof Error) {
                    toast.error(err.message);
                } else {
                    toast.error("Failed to load subscription product");
                }
                router.push("/cms/admin/subscriptionProduct");
            } finally {
                setLoading(false);
            }
        };

        loadSubscriptionProduct();
    }, [id, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let processedValue: string | number | boolean = value;

        if (type === "number") {
            processedValue = value === "" ? 0 : parseFloat(value);
        } else if (type === "checkbox") {
            processedValue = (e.target as HTMLInputElement).checked;
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.subscriptionName.trim()) {
            newErrors.subscriptionName = "Subscription name is required";
        } else if (formData.subscriptionName.length > 200) {
            newErrors.subscriptionName = "Subscription name must be 200 characters or less";
        }

        if (formData.subscriptionDescription.length > 1000) {
            newErrors.subscriptionDescription = "Description must be 1000 characters or less";
        }

        if (formData.price < 0 || formData.price > 10000) {
            newErrors.price = "Price must be between 0 and 10000";
        }

        if (formData.annualDiscount < 0 || formData.annualDiscount > 100) {
            newErrors.annualDiscount = "Annual discount must be between 0 and 100";
        }

        if (formData.videosPerMonth < 1 || formData.videosPerMonth > 10000) {
            newErrors.videosPerMonth = "Videos per month must be between 1 and 10000";
        }

        if (formData.maxLength < 1 || formData.maxLength > 10000) {
            newErrors.maxLength = "Max length must be between 1 and 10000";
        }

        if (formData.maxProducts < 1 || formData.maxProducts > 255) {
            newErrors.maxProducts = "Max products must be between 1 and 255";
        }

        if (formData.revenueSplit !== undefined && (formData.revenueSplit < 0 || formData.revenueSplit > 100)) {
            newErrors.revenueSplit = "Revenue split must be between 0 and 100";
        }

        if (!formData.subscriptionTypeId || formData.subscriptionTypeId === 0) {
            newErrors.subscriptionTypeId = "Subscription type is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the errors below");
            return;
        }

        setSaving(true);
        try {
            await subscriptionProductApi.update(id, formData);
            toast.success("Subscription product updated successfully");
            router.push("/cms/admin/subscriptionProduct");
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to update subscription product");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!subscriptionProduct) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Subscription product not found</h3>
                    <p className="text-gray-500 mb-6">The subscription product you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push("/cms/admin/subscriptionProduct")}>
                        Back to Subscription Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="mr-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Package className="w-8 h-8 mr-3 text-purple-500" />
                            Edit Subscription Product
                        </h1>
                        <p className="text-gray-600 mt-2">Update subscription product details</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="subscriptionName">Subscription Name *</Label>
                                <Input
                                    id="subscriptionName"
                                    name="subscriptionName"
                                    value={formData.subscriptionName}
                                    onChange={handleInputChange}
                                    className={errors.subscriptionName ? "border-red-500" : ""}
                                    placeholder="Enter subscription name"
                                />
                                {errors.subscriptionName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.subscriptionName}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="subscriptionTypeId">Subscription Type *</Label>
                                <Select
                                    value={formData.subscriptionTypeId.toString()}
                                    onValueChange={(value) => {
                                        setFormData(prev => ({ ...prev, subscriptionTypeId: parseInt(value) }));
                                        if (errors.subscriptionTypeId) {
                                            setErrors(prev => ({ ...prev, subscriptionTypeId: "" }));
                                        }
                                    }}
                                    className={errors.subscriptionTypeId ? "border-red-500" : ""}
                                >
                                    <option value="0" disabled>Select subscription type</option>
                                    {subscriptionTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </Select>
                                {errors.subscriptionTypeId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.subscriptionTypeId}</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="subscriptionDescription">Description</Label>
                            <textarea
                                id="subscriptionDescription"
                                name="subscriptionDescription"
                                value={formData.subscriptionDescription}
                                onChange={handleInputChange}
                                rows={3}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.subscriptionDescription ? "border-red-500" : ""
                                }`}
                                placeholder="Enter subscription description"
                            />
                            {errors.subscriptionDescription && (
                                <p className="text-red-500 text-sm mt-1">{errors.subscriptionDescription}</p>
                            )}
                        </div>
                    </Card>

                    {/* Pricing */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="price">Price (USD) *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    max="10000"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className={errors.price ? "border-red-500" : ""}
                                    placeholder="0.00"
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="annualDiscount">Annual Discount (%)</Label>
                                <Input
                                    id="annualDiscount"
                                    name="annualDiscount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={formData.annualDiscount}
                                    onChange={handleInputChange}
                                    className={errors.annualDiscount ? "border-red-500" : ""}
                                    placeholder="10"
                                />
                                {errors.annualDiscount && (
                                    <p className="text-red-500 text-sm mt-1">{errors.annualDiscount}</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Features & Limits */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Limits</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="videosPerMonth">Videos Per Month *</Label>
                                <Input
                                    id="videosPerMonth"
                                    name="videosPerMonth"
                                    type="number"
                                    min="1"
                                    max="10000"
                                    step="1"
                                    value={formData.videosPerMonth}
                                    onChange={handleInputChange}
                                    className={errors.videosPerMonth ? "border-red-500" : ""}
                                />
                                {errors.videosPerMonth && (
                                    <p className="text-red-500 text-sm mt-1">{errors.videosPerMonth}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="maxLength">Max Video Length (minutes) *</Label>
                                <Input
                                    id="maxLength"
                                    name="maxLength"
                                    type="number"
                                    min="1"
                                    max="10000"
                                    step="1"
                                    value={formData.maxLength}
                                    onChange={handleInputChange}
                                    className={errors.maxLength ? "border-red-500" : ""}
                                />
                                {errors.maxLength && (
                                    <p className="text-red-500 text-sm mt-1">{errors.maxLength}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="maxProducts">Max Products *</Label>
                                <Input
                                    id="maxProducts"
                                    name="maxProducts"
                                    type="number"
                                    min="1"
                                    max="255"
                                    step="1"
                                    value={formData.maxProducts}
                                    onChange={handleInputChange}
                                    className={errors.maxProducts ? "border-red-500" : ""}
                                />
                                {errors.maxProducts && (
                                    <p className="text-red-500 text-sm mt-1">{errors.maxProducts}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="revenueSplit">Revenue Split (%)</Label>
                                <Input
                                    id="revenueSplit"
                                    name="revenueSplit"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={formData.revenueSplit || ""}
                                    onChange={handleInputChange}
                                    className={errors.revenueSplit ? "border-red-500" : ""}
                                />
                                {errors.revenueSplit && (
                                    <p className="text-red-500 text-sm mt-1">{errors.revenueSplit}</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Metadata */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                            <div>
                                <Label>Created</Label>
                                <p>{new Date(subscriptionProduct.dateCreated).toLocaleString()}</p>
                            </div>
                            <div>
                                <Label>Last Modified</Label>
                                <p>{new Date(subscriptionProduct.dateModified).toLocaleString()}</p>
                            </div>
                            {subscriptionProduct.merchantId && (
                                <div>
                                    <Label>Stripe Product ID</Label>
                                    <p className="font-mono">{subscriptionProduct.merchantId}</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-2"
                        >
                            {saving ? (
                                <>
                                    <LoadingSpinner />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Update Subscription Product</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditSubscriptionProductPage;