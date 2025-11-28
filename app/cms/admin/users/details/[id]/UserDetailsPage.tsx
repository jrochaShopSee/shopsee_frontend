"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { adminUsersApi, AdminUserDetails, AdminUserVideoLog } from "@/app/services/adminUsersApi";
import { ArrowLeft, User, Edit, Lock, Unlock, Mail, Calendar, MapPin, Building, Shield, Activity } from "lucide-react";

interface UserDetailsPageProps {
    id: string;
}

const UserDetailsPage: React.FC<UserDetailsPageProps> = ({ id }) => {
    const router = useRouter();
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [user, setUser] = useState<AdminUserDetails | null>(null);
    const [videoLogs, setVideoLogs] = useState<AdminUserVideoLog[]>([]);

    const availableCapabilities = [
        { id: 1, name: "Can Create Videos" },
        { id: 2, name: "Can Edit Videos" },
        { id: 3, name: "Can Delete Videos" },
        { id: 4, name: "Can Manage Products" },
        { id: 5, name: "Can View Analytics" },
        { id: 6, name: "Can Export Data" },
        { id: 7, name: "Can Manage Users" },
        { id: 8, name: "Can Manage Settings" },
    ];

    // Load user data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [userData, logsData] = await Promise.all([adminUsersApi.getById(parseInt(id)), adminUsersApi.getVideoLogs(parseInt(id))]);
                setUser(userData);
                setVideoLogs(logsData);
            } catch (err) {
                if (err instanceof Error) {
                    toast.error(err.message);
                } else {
                    toast.error("Failed to load user data");
                }
                router.push("/cms/admin/users");
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && isAdmin) {
            loadData();
        }
    }, [id, router, authLoading, isAdmin]);

    const handleLockToggle = async () => {
        if (!user) return;

        setActionLoading("lock");
        try {
            if (user.isLockedOut) {
                await adminUsersApi.unlock(user.id);
                toast.success("User unlocked successfully");
                setUser((prev) => (prev ? { ...prev, isLockedOut: false } : prev));
            } else {
                await adminUsersApi.lock(user.id);
                toast.success("User locked successfully");
                setUser((prev) => (prev ? { ...prev, isLockedOut: true } : prev));
            }
        } catch (error) {
            console.error("Failed to toggle user lock:", error);
            toast.error("Failed to update user status");
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendPasswordReset = async () => {
        if (!user) return;

        setActionLoading("password");
        try {
            await adminUsersApi.sendPasswordReset(user.id);
            toast.success("Password reset email sent successfully");
        } catch (error) {
            console.error("Failed to send password reset:", error);
            toast.error("Failed to send password reset email");
        } finally {
            setActionLoading(null);
        }
    };

    const getUserCapabilityNames = (): string[] => {
        if (!user) return [];
        return availableCapabilities.filter((cap) => user.capabilities.includes(cap.id)).map((cap) => cap.name);
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-500">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
                    <p className="text-gray-500 mb-6">The user you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push("/cms/admin/users")}>Back to Users</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-6">
                    <Button variant="outline" onClick={() => router.push("/cms/admin/users")} className="flex items-center space-x-2 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Users</span>
                    </Button>

                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">{user.displayName?.charAt(0)?.toUpperCase() || "U"}</div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{user.displayName}</h1>
                            <p className="text-gray-600 flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {user.email}
                            </p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === "Admin" ? "bg-purple-100 text-purple-800" : user.role === "Sales" ? "bg-blue-100 text-blue-800" : user.role === "Support" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{user.role}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" onClick={handleLockToggle} disabled={actionLoading === "lock"} className={`flex items-center space-x-2 ${user.isLockedOut ? "text-green-600 hover:text-green-700" : "text-orange-600 hover:text-orange-700"}`}>
                            {actionLoading === "lock" ? <LoadingSpinner /> : user.isLockedOut ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            <span>{user.isLockedOut ? "Unlock" : "Lock"}</span>
                        </Button>
                        <Button variant="outline" onClick={handleSendPasswordReset} disabled={actionLoading === "password"} className="flex items-center space-x-2">
                            {actionLoading === "password" ? <LoadingSpinner /> : <Mail className="w-4 h-4" />}
                            <span>Send Password Reset</span>
                        </Button>
                        <Button onClick={() => router.push(`/cms/admin/users/edit/${user.id}`)} className="flex items-center space-x-2">
                            <Edit className="w-4 h-4" />
                            <span>Edit User</span>
                        </Button>
                    </div>
                </div>

                {user.isLockedOut && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center">
                            <Lock className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-700 font-medium">This account is locked</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            Basic Information
                        </h2>
                    </div>
                    <div className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <p className="text-gray-900">@{user.userName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <p className="text-gray-900">{user.firstName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <p className="text-gray-900">{user.lastName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-900">{user.phone || "Not provided"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "Admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>{user.role}</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <p className="text-gray-900 flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(user.dateOfBirth).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <p className="text-gray-900 flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {user.countryName}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Information */}
                {user.company && user.company.name && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                    <Building className="w-4 h-4 text-white" />
                                </div>
                                Company Information
                            </h2>
                        </div>
                        <div className="px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <p className="text-gray-900">{user.company.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-gray-900">{user.company.email || "Not provided"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <p className="text-gray-900">{user.company.phone || "Not provided"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <p className="text-gray-900">{user.company.website || "Not provided"}</p>
                                </div>
                                {user.company.address && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <p className="text-gray-900">{[user.company.address, user.company.city, user.company.state, user.company.postalCode].filter(Boolean).join(", ")}</p>
                                    </div>
                                )}
                                {user.company.description && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <p className="text-gray-900">{user.company.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* User Capabilities */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-5 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            User Capabilities
                        </h2>
                    </div>
                    <div className="px-6 py-6">
                        {getUserCapabilityNames().length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {getUserCapabilityNames().map((capability, index) => (
                                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                        {capability}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No special capabilities assigned</p>
                        )}
                    </div>
                </div>

                {/* Account Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-5 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                                <Calendar className="w-4 h-4 text-white" />
                            </div>
                            Account Information
                        </h2>
                    </div>
                    <div className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                                <p className="text-gray-900">{new Date(user.dateCreated).toLocaleString()}</p>
                            </div>
                            {user.dateModified && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Modified</label>
                                    <p className="text-gray-900">{new Date(user.dateModified).toLocaleString()}</p>
                                </div>
                            )}
                            {user.subscriptionEndDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subscription End Date</label>
                                    <p className="text-gray-900">{new Date(user.subscriptionEndDate).toLocaleDateString()}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Security Question</label>
                                <p className="text-gray-900">{user.question}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Logs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-5 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            Recent Video Activity (Last 40 logs)
                        </h2>
                    </div>
                    <div className="px-6 py-6">
                        {videoLogs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 px-3">Date</th>
                                            <th className="text-left py-2 px-3">Video</th>
                                            <th className="text-left py-2 px-3">Action</th>
                                            <th className="text-left py-2 px-3">IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {videoLogs.map((log) => (
                                            <tr key={log.id} className="border-b border-gray-100">
                                                <td className="py-2 px-3 text-gray-600">{new Date(log.dateCreated).toLocaleString()}</td>
                                                <td className="py-2 px-3 text-gray-900">{log.videoTitle}</td>
                                                <td className="py-2 px-3">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{log.action}</span>
                                                </td>
                                                <td className="py-2 px-3 text-gray-600 font-mono text-xs">{log.ipAddress}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500">No video activity recorded</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPage;
