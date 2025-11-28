// components/analytics/DashboardGrid.tsx
"use client";
import React, { useState, useCallback, useEffect } from "react";
import { MetricType, MetricData } from "../../types/analytics";
import MetricCard, { MetricCardSkeleton } from "./MetricCard";
import { Plus, BarChart3 } from "lucide-react";

interface DashboardGridProps {
    metrics: MetricType[];
    metricsData: Record<number, MetricData>;
    onRemoveMetric: (metricId: number) => void;
    onAddMetrics: () => void;
    onCreateDashboard?: () => void;
    onMetricSettings?: (metricId: number) => void;
    onRefreshMetric?: (metricId: number) => void;
    onUpdateMetricPositions?: (updates: Array<{ metricId: number; sortOrder: number; gridPosition: string }>) => Promise<void>;
    loading?: boolean;
    enableDragAndDrop?: boolean;
    hasNoDashboards?: boolean;
}

export default function DashboardGrid({ metrics, metricsData, onRemoveMetric, onAddMetrics, onCreateDashboard, onMetricSettings, onRefreshMetric, onUpdateMetricPositions, loading = false, enableDragAndDrop = false, hasNoDashboards = false }: DashboardGridProps) {
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [optimisticMetrics, setOptimisticMetrics] = useState<MetricType[]>([]);
    const [isUpdatingPositions, setIsUpdatingPositions] = useState(false);

    // Reset optimistic state when metrics change from parent
    useEffect(() => {
        if (!draggedItem && optimisticMetrics.length > 0) {
            setOptimisticMetrics([]);
        }
    }, [metrics, draggedItem, optimisticMetrics.length]);

    // Sort metrics by sort order and filter visible ones
    const visibleMetrics = React.useMemo(() => {
        const baseMetrics = optimisticMetrics.length > 0 ? optimisticMetrics : metrics;
        return baseMetrics.filter((metric) => metric.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);
    }, [metrics, optimisticMetrics]);

    const handleDragStart = useCallback(
        (metricId: number) => {
            if (!enableDragAndDrop) return;
            setDraggedItem(metricId);
            // Initialize optimistic state with current visible metrics
            const currentVisible = metrics.filter((m) => m.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);
            setOptimisticMetrics(currentVisible);
        },
        [enableDragAndDrop, metrics]
    );

    const handleDragEnd = useCallback(async () => {
        if (!draggedItem || !onUpdateMetricPositions || optimisticMetrics.length === 0) {
            setDraggedItem(null);
            setDragOverIndex(null);
            setOptimisticMetrics([]);
            return;
        }

        setIsUpdatingPositions(true);

        try {
            // Prepare updates with new sort orders and grid positions
            const updates = optimisticMetrics.map((metric, index) => ({
                metricId: metric.id,
                sortOrder: index,
                gridPosition: `${Math.floor(index / 4)},${index % 4}`, // 4 columns
            }));

            console.log("Sending position updates:", updates);

            // Send updates to backend
            await onUpdateMetricPositions(updates);

            console.log("Position updates completed successfully");

            // Clear optimistic state after successful update
            setOptimisticMetrics([]);
        } catch (error) {
            console.error("Failed to update positions:", error);
            // Reset optimistic state on error to revert to original positions
            setOptimisticMetrics([]);
        } finally {
            setDraggedItem(null);
            setDragOverIndex(null);
            setIsUpdatingPositions(false);
        }
    }, [draggedItem, optimisticMetrics, onUpdateMetricPositions]);

    const handleDragOver = useCallback(
        (e: React.DragEvent, index: number) => {
            e.preventDefault();
            if (draggedItem !== null) {
                setDragOverIndex(index);
            }
        },
        [draggedItem]
    );

    const handleDragEnter = useCallback(
        (e: React.DragEvent, index: number) => {
            e.preventDefault();
            if (draggedItem !== null && draggedItem !== visibleMetrics[index]?.id) {
                // Update optimistic order
                const newMetrics = [...optimisticMetrics];
                const draggedMetric = newMetrics.find((m) => m.id === draggedItem);
                const targetMetric = visibleMetrics[index];

                if (draggedMetric && targetMetric) {
                    // Remove dragged item from current position
                    const draggedIndex = newMetrics.findIndex((m) => m.id === draggedItem);
                    newMetrics.splice(draggedIndex, 1);

                    // Insert at new position
                    const targetIndex = newMetrics.findIndex((m) => m.id === targetMetric.id);
                    newMetrics.splice(targetIndex, 0, draggedMetric);

                    setOptimisticMetrics(newMetrics);
                }
            }
        },
        [draggedItem, optimisticMetrics, visibleMetrics]
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        // Only clear drag over index if we're leaving the grid entirely
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverIndex(null);
        }
    }, []);

    // Handle metric removal with proper error handling
    const handleRemoveMetric = useCallback(
        async (metricId: number) => {
            try {
                console.log("Removing metric:", metricId);
                await onRemoveMetric(metricId);
                console.log("Metric removed successfully:", metricId);
            } catch (error) {
                console.error("Failed to remove metric:", metricId, error);
            }
        },
        [onRemoveMetric]
    );

    if (loading) {
        return (
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <MetricCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    // No dashboards state
    if (hasNoDashboards) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dashboards Yet</h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">Create your first dashboard to start tracking analytics metrics and insights.</p>
                <div className="space-y-3">
                    <button onClick={onCreateDashboard} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        Create Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // No metrics state
    if (visibleMetrics.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Metrics Added</h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">Add some metrics to your dashboard to start tracking your analytics data.</p>
                <div className="space-y-3">
                    <button onClick={onAddMetrics} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        Add Your First Metrics
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" onDragLeave={handleDragLeave}>
                {visibleMetrics.map((metric, index) => {
                    // Create proper MetricData object with safe fallbacks
                    const metricData: MetricData = metricsData[metric.id] || {
                        id: metric.id,
                        name: metric.displayName,
                        value: "Loading...",
                        chartType: metric.chartType || "Card",
                        loading: true,
                        error: undefined,
                        lastUpdated: undefined,
                        data: undefined,
                    };

                    const isDragging = draggedItem === metric.id;
                    const isDragOver = dragOverIndex === index;

                    return (
                        <div
                            key={metric.id}
                            draggable={enableDragAndDrop}
                            onDragStart={() => handleDragStart(metric.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            className={`
                                transition-all duration-200 
                                ${isDragging ? "opacity-30 scale-95 rotate-2" : ""} 
                                ${isDragOver ? "ring-2 ring-blue-400 ring-offset-2" : ""}
                                ${enableDragAndDrop ? "cursor-move" : ""}
                                ${isUpdatingPositions ? "pointer-events-none" : ""}
                            `}
                            style={{
                                transform: isDragging ? "rotate(5deg) scale(0.95)" : undefined,
                                transition: isDragging ? "transform 0.2s ease" : "all 0.2s ease",
                            }}
                        >
                            <MetricCard metric={metric} data={metricData} onRemove={handleRemoveMetric} onSettings={onMetricSettings ? () => onMetricSettings(metric.id) : undefined} onRefresh={onRefreshMetric ? () => onRefreshMetric(metric.id) : undefined} isDragging={isDragging} dragHandleProps={enableDragAndDrop ? { style: { cursor: "move" } } : undefined} />
                        </div>
                    );
                })}

                {/* Add Metrics Card */}
                <div className="flex items-center justify-center">
                    <button onClick={onAddMetrics} className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-gray-700" disabled={isUpdatingPositions}>
                        <Plus className="h-8 w-8" />
                        <span className="font-medium">Add Metrics</span>
                    </button>
                </div>
            </div>

            {/* Drag & Drop Instructions */}
            {enableDragAndDrop && visibleMetrics.length > 1 && !draggedItem && !isUpdatingPositions && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-700 flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Drag and drop metrics to rearrange them on your dashboard.
                    </div>
                </div>
            )}

            {/* Dragging Feedback */}
            {draggedItem && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-700 flex items-center gap-2">
                        <svg className="h-4 w-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Drop the metric to save its new position.
                    </div>
                </div>
            )}

            {/* Updating Positions Feedback */}
            {isUpdatingPositions && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-700 flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Saving new positions...
                    </div>
                </div>
            )}
        </div>
    );
}
