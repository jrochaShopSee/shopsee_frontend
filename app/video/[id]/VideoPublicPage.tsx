"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosClient from "@/app/utils/axiosClient";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { AlertTriangle } from "lucide-react";

declare global {
    interface Window {
        loadInternalVideo?: (id: string | undefined, elementId: string, hideVideoInfo: boolean, forceLoadJquery: boolean) => void;
    }
}

interface VideoPublicData {
    episodeId: number;
    videoName: string;
    products: Array<{
        productImage?: string;
    }>;
    hasAccess: boolean;
    errorMessage?: string;
}

interface VideoPublicPageProps {
    id: string;
}

export default function VideoPublicPage({ id }: VideoPublicPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [video, setVideo] = useState<VideoPublicData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [videoLoaded, setVideoLoaded] = useState(false);

    useEffect(() => {
        const loadVideo = async () => {
            try {
                const cit = searchParams?.get("cit") || "";
                const response = await axiosClient.get<VideoPublicData>(`/api/videos/public/${id}`, {
                    params: { cit },
                });

                if (!response.data.hasAccess) {
                    setError(response.data.errorMessage || "You don't have access to this video");
                    setIsLoading(false);
                    return;
                }

                setVideo(response.data);
            } catch (err: unknown) {
                const errorMessage = err && typeof err === "object" && "response" in err ? (err.response as { data?: { message?: string } })?.data?.message : undefined;
                setError(errorMessage || "Failed to load video");
            } finally {
                setIsLoading(false);
            }
        };

        loadVideo();
    }, [id, searchParams]);

    // Load ShopSee player after video data is loaded
    useEffect(() => {
        if (video && !videoLoaded && video.hasAccess) {
            // Check if script is already loaded
            const checkAndLoadVideo = () => {
                const container = document.getElementById(`shopsee_container_${video.episodeId}`);
                if (container && typeof window.loadInternalVideo !== "undefined") {
                    try {
                        window.loadInternalVideo(video.episodeId.toString(), `shopsee_container_${video.episodeId}`, false, true);
                        setVideoLoaded(true);
                    } catch (error) {
                        console.error("Error loading video:", error);
                    }
                } else {
                    // Script not ready yet, try again
                    setTimeout(checkAndLoadVideo, 200);
                }
            };

            const timer = setTimeout(checkAndLoadVideo, 300);
            return () => clearTimeout(timer);
        }
    }, [video, videoLoaded]);

    // Update Open Graph image meta tag if available
    useEffect(() => {
        if (video && video.products && video.products.length > 0) {
            const firstProduct = video.products[0];
            if (firstProduct.productImage && isValidUrl(firstProduct.productImage)) {
                const metaTag = document.querySelector('meta[property="og:image"]');
                if (metaTag) {
                    metaTag.setAttribute("content", firstProduct.productImage);
                }
            }
        }
    }, [video]);

    const isValidUrl = (url: string): boolean => {
        const pattern = /^(https?:\/\/)?([da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return pattern.test(url);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !video || !video.hasAccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">{error || "You don't have permission to view this video"}</p>
                    <button onClick={() => router.push("/")} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Video Player Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Video Title - Mobile */}
                    {video.videoName && (
                        <div className="md:hidden px-6 pt-6 pb-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">{video.videoName}</h2>
                        </div>
                    )}

                    {/* Video Container */}
                    <div id="videoContainer" className="shopSeeVideoContainer bg-black mb-8">
                        <div className="shopsee_video_card">
                            <div id={`shopsee_container_${video.episodeId}`} className="shopsee_player_container"></div>
                        </div>
                    </div>

                    {/* Video Info Section */}
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Interactive Shopping Experience
                            </span>
                        </div>
                    </div>
                </div>

                {/* Powered by ShopSee */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Powered by{" "}
                        <button onClick={() => router.push("/")} className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                            ShopSee
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
