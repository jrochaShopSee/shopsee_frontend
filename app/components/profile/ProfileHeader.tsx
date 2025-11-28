"use client";

import { User, Users, Eye, Heart, Calendar, UserPlus, UserCheck, UserX, Check, X, Ban, Clock } from 'lucide-react';
import type { UserProfile } from '@/app/types/userProfile';

interface ProfileHeaderProps {
    profile: UserProfile;
    onSendInvite?: () => void;
    onAcceptInvite?: () => void;
    onRefuseInvite?: () => void;
    onRemoveConnection?: () => void;
    onUnblock?: () => void;
    onFollow?: () => void;
    onUnfollow?: () => void;
}

export function ProfileHeader({
    profile,
    onSendInvite,
    onAcceptInvite,
    onRefuseInvite,
    onRemoveConnection,
    onUnblock,
    onFollow,
    onUnfollow,
}: ProfileHeaderProps) {
    const isValidUrl = (url: string | null): boolean => {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const renderConnectionButton = () => {
        if (!profile.isAuthenticated) return null;
        if (profile.isOwnProfile) return null;
        if (profile.currentUserRole !== "Admin" && profile.currentUserRole !== "Company") return null;

        switch (profile.status) {
            case "Any Connection":
                return (
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 text-center">Connect with {profile.displayName}</p>
                        <button
                            onClick={onSendInvite}
                            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <UserPlus className="w-4 h-4" />
                            Send Invite
                        </button>
                    </div>
                );
            case "Connected":
                return (
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 text-center">You are connected with {profile.displayName}</p>
                        <button
                            onClick={onRemoveConnection}
                            className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <UserX className="w-4 h-4" />
                            Remove Connection
                        </button>
                    </div>
                );
            case "Pending":
                return (
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 text-center">Your invite is pending review by {profile.displayName}</p>
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-medium">
                            <Clock className="w-4 h-4" />
                            Pending
                        </div>
                    </div>
                );
            case "Review":
                return (
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 text-center">{profile.displayName} wants to connect</p>
                        <p className="text-sm text-gray-600 text-center">Do you want to accept?</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={onAcceptInvite}
                                className="bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <Check className="w-4 h-4" />
                                Accept
                            </button>
                            <button
                                onClick={onRefuseInvite}
                                className="bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <X className="w-4 h-4" />
                                Refuse
                            </button>
                        </div>
                    </div>
                );
            case "Blocked":
                return (
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 text-center">{profile.displayName} has been blocked by you</p>
                        <button
                            onClick={onUnblock}
                            className="w-full bg-gray-600 text-white py-2.5 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Ban className="w-4 h-4" />
                            Unblock
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderFollowButton = () => {
        if (profile.isOwnProfile) return null;

        if (profile.isFollowed) {
            return (
                <div className="space-y-2">
                    <p className="text-sm text-gray-600 text-center">You are following {profile.displayName}</p>
                    <button
                        onClick={onUnfollow}
                        className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <UserX className="w-4 h-4" />
                        Unfollow
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">Follow {profile.displayName}</p>
                <button
                    onClick={onFollow}
                    className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    <UserCheck className="w-4 h-4" />
                    Follow
                </button>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Cover Image */}
            <div
                className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"
                style={{
                    backgroundImage: isValidUrl(profile.backgroundImage)
                        ? `url(${profile.backgroundImage})`
                        : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            <div className="p-6">
                {/* Profile Picture and Name */}
                <div className="flex flex-col items-center -mt-20 mb-6">
                    {isValidUrl(profile.avatarImage) ? (
                        <img
                            src={profile.avatarImage ?? undefined}
                            alt={profile.displayName}
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                            <User className="w-16 h-16 text-gray-400" />
                        </div>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 mt-4">{profile.displayName}</h1>
                    <p className="text-gray-600 text-sm mt-1">{profile.role}</p>
                </div>

                {/* Followers Count */}
                <div className="flex items-center justify-center gap-2 mb-6 pb-6 border-b border-gray-200">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">{profile.followers}</span>
                    <span className="text-gray-600">Followers</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    {renderConnectionButton()}
                    {renderFollowButton()}
                </div>

                {/* Statistics */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium">Joined</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{profile.joinedIn}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Eye className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium">Video Views</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{profile.views}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Heart className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium">Likes</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{profile.likes}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
