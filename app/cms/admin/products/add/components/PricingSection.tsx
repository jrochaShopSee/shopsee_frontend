"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { DollarSign, Calendar, Info, Plus, X, AlertTriangle } from "lucide-react";
import { PRODUCT_TYPES } from "@/app/types/Product";
import { AddProductFormData } from "../types";


interface PricingSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    watch: UseFormWatch<AddProductFormData>;
    setValue: UseFormSetValue<AddProductFormData>;
    isShopifyProduct?: boolean;
}

const PricingSection: React.FC<PricingSectionProps> = ({
    register,
    errors,
    watch,
    setValue,
    isShopifyProduct = false,
}) => {
    const productTypeId = watch("productTypeId");
    const donationPriceList = watch("donationPriceList") || [];
    const isDonationProduct = productTypeId === PRODUCT_TYPES.DONATION;

    // Initialize with one required donation price if none exist
    React.useEffect(() => {
        if (isDonationProduct && donationPriceList.length === 0) {
            setValue("donationPriceList", [{ price: 0 }]);
        }
    }, [isDonationProduct, donationPriceList.length, setValue]);

    const addDonationPrice = () => {
        if (donationPriceList.length < 3) {
            setValue("donationPriceList", [...donationPriceList, { price: 0 }]);
        }
    };

    const removeDonationPrice = (index: number) => {
        if (donationPriceList.length > 1) { // Keep at least one
            const updated = donationPriceList.filter((_, i) => i !== index);
            setValue("donationPriceList", updated);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
                        <p className="text-sm text-gray-600">Set product pricing and discounts</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {isDonationProduct ? (
                    /* Donation Pricing */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">
                                Donation Price Options
                            </label>
                            {donationPriceList.length < 3 && (
                                <button
                                    type="button"
                                    onClick={addDonationPrice}
                                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Option
                                </button>
                            )}
                        </div>

                        {donationPriceList.map((_, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Option {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register(`donationPriceList.${index}.price`, {
                                                required: index === 0 ? "At least one donation price is required" : false,
                                                min: { value: 0.01, message: "Donation amount must be greater than 0" },
                                            })}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        />
                                    </div>
                                    {errors.donationPriceList?.[index]?.price && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            {errors.donationPriceList[index].price.message}
                                        </p>
                                    )}
                                </div>

                                {donationPriceList.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeDonationPrice(index)}
                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors mt-6"
                                        title="Remove donation option"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}

                        <div className="flex items-start gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p>Customers can choose from these preset donation amounts. At least one option is required, up to 3 options maximum.</p>
                        </div>
                    </div>
                ) : (
                    /* Regular Pricing */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Base Price */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Price {!isShopifyProduct && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500">$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("price", {
                                        required: isShopifyProduct ? false : "Price is required",
                                        min: { value: 0, message: "Price must be non-negative" },
                                    })}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                            {errors.price && (
                                <p className="text-red-600 text-sm flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                    {errors.price.message}
                                </p>
                            )}
                        </div>

                        {/* Compare Price */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                                Compare Price
                                <div className="relative group">
                                    <Info className="h-3 w-3 text-gray-400" />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                        Original price before discount (shows strikethrough)
                                    </div>
                                </div>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500">$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("comparePrice", {
                                        min: { value: 0, message: "Compare price must be non-negative" },
                                    })}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                            {errors.comparePrice && (
                                <p className="text-red-600 text-sm flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                    {errors.comparePrice.message}
                                </p>
                            )}
                        </div>

                        {/* Sale Price */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Sale Price
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500">$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("salePrice", {
                                        min: { value: 0, message: "Sale price must be non-negative" },
                                    })}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                            {errors.salePrice && (
                                <p className="text-red-600 text-sm flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                    {errors.salePrice.message}
                                </p>
                            )}
                        </div>

                        {/* Sale Price Expiration */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Sale Expiration
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    {...register("salePriceExpiration")}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricingSection;