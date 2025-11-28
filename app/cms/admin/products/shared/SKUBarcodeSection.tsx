"use client";

import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { Package, BarChart3, ToggleLeft, AlertTriangle } from "lucide-react";
import { AddProductFormData } from "../add/types";

interface SKUBarcodeSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    watch: UseFormWatch<AddProductFormData>;
}

const SKUBarcodeSection: React.FC<SKUBarcodeSectionProps> = ({
    register,
    errors,
    watch
}) => {
    const [showFields, setShowFields] = useState(false);
    const sku = watch("sku");
    const barcode = watch("barcode");

    // Show fields if they have values or if toggle is enabled
    React.useEffect(() => {
        if (sku || barcode) {
            setShowFields(true);
        }
    }, [sku, barcode]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Product Identification</h2>
                            <p className="text-sm text-gray-600">Optional SKU and barcode information</p>
                        </div>
                    </div>
                    
                    {/* Toggle */}
                    <div className="flex items-center space-x-2">
                        <ToggleLeft 
                            className={`h-4 w-4 ${showFields ? 'text-blue-600' : 'text-gray-400'}`} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowFields(!showFields)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                showFields ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    showFields ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            {showFields ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content - Only show when enabled */}
            {showFields && (
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SKU Field */}
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <Package className="h-4 w-4 mr-2 text-blue-500" />
                                SKU (Stock Keeping Unit)
                            </label>
                            <input
                                type="text"
                                {...register("sku")}
                                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.sku 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                placeholder="e.g., PROD-001, SKU123"
                            />
                            {errors.sku && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                                    {errors.sku.message}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                💡 Internal product identifier for inventory management
                            </p>
                        </div>

                        {/* Barcode Field */}
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
                                Barcode
                            </label>
                            <input
                                type="text"
                                {...register("barcode")}
                                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.barcode 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                placeholder="e.g., 1234567890123"
                            />
                            {errors.barcode && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                                    {errors.barcode.message}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                💡 UPC, EAN, or other barcode number for retail scanning
                            </p>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <Package className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-900 mb-1">
                                    Product Identification Benefits
                                </h4>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• SKU helps with internal inventory tracking and organization</li>
                                    <li>• Barcode enables retail POS scanning and automated processes</li>
                                    <li>• Both fields are optional but recommended for business operations</li>
                                    <li>• Can be added or updated later if not available now</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SKUBarcodeSection;