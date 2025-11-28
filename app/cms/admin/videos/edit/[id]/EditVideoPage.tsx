"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { videosApi } from "@/app/services/videosApi";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { Video, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { VideoMetadataSection, CategorySelector, DescriptionEditor, ConsentManagementSection } from "../../components";
import { useAuth } from "@/app/hooks/useAuth";

const videoSchema = z.object({
    id: z.number(),
    title: z.string().min(1, "Title is required"),
    displayName: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    description: z.string().optional(),
    isActive: z.boolean(),
    isPrivate: z.boolean(),
    isFeatured: z.boolean().optional(),
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
    categoryIds: z.array(z.number()),
});

type VideoFormData = z.infer<typeof videoSchema>;

interface EditVideoPageProps {
    id: string;
}

export default function EditVideoPage({ id }: EditVideoPageProps) {
    const router = useRouter();
    const { canAddConsentVideo, isAdmin } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<VideoFormData>({
        resolver: zodResolver(videoSchema),
        defaultValues: {
            id: 0,
            title: "",
            displayName: null,
            name: null,
            description: "",
            isActive: true,
            isPrivate: false,
            isFeatured: false,
            displayBranding: false,
            hasConsent: false,
            canFastForward: true,
            videoDockIconsBehaviorTypeId: 1,
            categoryIds: [],
        },
    });

    const description = watch("description");

    useEffect(() => {
        const loadVideo = async () => {
            try {
                const video = await videosApi.getVideoById(parseInt(id));
                reset({
                    id: video.id,
                    title: video.title,
                    displayName: video.displayName,
                    name: video.name,
                    description: video.description || "",
                    isActive: video.isActive,
                    isPrivate: video.isPrivate,
                    isFeatured: video.isFeatured,
                    displayBranding: video.displayBranding,
                    hasConsent: video.hasConsent,
                    canFastForward: video.canFastForward,
                    consentTemplateId: video.consentTemplateId || "",
                    consentTime: video.consentTime || 0,
                    consentDischarge: video.consentDischarge || "",
                    consentDischargeOptional: video.consentDischargeOptional || false,
                    consentDischargeTime: video.consentDischargeTime || 0,
                    consentSurvey: video.consentSurvey || "",
                    consentSurveyLink: video.consentSurveyLink || "",
                    consentSurveyTime: video.consentSurveyTime || 0,
                    consentSameUserCanSignAgain: video.consentSameUserCanSignAgain || false,
                    videoFingerprint: video.videoFingerprint || "",
                    videoDockIconsBehaviorTypeId: video.videoDockIconsBehaviorTypeId,
                    categoryIds: video.categoryIds || [],
                });

                // Set categories for the selector
                setSelectedCategories(video.categoryIds || []);
            } catch (error: unknown) {
                const errorMessage = error && typeof error === "object" && "response" in error ? (error.response as { data?: { message?: string } })?.data?.message : undefined;
                toast.error(errorMessage || "Failed to load video");
                router.push("/cms/admin/videos");
            } finally {
                setIsLoading(false);
            }
        };

        loadVideo();
    }, [id, reset, router]);

    // Handle category changes
    const handleCategoriesChange = (categoryIds: number[]) => {
        setSelectedCategories(categoryIds);
        setValue("categoryIds", categoryIds);
    };

    const onSubmit = async (data: VideoFormData) => {
        setIsSubmitting(true);
        try {
            const result = await videosApi.updateVideo(parseInt(id), data);
            toast.success(result.message || "Video updated successfully");
            router.push("/cms/admin/videos");
        } catch (error: unknown) {
            const errorMessage = error && typeof error === "object" && "response" in error ? (error.response as { data?: { message?: string } })?.data?.message : undefined;
            toast.error(errorMessage || "Failed to update video");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/cms/admin/videos");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button onClick={handleCancel} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Videos
                    </button>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Video className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Video</h1>
                                <p className="text-sm text-gray-600 mt-1">Update video metadata and settings</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Video Metadata */}
                            <VideoMetadataSection
                                register={register as unknown as UseFormRegister<FieldValues>}
                                errors={errors as unknown as FieldErrors<FieldValues>}
                                companies={[]} // Not needed - company cannot be changed on edit
                                showCompanySelector={false} // Don't allow changing company on edit
                                showBrandingToggle={false}
                                userRole={isAdmin ? "Admin" : "Company"}
                            />

                            {/* Categories */}
                            <CategorySelector selectedCategories={selectedCategories} onCategoriesChange={handleCategoriesChange} />

                            {/* Video Settings */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" {...register("canFastForward")} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                            <span className="text-sm font-medium text-gray-700">Allow Fast Forward</span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Video Fingerprint</label>
                                        <input type="text" {...register("videoFingerprint")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Auto-generated fingerprint" />
                                        <p className="mt-1 text-xs text-gray-500">Unique identifier for the video (usually auto-generated)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Description */}
                            <DescriptionEditor register={register as unknown as UseFormRegister<FieldValues>} errors={errors as unknown as FieldErrors<FieldValues>} value={description} setValue={setValue as unknown as UseFormSetValue<FieldValues>} fieldName="description" />

                            {/* Consent Section - Only show if user has consent capability */}
                            {canAddConsentVideo && (
                                <ConsentManagementSection register={register as unknown as UseFormRegister<FieldValues>} setValue={setValue as unknown as UseFormSetValue<FieldValues>} watch={watch as unknown as UseFormWatch<FieldValues>} errors={errors as unknown as FieldErrors<FieldValues>} videoDuration={undefined} />
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="mt-6 flex justify-end gap-3 p-4">
                        <button type="button" onClick={handleCancel} disabled={isSubmitting} className="px-6 bg-white py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2 transition-colors">
                            {isSubmitting && <LoadingSpinner />}
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
