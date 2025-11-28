"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { settingsApi } from "@/app/services/settingsApi";
import { CreateSecurityQuestionRequest } from "@/app/types/Role";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { ArrowLeft, HelpCircle, AlertTriangle } from "lucide-react";

const AddSecurityQuestionPage: React.FC = () => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateSecurityQuestionRequest>();

    const onSubmit = async (data: CreateSecurityQuestionRequest) => {
        setSubmitting(true);
        try {
            await settingsApi.createSecurityQuestion(data);
            toast.success("Security question created successfully");
            router.push("/cms/admin/settings/security-questions");
        } catch (error) {
            toast.error("Failed to create security question");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.push("/cms/admin/settings/security-questions")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Security Questions
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Add Security Question
                </h1>
                <p className="text-gray-600">Create a new security question for account recovery</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <HelpCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Question Information
                            </h2>
                            <p className="text-sm text-gray-600">
                                Enter the security question text
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Question */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register("question", {
                                required: "Question is required",
                            })}
                            rows={3}
                            placeholder="Enter the security question (e.g., What was your first pet's name?)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.question && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                {errors.question.message}
                            </div>
                        )}
                        <p className="mt-2 text-sm text-gray-500">
                            Create clear and memorable questions that users can easily answer for account recovery
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.push("/cms/admin/settings/security-questions")}
                            disabled={submitting}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <LoadingSpinner />
                                    Creating...
                                </>
                            ) : (
                                "Create Question"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSecurityQuestionPage;
