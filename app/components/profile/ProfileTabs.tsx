"use client";

import { Video, TrendingUp, Package } from 'lucide-react';

export type TabType = 'videos' | 'popularVideos' | 'popularProducts';

interface ProfileTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    const tabs = [
        {
            id: 'videos' as TabType,
            label: 'Videos',
            icon: Video,
            activeColor: 'bg-blue-600',
            inactiveColor: 'bg-gray-100 hover:bg-gray-200',
        },
        {
            id: 'popularVideos' as TabType,
            label: 'Popular Videos',
            icon: TrendingUp,
            activeColor: 'bg-purple-600',
            inactiveColor: 'bg-gray-100 hover:bg-gray-200',
        },
        {
            id: 'popularProducts' as TabType,
            label: 'Popular Products',
            icon: Package,
            activeColor: 'bg-emerald-600',
            inactiveColor: 'bg-gray-100 hover:bg-gray-200',
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                isActive
                                    ? `${tab.activeColor} text-white shadow-md`
                                    : `${tab.inactiveColor} text-gray-700`
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
