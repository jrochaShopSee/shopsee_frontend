"use client";

import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Sparkles, Wand2, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { AddProductFormData } from "../add/types";
import { assistantApi } from "@/app/services/assistantApi";

interface AIFeaturesSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    watch: UseFormWatch<AddProductFormData>;
    setValue: UseFormSetValue<AddProductFormData>;
}

interface DescriptionSuggestion {
    text: string;
    id: string;
}

// interface QuizData {
//     question: string;
//     answers: Array<{
//         text: string;
//         isCorrect: boolean;
//     }>;
// }

const AIFeaturesSection: React.FC<AIFeaturesSectionProps> = ({
    watch,
    setValue
}) => {
    const [descriptionSuggestions, setDescriptionSuggestions] = useState<DescriptionSuggestion[]>([]);
    const [loadingDescriptions, setLoadingDescriptions] = useState(false);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [quizTopics, setQuizTopics] = useState<string>("");
    
    const description = watch("description");
    const productTypeId = watch("productTypeId");
    const isQuizType = productTypeId === 7; // Quiz type

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
            console.error('Error improving description:', error);
            toast.error("Failed to generate description improvements. Please try again.");
        } finally {
            setLoadingDescriptions(false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!quizTopics.trim()) {
            toast.error("Please enter quiz topics first");
            return;
        }

        const topics = quizTopics.split(',').map(topic => topic.trim()).filter(Boolean);
        if (topics.length === 0) {
            toast.error("Please enter at least one quiz topic");
            return;
        }

        setLoadingQuiz(true);
        try {
            const quizData = await assistantApi.generateQuiz(topics);

            // Update the form with the generated quiz
            setValue("description", quizData.Question, { shouldValidate: true });

            // Convert quiz data to answers array
            const answers = [
                { id: 0, text: quizData.A, isCorrect: quizData.Answer === 'A' },
                { id: 1, text: quizData.B, isCorrect: quizData.Answer === 'B' },
                { id: 2, text: quizData.C, isCorrect: quizData.Answer === 'C' },
                { id: 3, text: quizData.D, isCorrect: quizData.Answer === 'D' }
            ];

            setValue("quizSettings", {
                mustAnswer: false,
                answers: answers
            }, { shouldValidate: true });

            toast.success("Quiz generated successfully!");
        } catch (error) {
            console.error('Error generating quiz:', error);
            toast.error("Failed to generate quiz. Please try again.");
        } finally {
            setLoadingQuiz(false);
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
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">AI-Powered Features</h2>
                        <p className="text-sm text-gray-600">
                            {isQuizType ? "Generate quiz questions automatically" : "Improve your product description with AI"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Description Improvement - Show for all types except Quiz */}
                {!isQuizType && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 flex items-center">
                                <Wand2 className="h-4 w-4 mr-2 text-purple-500" />
                                AI Description Improver
                            </h3>
                            <Button
                                type="button"
                                onClick={handleImproveDescription}
                                disabled={loadingDescriptions || !description?.trim()}
                                className="flex items-center space-x-2"
                                size="sm"
                            >
                                {loadingDescriptions ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>Improving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        <span>Improve Description</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Description Suggestions */}
                        {descriptionSuggestions.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-700">AI Suggestions</h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={dismissSuggestions}
                                        className="flex items-center space-x-1"
                                    >
                                        <X className="h-3 w-3" />
                                        <span>Dismiss</span>
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {descriptionSuggestions.map((suggestion) => (
                                        <div
                                            key={suggestion.id}
                                            className="bg-purple-50 border border-purple-200 rounded-lg p-3 cursor-pointer hover:bg-purple-100 transition-colors"
                                            onClick={() => applySuggestion(suggestion)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <p className="text-sm text-gray-800 flex-1 mr-3">
                                                    {suggestion.text}
                                                </p>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700"
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
                )}

                {/* Quiz Generator - Show only for Quiz type */}
                {isQuizType && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 flex items-center">
                                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                                AI Quiz Generator
                            </h3>
                        </div>

                        {/* Topics Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Quiz Topics
                            </label>
                            <input
                                type="text"
                                value={quizTopics}
                                onChange={(e) => setQuizTopics(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="e.g., History, Science, Geography (comma-separated)"
                            />
                            <p className="text-xs text-gray-500">
                                💡 Enter topics separated by commas. AI will generate a quiz question and answers.
                            </p>
                        </div>

                        {/* Generate Button */}
                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                onClick={handleGenerateQuiz}
                                disabled={loadingQuiz || !quizTopics.trim()}
                                className="flex items-center space-x-2"
                            >
                                {loadingQuiz ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>Generating Quiz...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        <span>Generate Quiz</span>
                                    </>
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setQuizTopics("")}
                                disabled={loadingQuiz}
                                className="flex items-center space-x-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Clear Topics</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 mr-3" />
                        <div>
                            <h4 className="text-sm font-medium text-purple-900 mb-1">
                                {isQuizType ? "AI Quiz Generator" : "AI Description Improver"}
                            </h4>
                            <div className="text-xs text-purple-700 space-y-1">
                                {isQuizType ? (
                                    <>
                                        <p>• Enter topics to generate engaging quiz questions automatically</p>
                                        <p>• AI creates the question and multiple choice answers with correct answer marked</p>
                                        <p>• Generated content can be edited and customized after creation</p>
                                    </>
                                ) : (
                                    <>
                                        <p>• AI analyzes your description and suggests improvements</p>
                                        <p>• Get multiple variations to choose from</p>
                                        <p>• Helps create more engaging and professional product descriptions</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIFeaturesSection;