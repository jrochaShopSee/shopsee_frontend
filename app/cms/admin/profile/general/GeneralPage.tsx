"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { profileApi } from "@/app/services/profileApi";
import { ProfileFormData, UpdateGeneralProfileRequest } from "@/app/types/Profile";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import {
    ArrowLeft,
    User,
    Calendar,
    Lock,
    Globe,
    HelpCircle,
    Upload,
    Trash2,
    Eye,
    EyeOff,
    AlertTriangle
} from "lucide-react";

const GeneralPage: React.FC = () => {
    const [formData, setFormData] = useState<ProfileFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        clearErrors
    } = useForm<UpdateGeneralProfileRequest>();

    const newPassword = watch("newPassword");

    useEffect(() => {
        const loadFormData = async () => {
            try {
                const data = await profileApi.getFormData();
                setFormData(data);
                setProfileImage(data.profile.image || null);

                // Convert date from M/D/YYYY to YYYY-MM-DD format for input[type="date"]
                const convertDateToInputFormat = (dateStr: string | undefined): string => {
                    if (!dateStr) return "";
                    try {
                        // Parse M/D/YYYY format
                        const parts = dateStr.split("/");
                        if (parts.length === 3) {
                            const month = parts[0].padStart(2, "0");
                            const day = parts[1].padStart(2, "0");
                            const year = parts[2];
                            return `${year}-${month}-${day}`;
                        }
                        return "";
                    } catch {
                        return "";
                    }
                };

                // Populate form with existing values
                setValue("displayName", data.profile.displayName);
                setValue("dateOfBirth", convertDateToInputFormat(data.profile.dateOfBirth));
                setValue("question", data.profile.question || "");
                setValue("website", data.profile.website || "");
            } catch {
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        loadFormData();
    }, [setValue]);

    const onSubmit = async (data: UpdateGeneralProfileRequest) => {
        setSubmitting(true);
        try {
            // Remove password fields if they're empty to avoid backend validation errors
            const cleanedData = { ...data };
            if (!cleanedData.newPassword || cleanedData.newPassword.trim() === "") {
                delete cleanedData.newPassword;
                delete cleanedData.confirmPassword;
                delete cleanedData.currentPassword;
            }

            await profileApi.updateGeneral(cleanedData);
            toast.success("Profile updated successfully");
            router.push("/cms/admin/profile");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !formData) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Only images are allowed.");
            return;
        }

        // Validate file size (8MB to match backend)
        if (file.size > 8388608) {
            toast.error("Image size too large (max 8MB)");
            return;
        }

        setUploadingImage(true);
        try {
            const result = await profileApi.uploadImage(formData.profile.id, file);
            setProfileImage(result.path);
            toast.success("Image uploaded successfully");
            setShowImageUpload(false);
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveImage = async () => {
        if (!formData) return;

        if (!window.confirm("Are you sure you want to remove your profile image?")) {
            return;
        }

        try {
            await profileApi.removeImage(formData.profile.id);
            setProfileImage(null);
            toast.success("Image removed successfully");
        } catch {
            toast.error("Failed to remove image");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="p-6">
                <p className="text-red-600">Failed to load profile data</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={() => router.push("/cms/admin/profile")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
            </button>

            <h1 className="text-3xl font-bold mb-6">Edit General Information</h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Form Fields */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500 p-2 rounded-lg">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">General Information</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Display Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("displayName", { required: "Display name is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.displayName && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        {errors.displayName.message}
                                    </p>
                                )}
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.profile.email}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                                />
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <Calendar className="inline h-4 w-4 mr-1" />
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    {...register("dateOfBirth", {
                                        validate: (value) => {
                                            if (!value) return true; // Allow empty
                                            const birthDate = new Date(value);
                                            const today = new Date();
                                            const age = today.getFullYear() - birthDate.getFullYear();
                                            const monthDiff = today.getMonth() - birthDate.getMonth();
                                            const dayDiff = today.getDate() - birthDate.getDate();

                                            // Adjust age if birthday hasn't occurred this year
                                            const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;

                                            return actualAge >= 18 || "You must be at least 18 years old";
                                        }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.dateOfBirth && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        {errors.dateOfBirth.message}
                                    </p>
                                )}
                            </div>

                            {/* Security Question */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <HelpCircle className="inline h-4 w-4 mr-1" />
                                    Security Question <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register("question", { required: "Security question is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a question</option>
                                    {formData.securityQuestions.map((q) => (
                                        <option key={q} value={q}>
                                            {q}
                                        </option>
                                    ))}
                                </select>
                                {errors.question && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        {errors.question.message}
                                    </p>
                                )}
                            </div>

                            {/* Security Answer */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Response
                                </label>
                                <input
                                    type="text"
                                    {...register("response")}
                                    placeholder="**********"
                                    autoComplete="off"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    For security reasons, we cannot show your answer. Fill this field only if you want to change it.
                                </p>
                            </div>

                            {/* Website */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <Globe className="inline h-4 w-4 mr-1" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    {...register("website")}
                                    placeholder="https://example.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Password Section */}
                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Password Management
                                </h3>

                                {/* Current Password (Always shown) */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            {...register("currentPassword")}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Change Password Checkbox */}
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="changePassword"
                                        checked={changePassword}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setChangePassword(isChecked);
                                            // Clear password fields and errors when unchecking
                                            if (!isChecked) {
                                                setValue("newPassword", "");
                                                setValue("confirmPassword", "");
                                                clearErrors("newPassword");
                                                clearErrors("confirmPassword");
                                            }
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="changePassword" className="ml-2 text-sm text-gray-700">
                                        Change Password
                                    </label>
                                </div>

                                {/* New Password Fields (Shown when checkbox is checked) */}
                                {changePassword && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                New Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    {...register("newPassword", {
                                                        required: changePassword ? "New password is required" : false,
                                                        minLength: changePassword ? {
                                                            value: 6,
                                                            message: "Password must be at least 6 characters"
                                                        } : undefined
                                                    })}
                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors.newPassword && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    {errors.newPassword.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Confirm Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    {...register("confirmPassword", {
                                                        required: changePassword ? "Please confirm your password" : false,
                                                        validate: (value) =>
                                                            !changePassword || value === newPassword || "Passwords do not match"
                                                    })}
                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    {errors.confirmPassword.message}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Profile Image */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-500 p-2 rounded-lg">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Profile Image</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Image Display */}
                            {profileImage && (
                                <div className="mb-4 flex justify-center">
                                    <div className="relative inline-block">
                                        <img
                                            src={profileImage}
                                            alt="Profile"
                                            className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                            title="Remove Image"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Button */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowImageUpload(!showImageUpload)}
                                    className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    {profileImage ? "Replace Image" : "Upload Image"}
                                </button>
                            </div>

                            {/* Upload Section */}
                            {showImageUpload && (
                                <div className="mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500 text-center">
                                        JPG, PNG or GIF (max 8MB)
                                    </p>
                                    {uploadingImage && (
                                        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600">
                                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                            Uploading...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GeneralPage;
