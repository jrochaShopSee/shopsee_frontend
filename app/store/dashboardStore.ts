// store/dashboardStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CreateDashboardRequest, MetricPreferenceUpdate, AnalyticsFilters, AvailableFilters, DashboardState, DashboardActions, MetricType, UserDashboard } from "../types/analytics";
import { AnalyticsApi } from "../services/analyticsApi";

// Simple error handling helper since analyticsApiHelpers might not be available
const withErrorHandling = async <T>(fn: () => Promise<T>): Promise<{ data: T | null; error: string | null }> => {
    try {
        const data = await fn();
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error instanceof Error ? error.message : "An error occurred" };
    }
};

export const useDashboardStore = create<DashboardState & DashboardActions>()(
    devtools(
        (set, get) => ({
            // Initial state
            currentDashboard: null,
            dashboards: [],
            availableAnalytics: [],
            metricsData: {},
            loading: false,
            error: null,

            // Dashboard management
            loadDashboards: async () => {
                set({ loading: true, error: null });

                const { data, error } = await withErrorHandling(() => AnalyticsApi.getUserDashboards());

                if (error) {
                    set({ error, loading: false });
                } else {
                    set({ dashboards: data || [], loading: false });
                }
            },

            loadCurrentDashboard: async (dashboardId?: number) => {
                set({ loading: true, error: null });

                const { data, error } = await withErrorHandling(() => AnalyticsApi.getUserDashboard(dashboardId));

                if (error) {
                    set({ error, loading: false });
                } else if (data) {
                    // Process the dashboard data to ensure custom settings are properly structured
                    const processedDashboard: UserDashboard = {
                        id: data.id,
                        name: data.name,
                        description: data.description,
                        isDefault: data.isDefault,
                        layoutSettings: data.layoutSettings || {},
                        metrics: data.metrics.map((metric: MetricType) => ({
                            ...metric,
                            // Ensure supportsTerm matches the backend field name
                            supportsTerm: (metric as unknown as { supportsTermFilter?: boolean }).supportsTermFilter || metric.supportsTerm,
                            // Ensure customSettings is properly structured
                            customSettings: metric.customSettings
                                ? {
                                      filters: metric.customSettings.filters || {},
                                      lastUpdated: metric.customSettings.lastUpdated,
                                      savedAt: metric.customSettings.savedAt,
                                      version: metric.customSettings.version || "1.0",
                                  }
                                : null,
                        })),
                    };

                    console.log("Store: Dashboard loaded with custom settings:", processedDashboard);
                    set({ currentDashboard: processedDashboard, loading: false });

                    // Load ALL dashboard metrics data in one API call with their saved filters
                    if (processedDashboard.id) {
                        await get().loadDashboardMetricsData(processedDashboard.id);
                    }
                } else {
                    set({ error: "No dashboard data received", loading: false });
                }
            },

            loadAvailableAnalytics: async () => {
                set({ loading: true, error: null });

                const { data, error } = await withErrorHandling(() => AnalyticsApi.getAvailableAnalytics());

                if (error) {
                    set({ error, loading: false });
                } else {
                    set({ availableAnalytics: data || [], loading: false });
                }
            },

            createDashboard: async (request: CreateDashboardRequest) => {
                set({ loading: true, error: null });

                const { data, error } = await withErrorHandling(() => AnalyticsApi.createDashboard(request));

                if (error) {
                    set({ error, loading: false });
                    return null;
                } else {
                    await get().loadDashboards();
                    set({ loading: false });
                    return data;
                }
            },

            updateDashboard: async (dashboardId: number, name: string, description?: string) => {
                set({ loading: true, error: null });

                const { data, error } = await withErrorHandling(() => AnalyticsApi.updateDashboard(dashboardId, { name, description }));

                if (error) {
                    set({ error, loading: false });
                } else {
                    const currentDashboard = get().currentDashboard;
                    if (currentDashboard?.id === dashboardId) {
                        set({ currentDashboard: data });
                    }
                    await get().loadDashboards();
                    set({ loading: false });
                }
            },

            deleteDashboard: async (dashboardId: number) => {
                set({ loading: true, error: null });

                const { error } = await withErrorHandling(() => AnalyticsApi.deleteDashboard(dashboardId));

                if (error) {
                    set({ error, loading: false });
                } else {
                    const currentDashboard = get().currentDashboard;
                    if (currentDashboard?.id === dashboardId) {
                        set({ currentDashboard: null });
                    }
                    await get().loadDashboards();
                    set({ loading: false });
                }
            },

            setDefaultDashboard: async (dashboardId: number) => {
                set({ loading: true, error: null });

                const { error } = await withErrorHandling(() => AnalyticsApi.setDefaultDashboard(dashboardId));

                if (error) {
                    set({ error, loading: false });
                } else {
                    // Update local state to reflect the new default
                    const currentDashboards = get().dashboards;
                    const updatedDashboards = currentDashboards.map((dashboard) => ({
                        ...dashboard,
                        isDefault: dashboard.id === dashboardId,
                    }));

                    // Update current dashboard if it's the one being set as default
                    const currentDashboard = get().currentDashboard;
                    let updatedCurrentDashboard = currentDashboard;
                    if (currentDashboard) {
                        updatedCurrentDashboard = {
                            ...currentDashboard,
                            isDefault: currentDashboard.id === dashboardId,
                        };
                    }

                    set({
                        dashboards: updatedDashboards,
                        currentDashboard: updatedCurrentDashboard,
                        loading: false,
                    });
                }
            },

            // Metric preferences
            updateMetricVisibility: async (metricId: number, isVisible: boolean, dashboardId?: number) => {
                set({ loading: true, error: null });

                // Use current dashboard ID if not provided
                const targetDashboardId = dashboardId || get().currentDashboard?.id;

                const { error } = await withErrorHandling(() => AnalyticsApi.updateMetricPreference(metricId, { isVisible }, targetDashboardId));

                if (error) {
                    set({ error, loading: false });
                } else {
                    await get().loadCurrentDashboard(targetDashboardId);
                    set({ loading: false });
                }
            },

            updateMetricPositions: async (updates: Array<{ metricId: number; sortOrder: number; gridPosition: string }>, dashboardId?: number) => {
                console.log("Store: Starting updateMetricPositions with updates:", updates);
                set({ loading: true, error: null });

                try {
                    // Use current dashboard ID if not provided
                    const targetDashboardId = dashboardId || get().currentDashboard?.id;

                    if (!targetDashboardId) {
                        throw new Error("No dashboard ID available for updating metric positions");
                    }

                    console.log("Store: Using dashboard ID:", targetDashboardId);

                    // Transform updates to match API expected format
                    const updateRequests = updates.map((update) => ({
                        metricTypeId: update.metricId,
                        isVisible: true, // Keep metrics visible when just updating positions
                        sortOrder: update.sortOrder,
                        gridPosition: update.gridPosition,
                    }));

                    console.log("Store: Sending bulk update request:", { updates: updateRequests, dashboardId: targetDashboardId });

                    // Call the API
                    const { error } = await withErrorHandling(() => AnalyticsApi.bulkUpdateMetrics({ updates: updateRequests }, targetDashboardId));

                    if (error) {
                        console.error("Store: API call failed:", error);
                        set({ error, loading: false });
                        throw new Error(error);
                    } else {
                        console.log("Store: API call successful, reloading dashboard data");

                        // Reload the current dashboard to get updated positions
                        await get().loadCurrentDashboard(targetDashboardId);

                        console.log("Store: Dashboard reloaded successfully");
                        set({ loading: false });
                    }
                } catch (error) {
                    console.error("Store: updateMetricPositions failed:", error);
                    const errorMessage = error instanceof Error ? error.message : "Failed to update metric positions";
                    set({ error: errorMessage, loading: false });
                    throw error; // Re-throw to allow component error handling
                }
            },

            bulkUpdateMetrics: async (updates: MetricPreferenceUpdate[], dashboardId?: number) => {
                set({ loading: true, error: null });

                // Use current dashboard ID if not provided
                const targetDashboardId = dashboardId || get().currentDashboard?.id;

                const { error } = await withErrorHandling(() => AnalyticsApi.bulkUpdateMetrics({ updates }, targetDashboardId));

                if (error) {
                    set({ error, loading: false });
                } else {
                    await get().loadCurrentDashboard(targetDashboardId);
                    set({ loading: false });
                }
            },

            // ENHANCED: Load multiple metrics efficiently
            loadMetricData: async (metricIds: number[], filters?: AnalyticsFilters) => {
                // Use enhanced bulk endpoint with per-metric filters
                const requests = metricIds.map((metricId) => {
                    const savedFilters = get().loadMetricSettings(metricId);
                    return {
                        metricId,
                        filters: savedFilters || filters || {},
                    };
                });

                await get().loadEnhancedMetricsData(requests);
            },

            loadDashboardMetricsData: async (dashboardId: number) => {
                try {
                    const data = await AnalyticsApi.getDashboardMetricsData(dashboardId);
                    // eslint-disable-next-line
                    const updatedMetricsData: Record<number, any> = {};

                    data.forEach((metric) => {
                        updatedMetricsData[metric.metricId] = {
                            id: metric.metricId,
                            name: metric.metricName,
                            value: metric.value,
                            data: metric.chartData,
                            chartType: metric.chartType || "Card",
                            loading: false,
                            error: metric.error,
                            lastUpdated: metric.lastUpdated,
                        };
                    });
                    set({ metricsData: updatedMetricsData });
                } catch (error) {
                    console.error("Failed to load dashboard metrics data:", error);
                    set({ error: `Failed to load metrics: ${error}` });
                }
            },

            // NEW: Enhanced bulk loading with per-metric filters
            loadEnhancedMetricsData: async (requests: Array<{ metricId: number; filters?: AnalyticsFilters }>) => {
                // Set loading state for all requested metrics
                const metricsData = { ...get().metricsData };
                requests.forEach(({ metricId }) => {
                    metricsData[metricId] = {
                        ...metricsData[metricId],
                        id: metricId,
                        name: metricsData[metricId]?.name || `Metric ${metricId}`,
                        value: "Loading...",
                        chartType: metricsData[metricId]?.chartType || "Card",
                        loading: true,
                        error: undefined,
                    };
                });
                set({ metricsData });

                const { data, error } = await withErrorHandling(() => AnalyticsApi.getEnhancedMetricsData(requests));

                const updatedMetricsData = { ...get().metricsData };

                if (error) {
                    // Set error for all requested metrics
                    requests.forEach(({ metricId }) => {
                        updatedMetricsData[metricId] = {
                            ...updatedMetricsData[metricId],
                            loading: false,
                            error: error,
                        };
                    });
                } else if (data) {
                    // Update with received data
                    data.forEach((metric) => {
                        updatedMetricsData[metric.metricId] = {
                            id: metric.metricId,
                            name: metric.metricName,
                            value: metric.value,
                            data: metric.chartData,
                            chartType: metric.chartType || "Card",
                            loading: false,
                            error: metric.error,
                            lastUpdated: metric.lastUpdated,
                            currentFilters: requests.find((r) => r.metricId === metric.metricId)?.filters,
                        };
                    });

                    // Handle metrics that weren't returned (set error state)
                    const returnedIds = new Set(data.map((d) => d.metricId));
                    requests.forEach(({ metricId }) => {
                        if (!returnedIds.has(metricId)) {
                            updatedMetricsData[metricId] = {
                                ...updatedMetricsData[metricId],
                                loading: false,
                                error: "Metric data not available",
                            };
                        }
                    });
                }

                set({ metricsData: updatedMetricsData });
            },

            loadSingleMetricData: async (metricId: number, filters?: AnalyticsFilters) => {
                // Set loading state for the specific metric
                const metricsData = { ...get().metricsData };
                const existingMetric = metricsData[metricId];

                metricsData[metricId] = {
                    id: metricId,
                    name: existingMetric?.name || `Metric ${metricId}`,
                    value: "Loading...",
                    chartType: existingMetric?.chartType || "Card",
                    loading: true,
                    error: undefined,
                    currentFilters: filters,
                    lastUpdated: existingMetric?.lastUpdated,
                    data: existingMetric?.data,
                };
                set({ metricsData });

                const { data, error } = await withErrorHandling(() => AnalyticsApi.getSingleMetricData(metricId, filters || {}));

                const updatedMetricsData = { ...get().metricsData };

                if (error) {
                    updatedMetricsData[metricId] = {
                        ...updatedMetricsData[metricId],
                        loading: false,
                        error: error,
                        value: "Error loading data",
                    };
                } else if (data) {
                    updatedMetricsData[metricId] = {
                        id: data.metricId,
                        name: data.metricName,
                        value: data.value,
                        data: data.chartData,
                        chartType: data.chartType || "Card",
                        loading: false,
                        error: data.error,
                        lastUpdated: data.lastUpdated,
                        currentFilters: filters,
                    };
                } else {
                    // Handle case where response is successful but no data
                    updatedMetricsData[metricId] = {
                        ...updatedMetricsData[metricId],
                        loading: false,
                        error: "No data received",
                        value: "No data",
                    };
                }

                set({ metricsData: updatedMetricsData });
            },

            refreshAllMetricsData: async () => {
                const currentDashboard = get().currentDashboard;
                if (!currentDashboard) return;

                if (currentDashboard.id) {
                    await get().loadDashboardMetricsData(currentDashboard.id);
                }
            },

            // NEW: Per-metric filtering methods
            loadFilterOptions: async (type: string) => {
                const { data, error } = await withErrorHandling(() => AnalyticsApi.getFilterOptions(type));
                if (error) {
                    console.error(`Failed to load ${type} filter options:`, error);
                    return [];
                }

                return data || [];
            },

            applyMetricFilters: async (metricId: number, filters: AnalyticsFilters) => {
                set({ loading: true, error: null });

                try {
                    // Save the filters as settings first
                    await get().saveMetricSettings(metricId, filters);

                    // Then refresh the metric with new filters
                    await get().refreshMetricWithFilters(metricId, filters);

                    set({ loading: false });
                } catch (error) {
                    set({ error: `Failed to apply filters: ${error}`, loading: false });
                }
            },

            getMetricAvailableFilters: async (metricId: number): Promise<AvailableFilters> => {
                try {
                    const data = await AnalyticsApi.getAvailableFilters(metricId);
                    return data;
                } catch (error) {
                    console.error(`Failed to get available filters for metric ${metricId}:`, error);
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

            refreshMetricWithFilters: async (metricId: number, filters: AnalyticsFilters) => {
                // Update the metric as loading
                const currentMetricsData = get().metricsData;
                set({
                    metricsData: {
                        ...currentMetricsData,
                        [metricId]: {
                            ...currentMetricsData[metricId],
                            loading: true,
                            currentFilters: filters,
                        },
                    },
                });

                await get().loadSingleMetricData(metricId, filters);
            },

            // NEW: Save and load metric settings using CustomSettings
            saveMetricSettings: async (metricId: number, settings: AnalyticsFilters, dashboardId?: number) => {
                try {
                    const currentDashboard = get().currentDashboard;
                    const targetDashboardId = dashboardId || currentDashboard?.id;

                    const enhancedSettings = {
                        filters: settings,
                        lastUpdated: new Date().toISOString(),
                        savedAt: new Date().toISOString(),
                        version: "1.0",
                    };

                    console.log("Store: Saving enhanced metric settings:", { metricId, settings: enhancedSettings, dashboardId: targetDashboardId });

                    await AnalyticsApi.updateMetricSettings(metricId, {
                        customSettings: enhancedSettings,
                        dashboardId: targetDashboardId,
                    });

                    // Update local state in current dashboard metrics
                    if (currentDashboard) {
                        const updatedMetrics = currentDashboard.metrics.map((metric) => {
                            if (metric.id === metricId) {
                                return {
                                    ...metric,
                                    customSettings: enhancedSettings,
                                };
                            }
                            return metric;
                        });

                        // Update the current dashboard state
                        const updatedDashboard = {
                            ...currentDashboard,
                            metrics: updatedMetrics,
                        };

                        set({ currentDashboard: updatedDashboard });
                    }

                    // Also update metricsData if it exists
                    const currentMetricsData = get().metricsData;
                    if (currentMetricsData[metricId]) {
                        set({
                            metricsData: {
                                ...currentMetricsData,
                                [metricId]: {
                                    ...currentMetricsData[metricId],
                                    customSettings: enhancedSettings,
                                },
                            },
                        });
                    }

                    console.log("Store: Metric settings saved successfully");
                } catch (error) {
                    console.error(`Store: Failed to save settings for metric ${metricId}:`, error);
                    throw error;
                }
            },

            loadMetricSettings: (metricId: number): AnalyticsFilters | null => {
                const currentDashboard = get().currentDashboard;
                // eslint-disable-next-line
                const metric = currentDashboard?.metrics.find((m: any) => m.id === metricId);
                console.log(metric);
                if (metric?.customSettings?.filters) {
                    console.log("Store: Found saved settings in dashboard for metric", metricId, ":", metric.customSettings.filters);
                    return metric.customSettings.filters;
                }

                // Fallback: check if settings are stored in metricsData
                const metricData = get().metricsData[metricId];
                if (metricData?.customSettings?.filters) {
                    console.log("Store: Found saved settings in metricsData for metric", metricId, ":", metricData.customSettings.filters);
                    return metricData.customSettings.filters;
                }

                console.log("Store: No saved settings found for metric", metricId);
                return null;
            },

            // UI state
            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
            clearError: () => set({ error: null }),
        }),
        {
            name: "dashboard-store",
        }
    )
);
