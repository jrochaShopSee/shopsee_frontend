"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Package, AlertTriangle } from "lucide-react";
import { AddProductFormData } from "../types";

interface PhysicalProductDetailsSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    isShopifyProduct?: boolean;
}

const PhysicalProductDetailsSection: React.FC<PhysicalProductDetailsSectionProps> = ({
    register,
    errors,
    isShopifyProduct = false,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Physical Product Details</h2>
                        <p className="text-sm text-gray-600">Product dimensions and weight</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Length */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Length (in) {!isShopifyProduct && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("length", {
                                required: isShopifyProduct ? false : "Length is required for physical products",
                                min: { value: 0.01, message: "Length must be greater than 0" },
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            placeholder="0.00"
                        />
                        {errors.length && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                {errors.length.message}
                            </p>
                        )}
                    </div>

                    {/* Width */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Width (in) {!isShopifyProduct && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("width", {
                                required: isShopifyProduct ? false : "Width is required for physical products",
                                min: { value: 0.01, message: "Width must be greater than 0" },
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            placeholder="0.00"
                        />
                        {errors.width && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                {errors.width.message}
                            </p>
                        )}
                    </div>

                    {/* Height */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Height (in) {!isShopifyProduct && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("height", {
                                required: isShopifyProduct ? false : "Height is required for physical products",
                                min: { value: 0.01, message: "Height must be greater than 0" },
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            placeholder="0.00"
                        />
                        {errors.height && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                {errors.height.message}
                            </p>
                        )}
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Weight (lbs) {!isShopifyProduct && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("weight", {
                                required: isShopifyProduct ? false : "Weight is required for physical products",
                                min: { value: 0.01, message: "Weight must be greater than 0" },
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            placeholder="0.00"
                        />
                        {errors.weight && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                {errors.weight.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">
                        💡 <strong>Tip:</strong> Accurate dimensions are essential for shipping cost calculations and packaging requirements.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PhysicalProductDetailsSection;