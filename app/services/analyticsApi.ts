// services/analyticsApi.ts
import { axiosClient } from "../utils";
import { UserDashboard, AnalyticsConfiguration, CreateDashboardRequest, UpdateDashboardRequest, UpdateMetricPreferenceRequest, UpdateMetricSettingsRequest, BulkUpdateMetricsRequest, MetricDataResponse, AnalyticsDataRequest, AnalyticsFilters, FilterOption, AvailableFilters, HealthCheckResponse } from "../types/analytics";

// Consent Analytics Types
export interface ConsentAnalyticsData {
    totalConsentVideos: number;
    totalViewedConsentVideos: number;
    totalConsentSignatures: number;
    videosList: Array<{ value: string; text: string }>;
    signersName: Array<{ value: string; text: string }>;
    videoWatchedTime: {
        totalTimeWatched: string;
        totalTimeWatchedReadable: string;
        watchedTimes: number;
        average: string;
        viewers: number;
    };
    topActionTypes: Record<string, number>;
    openedSectionConfirmations: Record<string, number>;
    sectionConfirmations: Record<string, number>;
    openedDischarge: Record<string, number>;
    dischargeConfirmation: Record<string, number>;
    documentViewed: Record<string, number>;
    submittedSignatures: Record<string, number>;
    surveyViewed: Record<string, number>;
    surveyClicked: Record<string, number>;
}

// Quiz Analytics Types
export interface QuizAnalyticsChartData {
    label: string;
    value: number;
}

export interface QuizAnalyticsDetailData {
    quizDetailId: number;
    quizName: string;
    question: string;
    currentQuestions: string[];
    usersViewed: number;
    usersCompleted: number;
    completionPercentage: number;
    averageTimeInSeconds: string;
    averageScore: number;
    topAnswers: QuizAnalyticsChartData[];
    generalQuizInfo: QuizAnalyticsChartData[];
}

export interface QuizAnalyticsData {
    totalAnswers: number;
    totalQuizzes: number;
    correctAnswerAverage: number;
    quizDetails: QuizAnalyticsDetailData[];
    mostViewedQuiz: QuizAnalyticsChartData[];
    mostAnsweredQuiz: QuizAnalyticsChartData[];
    videoList: Array<{ text: string; value: string }>;
    selectedVideo: string;
    totalGeneralQuizInfo: QuizAnalyticsChartData[];
}

// Flow Analytics Types
export interface FlowAnalyticsUser {
    id: number;
    name: string;
}

export interface FlowAnalyticsActionVariation {
    screen: string;
    action: string;
    displayData: string;
    originalData: string;
    count: number;
}

export interface FlowAnalyticsActionsAndUsers {
    actionList: string[];
    userList: FlowAnalyticsUser[];
}

export interface FlowAnalyticsData {
    actionsCount: number;
    usersCount: number;
    lastActionsCount: number;
    nextActionsCount: number;
    variations: FlowAnalyticsActionVariation[];
    variationsIndex: number;
    hasMoreVariations: boolean;
    lastActions: Record<string, number>;
    nextActions: Record<string, number>;
}

export interface FlowAnalyticsVisualization {
    lastActionVariations: FlowAnalyticsActionVariation[];
    nextActionVariations: FlowAnalyticsActionVariation[];
    currentActionAndVariation: FlowAnalyticsActionVariation;
    hasMore: boolean;
    total: number;
}

export interface FlowAnalyticsSummary {
    screensList: Array<{ text: string; value: string }>;
    topActions: Array<Record<string, number>>;
}

// Mobile Analytics Types
export interface MobileAnalyticsWatchedTime {
    totalTimeWatched: string;
    totalTimeWatchedReadable: string;
    watchedTimes: number;
    average: string;
    viewers: number;
}

export interface MobileAnalyticsSummary {
    userRole: string;
    programList: Array<{ text: string; value: string }>;
    totalLikes: number;
    totalFavorites: number;
    totalWatchedTime: MobileAnalyticsWatchedTime;
    appearedInSearchsCount: number;
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    totalVideos: number;
}

// Product Analytics Types
export interface ProductAnalyticsSalesInfo {
    totalValue: string;
    totalValueAverage: string;
    totalItemsQuantity: number;
    averageOrderValue: string;
}

export interface ProductAnalyticsSummary {
    totalProducts: number;
    episodeList: Array<{ id: string; name: string }>;
    productList: Array<{ text: string; value: string }>;
    viewedProductsNotPurchased: Array<{ label: string; count: number; gains: number; percentage: string; date: string }>;
    cartProductsNotPurchased: Array<{ label: string; count: number; gains: number; percentage: string; date: string }>;
    salesInfo: ProductAnalyticsSalesInfo;
}

export interface ProductAnalyticsChartData {
    label: string;
    value: number;
}

export interface GrossSalesStats {
    avgProductCost: string;
    avgValueOrder: string;
    minProductCost: string;
    maxProductCost: string;
}

export interface GrossSalesResponse {
    chartData: Array<{ label: string; value: number }>;
    ordersCount: number;
    stats: GrossSalesStats;
}

export interface AbandonedProductsResponse {
    abandoned: Record<string, number>;
    viewed: Record<string, number>;
}

export class AnalyticsApi {
    // Dashboard management
    static async getUserDashboards(): Promise<UserDashboard[]> {
        const response = await axiosClient.get("/api/analyticspreferences/dashboards");
        return response.data;
    }

    static async getUserDashboard(dashboardId?: number): Promise<UserDashboard> {
        const url = dashboardId ? `/api/analyticspreferences/dashboard?dashboardId=${dashboardId}` : "/api/analyticspreferences/dashboard";
        const response = await axiosClient.get(url);
        return response.data;
    }

    static async createDashboard(request: CreateDashboardRequest): Promise<UserDashboard> {
        const response = await axiosClient.post("/api/analyticspreferences/dashboards", request);
        return response.data;
    }

    static async updateDashboard(dashboardId: number, request: UpdateDashboardRequest): Promise<UserDashboard> {
        const response = await axiosClient.put(`/api/analyticspreferences/dashboards/${dashboardId}`, request);
        return response.data;
    }

    static async deleteDashboard(dashboardId: number): Promise<void> {
        await axiosClient.delete(`/api/analyticspreferences/dashboards/${dashboardId}`);
    }

    static async setDefaultDashboard(dashboardId: number): Promise<void> {
        await axiosClient.put(`/api/analyticspreferences/dashboards/${dashboardId}/set-default`);
    }

    // Analytics configurations
    static async getAvailableAnalytics(): Promise<AnalyticsConfiguration[]> {
        const response = await axiosClient.get("/api/analyticspreferences/available");
        return response.data;
    }

    // Metric preferences
    static async updateMetricPreference(metricId: number, request: UpdateMetricPreferenceRequest, dashboardId?: number): Promise<void> {
        // FIXED: Include dashboard ID in the request body, not as query parameter
        const requestWithDashboard = {
            ...request,
            dashboardId: dashboardId || request.dashboardId, // Use provided dashboardId or the one in request
        };

        console.log("AnalyticsApi: updateMetricPreference called with:", {
            metricId,
            originalRequest: request,
            finalRequest: requestWithDashboard,
        });

        await axiosClient.put(`/api/analyticspreferences/metrics/${metricId}`, requestWithDashboard);
    }

    static async bulkUpdateMetrics(request: BulkUpdateMetricsRequest, dashboardId?: number): Promise<void> {
        // FIXED: Ensure dashboard ID is in the request body
        const requestWithDashboard = {
            ...request,
            dashboardId: dashboardId || request.dashboardId,
        };

        console.log("AnalyticsApi: bulkUpdateMetrics called with:", {
            originalRequest: request,
            finalRequest: requestWithDashboard,
        });

        await axiosClient.put("/api/analyticspreferences/metrics/bulk", requestWithDashboard);
    }

    // NEW: Metric settings (for storing filter preferences)
    static async updateMetricSettings(metricId: number, request: UpdateMetricSettingsRequest): Promise<void> {
        await axiosClient.put(`/api/analyticspreferences/metrics/${metricId}/settings`, request);
    }

    // Analytics data - ENHANCED BULK METHODS
    static async getMetricsData(request: AnalyticsDataRequest): Promise<MetricDataResponse[]> {
        const response = await axiosClient.post("/api/analytics/data", request);

        return response.data.metrics;
    }

    // NEW: Enhanced bulk method with per-metric filtering
    static async getEnhancedMetricsData(requests: Array<{ metricId: number; filters?: AnalyticsFilters }>): Promise<MetricDataResponse[]> {
        const response = await axiosClient.post("/api/analytics/data/bulk-enhanced", {
            metricRequests: requests,
        });
        return response.data.metrics;
    }

    // NEW: Get all dashboard metrics with their saved filters in one call
    static async getDashboardMetricsData(dashboardId: number): Promise<MetricDataResponse[]> {
        const response = await axiosClient.post(`/api/analytics/data/dashboard/${dashboardId}`);
        console.log(response.data.metrics);

        return response.data.metrics;
    }

    // UPDATED: Get single metric data with filters (now with proper payload)
    static async getSingleMetricData(metricId: number, filters: AnalyticsFilters): Promise<MetricDataResponse> {
        const response = await axiosClient.post(`/api/analytics/data/${metricId}`, filters || {});
        console.log(response.data);

        return response.data;
    }

    // UPDATED: Get available filters for a metric - now returns guaranteed AvailableFilters type
    static async getAvailableFilters(metricId: number): Promise<AvailableFilters> {
        try {
            const response = await axiosClient.get(`/api/analytics/filters/${metricId}`);

            // Ensure we always return a complete AvailableFilters object
            return {
                supportsDateFilter: response.data?.supportsDateFilter || false,
                supportsVideoFilter: response.data?.supportsVideoFilter || false,
                supportsProductFilter: response.data?.supportsProductFilter || false,
                supportsUserFilter: response.data?.supportsUserFilter || false,
                supportsScreenFilter: response.data?.supportsScreenFilter || false,
                supportsSignerFilter: response.data?.supportsSignerFilter || false,
                supportsSubscriptionCategoryFilter: response.data?.supportsSubscriptionCategoryFilter || false,
                supportsTerm: response.data?.supportsTerm || false, // NEW: Added term support
                availableTerms: response.data?.availableTerms || ["daily", "weekly", "monthly", "yearly"],
                defaultTerm: response.data?.defaultTerm || "monthly",
            };
        } catch (error) {
            console.error(`Failed to fetch available filters for metric ${metricId}:`, error);
            // Return default AvailableFilters on error
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
    }

    // UPDATED: Get filter options - now returns consistent FilterOption[] type
    static async getFilterOptions(type: string): Promise<FilterOption[]> {
        try {
            console.log(`Loading filter options for type: ${type}`);
            const response = await axiosClient.get(`/api/analytics/filter-options/${type}`);

            console.log(`Raw response for ${type}:`, response.data);

            // Handle different response formats from backend
            let data = response.data;

            // If the response is wrapped in a property (e.g., { videos: [...] })
            if (data && typeof data === "object" && !Array.isArray(data)) {
                // Try to extract the array from the response object
                data = data[type] || data.data || data;
            }

            // Ensure we have an array
            if (!Array.isArray(data)) {
                console.warn(`Expected array for ${type}, got:`, typeof data, data);
                return [];
            }

            // eslint-disable-next-line
            const processedData = data.map((item: any, index: number) => {
                // Check if item is already in correct format
                if (item && typeof item === "object" && typeof item.id !== "undefined" && typeof item.name === "string") {
                    return {
                        id: Number(item.id) || index,
                        name: item.name,
                    };
                }

                // Handle string representations of objects
                if (typeof item === "string") {
                    // If the string contains [object Object], it means serialization failed
                    if (item.includes("[object Object]")) {
                        console.error(`Detected [object Object] serialization issue for ${type} at index ${index}:`, item);
                        return {
                            id: index,
                            name: `${type.slice(0, -1)} ${index + 1}`, // videos -> video 1, products -> product 1
                        };
                    }

                    // Try to parse as JSON if it looks like JSON
                    if (item.startsWith("{") || item.startsWith("[")) {
                        try {
                            const parsed = JSON.parse(item);
                            return {
                                id: Number(parsed.id) || index,
                                name: parsed.name || `${type.slice(0, -1)} ${index + 1}`,
                            };
                        } catch {
                            console.warn(`Failed to parse JSON string for ${type}:`, item);
                        }
                    }

                    // Use string as name with index as id
                    return {
                        id: index,
                        name: item,
                    };
                }

                // Handle numeric or other primitive types
                return {
                    id: Number(item) || index,
                    name: String(item) || `${type.slice(0, -1)} ${index + 1}`,
                };
            });

            console.log(`Processed data for ${type}:`, processedData);
            return processedData;
        } catch (error) {
            console.error(`Failed to load ${type} filter options:`, error);
            return [];
        }
    }

    // Health check
    static async healthCheck(): Promise<HealthCheckResponse> {
        const response = await axiosClient.get("/api/analytics/health");
        return response.data;
    }

    // NEW: Enhanced filtering methods for future use

    // Get enhanced available filters with additional metadata
    static async getEnhancedAvailableFilters(metricId: number): Promise<{
        supportsDateFilter: boolean;
        supportsVideoFilter: boolean;
        supportsProductFilter: boolean;
        supportsUserFilter: boolean;
        supportsScreenFilter: boolean;
        supportsSignerFilter: boolean;
        supportsSubscriptionCategoryFilter: boolean;
        supportsTerm: boolean;
        availableTerms: string[];
        defaultTerm: string;
        metricInfo: {
            id: number;
            name: string;
            displayName: string;
            description?: string;
            chartType: string;
            isAdminOnly: boolean;
        };
        userPermissions: {
            isAdmin: boolean;
            canFilterByUser: boolean;
            availableCompanies: Array<{ id: number; name: string }>;
        };
    }> {
        try {
            const response = await axiosClient.get(`/api/analytics/filters/${metricId}/enhanced`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch enhanced filters for metric ${metricId}:`, error);
            throw error;
        }
    }

    // Batch request for multiple metrics with different filters
    static async getBatchMetricsData(requests: Array<{ metricId: number; filters?: AnalyticsFilters }>): Promise<MetricDataResponse[]> {
        try {
            // For now, we'll make individual requests since the backend doesn't support batch requests yet
            // TODO: Implement batch endpoint in backend for better performance
            const results: MetricDataResponse[] = [];

            for (const request of requests) {
                try {
                    const response = await this.getSingleMetricData(request.metricId, request.filters || {});
                    results.push(response);
                } catch (error) {
                    console.error(`Failed to fetch data for metric ${request.metricId}:`, error);
                    // Add error response for failed metric
                    results.push({
                        metricId: request.metricId,
                        metricName: `Metric ${request.metricId}`,
                        value: "Error",
                        chartType: "Card",
                        lastUpdated: new Date().toISOString(),
                        error: `Failed to load metric data: ${error}`,
                    });
                }
            }

            return results;
        } catch (error) {
            console.error("Failed to fetch batch metrics data:", error);
            throw error;
        }
    }

    // Save multiple metric settings at once
    static async saveBatchMetricSettings(settings: Array<{ metricId: number; filters: AnalyticsFilters; dashboardId?: number }>): Promise<void> {
        try {
            // Save each metric setting individually
            // TODO: Implement batch settings endpoint for better performance
            const promises = settings.map((setting) =>
                this.updateMetricSettings(setting.metricId, {
                    customSettings: {
                        filters: setting.filters,
                        lastUpdated: new Date().toISOString(),
                    },
                    dashboardId: setting.dashboardId,
                })
            );

            await Promise.all(promises);
        } catch (error) {
            console.error("Failed to save batch metric settings:", error);
            throw error;
        }
    }

    // Brand Analytics - Get analytics data for brands
    static async getBrandAnalytics(): Promise<{
        brandsCount: number;
        productsCount: number;
        avgProducts: number;
        topBrandsByProducts: Array<{ brandName: string; productCount: number }>;
    }> {
        try {
            const response = await axiosClient.get("/api/admin-brands/analytics");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch brand analytics:", error);
            throw error;
        }
    }

    // Subscription Analytics - Get subscription categories
    static async getSubscriptionCategories(): Promise<Array<{ text: string; value: string }>> {
        try {
            const response = await axiosClient.get("/api/subscription-analytics/categories");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch subscription categories:", error);
            throw error;
        }
    }

    // Subscription Analytics - Get subscription data (bar chart)
    static async getSubscriptionData(request: { startDate?: string; endDate?: string; category?: string }): Promise<{
        name: string;
        subCategoryInfo: Array<{
            name: string;
            customerCount: number;
            totalPrice: string;
        }>;
    }> {
        try {
            const response = await axiosClient.post("/api/subscription-analytics/data", request);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch subscription data:", error);
            throw error;
        }
    }

    // Subscription Analytics - Get subscription growth data (line chart)
    static async getSubscriptionGrowth(request: { startDate?: string; endDate?: string; term?: string; category?: string }): Promise<
        Array<{
            label: string;
            genericList: Array<{
                dateAdded: string;
                renewalDate?: string;
                active: boolean;
            }>;
            growth: string;
        }>
    > {
        try {
            const response = await axiosClient.post("/api/subscription-analytics/growth", request);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch subscription growth:", error);
            throw error;
        }
    }

    // Video Analytics - Get list of videos for filtering
    static async getVideos(): Promise<Array<{ id: number; name: string }>> {
        try {
            const response = await axiosClient.get("/api/video-analytics/videos");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch videos:", error);
            throw error;
        }
    }

    // Video Analytics - Get overall summary statistics
    static async getVideoAnalyticsSummary(platform: string = "Web"): Promise<{
        totalVideos: number;
        totalViewers: number;
        totalViews: number;
        totalWatchedTime: string;
        totalWatchedTimeReadable: string;
        averageTime: string;
    }> {
        try {
            const response = await axiosClient.get("/api/video-analytics/summary", {
                params: { platform },
            });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch video analytics summary:", error);
            throw error;
        }
    }

    // Video Analytics - Get popular videos chart data
    static async getPopularVideos(platform: string = "Web"): Promise<Array<{ label: string; value: number }>> {
        try {
            const response = await axiosClient.post("/api/video-analytics/popular-videos", {
                platform,
            });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch popular videos:", error);
            throw error;
        }
    }

    // Video Analytics - Get top actions for all videos
    static async getTopActionsForAllVideos(platform: string = "Web"): Promise<Array<{ label: string; value: number }>> {
        try {
            const response = await axiosClient.post("/api/video-analytics/top-actions-all", {
                platform,
            });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch top actions:", error);
            throw error;
        }
    }

    // Video Analytics - Get frequency data for all videos
    static async getFrequencyForAllVideos(request: { startDate?: string; endDate?: string; platform?: string }): Promise<
        Array<{
            weekDay: string;
            frequency: number;
            hourFrequency: Record<string, number>;
        }>
    > {
        try {
            const response = await axiosClient.post("/api/video-analytics/frequency-all", request);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch frequency data:", error);
            throw error;
        }
    }

    // Video Analytics - Get video-specific statistics
    static async getVideoStats(request: { videoId: number; startDate?: string; endDate?: string; platform?: string }): Promise<{
        totalWatchedTime: string;
        totalWatchedTimeReadable: string;
        watchedCount: number;
        average: string;
        viewers: number;
    }> {
        try {
            const response = await axiosClient.post("/api/video-analytics/video-stats", request);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch video stats:", error);
            throw error;
        }
    }

    // Video Analytics - Get video views over time
    static async getVideoViews(request: { videoId: number; term?: string; startDate?: string; endDate?: string; platform?: string }): Promise<Array<{ label: string; value: number }>> {
        try {
            const response = await axiosClient.post("/api/video-analytics/video-views", request);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch video views:", error);
            throw error;
        }
    }

    // Video Analytics - Get top actions for specific video
    static async getTopActionsByVideo(request: { videoId: number; startDate?: string; endDate?: string; platform?: string }): Promise<Array<{ label: string; value: number }>> {
        try {
            const response = await axiosClient.post("/api/video-analytics/top-actions-video", request);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch top actions:", error);
            throw error;
        }
    }

    // Video Analytics - Get frequency data for specific video
    static async getFrequencyForVideo(request: { videoId: number; startDate?: string; endDate?: string; platform?: string }): Promise<
        Array<{
            weekDay: string;
            frequency: number;
            hourFrequency: Record<string, number>;
        }>
    > {
        try {
            const response = await axiosClient.post("/api/video-analytics/frequency-video", request);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch frequency data:", error);
            throw error;
        }
    }

    // ========================================
    // CONSENT ANALYTICS METHODS
    // ========================================

    /**
     * Get consent analytics summary with videos and signers lists
     * GET /api/consent-analytics/summary
     */
    static async getConsentAnalyticsSummary(selectedVideo?: number, signerName?: string, startDate?: string, endDate?: string): Promise<ConsentAnalyticsData> {
        try {
            const params = new URLSearchParams();
            if (selectedVideo) params.append("selectedVideo", selectedVideo.toString());
            if (signerName) params.append("signerName", signerName);
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            const response = await axiosClient.get(`/api/consent-analytics/summary?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch consent analytics summary:", error);
            throw error;
        }
    }

    /**
     * Get consent videos list and signers for dropdowns
     * GET /api/consent-analytics/videos
     */
    static async getConsentVideos(): Promise<{
        videosList: Array<{ id: string; name: string }>;
        signersName: Array<{ id: string; name: string }>;
    }> {
        try {
            const response = await axiosClient.get("/api/consent-analytics/videos");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch consent videos:", error);
            throw error;
        }
    }

    /**
     * Filter consent analytics data
     * POST /api/consent-analytics/filter
     */
    static async filterConsentAnalytics(request: { selectedVideo?: number; signerName?: string; startDate?: string; endDate?: string }): Promise<ConsentAnalyticsData> {
        try {
            const response = await axiosClient.post("/api/consent-analytics/filter", request);
            return response.data;
        } catch (error) {
            console.error("Failed to filter consent analytics:", error);
            throw error;
        }
    }

    /**
     * Get quiz analytics summary data
     * GET /api/quiz-analytics/summary
     */
    static async getQuizAnalyticsSummary(): Promise<QuizAnalyticsData> {
        try {
            const response = await axiosClient.get("/api/quiz-analytics/summary");
            return response.data;
        } catch (error) {
            console.error("Failed to get quiz analytics summary:", error);
            throw error;
        }
    }

    /**
     * Filter quiz analytics details
     * POST /api/quiz-analytics/filter
     */
    static async filterQuizAnalytics(request: { videoId?: number; companyId?: number; startDate?: string; endDate?: string }): Promise<QuizAnalyticsDetailData[]> {
        try {
            const response = await axiosClient.post("/api/quiz-analytics/filter", request);
            return response.data;
        } catch (error) {
            console.error("Failed to filter quiz analytics:", error);
            throw error;
        }
    }

    /**
     * Get flow analytics summary data
     * GET /api/flow-analytics/summary
     */
    static async getFlowAnalyticsSummary(): Promise<FlowAnalyticsSummary> {
        try {
            const response = await axiosClient.get("/api/flow-analytics/summary");
            return response.data;
        } catch (error) {
            console.error("Failed to get flow analytics summary:", error);
            throw error;
        }
    }

    /**
     * Get actions and users from screen
     * POST /api/flow-analytics/actions-and-users
     */
    static async getActionsAndUsersFromScreen(screen: string): Promise<FlowAnalyticsActionsAndUsers> {
        try {
            const response = await axiosClient.post("/api/flow-analytics/actions-and-users", { screen });
            return response.data;
        } catch (error) {
            console.error("Failed to get actions and users:", error);
            throw error;
        }
    }

    /**
     * Get flow data from action and user
     * POST /api/flow-analytics/flow-data
     */
    static async getFlowDataFromActionAndUser(request: { screen: string; action: string; userId?: number; startDate?: string; endDate?: string }): Promise<FlowAnalyticsData> {
        try {
            const response = await axiosClient.post("/api/flow-analytics/flow-data", request);
            return response.data;
        } catch (error) {
            console.error("Failed to get flow data:", error);
            throw error;
        }
    }

    /**
     * Get action variations
     * POST /api/flow-analytics/action-variations
     */
    static async getActionVariations(request: { screen: string; action: string; userId?: number; startDate?: string; endDate?: string; skipVariations?: number; take?: number }): Promise<FlowAnalyticsData> {
        try {
            const response = await axiosClient.post("/api/flow-analytics/action-variations", request);
            return response.data;
        } catch (error) {
            console.error("Failed to get action variations:", error);
            throw error;
        }
    }

    /**
     * Get flow visualization
     * POST /api/flow-analytics/flow
     */
    static async getFlow(request: { screen: string; action: string; userId?: number; variation: string; startDate?: string; endDate?: string; page?: number }): Promise<FlowAnalyticsVisualization> {
        try {
            const response = await axiosClient.post("/api/flow-analytics/flow", request);
            return response.data;
        } catch (error) {
            console.error("Failed to get flow:", error);
            throw error;
        }
    }

    /**
     * Get top actions flow
     * POST /api/flow-analytics/top-actions
     */
    static async getTopActionsFlow(request: { startDate?: string; endDate?: string }): Promise<Array<Record<string, number>>> {
        try {
            const response = await axiosClient.post("/api/flow-analytics/top-actions", request);
            return response.data;
        } catch (error) {
            console.error("Failed to get top actions:", error);
            throw error;
        }
    }

    /**
     * Get mobile analytics summary data
     * GET /api/mobile-analytics/summary
     */
    static async getMobileAnalyticsSummary(): Promise<MobileAnalyticsSummary> {
        try {
            const response = await axiosClient.get("/api/mobile-analytics/summary");
            return response.data;
        } catch (error) {
            console.error("Failed to get mobile analytics summary:", error);
            throw error;
        }
    }

    /**
     * Get likes growth chart data for mobile analytics
     * POST /api/mobile-analytics/likes-growth
     */
    static async getMobileLikesGrowth(request: { episodeId?: number; term?: string; startDate?: string; endDate?: string }): Promise<Array<{ label: string; count: number; gains: number; percentage: number }>> {
        try {
            const response = await axiosClient.post("/api/mobile-analytics/likes-growth", {
                episodeId: request.episodeId,
                term: request.term || "monthly",
                startDate: request.startDate,
                endDate: request.endDate || new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get mobile likes growth:", error);
            throw error;
        }
    }

    /**
     * Get favorites growth chart data for mobile analytics
     * POST /api/mobile-analytics/favorites-growth
     */
    static async getMobileFavoritesGrowth(request: { episodeId?: number; term?: string; startDate?: string; endDate?: string }): Promise<Array<{ label: string; count: number; gains: number; percentage: number }>> {
        try {
            const response = await axiosClient.post("/api/mobile-analytics/favorites-growth", {
                episodeId: request.episodeId,
                term: request.term || "monthly",
                startDate: request.startDate,
                endDate: request.endDate || new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get mobile favorites growth:", error);
            throw error;
        }
    }

    /**
     * Get video search appearances data for mobile analytics
     * POST /api/mobile-analytics/search-appearances
     */
    static async getMobileSearchAppearances(request: { episodeId?: number; term?: string; startDate?: string; endDate?: string }): Promise<{ value: number; searchGains: Array<{ label: string; count: number; percentage: number }> }> {
        try {
            const response = await axiosClient.post("/api/mobile-analytics/search-appearances", {
                episodeId: request.episodeId,
                term: request.term || "monthly",
                startDate: request.startDate,
                endDate: request.endDate || new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get mobile search appearances:", error);
            throw error;
        }
    }

    // Product Analytics Methods

    /**
     * Get product analytics summary data
     * GET /api/product-analytics/summary
     */
    static async getProductAnalyticsSummary(): Promise<ProductAnalyticsSummary> {
        try {
            const response = await axiosClient.get("/api/product-analytics/summary");
            return response.data;
        } catch (error) {
            console.error("Failed to get product analytics summary:", error);
            throw error;
        }
    }

    /**
     * Get top selling products
     * POST /api/product-analytics/top-selling
     */
    static async getTopSellingProducts(companyUserId?: number): Promise<ProductAnalyticsChartData[]> {
        try {
            const response = await axiosClient.post("/api/product-analytics/top-selling", {
                companyUserId
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get top selling products:", error);
            throw error;
        }
    }

    /**
     * Get orders by status
     * POST /api/product-analytics/orders-by-status
     */
    static async getOrdersByStatus(companyUserId?: number): Promise<ProductAnalyticsChartData[]> {
        try {
            const response = await axiosClient.post("/api/product-analytics/orders-by-status", {
                companyUserId
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get orders by status:", error);
            throw error;
        }
    }

    /**
     * Get gross sales data
     * POST /api/product-analytics/gross-sales
     */
    static async getGrossSales(request: {
        term?: string;
        episodeId?: number;
        companyUserId?: number;
        startDate?: string;
        endDate?: string;
        productName?: string;
    }): Promise<GrossSalesResponse> {
        try {
            const response = await axiosClient.post("/api/product-analytics/gross-sales", {
                term: request.term || "monthly",
                episodeId: request.episodeId,
                companyUserId: request.companyUserId,
                startDate: request.startDate,
                endDate: request.endDate || new Date().toISOString(),
                productName: request.productName
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get gross sales:", error);
            throw error;
        }
    }

    /**
     * Get abandoned products info (viewed/abandoned in cart)
     * POST /api/product-analytics/abandoned-products
     */
    static async getAbandonedProducts(request: {
        episodeId?: number;
        companyUserId?: number;
        startDate?: string;
        endDate?: string;
        productName?: string;
    }): Promise<AbandonedProductsResponse> {
        try {
            const response = await axiosClient.post("/api/product-analytics/abandoned-products", {
                episodeId: request.episodeId,
                companyUserId: request.companyUserId,
                startDate: request.startDate,
                endDate: request.endDate || new Date().toISOString(),
                productName: request.productName
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get abandoned products:", error);
            throw error;
        }
    }

    /**
     * Get products by episode
     * POST /api/product-analytics/products-by-episode
     */
    static async getProductsByEpisode(episodeId: number): Promise<string[]> {
        try {
            const response = await axiosClient.post("/api/product-analytics/products-by-episode", {
                episodeId
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get products by episode:", error);
            throw error;
        }
    }

    /**
     * Get total orders chart data
     * POST /api/product-analytics/total-orders
     */
    static async getTotalOrders(request: {
        term?: string;
        episodeId?: number;
        companyUserId?: number;
        startDate?: string;
        endDate?: string;
        productName?: string;
    }): Promise<ProductAnalyticsChartData[]> {
        try {
            const response = await axiosClient.post("/api/product-analytics/total-orders", {
                term: request.term || "monthly",
                episodeId: request.episodeId,
                companyUserId: request.companyUserId,
                startDate: request.startDate,
                endDate: request.endDate || new Date().toISOString(),
                productName: request.productName
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get total orders:", error);
            throw error;
        }
    }

    /**
     * Get product views trend data
     * POST /api/product-analytics/product-views
     */
    static async getProductViews(request: {
        term?: string;
        episodeId?: number;
        companyUserId?: number;
        startDate?: string;
        endDate?: string;
        productName?: string;
    }): Promise<ProductAnalyticsChartData[]> {
        try {
            const response = await axiosClient.post("/api/product-analytics/product-views", {
                term: request.term || "monthly",
                episodeId: request.episodeId,
                companyUserId: request.companyUserId,
                startDate: request.startDate,
                endDate: request.endDate || new Date().toISOString(),
                productName: request.productName
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get product views:", error);
            throw error;
        }
    }

    /**
     * Get sales frequency by day of week
     * POST /api/product-analytics/sales-frequency
     */
    static async getSalesFrequency(request: {
        term?: string;
        episodeId?: number;
        companyUserId?: number;
        startDate?: string;
        endDate?: string;
        productName?: string;
    }): Promise<ProductAnalyticsChartData[]> {
        try {
            const response = await axiosClient.post("/api/product-analytics/sales-frequency", {
                term: request.term || "monthly",
                episodeId: request.episodeId,
                companyUserId: request.companyUserId,
                startDate: request.startDate,
                endDate: request.endDate || new Date().toISOString(),
                productName: request.productName
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get sales frequency:", error);
            throw error;
        }
    }

    /**
     * Get hourly sales distribution
     * POST /api/product-analytics/hourly-sales
     */
    static async getHourlySales(request: {
        episodeId?: number;
        companyUserId?: number;
        startDate?: string;
        endDate?: string;
        productName?: string;
        dayOfWeek?: number;
    }): Promise<ProductAnalyticsChartData[]> {
        try {
            const response = await axiosClient.post("/api/product-analytics/hourly-sales", {
                episodeId: request.episodeId,
                companyUserId: request.companyUserId,
                startDate: request.startDate,
                endDate: request.endDate || new Date().toISOString(),
                productName: request.productName,
                dayOfWeek: request.dayOfWeek
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get hourly sales:", error);
            throw error;
        }
    }

    /**
     * Get customer locations for heat map
     * POST /api/product-analytics/customer-locations
     */
    static async getCustomerLocations(request: {
        episodeId?: number;
        companyUserId?: number;
        startDate?: string;
        endDate?: string;
        productName?: string;
        ageRanges?: Array<{ minAge: number; maxAge: number }>;
    }): Promise<Array<{ latitude: number; longitude: number }>> {
        try {
            const response = await axiosClient.post("/api/product-analytics/customer-locations", {
                episodeId: request.episodeId,
                companyUserId: request.companyUserId,
                startDate: request.startDate,
                endDate: request.endDate || new Date().toISOString(),
                productName: request.productName,
                ageRanges: request.ageRanges
            });
            return response.data;
        } catch (error) {
            console.error("Failed to get customer locations:", error);
            throw error;
        }
    }
}
