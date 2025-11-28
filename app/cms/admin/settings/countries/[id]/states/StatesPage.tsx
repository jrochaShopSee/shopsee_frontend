"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { settingsApi } from "@/app/services/settingsApi";
import { State } from "@/app/types/Role";
import { toast } from "react-toastify";
import { Search, MapPin, Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";

interface StatesPageProps {
    countryId: string;
}

const StatesPage: React.FC<StatesPageProps> = ({ countryId }) => {
    const router = useRouter();
    const [states, setStates] = useState<State[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [countryName, setCountryName] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const loadStates = useCallback(
        async (reset = false) => {
            if (loading && !reset) return;

            setLoading(true);
            try {
                const skip = reset ? 0 : states.length;
                const response = await settingsApi.getStatesByCountry(parseInt(countryId), {
                    skip,
                    take: 50,
                    search: searchTerm,
                });

                if (reset) {
                    setStates(response.data);
                } else {
                    setStates((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
                setCountryName(response.countryName);
            } catch (error) {
                toast.error("Failed to load states");
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [countryId, states.length, searchTerm]
    );

    useEffect(() => {
        loadStates(true);
    }, [searchTerm]);

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            await settingsApi.toggleStateStatus(id);
            toast.success(`State ${currentStatus ? "deactivated" : "activated"} successfully`);

            // Update local state
            setStates((prev) =>
                prev.map((state) =>
                    state.id === id ? { ...state, isActive: !currentStatus } : state
                )
            );
        } catch (error) {
            toast.error("Failed to toggle state status");
            console.error(error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id: number, stateName: string) => {
        if (!confirm(`Are you sure you want to delete "${stateName}"?`)) {
            return;
        }

        setDeletingId(id);
        try {
            await settingsApi.deleteState(id);
            toast.success("State deleted successfully");
            loadStates(true);
        } catch (error) {
            toast.error("Failed to delete state");
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (stateId: number) => {
        router.push(`/cms/admin/settings/countries/${countryId}/states/${stateId}/edit`);
    };

    const handleAddNew = () => {
        router.push(`/cms/admin/settings/countries/${countryId}/states/add`);
    };

    const renderStateItem = (index: number, state: State) => {
        const isDeleting = deletingId === state.id;
        const isToggling = togglingId === state.id;

        return (
            <div
                key={state.id}
                className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-center gap-3">
                        <div className={`p-2 ${state.isActive ? 'bg-green-100' : 'bg-gray-100'} rounded-lg`}>
                            <MapPin className={`h-5 w-5 ${state.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {state.stateName}
                                </h3>
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                    {state.abbreviation}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                    state.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}>
                                    {state.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Order: {state.order}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={state.isActive}
                                onChange={() => handleToggleStatus(state.id, state.isActive)}
                                disabled={isToggling || isDeleting}
                                className="sr-only"
                            />
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                state.isActive ? 'bg-green-600' : 'bg-gray-300'
                            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    state.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </div>
                        </label>
                        <button
                            onClick={() => handleEdit(state.id)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(state.id, state.stateName)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <LoadingSpinner />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && states.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.push("/cms/admin/settings/countries")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Countries
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            States for {countryName}
                        </h1>
                        <p className="text-gray-600">
                            Manage states and provinces for this country
                        </p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Plus className="h-5 w-5" />
                        Add New State
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search states by name or abbreviation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="text-sm text-gray-600">
                        Total: {totalCount} states
                    </div>
                </div>
            </div>

            {/* States List */}
            <InfiniteScrollList
                data={states}
                loading={loading}
                hasMore={hasMore}
                endReached={() => loadStates(false)}
                itemContent={renderStateItem}
                emptyIcon={<MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                emptyTitle="No States Found"
                emptyMessage="Get started by adding your first state"
                height={600}
                footerLoading={<LoadingSpinner />}
            />
        </div>
    );
};

export default StatesPage;
