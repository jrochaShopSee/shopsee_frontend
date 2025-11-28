// components/analytics/AddMetricsDialog.tsx
"use client";
import React, { useState, useEffect } from "react";
import { X, Search, Filter, Check } from "lucide-react";
import { AnalyticsConfiguration, MetricType, MetricPreferenceUpdate } from "../../types/analytics";

interface AddMetricsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    availableAnalytics: AnalyticsConfiguration[];
    currentMetrics: MetricType[];
    onAddMetrics: (updates: MetricPreferenceUpdate[]) => Promise<void>;
    loading?: boolean;
}

export default function AddMetricsDialog({ isOpen, onClose, availableAnalytics, currentMetrics, onAddMetrics, loading = false }: AddMetricsDialogProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedMetrics, setSelectedMetrics] = useState<Set<number>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get currently visible metric IDs
    const currentVisibleMetricIds = React.useMemo(() => {
        return new Set(currentMetrics.filter((m) => m.isVisible).map((m) => m.id));
    }, [currentMetrics]);

    // Filter available metrics with null safety
    const filteredMetrics = React.useMemo(() => {
        return (availableAnalytics || []).flatMap((analytics) =>
            (analytics.metrics || [])
                .filter((metric) => {
                    // Exclude already visible metrics
                    if (currentVisibleMetricIds.has(metric.id)) return false;

                    // Filter by search term
                    if (searchTerm && !metric.displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
                        return false;
                    }

                    // Filter by category
                    if (selectedCategory !== "all" && analytics.name !== selectedCategory) {
                        return false;
                    }

                    return true;
                })
                .map((metric) => ({
                    ...metric,
                    categoryName: analytics.displayName,
                    categoryId: analytics.name,
                }))
        );
    }, [availableAnalytics, currentVisibleMetricIds, searchTerm, selectedCategory]);

    // Group metrics by category for display
    const groupedMetrics = React.useMemo(() => {
        return filteredMetrics.reduce((acc, metric) => {
            const category = metric.categoryName;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(metric);
            return acc;
        }, {} as Record<string, typeof filteredMetrics>);
    }, [filteredMetrics]);

    const handleMetricToggle = (metricId: number) => {
        const newSelected = new Set(selectedMetrics);
        if (newSelected.has(metricId)) {
            newSelected.delete(metricId);
        } else {
            newSelected.add(metricId);
        }
        setSelectedMetrics(newSelected);
    };

    const handleAddSelected = async () => {
        if (selectedMetrics.size === 0) return;

        setIsSubmitting(true);
        try {
            const updates: MetricPreferenceUpdate[] = Array.from(selectedMetrics).map((metricId, index) => ({
                metricTypeId: metricId,
                isVisible: true,
                sortOrder: currentMetrics.length + index,
                gridPosition: `${Math.floor((currentMetrics.length + index) / 3)},${(currentMetrics.length + index) % 3}`,
            }));

            await onAddMetrics(updates);
            setSelectedMetrics(new Set());
            onClose();
        } catch (error) {
            console.error("Failed to add metrics:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedMetrics.size === filteredMetrics.length) {
            setSelectedMetrics(new Set());
        } else {
            setSelectedMetrics(new Set(filteredMetrics.map((m) => m.id)));
        }
    };

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("");
            setSelectedCategory("all");
            setSelectedMetrics(new Set());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Add Metrics</h2>
                        <p className="text-sm text-gray-600 mt-1">Select metrics to add to your dashboard</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input type="text" placeholder="Search metrics..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="sm:w-48">
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="all">All Categories</option>
                                {(availableAnalytics || []).map((analytics) => (
                                    <option key={analytics.name} value={analytics.name}>
                                        {analytics.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Select All/None */}
                        <button onClick={handleSelectAll} className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50">
                            {selectedMetrics.size === filteredMetrics.length && filteredMetrics.length > 0 ? "Select None" : "Select All"}
                        </button>
                    </div>
                </div>

                {/* Metrics List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : Object.keys(groupedMetrics).length === 0 ? (
                        <div className="text-center py-12">
                            <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics found</h3>
                            <p className="text-gray-600">{searchTerm || selectedCategory !== "all" ? "Try adjusting your search or filter criteria" : "All available metrics are already added to your dashboard"}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedMetrics).map(([categoryName, metrics]) => (
                                <div key={categoryName}>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">{categoryName}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {metrics.map((metric) => (
                                            <div key={`${categoryName}-${metric.id}`} onClick={() => handleMetricToggle(metric.id)} className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMetrics.has(metric.id) ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-medium text-gray-900 truncate">{metric.displayName}</h4>
                                                            {selectedMetrics.has(metric.id) && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                                                        </div>
                                                        {metric.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{metric.description}</p>}
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span className="bg-gray-100 px-2 py-1 rounded">{metric.chartType}</span>
                                                            {metric.isAdminOnly && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Admin Only</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {selectedMetrics.size} metric{selectedMetrics.size !== 1 ? "s" : ""} selected
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button onClick={handleAddSelected} disabled={selectedMetrics.size === 0 || isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Adding...
                                </>
                            ) : (
                                `Add ${selectedMetrics.size} Metric${selectedMetrics.size !== 1 ? "s" : ""}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
