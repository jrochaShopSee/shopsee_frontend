"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { settingsApi } from "@/app/services/settingsApi";
import { SecurityQuestion } from "@/app/types/Role";
import { toast } from "react-toastify";
import { Search, HelpCircle, Plus, Edit2, Trash2 } from "lucide-react";

const SecurityQuestionsPage: React.FC = () => {
    const router = useRouter();
    const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadQuestions = useCallback(
        async (reset = false) => {
            if (loading && !reset) return;

            setLoading(true);
            try {
                const skip = reset ? 0 : questions.length;
                const response = await settingsApi.getSecurityQuestions({
                    skip,
                    take: 50,
                    search: searchTerm,
                });

                if (reset) {
                    setQuestions(response.data);
                } else {
                    setQuestions((prev) => [...prev, ...response.data]);
                }

                setHasMore(response.hasMore);
                setTotalCount(response.totalCount);
            } catch (error) {
                toast.error("Failed to load security questions");
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [questions.length, searchTerm]
    );

    useEffect(() => {
        loadQuestions(true);
    }, [searchTerm]);

    const handleDelete = async (id: number, question: string) => {
        if (!confirm(`Are you sure you want to delete "${question}"?`)) {
            return;
        }

        setDeletingId(id);
        try {
            await settingsApi.deleteSecurityQuestion(id);
            toast.success("Security question deleted successfully");
            loadQuestions(true);
        } catch (error) {
            toast.error("Failed to delete security question");
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/cms/admin/settings/security-questions/${id}/edit`);
    };

    const handleAddNew = () => {
        router.push("/cms/admin/settings/security-questions/add");
    };

    const renderQuestionItem = (index: number, question: SecurityQuestion) => {
        const isDeleting = deletingId === question.id;

        return (
            <div
                key={question.id}
                className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-base text-gray-900">{question.question}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(question.id)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(question.id, question.question)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <LoadingSpinner />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && questions.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Security Questions
                    </h1>
                    <p className="text-gray-600">
                        Manage security questions for user account recovery
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Add New Question
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search security questions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="text-sm text-gray-600">
                        Total: {totalCount} questions
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <InfiniteScrollList
                data={questions}
                loading={loading}
                hasMore={hasMore}
                endReached={() => loadQuestions(false)}
                itemContent={renderQuestionItem}
                emptyIcon={<HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
                emptyTitle="No Security Questions Found"
                emptyMessage="Get started by adding your first security question"
                height={600}
                footerLoading={<LoadingSpinner />}
            />
        </div>
    );
};

export default SecurityQuestionsPage;
