// types/analytics.ts
export interface AnalyticsConfiguration {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    chartTypes: string[];
    metrics: MetricType[];
}

export interface MetricType {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    chartType: string;
    isAdminOnly: boolean;
    supportsDateFilter: boolean;
    supportsVideoFilter: boolean;
    supportsProductFilter: boolean;
    supportsUserFilter: boolean;
    supportsScreenFilter: boolean;
    supportsSignerFilter: boolean;
    supportsSubscriptionCategoryFilter: boolean;
    supportsTerm: boolean; // NEW: Added term support flag
    sortOrder: number;
    isVisible: boolean;
    gridPosition?: string;
    customSettings?: {
        filters?: AnalyticsFilters;
        lastUpdated?: string;
        savedAt?: string;
        version?: string;
        // eslint-disable-next-line
        [key: string]: any;
    } | null;
}

export interface UserDashboard {
    id: number;
    name: string;
    description?: string;
    isDefault: boolean;
    // eslint-disable-next-line
    layoutSettings: Record<string, any>;
    metrics: MetricType[];
}

export interface CreateDashboardRequest {
    name: string;
    description?: string;
}

export interface UpdateDashboardRequest {
    name: string;
    description?: string;
    // eslint-disable-next-line
    layoutSettings?: Record<string, any>;
}

export interface UpdateMetricPreferenceRequest {
    isVisible: boolean;
    sortOrder?: number;
    gridPosition?: string;
    dashboardId?: number;
}

export interface UpdateMetricSettingsRequest {
    // eslint-disable-next-line
    customSettings: Record<string, any>;
    dashboardId?: number;
}

export interface MetricPreferenceUpdate {
    metricTypeId: number;
    isVisible: boolean;
    sortOrder?: number;
    gridPosition?: string;
}

export interface BulkUpdateMetricsRequest {
    updates: MetricPreferenceUpdate[];
    dashboardId?: number;
}

// Chart data interfaces
export interface MetricData {
    id: number;
    name: string;
    value: number | string;
    data?: ChartDataPoint[];
    chartType: string;
    loading?: boolean;
    error?: string;
    lastUpdated?: string;
    currentFilters?: AnalyticsFilters; // Track current filters for this metric
    availableFilters?: AvailableFilters; // Available filter capabilities
    customSettings?: {
        filters?: AnalyticsFilters;
        lastUpdated?: string;
        savedAt?: string;
        version?: string;
        // eslint-disable-next-line
        [key: string]: any;
    } | null;
}

export interface ChartDataPoint {
    name: string;
    value: number | string;
    label?: string;
    date?: string;
    percentage?: string;
    count?: number;
    gains?: number;
}

// API Response types
export interface MetricDataResponse {
    metricId: number;
    metricName: string;
    // eslint-disable-next-line
    value: any;
    chartData?: ChartDataPoint[];
    chartType: string;
    lastUpdated: string;
    error?: string;
    customSettings?: {
        filters?: AnalyticsFilters;
        lastUpdated?: string;
        savedAt?: string;
        version?: string;
        // eslint-disable-next-line
        [key: string]: any;
    } | null;
}

export interface BulkMetricDataResponse {
    metrics: MetricDataResponse[];
    success: boolean;
    message?: string;
}

// Enhanced Filter types
export interface AnalyticsFilters {
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
    videoId?: number;
    productId?: number;
    userId?: number;
    screen?: string;
    signee?: string;
    subscriptionCategory?: string;
    term?: "daily" | "weekly" | "monthly" | "yearly";
    limit?: number;
}

export interface FilterOption {
    id: number;
    name: string;
}

export interface FilterOptions {
    videos?: FilterOption[];
    products?: FilterOption[];
    users?: FilterOption[];
    screens?: string[];
    signers?: string[];
    subscriptionCategories?: string[];
}

export interface AvailableFilters {
    supportsDateFilter: boolean;
    supportsVideoFilter: boolean;
    supportsProductFilter: boolean;
    supportsUserFilter: boolean;
    supportsScreenFilter: boolean;
    supportsSignerFilter: boolean;
    supportsSubscriptionCategoryFilter: boolean;
    supportsTerm: boolean; // NEW: Added term support flag
    availableTerms: string[];
    defaultTerm: string;
}

// Per-Metric Filter Request - NEW: For individual metric filtering
export interface MetricFilterRequest {
    metricId: number;
    filters: AnalyticsFilters;
}

// Bulk Metric Filter Request - NEW: For applying different filters to different metrics
export interface BulkMetricFilterRequest {
    metricFilters: MetricFilterRequest[];
}

// Grid layout types
export interface GridPosition {
    row: number;
    col: number;
}

export interface DashboardGridItem {
    id: string;
    metricId: number;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
}

// Store state
export interface DashboardState {
    currentDashboard: UserDashboard | null;
    dashboards: UserDashboard[];
    availableAnalytics: AnalyticsConfiguration[];
    metricsData: Record<number, MetricData>;
    loading: boolean;
    error: string | null;
}

// Enhanced store actions
export interface DashboardActions {
    // Dashboard management
    loadDashboards: () => Promise<void>;
    loadCurrentDashboard: (dashboardId?: number) => Promise<void>;
    loadAvailableAnalytics: () => Promise<void>;
    createDashboard: (request: CreateDashboardRequest) => Promise<UserDashboard | null>;
    updateDashboard: (dashboardId: number, name: string, description?: string) => Promise<void>;
    deleteDashboard: (dashboardId: number) => Promise<void>;
    setDefaultDashboard: (dashboardId: number) => Promise<void>;

    // Metric preferences
    updateMetricVisibility: (metricId: number, isVisible: boolean, dashboardId?: number) => Promise<void>;
    updateMetricPositions: (updates: Array<{ metricId: number; sortOrder: number; gridPosition: string }>, dashboardId?: number) => Promise<void>;
    bulkUpdateMetrics: (updates: MetricPreferenceUpdate[], dashboardId?: number) => Promise<void>;

    // Enhanced Metric data methods - All methods from implementation
    loadMetricData: (metricIds: number[], filters?: AnalyticsFilters) => Promise<void>;
    loadDashboardMetricsData: (dashboardId: number) => Promise<void>; // ADDED: Missing method
    loadEnhancedMetricsData: (requests: Array<{ metricId: number; filters?: AnalyticsFilters }>) => Promise<void>; // ADDED: Missing method
    loadSingleMetricData: (metricId: number, filters?: AnalyticsFilters) => Promise<void>;
    refreshAllMetricsData: (filters?: AnalyticsFilters) => Promise<void>;

    // NEW: Per-metric filtering
    loadFilterOptions: (type: string) => Promise<FilterOption[]>;
    applyMetricFilters: (metricId: number, filters: AnalyticsFilters) => Promise<void>;
    getMetricAvailableFilters: (metricId: number) => Promise<AvailableFilters>;
    refreshMetricWithFilters: (metricId: number, filters: AnalyticsFilters) => Promise<void>;
    saveMetricSettings: (metricId: number, settings: AnalyticsFilters, dashboardId?: number) => Promise<void>;
    loadMetricSettings: (metricId: number, dashboardId?: number) => AnalyticsFilters | null;

    // UI state
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

// Utility types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

// Analytics summary type
export interface AnalyticsSummary {
    // eslint-disable-next-line
    totalVideos: any;
    // eslint-disable-next-line
    totalViews: any;
    period: string;
    isAdmin: boolean;
    // eslint-disable-next-line
    dailyActiveUsers?: any;
    // eslint-disable-next-line
    monthlyActiveUsers?: any;
}

// Health check type
export interface HealthCheckResponse {
    status: string;
    timestamp: string;
    availableMetrics: number;
    userIsAdmin: boolean;
    message: string;
}

// Request interfaces
export interface AnalyticsDataRequest {
    metricIds: number[];
    filters?: AnalyticsFilters;
}

// NEW: Enhanced request for per-metric filtering
export interface EnhancedAnalyticsDataRequest {
    metricRequests: Array<{
        metricId: number;
        filters?: AnalyticsFilters;
    }>;
}
