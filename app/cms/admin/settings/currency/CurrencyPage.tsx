"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { settingsApi } from "@/app/services/settingsApi";
import { Currency } from "@/app/types/Role";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { DollarSign, Plus, Search, Edit2 } from "lucide-react";
import { toast } from "react-toastify";

const CurrencyPage: React.FC = () => {
    const router = useRouter();
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const loadCurrencies = useCallback(
        async (reset = false) => {
            if (loading && !reset) return;

            setLoading(true);
            try {
                const skip = reset ? 0 : currencies.length;
                const response = await settingsApi.getCurrencies({
                    skip,
                    take: 50,
                    search: searchTerm,
                });

                if (reset) {
                    setCurrencies(response.data);
                } else {
                    setCurrencies((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
            } catch (error) {
                toast.error("Failed to load currencies");
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [currencies.length, searchTerm]
    );

    useEffect(() => {
        loadCurrencies(true);
    }, [searchTerm]);

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            await settingsApi.toggleCurrencyStatus(id);
            toast.success(`Currency ${currentStatus ? "deactivated" : "activated"} successfully`);

            // Update local state
            setCurrencies((prev) =>
                prev.map((currency) =>
                    currency.id === id ? { ...currency, isActive: !currentStatus } : currency
                )
            );
        } catch (error) {
            toast.error("Failed to toggle currency status");
            console.error(error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/cms/admin/settings/currency/edit/${id}`);
    };

    const handleAddNew = () => {
        router.push("/cms/admin/settings/currency/add");
    };

    const renderCurrencyItem = (index: number, currency: Currency) => {
        const isToggling = togglingId === currency.id;

        return (
            <div
                key={currency.id}
                className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-center gap-3">
                        <div className={`p-2 ${currency.isActive ? 'bg-green-100' : 'bg-gray-100'} rounded-lg`}>
                            <DollarSign className={`h-5 w-5 ${currency.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {currency.currencyName}
                                </h3>
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                    {currency.currencyCode}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                    currency.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}>
                                    {currency.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={currency.isActive}
                                onChange={() => handleToggleStatus(currency.id, currency.isActive)}
                                disabled={isToggling}
                                className="sr-only"
                            />
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                currency.isActive ? 'bg-green-600' : 'bg-gray-300'
                            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    currency.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </div>
                        </label>
                        <button
                            onClick={() => handleEdit(currency.id)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && currencies.length === 0) {
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
                        Currency Management
                    </h1>
                    <p className="text-gray-600">
                        Manage currencies for your ecommerce platform
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Add New Currency
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search currencies by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="text-sm text-gray-600">
                        Total: {totalCount} currencies
                    </div>
                </div>
            </div>

            {/* Currencies List */}
            <InfiniteScrollList
                data={currencies}
                loading={loading}
                hasMore={hasMore}
                endReached={() => loadCurrencies(false)}
                itemContent={renderCurrencyItem}
                emptyIcon={<DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                emptyTitle="No Currencies Found"
                emptyMessage="Get started by adding your first currency"
                height={600}
                footerLoading={<LoadingSpinner />}
            />
        </div>
    );
};

export default CurrencyPage;
