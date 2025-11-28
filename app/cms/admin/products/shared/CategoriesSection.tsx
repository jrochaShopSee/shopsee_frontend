"use client";

import React, { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FolderTree, Search, Check, ChevronRight, ChevronDown, X, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { AddProductFormData } from "../add/types";
import { categoriesApi, Category } from "@/app/services/categoriesApi";

interface CategoriesSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    watch: UseFormWatch<AddProductFormData>;
    setValue: UseFormSetValue<AddProductFormData>;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ errors, watch, setValue }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    const selectedCategories = watch("categories") || [];

    // Load categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const data = await categoriesApi.getNestedCategories();
                console.log(data);
                setCategories(data);
            } catch (error) {
                console.error("Error loading categories:", error);
                toast.error("Failed to load categories");
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    // Filter categories based on search term
    const filterCategories = (cats: Category[], term: string): Category[] => {
        if (!term) return cats;

        return cats
            .filter((category) => {
                const nameMatch = category.name.toLowerCase().includes(term.toLowerCase());
                const hasMatchingChildren = category.children && filterCategories(category.children, term).length > 0;

                if (nameMatch || hasMatchingChildren) {
                    return {
                        ...category,
                        children: category.children ? filterCategories(category.children, term) : [],
                    };
                }
                return false;
            })
            .map((category) => ({
                ...category,
                children: category.children ? filterCategories(category.children, term) : [],
            }));
    };

    const filteredCategories = filterCategories(categories, searchTerm);

    // Check if category is selected
    const isCategorySelected = (categoryId: number): boolean => {
        return selectedCategories.some((cat) => cat.id === categoryId);
    };

    // Check if category has selected children
    const hasSelectedChildren = (category: Category): boolean => {
        if (!category.children) return false;

        return category.children.some((child) => isCategorySelected(child.id) || hasSelectedChildren(child));
    };

    // Toggle category selection
    const toggleCategory = (category: Category) => {
        const isSelected = isCategorySelected(category.id);
        let newSelectedCategories = [...selectedCategories];

        if (isSelected) {
            // Remove this category and all its children
            newSelectedCategories = newSelectedCategories.filter((cat) => cat.id !== category.id && !isDescendantOf(cat.id, category));
        } else {
            // Add this category
            newSelectedCategories.push(category);

            // Auto-select parent if not already selected
            if (category.parentId) {
                const parent = findCategoryById(categories, category.parentId);
                if (parent && !isCategorySelected(parent.id)) {
                    newSelectedCategories.push(parent);
                }
            }

            // Auto-select all children
            if (category.children) {
                const childrenToAdd = getAllDescendants(category);
                childrenToAdd.forEach((child) => {
                    if (!newSelectedCategories.some((cat) => cat.id === child.id)) {
                        newSelectedCategories.push(child);
                    }
                });
            }
        }

        setValue("categories", newSelectedCategories, { shouldValidate: true });
    };

    // Helper function to check if a category is a descendant of another
    const isDescendantOf = (categoryId: number, parentCategory: Category): boolean => {
        if (!parentCategory.children) return false;

        return parentCategory.children.some((child) => child.id === categoryId || isDescendantOf(categoryId, child));
    };

    // Helper function to get all descendants of a category
    const getAllDescendants = (category: Category): Category[] => {
        if (!category.children) return [];

        let descendants: Category[] = [...category.children];

        category.children.forEach((child) => {
            descendants = [...descendants, ...getAllDescendants(child)];
        });

        return descendants;
    };

    // Helper function to find category by ID
    const findCategoryById = (cats: Category[], id: number): Category | null => {
        for (const cat of cats) {
            if (cat.id === id) return cat;
            if (cat.children) {
                const found = findCategoryById(cat.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    // Toggle expanded state
    const toggleExpanded = (categoryId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    // Render category tree
    const renderCategory = (category: Category, level: number = 0): React.ReactNode => {
        const isSelected = isCategorySelected(category.id);
        const isExpanded = expandedCategories.has(category.id);
        const hasChildren = category.children && category.children.length > 0;
        const hasSelectedDesc = hasSelectedChildren(category);

        return (
            <div key={category.id} className="select-none">
                <div className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50 border border-blue-200" : ""}`} style={{ marginLeft: `${level * 20}px` }} onClick={() => toggleCategory(category)}>
                    {/* Expand/Collapse Button */}
                    {hasChildren && (
                        <button type="button" onClick={(e) => toggleExpanded(category.id, e)} className="flex items-center justify-center w-5 h-5 mr-2 text-gray-400 hover:text-gray-600">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    )}

                    {/* Spacer for categories without children */}
                    {!hasChildren && <div className="w-7 mr-2" />}

                    {/* Selection Checkbox */}
                    <div className={`w-4 h-4 mr-3 border rounded flex items-center justify-center ${isSelected ? "bg-blue-500 border-blue-500" : hasSelectedDesc ? "bg-blue-100 border-blue-300" : "border-gray-300"}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        {!isSelected && hasSelectedDesc && <div className="w-2 h-2 bg-blue-400 rounded-full" />}
                    </div>

                    {/* Category Name */}
                    <span className={`flex-1 text-sm ${isSelected ? "font-medium text-blue-900" : "text-gray-700"}`}>{category.name}</span>

                    {/* Children Count */}
                    {hasChildren && <span className="text-xs text-gray-500 ml-2">({category.children!.length})</span>}
                </div>

                {/* Children */}
                {hasChildren && isExpanded && <div className="mt-1">{category.children!.map((child) => renderCategory(child, level + 1))}</div>}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <FolderTree className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                            <p className="text-sm text-gray-600">Loading categories...</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <FolderTree className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                        <p className="text-sm text-gray-600">Select product categories - parent categories are auto-selected</p>
                    </div>
                    <div className="text-sm text-gray-600">{selectedCategories.length} selected</div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                {/* Selected Categories Summary */}
                {selectedCategories.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Categories:</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((category) => (
                                <span key={category.id} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {category.name}
                                    <button type="button" onClick={() => toggleCategory(category)} className="ml-1 text-blue-600 hover:text-blue-800">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Category Tree */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {filteredCategories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FolderTree className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">{searchTerm ? "No categories found matching your search." : "No categories available."}</p>
                        </div>
                    ) : (
                        <div className="space-y-1">{filteredCategories.map((category) => renderCategory(category))}</div>
                    )}
                </div>

                {errors.categories && (
                    <p className="text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                        {errors.categories.message}
                    </p>
                )}

                {/* Info Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <FolderTree className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                        <div>
                            <h4 className="text-sm font-medium text-green-900 mb-1">Category Selection Tips</h4>
                            <ul className="text-xs text-green-700 space-y-1">
                                <li>• Selecting a child category automatically selects its parent</li>
                                <li>• Selecting a parent category automatically selects all children</li>
                                <li>• Use search to quickly find specific categories</li>
                                <li>• Categories help customers discover your products</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesSection;
