"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { settingsApi } from "@/app/services/settingsApi";
import { Country } from "@/app/types/Role";
import { toast } from "react-toastify";
import { Search, Globe, Plus, Edit2, Trash2, MapPin } from "lucide-react";

const CountriesPage: React.FC = () => {
    const router = useRouter();
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const loadCountries = useCallback(
        async (reset = false) => {
            if (loading && !reset) return;

            setLoading(true);
            try {
                const skip = reset ? 0 : countries.length;
                const response = await settingsApi.getCountries({
                    skip,
                    take: 50,
                    search: searchTerm,
                });

                if (reset) {
                    setCountries(response.data);
                } else {
                    setCountries((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
            } catch (error) {
                toast.error("Failed to load countries");
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [countries.length, searchTerm]
    );

    useEffect(() => {
        loadCountries(true);
    }, [searchTerm]);

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            await settingsApi.toggleCountryStatus(id);
            toast.success(`Country ${currentStatus ? "deactivated" : "activated"} successfully`);

            // Update local state
            setCountries((prev) =>
                prev.map((country) =>
                    country.id === id ? { ...country, isActive: !currentStatus } : country
                )
            );
        } catch (error) {
            toast.error("Failed to toggle country status");
            console.error(error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id: number, countryName: string) => {
        if (!confirm(`Are you sure you want to delete "${countryName}"? This will also delete all states associated with this country.`)) {
            return;
        }

        setDeletingId(id);
        try {
            await settingsApi.deleteCountry(id);
            toast.success("Country deleted successfully");
            loadCountries(true);
        } catch (error) {
            toast.error("Failed to delete country");
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/cms/admin/settings/countries/${id}/edit`);
    };

    const handleViewStates = (id: number) => {
        router.push(`/cms/admin/settings/countries/${id}/states`);
    };

    const handleAddNew = () => {
        router.push("/cms/admin/settings/countries/add");
    };

    const renderCountryItem = (index: number, country: Country) => {
        const isDeleting = deletingId === country.id;
        const isToggling = togglingId === country.id;

        return (
            <div
                key={country.id}
                className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-center gap-3">
                        <div className={`p-2 ${country.isActive ? 'bg-green-100' : 'bg-gray-100'} rounded-lg`}>
                            <Globe className={`h-5 w-5 ${country.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {country.countryName}
                                </h3>
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                    {country.abbr}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                    country.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}>
                                    {country.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Order: {country.order} | States: {country.stateCount}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleViewStates(country.id)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MapPin className="h-4 w-4" />
                            States ({country.stateCount})
                        </button>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={country.isActive}
                                onChange={() => handleToggleStatus(country.id, country.isActive)}
                                disabled={isToggling || isDeleting}
                                className="sr-only"
                            />
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                country.isActive ? 'bg-green-600' : 'bg-gray-300'
                            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    country.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </div>
                        </label>
                        <button
                            onClick={() => handleEdit(country.id)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(country.id, country.countryName)}
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

    if (loading && countries.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Countries Management
                    </h1>
                    <p className="text-gray-600">
                        Manage countries and their states for shipping and addressing
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Add New Country
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search countries by name or abbreviation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="text-sm text-gray-600">
                        Total: {totalCount} countries
                    </div>
                </div>
            </div>

            {/* Countries List */}
            <InfiniteScrollList
                data={countries}
                loading={loading}
                hasMore={hasMore}
                endReached={() => loadCountries(false)}
                itemContent={renderCountryItem}
                emptyIcon={<Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                emptyTitle="No Countries Found"
                emptyMessage="Get started by adding your first country"
                height={600}
                footerLoading={<LoadingSpinner />}
            />
        </div>
    );
};

export default CountriesPage;
