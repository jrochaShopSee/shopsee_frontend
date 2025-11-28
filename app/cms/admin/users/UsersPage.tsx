"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { toast } from "react-toastify";
import { adminUsersApi, AdminUser } from "@/app/services/adminUsersApi";
import { Users, Plus, Search } from "lucide-react";
import { UserItem } from "./UserItem";
import _ from "lodash";

const UsersPage: React.FC = () => {
    const router = useRouter();
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const usersRef = useRef<AdminUser[]>([]);
    const hasMoreRef = useRef(true);

    // Update refs when state changes
    useEffect(() => {
        usersRef.current = users;
    }, [users]);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    const loadUsers = useCallback(
        async (reset = false) => {
            if (!hasMoreRef.current && !reset) return;

            try {
                const skip = reset ? 0 : usersRef.current.length;

                const response = await adminUsersApi.getUsers(searchTerm, skip, 50);
                console.log("Fetched users:", response);

                if (reset) {
                    setUsers(response.data);
                } else {
                    setUsers((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
            } catch (error) {
                console.error("Failed to load users:", error);
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        },
        [searchTerm]
    );

    // Debounced search function
    const debouncedLoadUsers = useMemo(
        () =>
            _.debounce(() => {
                setLoading(true);
                setUsers([]);
                setHasMore(true);
                loadUsers(true);
            }, 500),
        [loadUsers]
    );

    // Initial load
    useEffect(() => {
        if (!authLoading && isAdmin) {
            setLoading(true);
            loadUsers(true);
        }
    }, [authLoading, isAdmin, loadUsers]);

    // Handle search changes with debouncing
    useEffect(() => {
        if (searchTerm === "") {
            // If search is cleared, immediately reload
            setLoading(true);
            setUsers([]);
            setHasMore(true);
            loadUsers(true);
        } else {
            // If there's a search term, use debounced load
            debouncedLoadUsers();
        }

        // Cleanup function to cancel debounced calls
        return () => {
            debouncedLoadUsers.cancel();
        };
    }, [searchTerm, debouncedLoadUsers, loadUsers]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadUsers(false);
        }
    };

    const handleLockToggle = async (user: AdminUser) => {
        try {
            if (user.isLockedOut) {
                await adminUsersApi.unlock(user.id);
                toast.success("User unlocked successfully");
            } else {
                await adminUsersApi.lock(user.id);
                toast.success("User locked successfully");
            }

            // Update local state
            setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isLockedOut: !u.isLockedOut } : u)));
        } catch (error) {
            console.error("Failed to toggle user lock:", error);
            toast.error("Failed to update user status");
        }
    };

    const handleDeleteUser = async (user: AdminUser) => {
        const confirmed = window.confirm(`Are you sure you want to delete user "${user.displayName}"?`);
        if (!confirmed) return;

        try {
            await adminUsersApi.delete(user.id);
            toast.success("User deleted successfully");

            // Remove from local state
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error("Failed to delete user");
        }
    };

    const renderUserItem = useCallback((index: number, user: AdminUser) => <UserItem key={user.id} user={user} onLockToggle={handleLockToggle} onDelete={handleDeleteUser} />, [handleLockToggle, handleDeleteUser]);

    if (authLoading) {
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
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-500">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Users className="w-8 h-8 mr-3 text-purple-500" />
                            CMS Users
                        </h1>
                        <p className="text-gray-600 mt-2">Manage system users and their permissions</p>
                    </div>
                    <Button onClick={() => router.push("/cms/admin/users/add")} className="flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add New User</span>
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-4">
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input type="text" placeholder="Search by username, name, or email..." value={searchTerm} onChange={handleSearchChange} className="pl-10 w-full" />
                    </div>
                    {searchTerm && (
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="text-gray-500 hover:text-gray-700">
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Users List with Infinite Scroll */}
            <InfiniteScrollList
                data={users}
                itemContent={renderUserItem}
                endReached={handleLoadMore}
                hasMore={hasMore}
                loading={loading}
                emptyIcon={<Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
                emptyTitle="No users found"
                emptyMessage={searchTerm ? "No users match your search criteria." : "No users have been created yet."}
                height="calc(100vh - 280px)"
                footerLoading={
                    <div className="flex items-center justify-center py-4">
                        <LoadingSpinner />
                        <span className="ml-2 text-gray-600">Loading more users...</span>
                    </div>
                }
            />
        </div>
    );
};

export default UsersPage;
