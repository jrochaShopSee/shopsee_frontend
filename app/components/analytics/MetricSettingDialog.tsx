// components/analytics/MetricSettingsDialog.tsx - Simplified and fixed
"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/Dialog";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/Select";
import { DatePickerWithRange } from "@/app/components/ui/DatePicker";
import { MetricType, AnalyticsFilters, FilterOption, AvailableFilters } from "../../types/analytics";
import { CalendarDays, Video, Package, Monitor, CreditCard, Clock } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

interface FilterOptions {
    videos: FilterOption[];
    products: FilterOption[];
    users: FilterOption[];
    screens: string[];
    signers: string[];
    subscriptionCategories: string[];
}

interface MetricSettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    metric: MetricType | null;
    onApplyFilters: (metricId: number, filters: AnalyticsFilters) => Promise<void>;
    onLoadFilterOptions: (type: string) => Promise<FilterOption[]>;
    onGetAvailableFilters: (metricId: number) => Promise<AvailableFilters>;
    onSaveSettings: (metricId: number, settings: AnalyticsFilters) => Promise<void>;
    onLoadSettings: (metricId: number) => AnalyticsFilters | null;
}

export default function MetricSettingsDialog({ isOpen, onClose, metric, onApplyFilters, onLoadFilterOptions, onGetAvailableFilters, onSaveSettings, onLoadSettings }: MetricSettingsDialogProps) {
    const { isAdmin } = useAuth();

    const [filters, setFilters] = useState<AnalyticsFilters>({
        term: "monthly",
    });

    const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
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
    });

    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        videos: [],
        products: [],
        users: [],
        screens: [],
        signers: [],
        subscriptionCategories: [],
    });

    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    // Load available filters and current settings when metric changes
    useEffect(() => {
        if (!metric || !isOpen) return;

        const loadMetricData = async () => {
            try {
                console.log("MetricSettingsDialog: Loading data for metric", metric.id);

                // Load available filters for this metric
                const availableFiltersData = await onGetAvailableFilters(metric.id);
                console.log("MetricSettingsDialog: Available filters:", availableFiltersData);
                setAvailableFilters(availableFiltersData);

                // Load saved settings for this metric
                const savedSettings = onLoadSettings(metric.id);
                console.log("MetricSettingsDialog: Saved settings:", savedSettings);

                if (savedSettings) {
                    // Validate saved settings against available filters before applying
                    const validatedSettings = await validateAndSanitizeSettings(savedSettings, availableFiltersData);
                    console.log("MetricSettingsDialog: Validated settings:", validatedSettings);
                    setFilters(validatedSettings);
                } else {
                    // Set default filters based on metric capabilities
                    const defaultFilters: AnalyticsFilters = {
                        term: availableFiltersData.defaultTerm as "daily" | "weekly" | "monthly" | "yearly",
                    };
                    console.log("MetricSettingsDialog: Using default filters:", defaultFilters);
                    setFilters(defaultFilters);
                }
            } catch (error) {
                console.error("Failed to load metric data:", error);
            }
        };

        loadMetricData();
    }, [metric, isOpen, onGetAvailableFilters, onLoadSettings]);

    // Enhanced validation function that uses the loaded custom settings
    const validateAndSanitizeSettings = async (savedSettings: AnalyticsFilters, availableFilters: AvailableFilters): Promise<AnalyticsFilters> => {
        console.log("MetricSettingsDialog: Validating saved settings:", savedSettings);
        console.log("MetricSettingsDialog: Against available filters:", availableFilters);

        const validatedSettings: AnalyticsFilters = {};

        // Load current filter options for validation if not already loaded
        const currentFilterOptions = { ...filterOptions };

        // Load filter options for validation if needed
        if (availableFilters.supportsVideoFilter && currentFilterOptions.videos.length === 0) {
            try {
                currentFilterOptions.videos = await onLoadFilterOptions("videos");
                console.log("MetricSettingsDialog: Loaded videos for validation:", currentFilterOptions.videos.length);
            } catch (error) {
                console.warn("Failed to load videos for validation:", error);
            }
        }

        if (availableFilters.supportsProductFilter && currentFilterOptions.products.length === 0) {
            try {
                currentFilterOptions.products = await onLoadFilterOptions("products");
                console.log("MetricSettingsDialog: Loaded products for validation:", currentFilterOptions.products.length);
            } catch (error) {
                console.warn("Failed to load products for validation:", error);
            }
        }

        if (availableFilters.supportsUserFilter && isAdmin && currentFilterOptions.users.length === 0) {
            try {
                currentFilterOptions.users = await onLoadFilterOptions("users");
                console.log("MetricSettingsDialog: Loaded users for validation:", currentFilterOptions.users.length);
            } catch (error) {
                console.warn("Failed to load users for validation:", error);
            }
        }

        // Validate term
        if (savedSettings.term && availableFilters.supportsTerm) {
            if (availableFilters.availableTerms.includes(savedSettings.term)) {
                validatedSettings.term = savedSettings.term;
                console.log("MetricSettingsDialog: Valid term found:", savedSettings.term);
            } else {
                console.warn(`Invalid term '${savedSettings.term}', available: ${availableFilters.availableTerms.join(", ")}`);
                validatedSettings.term = availableFilters.defaultTerm as "daily" | "weekly" | "monthly" | "yearly";
            }
        } else if (availableFilters.supportsTerm) {
            validatedSettings.term = availableFilters.defaultTerm as "daily" | "weekly" | "monthly" | "yearly";
        }

        // Validate videoId
        if (savedSettings.videoId !== undefined && availableFilters.supportsVideoFilter) {
            if (savedSettings.videoId === null || savedSettings.videoId === 0) {
                // Allow "All Videos" selection
                validatedSettings.videoId = undefined;
                console.log("MetricSettingsDialog: Video filter cleared (All Videos)");
            } else {
                const videoExists = currentFilterOptions.videos.some((v) => v.id === savedSettings.videoId);
                if (videoExists) {
                    validatedSettings.videoId = savedSettings.videoId;
                    console.log("MetricSettingsDialog: Valid video found:", savedSettings.videoId);
                } else {
                    console.warn(`Invalid videoId '${savedSettings.videoId}', video no longer exists`);
                }
            }
        }

        // Validate productId
        if (savedSettings.productId !== undefined && availableFilters.supportsProductFilter) {
            if (savedSettings.productId === null || savedSettings.productId === 0) {
                // Allow "All Products" selection
                validatedSettings.productId = undefined;
                console.log("MetricSettingsDialog: Product filter cleared (All Products)");
            } else {
                const productExists = currentFilterOptions.products.some((p) => p.id === savedSettings.productId);
                if (productExists) {
                    validatedSettings.productId = savedSettings.productId;
                    console.log("MetricSettingsDialog: Valid product found:", savedSettings.productId);
                } else {
                    console.warn(`Invalid productId '${savedSettings.productId}', product no longer exists`);
                }
            }
        }

        // Validate userId
        if (savedSettings.userId !== undefined && availableFilters.supportsUserFilter && isAdmin) {
            if (savedSettings.userId === null || savedSettings.userId === 0) {
                // Allow "All Users" selection
                validatedSettings.userId = undefined;
                console.log("MetricSettingsDialog: User filter cleared (All Users)");
            } else {
                const userExists = currentFilterOptions.users.some((u) => u.id === savedSettings.userId);
                if (userExists) {
                    validatedSettings.userId = savedSettings.userId;
                    console.log("MetricSettingsDialog: Valid user found:", savedSettings.userId);
                } else {
                    console.warn(`Invalid userId '${savedSettings.userId}', user no longer exists`);
                }
            }
        }

        // Validate date filters
        if (savedSettings.startDate && availableFilters.supportsDateFilter) {
            if (!isNaN(Date.parse(savedSettings.startDate))) {
                validatedSettings.startDate = savedSettings.startDate;
                console.log("MetricSettingsDialog: Valid start date:", savedSettings.startDate);
            } else {
                console.warn(`Invalid startDate '${savedSettings.startDate}'`);
            }
        }

        if (savedSettings.endDate && availableFilters.supportsDateFilter) {
            if (!isNaN(Date.parse(savedSettings.endDate))) {
                validatedSettings.endDate = savedSettings.endDate;
                console.log("MetricSettingsDialog: Valid end date:", savedSettings.endDate);
            } else {
                console.warn(`Invalid endDate '${savedSettings.endDate}'`);
            }
        }

        // Validate text filters
        if (savedSettings.screen && availableFilters.supportsScreenFilter) {
            validatedSettings.screen = savedSettings.screen;
            console.log("MetricSettingsDialog: Valid screen filter:", savedSettings.screen);
        }

        if (savedSettings.signee && availableFilters.supportsSignerFilter) {
            validatedSettings.signee = savedSettings.signee;
            console.log("MetricSettingsDialog: Valid signer filter:", savedSettings.signee);
        }

        if (savedSettings.subscriptionCategory && availableFilters.supportsSubscriptionCategoryFilter) {
            const validCategories = ["basic", "premium", "enterprise"];
            if (validCategories.includes(savedSettings.subscriptionCategory)) {
                validatedSettings.subscriptionCategory = savedSettings.subscriptionCategory;
                console.log("MetricSettingsDialog: Valid subscription category:", savedSettings.subscriptionCategory);
            } else {
                console.warn(`Invalid subscriptionCategory '${savedSettings.subscriptionCategory}', valid options: ${validCategories.join(", ")}`);
            }
        }

        console.log("MetricSettingsDialog: Final validated settings:", validatedSettings);
        return validatedSettings;
    };

    // Load filter options when available filters change
    useEffect(() => {
        if (!availableFilters || !isOpen) return;

        const loadOptions = async () => {
            setIsLoadingOptions(true);
            try {
                console.log("MetricSettingsDialog: Loading filter options...");
                const promises: Promise<void>[] = [];

                if (availableFilters.supportsVideoFilter) {
                    promises.push(
                        onLoadFilterOptions("videos").then((options) => {
                            console.log("MetricSettingsDialog: Loaded video options:", options);
                            setFilterOptions((prev) => ({ ...prev, videos: options }));
                        })
                    );
                }

                if (availableFilters.supportsProductFilter) {
                    promises.push(
                        onLoadFilterOptions("products").then((options) => {
                            console.log("MetricSettingsDialog: Loaded product options:", options);
                            setFilterOptions((prev) => ({ ...prev, products: options }));
                        })
                    );
                }

                if (availableFilters.supportsUserFilter && isAdmin) {
                    promises.push(
                        onLoadFilterOptions("users").then((options) => {
                            console.log("MetricSettingsDialog: Loaded user options:", options);
                            setFilterOptions((prev) => ({ ...prev, users: options }));
                        })
                    );
                }

                await Promise.all(promises);
            } catch (error) {
                console.error("Failed to load filter options:", error);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        loadOptions();
    }, [availableFilters, isOpen, onLoadFilterOptions, isAdmin]);

    const handleFilterChange = <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => {
        console.log("MetricSettingsDialog: Filter change:", key, "=", value);
        setFilters((prev) => {
            const newFilters = {
                ...prev,
                [key]: value,
            };
            console.log("MetricSettingsDialog: New filters state:", newFilters);
            return newFilters;
        });
    };

    const handleApply = async () => {
        if (!metric) return;

        setIsApplying(true);
        try {
            console.log("MetricSettingsDialog: Applying filters:", filters);

            // Save the settings first
            await onSaveSettings(metric.id, filters);

            // Then apply the filters
            await onApplyFilters(metric.id, filters);
            onClose();
        } catch (error) {
            console.error("Failed to apply filters:", error);
        } finally {
            setIsApplying(false);
        }
    };

    const handleReset = () => {
        const resetFilters: AnalyticsFilters = {
            term: availableFilters.defaultTerm as "daily" | "weekly" | "monthly" | "yearly",
        };
        console.log("MetricSettingsDialog: Resetting filters to:", resetFilters);
        setFilters(resetFilters);
    };

    const handleClose = () => {
        onClose();
        // Reset filters when closing without applying
        setTimeout(() => {
            if (metric) {
                const savedSettings = onLoadSettings(metric.id);
                if (savedSettings) {
                    setFilters(savedSettings);
                } else {
                    setFilters({ term: availableFilters.defaultTerm as "daily" | "weekly" | "monthly" | "yearly" });
                }
            }
        }, 300);
    };

    if (!metric) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        {metric.displayName} Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure filters and display settings for this metric.
                        {metric.description && <span className="block mt-1 text-sm text-muted-foreground">{metric.description}</span>}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Term/Period Filter - Only show if supported */}
                    {availableFilters.supportsTerm && (
                        <div className="grid gap-2">
                            <Label htmlFor="term" className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Time Period
                            </Label>
                            <Select
                                value={filters.term || availableFilters.defaultTerm}
                                onValueChange={(value) => {
                                    console.log("Term selection changed to:", value);
                                    handleFilterChange("term", value as "daily" | "weekly" | "monthly" | "yearly");
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableFilters.availableTerms.map((term) => (
                                        <SelectItem key={term} value={term}>
                                            {term.charAt(0).toUpperCase() + term.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Video Filter - Only show if supported */}
                    {availableFilters.supportsVideoFilter && (
                        <div className="grid gap-2">
                            <Label htmlFor="video" className="flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                Video
                            </Label>
                            <Select
                                value={filters.videoId?.toString() || ""}
                                onValueChange={(value) => {
                                    console.log("Video selection changed to:", value);
                                    handleFilterChange("videoId", value ? parseInt(value) : undefined);
                                }}
                                disabled={isLoadingOptions}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingOptions ? "Loading..." : "Select a video"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Videos</SelectItem>
                                    {filterOptions.videos.map((video) => (
                                        <SelectItem key={video.id} value={video.id.toString()}>
                                            {video.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Product Filter - Only show if supported */}
                    {availableFilters.supportsProductFilter && (
                        <div className="grid gap-2">
                            <Label htmlFor="product" className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Product
                            </Label>
                            <Select
                                value={filters.productId?.toString() || ""}
                                onValueChange={(value) => {
                                    console.log("Product selection changed to:", value);
                                    handleFilterChange("productId", value ? parseInt(value) : undefined);
                                }}
                                disabled={isLoadingOptions}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingOptions ? "Loading..." : "Select a product"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Products</SelectItem>
                                    {filterOptions.products.map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Date Range Filter - Only show if supported */}
                    {availableFilters.supportsDateFilter && (
                        <div className="grid gap-2">
                            <Label className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Date Range
                            </Label>
                            <DatePickerWithRange
                                startDate={filters.startDate}
                                endDate={filters.endDate}
                                onDateChange={(startDate: string, endDate: string) => {
                                    handleFilterChange("startDate", startDate);
                                    handleFilterChange("endDate", endDate);
                                }}
                            />
                        </div>
                    )}

                    {/* Screen Filter - Text Input */}
                    {availableFilters.supportsScreenFilter && (
                        <div className="grid gap-2">
                            <Label htmlFor="screen" className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                Screen
                            </Label>
                            <Input
                                id="screen"
                                value={filters.screen || ""}
                                onChange={(e) => {
                                    console.log("Screen input changed to:", e.target.value);
                                    handleFilterChange("screen", e.target.value || undefined);
                                }}
                                placeholder="Enter screen name"
                            />
                        </div>
                    )}

                    {/* Subscription Category Filter - Only show if supported */}
                    {availableFilters.supportsSubscriptionCategoryFilter && (
                        <div className="grid gap-2">
                            <Label htmlFor="subscriptionCategory" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Subscription Category
                            </Label>
                            <Select
                                value={filters.subscriptionCategory || ""}
                                onValueChange={(value) => {
                                    console.log("Subscription category changed to:", value);
                                    handleFilterChange("subscriptionCategory", value || undefined);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select subscription category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Categories</SelectItem>
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleReset}>
                        Reset
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleApply} disabled={isApplying}>
                            {isApplying ? "Applying..." : "Apply Filters"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
