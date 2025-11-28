"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { adminCustomContentApi } from "@/app/services/adminCustomContentApi";
import { assistantApi } from "@/app/services/assistantApi";
import { CustomContentFormFields, CONTENT_TYPES } from "@/app/types/CustomContent";
import { useAuth } from "@/app/hooks/useAuth";
import MediaSelectionModal from "../../products/shared/MediaSelectionModal";
import { FileText, Save, ArrowLeft, Building2, Image as ImageIcon, Download, Upload, X, Sparkles, RefreshCw, Check, FileImage, AlertCircle } from "lucide-react";

const customContentSchema = z.object({
    companyId: z.number().min(1, "Company is required"),
    name: z.string().min(1, "Name is required"),
    contentTypeId: z.number().min(1, "Content type is required"),
    itemContentValue: z.string().optional(),
    itemImageValue: z.string().optional(),
    itemDownloadLink: z.string().optional(),
    itemContentIcon: z.string().min(1, "Icon is required"),
    isActive: z.boolean(),
});

interface AddCustomContentPageProps {
    companyId?: number;
}

interface DescriptionSuggestion {
    text: string;
    id: string;
}

interface FileUploadResponse {
    status: string;
    result: string;
}

const AddCustomContentPage: React.FC<AddCustomContentPageProps> = ({ companyId }) => {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [companies, setCompanies] = useState<Array<{ value: string; text: string }>>([]);
    const [contentTypes, setContentTypes] = useState<Array<{ value: string; text: string }>>([]);
    const [, setRole] = useState("");
    const [, setUserCompanyId] = useState<number | null>(null);

    // Media selection states
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaSelectionFor, setMediaSelectionFor] = useState<"image" | "icon" | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedIcon, setSelectedIcon] = useState<string>("");

    // File upload states
    const [uploading, setUploading] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI states
    const [loadingDescriptions, setLoadingDescriptions] = useState(false);
    const [descriptionSuggestions, setDescriptionSuggestions] = useState<DescriptionSuggestion[]>([]);
    const [originalText, setOriginalText] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CustomContentFormFields>({
        resolver: zodResolver(customContentSchema),
        defaultValues: {
            companyId: companyId || 0,
            name: "",
            contentTypeId: 0,
            itemContentValue: "",
            itemImageValue: "",
            itemDownloadLink: "",
            itemContentIcon: "",
            isActive: true,
        },
    });

    const watchedContentTypeId = watch("contentTypeId");
    const watchedDescription = watch("itemContentValue");
    const selectedContentType = contentTypes.find((ct) => ct.value === watchedContentTypeId.toString())?.text || "";

    // Load form data
    useEffect(() => {
        const loadFormData = async () => {
            try {
                const formData = await adminCustomContentApi.getFormData();
                setCompanies(formData.companies);
                setContentTypes(formData.contentTypes);

                console.log(formData.contentTypes);
                setRole(formData.role);
                setUserCompanyId(formData.userCompanyId ?? null);

                // Set default company if provided or user is not admin
                if (companyId) {
                    setValue("companyId", companyId);
                } else if (!isAdmin && formData.userCompanyId) {
                    setValue("companyId", formData.userCompanyId);
                }
            } catch {
                toast.error("Failed to load form data");
            } finally {
                setLoading(false);
            }
        };

        loadFormData();
    }, [companyId, isAdmin, setValue]);

    // Handle media selection
    const handleMediaSelect = (mediaUrl: string) => {
        if (mediaSelectionFor === "image") {
            setSelectedImage(mediaUrl);
            setValue("itemImageValue", mediaUrl);
        } else if (mediaSelectionFor === "icon") {
            setSelectedIcon(mediaUrl);
            setValue("itemContentIcon", mediaUrl);
        }
        setShowMediaModal(false);
        setMediaSelectionFor(null);
    };

    // Handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.includes("pdf")) {
            toast.error("Only PDF files are allowed");
            return;
        }

        if (file.size > 40 * 1024 * 1024) {
            // 40MB limit
            toast.error("File size must be less than 40MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/itemcontent/file/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data: FileUploadResponse = await response.json();
            setUploadedFileUrl(data.result);
            setValue("itemDownloadLink", data.result);
            toast.success("File uploaded successfully");
        } catch {
            toast.error("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    // Handle file removal
    const handleFileRemove = async () => {
        if (!uploadedFileUrl) return;

        try {
            await fetch(`/api/itemcontent/file/delete?link=${uploadedFileUrl}`, {
                method: "DELETE",
            });
            setUploadedFileUrl("");
            setValue("itemDownloadLink", "");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            toast.success("File removed successfully");
        } catch {
            toast.error("Failed to remove file");
        }
    };

    // Handle AI description improvement
    const handleImproveDescription = async () => {
        if (!watchedDescription?.trim()) {
            toast.error("Please enter some content first");
            return;
        }

        setLoadingDescriptions(true);
        setOriginalText(watchedDescription);

        try {
            const suggestions = await assistantApi.improveCaptions(watchedDescription);

            if (suggestions && suggestions.length > 0) {
                const suggestionsWithIds = suggestions.map((text: string, index: number) => ({
                    text,
                    id: `suggestion-${index}`,
                }));
                setDescriptionSuggestions(suggestionsWithIds);
            } else {
                toast.error("No suggestions available");
            }
        } catch {
            toast.error("Failed to generate descriptions");
        } finally {
            setLoadingDescriptions(false);
        }
    };

    // Handle suggestion selection (keep suggestions visible)
    const handleSuggestionSelect = (suggestion: DescriptionSuggestion) => {
        setValue("itemContentValue", suggestion.text);
        toast.success("Content updated!");
    };

    // Handle suggestion reset
    const handleSuggestionReset = () => {
        setValue("itemContentValue", originalText);
    };

    // Handle dismissing all suggestions
    const handleDismissSuggestions = () => {
        setDescriptionSuggestions([]);
    };

    // Handle form submission
    const onSubmit = async (data: CustomContentFormFields) => {
        setSaving(true);
        try {
            // Validate content based on type
            if (selectedContentType === CONTENT_TYPES.TEXT && !data.itemContentValue?.trim()) {
                toast.error("Content text is required");
                return;
            }
            if (selectedContentType === CONTENT_TYPES.IMAGE && !data.itemImageValue) {
                toast.error("Image is required");
                return;
            }
            if (selectedContentType === CONTENT_TYPES.IMAGE_AND_TEXT) {
                if (!data.itemImageValue) {
                    toast.error("Image is required");
                    return;
                }
                if (!data.itemContentValue?.trim()) {
                    toast.error("Content text is required");
                    return;
                }
            }
            if (selectedContentType === CONTENT_TYPES.DOWNLOAD && !data.itemDownloadLink) {
                toast.error("Document upload is required");
                return;
            }

            const createData = {
                companyId: data.companyId,
                name: data.name,
                contentTypeId: data.contentTypeId,
                itemContentValue: selectedContentType === CONTENT_TYPES.IMAGE ? data.itemImageValue : data.itemContentValue,
                itemImageValue: selectedContentType === CONTENT_TYPES.IMAGE ? undefined : data.itemImageValue,
                itemDownloadLink: data.itemDownloadLink,
                itemContentIcon: data.itemContentIcon,
                isActive: data.isActive,
            };

            await adminCustomContentApi.create(createData);
            toast.success("Custom content created successfully");
            router.push("/cms/admin/customContent");
        } catch (error: unknown) {
            const errorMessage = error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response && error.response.data && typeof error.response.data === "object" && "message" in error.response.data ? String(error.response.data.message) : "Failed to create custom content";
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Show content type specific fields
    const showTextContent = selectedContentType === CONTENT_TYPES.TEXT || selectedContentType === CONTENT_TYPES.IMAGE_AND_TEXT || selectedContentType === CONTENT_TYPES.DOWNLOAD;
    const showImageContent = selectedContentType === CONTENT_TYPES.IMAGE || selectedContentType === CONTENT_TYPES.IMAGE_AND_TEXT || selectedContentType === CONTENT_TYPES.DOWNLOAD;
    const showDocumentUpload = selectedContentType === CONTENT_TYPES.DOWNLOAD;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Custom Content</h1>
                    <p className="text-gray-600 mt-1">Create a new custom content item</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => router.push("/cms/admin/customContent")} className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </Button>
                    <Button type="submit" form="add-content-form" disabled={saving} className="flex items-center gap-2">
                        {saving ? (
                            <>
                                <LoadingSpinner />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Content
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <form id="add-content-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-6">
                        <Card className="bg-white">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 p-2 rounded-lg">
                                        <Building2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                                        <p className="text-sm text-gray-600">Configure the basic content properties</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {isAdmin && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Company <span className="text-red-500">*</span>
                                            </label>
                                            <select {...register("companyId", { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                                <option value={0}>Select Company</option>
                                                {companies.map((company) => (
                                                    <option key={company.value} value={parseInt(company.value)}>
                                                        {company.text}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.companyId && <p className="text-red-500 text-sm mt-1">{errors.companyId.message}</p>}
                                        </div>
                                    )}

                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" {...register("name")} placeholder="Enter content name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                                    </div>

                                    {/* Content Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Content Type <span className="text-red-500">*</span>
                                        </label>
                                        <select {...register("contentTypeId", { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option value={0}>Select Content Type</option>
                                            {contentTypes.map((type) => (
                                                <option key={type.value} value={parseInt(type.value)}>
                                                    {type.text}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.contentTypeId && <p className="text-red-500 text-sm mt-1">{errors.contentTypeId.message}</p>}
                                    </div>

                                    {/* Active Status */}
                                    <div className="flex items-center">
                                        <input type="checkbox" {...register("isActive")} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                        <label className="ml-2 text-sm font-medium text-gray-700">Active</label>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Content */}
                    <div className="space-y-6">
                        <Card className="bg-white">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-600 p-2 rounded-lg">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Content Details</h2>
                                        <p className="text-sm text-gray-600">Configure your content based on the selected type</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                {!selectedContentType && (
                                    <div className="text-center py-8">
                                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">Please choose a content type to continue.</p>
                                    </div>
                                )}

                                {/* Text Content */}
                                {showTextContent && (
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Content <span className="text-red-500">*</span>
                                            </label>
                                            <textarea {...register("itemContentValue")} rows={6} placeholder="Enter your content text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                            {errors.itemContentValue && <p className="text-red-500 text-sm mt-1">{errors.itemContentValue.message}</p>}
                                        </div>

                                        <div className="flex justify-end">
                                            <Button type="button" variant="outline" onClick={handleImproveDescription} disabled={!watchedDescription?.trim() || loadingDescriptions} className="flex items-center gap-2">
                                                {loadingDescriptions ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                Improve with AI
                                            </Button>
                                        </div>

                                        {descriptionSuggestions.length > 0 && (
                                            <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-purple-700 flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4" />
                                                        AI Suggestions ({descriptionSuggestions.length})
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <Button type="button" variant="outline" size="sm" onClick={handleSuggestionReset} className="flex items-center gap-1">
                                                            <RefreshCw className="w-3 h-3" />
                                                            Reset to Original
                                                        </Button>
                                                        <Button type="button" variant="outline" size="sm" onClick={handleDismissSuggestions} className="flex items-center gap-1">
                                                            <X className="w-3 h-3" />
                                                            Dismiss All
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                                    <p className="text-xs text-purple-600 bg-purple-100 p-2 rounded border border-purple-200">
                                                        <strong>Tip:</strong> Click "Use" to apply any suggestion. You can try different ones - suggestions will stay visible for comparison.
                                                    </p>
                                                    {descriptionSuggestions.map((suggestion, index) => (
                                                        <div key={suggestion.id} className="group bg-white rounded-lg p-3 border border-purple-200 cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all duration-200" onClick={() => handleSuggestionSelect(suggestion)}>
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 mr-3">
                                                                    <div className="flex items-center mb-1">
                                                                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-purple-600 bg-purple-100 rounded-full mr-2">{index + 1}</span>
                                                                        <span className="text-xs font-medium text-purple-600">Suggestion {index + 1}</span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-800 leading-relaxed">{suggestion.text}</p>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-xs group-hover:scale-105 transition-transform"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSuggestionSelect(suggestion);
                                                                    }}
                                                                >
                                                                    <Check className="w-3 h-3" />
                                                                    Use
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Image Content */}
                                {showImageContent && (
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Content Image <span className="text-red-500">*</span>
                                            </label>
                                            <div className="space-y-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setMediaSelectionFor("image");
                                                        setShowMediaModal(true);
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <ImageIcon className="w-4 h-4" />
                                                    Choose Media
                                                </Button>
                                                {selectedImage && (
                                                    <div className="relative">
                                                        <img src={selectedImage} alt="Selected content" className="w-40 h-auto rounded-lg border" />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedImage("");
                                                                setValue("itemImageValue", "");
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    <em>Ideal dimensions: Width: 360px, Height: 600px</em>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Document Upload */}
                                {showDocumentUpload && (
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Upload Document <span className="text-red-500">*</span>
                                            </label>
                                            <div className="space-y-3">
                                                {!uploadedFileUrl ? (
                                                    <div>
                                                        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                                                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2">
                                                            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                            {uploading ? "Uploading..." : "Upload PDF"}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <Download className="w-5 h-5 text-green-600" />
                                                        <span className="flex-1 text-sm text-green-700">Document uploaded successfully</span>
                                                        <Button type="button" variant="outline" size="sm" onClick={handleFileRemove} className="text-red-600 hover:text-red-700">
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Icon Selection */}
                        <Card className="bg-white">
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-600 p-2 rounded-lg">
                                        <ImageIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Icon Selection</h2>
                                        <p className="text-sm text-gray-600">Choose an icon to represent your content</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Icon <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setMediaSelectionFor("icon");
                                                    setShowMediaModal(true);
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <FileImage className="w-4 h-4" />
                                                Choose Icon
                                            </Button>
                                            {selectedIcon && (
                                                <div className="relative">
                                                    <img src={selectedIcon} alt="Selected icon" className="w-24 h-auto rounded-lg border" />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedIcon("");
                                                            setValue("itemContentIcon", "");
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                            <p className="text-sm text-gray-500">
                                                <em>Ideal dimensions: Width: 100px, Height: 100px</em>
                                            </p>
                                            {errors.itemContentIcon && <p className="text-red-500 text-sm">{errors.itemContentIcon.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </form>

            {/* Media Selection Modal */}
            <MediaSelectionModal
                isOpen={showMediaModal}
                onClose={() => {
                    setShowMediaModal(false);
                    setMediaSelectionFor(null);
                }}
                onSelect={handleMediaSelect}
                title={mediaSelectionFor === "icon" ? "Select Icon" : "Select Image"}
            />
        </div>
    );
};

export default AddCustomContentPage;
