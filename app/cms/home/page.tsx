"use client";
import React, { useEffect, useState, useCallback } from "react";
import AddMetricsDialog from "@/app/components/analytics/AddMetricsDialog";
import CreateDashboardDialog from "@/app/components/analytics/CreateDashboardDialog";
import DashboardGrid from "@/app/components/analytics/DashboardGrid";
import DashboardHeader from "@/app/components/analytics/DashboardHeader";
import { useDashboardStore } from "@/app/store/dashboardStore";
import { MetricPreferenceUpdate, UserDashboard, AnalyticsFilters, MetricType } from "@/app/types/analytics";
import { useAuth } from "@/app/hooks/useAuth";
import MetricSettingsDialog from "@/app/components/analytics/MetricSettingDialog";

export default function CmsHomePage() {
    const {
        currentDashboard,
        dashboards,
        availableAnalytics,
        metricsData,
        loading,
        error,
        loadDashboards,
        loadCurrentDashboard,
        loadAvailableAnalytics,
        createDashboard,
        updateDashboard,
        deleteDashboard,
        setDefaultDashboard,
        updateMetricVisibility,
        updateMetricPositions,
        bulkUpdateMetrics,
        // Enhanced filtering methods
        loadFilterOptions,
        applyMetricFilters,
        getMetricAvailableFilters,
        refreshMetricWithFilters,
        saveMetricSettings,
        loadMetricSettings,
    } = useDashboardStore();

    // Use auth hook for user info
    const { isLoading: authLoading } = useAuth();

    // Dialog states
    const [showAddMetricsDialog, setShowAddMetricsDialog] = useState(false);
    const [showCreateDashboardDialog, setShowCreateDashboardDialog] = useState(false);
    const [showMetricSettingsDialog, setShowMetricSettingsDialog] = useState(false);
    const [editingDashboard, setEditingDashboard] = useState<UserDashboard | null>(null);
    const [selectedMetricForSettings, setSelectedMetricForSettings] = useState<MetricType | null>(null);

    // Initialize data on mount
    useEffect(() => {
        const initializeData = async () => {
            // Wait for auth to load first
            if (authLoading) return;

            try {
                console.log("Initializing dashboard data...");

                // First load dashboards and analytics in parallel
                await Promise.all([loadDashboards(), loadAvailableAnalytics()]);

                console.log("Dashboards and analytics loaded successfully");
            } catch (error) {
                console.error("Failed to initialize dashboard data:", error);
            }
        };

        initializeData();
    }, [authLoading, loadDashboards, loadAvailableAnalytics]);

    // Load default dashboard after dashboards are loaded
    useEffect(() => {
        const loadDefaultDashboard = async () => {
            // Only proceed if we have dashboards but no current dashboard loaded
            if (!authLoading && !loading && dashboards.length > 0 && !currentDashboard) {
                try {
                    console.log("Loading default dashboard...");

                    // Call loadCurrentDashboard without parameters to load the default dashboard
                    await loadCurrentDashboard();

                    console.log("Default dashboard loaded successfully");
                } catch (error) {
                    console.error("Failed to load default dashboard:", error);

                    // Fallback: if loading default fails, try to load the first dashboard
                    if (dashboards.length > 0) {
                        console.log("Fallback: Loading first available dashboard...");
                        try {
                            await loadCurrentDashboard(dashboards[0].id);
                            console.log("Fallback dashboard loaded successfully");
                        } catch (fallbackError) {
                            console.error("Fallback dashboard loading also failed:", fallbackError);
                        }
                    }
                }
            }
        };

        loadDefaultDashboard();
    }, [authLoading, loading, dashboards, currentDashboard, loadCurrentDashboard]);

    // Dashboard handlers
    const handleCreateDashboard = useCallback(
        async (name: string, description?: string) => {
            try {
                const newDashboard = await createDashboard({ name, description });
                if (newDashboard) {
                    // Load the new dashboard
                    await loadCurrentDashboard(newDashboard.id);
                }
            } catch (error) {
                console.error("Failed to create dashboard:", error);
            }
        },
        [createDashboard, loadCurrentDashboard]
    );

    const handleUpdateDashboard = useCallback(
        async (dashboardId: number, name: string, description?: string) => {
            try {
                await updateDashboard(dashboardId, name, description);
                setEditingDashboard(null);
            } catch (error) {
                console.error("Failed to update dashboard:", error);
            }
        },
        [updateDashboard]
    );

    const handleDeleteDashboard = useCallback(
        async (dashboardId: number) => {
            try {
                console.log("Page: Deleting dashboard with ID:", dashboardId);

                // Confirm the dashboard exists before deleting
                const dashboardToDelete = dashboards.find((d) => d.id === dashboardId);
                if (!dashboardToDelete) {
                    console.error("Page: Dashboard not found for deletion:", dashboardId);
                    return;
                }

                console.log("Page: Deleting dashboard:", dashboardToDelete.name);

                await deleteDashboard(dashboardId);

                console.log("Page: Dashboard deleted successfully");
            } catch (error) {
                console.error("Page: Failed to delete dashboard:", dashboardId, error);
            }
        },
        [deleteDashboard, dashboards]
    );

    const handleSetDefaultDashboard = useCallback(
        async (dashboardId: number) => {
            try {
                await setDefaultDashboard(dashboardId);
            } catch (error) {
                console.error("Failed to set default dashboard:", error);
            }
        },
        [setDefaultDashboard]
    );

    const handleAddMetrics = useCallback(
        async (updates: MetricPreferenceUpdate[]) => {
            try {
                await bulkUpdateMetrics(updates, currentDashboard?.id);
            } catch (error) {
                console.error("Failed to add metrics:", error);
            }
        },
        [bulkUpdateMetrics, currentDashboard?.id]
    );

    // FIXED: Enhanced metric removal handler with proper error handling
    const handleRemoveMetric = useCallback(
        async (metricId: number) => {
            try {
                console.log("Page: Removing metric", metricId, "from dashboard", currentDashboard?.id);
                await updateMetricVisibility(metricId, false, currentDashboard?.id);
                console.log("Page: Metric removed successfully");
            } catch (error) {
                console.error("Page: Failed to remove metric:", metricId, error);
            }
        },
        [updateMetricVisibility, currentDashboard?.id]
    );

    // FIXED: Enhanced metric settings handler
    const handleMetricSettings = useCallback(
        (metricId: number) => {
            console.log("Page: Opening settings for metric", metricId);
            // Find the metric from current dashboard
            const metric = currentDashboard?.metrics.find((m) => m.id === metricId);
            if (metric) {
                setSelectedMetricForSettings(metric);
                setShowMetricSettingsDialog(true);
            } else {
                console.error("Page: Metric not found:", metricId);
            }
        },
        [currentDashboard?.metrics]
    );

    // FIXED: Enhanced position update handler with better error handling
    const handleUpdateMetricPositions = useCallback(
        async (updates: Array<{ metricId: number; sortOrder: number; gridPosition: string }>) => {
            try {
                console.log("Page: Updating metric positions:", updates);
                await updateMetricPositions(updates, currentDashboard?.id);
                console.log("Page: Metric positions updated successfully");
            } catch (error) {
                console.error("Page: Failed to update metric positions:", error);
                throw error; // Re-throw to allow DashboardGrid to handle the error
            }
        },
        [updateMetricPositions, currentDashboard?.id]
    );

    // Handle applying filters to a specific metric
    const handleApplyMetricFilters = useCallback(
        async (metricId: number, filters: AnalyticsFilters) => {
            try {
                await applyMetricFilters(metricId, filters);
                // Close the settings dialog
                setShowMetricSettingsDialog(false);
                setSelectedMetricForSettings(null);
            } catch (error) {
                console.error("Failed to apply metric filters:", error);
            }
        },
        [applyMetricFilters]
    );

    // Handle loading filter options for dropdowns
    const handleLoadFilterOptions = useCallback(
        async (type: string) => {
            try {
                return await loadFilterOptions(type);
            } catch (error) {
                console.error("Failed to load filter options:", error);
                return [];
            }
        },
        [loadFilterOptions]
    );

    // Handle getting available filters for a metric
    const handleGetMetricAvailableFilters = useCallback(
        async (metricId: number) => {
            try {
                return await getMetricAvailableFilters(metricId);
            } catch (error) {
                console.error("Failed to get metric available filters:", error);
                return {
                    supportsDateFilter: false,
                    supportsVideoFilter: false,
                    supportsProductFilter: false,
                    supportsUserFilter: false,
                    supportsScreenFilter: false,
                    supportsSignerFilter: false,
                    supportsSubscriptionCategoryFilter: false,
                    supportsTerm: false,
                    availableTerms: ["daily", "weekly", "monthly", "yearly"],
                    defaultTerm: "monthly",
                };
            }
        },
        [getMetricAvailableFilters]
    );

    // Handle refreshing a single metric
    const handleRefreshSingleMetric = useCallback(
        async (metricId: number) => {
            try {
                const currentMetric = metricsData[metricId];
                if (currentMetric?.currentFilters) {
                    await refreshMetricWithFilters(metricId, currentMetric.currentFilters);
                } else {
                    // If no filters are set, try to load saved settings
                    const savedFilters = loadMetricSettings(metricId);
                    if (savedFilters) {
                        await refreshMetricWithFilters(metricId, savedFilters);
                    } else {
                        // Refresh without filters
                        await refreshMetricWithFilters(metricId, {});
                    }
                }
            } catch (error) {
                console.error("Failed to refresh metric:", metricId, error);
            }
        },
        [metricsData, refreshMetricWithFilters, loadMetricSettings]
    );

    // Handle saving metric settings
    const handleSaveMetricSettings = useCallback(
        async (metricId: number, settings: AnalyticsFilters) => {
            try {
                await saveMetricSettings(metricId, settings, currentDashboard?.id);
            } catch (error) {
                console.error("Failed to save metric settings:", error);
            }
        },
        [saveMetricSettings, currentDashboard?.id]
    );

    // Handle loading metric settings
    const handleLoadMetricSettings = useCallback(
        (metricId: number): AnalyticsFilters | null => {
            return loadMetricSettings(metricId);
        },
        [loadMetricSettings]
    );

    // Handle global refresh (refreshes all metrics with their individual filters)
    const handleRefreshAll = useCallback(async () => {
        if (!currentDashboard) return;

        try {
            const visibleMetrics = currentDashboard.metrics.filter((m) => m.isVisible);

            // Refresh each metric with its own saved filters
            for (const metric of visibleMetrics) {
                const savedFilters = loadMetricSettings(metric.id);
                await refreshMetricWithFilters(metric.id, savedFilters || {});
            }
        } catch (error) {
            console.error("Failed to refresh all metrics:", error);
        }
    }, [currentDashboard, loadMetricSettings, refreshMetricWithFilters]);

    // Show loading state if auth is still loading OR if we're loading initial data
    if (authLoading || (loading && dashboards.length === 0)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>{authLoading ? "Loading..." : "Loading dashboards..."}</p>
                </div>
            </div>
        );
    }

    // Show loading state if we have dashboards but no current dashboard selected yet
    if (!authLoading && dashboards.length > 0 && !currentDashboard && loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading default dashboard...</p>
                </div>
            </div>
        );
    }

    // Show error state if there's an error
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center text-destructive">
                    <p className="text-lg font-semibold mb-2">Error Loading Dashboard</p>
                    <p className="text-sm mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Dashboard Header */}
                <DashboardHeader currentDashboard={currentDashboard} dashboards={dashboards} onCreateDashboard={() => setShowCreateDashboardDialog(true)} onEditDashboard={setEditingDashboard} onDeleteDashboard={handleDeleteDashboard} onSetDefaultDashboard={handleSetDefaultDashboard} onSwitchDashboard={loadCurrentDashboard} onAddMetrics={() => setShowAddMetricsDialog(true)} onRefreshAll={handleRefreshAll} loading={loading} />

                {/* Dashboard Grid */}
                <DashboardGrid
                    metrics={currentDashboard?.metrics.filter((m) => m.isVisible) || []}
                    metricsData={metricsData}
                    onRemoveMetric={handleRemoveMetric}
                    onAddMetrics={() => setShowAddMetricsDialog(true)}
                    onCreateDashboard={() => setShowCreateDashboardDialog(true)}
                    onMetricSettings={handleMetricSettings}
                    onRefreshMetric={handleRefreshSingleMetric}
                    onUpdateMetricPositions={handleUpdateMetricPositions}
                    loading={loading}
                    enableDragAndDrop={true}
                    hasNoDashboards={dashboards.length === 0 && !loading}
                />

                {/* Dialogs */}
                {showAddMetricsDialog && <AddMetricsDialog availableAnalytics={availableAnalytics} currentMetrics={currentDashboard?.metrics || []} isOpen={showAddMetricsDialog} onClose={() => setShowAddMetricsDialog(false)} onAddMetrics={handleAddMetrics} />}

                {showCreateDashboardDialog && <CreateDashboardDialog isOpen={showCreateDashboardDialog} onClose={() => setShowCreateDashboardDialog(false)} onCreateDashboard={handleCreateDashboard} editingDashboard={editingDashboard} onUpdateDashboard={handleUpdateDashboard} />}

                {showMetricSettingsDialog && selectedMetricForSettings && (
                    <MetricSettingsDialog
                        metric={selectedMetricForSettings}
                        isOpen={showMetricSettingsDialog}
                        onClose={() => {
                            setShowMetricSettingsDialog(false);
                            setSelectedMetricForSettings(null);
                        }}
                        onApplyFilters={handleApplyMetricFilters}
                        onSaveSettings={handleSaveMetricSettings}
                        onLoadFilterOptions={handleLoadFilterOptions}
                        onGetAvailableFilters={handleGetMetricAvailableFilters}
                        onLoadSettings={handleLoadMetricSettings}
                    />
                )}
            </div>
        </div>
    );
}
