"use client";

import { NetworkCapacity } from '@/app/types/userNetwork';
import { Users, UserPlus } from 'lucide-react';

interface NetworkStatsProps {
    connectionSlots: NetworkCapacity;
    inviteSlots: NetworkCapacity;
}

export function NetworkStats({ connectionSlots, inviteSlots }: NetworkStatsProps) {
    const getProgressPercentage = (current: number, total: number): number => {
        if (total === 0) return 0;
        return Math.min((current / total) * 100, 100);
    };

    const getProgressColor = (current: number, total: number): string => {
        const percentage = (current / total) * 100;
        if (percentage >= 90) return 'bg-red-600';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-emerald-600';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Connection Slots */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Connection Slots</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">
                            {connectionSlots.current} <span className="text-gray-400">/</span> {connectionSlots.total}
                        </span>
                        <span className="text-sm text-gray-500">
                            {getProgressPercentage(connectionSlots.current, connectionSlots.total).toFixed(0)}% used
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${getProgressColor(
                                connectionSlots.current,
                                connectionSlots.total
                            )}`}
                            style={{
                                width: `${getProgressPercentage(connectionSlots.current, connectionSlots.total)}%`,
                            }}
                        />
                    </div>
                    <p className="text-sm text-gray-600">
                        {connectionSlots.total - connectionSlots.current} slots available
                    </p>
                </div>
            </div>

            {/* Invite Slots */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-violet-600 rounded-lg">
                        <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Invite Slots</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">
                            {inviteSlots.current} <span className="text-gray-400">/</span> {inviteSlots.total}
                        </span>
                        <span className="text-sm text-gray-500">
                            {getProgressPercentage(inviteSlots.current, inviteSlots.total).toFixed(0)}% used
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${getProgressColor(
                                inviteSlots.current,
                                inviteSlots.total
                            )}`}
                            style={{
                                width: `${getProgressPercentage(inviteSlots.current, inviteSlots.total)}%`,
                            }}
                        />
                    </div>
                    <p className="text-sm text-gray-600">
                        {inviteSlots.total - inviteSlots.current} invites available
                    </p>
                </div>
            </div>
        </div>
    );
}
