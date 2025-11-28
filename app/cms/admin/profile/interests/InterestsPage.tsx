"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { profileApi } from "@/app/services/profileApi";
import { CategoryModel, CategoryResults } from "@/app/types/Category";
import { ArrowLeft, Plus, X, Heart } from "lucide-react";
import axiosClient from "@/app/utils/axiosClient";

const InterestsPage: React.FC = () => {
    const router = useRouter();
    const [userInterests, setUserInterests] = useState<CategoryModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<CategoryModel[]>([]);
    const [searching, setSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [actionId, setActionId] = useState<number | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            searchCategories();
        }, 700);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const profile = await profileApi.getProfile();
            setUserInterests(profile.userInterests || []);
        } catch {
            toast.error("Failed to load interests");
        } finally {
            setLoading(false);
        }
    };

    const searchCategories = async () => {
        setSearching(true);
        try {
            const res = await axiosClient.post<CategoryResults>("/api/Categories/Search/v2", {
                SearchValue: searchTerm,
                ResultCount: 20,
                Skip: 0,
            });
            setSearchResults(res.data.categories || []);
        } catch {
            toast.error("Failed to search categories");
        } finally {
            setSearching(false);
        }
    };

    const handleAddInterest = async (category: CategoryModel) => {
        // Check if already added
        if (userInterests.some((i) => i.categoryId === category.categoryId)) {
            toast.error("Category already added");
            return;
        }

        setActionId(category.categoryId);
        try {
            await profileApi.addUserInterest({ categoryId: category.categoryId });
            setUserInterests([...userInterests, category]);
            toast.success("Interest added successfully");
            setSearchResults(searchResults.filter((c) => c.categoryId !== category.categoryId));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add interest");
        } finally {
            setActionId(null);
        }
    };

    const handleRemoveInterest = async (categoryId: number) => {
        setActionId(categoryId);
        try {
            await profileApi.removeUserInterest(categoryId);
            setUserInterests(userInterests.filter((i) => i.categoryId !== categoryId));
            toast.success("Interest removed successfully");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to remove interest");
        } finally {
            setActionId(null);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => router.push("/cms/admin/profile")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
            </button>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Heart className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Interests</h1>
                            <p className="text-gray-600 mt-1">Manage your content interests and preferences</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            setShowSearch(!showSearch);
                            setSearchResults([]);
                            setSearchTerm("");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Interest
                    </Button>
                </div>

                {/* Search Section */}
                {showSearch && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="relative mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search category name..."
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {searching && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <LoadingSpinner />
                                </div>
                            )}
                        </div>

                        {searchResults.length > 0 && (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {searchResults.map((category) => (
                                    <div
                                        key={category.categoryId}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                    >
                                        <span className="text-gray-900">{category.categoryName}</span>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAddInterest(category)}
                                            disabled={actionId === category.categoryId}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            {actionId === category.categoryId ? (
                                                <LoadingSpinner />
                                            ) : (
                                                <Plus className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* User Interests List */}
                {userInterests.length > 0 ? (
                    <div className="space-y-2">
                        {userInterests.map((interest) => (
                            <div
                                key={interest.categoryId}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                            >
                                <span className="text-gray-900 font-medium">{interest.categoryName}</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRemoveInterest(interest.categoryId)}
                                    disabled={actionId === interest.categoryId}
                                    className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                                >
                                    {actionId === interest.categoryId ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <X className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Interests Added</h3>
                        <p className="text-gray-600 mb-6">
                            Start adding categories that interest you to personalize your experience
                        </p>
                        <Button
                            onClick={() => setShowSearch(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Interest
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default InterestsPage;
