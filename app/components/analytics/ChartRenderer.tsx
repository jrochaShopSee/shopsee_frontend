// components/analytics/ChartRenderer.tsx
"use client";
import React from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart } from "recharts";
import { MetricData } from "../../types/analytics";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ChartRendererProps {
    data: MetricData;
    metricName: string;
    height?: number;
    onRefresh?: () => void;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"];

export default function ChartRenderer({ data, metricName, height = 120, onRefresh }: ChartRendererProps) {
    // eslint-disable-next-line
    const formatValue = (value: any): string => {
        if (typeof value === "number") {
            if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toLocaleString();
        }
        return String(value || "N/A");
    };

    // Handle loading state
    if (data.loading) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Handle error state
    if (data.error) {
        return (
            <div className="flex flex-col items-center justify-center text-red-500" style={{ height }}>
                <AlertCircle className="h-6 w-6 mb-2" />
                <p className="text-xs text-center px-2">{data.error}</p>
                {onRefresh && (
                    <button onClick={onRefresh} className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Retry
                    </button>
                )}
            </div>
        );
    }

    // Safely get chart type
    const chartType = (data?.chartType || "Card").toLowerCase().replace(/\s+/g, "");
    const chartData = data?.data || [];

    // If we have chart data, render with Recharts
    if (chartData && chartData.length > 0) {
        switch (chartType) {
            case "barchart":
            case "bar":
            case "columnchart":
            case "column":
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={10} />
                            <YAxis fontSize={10} />
                            <Tooltip formatter={(value) => [formatValue(value), metricName]} />
                            <Bar dataKey="value" fill="#0088FE" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case "linechart":
            case "line":
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={10} />
                            <YAxis fontSize={10} />
                            <Tooltip formatter={(value) => [formatValue(value), metricName]} />
                            <Line type="monotone" dataKey="value" stroke="#00C49F" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case "areachart":
            case "area":
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={10} />
                            <YAxis fontSize={10} />
                            <Tooltip formatter={(value) => [formatValue(value), metricName]} />
                            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case "piechart":
            case "pie":
            case "donutchart":
            case "donut":
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" outerRadius={height / 3} fill="#8884d8" dataKey="value" label={false}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [formatValue(value), metricName]} />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case "datatable":
            case "table":
            case "datatables":
                return (
                    <div style={{ height }} className="overflow-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-1">Name</th>
                                    <th className="text-right py-1">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.slice(0, 4).map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-1 truncate">{item.name}</td>
                                        <td className="text-right py-1">{formatValue(item.value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {chartData.length > 4 && <p className="text-xs text-gray-500 mt-1">+{chartData.length - 4} more items</p>}
                    </div>
                );

            case "progressbars":
            case "progress":
                const maxValue = Math.max(...chartData.map((d) => Number(d.value)));
                return (
                    <div className="space-y-2 overflow-auto" style={{ height }}>
                        {chartData.slice(0, 4).map((item, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="truncate">{item.name}</span>
                                    <span>{formatValue(item.value)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${Math.min(100, (Number(item.value) / maxValue) * 100)}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {chartData.length > 4 && <p className="text-xs text-gray-500 mt-1">+{chartData.length - 4} more items</p>}
                    </div>
                );

            case "card":
            case "cards":
                // Fall through to default card display
                break;

            default:
                // For unsupported chart types, still try to show chart if data exists
                return (
                    <div className="flex items-center justify-center" style={{ height }}>
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900 mb-1">{formatValue(data.value)}</div>
                            <p className="text-xs text-gray-400">{chartType} visualization</p>
                            <p className="text-xs text-gray-500 mt-1">Showing as card</p>
                        </div>
                    </div>
                );
        }
    }

    // Default card display for metrics without chart data or card type
    return (
        <div className="flex flex-col items-center justify-center" style={{ height }}>
            <div className="text-2xl font-bold text-gray-900 mb-2">{formatValue(data.value)}</div>
        </div>
    );
}
