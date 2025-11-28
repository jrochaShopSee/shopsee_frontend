import React, { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "@/app/utils/axiosClient";

interface Category {
    categoryId: number;
    categoryName: string;
}

interface CategorySelectorProps {
    selectedCategories: number[];
    onCategoriesChange: (categoryIds: number[]) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
    selectedCategories,
    onCategoriesChange,
}) => {
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Category[]>([]);
    const [selectedCategoryNames, setSelectedCategoryNames] = useState<Map<number, string>>(new Map());
    const [isSearching, setIsSearching] = useState(false);

    // Load category names when selectedCategories changes (for edit page)
    useEffect(() => {
        const loadCategoryNames = async () => {
            if (selectedCategories.length === 0) return;

            // Check if we already have names for all selected categories
            const missingNames = selectedCategories.filter(id => !selectedCategoryNames.has(id));
            if (missingNames.length === 0) return;

            try {
                const response = await axiosClient.post<{ categories: Category[] }>(
                    "/api/Categories/GetByIds",
                    { categoryIds: missingNames }
                );

                const newMap = new Map(selectedCategoryNames);
                response.data.categories.forEach(cat => {
                    newMap.set(cat.categoryId, cat.categoryName);
                });
                setSelectedCategoryNames(newMap);
            } catch (error) {
                console.error("Failed to load category names:", error);
                // Don't show error toast - categories will just show as "Category {id}"
            }
        };

        loadCategoryNames();
    }, [selectedCategories]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast.warning("Please enter a search term");
            return;
        }

        setIsSearching(true);
        try {
            const response = await axiosClient.post<{ categories: Category[] }>(
                "/api/Categories/Search",
                {
                    SearchValue: searchTerm,
                    ResultCount: 20,
                    Skip: 0,
                }
            );

            setSearchResults(response.data.categories || []);
        } catch (error) {
            console.error("Failed to search categories:", error);
            toast.error("Failed to search categories");
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddCategory = (category: Category) => {
        if (selectedCategories.includes(category.categoryId)) {
            toast.error("Category already added");
            return;
        }

        const newCategories = [...selectedCategories, category.categoryId];
        onCategoriesChange(newCategories);

        // Store category name for display
        const newMap = new Map(selectedCategoryNames);
        newMap.set(category.categoryId, category.categoryName);
        setSelectedCategoryNames(newMap);

        toast.success(`${category.categoryName} added`);
    };

    const handleRemoveCategory = (categoryId: number) => {
        const newCategories = selectedCategories.filter((id) => id !== categoryId);
        onCategoriesChange(newCategories);

        const newMap = new Map(selectedCategoryNames);
        newMap.delete(categoryId);
        setSelectedCategoryNames(newMap);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                <button
                    type="button"
                    onClick={() => setShowSearch(!showSearch)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    {showSearch ? "Hide Search" : "Add Categories"}
                </button>
            </div>

            {/* Search Section */}
            {showSearch && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex gap-2 mb-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Search category name..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Search className="h-4 w-4" />
                            {isSearching ? "Searching..." : "Search"}
                        </button>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {searchResults.map((category) => (
                                <div
                                    key={category.categoryId}
                                    className="flex items-center justify-between p-2 hover:bg-white rounded transition-colors"
                                >
                                    <span className="text-sm text-gray-700">{category.categoryName}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleAddCategory(category)}
                                        disabled={selectedCategories.includes(category.categoryId)}
                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Add category"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {searchResults.length === 0 && searchTerm && !isSearching && (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No categories found. Try a different search term.
                        </p>
                    )}
                </div>
            )}

            {/* Selected Categories */}
            <div className="space-y-2">
                {selectedCategories.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No categories selected</p>
                )}

                {selectedCategories.map((categoryId) => (
                    <div
                        key={categoryId}
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                        <span className="text-sm font-medium text-gray-900">
                            {selectedCategoryNames.get(categoryId) || `Category ${categoryId}`}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleRemoveCategory(categoryId)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Remove category"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
