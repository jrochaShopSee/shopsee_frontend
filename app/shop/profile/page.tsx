"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import axiosClient from "@/app/utils/axiosClient";
import { User, Upload, Trash2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileData extends ProfileFormData {
    email: string;
    image?: string;
    userId: number;
}

export default function ProfilePage() {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await axiosClient.get<ProfileData>("/api/shop/profile");
                setProfileData(response.data);
                setProfileImage(response.data.image || null);

                // Populate form
                setValue("firstName", response.data.firstName);
                setValue("lastName", response.data.lastName);
                setValue("phone", response.data.phone || "");
            } catch (error) {
                console.error("Failed to load profile:", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [setValue]);

    const onSubmit = async (data: ProfileFormData) => {
        setSubmitting(true);
        try {
            await axiosClient.put("/api/shop/profile", data);
            toast.success("Profile updated successfully");
            router.push("/shop/account");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !profileData) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Only images are allowed.");
            return;
        }

        // Validate file size (8MB)
        if (file.size > 8388608) {
            toast.error("Image size too large (max 8MB)");
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axiosClient.post<{ path: string }>(
                `/api/shop/profile/upload-image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setProfileImage(response.data.path);
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error("Failed to upload image:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveImage = async () => {
        if (!profileData) return;

        if (!window.confirm("Are you sure you want to remove your profile image?")) {
            return;
        }

        try {
            await axiosClient.delete("/api/shop/profile/image");
            setProfileImage(null);
            toast.success("Image removed successfully");
        } catch (error) {
            console.error("Failed to remove image:", error);
            toast.error("Failed to remove image");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load profile</h2>
                    <p className="text-gray-600">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                <p className="text-gray-600">Manage your personal information</p>
            </div>

            <div className="max-w-3xl">
                {/* Profile Image Section */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Picture</h2>
                    <div className="flex items-start space-x-6">
                        <div className="relative">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-violet-100 flex items-center justify-center border-4 border-gray-200">
                                    <User className="w-16 h-16 text-violet-600" />
                                </div>
                            )}
                            {uploadingImage && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                    <LoadingSpinner size="sm" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-4">
                                Upload a profile picture to personalize your account. Recommended size: 400x400px
                            </p>
                            <div className="flex space-x-3">
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Photo
                                </Button>
                                {profileImage && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRemoveImage}
                                        disabled={uploadingImage}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Profile Information Form */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={profileData.email}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("firstName")}
                                className={`w-full px-4 py-2 border ${
                                    errors.firstName ? "border-red-500" : "border-gray-300"
                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("lastName")}
                                className={`w-full px-4 py-2 border ${
                                    errors.lastName ? "border-red-500" : "border-gray-300"
                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20`}
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                {...register("phone")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="(555) 123-4567"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/shop/account")}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="default" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
