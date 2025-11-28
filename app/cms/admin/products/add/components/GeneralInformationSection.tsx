"use client";

import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Package, Sparkles, Wand2, Check, X, Brain, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { ProductFormData, PRODUCT_TYPES } from "@/app/types/Product";
import { AddProductFormData } from "../types";
import { assistantApi } from "@/app/services/assistantApi";
import QuizGeneratorModal from "./QuizGeneratorModal";

interface DescriptionSuggestion {
    text: string;
    id: string;
}

interface GeneralInformationSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    formData: ProductFormData;
    watch: UseFormWatch<AddProductFormData>;
    setValue: UseFormSetValue<AddProductFormData>;
    isShopifyProduct?: boolean;
}

const GeneralInformationSection: React.FC<GeneralInformationSectionProps> = ({ register, errors, formData, watch, setValue, isShopifyProduct = false }) => {
    const [descriptionSuggestions, setDescriptionSuggestions] = useState<DescriptionSuggestion[]>([]);
    const [loadingDescriptions, setLoadingDescriptions] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [hasGeneratedQuiz, setHasGeneratedQuiz] = useState(false);

    const description = watch("description");
    const productTypeId = watch("productTypeId");
    const isQuizType = productTypeId === PRODUCT_TYPES.QUIZ; // Quiz type

    // Set default company to user's own company for admin/sales
    React.useEffect(() => {
        if ((formData.role === "Admin" || formData.role === "Sales") && formData.companyId && !watch("companyId")) {
            setValue("companyId", formData.companyId);
        }
    }, [formData.role, formData.companyId, setValue, watch]);

    const handleImproveDescription = async () => {
        if (!description?.trim()) {
            toast.error("Please enter a product description first");
            return;
        }

        setLoadingDescriptions(true);
        try {
            const suggestions = await assistantApi.improveCaptions(description);

            // Convert to DescriptionSuggestion format
            const formattedSuggestions: DescriptionSuggestion[] = suggestions.map((text: string, index: number) => ({
                text,
                id: `suggestion-${index}-${Date.now()}`,
            }));

            setDescriptionSuggestions(formattedSuggestions);
            toast.success("AI suggestions generated successfully!");
        } catch (error) {
            console.error("Error improving description:", error);
            toast.error("Failed to generate description improvements. Please try again.");
        } finally {
            setLoadingDescriptions(false);
        }
    };

    const applySuggestion = (suggestion: DescriptionSuggestion) => {
        setValue("description", suggestion.text, { shouldValidate: true });
        toast.success("Description updated!");
    };

    const dismissSuggestions = () => {
        setDescriptionSuggestions([]);
    };
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
                        <p className="text-sm text-gray-600">Basic product details and description</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Selection - only for Admin/Sales */}
                    {(formData.role === "Admin" || formData.role === "Sales") && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Company <span className="text-red-500">*</span>
                            </label>
                            <select {...register("companyId", { required: "Company is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                <option value="">Select Company</option>
                                {formData.companies.map((company) => (
                                    <option key={company.Value} value={company.Value}>
                                        {company.Text}
                                    </option>
                                ))}
                            </select>
                            {errors.companyId && (
                                <p className="text-red-600 text-sm flex items-center gap-1">
                                    <span className="text-xs text-red-500">⚠</span>
                                    {errors.companyId.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Product Type */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Product Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register("productTypeId", {
                                required: "Product type is required",
                                valueAsNumber: true,
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={isShopifyProduct}
                        >
                            <option value="">Select Type</option>
                            {formData.productTypes.map((type) => (
                                <option key={type.Value} value={type.Value}>
                                    {type.Text}
                                </option>
                            ))}
                        </select>
                        {errors.productTypeId && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                {errors.productTypeId.message}
                            </p>
                        )}
                    </div>

                    {/* Product Name / Quiz Name */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {isQuizType ? "Quiz Name" : "Product Name"} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("name", {
                                required: isQuizType ? "Quiz name is required" : "Product name is required",
                                maxLength: { value: 100, message: "Name cannot exceed 100 characters" },
                            })}
                            placeholder={isQuizType ? "Enter a descriptive quiz name" : "Enter a descriptive product name"}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        {errors.name && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select {...register("isActive")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    {/* AI Quiz Generator - Show for Quiz products only */}
                    {isQuizType && (
                        <div className="md:col-span-2 space-y-2">
                            <div className="flex items-center gap-4">
                                <Button
                                    type="button"
                                    onClick={() => setShowQuizModal(true)}
                                    variant="outline"
                                    className="flex items-center space-x-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                >
                                    <Brain className="h-4 w-4" />
                                    <span>Generate a quiz for me</span>
                                </Button>
                                {hasGeneratedQuiz && (
                                    <Button
                                        type="button"
                                        onClick={() => setShowQuizModal(true)}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center space-x-2 text-purple-600 border-purple-200"
                                    >
                                        <span>Regenerate with other topics</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Description / Quiz Question */}
                    <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">
                                {isQuizType ? "Quiz Question" : "Product Description"} <span className="text-red-500">*</span>
                            </label>
                            {!isQuizType && (
                                <Button type="button" onClick={handleImproveDescription} disabled={loadingDescriptions || !description?.trim()} variant="outline" size="sm" className="flex items-center space-x-1 text-xs relative">
                                    {loadingDescriptions ? (
                                        <>
                                            <LoadingSpinner />
                                            <span>Improving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-3 w-3" />
                                            <span>Improve with AI</span>
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                        <div className="relative">
                            <textarea
                                {...register("description", {
                                    maxLength: { value: 500, message: "Description cannot exceed 500 characters" },
                                    required: isQuizType ? "Quiz question is required" : "Product description is required",
                                })}
                                rows={4}
                                placeholder={isQuizType ? "Enter your quiz question..." : "Describe your product features, benefits, and specifications..."}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                <Lightbulb className="h-3 w-3 text-blue-500 inline mr-1" />Tip: {isQuizType ? "A clear question helps users understand what they need to answer" : "A detailed description helps customers understand your product"}
                            </div>
                        </div>
                        {errors.description && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                {errors.description.message}
                            </p>
                        )}

                        {/* Loading Overlay for AI Generation */}
                        {loadingDescriptions && (
                            <div className="mt-3 relative">
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center justify-center space-x-3">
                                        <LoadingSpinner />
                                        <div className="text-sm">
                                            <p className="font-medium text-purple-700">✨ AI is generating suggestions...</p>
                                            <p className="text-xs text-purple-600 mt-1">This may take a few seconds</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AI Suggestions */}
                        {descriptionSuggestions.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-purple-700 flex items-center">
                                        <Wand2 className="h-4 w-4 mr-1" />
                                        AI Suggestions ({descriptionSuggestions.length})
                                    </h4>
                                    <Button type="button" variant="outline" size="sm" onClick={dismissSuggestions} className="flex items-center space-x-1 text-xs">
                                        <X className="h-3 w-3" />
                                        <span>Dismiss All</span>
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    <p className="text-xs text-purple-600 mb-3 bg-purple-25 p-2 rounded border border-purple-100">
                                        💡 <strong>Tip:</strong> Click "Use" to apply any suggestion. You can try different ones - suggestions will stay visible for comparison.
                                    </p>
                                    {descriptionSuggestions.map((suggestion, index) => (
                                        <div key={suggestion.id} className="group bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 cursor-pointer hover:from-purple-100 hover:to-blue-100 hover:border-purple-300 transition-all duration-200 hover:shadow-sm" onClick={() => applySuggestion(suggestion)}>
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
                                                    className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-xs group-hover:scale-105 transition-transform"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        applySuggestion(suggestion);
                                                    }}
                                                >
                                                    <Check className="h-3 w-3" />
                                                    <span>Use</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Quiz Generator Modal */}
            <QuizGeneratorModal
                isOpen={showQuizModal}
                onClose={() => setShowQuizModal(false)}
                onQuizGenerated={(quizData) => {
                    // Populate the form with generated quiz data
                    setValue("description", quizData.Question, { shouldValidate: true });

                    // Update quiz settings with generated answers
                    const answers = [
                        { id: Date.now() + 1, text: quizData.A, isCorrect: quizData.Answer === 'A' },
                        { id: Date.now() + 2, text: quizData.B, isCorrect: quizData.Answer === 'B' },
                        { id: Date.now() + 3, text: quizData.C, isCorrect: quizData.Answer === 'C' },
                        { id: Date.now() + 4, text: quizData.D, isCorrect: quizData.Answer === 'D' },
                    ];

                    setValue("quizSettings", {
                        mustAnswer: false,
                        answers: answers
                    }, { shouldValidate: true });

                    setHasGeneratedQuiz(true);
                    toast.success("Quiz generated successfully!");
                }}
            />
        </div>
    );
};

export default GeneralInformationSection;
