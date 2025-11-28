"use client";

import React, { useEffect, useState } from "react";
import { X, Search, Check } from "lucide-react";
import { Category } from "../types";
import { axiosClient } from "@/app/utils";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";

interface CategorySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCategories: Category[];
    onSave: (categories: Category[]) => void;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
    isOpen,
    onClose,
    selectedCategories,
    onSave,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [tempSelected, setTempSelected] = useState<Category[]>([]);

    useEffect(() => {
        if (isOpen) {
            setTempSelected([...selectedCategories]);
            if (categories.length === 0) {
                fetchCategories();
            }
        }
    }, [isOpen, selectedCategories]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get("/api/Categories/");
            setCategories(response.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (category: Category) => {
        const isSelected = tempSelected.some((cat) => cat.id === category.id);
        if (isSelected) {
            setTempSelected(tempSelected.filter((cat) => cat.id !== category.id));
        } else {
            setTempSelected([...tempSelected, category]);
        }
    };

    const handleSave = () => {
        onSave(tempSelected);
        onClose();
    };

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.parentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Select Categories</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Choose one or more categories for your product
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    {tempSelected.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="font-medium text-indigo-600">
                                {tempSelected.length} selected
                            </span>
                            <button
                                onClick={() => setTempSelected([])}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            {searchTerm ? "No categories match your search" : "No categories available"}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredCategories.map((category) => {
                                const isSelected = tempSelected.some(
                                    (cat) => cat.id === category.id
                                );
                                return (
                                    <label
                                        key={category.id}
                                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                                            isSelected
                                                ? "border-indigo-500 bg-indigo-50"
                                                : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleCategory(category)}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {category.name}
                                            </div>
                                            {category.parentName && (
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {category.parentName}
                                                </div>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Check className="h-4 w-4" />
                        Save Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategorySelectionModal;
