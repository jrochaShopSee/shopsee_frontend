"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { videosApi } from "@/app/services/videosApi";
import { profileApi } from "@/app/services/profileApi";
import { Video } from "@/app/types/Role";
import { SubscriptionUsageStats } from "@/app/types/Profile";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useAuth } from "@/app/hooks/useAuth";
import { Video as VideoIcon, Plus, Search, Edit2, Trash2, Share2, Eye, Map, AlertTriangle, Info } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "@/app/utils/axiosClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/Dialog";

const VideosPage: React.FC = () => {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [totalCount, setTotalCount] = useState(0);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareVideoId, setShareVideoId] = useState<number | null>(null);
    const [shareHours, setShareHours] = useState<string>("");
    const [shareLink, setShareLink] = useState<string>("");
    const [shareLinkMessage, setShareLinkMessage] = useState<string>("");
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<{ id: number; title: string } | null>(null);
    const [usageStats, setUsageStats] = useState<SubscriptionUsageStats | null>(null);

    const loadVideos = useCallback(
        async (reset = false) => {
            if (loading && !reset) return;

            setLoading(true);
            try {
                const skip = reset ? 0 : videos.length;
                const response = await videosApi.getVideos({
                    skip,
                    take: 50,
                    search: debouncedSearchTerm,
                });

                if (reset) {
                    setVideos(response.data);
                } else {
                    setVideos((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
            } catch (error) {
                toast.error("Failed to load videos");
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [videos.length, debouncedSearchTerm]
    );

    useEffect(() => {
        loadVideos(true);
    }, [debouncedSearchTerm]);

    // Load subscription usage stats for non-admin users
    useEffect(() => {
        const loadUsageStats = async () => {
            if (!isAdmin) {
                try {
                    const subscriptionData = await profileApi.getSubscription();
                    setUsageStats(subscriptionData.usageStats);
                } catch (error) {
                    console.error("Failed to load subscription usage stats:", error);
                }
            }
        };
        loadUsageStats();
    }, [isAdmin]);

    // Poll for videos that are being processed
    useEffect(() => {
        const processingVideos = videos.filter((v) => v.videoStatus === "Processing" || v.videoStatus === "Queued");

        if (processingVideos.length === 0) return;

        const pollInterval = setInterval(async () => {
            for (const video of processingVideos) {
                try {
                    const status = await videosApi.getVideoStatus(video.id);
                    if (status.videoStatus !== video.videoStatus) {
                        // Update video status in local state
                        setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, videoStatus: status.videoStatus } : v)));

                        // Show toast when video becomes ready
                        if (status.videoStatus === "Ready") {
                            toast.success(`Video "${video.title}" is now ready!`);
                        } else if (status.videoStatus === "Failed") {
                            toast.error(`Video "${video.title}" processing failed`);
                        }
                    }
                } catch (error) {
                    console.error(`Error polling status for video ${video.id}:`, error);
                }
            }
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(pollInterval);
    }, [videos]);

    const handleToggleStatus = async (id: number) => {
        setTogglingId(id);
        try {
            const result = await videosApi.toggleVideoStatus(id);
            toast.success(result.message);

            // Update local state
            setVideos((prev) => prev.map((video) => (video.id === id ? { ...video, isActive: result.isActive } : video)));
        } catch (error) {
            toast.error("Failed to toggle video status");
            console.error(error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteClick = (id: number, title: string) => {
        setVideoToDelete({ id, title });
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!videoToDelete) return;

        setDeletingId(videoToDelete.id);
        setDeleteDialogOpen(false);

        try {
            const result = await videosApi.deleteVideo(videoToDelete.id);
            toast.success(result.message);

            // Remove from local state
            setVideos((prev) => prev.filter((video) => video.id !== videoToDelete.id));
            setTotalCount((prev) => prev - 1);

            // Reload usage stats for non-admin users
            if (!isAdmin) {
                try {
                    const subscriptionData = await profileApi.getSubscription();
                    setUsageStats(subscriptionData.usageStats);
                } catch (error) {
                    console.error("Failed to reload subscription usage stats:", error);
                }
            }
        } catch (error) {
            toast.error("Failed to delete video");
            console.error(error);
        } finally {
            setDeletingId(null);
            setVideoToDelete(null);
        }
    };

    const handleShare = (id: number) => {
        setShareVideoId(id);
        setShareHours("");
        setShareLink("");
        setShareLinkMessage("");
        setShareModalOpen(true);
    };

    const handleGenerateShareLink = async () => {
        if (!shareVideoId) return;

        setIsGeneratingLink(true);
        try {
            const hours = shareHours ? parseInt(shareHours) : undefined;
            const params = new URLSearchParams();
            params.append("videoId", shareVideoId.toString());
            if (hours) {
                params.append("hours", hours.toString());
            }

            const response = await axiosClient.get<{ status: string; message: string; sharedLink: string }>(`/api/videos/generatelink?${params.toString()}`);

            if (response.data.status === "success") {
                setShareLink(response.data.sharedLink);
                setShareLinkMessage(response.data.message);
            } else {
                toast.error(response.data.message || "Failed to generate share link");
            }
        } catch (error: unknown) {
            const errorMessage = error && typeof error === "object" && "response" in error ? (error.response as { data?: { message?: string } })?.data?.message : undefined;
            toast.error(errorMessage || "Failed to generate share link");
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const handleCopyShareLink = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            toast.success("Share link copied to clipboard");
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/cms/admin/videos/edit/${id}`);
    };

    const handlePreview = (id: number) => {
        router.push(`/cms/admin/videos/preview/${id}`);
    };

    const handleMapVideo = (id: number) => {
        router.push(`/cms/admin/videos/map/${id}`);
    };

    const handleAddNew = () => {
        router.push("/cms/admin/videos/add");
    };

    const renderVideoItem = (index: number, video: Video) => {
        const isToggling = togglingId === video.id;
        const isDeleting = deletingId === video.id;

        // Get status badge properties
        const getStatusBadge = (status?: string) => {
            switch (status) {
                case "Queued":
                    return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Queued" };
                case "Processing":
                    return { bg: "bg-amber-100", text: "text-amber-700", label: "Processing" };
                case "Ready":
                    return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Ready" };
                case "Failed":
                    return { bg: "bg-red-100", text: "text-red-700", label: "Failed" };
                case "Canceled":
                    return { bg: "bg-gray-100", text: "text-gray-700", label: "Canceled" };
                default:
                    return { bg: "bg-gray-100", text: "text-gray-700", label: "Unknown" };
            }
        };

        const statusBadge = getStatusBadge(video.videoStatus);

        return (
            <div key={video.id} className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-center gap-4">
                        <div className={`p-2 ${video.isActive ? "bg-blue-100" : "bg-gray-100"} rounded-lg`}>
                            <VideoIcon className={`h-5 w-5 ${video.isActive ? "text-blue-600" : "text-gray-400"}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-base font-semibold text-gray-900">{video.title}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${video.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{video.isActive ? "Active" : "Inactive"}</span>
                                {video.isPrivate && <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">Private</span>}
                                <span className={`px-2 py-1 text-xs font-medium rounded ${statusBadge.bg} ${statusBadge.text}`}>{statusBadge.label}</span>
                            </div>
                            <p className="text-sm text-gray-600">Company: {video.companyName}</p>
                            {!!video.videoLengthSeconds && video.videoLengthSeconds > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Duration: {Math.floor(video.videoLengthSeconds / 60)}:{String(Math.floor(video.videoLengthSeconds % 60)).padStart(2, "0")}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                        {/* Only show toggle for Ready videos */}
                        {video.videoStatus === "Ready" && (
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" checked={video.isActive} onChange={() => handleToggleStatus(video.id)} disabled={isToggling || isDeleting} className="sr-only" />
                                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${video.isActive ? "bg-green-600" : "bg-gray-300"} ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${video.isActive ? "translate-x-6" : "translate-x-1"}`} />
                                </div>
                            </label>
                        )}
                        {/* Only show action buttons for Ready videos */}
                        {video.videoStatus === "Ready" && (
                            <>
                                <button onClick={() => handleEdit(video.id)} disabled={isDeleting} className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50">
                                    <Edit2 className="h-4 w-4" />
                                    Edit
                                </button>
                                <button onClick={() => handleMapVideo(video.id)} disabled={isDeleting} className="px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2 disabled:opacity-50">
                                    <Map className="h-4 w-4" />
                                    Map Video
                                </button>
                                <button onClick={() => handlePreview(video.id)} disabled={isDeleting} className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 disabled:opacity-50">
                                    <Eye className="h-4 w-4" />
                                    Preview
                                </button>
                                <button onClick={() => handleShare(video.id)} disabled={isDeleting} className="px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 disabled:opacity-50">
                                    <Share2 className="h-4 w-4" />
                                    Share
                                </button>
                            </>
                        )}
                        {/* Always show delete button */}
                        <button onClick={() => handleDeleteClick(video.id, video.title)} disabled={isDeleting} className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50">
                            {isDeleting ? <LoadingSpinner /> : <Trash2 className="h-4 w-4" />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && videos.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Videos Management</h1>
                    <p className="text-gray-600">Manage your video content and settings</p>
                </div>
                <button onClick={handleAddNew} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
                    <Plus className="h-5 w-5" />
                    Add New Video
                </button>
            </div>

            {/* Usage Stats Banner - Only for non-admin users */}
            {!isAdmin && usageStats && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Info className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Subscription Usage</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-3 border border-blue-100">
                                    <p className="text-xs text-gray-600 mb-1">Videos This Month</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {usageStats.remainingMonthVideos ?? 0} / {usageStats.maxMonthVideos ?? 0}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Remaining this month</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-blue-100">
                                    <p className="text-xs text-gray-600 mb-1">Videos This Year</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {usageStats.remainingYearVideos ?? 0} / {usageStats.maxYearVideos ?? 0}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Remaining this year</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-blue-100">
                                    <p className="text-xs text-gray-600 mb-1">Products Per Video</p>
                                    <p className="text-lg font-bold text-gray-900">{usageStats.productPerVideo ?? 0}</p>
                                    <p className="text-xs text-gray-500 mt-1">Maximum items per video</p>
                                </div>
                            </div>
                            {(usageStats.remainingMonthVideos ?? 0) <= 0 && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        Monthly video limit reached. Delete existing videos from this month or wait until next month to add more.
                                    </p>
                                </div>
                            )}
                            {(usageStats.remainingMonthVideos ?? 0) > 0 && (usageStats.remainingYearVideos ?? 0) <= 0 && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        Yearly video limit reached. Please upgrade your subscription to add more videos.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" placeholder="Search videos by title, company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div className="text-sm text-gray-600">Total: {totalCount} videos</div>
                </div>
            </div>

            {/* Videos List */}
            <InfiniteScrollList data={videos} loading={loading} hasMore={hasMore} endReached={() => loadVideos(false)} itemContent={renderVideoItem} emptyIcon={<VideoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />} emptyTitle="No Videos Found" emptyMessage="Get started by adding your first video" height={600} footerLoading={<LoadingSpinner />} />

            {/* Share Modal */}
            {shareModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Video</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Hours (Optional)</label>
                                <div className="flex gap-2">
                                    <input type="number" value={shareHours} onChange={(e) => setShareHours(e.target.value)} placeholder="Leave empty for permanent link" min="1" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <button onClick={handleGenerateShareLink} disabled={isGeneratingLink} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                        {isGeneratingLink ? (
                                            <>
                                                <LoadingSpinner />
                                                Generating...
                                            </>
                                        ) : (
                                            "Get My Link"
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Specify the number of hours this link should remain valid. Leave empty for a permanent link.</p>
                            </div>

                            {shareLinkMessage && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">{shareLinkMessage}</p>
                                </div>
                            )}

                            {shareLink && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={shareLink} readOnly className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                                        <button onClick={handleCopyShareLink} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShareModalOpen(false)} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Video
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-gray-700">
                            Are you sure you want to delete <span className="font-semibold">"{videoToDelete?.title}"</span>?
                        </p>
                        <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                    </div>

                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Delete Video
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VideosPage;
