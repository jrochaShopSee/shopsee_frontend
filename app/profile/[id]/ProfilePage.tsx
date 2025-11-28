"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { rootUrl } from '@/app/utils/host';
import { UserProfileApi } from '@/app/services/userProfileApi';
import { UserNetworkApi } from '@/app/services/userNetworkApi';
import axiosClient from '@/app/utils/axiosClient';
import type { UserProfile } from '@/app/types/userProfile';
import type { ProfileProduct } from '@/app/types/userProfile';
import { ProfileHeader } from '@/app/components/profile/ProfileHeader';
import { ProfileTabs, type TabType } from '@/app/components/profile/ProfileTabs';
import { ProfileVideoCard } from '@/app/components/profile/ProfileVideoCard';
import { ProfileProductCard } from '@/app/components/profile/ProfileProductCard';
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner';

interface ProfilePageProps {
    id: string;
}

interface VideoData {
    episodeId: string;
}

export default function ProfilePage({ id }: ProfilePageProps) {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('videos');
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [products, setProducts] = useState<ProfileProduct[]>([]);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const observerTarget = useRef<HTMLDivElement>(null);
    const isLoadingMoreRef = useRef(isLoadingMore);

    useEffect(() => {
        isLoadingMoreRef.current = isLoadingMore;
    }, [isLoadingMore]);

    const userId = parseInt(id);

    const loadProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await UserProfileApi.getUserProfile(userId);
            setProfile(data);
        } catch (error) {
            console.error('Failed to load profile:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const loadVideos = useCallback(async (skipCount: number = 0) => {
        if (isLoadingMoreRef.current) return;

        try {
            setIsLoadingMore(true);
            const endpoint = activeTab === 'popularVideos'
                ? `/api/user-profile/${userId}/popular-videos?resultCount=20&skip=${skipCount}`
                : `/api/user-profile/${userId}/videos?resultCount=20&skip=${skipCount}`;

            const response = await axiosClient.get(endpoint);
            const newVideos = response.data.videos || [];

            if (newVideos.length > 0) {
                setVideos(prev => skipCount === 0 ? newVideos : [...prev, ...newVideos]);
                setSkip(skipCount + newVideos.length);
                setHasMore(newVideos.length >= 20);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load videos:', error);
            toast.error('Failed to load videos');
        } finally {
            setIsLoadingMore(false);
        }
    }, [userId, activeTab]);

    const loadProducts = useCallback(async (skipCount: number = 0) => {
        if (isLoadingMoreRef.current) return;

        try {
            setIsLoadingMore(true);
            const response = await axiosClient.get(
                `/api/user-profile/${userId}/popular-products?resultCount=20&skip=${skipCount}`
            );
            const newProducts = response.data.products || [];

            if (newProducts.length > 0) {
                setProducts(prev => skipCount === 0 ? newProducts : [...prev, ...newProducts]);
                setSkip(skipCount + newProducts.length);
                setHasMore(newProducts.length >= 20);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoadingMore(false);
        }
    }, [userId]);

    useEffect(() => {
        setVideos([]);
        setProducts([]);
        setSkip(0);
        setHasMore(true);

        if (activeTab === 'popularProducts') {
            loadProducts(0);
        } else {
            loadVideos(0);
        }
    }, [activeTab, loadVideos, loadProducts]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMoreRef.current) {
                    if (activeTab === 'popularProducts') {
                        loadProducts(skip);
                    } else {
                        loadVideos(skip);
                    }
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
    }, [hasMore, skip, activeTab, loadVideos, loadProducts]);

    const handleBack = () => {
        router.back();
    };

    const handleSendInvite = async () => {
        if (!profile) return;

        try {
            const result = await UserNetworkApi.sendInvite({ userId: profile.id });
            if (result.status) {
                toast.success('Invite sent successfully');
                await loadProfile();
            }
        } catch (error) {
            console.error('Failed to send invite:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to send invite');
        }
    };

    const handleAcceptInvite = async () => {
        if (!profile) return;

        try {
            const result = await UserNetworkApi.acceptInvite({ userId: profile.id });
            if (result.status) {
                toast.success('Invite accepted');
                await loadProfile();
            }
        } catch (error) {
            console.error('Failed to accept invite:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to accept invite');
        }
    };

    const handleRefuseInvite = async () => {
        if (!profile) return;

        try {
            const result = await UserNetworkApi.refuseInvite({ userId: profile.id });
            if (result.status) {
                toast.success('Invite refused');
                await loadProfile();
            }
        } catch (error) {
            console.error('Failed to refuse invite:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to refuse invite');
        }
    };

    const handleRemoveConnection = async () => {
        if (!profile) return;

        try {
            const result = await UserNetworkApi.refuseInvite({ userId: profile.id });
            if (result.status) {
                toast.success('Connection removed');
                await loadProfile();
            }
        } catch (error) {
            console.error('Failed to remove connection:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to remove connection');
        }
    };

    const handleUnblock = async () => {
        if (!profile) return;

        try {
            const result = await UserNetworkApi.blockUser({ userId: profile.id });
            toast.success(result.message);
            await loadProfile();
        } catch (error) {
            console.error('Failed to unblock user:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to unblock user');
        }
    };

    const handleFollow = async () => {
        if (!profile) return;

        try {
            await UserProfileApi.followUser({ userId: profile.id });
            toast.success(`You are now following ${profile.displayName}`);
            await loadProfile();
        } catch (error) {
            console.error('Failed to follow user:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to follow user');
        }
    };

    const handleUnfollow = async () => {
        if (!profile) return;

        try {
            await UserProfileApi.unfollowUser({ userId: profile.id });
            toast.success(`You unfollowed ${profile.displayName}`);
            await loadProfile();
        } catch (error) {
            console.error('Failed to unfollow user:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to unfollow user');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleProductClick = (product: any) => {
        // Product modal functionality - to be implemented later
        console.log('Product clicked:', product);
    };

    const handleFavoriteToggle = async (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        try {
            if (product.isFavorited) {
                await axiosClient.patch(`/api/products/${productId}/unmarkFavorite`);
                setProducts(prev =>
                    prev.map(p =>
                        p.id === productId ? { ...p, isFavorited: false } : p
                    )
                );
            } else {
                await axiosClient.patch(`/api/products/${productId}/markFavorite`);
                setProducts(prev =>
                    prev.map(p =>
                        p.id === productId ? { ...p, isFavorited: true } : p
                    )
                );
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            toast.error('Failed to update favorite status');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Profile not found</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Script
                src={`${rootUrl}/js/stv-internal.js`}
                strategy="afterInteractive"
                onLoad={() => setScriptsLoaded(true)}
            />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Profile Header */}
                        <div className="lg:col-span-1">
                            <ProfileHeader
                                profile={profile}
                                onSendInvite={handleSendInvite}
                                onAcceptInvite={handleAcceptInvite}
                                onRefuseInvite={handleRefuseInvite}
                                onRemoveConnection={handleRemoveConnection}
                                onUnblock={handleUnblock}
                                onFollow={handleFollow}
                                onUnfollow={handleUnfollow}
                            />
                        </div>

                        {/* Right Column - Content */}
                        <div className="lg:col-span-2">
                            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

                            {/* Content Grid */}
                            {activeTab === 'popularProducts' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <ProfileProductCard
                                            key={product.id}
                                            product={product}
                                            onClick={() => handleProductClick(product)}
                                            onFavoriteToggle={handleFavoriteToggle}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {videos.map((video) => (
                                        <ProfileVideoCard
                                            key={video.episodeId}
                                            videoId={video.episodeId}
                                            scriptsLoaded={scriptsLoaded}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Infinite Scroll Trigger */}
                            {hasMore && (
                                <div ref={observerTarget} className="flex justify-center py-8">
                                    {isLoadingMore && <LoadingSpinner size="md" />}
                                </div>
                            )}

                            {/* No Content Message */}
                            {!isLoadingMore && (videos.length === 0 && activeTab !== 'popularProducts' || products.length === 0 && activeTab === 'popularProducts') && (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No content available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
