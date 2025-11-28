"use client";

import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Brain, Sparkles, Zap, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { AddProductFormData } from "../types";
import { PRODUCT_TYPES } from "@/app/types/Product";

interface AIFeaturesSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    watch: UseFormWatch<AddProductFormData>;
    setValue: UseFormSetValue<AddProductFormData>;
}

const AIFeaturesSection: React.FC<AIFeaturesSectionProps> = ({
    watch,
    setValue,
}) => {
    const [isImprovingDescription, setIsImprovingDescription] = useState(false);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);
    const [showQuizGenerator, setShowQuizGenerator] = useState(false);
    
    const productTypeId = watch("productTypeId");
    const description = watch("description");
    const productName = watch("name");

    const isQuizProduct = productTypeId === PRODUCT_TYPES.QUIZ;
    const canImproveDescription = description && description.trim().length > 0;

    const handleImproveDescription = async () => {
        if (!canImproveDescription || isImprovingDescription) return;
        
        setIsImprovingDescription(true);
        try {
            // TODO: Implement AI description improvement API call
            // const response = await aiApi.improveDescription({ 
            //     productName, 
            //     description,
            //     productType: productTypeId 
            // });
            
            // Mock suggestions for now
            setTimeout(() => {
                const mockSuggestions = [
                    "🌟 Enhanced: " + description + " - Premium quality with exceptional value.",
                    "✨ Professional: " + description + " - Perfect for discerning customers.",
                    "🎯 Marketing: " + description + " - The ultimate solution you've been looking for."
                ];
                setDescriptionSuggestions(mockSuggestions);
                setIsImprovingDescription(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to improve description:", error);
            setIsImprovingDescription(false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!productName || isGeneratingQuiz) return;
        
        setIsGeneratingQuiz(true);
        setShowQuizGenerator(true);
        
        try {
            // TODO: Implement AI quiz generation API call
            // const response = await aiApi.generateQuiz({ 
            //     topic: productName,
            //     difficulty: 'medium'
            // });
            
            setTimeout(() => {
                setIsGeneratingQuiz(false);
            }, 3000);
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            setIsGeneratingQuiz(false);
        }
    };

    const applySuggestion = (suggestion: string) => {
        setValue("description", suggestion.replace(/^[🌟✨🎯]\s*[^:]*:\s*/, ""));
        setDescriptionSuggestions([]);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Brain className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">AI-Powered Features</h2>
                        <p className="text-sm text-gray-600">Enhance your product with AI assistance</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* AI Description Improver */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                AI Description Improver
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Let our AI enhance your product description to make it more engaging and professional.
                            </p>
                            <Button
                                type="button"
                                onClick={handleImproveDescription}
                                disabled={!canImproveDescription || isImprovingDescription}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isImprovingDescription ? (
                                    <>
                                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                                        Improving...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Improve Description
                                    </>
                                )}
                            </Button>
                            {!canImproveDescription && (
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 Add a product description first to use this feature
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description Suggestions */}
                    {descriptionSuggestions.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">AI Suggestions:</h4>
                            {descriptionSuggestions.map((suggestion, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                    <p className="text-sm text-gray-700 mb-2">{suggestion}</p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => applySuggestion(suggestion)}
                                    >
                                        Use This
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Quiz Generator - Only for Quiz Products */}
                {isQuizProduct && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <HelpCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    AI Quiz Generator
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Generate quiz questions automatically based on your quiz topic and name.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={handleGenerateQuiz}
                                        disabled={!productName || isGeneratingQuiz}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isGeneratingQuiz ? (
                                            <>
                                                <Zap className="h-4 w-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <HelpCircle className="h-4 w-4 mr-2" />
                                                Generate Quiz
                                            </>
                                        )}
                                    </Button>
                                    {showQuizGenerator && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleGenerateQuiz}
                                            disabled={isGeneratingQuiz}
                                        >
                                            Regenerate
                                        </Button>
                                    )}
                                </div>
                                {!productName && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        💡 Add a quiz name first to use this feature
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quiz Generator Modal/Content */}
                        {showQuizGenerator && (
                            <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="h-4 w-4 text-gray-600" />
                                    <h4 className="text-sm font-medium text-gray-700">Generated Quiz Preview</h4>
                                </div>
                                {isGeneratingQuiz ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                        <p className="ml-2 text-sm text-gray-600">Generating quiz questions...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="bg-gray-50 rounded p-3">
                                            <p className="text-sm font-medium text-gray-700">Sample Question 1:</p>
                                            <p className="text-sm text-gray-600">What is the main benefit of this {productName}?</p>
                                        </div>
                                        <div className="bg-gray-50 rounded p-3">
                                            <p className="text-sm font-medium text-gray-700">Sample Question 2:</p>
                                            <p className="text-sm text-gray-600">How would you rate your experience with {productName}?</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            💡 Complete quiz management will be available after saving the product
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIFeaturesSection;