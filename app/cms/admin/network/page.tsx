"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserNetworkApi } from '@/app/services/userNetworkApi';
import type { NetworkSummary } from '@/app/types/userNetwork';
import { UserCard } from '@/app/components/network/UserCard';
import { NetworkStats } from '@/app/components/network/NetworkStats';
import { SearchBar } from '@/app/components/network/SearchBar';
import { Users, UserCheck, UserX, Clock, Package } from 'lucide-react';
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner';
import { toast } from 'react-toastify';

export default function NetworkPage() {
    const router = useRouter();
    const [networkData, setNetworkData] = useState<NetworkSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);
    const searchQueryRef = useRef(searchQuery);
    const currentPageRef = useRef(currentPage);
    const isLoadingMoreRef = useRef(isLoadingMore);

    // Keep refs in sync
    useEffect(() => {
        searchQueryRef.current = searchQuery;
        currentPageRef.current = currentPage;
        isLoadingMoreRef.current = isLoadingMore;
    }, [searchQuery, currentPage, isLoadingMore]);

    const loadNetworkData = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await UserNetworkApi.getNetworkSummary();
            setNetworkData(data);
            setHasMore(data.notConnectedUsers.length >= 30);
            setCurrentPage(1);
        } catch (error) {
            console.error('Failed to load network data:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to load network data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load initial network data
    useEffect(() => {
        loadNetworkData();
    }, [loadNetworkData]);

    const loadMoreUsers = useCallback(async () => {
        if (isLoadingMoreRef.current) return;

        setIsLoadingMore(true);

        try {
            const moreUsers = await UserNetworkApi.getPaginatedUsers({
                searchValue: searchQueryRef.current,
                page: currentPageRef.current,
            });

            if (moreUsers.length > 0) {
                setNetworkData(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        notConnectedUsers: [...prev.notConnectedUsers, ...moreUsers],
                    };
                });
                setCurrentPage(prev => prev + 1);
                setHasMore(moreUsers.length >= 30);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more users:', error);
            toast.error('Failed to load more users');
        } finally {
            setIsLoadingMore(false);
        }
    }, []);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMoreRef.current && !searchQueryRef.current) {
                    loadMoreUsers();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loadMoreUsers]);

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        setCurrentPage(0);

        if (!query.trim()) {
            // Reset to initial data
            loadNetworkData();
            return;
        }

        try {
            const results = await UserNetworkApi.searchNetwork({
                searchValue: query,
                page: 0,
            });

            setNetworkData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    connectedUsers: results.connectedUsers,
                    pendingReview: results.pendingReview,
                    pendingUsers: results.pendingUsers,
                    blockedUsers: results.blockedUsers,
                    notConnectedUsers: results.notConnectedUsers,
                };
            });
            setHasMore(results.notConnectedUsers.length >= 30);
        } catch (error) {
            console.error('Search failed:', error);
            toast.error('Search failed');
        }
    }, [loadNetworkData]);

    const handleSendInvite = async (userId: number) => {
        try {
            const result = await UserNetworkApi.sendInvite({ userId });

            if (result.status) {
                // Check if the user is admin
                const isAdmin = result.role === "Admin";

                // Remove user from not connected list
                setNetworkData(prev => {
                    if (!prev) return prev;

                    const userToMove = prev.notConnectedUsers.find(u => u.id === userId);
                    if (!userToMove) return prev;

                    const updatedNotConnected = prev.notConnectedUsers.filter(u => u.id !== userId);

                    // If admin, move to connected; otherwise move to pending
                    if (isAdmin) {
                        toast.success('New Connection');
                        return {
                            ...prev,
                            notConnectedUsers: updatedNotConnected,
                            connectedUsers: [...prev.connectedUsers, userToMove],
                            availableConnectionSlots: {
                                current: prev.availableConnectionSlots.current + 1,
                                total: prev.availableConnectionSlots.total,
                            },
                        };
                    } else {
                        toast.success('Invite Sent');
                        return {
                            ...prev,
                            notConnectedUsers: updatedNotConnected,
                            pendingUsers: [...prev.pendingUsers, userToMove],
                            availableInviteSlots: {
                                current: prev.availableInviteSlots.current + 1,
                                total: prev.availableInviteSlots.total,
                            },
                        };
                    }
                });
            }
        } catch (error) {
            console.error('Failed to send invite:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to send invite');
        }
    };

    const handleAcceptInvite = async (userId: number) => {
        try {
            const result = await UserNetworkApi.acceptInvite({ userId });

            if (result.status) {
                toast.success('Invite Accepted');

                setNetworkData(prev => {
                    if (!prev) return prev;

                    const userToMove = prev.pendingReview.find(u => u.id === userId);
                    if (!userToMove) return prev;

                    return {
                        ...prev,
                        pendingReview: prev.pendingReview.filter(u => u.id !== userId),
                        connectedUsers: [...prev.connectedUsers, userToMove],
                        availableConnectionSlots: {
                            current: prev.availableConnectionSlots.current + 1,
                            total: prev.availableConnectionSlots.total,
                        },
                        availableInviteSlots: {
                            current: prev.availableInviteSlots.current - 1,
                            total: prev.availableInviteSlots.total,
                        },
                    };
                });
            }
        } catch (error) {
            console.error('Failed to accept invite:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to accept invite');
        }
    };

    const handleRefuseInvite = async (userId: number) => {
        try {
            const result = await UserNetworkApi.refuseInvite({ userId });

            if (result.status) {
                toast.success('Invite Refused');

                setNetworkData(prev => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        pendingReview: prev.pendingReview.filter(u => u.id !== userId),
                        availableInviteSlots: {
                            current: prev.availableInviteSlots.current - 1,
                            total: prev.availableInviteSlots.total,
                        },
                    };
                });
            }
        } catch (error) {
            console.error('Failed to refuse invite:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to refuse invite');
        }
    };

    const handleRemoveConnection = async (userId: number) => {
        try {
            const result = await UserNetworkApi.refuseInvite({ userId });

            if (result.status) {
                toast.success('Connection Removed');

                setNetworkData(prev => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        connectedUsers: prev.connectedUsers.filter(u => u.id !== userId),
                        availableConnectionSlots: {
                            current: prev.availableConnectionSlots.current - 1,
                            total: prev.availableConnectionSlots.total,
                        },
                    };
                });
            }
        } catch (error) {
            console.error('Failed to remove connection:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to remove connection');
        }
    };

    const handleUnblock = async (userId: number) => {
        try {
            const result = await UserNetworkApi.blockUser({ userId });

            toast.success(result.message);

            setNetworkData(prev => {
                if (!prev) return prev;

                const userToMove = prev.blockedUsers.find(u => u.id === userId);
                if (!userToMove) return prev;

                return {
                    ...prev,
                    blockedUsers: prev.blockedUsers.filter(u => u.id !== userId),
                    notConnectedUsers: [...prev.notConnectedUsers, userToMove],
                };
            });
        } catch (error) {
            console.error('Failed to unblock user:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to unblock user');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!networkData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Failed to load network data</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6 gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">Network</h1>
                        <div className="flex items-center gap-4 flex-1 max-w-2xl">
                            <div className="flex-1 max-w-md">
                                <SearchBar
                                    onSearch={handleSearch}
                                    placeholder="Search network..."
                                />
                            </div>
                            <button
                                onClick={() => router.push('/cms/admin/network/shared-products')}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                            >
                                <Package className="w-5 h-5" />
                                Shared Products
                            </button>
                        </div>
                    </div>

                    {/* Network Stats */}
                    <NetworkStats
                        connectionSlots={networkData.availableConnectionSlots}
                        inviteSlots={networkData.availableInviteSlots}
                    />
                </div>

                {/* Pending Review Invites */}
                {networkData.pendingReview.length > 0 && (
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                            <Clock className="w-6 h-6 text-yellow-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Pending Review Invites</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {networkData.pendingReview.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    state="pending-review"
                                    onAcceptInvite={handleAcceptInvite}
                                    onRefuseInvite={handleRefuseInvite}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Connections */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                        <UserCheck className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Connections</h2>
                    </div>
                    {networkData.connectedUsers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {networkData.connectedUsers.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    state="connected"
                                    onRemoveConnection={handleRemoveConnection}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <p className="text-gray-600 font-semibold">You don't have any connections.</p>
                        </div>
                    )}
                </section>

                {/* Network Profiles */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Network Profiles</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {networkData.pendingUsers.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                state="pending"
                            />
                        ))}
                        {networkData.notConnectedUsers.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                state="not-connected"
                                onSendInvite={handleSendInvite}
                            />
                        ))}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    {hasMore && !searchQuery && (
                        <div ref={observerTarget} className="flex justify-center py-8">
                            {isLoadingMore && <LoadingSpinner size="md" />}
                        </div>
                    )}
                </section>

                {/* Blocked Accounts */}
                {networkData.blockedUsers.length > 0 && (
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                            <UserX className="w-6 h-6 text-red-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Blocked Accounts</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {networkData.blockedUsers.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    state="blocked"
                                    onUnblock={handleUnblock}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
