"use client";

import { NetworkUser, UserCardState } from '@/app/types/userNetwork';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

interface UserCardProps {
    user: NetworkUser;
    state: UserCardState;
    onSendInvite?: (userId: number) => Promise<void>;
    onAcceptInvite?: (userId: number) => Promise<void>;
    onRefuseInvite?: (userId: number) => Promise<void>;
    onRemoveConnection?: (userId: number) => Promise<void>;
    onUnblock?: (userId: number) => Promise<void>;
}

export function UserCard({
    user,
    state,
    onSendInvite,
    onAcceptInvite,
    onRefuseInvite,
    onRemoveConnection,
    onUnblock,
}: UserCardProps) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCardClick = () => {
        router.push(`/profile/${user.id}`);
    };

    const handleAction = async (action: () => Promise<void>, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsProcessing(true);
        try {
            await action();
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const isValidUrl = (url: string | null): boolean => {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const renderButtons = () => {
        switch (state) {
            case 'pending-review':
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => onAcceptInvite && handleAction(() => onAcceptInvite(user.id), e)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Accept
                        </button>
                        <button
                            onClick={(e) => onRefuseInvite && handleAction(() => onRefuseInvite(user.id), e)}
                            disabled={isProcessing}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Refuse
                        </button>
                    </div>
                );
            case 'connected':
                return (
                    <button
                        onClick={(e) => onRemoveConnection && handleAction(() => onRemoveConnection(user.id), e)}
                        disabled={isProcessing}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Remove
                    </button>
                );
            case 'pending':
                return (
                    <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                        Pending
                    </div>
                );
            case 'not-connected':
                return (
                    <button
                        onClick={(e) => onSendInvite && handleAction(() => onSendInvite(user.id), e)}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send Invite
                    </button>
                );
            case 'blocked':
                return (
                    <button
                        onClick={(e) => onUnblock && handleAction(() => onUnblock(user.id), e)}
                        disabled={isProcessing}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Unblock
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-between h-80 hover:shadow-lg transition-shadow cursor-pointer"
        >
            <div className="flex flex-col items-center">
                {isValidUrl(user.profilePicture) ? (
                    <div className="w-36 h-36 mb-3">
                        <img
                            src={user.profilePicture ?? undefined}
                            alt={`Profile picture for ${user.displayName}`}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-36 h-36 rounded-full mb-3 border border-gray-200 shadow-sm flex items-center justify-center bg-gray-100">
                        <User className="w-20 h-20 text-gray-400" />
                    </div>
                )}
                <h5 className="text-lg font-semibold text-gray-800 mb-1">{user.displayName}</h5>
                <span className="text-sm text-gray-500">{user.userRole}</span>
            </div>
            <div className="mt-4">
                {renderButtons()}
            </div>
        </div>
    );
}
