"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { VideoMappingApi } from "@/app/services/videoMappingApi";
import { profileApi } from "@/app/services/profileApi";
import { SubscriptionUsageStats } from "@/app/types/Profile";
import { VideoMappingDataResponse, MappedItem, Rectangle, CONTENT_TYPES, AddMappedItemRequest } from "@/app/types/VideoMapping";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { MapContentModal } from "@/app/components/shared/MapContentModal";
import { useAuth } from "@/app/hooks/useAuth";
import { ArrowLeft, Check, X, Sparkles, Search, Map, AlertTriangle, Info } from "lucide-react";
import { toast } from "react-toastify";
import Hls from "hls.js";

interface MapVideoPageProps {
    videoId: number;
}

const MapVideoPage: React.FC<MapVideoPageProps> = ({ videoId }) => {
    const router = useRouter();
    const { isAdmin } = useAuth();

    // Data State
    const [loading, setLoading] = useState(true);
    const [mappingData, setMappingData] = useState<VideoMappingDataResponse | null>(null);
    const [mappedItems, setMappedItems] = useState<MappedItem[]>([]);
    const [usageStats, setUsageStats] = useState<SubscriptionUsageStats | null>(null);

    // Video Player State
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);

    // Canvas Drawing State
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentRectangle, setCurrentRectangle] = useState<Rectangle | null>(null);
    const [showMappingControls, setShowMappingControls] = useState(false);
    const [showMapContentModal, setShowMapContentModal] = useState(false);

    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    // Entire Video Mapping State
    const [showEntireVideoMapping, setShowEntireVideoMapping] = useState(false);
    const [selectedProductsForEntireVideo, setSelectedProductsForEntireVideo] = useState<number[]>([]);
    const [searchProductsTerm, setSearchProductsTerm] = useState("");

    // Docking Behavior State
    const [dockingBehaviorId, setDockingBehaviorId] = useState<number>(1);

    /**
     * Load video mapping data on mount
     */
    useEffect(() => {
        loadMappingData();
    }, [videoId]);

    /**
     * Load subscription usage stats for non-admin users
     */
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

    const loadMappingData = async () => {
        try {
            setLoading(true);
            const data = await VideoMappingApi.getVideoMappingData(videoId);
            setMappingData(data);
            setMappedItems(data.mappedItems);
            setDockingBehaviorId(data.videoInformation.videoDockIconsBehaviorTypeId);
        } catch (error) {
            console.error("Error loading mapping data:", error);
            toast.error("Failed to load video mapping data");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Initialize video player based on source type
     */
    useEffect(() => {
        if (!mappingData || !videoRef.current) return;

        const video = videoRef.current;
        const sourceType = mappingData.videoInformation.sourceType;
        const videoUrl = mappingData.videoInformation.videoUrl;

        // Clean up previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Handle YouTube and Vimeo separately (they use iframes, not video elements)
        if (sourceType === "youtube" || sourceType === "vimeo" || sourceType === "external") {
            // For external videos, player is ready immediately
            // The actual rendering will be handled by iframe in the JSX
            setIsPlayerReady(true);
            return;
        }

        if (sourceType === "hls") {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
                hlsRef.current = hls;

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setIsPlayerReady(true);
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                // Native HLS support (Safari)
                video.src = videoUrl;
                setIsPlayerReady(true);
            }
        } else if (sourceType === "dash") {
            // TODO: Implement DASH.js support if needed
            video.src = videoUrl;
            setIsPlayerReady(true);
        } else {
            // Standard video sources (mp4, ogg, etc.)
            video.src = videoUrl;
            setIsPlayerReady(true);
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [mappingData]);

    /**
     * Track video time updates
     */
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        const handleLoadedMetadata = () => {
            setVideoDuration(video.duration);
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [isPlayerReady]);

    /**
     * Canvas mouse event handlers for drawing rectangles
     */
    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current || !videoRef.current) return;

        // Check if user has reached product mapping limit (non-admin only)
        if (!isAdmin && usageStats) {
            const maxProducts = usageStats.productPerVideo ?? 0;
            if (mappedItems.length >= maxProducts) {
                toast.error(`Product mapping limit reached. Maximum ${maxProducts} items per video allowed.`);
                return;
            }
        }

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Get actual video player time (not state)
        const actualStartTime = videoRef.current.currentTime;

        // Pause video when starting to draw
        videoRef.current.pause();

        console.log("Drawing rectangle - Start time:", actualStartTime);

        setIsDrawing(true);
        setCurrentRectangle({
            id: `rect_${Date.now()}`,
            startX: x,
            startY: y,
            endX: x,
            endY: y,
            width: 0,
            height: 0,
            startTime: actualStartTime,
        });
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !currentRectangle || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCurrentRectangle({
            ...currentRectangle,
            endX: x,
            endY: y,
            width: Math.abs(x - currentRectangle.startX),
            height: Math.abs(y - currentRectangle.startY),
        });
    };

    const handleCanvasMouseUp = () => {
        if (!isDrawing || !currentRectangle) return;

        setIsDrawing(false);
        if (currentRectangle.width > 10 && currentRectangle.height > 10) {
            setShowMappingControls(true);
            toast.info("Start-point set. Please advance the player to the end-point before saving.");
        } else {
            setCurrentRectangle(null);
            toast.warning("Rectangle too small. Please draw a larger area.");
        }
    };

    const handleConfirmClick = () => {
        // Open the modal when user clicks Confirm button
        setShowMapContentModal(true);
    };

    const handleModalConfirm = async (contentTypeId: number, productId?: number, contentItemId?: number) => {
        if (!currentRectangle || !canvasRef.current) {
            toast.error("No rectangle drawn");
            return;
        }

        const contentTypeName = mappingData?.contentTypes.find((ct) => ct.contentTypeId === contentTypeId)?.contentTypeName;

        const canvas = canvasRef.current;
        const canvasRect = canvas.getBoundingClientRect();

        // Calculate percentages
        const startXPct = (Math.min(currentRectangle.startX, currentRectangle.endX) / canvasRect.width) * 100;
        const startYPct = (Math.min(currentRectangle.startY, currentRectangle.endY) / canvasRect.height) * 100;
        const widthPct = (currentRectangle.width / canvasRect.width) * 100;
        const heightPct = (currentRectangle.height / canvasRect.height) * 100;

        // Get current video time to restore after reload and use as end time
        const savedTime = videoRef.current?.currentTime || 0;
        const endTime = savedTime; // Use actual video player time, not state

        console.log("Time values:", {
            rectangleStartTime: currentRectangle.startTime,
            currentTimeState: currentTime,
            videoPlayerTime: savedTime,
            endTimeUsing: endTime
        });

        try {
            const request: AddMappedItemRequest = {
                episodeId: videoId,
                startTime: currentRectangle.startTime,
                endTime: endTime,
                startX: startXPct,
                startY: startYPct,
                width: widthPct,
                height: heightPct,
                zindex: 100,
                contentTypeId: contentTypeId,
            };

            // Add the appropriate ID based on content type
            if (contentTypeName === CONTENT_TYPES.PRODUCT || contentTypeName === CONTENT_TYPES.QUIZ) {
                request.productId = productId;
            } else if (contentTypeName === CONTENT_TYPES.IMAGE) {
                request.imageContentId = contentItemId;
            } else if (contentTypeName === CONTENT_TYPES.TEXT) {
                request.textContentId = contentItemId;
            } else if (contentTypeName === CONTENT_TYPES.IMAGE_AND_TEXT) {
                request.imageAndTextContentId = contentItemId;
            } else if (contentTypeName === CONTENT_TYPES.DOWNLOAD) {
                request.downloadContentId = contentItemId;
            }

            console.log("Sending mapping request:", request);
            const result = await VideoMappingApi.addMappedItem(request);
            toast.success(result.message || "Item mapped successfully");

            // Close modal and reset state
            setShowMapContentModal(false);
            setShowMappingControls(false);
            setCurrentRectangle(null);

            // Reload only the mapped items data
            const data = await VideoMappingApi.getVideoMappingData(videoId);
            setMappedItems(data.mappedItems);

            // Restore video time
            if (videoRef.current && savedTime > 0) {
                videoRef.current.currentTime = savedTime;
            }
        } catch (error) {
            console.error("Error adding mapped item:", error);
            const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as { message?: string })?.message || "Failed to add mapped item. Please check console for details.";
            toast.error(errorMessage);
        }
    };

    /**
     * Cancel current mapping
     */
    const handleCancelMapping = () => {
        setCurrentRectangle(null);
        setShowMappingControls(false);
        setShowMapContentModal(false);
    };

    /**
     * Delete mapped item - show confirmation modal
     */
    const handleDeleteClick = (itemId: number) => {
        setItemToDelete(itemId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        // Get current video time to restore after reload
        const savedTime = videoRef.current?.currentTime || 0;

        try {
            await VideoMappingApi.deleteMappedItem(itemToDelete);
            toast.success("Item deleted successfully");
            setShowDeleteModal(false);
            setItemToDelete(null);

            // Reload only the mapped items data
            const data = await VideoMappingApi.getVideoMappingData(videoId);
            setMappedItems(data.mappedItems);

            // Restore video time
            if (videoRef.current && savedTime > 0) {
                videoRef.current.currentTime = savedTime;
            }
        } catch (error) {
            console.error("Error deleting mapped item:", error);
            toast.error("Failed to delete mapped item");
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    /**
     * Update docking behavior
     */
    const handleDockingBehaviorChange = async (newBehaviorId: number) => {
        try {
            await VideoMappingApi.updateDockingBehavior(videoId, { newBehaviorId });
            setDockingBehaviorId(newBehaviorId);
            toast.success("Docking behavior updated");
        } catch (error) {
            console.error("Error updating docking behavior:", error);
            toast.error("Failed to update docking behavior");
        }
    };

    /**
     * Map products to entire video
     */
    const handleMapToEntireVideo = async () => {
        if (selectedProductsForEntireVideo.length === 0) {
            toast.warning("Please select at least one product");
            return;
        }

        try {
            const result = await VideoMappingApi.mapProductsToEntireVideo(videoId, {
                productIds: selectedProductsForEntireVideo,
                videoDuration: videoDuration,
            });
            toast.success(result.message);
            await loadMappingData();
            setSelectedProductsForEntireVideo([]);
            setShowEntireVideoMapping(false);
        } catch (error) {
            console.error("Error mapping products to entire video:", error);
            toast.error("Failed to map products");
        }
    };

    /**
     * Filter products for entire video mapping
     */
    const filteredProducts = mappingData?.products.filter((product) => product.name.toLowerCase().includes(searchProductsTerm.toLowerCase()) && product.productType !== CONTENT_TYPES.QUIZ) || [];

    /**
     * Toggle product selection for entire video mapping
     */
    const toggleProductForEntireVideo = (productId: number) => {
        setSelectedProductsForEntireVideo((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
    };

    /**
     * Render mapped items that should be visible at current time
     */
    const visibleMappedItems = mappedItems.filter((item) => currentTime >= item.formattedStartTime && currentTime <= item.formattedEndTime);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!mappingData) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">Failed to load video mapping data</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push("/cms/admin/videos")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Videos
                    </button>
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-6 border border-violet-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-600 rounded-lg">
                                <Map className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Map Video Products</h1>
                                <p className="text-sm text-gray-600 mt-1">{mappingData.videoInformation.episodeDisplayName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Stats Banner - Only for non-admin users */}
                {!isAdmin && usageStats && (
                    <div className="mb-6">
                        {mappedItems.length >= (usageStats.productPerVideo ?? 0) ? (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-600 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-900 mb-2">Product Mapping Limit Reached</h3>
                                        <p className="text-sm text-red-700 mb-2">
                                            You have reached the maximum number of items ({usageStats.productPerVideo ?? 0}) that can be mapped to this video. Please delete an existing mapped item before adding a new one, or upgrade your subscription for more capacity.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => router.push("/cms/admin/profile/subscription")}
                                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                        >
                                            View Subscription
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <Info className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Mapping Usage</h3>
                                        <p className="text-sm text-gray-700">
                                            You have mapped <span className="font-bold">{mappedItems.length}</span> out of <span className="font-bold">{usageStats.productPerVideo ?? 0}</span> items allowed for this video.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Video Player */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Warning for YouTube/Vimeo videos */}
                    {mappingData && (mappingData.videoInformation.sourceType === "youtube" || mappingData.videoInformation.sourceType === "vimeo") && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-semibold text-yellow-900 mb-1">Limited Support for {mappingData.videoInformation.sourceType === "youtube" ? "YouTube" : "Vimeo"} Videos</h3>
                                    <p className="text-sm text-yellow-800">
                                        Product mapping for {mappingData.videoInformation.sourceType === "youtube" ? "YouTube" : "Vimeo"} videos has limited functionality.
                                        For full mapping capabilities, please upload the video directly or use a direct video URL.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Video Player with Canvas Overlay */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Map your Products</h2>
                        <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
                            {/* Video Element or iframe based on source type */}
                            {mappingData && (mappingData.videoInformation.sourceType === "youtube" || mappingData.videoInformation.sourceType === "vimeo") ? (
                                <>
                                    {/* YouTube iframe */}
                                    {mappingData.videoInformation.sourceType === "youtube" && (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${mappingData.videoInformation.videoUrl}?enablejsapi=1&origin=${window.location.origin}`}
                                            className="w-full h-full"
                                            allow="autoplay; fullscreen"
                                            allowFullScreen
                                        />
                                    )}
                                    {/* Vimeo iframe */}
                                    {mappingData.videoInformation.sourceType === "vimeo" && (
                                        <iframe
                                            src={`https://player.vimeo.com/video/${mappingData.videoInformation.videoUrl}?loop=false&byline=false&portrait=false&title=false&speed=true&transparent=0&gesture=media`}
                                            className="w-full h-full"
                                            allow="autoplay; fullscreen"
                                            allowFullScreen
                                        />
                                    )}
                                    {/* Hidden video element for ref compatibility */}
                                    <video ref={videoRef} className="hidden" />
                                </>
                            ) : mappingData && mappingData.videoInformation.sourceType === "external" ? (
                                <>
                                    {/* Direct video URL (external) */}
                                    <video ref={videoRef} controls className="w-full h-full" preload="metadata" src={mappingData.videoInformation.videoUrl} />
                                </>
                            ) : (
                                /* Standard video element for HLS, DASH, and uploaded videos */
                                <video ref={videoRef} controls className="w-full h-full" preload="metadata" />
                            )}

                            {/* Canvas Overlay for Drawing - Covers 90% height to leave controls accessible */}
                            <div
                                ref={canvasRef}
                                className="absolute top-0 left-0 right-0 cursor-crosshair"
                                style={{
                                    height: "85%",
                                    pointerEvents: showMappingControls ? "none" : "auto",
                                }}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                            >
                                {/* Current Rectangle Being Drawn */}
                                {currentRectangle && (
                                    <div
                                        className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                                        style={{
                                            left: `${Math.min(currentRectangle.startX, currentRectangle.endX)}px`,
                                            top: `${Math.min(currentRectangle.startY, currentRectangle.endY)}px`,
                                            width: `${currentRectangle.width}px`,
                                            height: `${currentRectangle.height}px`,
                                        }}
                                    />
                                )}

                                {/* Visible Mapped Items */}
                                {visibleMappedItems.map((item) => (
                                    <div
                                        key={item.itemId}
                                        className="absolute border-2 hover:bg-white hover:bg-opacity-20 transition-all group"
                                        style={{
                                            borderColor: `#${item.borderColor}`,
                                            top: `${item.top}%`,
                                            left: `${item.left}%`,
                                            width: `${item.width}%`,
                                            height: `${item.height}%`,
                                            zIndex: item.zIndex,
                                        }}
                                    >
                                        {/* Product/Content Name */}
                                        <div className="absolute inset-0 flex items-center justify-center p-1 pointer-events-none">
                                            <span className="text-white text-xs font-semibold drop-shadow-lg text-center line-clamp-2 break-words" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.6)' }}>
                                                {item.productName || item.contentType}
                                            </span>
                                        </div>

                                        {/* Delete Button */}
                                        <div className="absolute top-0 right-0 hidden group-hover:flex gap-1 p-1 bg-white rounded-bl">
                                            <button onClick={() => handleDeleteClick(item.itemId)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Mapping Controls - Confirm and Cancel buttons */}
                            {showMappingControls && currentRectangle && (
                                <div className="absolute top-2 right-2 flex gap-2 z-50">
                                    <button onClick={handleConfirmClick} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2" title="Confirm Mapping">
                                        <Check className="h-4 w-4" />
                                        Confirm
                                    </button>
                                    <button onClick={handleCancelMapping} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2" title="Cancel">
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tools Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tools</h2>

                        <p className="text-sm text-gray-600 mb-4">Draw a rectangle on the video (upper 85% area) to map products or content to specific time segments.</p>

                        {/* Docking Behavior */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select the behavior of your docking icons</label>
                            <select value={dockingBehaviorId} onChange={(e) => handleDockingBehaviorChange(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {mappingData.videoDockingTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <hr className="my-4" />

                        {/* Map to Entire Video */}
                        <div>
                            <div className="flex items-center mb-3">
                                <input type="checkbox" id="mapEntireVideo" checked={showEntireVideoMapping} onChange={(e) => setShowEntireVideoMapping(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label htmlFor="mapEntireVideo" className="ml-2 text-sm font-medium text-gray-700">
                                    Map to entire video and screen
                                </label>
                            </div>

                            {showEntireVideoMapping && (
                                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                    <p className="text-sm text-gray-600">Select the products you want to map to the entire video and to the entire screen:</p>

                                    {/* Search Products */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="text" placeholder="Search products..." value={searchProductsTerm} onChange={(e) => setSearchProductsTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>

                                    {/* Product Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                                        {filteredProducts.map((product) => (
                                            <div key={product.id} onClick={() => toggleProductForEntireVideo(product.id)} className={`relative cursor-pointer border-2 rounded-lg p-2 transition-all ${selectedProductsForEntireVideo.includes(product.id) ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                                                {selectedProductsForEntireVideo.includes(product.id) && (
                                                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                )}
                                                <img src={product.productImage || "/placeholder.png"} alt={product.name} className="w-full h-20 object-cover rounded mb-2" />
                                                <p className="text-xs font-medium text-gray-900 line-clamp-2">{product.name}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={handleMapToEntireVideo} disabled={selectedProductsForEntireVideo.length === 0} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        Map {selectedProductsForEntireVideo.length} Product{selectedProductsForEntireVideo.length !== 1 ? "s" : ""}
                                    </button>
                                </div>
                            )}
                        </div>

                        <hr className="my-4" />

                        {/* AI Product Detection Placeholder */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">ShopSee AI Product Detection</h3>
                            <button onClick={() => toast.info("AI Product Detection coming soon")} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                                Detect <Sparkles className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Mapped Items List */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Mapped Items ({mappedItems.length})</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {mappedItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No mapped items yet. Start drawing on the video to add product mappings.</p>
                        ) : (
                            mappedItems.map((item) => (
                                <div key={item.itemId} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.productName || item.contentType}</p>
                                            <p className="text-xs text-gray-500">Type: {item.contentType}</p>
                                        </div>
                                        <button onClick={() => handleDeleteClick(item.itemId)} className="text-red-600 hover:text-red-700" title="Delete">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        {item.formattedStartTime.toFixed(2)}s - {item.formattedEndTime.toFixed(2)}s
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

                {/* Map Content Modal */}
                <MapContentModal
                    isOpen={showMapContentModal}
                    onClose={handleCancelMapping}
                    onConfirm={handleModalConfirm}
                    mappingData={mappingData}
                />

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Mapped Item</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this mapped item? This action cannot be undone.</p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapVideoPage;
