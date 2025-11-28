"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Edit2, Trash2, List } from "lucide-react";
import { settingsApi } from "@/app/services/settingsApi";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import {
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    ParentCategoryDropdownItem,
    SubCategory,
} from "@/app/types/Role";

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [parentCategories, setParentCategories] = useState<ParentCategoryDropdownItem[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSubCategoriesModal, setShowSubCategoriesModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [skip] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const take = 50;

    // Form state
    const [formData, setFormData] = useState<CreateCategoryRequest | UpdateCategoryRequest>({
        categoryName: "",
        isActive: true,
        parentCategoryId: undefined,
    });

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await settingsApi.getCategories({ skip, take, search: searchTerm });
            setCategories(response.data);
            setTotalCount(response.totalCount);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    }, [skip, searchTerm]);

    const loadParentCategories = useCallback(async () => {
        try {
            const data = await settingsApi.getParentCategoriesDropdown();
            setParentCategories(data);
        } catch {
            toast.error("Failed to load parent categories");
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        loadParentCategories();
    }, [loadParentCategories]);

    const resetForm = () => {
        setFormData({
            categoryName: "",
            isActive: true,
            parentCategoryId: undefined,
        });
    };

    const handleAdd = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            isActive: category.isActive,
            parentCategoryId: category.parentCategoryId,
        });
        setShowEditModal(true);
    };

    const handleDelete = (id: number, name: string) => {
        setDeleteId(id);
        setDeleteName(name);
        setShowDeleteModal(true);
    };

    const handleViewSubCategories = async (category: Category) => {
        try {
            setSelectedCategory(category);
            setSelectedCategoryName(category.categoryName);
            const response = await settingsApi.getSubCategories(category.categoryId);
            setSubCategories(response.data);
            setShowSubCategoriesModal(true);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to load subcategories");
        }
    };

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.categoryName.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            await settingsApi.createCategory(formData as CreateCategoryRequest);
            toast.success("Category created successfully");
            setShowAddModal(false);
            resetForm();
            loadCategories();
            loadParentCategories();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to create category");
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.categoryName.trim()) {
            toast.error("Category name is required");
            return;
        }

        const updateData = formData as UpdateCategoryRequest;
        if (!updateData.categoryId) return;

        const wasEditingSubCategory = showSubCategoriesModal;
        const parentCategoryId = selectedCategory?.parentCategoryId;

        try {
            await settingsApi.updateCategory(updateData.categoryId, updateData);
            toast.success("Category updated successfully");
            setShowEditModal(false);
            resetForm();
            setSelectedCategory(null);
            loadCategories();
            loadParentCategories();

            // If we edited a subcategory from the subcategories modal, reload the subcategories
            if (wasEditingSubCategory && parentCategoryId) {
                const response = await settingsApi.getSubCategories(parentCategoryId);
                setSubCategories(response.data);
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to update category");
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        const wasSubCategoriesModalOpen = showSubCategoriesModal;
        const parentCategoryId = selectedCategory?.categoryId;

        try {
            await settingsApi.deleteCategory(deleteId);
            toast.success("Category deleted successfully");
            setShowDeleteModal(false);
            setDeleteId(null);
            setDeleteName("");
            loadCategories();
            loadParentCategories();

            // If we deleted from the subcategories modal, reload the subcategories
            if (wasSubCategoriesModalOpen && parentCategoryId) {
                const response = await settingsApi.getSubCategories(parentCategoryId);
                setSubCategories(response.data);
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to delete category");
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadCategories();
    };

    const renderModal = (
        show: boolean,
        onClose: () => void,
        title: string,
        onSubmit: (e: React.FormEvent) => void
    ) => {
        if (!show) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                            type="button"
                        >
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.categoryName}
                                onChange={(e) =>
                                    setFormData({ ...formData, categoryName: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Parent Category
                            </label>
                            <select
                                value={formData.parentCategoryId || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        parentCategoryId: e.target.value ? parseInt(e.target.value) : undefined,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-600"
                            >
                                <option value="">Please Select</option>
                                {parentCategories
                                    .filter((cat) => {
                                        // For edit modal, exclude the current category
                                        if (showEditModal && selectedCategory) {
                                            return cat.value !== selectedCategory.categoryId;
                                        }
                                        return true;
                                    })
                                    .map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.text}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) =>
                                    setFormData({ ...formData, isActive: e.target.checked })
                                }
                                className="h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Active
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700"
                            >
                                {title === "Add Category" ? "Add Category" : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderDeleteModal = () => {
        if (!showDeleteModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Delete Category</h2>
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeleteId(null);
                                setDeleteName("");
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>

                    <div className="p-4">
                        <p className="text-gray-700">
                            Do you want to delete this category? Deleting this category will also delete
                            any subcategories.
                        </p>
                        <p className="mt-2 font-medium text-gray-900">Category: {deleteName}</p>
                    </div>

                    <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeleteId(null);
                                setDeleteName("");
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleEditSubCategory = async (subCategory: SubCategory) => {
        // Close the subcategories modal first
        setShowSubCategoriesModal(false);

        // Load the full category details
        try {
            const categoryDetail = await settingsApi.getCategoryById(subCategory.categoryId);
            const category: Category = {
                categoryId: categoryDetail.categoryId,
                categoryName: categoryDetail.categoryName,
                isActive: categoryDetail.isActive,
                parentCategoryId: categoryDetail.parentCategoryId,
                parentCategoryName: categoryDetail.parentCategoryName,
                subCategoriesCount: 0, // Not needed for editing
            };
            handleEdit(category);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to load subcategory details");
        }
    };

    const handleDeleteSubCategory = (subCategory: SubCategory) => {
        handleDelete(subCategory.categoryId, subCategory.categoryName);
    };

    const renderSubCategoriesModal = () => {
        if (!showSubCategoriesModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Subcategories - {selectedCategoryName}
                        </h2>
                        <button
                            onClick={() => {
                                setShowSubCategoriesModal(false);
                                setSubCategories([]);
                                setSelectedCategory(null);
                                setSelectedCategoryName("");
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1">
                        {subCategories.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No subcategories found</p>
                        ) : (
                            <div className="space-y-2">
                                {subCategories.map((sub) => (
                                    <div
                                        key={sub.categoryId}
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
                                    >
                                        <div>
                                            <span className="font-medium text-gray-900">
                                                {sub.categoryName}
                                            </span>
                                            <span
                                                className={`ml-2 text-sm ${
                                                    sub.isActive ? "text-green-600" : "text-gray-500"
                                                }`}
                                            >
                                                {sub.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditSubCategory(sub)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSubCategory(sub)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end p-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                setShowSubCategoriesModal(false);
                                setSubCategories([]);
                                setSelectedCategory(null);
                                setSelectedCategoryName("");
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700"
                        >
                            <Plus className="h-5 w-5" />
                            Add Category
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search categories..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Categories List */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Active
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr key={category.categoryId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {category.categoryName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={category.isActive}
                                                    disabled
                                                    className="h-4 w-4 text-violet-600 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleViewSubCategories(category)
                                                        }
                                                        className="text-green-600 hover:text-green-900"
                                                        title="View Subcategories"
                                                    >
                                                        <List className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                category.categoryId,
                                                                category.categoryName
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Info */}
                        <div className="mt-4 text-sm text-gray-600">
                            Showing {categories.length} of {totalCount} categories
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            {renderModal(showAddModal, () => setShowAddModal(false), "Add Category", handleSubmitAdd)}
            {renderModal(
                showEditModal,
                () => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                },
                "Edit Category",
                handleSubmitEdit
            )}
            {renderDeleteModal()}
            {renderSubCategoriesModal()}
        </div>
    );
}
