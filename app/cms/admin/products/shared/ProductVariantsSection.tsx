"use client";

import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Package2, Plus, Trash2, DollarSign, Edit2 } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { AddProductFormData, VariationOption, VariationCombination } from "../add/types";

interface ProductVariantsSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    watch: UseFormWatch<AddProductFormData>;
    setValue: UseFormSetValue<AddProductFormData>;
}

const ProductVariantsSection: React.FC<ProductVariantsSectionProps> = ({
    watch,
    setValue
}) => {
    const variations = watch("variations");
    const [newOptionName, setNewOptionName] = useState("");
    const [newOptionValues, setNewOptionValues] = useState("");
    const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
    const [editOptionName, setEditOptionName] = useState("");
    const [editOptionValues, setEditOptionValues] = useState("");

    const addVariationOption = () => {
        if (!newOptionName.trim() || !newOptionValues.trim()) return;

        const values = newOptionValues.split(',').map(v => v.trim()).filter(Boolean);
        if (values.length === 0) return;

        const newOption: VariationOption = {
            id: Date.now(),
            name: newOptionName.trim(),
            values: values
        };

        const currentVariations = variations || { options: [], combinations: [] };
        const updatedOptions = [...currentVariations.options, newOption];
        
        // Generate new combinations
        const newCombinations = generateCombinations(updatedOptions);

        setValue("variations", {
            options: updatedOptions,
            combinations: newCombinations
        }, { shouldValidate: true });

        // Reset form
        setNewOptionName("");
        setNewOptionValues("");
    };

    const removeVariationOption = (optionId: number) => {
        if (!variations) return;

        const updatedOptions = variations.options.filter(opt => opt.id !== optionId);
        const newCombinations = generateCombinations(updatedOptions);

        setValue("variations", {
            options: updatedOptions,
            combinations: newCombinations
        }, { shouldValidate: true });
    };

    const startEditingOption = (option: VariationOption) => {
        setEditingOptionId(option.id!);
        setEditOptionName(option.name);
        setEditOptionValues(option.values.join(', '));
    };

    const saveEditingOption = () => {
        if (!variations || !editingOptionId || !editOptionName.trim() || !editOptionValues.trim()) return;

        const values = editOptionValues.split(',').map(v => v.trim()).filter(Boolean);
        if (values.length === 0) return;

        const updatedOptions = variations.options.map(opt =>
            opt.id === editingOptionId
                ? { ...opt, name: editOptionName.trim(), values: values }
                : opt
        );

        const newCombinations = generateCombinations(updatedOptions);

        setValue("variations", {
            options: updatedOptions,
            combinations: newCombinations
        }, { shouldValidate: true });

        // Reset edit state
        setEditingOptionId(null);
        setEditOptionName("");
        setEditOptionValues("");
    };

    const cancelEditingOption = () => {
        setEditingOptionId(null);
        setEditOptionName("");
        setEditOptionValues("");
    };

    const generateCombinations = (options: VariationOption[]): VariationCombination[] => {
        if (options.length === 0) return [];

        // Generate all possible combinations
        const combinations: VariationCombination[] = [];
        
        const generateRecursive = (
            currentCombination: { [key: string]: string },
            remainingOptions: VariationOption[]
        ) => {
            if (remainingOptions.length === 0) {
                combinations.push({
                    id: Date.now() + Math.random(),
                    options: { ...currentCombination },
                    price: undefined,
                    salePrice: undefined,
                    sku: "",
                    barcode: "",
                    currentInventory: 0,
                    length: undefined,
                    width: undefined,
                    height: undefined,
                    weight: undefined
                });
                return;
            }

            const [firstOption, ...restOptions] = remainingOptions;
            firstOption.values.forEach(value => {
                generateRecursive(
                    { ...currentCombination, [firstOption.name]: value },
                    restOptions
                );
            });
        };

        generateRecursive({}, options);
        return combinations;
    };

    const updateCombination = (
        combinationId: number,
        field: keyof VariationCombination,
        value: string | number | undefined
    ) => {
        if (!variations) return;

        const updatedCombinations = variations.combinations.map(combo =>
            combo.id === combinationId
                ? { ...combo, [field]: value }
                : combo
        );

        setValue("variations", {
            ...variations,
            combinations: updatedCombinations
        }, { shouldValidate: true });
    };

    const getCombinationDisplayName = (combination: VariationCombination): string => {
        return Object.entries(combination.options)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Package2 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
                        <p className="text-sm text-gray-600">Define size, color, and other product variations</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Add New Variation Option */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Add Variation Option</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Option Name
                            </label>
                            <input
                                type="text"
                                value={newOptionName}
                                onChange={(e) => setNewOptionName(e.target.value)}
                                placeholder="e.g., Size, Color, Material"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Values (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={newOptionValues}
                                onChange={(e) => setNewOptionValues(e.target.value)}
                                placeholder="e.g., Small, Medium, Large"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    
                    <Button
                        type="button"
                        onClick={addVariationOption}
                        disabled={!newOptionName.trim() || !newOptionValues.trim()}
                        className="flex items-center space-x-2"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Option</span>
                    </Button>
                </div>

                {/* Current Options */}
                {variations && variations.options.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900">Variation Options</h3>
                        
                        <div className="space-y-3">
                            {variations.options.map((option) => (
                                <div key={option.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                    {editingOptionId === option.id ? (
                                        /* Edit Mode */
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Option Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editOptionName}
                                                    onChange={(e) => setEditOptionName(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Values (comma-separated)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editOptionValues}
                                                    onChange={(e) => setEditOptionValues(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={saveEditingOption}
                                                    disabled={!editOptionName.trim() || !editOptionValues.trim()}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={cancelEditingOption}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* View Mode */
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900">{option.name}</h4>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {option.values.map((value, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                                                        >
                                                            {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => startEditingOption(option)}
                                                    className="flex items-center space-x-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <span>Edit</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeVariationOption(option.id!)}
                                                    className="flex items-center space-x-1 text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    <span>Remove</span>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generated Combinations */}
                {variations && variations.combinations.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900">
                            Product Combinations ({variations.combinations.length})
                        </h3>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-xs text-yellow-700">
                                💡 Each combination represents a unique product variant that customers can purchase.
                                Configure pricing, identification (SKU/Barcode), physical dimensions, and inventory for each combination.
                            </p>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto space-y-3">
                            {variations.combinations.map((combination) => (
                                <div key={combination.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-900">
                                            {getCombinationDisplayName(combination)}
                                        </h4>
                                        <div className="text-xs text-gray-500">
                                            ID: {combination.id?.toString().slice(-6)}
                                        </div>
                                    </div>
                                    
                                    {/* Combination Properties Table */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Pricing Row */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={combination.price || ""}
                                                        onChange={(e) => updateCombination(combination.id!, 'price', parseFloat(e.target.value) || undefined)}
                                                        className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Sale Price</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={combination.salePrice || ""}
                                                        onChange={(e) => updateCombination(combination.id!, 'salePrice', parseFloat(e.target.value) || undefined)}
                                                        className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Inventory</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={combination.currentInventory || ""}
                                                    onChange={(e) => updateCombination(combination.id!, 'currentInventory', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        {/* Identification Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                                                <input
                                                    type="text"
                                                    value={combination.sku || ""}
                                                    onChange={(e) => updateCombination(combination.id!, 'sku', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="SKU-001"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Barcode</label>
                                                <input
                                                    type="text"
                                                    value={combination.barcode || ""}
                                                    onChange={(e) => updateCombination(combination.id!, 'barcode', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="123456789012"
                                                />
                                            </div>
                                        </div>

                                        {/* Dimensions Row */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Length (in)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={combination.length || ""}
                                                    onChange={(e) => updateCombination(combination.id!, 'length', parseFloat(e.target.value) || undefined)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Width (in)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={combination.width || ""}
                                                    onChange={(e) => updateCombination(combination.id!, 'width', parseFloat(e.target.value) || undefined)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Height (in)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={combination.height || ""}
                                                    onChange={(e) => updateCombination(combination.id!, 'height', parseFloat(e.target.value) || undefined)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Weight (lbs)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={combination.weight || ""}
                                                    onChange={(e) => updateCombination(combination.id!, 'weight', parseFloat(e.target.value) || undefined)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <Package2 className="h-5 w-5 text-orange-500 mt-0.5 mr-3" />
                        <div>
                            <h4 className="text-sm font-medium text-orange-900 mb-1">
                                Product Variants Guide
                            </h4>
                            <ul className="text-xs text-orange-700 space-y-1">
                                <li>• Create options like "Size" with values "Small, Medium, Large"</li>
                                <li>• Combinations are automatically generated from all option values</li>
                                <li>• Set individual pricing, dimensions, and inventory for each combination</li>
                                <li>• Each combination can have unique SKU, barcode, and shipping dimensions</li>
                                <li>• Pricing includes both regular price and sale price options</li>
                                <li>• Remove options to regenerate combinations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductVariantsSection;