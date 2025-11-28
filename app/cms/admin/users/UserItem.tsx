"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { AdminUser } from "@/app/services/adminUsersApi";
import { Edit, Eye, Trash2, Lock, Unlock } from "lucide-react";

interface UserItemProps {
    user: AdminUser;
    onLockToggle: (user: AdminUser) => void;
    onDelete: (user: AdminUser) => void;
}

export const UserItem: React.FC<UserItemProps> = ({ user, onLockToggle, onDelete }) => {
    const router = useRouter();

    const getUserInitials = (user: AdminUser): string => {
        if (user.displayName) {
            const names = user.displayName.split(" ");
            if (names.length >= 2) {
                return (names[0][0] + names[names.length - 1][0]).toUpperCase();
            }
            return names[0][0].toUpperCase();
        }
        return user.userName?.[0]?.toUpperCase() || "U";
    };

    const getRoleColor = (role: string) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "from-purple-500 to-purple-600";
            case "sales":
                return "from-blue-500 to-blue-600";
            case "support":
                return "from-green-500 to-green-600";
            case "customer":
            default:
                return "from-gray-500 to-gray-600";
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "bg-purple-100 text-purple-800";
            case "sales":
                return "bg-blue-100 text-blue-800";
            case "support":
                return "bg-green-100 text-green-800";
            case "customer":
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-purple-300 bg-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    {/* Avatar */}
                    <div className={`w-12 h-12 bg-gradient-to-r ${getRoleColor(user.role)} rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md`}>{getUserInitials(user)}</div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-semibold text-gray-900 text-lg truncate">{user.displayName}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>{user.role}</span>
                            {user.isLockedOut && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Locked
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm truncate">@{user.userName}</p>
                        <p className="text-gray-500 text-sm truncate">{user.email}</p>
                    </div>

                    {/* User Stats */}
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-gray-500 mb-1">Member since</div>
                        <p className="text-sm font-medium text-gray-700">{new Date(user.dateCreated).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/cms/admin/users/edit/${user.id}`);
                        }}
                        className="flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-300"
                    >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/cms/admin/users/details/${user.id}`);
                        }}
                        className="flex items-center space-x-1 hover:bg-green-50 hover:border-green-300"
                    >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Details</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onLockToggle(user);
                        }}
                        className={`flex items-center space-x-1 ${user.isLockedOut ? "text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-300" : "text-orange-600 hover:text-orange-700 hover:bg-orange-50 hover:border-orange-300"}`}
                    >
                        {user.isLockedOut ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(user);
                        }}
                        className="text-red-600 hover:text-red-700 flex items-center hover:bg-red-50 hover:border-red-300"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
