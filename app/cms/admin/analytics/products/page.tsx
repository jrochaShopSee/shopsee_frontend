"use client";

import { useEffect, useState } from "react";
import { AnalyticsApi, ProductAnalyticsSummary, ProductAnalyticsChartData, GrossSalesResponse } from "@/app/services/analyticsApi";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from "recharts";
import { Package, DollarSign, ShoppingCart, TrendingUp, ShoppingBasket, X, MapPin } from "lucide-react";
import dynamicImport from "next/dynamic";

// Dynamic import for HeatMap to avoid SSR issues with Leaflet
const CustomerHeatMap = dynamicImport(() => import('@/app/components/analytics/CustomerHeatMap').then(mod => ({ default: mod.CustomerHeatMap })), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>
});

export default function ProductAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ProductAnalyticsSummary | null>(null);

    // Chart data
    const [topSellingProducts, setTopSellingProducts] = useState<ProductAnalyticsChartData[]>([]);
    const [ordersByStatus, setOrdersByStatus] = useState<ProductAnalyticsChartData[]>([]);
    const [grossSales, setGrossSales] = useState<GrossSalesResponse | null>(null);
    const [totalOrders, setTotalOrders] = useState<ProductAnalyticsChartData[]>([]);
    const [productViews, setProductViews] = useState<ProductAnalyticsChartData[]>([]);
    const [salesFrequency, setSalesFrequency] = useState<ProductAnalyticsChartData[]>([]);
    const [hourlySales, setHourlySales] = useState<ProductAnalyticsChartData[]>([]);
    const [customerLocations, setCustomerLocations] = useState<Array<{ latitude: number; longitude: number }>>([]);

    // Filters - multiselect arrays
    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [term, setTerm] = useState<string>("monthly");
    const [dateTerm, setDateTerm] = useState<string>("allTime");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | undefined>(undefined);
    const [selectedAgeRanges, setSelectedAgeRanges] = useState<Array<{ minAge: number; maxAge: number }>>([]);

    // Dropdown open states
    const [videoDropdownOpen, setVideoDropdownOpen] = useState(false);
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [summary, topSelling, orderStatus] = await Promise.all([
                AnalyticsApi.getProductAnalyticsSummary(),
                AnalyticsApi.getTopSellingProducts(),
                AnalyticsApi.getOrdersByStatus()
            ]);

            setData(summary);
            setTopSellingProducts(topSelling);
            setOrdersByStatus(orderStatus);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load product analytics:", error);
            setLoading(false);
        }
    };

    const handleDateTermChange = (value: string) => {
        setDateTerm(value);
        if (value === "allTime") {
            setStartDate("");
            setEndDate(new Date().toISOString().split("T")[0]);
        } else if (value !== "custom") {
            const now = new Date();
            const start = new Date();

            switch (value) {
                case "lastWeek":
                    start.setDate(now.getDate() - 7);
                    break;
                case "lastMonth":
                    start.setMonth(now.getMonth() - 1);
                    break;
                case "lastQuarter":
                    start.setMonth(now.getMonth() - 3);
                    break;
                case "lastYear":
                    start.setFullYear(now.getFullYear() - 1);
                    break;
            }

            setStartDate(start.toISOString().split("T")[0]);
            setEndDate(new Date().toISOString().split("T")[0]);
        }
    };

    const loadFilteredData = async () => {
        try {
            // Determine episodeId and productName for API call
            const episodeId = selectedVideos.length === 1 && selectedVideos[0] !== "all"
                ? parseInt(selectedVideos[0])
                : undefined;
            const productName = selectedProducts.length === 1 && selectedProducts[0] !== "all"
                ? selectedProducts[0]
                : undefined;

            const request: {
                term: string;
                episodeId?: number;
                startDate?: string;
                endDate?: string;
                productName?: string;
            } = {
                term,
                episodeId,
                productName
            };

            // Only add dates if not "allTime"
            if (dateTerm !== "allTime") {
                request.startDate = startDate;
                request.endDate = endDate;
            }

            const hourlyRequest = {
                episodeId,
                productName,
                startDate: dateTerm !== "allTime" ? startDate : undefined,
                endDate,
                dayOfWeek: selectedDayOfWeek
            };

            const locationsRequest = {
                episodeId,
                productName,
                startDate: dateTerm !== "allTime" ? startDate : undefined,
                endDate,
                ageRanges: selectedAgeRanges.length > 0 ? selectedAgeRanges : undefined
            };

            const [sales, orders, views, frequency, hourly, locations] = await Promise.all([
                AnalyticsApi.getGrossSales(request),
                AnalyticsApi.getTotalOrders(request),
                AnalyticsApi.getProductViews(request),
                AnalyticsApi.getSalesFrequency(request),
                AnalyticsApi.getHourlySales(hourlyRequest),
                AnalyticsApi.getCustomerLocations(locationsRequest)
            ]);

            if (sales && sales.chartData) {
                const validatedData = {
                    ...sales,
                    chartData: sales.chartData.map((item: { label?: string; Label?: string; value?: number; Value?: number }) => ({
                        label: String(item.label || item.Label || ''),
                        value: Number(item.value || item.Value || 0)
                    }))
                };
                setGrossSales(validatedData);
            } else {
                setGrossSales(sales);
            }

            setTotalOrders(orders);
            setProductViews(views);
            setSalesFrequency(frequency);
            setHourlySales(hourly);
            setCustomerLocations(locations);
        } catch (error) {
            console.error("Failed to load filtered data:", error);
        }
    };

    useEffect(() => {
        if (!loading) {
            loadFilteredData();
        }
    }, [selectedVideos, selectedProducts, term, dateTerm, startDate, endDate, selectedDayOfWeek, selectedAgeRanges, loading]);

    const handleVideoSelection = (videoId: string) => {
        if (videoId === "all") {
            setSelectedVideos([]);
        } else {
            setSelectedVideos(prev => {
                const filtered = prev.filter(v => v !== "all");
                if (filtered.includes(videoId)) {
                    const newSelection = filtered.filter(v => v !== videoId);
                    return newSelection.length === 0 ? [] : newSelection;
                } else {
                    return [...filtered, videoId];
                }
            });
        }
    };

    const handleProductSelection = (productName: string) => {
        if (productName === "all") {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(prev => {
                const filtered = prev.filter(p => p !== "all");
                if (filtered.includes(productName)) {
                    const newSelection = filtered.filter(p => p !== productName);
                    return newSelection.length === 0 ? [] : newSelection;
                } else {
                    return [...filtered, productName];
                }
            });
        }
    };

    const removeVideo = (videoId: string) => {
        setSelectedVideos(prev => prev.filter(v => v !== videoId));
    };

    const removeProduct = (productName: string) => {
        setSelectedProducts(prev => prev.filter(p => p !== productName));
    };

    const toggleAgeRange = (minAge: number, maxAge: number) => {
        setSelectedAgeRanges(prev => {
            const exists = prev.some(range => range.minAge === minAge && range.maxAge === maxAge);
            if (exists) {
                return prev.filter(range => !(range.minAge === minAge && range.maxAge === maxAge));
            } else {
                return [...prev, { minAge, maxAge }];
            }
        });
    };

    const isAgeRangeSelected = (minAge: number, maxAge: number) => {
        return selectedAgeRanges.some(range => range.minAge === minAge && range.maxAge === maxAge);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("en-US").format(num);
    };

    const COLORS = ["#d7191c", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#00441b"];
    const STATUS_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#6366f1", "#14b8a6"];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6">
                <div className="text-center text-red-600">Failed to load product analytics data</div>
            </div>
        );
    }

    // Transform data for charts - data is already an array from backend
    const viewedNotPurchasedData = (data.viewedProductsNotPurchased || [])
        .map(item => ({ label: item.label, value: item.count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    const cartNotPurchasedData = (data.cartProductsNotPurchased || [])
        .map(item => ({ label: item.label, value: item.count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    const isVideoSelected = (videoId: string) => selectedVideos.includes(videoId);
    const isProductSelected = (productName: string) => selectedProducts.includes(productName);
    const allVideosSelected = selectedVideos.length === 0;
    const allProductsSelected = selectedProducts.length === 0;

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Product Analytics</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Total Products */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">Total Products</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-blue-600">{formatNumber(data.totalProducts)}</p>
                    </div>
                </div>

                {/* Average Order Value */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-600 rounded-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">Avg Order Value</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-emerald-600">{data.salesInfo.averageOrderValue}</p>
                    </div>
                </div>

                {/* Total Value */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">Total Value</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-purple-600">{data.salesInfo.totalValue}</p>
                    </div>
                </div>

                {/* Average Selling Price */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-600 rounded-lg">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">Avg Selling Price</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-orange-600">{data.salesInfo.totalValueAverage}</p>
                    </div>
                </div>

                {/* Products Sold */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-600 rounded-lg">
                                <ShoppingBasket className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">Products Sold</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-4xl font-bold text-rose-600">{formatNumber(data.salesInfo.totalItemsQuantity)}</p>
                    </div>
                </div>
            </div>

            {/* Top Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Selling Products */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Top Selling Products</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topSellingProducts}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <ChartTooltip />
                            <Bar dataKey="value">
                                {topSellingProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Order Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={ordersByStatus.filter(d => d.value > 0)}
                                dataKey="value"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {ordersByStatus.filter(d => d.value > 0).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                ))}
                            </Pie>
                            <ChartTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Viewed vs Abandoned - Side by Side on Large Screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Viewed but Not Purchased */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Top 10 Products Viewed But Not Purchased</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={viewedNotPurchasedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <ChartTooltip />
                            <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Abandoned in Cart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Top 10 Products Abandoned in Cart</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cartNotPurchasedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <ChartTooltip />
                            <Bar dataKey="value" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Filters Section - Beautiful with Multiselect */}
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Filter Data</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Video Multiselect */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Videos</label>
                        <div className="relative">
                            <button
                                onClick={() => setVideoDropdownOpen(!videoDropdownOpen)}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between hover:border-blue-400 transition-colors"
                            >
                                <span className="text-gray-700">
                                    {allVideosSelected ? "All Videos" : `${selectedVideos.length} selected`}
                                </span>
                                <svg className={`w-5 h-5 transition-transform ${videoDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {videoDropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                    <div
                                        onClick={() => handleVideoSelection("all")}
                                        className={`px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 ${allVideosSelected ? 'bg-blue-100 font-semibold' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={allVideosSelected}
                                            onChange={() => {}}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span>All Videos</span>
                                    </div>
                                    {data.episodeList.map(video => (
                                        <div
                                            key={video.id}
                                            onClick={() => handleVideoSelection(video.id)}
                                            className={`px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 ${isVideoSelected(video.id) ? 'bg-blue-50' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isVideoSelected(video.id)}
                                                onChange={() => {}}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span>{video.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Videos Tags */}
                        {selectedVideos.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedVideos.map(videoId => {
                                    const video = data.episodeList.find(v => v.id === videoId);
                                    return video ? (
                                        <div key={videoId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                                            <span>{video.name}</span>
                                            <button onClick={() => removeVideo(videoId)} className="hover:text-blue-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>

                    {/* Product Multiselect */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Products</label>
                        <div className="relative">
                            <button
                                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between hover:border-blue-400 transition-colors"
                            >
                                <span className="text-gray-700">
                                    {allProductsSelected ? "All Products" : `${selectedProducts.length} selected`}
                                </span>
                                <svg className={`w-5 h-5 transition-transform ${productDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {productDropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                    <div
                                        onClick={() => handleProductSelection("all")}
                                        className={`px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 ${allProductsSelected ? 'bg-blue-100 font-semibold' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={allProductsSelected}
                                            onChange={() => {}}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span>All Products</span>
                                    </div>
                                    {data.productList.map(product => (
                                        <div
                                            key={product.value}
                                            onClick={() => handleProductSelection(product.text)}
                                            className={`px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 ${isProductSelected(product.text) ? 'bg-blue-50' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isProductSelected(product.text)}
                                                onChange={() => {}}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span>{product.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Products Tags */}
                        {selectedProducts.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedProducts.map(productName => (
                                    <div key={productName} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                                        <span>{productName}</span>
                                        <button onClick={() => removeProduct(productName)} className="hover:text-emerald-600">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Date and Term Filters - Beautiful Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Time Period</label>
                        <select
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                        <select
                            value={dateTerm}
                            onChange={(e) => handleDateTermChange(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors"
                        >
                            <option value="allTime">All Time</option>
                            <option value="lastWeek">Last Week</option>
                            <option value="lastMonth">Last Month</option>
                            <option value="lastQuarter">Last Quarter</option>
                            <option value="lastYear">Last Year</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                </div>

                {/* Custom Date Range - Show only when custom is selected */}
                {dateTerm === "custom" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Gross Sales Chart */}
            {grossSales && grossSales.chartData && grossSales.chartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Gross Sales</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={grossSales.chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <ChartTooltip
                                    formatter={(value: number | string) => {
                                        if (typeof value === 'number') return [value.toFixed(2), 'Sales'];
                                        return [value, 'Sales'];
                                    }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Statistics</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-600">Average Item Price</dt>
                                <dd className="text-lg font-semibold text-gray-800">{grossSales.stats.avgProductCost}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-600">Average Value Order</dt>
                                <dd className="text-lg font-semibold text-gray-800">{grossSales.stats.avgValueOrder}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-600">Lowest Price Sold</dt>
                                <dd className="text-lg font-semibold text-gray-800">{grossSales.stats.minProductCost}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-600">Highest Price Sold</dt>
                                <dd className="text-lg font-semibold text-gray-800">{grossSales.stats.maxProductCost}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-600">Total Orders</dt>
                                <dd className="text-lg font-semibold text-gray-800">{formatNumber(grossSales.ordersCount)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-600">Viewed Not Purchased</dt>
                                <dd className="text-lg font-semibold text-gray-800">{formatNumber(viewedNotPurchasedData.reduce((sum, item) => sum + item.value, 0))}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-600">Abandoned in Cart</dt>
                                <dd className="text-lg font-semibold text-gray-800">{formatNumber(cartNotPurchasedData.reduce((sum, item) => sum + item.value, 0))}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}

            {/* Total Orders and Product Views - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Total Orders Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Total Orders</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={totalOrders}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <ChartTooltip />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Product Views Trend Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Product Views Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={productViews}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <ChartTooltip />
                            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Popular Days and Hourly Sales - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Days of the Week */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Popular Days of the Week Your Products Were Sold</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={salesFrequency}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <ChartTooltip
                                formatter={(value: number) => [value, 'Sold']}
                            />
                            <Bar dataKey="value" fill="#10b981" name="Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Hourly Sales Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Hourly Sales Distribution</h2>
                        <div className="w-48">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Day</label>
                            <select
                                value={selectedDayOfWeek ?? ""}
                                onChange={(e) => setSelectedDayOfWeek(e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors text-sm"
                            >
                                <option value="">All Days</option>
                                <option value="0">Sunday</option>
                                <option value="1">Monday</option>
                                <option value="2">Tuesday</option>
                                <option value="3">Wednesday</option>
                                <option value="4">Thursday</option>
                                <option value="5">Friday</option>
                                <option value="6">Saturday</option>
                            </select>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={hourlySales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <ChartTooltip
                                formatter={(value: number) => [value, 'Sales']}
                            />
                            <Bar dataKey="value" fill="#f59e0b" name="Sales" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Customer Heat Map Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Customer Locations Heat Map</h2>
                </div>

                {/* Age Range Filters */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Age Range</label>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { min: 18, max: 24, label: "18-24" },
                            { min: 25, max: 34, label: "25-34" },
                            { min: 35, max: 44, label: "35-44" },
                            { min: 45, max: 54, label: "45-54" },
                            { min: 55, max: 64, label: "55-64" },
                            { min: 65, max: 120, label: "65+" }
                        ].map(ageRange => (
                            <button
                                key={ageRange.label}
                                onClick={() => toggleAgeRange(ageRange.min, ageRange.max)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    isAgeRangeSelected(ageRange.min, ageRange.max)
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {ageRange.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Heat Map */}
                <div className="rounded-lg overflow-hidden border border-gray-200">
                    <CustomerHeatMap locations={customerLocations} height="600px" />
                </div>
            </div>
        </div>
    );
}
