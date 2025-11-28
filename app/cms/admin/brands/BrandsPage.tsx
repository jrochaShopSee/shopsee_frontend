"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { toast } from "react-toastify";
import { adminBrandsApi } from "@/app/services/adminBrandsApi";
import { Brand } from "@/app/types/Brand";
import { useDebounce } from "@/app/hooks/useDebounce";
import ConfirmationModal from "@/app/components/shared/ConfirmationModal";
import { Building2, Package, Video, Search, Link as LinkIcon, FileVideo, Download, Eye, X } from "lucide-react";

const BrandsPage: React.FC = () => {
    const router = useRouter();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "warning" | "danger" | "info" | "success";
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", type: "warning", onConfirm: () => {} });

    // Load brands (infinite scroll)
    const loadBrands = useCallback(
        async (reset = false) => {
            if (!hasMore && !reset) return;
            setError(null);
            if (reset) setLoading(true);
            const skip = reset ? 0 : brands.length;
            try {
                const res = await adminBrandsApi.getAll({
                    skip,
                    take: 50,
                    search: debouncedSearchTerm,
                });
                if (reset) {
                    setBrands(res.data);
                } else {
                    setBrands((prev) => [...prev, ...res.data]);
                }
                setHasMore(res.hasMore);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load brands");
            } finally {
                setLoading(false);
            }
        },
        [hasMore, brands.length, debouncedSearchTerm]
    );

    // Initial load
    useEffect(() => {
        setBrands([]);
        setHasMore(true);
        setLoading(true);
        loadBrands(true);
    }, [debouncedSearchTerm]);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchTerm("");
    }, []);

    const handleToggleExternalLink = async (id: number, currentStatus: boolean) => {
        setUpdatingId(id);
        try {
            await adminBrandsApi.toggleExternalLink(id, !currentStatus);
            toast.success(`External link ${!currentStatus ? "enabled" : "disabled"} successfully`);
            await loadBrands(true);
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to toggle external link");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleToggleConsentVideo = async (id: number) => {
        setUpdatingId(id);
        try {
            await adminBrandsApi.toggleConsentVideo(id);
            toast.success("Consent video capability toggled successfully");
            await loadBrands(true);
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to toggle consent video");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleToggleDownloadContent = async (id: number) => {
        setUpdatingId(id);
        try {
            await adminBrandsApi.toggleDownloadContent(id);
            toast.success("Download content capability toggled successfully");
            await loadBrands(true);
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to toggle download content");
        } finally {
            setUpdatingId(null);
        }
    };

    const showExternalLinkConfirmation = (id: number, currentStatus: boolean) => {
        setConfirmModal({
            isOpen: true,
            title: currentStatus ? "Disable External Link" : "Enable External Link",
            message: currentStatus ? "You want to disallow this company to add products with external link?" : "You want to allow this company to add products with external link?",
            type: currentStatus ? "warning" : "success",
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                handleToggleExternalLink(id, currentStatus);
            },
        });
    };

    const showConsentVideoConfirmation = (id: number, currentStatus: boolean) => {
        setConfirmModal({
            isOpen: true,
            title: currentStatus ? "Disable Consent Videos" : "Enable Consent Videos",
            message: `You want to ${currentStatus ? "disable" : "enable"} this company capability to handle consent videos?`,
            type: currentStatus ? "warning" : "success",
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                handleToggleConsentVideo(id);
            },
        });
    };

    const showDownloadContentConfirmation = (id: number, currentStatus: boolean) => {
        setConfirmModal({
            isOpen: true,
            title: currentStatus ? "Disable Download Contents" : "Enable Download Contents",
            message: `You want to ${currentStatus ? "disable" : "enable"} this company capability to add new download contents?`,
            type: currentStatus ? "warning" : "success",
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                handleToggleDownloadContent(id);
            },
        });
    };

    const renderBrandItem = (index: number, brand: Brand) => (
        <div key={brand.id} className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 truncate">{brand.name}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Products:</span>
                            <span className="text-gray-900">{brand.productCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">Videos:</span>
                            <span className="text-gray-900">{brand.videosCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${brand.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{brand.isActive ? "Active" : "Inactive"}</span>
                        </div>
                    </div>
                    {brand.website && (
                        <div className="text-sm text-gray-500">
                            <span className="font-medium">Website:</span>{" "}
                            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                {brand.website}
                            </a>
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    {brand.canAddExternalLink ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                showExternalLinkConfirmation(brand.id, true);
                            }}
                            disabled={updatingId === brand.id}
                            className="text-orange-600 hover:text-orange-700 border-orange-300 hover:bg-orange-50"
                            title="Disable External Link"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                showExternalLinkConfirmation(brand.id, false);
                            }}
                            disabled={updatingId === brand.id}
                            className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
                            title="Enable External Link"
                        >
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    )}

                    {brand.canAddConsentVideo ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                showConsentVideoConfirmation(brand.id, true);
                            }}
                            disabled={updatingId === brand.id}
                            className="text-orange-600 hover:text-orange-700 border-orange-300 hover:bg-orange-50"
                            title="Disable Consent Videos"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                showConsentVideoConfirmation(brand.id, false);
                            }}
                            disabled={updatingId === brand.id}
                            className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
                            title="Enable Consent Videos"
                        >
                            <FileVideo className="h-4 w-4" />
                        </Button>
                    )}

                    {brand.canAddDownloadContent ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                showDownloadContentConfirmation(brand.id, true);
                            }}
                            disabled={updatingId === brand.id}
                            className="text-orange-600 hover:text-orange-700 border-orange-300 hover:bg-orange-50"
                            title="Disable Download Contents"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                showDownloadContentConfirmation(brand.id, false);
                            }}
                            disabled={updatingId === brand.id}
                            className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
                            title="Enable Download Contents"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/cms/admin/brands/${brand.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                    <p className="text-gray-600 mt-1">Manage brand settings and capabilities</p>
                </div>
            </div>

            {/* Search */}
            <Card className="p-6 bg-white">
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search brands..." value={searchTerm} onChange={handleSearch} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    {searchTerm && (
                        <Button variant="outline" onClick={handleClearSearch}>
                            Clear
                        </Button>
                    )}
                </div>
            </Card>

            {/* Brands List */}
            <InfiniteScrollList data={brands} loading={loading} hasMore={hasMore} endReached={() => loadBrands(false)} itemContent={renderBrandItem} emptyIcon={<Building2 className="h-12 w-12 text-gray-400 mx-auto" />} emptyTitle="No brands found" emptyMessage={debouncedSearchTerm ? "Try adjusting your search criteria" : "No brands available"} showEmptyReset={!!debouncedSearchTerm} onResetFilters={handleClearSearch} height={600} footerLoading={<LoadingSpinner />} />

            {error && (
                <Card className="p-6">
                    <div className="text-center text-red-600">
                        <p>{error}</p>
                        <Button variant="outline" onClick={() => loadBrands(true)} className="mt-4">
                            Try Again
                        </Button>
                    </div>
                </Card>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} loading={updatingId !== null} confirmText="Confirm" />
        </div>
    );
};

export default BrandsPage;
