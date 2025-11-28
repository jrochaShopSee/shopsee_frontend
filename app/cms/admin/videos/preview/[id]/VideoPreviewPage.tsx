"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { videosApi } from "@/app/services/videosApi";
import { VideoDetail } from "@/app/types/Role";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { ArrowLeft, Copy, Video, Check, Clock, Calendar, Play, Fingerprint } from "lucide-react";
import { toast } from "react-toastify";
import Script from "next/script";
import { rootUrl } from "@/app/utils/host";
import { useAuth } from "@/app/hooks/useAuth";

declare function loadInternalVideo(id: string | undefined, elementId: string, hideVideoInfo: boolean, forceLoadJquery: boolean): void;
declare function loadShopseeInteractiveLayer(showId: number, selector?: string): void;

interface VideoPreviewPageProps {
    id: string;
}

export default function VideoPreviewPage({ id }: VideoPreviewPageProps) {
    const router = useRouter();
    const { isFromShopify } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [video, setVideo] = useState<VideoDetail | null>(null);
    const [shareInfo, setShareInfo] = useState<{ shareLink: string; embedCode: string } | null>(null);
    const [activeTab, setActiveTab] = useState<"shopsee" | "shopify" | "interactive">("shopsee");
    const [integrationMethod, setIntegrationMethod] = useState<"auto" | "manual">("auto");
    const [manualSelector, setManualSelector] = useState("#mainVideo");
    const [copiedItem, setCopiedItem] = useState<string | null>(null);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    const isExternalVideo = video?.sourceType?.toLowerCase() === "external";

    useEffect(() => {
        const loadVideoAndShare = async () => {
            try {
                const [videoData, shareData] = await Promise.all([
                    videosApi.getVideoById(parseInt(id)),
                    videosApi.getShareLink(parseInt(id)),
                ]);
                setVideo(videoData);
                setShareInfo(shareData);
            } catch (error: unknown) {
                const errorMessage = error && typeof error === "object" && "response" in error
                    ? (error.response as { data?: { message?: string } })?.data?.message
                    : undefined;
                toast.error(errorMessage || "Failed to load video");
                router.push("/cms/admin/videos");
            } finally {
                setIsLoading(false);
            }
        };

        loadVideoAndShare();
    }, [id, router]);

    // Load ShopSee player after video data is loaded
    useEffect(() => {
        if (video && scriptsLoaded && !videoLoaded) {
            const timer = setTimeout(() => {
                const container = document.getElementById(`shopsee_container_${video.id}`);
                if (container && typeof loadInternalVideo !== "undefined") {
                    try {
                        loadInternalVideo(video.id.toString(), `shopsee_container_${video.id}`, false, true);
                        setVideoLoaded(true);
                    } catch (error) {
                        console.error("Error loading video:", error);
                    }
                }
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [video, scriptsLoaded, videoLoaded]);

    // Load interactive layer for external videos
    useEffect(() => {
        if (isExternalVideo && video && scriptsLoaded) {
            const timer = setTimeout(() => {
                if (typeof loadShopseeInteractiveLayer !== "undefined") {
                    try {
                        loadShopseeInteractiveLayer(video.id);
                    } catch (error) {
                        console.error("Error loading interactive layer:", error);
                    }
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isExternalVideo, video, scriptsLoaded]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
        setCopiedItem(label);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    const handleBack = () => {
        router.push("/cms/admin/videos");
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getEmbedCode = () => {
        if (!video) return "";

        return `<div id="videoContainer">
    <div class="shopsee_video_card">
        <div id="shopsee_container_${video.id}" class="shopsee_player_container"></div>
    </div>
</div>
<script src="${rootUrl}/js/stv-internal.js"></script>
<script>
    Promise.all([...document.querySelectorAll(".shopsee_player_container")]
    .map(e => loadInternalVideo(e.id.split("_").at(-1), e.id))).then(values => videos.push(...values));
</script>`;
    };

    const getShopifyEmbedCode = () => {
        if (!video) return "";
        return `shopsee_container_${video.id}#${rootUrl}/js/stv-internal.js`;
    };

    const getInteractiveLayerCode = () => {
        if (!video) return "";
        const selector = integrationMethod === "manual" ? `, "${manualSelector}"` : "";

        return `<!-- Add this script to your webpage -->
<script src="${rootUrl}/js/interactiblelayer.js"></script>

<script>
    // Initialize the ShopSee interactive layer${integrationMethod === "auto" ? " with auto-detection" : " with manual selector"}${integrationMethod === "auto" ? `
    // The system will automatically find your video using fingerprint: ${video.videoFingerprint || "N/A"}` : `
    // Parameters: (videoID, "CSS selector or DOM reference to your video element")`}
    window.loadShopseeInteractiveLayer(${video.id}${selector});
</script>`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!video || !shareInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Video not found</p>
                    <button
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Videos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Load ShopSee scripts */}
            <Script
                src={`${rootUrl}/js/stv-internal.js`}
                strategy="afterInteractive"
                onLoad={() => setScriptsLoaded(true)}
            />
            {isExternalVideo && (
                <Script
                    src={`${rootUrl}/js/interactiblelayer.js`}
                    strategy="afterInteractive"
                />
            )}

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Videos
                        </button>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Video className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
                                    <p className="text-sm text-gray-600 mt-1">Video Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Video Player */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Video Player */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Play className="w-5 h-5 text-blue-600" />
                                    Video Preview
                                </h2>
                                <div className="bg-gray-900 rounded-lg overflow-hidden">
                                    {isExternalVideo && video.videoUrl ? (
                                        <video
                                            id="mainVideo"
                                            controls
                                            className="w-full"
                                            data-video-fingerprint={video.videoFingerprint}
                                        >
                                            <source src={video.videoUrl} />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <div className="shopsee_video_card">
                                            <div id={`shopsee_container_${video.id}`} className="shopsee_player_container"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Embed Code Tabs */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Embed Code</h2>

                                {/* Tabs */}
                                <div className="border-b border-gray-200 mb-4">
                                    <nav className="flex gap-4">
                                        <button
                                            onClick={() => setActiveTab("shopsee")}
                                            className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                activeTab === "shopsee"
                                                    ? "border-blue-600 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                        >
                                            ShopSee
                                        </button>
                                        {isFromShopify && (
                                            <button
                                                onClick={() => setActiveTab("shopify")}
                                                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                    activeTab === "shopify"
                                                        ? "border-blue-600 text-blue-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                }`}
                                            >
                                                Shopify
                                            </button>
                                        )}
                                        {isExternalVideo && (
                                            <button
                                                onClick={() => setActiveTab("interactive")}
                                                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                    activeTab === "interactive"
                                                        ? "border-blue-600 text-blue-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                }`}
                                            >
                                                Interactive Layer
                                            </button>
                                        )}
                                    </nav>
                                </div>

                                {/* Tab Content */}
                                {activeTab === "shopsee" && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600">
                                            Copy and paste this code into your website to embed your ShopSee video:
                                        </p>
                                        <div className="relative">
                                            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-xs font-mono">
                                                {getEmbedCode()}
                                            </pre>
                                            <button
                                                onClick={() => handleCopy(getEmbedCode(), "ShopSee embed code")}
                                                className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                                            >
                                                {copiedItem === "ShopSee embed code" ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "shopify" && isFromShopify && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2">Quick Shopify Setup:</h3>
                                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                                <li>Log in to your Shopify Store and navigate to the Customization screen.</li>
                                                <li>Go to the page where you want your shoppable video to appear.</li>
                                                <li>Create a new section, select "APP," and then choose "ShopSee"</li>
                                                <li>Copy the code below and paste it into the ShopSee app section.</li>
                                                <li>Click save.</li>
                                            </ol>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm text-blue-800 mb-2">
                                                <strong>Copy this code:</strong>
                                            </p>
                                            <div className="relative">
                                                <pre className="bg-white border border-blue-200 rounded-lg p-4 overflow-x-auto text-xs font-mono">
{getShopifyEmbedCode()}
                                                </pre>
                                                <button
                                                    onClick={() => handleCopy(getShopifyEmbedCode(), "Shopify embed code")}
                                                    className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                                                >
                                                    {copiedItem === "Shopify embed code" ? (
                                                        <>
                                                            <Check className="w-4 h-4" />
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-4 h-4" />
                                                            Copy
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            That's it! Your Shopify store now features interactive, shoppable videos that will engage your customers and drive more sales.
                                        </p>
                                    </div>
                                )}

                                {activeTab === "interactive" && isExternalVideo && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                                <Fingerprint className="w-5 h-5" />
                                                Video Identification
                                            </h4>
                                            <p className="text-sm text-blue-800">
                                                <strong>Video Fingerprint:</strong>{" "}
                                                <code className="bg-blue-100 px-2 py-1 rounded font-mono text-xs">
                                                    {video.videoFingerprint || "N/A"}
                                                </code>
                                            </p>
                                            <p className="text-xs text-blue-700 mt-2">
                                                This unique identifier allows our system to automatically recognize your video
                                                across different websites and platforms.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Choose Integration Method:</h4>
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <label
                                                    className={`flex items-start gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                                        integrationMethod === "auto"
                                                            ? "border-blue-600 bg-blue-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="integrationMethod"
                                                        value="auto"
                                                        checked={integrationMethod === "auto"}
                                                        onChange={(e) => setIntegrationMethod(e.target.value as "auto")}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-sm">Auto-Detection</div>
                                                        <div className="text-xs text-gray-600">Recommended - No configuration needed</div>
                                                    </div>
                                                </label>
                                                <label
                                                    className={`flex items-start gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                                        integrationMethod === "manual"
                                                            ? "border-blue-600 bg-blue-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="integrationMethod"
                                                        value="manual"
                                                        checked={integrationMethod === "manual"}
                                                        onChange={(e) => setIntegrationMethod(e.target.value as "manual")}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-sm">Manual Selector</div>
                                                        <div className="text-xs text-gray-600">Full control over video element</div>
                                                    </div>
                                                </label>
                                            </div>

                                            {integrationMethod === "manual" && (
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Video Element Reference
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={manualSelector}
                                                        onChange={(e) => setManualSelector(e.target.value)}
                                                        placeholder="#videoPlayer, .video-class, etc."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Enter the CSS selector or DOM reference for your video element.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-xs font-mono">
                                                {getInteractiveLayerCode()}
                                            </pre>
                                            <button
                                                onClick={() => handleCopy(getInteractiveLayerCode(), "Interactive layer code")}
                                                className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                                            >
                                                {copiedItem === "Interactive layer code" ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Video Details */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Details</h2>
                                <div className="space-y-4">
                                    {/* Status Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                video.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {video.isActive ? "Active" : "Inactive"}
                                        </span>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                video.isPrivate
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {video.isPrivate ? "Private" : "Public"}
                                        </span>
                                        {video.isFeatured && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                Featured
                                            </span>
                                        )}
                                    </div>

                                    {/* Duration */}
                                    {video.videoLengthSeconds && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium text-gray-900">{formatDuration(video.videoLengthSeconds)}</span>
                                        </div>
                                    )}

                                    {/* Created Date */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-medium text-gray-900">{formatDate(video.createdDate)}</span>
                                    </div>

                                    {/* Source Type */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Source Type</p>
                                        <p className="text-sm font-medium text-gray-900">{video.sourceType || "N/A"}</p>
                                    </div>

                                    {/* Display Name */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Display Name</p>
                                        <p className="text-sm font-medium text-gray-900">{video.displayName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Video Settings */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Can Fast Forward</span>
                                        <span
                                            className={`text-sm font-medium ${
                                                video.canFastForward ? "text-green-600" : "text-gray-500"
                                            }`}
                                        >
                                            {video.canFastForward ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Consent Required</span>
                                        <span
                                            className={`text-sm font-medium ${
                                                video.hasConsent ? "text-blue-600" : "text-gray-500"
                                            }`}
                                        >
                                            {video.hasConsent ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Display Branding</span>
                                        <span
                                            className={`text-sm font-medium ${
                                                video.displayBranding ? "text-blue-600" : "text-gray-500"
                                            }`}
                                        >
                                            {video.displayBranding ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    {video.videoFingerprint && (
                                        <div className="pt-2">
                                            <p className="text-xs text-gray-500 mb-1">Video Fingerprint</p>
                                            <p className="text-xs font-mono text-gray-700 bg-gray-50 p-2 rounded break-all">
                                                {video.videoFingerprint}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {video.description && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                                    <div
                                        className="text-sm text-gray-700 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: video.description }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
