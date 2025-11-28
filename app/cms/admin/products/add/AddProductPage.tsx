"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { adminProductsApi } from "@/app/services/adminProductsApi";
import { ProductFormData, PRODUCT_TYPES } from "@/app/types/Product";
import { ArrowLeft, Save, Settings, Truck, Package, AlertTriangle } from "lucide-react";
import GeneralInformationSection from "./components/GeneralInformationSection";
import PricingSection from "./components/PricingSection";
import DisplayPreferencesSection from "./components/DisplayPreferencesSection";
import MediaUploadSection from "./components/MediaUploadSection";
import ProductIdentificationSection from "./components/ProductIdentificationSection";
import PhysicalProductDetailsSection from "./components/PhysicalProductDetailsSection";
import CategoriesSection from "./components/CategoriesSection";
// Import shared components
import QuizSection from "../shared/QuizSection";
import ProductVariantsSection from "../shared/ProductVariantsSection";
import { AddProductFormData } from "./types";

const AddProductPage: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<ProductFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<AddProductFormData>({
        defaultValues: {
            companyId: 0,
            name: "",
            description: "",
            isActive: true,
            price: 0,
            comparePrice: undefined,
            salePrice: undefined,
            salePriceExpiration: undefined,
            sku: undefined,
            barcode: undefined,
            priceColor: "#000000",
            productTypeId: PRODUCT_TYPES.PHYSICAL, // PHYSICAL type
            externalLink: undefined,

            // Media fields
            productImage: undefined,
            productIcon: undefined,
            productHeaderImage: undefined,

            // Display preferences
            showPrice: true,
            headerType: undefined,
            buttonText: "Buy Now",

            // Physical product dimensions
            length: undefined,
            width: undefined,
            height: undefined,
            weight: undefined,

            // Inventory management
            manageInventory: false,
            currentInventory: undefined,
            allowBackorders: false,

            // Distributor fields
            distributorProduct: false,
            distributorId: undefined,
            linkToExternal: false,

            // Shipping settings
            customShipping: false,
            flatRateShippingCost: undefined,
            shippingPerProduct: false,
            shippingTypeId: undefined,
            customPrices: false,

            // Complex data structures
            categories: [],
            variations: undefined,
            quizSettings: undefined,
            donationPriceList: [],
        },
    });

    const productTypeId = watch("productTypeId");
    const customShipping = watch("customShipping");
    // Load form data
    useEffect(() => {
        const loadFormData = async () => {
            try {
                const data = await adminProductsApi.getFormData();
                setFormData(data);

                // Set default company if user has limited access
                if (data.role === "Company" || data.role === "Distributor") {
                    setValue("companyId", data.companyId);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load form data");
            } finally {
                setLoading(false);
            }
        };

        loadFormData();
    }, [setValue]);

    const onSubmit = async (data: AddProductFormData) => {
        setSubmitting(true);
        try {
            // Create the product data structure that matches the backend expectation
            const productData = {
                companyId: data.companyId || formData?.companyId || 0,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                price: data.price,
                comparePrice: data.comparePrice,
                salePrice: data.salePrice,
                salePriceExpiration: data.salePriceExpiration,
                sku: data.sku,
                barcode: data.barcode,
                priceColor: data.priceColor,
                productTypeId: data.productTypeId,
                externalLink: data.externalLink,

                // Media fields (URLs)
                productImage: data.productImage,
                productIcon: data.productIcon,
                productHeaderImage: data.productHeaderImage, // This maps to File3 in backend

                // Display preferences
                showPrice: data.showPrice,
                headerType: data.headerType,
                buttonText: data.buttonText,

                // Physical dimensions (required for physical products)
                length: data.length,
                width: data.width,
                height: data.height,
                weight: data.weight,

                // Inventory
                manageInventory: data.manageInventory,
                currentInventory: data.currentInventory,
                allowBackorders: data.allowBackorders,

                // Shipping
                customShipping: data.customShipping,
                flatRateShippingCost: data.flatRateShippingCost,
                shippingPerProduct: data.shippingPerProduct,
                shippingTypeId: data.shippingTypeId,
                customPrices: data.customPrices,

                // Business settings
                linkToExternal: data.linkToExternal,
                distributorProduct: data.distributorProduct,
                distributorId: data.distributorId || (formData?.role === "Distributor" ? formData.companyId : undefined),
            };

            // Prepare the request structure
            const createRequest = {
                product: productData,
                categories: data.categories?.map((cat) => cat.id) || [], // Convert Category objects to array of IDs
                variations: data.variations,
                quizSettings: data.quizSettings,
                donationPriceList: data.donationPriceList?.length > 0 ? data.donationPriceList : undefined,
            };

            await adminProductsApi.create(createRequest);

            toast.success("Product created successfully");
            router.push("/cms/admin/products");
        } catch (err: any) {
            console.error("Error creating product:", err);

            // Extract error message from various possible error formats
            let errorMessage = "Failed to create product";

            if (err.response?.data) {
                // Try to extract message from backend response
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                } else if (err.response.data.errorMessage) {
                    errorMessage = err.response.data.errorMessage;
                } else if (err.response.data.title) {
                    errorMessage = err.response.data.title;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            toast.error(errorMessage);
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
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/cms/admin/products")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
                    <p className="text-gray-600">Create a new product</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Two-column layout */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="space-y-8">
                        {/* 1. General Information - Always show */}
                        <GeneralInformationSection register={register} errors={errors} formData={formData} watch={watch} setValue={setValue} />

                        {/* 2. External Link - Show for External products only - Right after General Information */}
                        {productTypeId === PRODUCT_TYPES.EXTERNAL && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Settings className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">External Link</h2>
                                            <p className="text-sm text-gray-600">Configure external product link</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        External Link <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        {...register("externalLink", {
                                            required: "External link is required for external products",
                                        })}
                                        placeholder="https://example.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    {errors.externalLink && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.externalLink.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. Pricing - Show for all types except Quiz */}
                        {productTypeId !== PRODUCT_TYPES.QUIZ && (
                            <PricingSection register={register} errors={errors} watch={watch} setValue={setValue} />
                        )}

                        {/* 4. Product Identification - Show for Physical and External */}
                        {(productTypeId === PRODUCT_TYPES.PHYSICAL || productTypeId === PRODUCT_TYPES.EXTERNAL) && (
                            <ProductIdentificationSection register={register} errors={errors} />
                        )}

                        {/* 5. Physical Product Details - Show for Physical products only */}
                        {productTypeId === PRODUCT_TYPES.PHYSICAL && (
                            <PhysicalProductDetailsSection register={register} errors={errors} />
                        )}

                        {/* 6. Product Variants - Show for Physical products only */}
                        {productTypeId === PRODUCT_TYPES.PHYSICAL && (
                            <ProductVariantsSection register={register} errors={errors} watch={watch} setValue={setValue} />
                        )}

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-8">
                        {/* 1. Display Preferences - Show for Physical, External, Donation, Digital */}
                        {(productTypeId === PRODUCT_TYPES.PHYSICAL || productTypeId === PRODUCT_TYPES.EXTERNAL || productTypeId === PRODUCT_TYPES.DONATION || productTypeId === PRODUCT_TYPES.DIGITAL) && (
                            <DisplayPreferencesSection register={register} errors={errors} watch={watch} formData={formData} />
                        )}

                        {/* 2. Media and Images - Show for Physical, External, Donation, Digital */}
                        {(productTypeId === PRODUCT_TYPES.PHYSICAL || productTypeId === PRODUCT_TYPES.EXTERNAL || productTypeId === PRODUCT_TYPES.DONATION || productTypeId === PRODUCT_TYPES.DIGITAL) && (
                            <MediaUploadSection errors={errors} watch={watch} setValue={setValue} />
                        )}

                        {/* 3. Quiz Settings - Show for Quiz products only - Above Categories */}
                        {productTypeId === PRODUCT_TYPES.QUIZ && (
                            <QuizSection register={register} errors={errors} watch={watch} setValue={setValue} />
                        )}

                        {/* 4. Categories - Show for all types */}
                        <CategoriesSection watch={watch} setValue={setValue} />

                        {/* 4. Shipping - Show for Physical products only */}
                        {productTypeId === PRODUCT_TYPES.PHYSICAL && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-gray-200 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Truck className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">Shipping</h2>
                                            <p className="text-sm text-gray-600">Configure shipping settings</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-center mb-4">
                                        <input type="checkbox" {...register("customShipping")} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                                        <label className="ml-2 text-sm font-medium text-gray-700">Custom Shipping</label>
                                    </div>

                                    {customShipping && (
                                        <div className="ml-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Flat Rate Shipping Cost</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500">$</span>
                                                        </div>
                                                        <input type="number" step="0.01" {...register("flatRateShippingCost")} className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="0.00" />
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <input type="checkbox" {...register("shippingPerProduct")} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                                                    <label className="ml-2 text-sm text-gray-700">Shipping Per Product</label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 5. Inventory Management - Show for Physical products only */}
                        {productTypeId === PRODUCT_TYPES.PHYSICAL && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Package className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">Inventory Management</h2>
                                            <p className="text-sm text-gray-600">Track and manage product inventory</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-center">
                                        <input type="checkbox" {...register("manageInventory")} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                                        <label className="ml-2 text-sm font-medium text-gray-700">Manage Inventory</label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Inventory</label>
                                            <input
                                                type="number"
                                                {...register("currentInventory", {
                                                    min: { value: 0, message: "Inventory must be non-negative" },
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <input type="checkbox" {...register("allowBackorders")} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                                            <label className="ml-2 text-sm text-gray-700">Allow Backorders</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.push("/cms/admin/products")} disabled={submitting}>
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
                                Create Product
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddProductPage;
