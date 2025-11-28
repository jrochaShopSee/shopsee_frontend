"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Hash, AlertTriangle } from "lucide-react";
import { AddProductFormData } from "../types";

interface ProductIdentificationSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
}

const ProductIdentificationSection: React.FC<ProductIdentificationSectionProps> = ({
    register,
    errors,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                        <Hash className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Product Identification</h2>
                        <p className="text-sm text-gray-600">SKU and barcode information</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SKU */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            SKU (Stock Keeping Unit)
                        </label>
                        <input
                            type="text"
                            {...register("sku")}
                            placeholder="e.g., PROD-001"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                        />
                        {errors.sku && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                {errors.sku.message}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">
                            💡 Unique identifier for inventory tracking
                        </p>
                    </div>

                    {/* Barcode */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Barcode
                        </label>
                        <input
                            type="text"
                            {...register("barcode")}
                            placeholder="e.g., 123456789012"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                        />
                        {errors.barcode && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                {errors.barcode.message}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">
                            💡 UPC, EAN, or other barcode format
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductIdentificationSection;