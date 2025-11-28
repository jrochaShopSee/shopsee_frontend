"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { settingsApi } from "@/app/services/settingsApi";
import { CapabilityManagement } from "@/app/types/Role";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";

export default function CapabilitiesPage() {
    const [capabilities, setCapabilities] = useState<CapabilityManagement[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCapability, setSelectedCapability] = useState<CapabilityManagement | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        capabilityName: "",
        isActive: true,
    });

    const loadCapabilities = useCallback(
        async (reset = false) => {
            try {
                setIsLoading(true);
                const currentSkip = reset ? 0 : skip;
                const response = await settingsApi.getCapabilitiesManagement({
                    skip: currentSkip,
                    take: 50,
                    search: searchTerm,
                });

                if (reset) {
                    setCapabilities(response.data);
                    setSkip(response.data.length);
                } else {
                    setCapabilities((prev) => [...prev, ...response.data]);
                    setSkip((prev) => prev + response.data.length);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
            } catch (error) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error(err.response?.data?.message || "Failed to load capabilities");
            } finally {
                setIsLoading(false);
            }
        },
        [skip, searchTerm]
    );

    useEffect(() => {
        setSkip(0);
        setCapabilities([]);
        loadCapabilities(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSkip(0);
        setCapabilities([]);
        loadCapabilities(true);
    };

    const handleAdd = () => {
        setFormData({
            capabilityName: "",
            isActive: true,
        });
        setShowAddModal(true);
    };

    const handleEdit = (capability: CapabilityManagement) => {
        setSelectedCapability(capability);
        setFormData({
            capabilityName: capability.capabilityName,
            isActive: capability.isActive,
        });
        setShowEditModal(true);
    };

    const handleDelete = (capability: CapabilityManagement) => {
        setSelectedCapability(capability);
        setShowDeleteModal(true);
    };

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await settingsApi.createCapability({
                capabilityName: formData.capabilityName,
                isActive: formData.isActive,
            });
            toast.success("Capability created successfully");
            setShowAddModal(false);
            setSkip(0);
            setCapabilities([]);
            loadCapabilities(true);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to create capability");
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCapability) return;

        try {
            await settingsApi.updateCapability(selectedCapability.capabilityId, {
                capabilityId: selectedCapability.capabilityId,
                capabilityName: formData.capabilityName,
                isActive: formData.isActive,
            });
            toast.success("Capability updated successfully");
            setShowEditModal(false);
            setSkip(0);
            setCapabilities([]);
            loadCapabilities(true);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to update capability");
        }
    };

    const confirmDelete = async () => {
        if (!selectedCapability) return;

        try {
            await settingsApi.deleteCapability(selectedCapability.capabilityId);
            toast.success("Capability deleted successfully");
            setShowDeleteModal(false);
            setSkip(0);
            setCapabilities([]);
            loadCapabilities(true);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to delete capability");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Search className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Capabilities Management</h1>
                                <p className="text-sm text-gray-600">Manage system capabilities</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <form onSubmit={handleSearch} className="flex-1 max-w-md">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search capabilities..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                            </form>
                            <button
                                onClick={handleAdd}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Capability
                            </button>
                        </div>

                        <InfiniteScrollList
                            data={capabilities}
                            loading={isLoading}
                            hasMore={hasMore}
                            endReached={() => loadCapabilities(false)}
                            itemContent={(_, capability) => (
                                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 border-b border-gray-100">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">{capability.capabilityName}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                capability.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {capability.isActive ? "Active" : "Inactive"}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(capability)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(capability)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            emptyTitle="No capabilities found"
                            emptyMessage="Get started by adding your first capability"
                            height={600}
                            footerEnd={`All capabilities loaded (${totalCount} total)`}
                        />
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Capability</h2>
                        <form onSubmit={handleSubmitAdd}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capability Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.capabilityName}
                                    onChange={(e) => setFormData({ ...formData, capabilityName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedCapability && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Capability</h2>
                        <form onSubmit={handleSubmitEdit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capability Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.capabilityName}
                                    onChange={(e) => setFormData({ ...formData, capabilityName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedCapability && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Delete Capability</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete {selectedCapability.capabilityName}? This action cannot be
                            undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
