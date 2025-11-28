// components/analytics/DashboardHeader.tsx
"use client";
import React, { useState } from "react";
import { Plus, Trash2, Star, StarOff, Edit, MoreVertical, RefreshCw } from "lucide-react";
import { UserDashboard } from "../../types/analytics";

interface DashboardHeaderProps {
    currentDashboard: UserDashboard | null;
    dashboards: UserDashboard[];
    onCreateDashboard: () => void;
    onEditDashboard: (dashboard: UserDashboard) => void;
    onDeleteDashboard: (dashboardId: number) => void;
    onSetDefaultDashboard: (dashboardId: number) => void;
    onSwitchDashboard: (dashboardId: number) => void;
    onAddMetrics: () => void;
    onRefreshAll: () => void;
    loading?: boolean;
}

export default function DashboardHeader({ currentDashboard, dashboards, onCreateDashboard, onEditDashboard, onDeleteDashboard, onSetDefaultDashboard, onSwitchDashboard, onAddMetrics, onRefreshAll, loading = false }: DashboardHeaderProps) {
    const [showDashboardMenu, setShowDashboardMenu] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    const handleSetDefault = async (dashboardId: number) => {
        onSetDefaultDashboard(dashboardId);
        setShowActionsMenu(false);
    };

    const handleDelete = async (dashboardId: number) => {
        if (confirm("Are you sure you want to delete this dashboard?")) {
            await onDeleteDashboard(dashboardId);
            setShowActionsMenu(false);
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left side - Dashboard selector */}
                <div className="flex items-center gap-4">
                    {/* Dashboard Dropdown */}
                    <div className="relative">
                        <button onClick={() => setShowDashboardMenu(!showDashboardMenu)} className="flex items-center gap-2 px-4 py-2 text-lg font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" disabled={loading}>
                            {currentDashboard ? (
                                <>
                                    {currentDashboard.name}
                                    {currentDashboard.isDefault && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                                </>
                            ) : (
                                "Select Dashboard"
                            )}
                            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dashboard Dropdown Menu */}
                        {showDashboardMenu && (
                            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="py-2">
                                    {dashboards.map((dashboard) => (
                                        <button
                                            key={dashboard.id}
                                            onClick={() => {
                                                onSwitchDashboard(dashboard.id);
                                                setShowDashboardMenu(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${currentDashboard?.id === dashboard.id ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
                                        >
                                            <div>
                                                <div className="font-medium">{dashboard.name}</div>
                                            </div>
                                            {dashboard.isDefault && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                                        </button>
                                    ))}

                                    <div className="border-t border-gray-200 mt-2 pt-2">
                                        <button
                                            onClick={() => {
                                                onCreateDashboard();
                                                setShowDashboardMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Create New Dashboard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dashboard description */}
                    {currentDashboard?.description && <p className="text-sm text-gray-600 max-w-md truncate">{currentDashboard.description}</p>}
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-3">
                    {/* Refresh All Button */}
                    <button onClick={onRefreshAll} disabled={loading || !currentDashboard} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>

                    {/* Add Metrics Button */}
                    <button onClick={onAddMetrics} disabled={loading || !currentDashboard} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Plus className="h-4 w-4" />
                        Add Metrics
                    </button>

                    {/* Dashboard Actions Menu */}
                    {currentDashboard && (
                        <div className="relative">
                            <button onClick={() => setShowActionsMenu(!showActionsMenu)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <MoreVertical className="h-5 w-5" />
                            </button>

                            {showActionsMenu && (
                                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                onEditDashboard(currentDashboard);
                                                setShowActionsMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Dashboard
                                        </button>

                                        {!currentDashboard.isDefault && (
                                            <button onClick={() => handleSetDefault(currentDashboard.id)} className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                <Star className="h-4 w-4" />
                                                Set as Default
                                            </button>
                                        )}

                                        {currentDashboard.isDefault && (
                                            <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                                                <StarOff className="h-4 w-4" />
                                                Default Dashboard
                                            </div>
                                        )}

                                        <div className="border-t border-gray-200 mt-2 pt-2">
                                            <button onClick={() => handleDelete(currentDashboard.id)} disabled={currentDashboard.isDefault} className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <Trash2 className="h-4 w-4" />
                                                Delete Dashboard
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Click outside handlers */}
                {(showDashboardMenu || showActionsMenu) && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                            setShowDashboardMenu(false);
                            setShowActionsMenu(false);
                        }}
                    />
                )}
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading dashboard...
                </div>
            )}
        </div>
    );
}
