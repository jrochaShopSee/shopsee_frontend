"use client";

import React, { useState } from "react";
import { Brain, X } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { assistantApi } from "@/app/services/assistantApi";

interface QuizGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onQuizGenerated: (quizData: {
        Question: string;
        A: string;
        B: string;
        C: string;
        D: string;
        Answer: string;
    }) => void;
}

const QuizGeneratorModal: React.FC<QuizGeneratorModalProps> = ({
    isOpen,
    onClose,
    onQuizGenerated
}) => {
    const [topics, setTopics] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastTopics, setLastTopics] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!topics.trim()) {
            toast.error("Please enter at least one topic");
            return;
        }

        setLoading(true);
        try {
            const topicArray = topics.split(",").map(t => t.trim()).filter(t => t.length > 0);
            setLastTopics(topicArray);

            const quizData = await assistantApi.generateQuiz(topicArray);
            onQuizGenerated(quizData);
            onClose();
            setTopics(""); // Clear topics after successful generation
        } catch (error) {
            console.error("Error generating quiz:", error);
            toast.error("Failed to generate quiz. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateWithSameTopics = async () => {
        if (lastTopics.length === 0) {
            toast.error("No previous topics found");
            return;
        }

        setLoading(true);
        try {
            const quizData = await assistantApi.generateQuiz(lastTopics);
            onQuizGenerated(quizData);
            onClose();
        } catch (error) {
            console.error("Error regenerating quiz:", error);
            toast.error("Failed to regenerate quiz. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Brain className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">ShopSee AI Quiz Generator</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="topics" className="block text-sm font-medium text-gray-700 mb-2">
                                Please enter at least one topic for your question, if there is more than one, separate them with a comma ","
                            </label>
                            <input
                                id="topics"
                                type="text"
                                value={topics}
                                onChange={(e) => setTopics(e.target.value)}
                                placeholder="e.g., History, Science, Technology"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                disabled={loading}
                            />
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center justify-center space-x-3">
                                    <LoadingSpinner />
                                    <div className="text-sm">
                                        <p className="font-medium text-purple-700">🧠 AI is generating your quiz...</p>
                                        <p className="text-xs text-purple-600 mt-1">This may take a few seconds</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 space-x-3">
                    <div className="flex space-x-3">
                        <Button
                            type="button"
                            onClick={handleGenerate}
                            disabled={loading || !topics.trim()}
                            className="flex items-center space-x-2"
                        >
                            <Brain className="h-4 w-4" />
                            <span>Generate Quiz</span>
                        </Button>

                        {lastTopics.length > 0 && (
                            <Button
                                type="button"
                                onClick={handleRegenerateWithSameTopics}
                                disabled={loading}
                                variant="outline"
                                className="flex items-center space-x-2"
                            >
                                <span>Regenerate with Same Topics</span>
                            </Button>
                        )}
                    </div>

                    <Button
                        type="button"
                        onClick={onClose}
                        variant="outline"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QuizGeneratorModal;