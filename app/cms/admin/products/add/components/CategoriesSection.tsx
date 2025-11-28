"use client";

import React, { useState } from "react";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Tag, Plus, X } from "lucide-react";
import { AddProductFormData, Category } from "../types";
import CategorySelectionModal from "./CategorySelectionModal";

interface CategoriesSectionProps {
    watch: UseFormWatch<AddProductFormData>;
    setValue: UseFormSetValue<AddProductFormData>;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ watch, setValue }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const selectedCategories = watch("categories") || [];

    const handleSaveCategories = (categories: Category[]) => {
        setValue("categories", categories);
    };

    const removeCategory = (categoryId: number) => {
        setValue(
            "categories",
            selectedCategories.filter((cat) => cat.categoryId !== categoryId)
        );
    };

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Tag className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                                <p className="text-sm text-gray-600">Organize your product with categories</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Select Categories
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {selectedCategories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Tag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No categories selected</p>
                            <p className="text-xs mt-1">Click "Select Categories" to add categories to your product</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {selectedCategories.map((category) => (
                                    <div
                                        key={category.categoryId}
                                        className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm"
                                    >
                                        <span className="font-medium text-indigo-900">
                                            {category.categoryName}
                                        </span>
                                        {category.parentCategoryName && (
                                            <span className="text-indigo-600 text-xs">
                                                ({category.parentCategoryName})
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeCategory(category.categoryId)}
                                            className="ml-1 p-1 hover:bg-indigo-100 rounded transition-colors"
                                        >
                                            <X className="h-3 w-3 text-indigo-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-indigo-600">{selectedCategories.length}</span>{" "}
                                    categor{selectedCategories.length === 1 ? "y" : "ies"} selected
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CategorySelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedCategories={selectedCategories}
                onSave={handleSaveCategories}
            />
        </>
    );
};

export default CategoriesSection;
