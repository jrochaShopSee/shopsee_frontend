"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { DollarSign, Save } from "lucide-react";
import { settingsApi } from "@/app/services/settingsApi";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";

export default function PayoutMinimumCostPage() {
    const [minimumValue, setMinimumValue] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadMinimumCost();
    }, []);

    const loadMinimumCost = async () => {
        try {
            setLoading(true);
            const data = await settingsApi.getPayoutMinimumCost();
            setMinimumValue(data.settingValue || "10.00");
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to load minimum payout value");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validation
        const numValue = parseFloat(minimumValue);
        if (isNaN(numValue) || numValue < 0) {
            toast.error("Please enter a valid number greater than or equal to 0");
            return;
        }

        try {
            setSaving(true);
            await settingsApi.updatePayoutMinimumCost({
                minimumValue: numValue,
            });
            toast.success("Minimum payout value updated successfully");
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to update minimum payout value");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Minimum Payout Value</h1>
                                    <p className="text-sm text-gray-600">
                                        Set the minimum value required for payouts
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="minimumValue" className="block text-sm font-medium text-gray-700 mb-2">
                                        Set new minimum value
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            id="minimumValue"
                                            value={minimumValue}
                                            onChange={(e) => setMinimumValue(e.target.value)}
                                            placeholder="Enter minimum value"
                                            step="0.01"
                                            min="0"
                                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Vendors will only receive payouts when their total reaches or exceeds this amount
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        {saving ? (
                                            <>
                                                <LoadingSpinner />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-blue-900 mb-1">About Minimum Payout Value</h3>
                                <p className="text-sm text-blue-700">
                                    This setting controls the minimum amount that must accumulate before a vendor can
                                    receive a payout. Pending payouts below this threshold will be held until they reach
                                    the minimum value. This helps reduce transaction fees and administrative overhead.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
