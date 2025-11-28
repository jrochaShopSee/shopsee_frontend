import React, { useState, useRef } from "react";
import { Upload, Link2, Video as VideoIcon, CheckCircle, Loader2, Info } from "lucide-react";
import { toast } from "react-toastify";
import { UseFormRegister, FieldValues } from "react-hook-form";
import { VideoUploadService, UploadProgress } from "@/app/services/videoUploadService";

interface VideoUploadSectionProps {
    onVideoUpload: (data: {
        videoGuid?: string;
        videoUrl?: string;
        videoFingerprint?: string;
        duration?: number;
    }) => void;
    isExternal: boolean;
    onToggleExternal: (isExternal: boolean) => void;
    maxVideoLength?: number; // in minutes
    userRole?: string;
    register: UseFormRegister<FieldValues>;
    onUploadingStateChange?: (isUploading: boolean) => void;
}

export const VideoUploadSection: React.FC<VideoUploadSectionProps> = ({
    onVideoUpload,
    isExternal,
    onToggleExternal,
    maxVideoLength = 60,
    userRole = "User",
    register,
    onUploadingStateChange,
}) => {
    const [externalUrl, setExternalUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fingerprint, setFingerprint] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [videoDuration, setVideoDuration] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadServiceRef = useRef<VideoUploadService | null>(null);

    // Generate video identifier from URL
    const generateVideoIdentifier = (videoUrl: string): string | null => {
        try {
            const url = new URL(videoUrl);

            // YouTube detection
            if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
                const videoId = url.searchParams.get("v") || url.pathname.split("/").pop();
                return `YOUTUBE_${videoId}`;
            }

            // Vimeo detection
            if (url.hostname.includes("vimeo.com")) {
                const videoId = url.pathname.split("/").pop();
                return `VIMEO_${videoId}`;
            }

            // Direct video URLs
            const cleanUrl = `${url.protocol}//${url.hostname}${url.pathname}`;
            const urlHash = btoa(cleanUrl).replace(/[+/=]/g, "").substring(0, 16);
            return `DIRECT_${urlHash}`;
        } catch (error) {
            console.error("Error generating video identifier:", error);
            return null;
        }
    };

    // Process external video URL
    const processVideoUrl = (videoUrl: string) => {
        if (!videoUrl) return;

        setIsAnalyzing(true);
        try {
            const videoIdentifier = generateVideoIdentifier(videoUrl);

            if (videoIdentifier) {
                setFingerprint(videoIdentifier);
                onVideoUpload({
                    videoUrl: videoUrl,
                    videoFingerprint: videoIdentifier,
                });
                toast.success("Video URL processed successfully");
            } else {
                throw new Error("Could not generate identifier");
            }
        } catch (error) {
            console.error("Video processing failed:", error);
            // Fallback: use timestamp + random
            const fallbackId = `FALLBACK_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
            setFingerprint(fallbackId);
            onVideoUpload({
                videoUrl: videoUrl,
                videoFingerprint: fallbackId,
            });
            toast.warning("Video URL processed with fallback identifier");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Handle external URL blur
    const handleUrlBlur = () => {
        if (externalUrl) {
            processVideoUrl(externalUrl);
        }
    };

    // Get video duration from file
    const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.onerror = () => {
                reject(new Error("Failed to load video metadata"));
            };
            video.src = URL.createObjectURL(file);
        });
    };

    // Handle file selection
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("video/")) {
            toast.error("Please select a valid video file");
            return;
        }

        // Get video duration
        try {
            const duration = await getVideoDuration(file);
            const durationInMinutes = duration / 60;

            // Check max length (skip for admin)
            if (userRole !== "Admin" && durationInMinutes > maxVideoLength) {
                toast.error(`Video length exceeds ${maxVideoLength} minutes. Please upload a shorter video.`);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return;
            }

            setVideoDuration(duration);
            setUploadedFile(file);

            // Upload file to Azure with chunked upload
            uploadFileToAzure(file, duration);
        } catch (error) {
            toast.error("Failed to read video metadata");
            console.error(error);
        }
    };

    // Upload file with chunked upload to Azure
    const uploadFileToAzure = async (file: File, duration: number) => {
        setIsUploading(true);
        onUploadingStateChange?.(true);
        setUploadProgress(0);

        try {
            // Initialize upload service
            const uploadService = new VideoUploadService();
            uploadServiceRef.current = uploadService;

            // Start upload process
            await uploadService.startUpload();

            // Upload file with progress tracking
            const videoGuid = await uploadService.uploadFile(file, (progress: UploadProgress) => {
                setUploadProgress(progress.percentage);
            });

            // Upload completed successfully
            setIsUploading(false);
            onUploadingStateChange?.(false);
            onVideoUpload({
                videoGuid: videoGuid,
                duration: duration,
            });

            toast.success(`${file.name} uploaded successfully`);
        } catch (error) {
            setIsUploading(false);
            onUploadingStateChange?.(false);
            setUploadProgress(0);
            console.error("Upload failed:", error);

            // Clean up failed upload
            if (uploadServiceRef.current) {
                await uploadServiceRef.current.deleteUpload();
                uploadServiceRef.current = null;
            }

            toast.error("Failed to upload video. Please try again.");

            // Reset file input
            setUploadedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Handle file removal
    const handleRemoveFile = async () => {
        // Delete upload from Azure if it exists
        if (uploadServiceRef.current) {
            await uploadServiceRef.current.deleteUpload();
            uploadServiceRef.current = null;
        }

        setUploadedFile(null);
        setUploadProgress(0);
        setVideoDuration(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onVideoUpload({});
    };

    // Format duration
    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Upload</h3>

            {/* Toggle between external and upload - hide when video is uploaded */}
            {!uploadedFile && (
                <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isExternal}
                            onChange={(e) => onToggleExternal(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Is your video external?</span>
                    </label>
                </div>
            )}

            {/* External Video URL */}
            {isExternal && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            External Video URL
                        </label>
                        <div className="relative">
                            <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="url"
                                value={externalUrl}
                                onChange={(e) => setExternalUrl(e.target.value)}
                                onBlur={handleUrlBlur}
                                placeholder="Enter video URL (YouTube, Vimeo, or direct video link)"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Analyzing status */}
                    {isAnalyzing && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Analyzing video...</span>
                        </div>
                    )}

                    {/* Success with fingerprint */}
                    {fingerprint && !isAnalyzing && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">Video processed successfully!</p>
                                <p className="text-xs text-green-600 mt-1">ID: {fingerprint}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* File Upload */}
            {!isExternal && (
                <div className="space-y-4">
                    {!uploadedFile && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm font-medium text-gray-700 mb-1">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">MP4 files up to 10GB</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/mp4"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Uploading progress */}
                    {uploadedFile && isUploading && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <VideoIcon className="h-8 w-8 text-blue-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div className="text-xs font-semibold text-blue-600">
                                        Uploading... {uploadProgress}%
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                                    <div
                                        style={{ width: `${uploadProgress}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload complete */}
                    {uploadedFile && !isUploading && (
                        <div className="space-y-4">
                            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
                                        <p className="text-xs text-green-700">
                                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                                            {videoDuration && ` • Duration: ${formatDuration(videoDuration)}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRemoveFile}
                                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* Video duration info */}
                            {videoDuration && (
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <p className="text-sm text-gray-700 mb-3">
                                        The duration of the video you submitted: <strong>{formatDuration(videoDuration)}</strong>
                                    </p>

                                    <hr className="my-3 border-gray-300" />

                                    {/* Can Fast Forward Checkbox */}
                                    <div className="flex items-start gap-2">
                                        <input
                                            type="checkbox"
                                            {...register("canFastForward")}
                                            className="w-4 h-4 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <label className="text-sm font-medium text-gray-700 cursor-pointer">
                                                Allow viewers to fast-forward
                                            </label>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Info className="h-3 w-3 text-gray-400" />
                                                <p className="text-xs text-gray-500">
                                                    If checked, viewers will be able to fast forward through the video
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
