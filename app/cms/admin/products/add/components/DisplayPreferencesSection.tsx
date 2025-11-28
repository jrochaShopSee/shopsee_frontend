"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { Settings, Palette, Type, Eye, AlertTriangle } from "lucide-react";
import { ProductFormData } from "@/app/types/Product";
import { AddProductFormData } from "../types";


interface DisplayPreferencesSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    watch: UseFormWatch<AddProductFormData>;
    formData: ProductFormData;
}

const DisplayPreferencesSection: React.FC<DisplayPreferencesSectionProps> = ({
    register,
    errors,
    watch,
    formData,
}) => {
    const priceColor = watch("priceColor") || "#000000";

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Display Preferences</h2>
                        <p className="text-sm text-gray-600">Customize how your product appears to customers</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Show Price Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <Eye className="h-5 w-5 text-gray-600" />
                        <div>
                            <label className="text-sm font-medium text-gray-700">Show Price</label>
                            <p className="text-xs text-gray-500">Display the price to customers</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            {...register("showPrice")}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>

                {/* Price Color */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Palette className="h-4 w-4 text-purple-600" />
                        Price Color
                    </label>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="color"
                                {...register("priceColor")}
                                className="h-12 w-24 rounded-lg border border-gray-300 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                {...register("priceColor")}
                                placeholder="#000000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors font-mono text-sm"
                            />
                        </div>
                        <div
                            className="px-4 py-2 rounded-lg border-2 text-sm font-semibold"
                            style={{
                                color: priceColor,
                                borderColor: priceColor + "40",
                                backgroundColor: priceColor + "10"
                            }}
                        >
                            $99.99
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Choose the color that will be used to display the product price</p>
                </div>

                {/* Button Text */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Type className="h-4 w-4 text-purple-600" />
                        Button Text
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            {...register("buttonText", {
                                maxLength: { value: 20, message: "Button text cannot exceed 20 characters" }
                            })}
                            placeholder="Buy Now"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        />
                        <div className="absolute right-3 top-2">
                            <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                                {(watch("buttonText") as string) || "Buy Now"}
                            </span>
                        </div>
                    </div>
                    {errors.buttonText && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            {errors.buttonText.message}
                        </p>
                    )}
                    <p className="text-xs text-gray-500">This text will appear on the purchase button</p>
                </div>

                {/* Header Type */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Header Type</label>
                    <select
                        {...register("headerType")}
                        defaultValue="Text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                        {formData.headerTypes?.map((header) => (
                            <option key={header.Value} value={header.Value}>
                                {header.Text}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500">Choose how the product header should be displayed (defaults to Text)</p>
                </div>

                {/* Preview Card */}
                <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                    </h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Sample Product</h4>
                            <p className="text-sm text-gray-600">This is how your product will appear</p>
                            <div className="flex items-center justify-between">
                                <div style={{ color: priceColor }} className="text-lg font-bold">
                                    $99.99
                                </div>
                                <button
                                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-medium"
                                    disabled
                                >
                                    {(watch("buttonText") as string) || "Buy Now"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisplayPreferencesSection;