"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { videosApi } from "@/app/services/videosApi";
import { profileApi } from "@/app/services/profileApi";
import { SubscriptionUsageStats } from "@/app/types/Profile";
import { Video, ArrowLeft, Loader2, AlertTriangle, Info } from "lucide-react";
import { toast } from "react-toastify";
import { VideoUploadSection, VideoMetadataSection, CategorySelector, DescriptionEditor, ConsentManagementSection } from "../components";
import { useAuth } from "@/app/hooks/useAuth";

const videoSchema = z.object({
    companyId: z.number().optional(),
    title: z.string().min(1, "Title is required"),
    displayName: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    description: z.string().optional(),
    isActive: z.boolean(),
    isPrivate: z.boolean(),
    isFeatured: z.boolean().optional(),
    sourceType: z.string().optional(),
    videoUrl: z.string().optional(),
    videoGuid: z.string().optional(),
    videoDuration: z.number().optional(),
    displayBranding: z.boolean().optional(),
    hasConsent: z.boolean(),
    canFastForward: z.boolean(),
    consentTemplateId: z.string().optional(),
    consentTime: z.number().optional(),
    consentDischarge: z.string().optional(),
    consentDischargeOptional: z.boolean().optional(),
    consentDischargeTime: z.number().optional(),
    consentSurvey: z.string().optional(),
    consentSurveyLink: z.string().optional(),
    consentSurveyTime: z.number().optional(),
    consentSameUserCanSignAgain: z.boolean().optional(),
    videoFingerprint: z.string().optional(),
    videoDockIconsBehaviorTypeId: z.number(),
    categoryIds: z.array(z.number()).optional(),
});

type VideoFormData = z.infer<typeof videoSchema>;

export default function AddVideoPage() {
    const router = useRouter();
    const { canAddConsentVideo, isAdmin, user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExternalVideo, setIsExternalVideo] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [showProcessingModal, setShowProcessingModal] = useState(false);
    const [videoStatus, setVideoStatus] = useState<string>("");
    const [isVideoUploading, setIsVideoUploading] = useState(false);
    const [usageStats, setUsageStats] = useState<SubscriptionUsageStats | null>(null);
    const [loadingUsageStats, setLoadingUsageStats] = useState(true);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<VideoFormData>({
        resolver: zodResolver(videoSchema),
        defaultValues: {
            companyId: user?.companies?.[0]?.id,
            title: "",
            displayName: null,
            name: null,
            description: "",
            isActive: true,
            isPrivate: false,
            isFeatured: false,
            sourceType: "external",
            videoUrl: "",
            videoGuid: "",
            videoDuration: 0,
            displayBranding: false,
            hasConsent: false,
            canFastForward: true,
            videoDockIconsBehaviorTypeId: 1,
            categoryIds: [],
        },
    });

    const description = watch("description");

    // Load subscription usage stats for non-admin users
    useEffect(() => {
        const loadUsageStats = async () => {
            if (!isAdmin) {
                try {
                    setLoadingUsageStats(true);
                    const subscriptionData = await profileApi.getSubscription();
                    setUsageStats(subscriptionData.usageStats);
                } catch (error) {
                    console.error("Failed to load subscription usage stats:", error);
                    toast.error("Failed to load subscription information");
                } finally {
                    setLoadingUsageStats(false);
                }
            } else {
                setLoadingUsageStats(false);
            }
        };
        loadUsageStats();
    }, [isAdmin]);

    // Handle video upload data
    const handleVideoUpload = (data: { videoGuid?: string; videoUrl?: string; videoFingerprint?: string; duration?: number }) => {
        if (data.videoGuid) {
            setValue("videoGuid", data.videoGuid);
            setValue("sourceType", "upload");
        }
        if (data.videoUrl) {
            setValue("videoUrl", data.videoUrl);
            setValue("sourceType", "external");
        }
        if (data.videoFingerprint) {
            setValue("videoFingerprint", data.videoFingerprint);
        }
        if (data.duration) {
            setValue("videoDuration", Math.round(data.duration));
        }
    };

    // Handle category changes
    const handleCategoriesChange = (categoryIds: number[]) => {
        setSelectedCategories(categoryIds);
        setValue("categoryIds", categoryIds);
    };

    // Poll for video status
    const pollVideoStatus = async (videoId: number) => {
        const pollInterval = setInterval(async () => {
            try {
                const status = await videosApi.getVideoStatus(videoId);
                setVideoStatus(status.videoStatus);

                // If video is ready or failed, stop polling
                if (status.videoStatus === "Ready") {
                    clearInterval(pollInterval);
                    toast.success("Video is ready!");
                    setTimeout(() => {
                        router.push("/cms/admin/videos");
                    }, 2000);
                } else if (status.videoStatus === "Failed") {
                    clearInterval(pollInterval);
                    toast.error("Video processing failed");
                }
            } catch (error) {
                console.error("Error polling video status:", error);
            }
        }, 5000); // Poll every 5 seconds

        // Cleanup on unmount
        return () => clearInterval(pollInterval);
    };

    // Form submission
    const onSubmit = async (data: VideoFormData) => {
        // Validation: Check if video is uploaded or URL is provided
        if (!isExternalVideo && !data.videoGuid) {
            toast.error("Please upload a video or provide an external URL");
            return;
        }

        if (isExternalVideo && !data.videoUrl) {
            toast.error("Please provide a video URL");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await videosApi.createVideo(data);
            toast.success(result.message || "Video created successfully");

            // Stop showing the main form loading spinner
            setIsSubmitting(false);

            // For uploaded videos, show processing modal
            if (data.videoGuid && data.sourceType !== "external") {
                setVideoStatus("Processing");
                setShowProcessingModal(true);
                pollVideoStatus(result.id);
            } else {
                // External videos are ready immediately
                router.push("/cms/admin/videos");
            }
        } catch (error: unknown) {
            const errorMessage = error && typeof error === "object" && "response" in error ? (error.response as { data?: { message?: string } })?.data?.message : undefined;
            toast.error(errorMessage || "Failed to create video");
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/cms/admin/videos");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button onClick={handleCancel} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4" disabled={showProcessingModal}>
                        <ArrowLeft className="w-4 h-4" />
                        Back to Videos
                    </button>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Video className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Add New Video</h1>
                                <p className="text-sm text-gray-600 mt-1">Upload your video and configure metadata and settings</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Stats Warning - Only for non-admin users */}
                {!isAdmin && !loadingUsageStats && usageStats && (
                    <div className="mb-6">
                        {((usageStats.remainingMonthVideos ?? 0) <= 0 || (usageStats.remainingYearVideos ?? 0) <= 0) ? (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-600 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-900 mb-2">Video Limit Reached</h3>
                                        {(usageStats.remainingMonthVideos ?? 0) <= 0 && (
                                            <p className="text-sm text-red-700 mb-2">
                                                You have reached your monthly video limit ({usageStats.maxMonthVideos ?? 0} videos). You cannot add more videos this month. You can either delete existing videos from this month or wait until next month.
                                            </p>
                                        )}
                                        {(usageStats.remainingMonthVideos ?? 0) > 0 && (usageStats.remainingYearVideos ?? 0) <= 0 && (
                                            <p className="text-sm text-red-700 mb-2">
                                                You have reached your yearly video limit ({usageStats.maxYearVideos ?? 0} videos). You cannot add more videos this year. Please upgrade your subscription to continue adding videos.
                                            </p>
                                        )}
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
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Subscription Usage</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-600">Videos remaining this month:</p>
                                                <p className="font-bold text-gray-900">{usageStats.remainingMonthVideos ?? 0} / {usageStats.maxMonthVideos ?? 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Videos remaining this year:</p>
                                                <p className="font-bold text-gray-900">{usageStats.remainingYearVideos ?? 0} / {usageStats.maxYearVideos ?? 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Form - Hide when processing modal is shown or limit reached */}
                <form onSubmit={handleSubmit(onSubmit)} className={showProcessingModal || (!isAdmin && ((usageStats?.remainingMonthVideos ?? 1) <= 0 || (usageStats?.remainingYearVideos ?? 1) <= 0)) ? "hidden" : ""}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Video Metadata */}
                            <VideoMetadataSection
                                register={register as unknown as UseFormRegister<FieldValues>}
                                errors={errors as unknown as FieldErrors<FieldValues>}
                                companies={[]} // Not needed for non-admin users
                                showCompanySelector={isAdmin}
                                showBrandingToggle={false}
                                userRole={isAdmin ? "Admin" : "Company"}
                            />

                            {/* Video Upload */}
                            <VideoUploadSection
                                onVideoUpload={handleVideoUpload}
                                isExternal={isExternalVideo}
                                onToggleExternal={setIsExternalVideo}
                                maxVideoLength={60}
                                userRole={isAdmin ? "Admin" : "Company"}
                                register={register as unknown as UseFormRegister<FieldValues>}
                                onUploadingStateChange={setIsVideoUploading}
                            />

                            {/* Categories */}
                            <CategorySelector selectedCategories={selectedCategories} onCategoriesChange={handleCategoriesChange} />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Description */}
                            <DescriptionEditor register={register as unknown as UseFormRegister<FieldValues>} errors={errors as unknown as FieldErrors<FieldValues>} value={description} setValue={setValue as unknown as UseFormSetValue<FieldValues>} fieldName="description" />

                            {/* Consent Section - Only show if user has consent capability */}
                            {canAddConsentVideo && (
                                <ConsentManagementSection
                                    register={register as unknown as UseFormRegister<FieldValues>}
                                    setValue={setValue as unknown as UseFormSetValue<FieldValues>}
                                    watch={watch as unknown as UseFormWatch<FieldValues>}
                                    errors={errors as unknown as FieldErrors<FieldValues>}
                                    videoDuration={watch("videoDuration")}
                                />
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="mt-6 flex justify-end gap-3 p-4">
                        <button type="button" onClick={handleCancel} disabled={isSubmitting || isVideoUploading} className="px-6 bg-white py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || isVideoUploading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2 transition-colors">
                            {isSubmitting ? "Creating..." : isVideoUploading ? "Uploading Video..." : "Create Video"}
                        </button>
                    </div>
                </form>

                {/* Processing Modal */}
                {showProcessingModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
                            <div className="text-center">
                                <div className="mb-4">
                                    <Video className="w-16 h-16 mx-auto text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Video Processing</h2>

                                <div className="mb-6">
                                    {videoStatus === "Processing" && (
                                        <>
                                            <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
                                            <p className="mt-4 text-gray-700">Your video is being processed...</p>
                                            <p className="text-sm text-gray-500 mt-2">This may take a few moments. You can wait here or go back to the videos list.</p>
                                        </>
                                    )}
                                    {videoStatus === "Ready" && (
                                        <>
                                            <div className="text-green-600 text-lg font-semibold mb-2">Video is ready!</div>
                                            <p className="text-gray-600">Redirecting to videos list...</p>
                                        </>
                                    )}
                                    {videoStatus === "Failed" && (
                                        <>
                                            <div className="text-red-600 text-lg font-semibold mb-2">Processing failed</div>
                                            <p className="text-gray-600">There was an error processing your video.</p>
                                        </>
                                    )}
                                    {videoStatus === "Queued" && (
                                        <>
                                            <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
                                            <p className="mt-4 text-gray-700">Your video is queued for processing...</p>
                                            <p className="text-sm text-gray-500 mt-2">Processing will begin shortly.</p>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-3 justify-center">
                                    {videoStatus !== "Ready" && videoStatus !== "Failed" && (
                                        <button onClick={() => router.push("/cms/admin/videos")} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                            Go to Videos
                                        </button>
                                    )}
                                    {(videoStatus === "Ready" || videoStatus === "Failed") && (
                                        <button onClick={() => router.push("/cms/admin/videos")} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
