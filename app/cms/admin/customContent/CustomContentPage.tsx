"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { toast } from "react-toastify";
import { adminCustomContentApi } from "@/app/services/adminCustomContentApi";
import { CustomContent } from "@/app/types/CustomContent";
import { useDebounce } from "@/app/hooks/useDebounce";
import ConfirmationModal from "@/app/components/shared/ConfirmationModal";
import { useAuth } from "@/app/hooks/useAuth";
import { FileText, Plus, Edit2, Power, PowerOff, Trash2, Search, Building2, Download, FileImage, ImageIcon } from "lucide-react";

const CustomContentPage: React.FC = () => {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [customContent, setCustomContent] = useState<CustomContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [companies, setCompanies] = useState<Array<{ value: string; text: string }>>([]);
    const [, setRole] = useState("");
    const [userCompanyId, setUserCompanyId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "warning" | "danger" | "info" | "success";
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", type: "warning", onConfirm: () => {} });

    // Load custom content (infinite scroll)
    const loadCustomContent = useCallback(
        async (reset = false) => {
            if (!hasMore && !reset) return;

            try {
                if (reset) {
                    setLoading(true);
                    setError(null);
                }

                const params = {
                    skip: reset ? 0 : customContent.length,
                    take: 50,
                    search: debouncedSearchTerm,
                    ...(isAdmin && selectedCompanyId ? { companyId: selectedCompanyId } : {}),
                };

                const response = await adminCustomContentApi.getAll(params);

                if (reset) {
                    setCustomContent(response.data);
                } else {
                    setCustomContent((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setRole(response.role);
                setUserCompanyId(response.userCompanyId ?? null);
            } catch (error: unknown) {
                const errorMessage = error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response && error.response.data && typeof error.response.data === "object" && "message" in error.response.data ? String(error.response.data.message) : "Failed to load custom content";
                setError(errorMessage);
                toast.error("Failed to load custom content");
            } finally {
                setLoading(false);
            }
        },
        [customContent.length, debouncedSearchTerm, selectedCompanyId, isAdmin, hasMore]
    );

    // Load form data for companies dropdown
    const loadFormData = useCallback(async () => {
        try {
            const formData = await adminCustomContentApi.getFormData();
            setCompanies(formData.companies);
            setRole(formData.role);
            setUserCompanyId(formData.userCompanyId ?? null);
        } catch {
            toast.error("Failed to load form data");
        }
    }, []);

    // Initial load
    useEffect(() => {
        const initializeData = async () => {
            await loadFormData();
            await loadCustomContent(true);
        };
        initializeData();
    }, []);

    // Reset and reload when search or company filter changes
    useEffect(() => {
        if (companies.length > 0) {
            loadCustomContent(true);
        }
    }, [debouncedSearchTerm, selectedCompanyId]);

    // Handle search input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Handle company filter change
    const handleCompanyFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedCompanyId(value ? parseInt(value) : null);
    };

    // Handle toggle active status
    const handleToggleActive = async (id: number) => {
        setUpdatingId(id);
        try {
            const response = await adminCustomContentApi.toggleActiveStatus(id);

            setCustomContent((prev) => prev.map((item) => (item.itemContentId === id ? { ...item, isActive: response.isActive } : item)));

            toast.success("Status updated successfully");
        } catch (error: unknown) {
            const errorMessage = error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response && error.response.data && typeof error.response.data === "object" && "message" in error.response.data ? String(error.response.data.message) : "Failed to update status";
            toast.error(errorMessage);
        } finally {
            setUpdatingId(null);
        }
    };

    // Handle delete
    const handleDelete = (id: number, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Custom Content",
            message: `Are you sure you want to delete "${name}"? This will disable all mapped items in videos.`,
            type: "danger",
            onConfirm: () => confirmDelete(id),
        });
    };

    const confirmDelete = async (id: number) => {
        try {
            await adminCustomContentApi.delete(id);
            setCustomContent((prev) => prev.filter((item) => item.itemContentId !== id));
            toast.success("Custom content deleted successfully");
        } catch (error: unknown) {
            const errorMessage = error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response && error.response.data && typeof error.response.data === "object" && "message" in error.response.data ? String(error.response.data.message) : "Failed to delete custom content";
            toast.error(errorMessage);
        } finally {
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
    };

    // Get content type icon
    const getContentTypeIcon = (contentType: string) => {
        switch (contentType) {
            case "Text":
                return <FileText className="w-4 h-4 text-blue-600" />;
            case "Image":
                return <ImageIcon className="w-4 h-4 text-green-600" />;
            case "Image And Text":
                return <FileImage className="w-4 h-4 text-purple-600" />;
            case "Download":
                return <Download className="w-4 h-4 text-orange-600" />;
            default:
                return <FileText className="w-4 h-4 text-gray-600" />;
        }
    };

    // Render custom content item
    const renderCustomContentItem = (index: number, item: CustomContent) => (
        <div key={item.itemContentId} className="border-b border-gray-200 last:border-b-0">
            <div className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            {getContentTypeIcon(item.contentType)}
                            <h3 className="text-lg font-medium text-gray-900 truncate">{item.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{item.isActive ? "Active" : "Inactive"}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span>{item.companyName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {getContentTypeIcon(item.contentType)}
                                <span>{item.contentType}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/cms/admin/customContent/edit/${item.itemContentId}`)} className="flex items-center gap-1">
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => handleToggleActive(item.itemContentId)} disabled={updatingId === item.itemContentId} className={`flex items-center gap-1 ${item.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}`}>
                            {updatingId === item.itemContentId ? <LoadingSpinner /> : item.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            {item.isActive ? "Disable" : "Enable"}
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => handleDelete(item.itemContentId, item.name)} className="flex items-center gap-1 text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Custom Content</h1>
                    <p className="text-gray-600 mt-1">Manage your custom content items</p>
                </div>
                <Button onClick={() => router.push(`/cms/admin/customContent/add${userCompanyId ? `/${userCompanyId}` : ""}`)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Content
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Content</p>
                            <p className="text-2xl font-bold">{customContent.length}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-200" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Active Content</p>
                            <p className="text-2xl font-bold">{customContent.filter((item) => item.isActive).length}</p>
                        </div>
                        <FileText className="h-8 w-8 text-green-200" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Text Content</p>
                            <p className="text-2xl font-bold">{customContent.filter((item) => item.contentType === "Text").length}</p>
                        </div>
                        <FileText className="h-8 w-8 text-purple-200" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Media Content</p>
                            <p className="text-2xl font-bold">{customContent.filter((item) => item.contentType !== "Text").length}</p>
                        </div>
                        <ImageIcon className="h-8 w-8 text-orange-200" />
                    </div>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="p-6 bg-white">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input type="text" placeholder="Search by name, company, or content type..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                    </div>

                    {/* Company Filter (Admin only) */}
                    {isAdmin && (
                        <div className="sm:w-64">
                            <select value={selectedCompanyId || ""} onChange={handleCompanyFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">All Companies</option>
                                {companies.map((company) => (
                                    <option key={company.value} value={company.value}>
                                        {company.text}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </Card>

            {/* Custom Content List */}
            <Card className="bg-white">
                {error ? (
                    <div className="p-8 text-center">
                        <div className="text-red-600 mb-4">
                            <FileText className="w-12 h-12 mx-auto mb-2" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Content</h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <Button onClick={() => loadCustomContent(true)}>Try Again</Button>
                    </div>
                ) : (
                    <InfiniteScrollList
                        data={customContent}
                        loading={loading}
                        hasMore={hasMore}
                        endReached={() => loadCustomContent(false)}
                        itemContent={renderCustomContentItem}
                        emptyIcon={<FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
                        emptyTitle="No Custom Content Found"
                        emptyMessage="Get started by creating your first custom content item."
                        showEmptyReset={!!searchTerm || !!selectedCompanyId}
                        onResetFilters={() => {
                            setSearchTerm("");
                            setSelectedCompanyId(null);
                        }}
                        footerLoading={<LoadingSpinner />}
                        height={600}
                    />
                )}
            </Card>

            <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} />
        </div>
    );
};

export default CustomContentPage;
