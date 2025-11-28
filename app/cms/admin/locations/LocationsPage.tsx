"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { toast } from "react-toastify";
import { adminLocationsApi } from "@/app/services/adminLocationsApi";
import { Location } from "@/app/types/Location";
import { useDebounce } from "@/app/hooks/useDebounce";
import ConfirmationModal from "@/app/components/shared/ConfirmationModal";
import { MapPin, Plus, Edit2, Power, PowerOff, Building2 } from "lucide-react";

const LocationsPage: React.FC = () => {
    const router = useRouter();
    const [locations, setLocations] = useState<Location[]>([]);
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

    // Load locations (infinite scroll)
    const loadLocations = useCallback(
        async (reset = false) => {
            if (!hasMore && !reset) return;
            setError(null);
            if (reset) setLoading(true);
            const skip = reset ? 0 : locations.length;
            try {
                const res = await adminLocationsApi.getAll({
                    skip,
                    take: 50,
                    search: debouncedSearchTerm,
                });
                if (reset) {
                    setLocations(res.data);
                } else {
                    setLocations((prev) => [...prev, ...res.data]);
                }
                setHasMore(res.hasMore);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load locations");
            } finally {
                setLoading(false);
            }
        },
        [hasMore, locations.length, debouncedSearchTerm]
    );

    // Initial load
    useEffect(() => {
        setLocations([]);
        setHasMore(true);
        setLoading(true);
        loadLocations(true);
    }, [debouncedSearchTerm]);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchTerm("");
    }, []);

    const handleStatusToggle = async (id: number, currentStatus: boolean) => {
        setUpdatingId(id);
        try {
            await adminLocationsApi.toggle(id);
            toast.success(currentStatus ? "Location deactivated successfully" : "Location activated successfully");
            await loadLocations(true);
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to toggle location status");
        } finally {
            setUpdatingId(null);
        }
    };

    const showStatusConfirmation = (id: number, currentStatus: boolean) => {
        const isDeactivating = currentStatus;
        setConfirmModal({
            isOpen: true,
            title: isDeactivating ? "Deactivate Location" : "Activate Location",
            message: isDeactivating ? "Are you sure you want to deactivate this location?" : "Are you sure you want to activate this location?",
            type: isDeactivating ? "warning" : "success",
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                handleStatusToggle(id, currentStatus);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getFullAddress = (location: Location) => {
        const parts = [location.streetAddress, location.streetAddress2, location.city, location.state, location.zip].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : location.addressName || "No address";
    };

    const renderLocationItem = (index: number, location: Location) => {
        console.log("renderLocationItem called", { index, locationId: location.id, location });
        return (
            <div key={location.id} className="p-6 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => router.push(`/cms/admin/locations/edit/${location.id}`)}>
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900">{getFullAddress(location)}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div>
                                <span className="font-medium">Contact:</span>
                                <br />
                                {location.contactFirstName || location.contactLastName ? `${location.contactFirstName || ""} ${location.contactLastName || ""}`.trim() : "N/A"}
                            </div>
                            <div>
                                <span className="font-medium">Email:</span>
                                <br />
                                {location.email || "N/A"}
                            </div>
                            <div>
                                <span className="font-medium">Phone:</span>
                                <br />
                                {location.phone || "N/A"}
                            </div>
                            <div>
                                <span className="font-medium">Modified:</span>
                                <br />
                                {formatDate(location.dateModified)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${location.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{location.active ? "Active" : "Inactive"}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/cms/admin/locations/edit/${location.id}`);
                            }}
                            disabled={updatingId === location.id}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>

                        {location.active ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showStatusConfirmation(location.id, location.active);
                                }}
                                disabled={updatingId === location.id}
                                className="text-orange-600 hover:text-orange-700"
                            >
                                <PowerOff className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showStatusConfirmation(location.id, location.active);
                                }}
                                disabled={updatingId === location.id}
                                className="text-green-600 hover:text-green-700"
                            >
                                <Power className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    console.log("LocationsPage render", {
        locationsCount: locations.length,
        loading,
        hasMore,
        locationsArray: locations,
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
                    <p className="text-gray-600 mt-1">Manage address locations</p>
                </div>
                <Button onClick={() => router.push("/cms/admin/locations/add")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Location
                </Button>
            </div>

            {/* Search */}
            <Card className="p-6">
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <input type="text" placeholder="Search locations..." value={searchTerm} onChange={handleSearch} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    {searchTerm && (
                        <Button variant="outline" onClick={handleClearSearch}>
                            Clear
                        </Button>
                    )}
                </div>
            </Card>

            {/* Locations List */}
            <InfiniteScrollList
                data={locations}
                loading={loading}
                hasMore={hasMore}
                endReached={() => loadLocations(false)}
                itemContent={renderLocationItem}
                emptyIcon={<MapPin className="h-12 w-12 text-gray-400 mx-auto" />}
                emptyTitle="No locations found"
                emptyMessage={debouncedSearchTerm ? "Try adjusting your search criteria" : "Get started by adding your first location"}
                showEmptyReset={!!debouncedSearchTerm}
                onResetFilters={handleClearSearch}
                height={600}
                footerLoading={<LoadingSpinner />}
            />

            {error && (
                <Card className="p-6">
                    <div className="text-center text-red-600">
                        <p>{error}</p>
                        <Button variant="outline" onClick={() => loadLocations(true)} className="mt-4">
                            Try Again
                        </Button>
                    </div>
                </Card>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} loading={updatingId !== null} />
        </div>
    );
};

export default LocationsPage;
