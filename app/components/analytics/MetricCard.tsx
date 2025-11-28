// components/analytics/MetricCard.tsx
"use client";
import React from "react";
import { MetricType, MetricData } from "../../types/analytics";
import { Trash2, Settings, GripVertical, RefreshCw, TrendingUp, BarChart3, Calendar, Table, Activity } from "lucide-react";
import ChartRenderer from "./ChartRenderer";

interface MetricCardProps {
    metric: MetricType;
    data: MetricData;
    onRemove?: (metricId: number) => void;
    onSettings?: (metricId: number) => void;
    onRefresh?: (metricId: number) => void;
    isDragging?: boolean;
    // eslint-disable-next-line
    dragHandleProps?: Record<string, any>;
    showActions?: boolean;
    className?: string;
}

export default function MetricCard({ metric, data, onRemove, onSettings, onRefresh, isDragging = false, dragHandleProps, showActions = true, className = "" }: MetricCardProps) {
    const hasFilterSupport = React.useMemo(() => {
        return metric.supportsDateFilter || metric.supportsVideoFilter || metric.supportsProductFilter || metric.supportsUserFilter || metric.supportsScreenFilter || metric.supportsSignerFilter || metric.supportsSubscriptionCategoryFilter || metric.supportsTerm;
    }, [metric]);

    // FIXED: Move all hooks to the top, before any conditional returns
    // Handle remove with proper event handling
    const handleRemoveClick = React.useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (onRemove && typeof onRemove === "function") {
                console.log("MetricCard: Remove clicked for metric", metric.id);
                onRemove(metric.id);
            } else {
                console.warn("MetricCard: onRemove not provided or not a function");
            }
        },
        [onRemove, metric.id]
    );

    // Handle settings with proper event handling
    const handleSettingsClick = React.useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (onSettings && typeof onSettings === "function") {
                onSettings(metric.id);
            }
        },
        [onSettings, metric.id]
    );

    // Handle refresh with proper event handling
    const handleRefreshClick = React.useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (onRefresh && typeof onRefresh === "function") {
                onRefresh(metric.id);
            }
        },
        [onRefresh, metric.id]
    );

    const getMetricIcon = () => {
        // Safely get chart type with multiple fallbacks
        const chartType = data?.chartType || metric?.chartType || "Card";
        const normalizedChartType = chartType.toLowerCase().replace(/\s+/g, "");

        switch (normalizedChartType) {
            case "linechart":
            case "line":
            case "areachart":
            case "area":
                return <TrendingUp className="h-4 w-4 text-blue-600" />;
            case "barchart":
            case "bar":
            case "columnchart":
            case "column":
                return <BarChart3 className="h-4 w-4 text-green-600" />;
            case "piechart":
            case "pie":
            case "donutchart":
            case "donut":
                return <Activity className="h-4 w-4 text-purple-600" />;
            case "datatable":
            case "table":
            case "datatables":
                return <Table className="h-4 w-4 text-orange-600" />;
            case "progressbars":
            case "progress":
                return <Activity className="h-4 w-4 text-indigo-600" />;
            case "card":
            case "cards":
            default:
                return <Calendar className="h-4 w-4 text-gray-600" />;
        }
    };

    // Add safety check for data AFTER hooks
    if (!data) {
        return (
            <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{metric.displayName}</h3>
                </div>
                <div className="flex items-center justify-center h-32 text-gray-500">
                    <span className="text-sm">No data available</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 ${isDragging ? "opacity-50 rotate-2 scale-105" : ""} ${className}`} {...dragHandleProps}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {dragHandleProps && <GripVertical className="h-4 w-4 text-gray-400 cursor-grab flex-shrink-0" />}
                    {getMetricIcon()}
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{metric.displayName}</h3>
                </div>

                {showActions && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {onRefresh && (
                            <button onClick={handleRefreshClick} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors" title="Refresh metric" type="button">
                                <RefreshCw className={`h-4 w-4 ${data.loading ? "animate-spin" : ""}`} />
                            </button>
                        )}

                        {/* Only show settings if metric supports filtering */}
                        {hasFilterSupport && onSettings && (
                            <button onClick={handleSettingsClick} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors" title="Metric settings" type="button">
                                <Settings className="h-4 w-4" />
                            </button>
                        )}

                        {onRemove && (
                            <button onClick={handleRemoveClick} className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors" title="Remove metric" type="button">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Use ChartRenderer component for all chart logic */}
            <ChartRenderer data={data} metricName={metric.displayName} height={132} onRefresh={onRefresh ? () => onRefresh(metric.id) : undefined} />
        </div>
    );
}

// Skeleton component for loading states
export function MetricCardSkeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 animate-pulse ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="h-4 w-4 bg-gray-300 rounded"></div>
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                </div>
                <div className="flex gap-1">
                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                </div>
            </div>
            <div className="h-32 bg-gray-300 rounded"></div>
        </div>
    );
}
