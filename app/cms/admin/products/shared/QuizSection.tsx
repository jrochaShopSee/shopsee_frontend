"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Brain, Plus, Trash2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { AddProductFormData, QuizAnswer } from "../add/types";

interface QuizSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    watch: UseFormWatch<AddProductFormData>;
    setValue: UseFormSetValue<AddProductFormData>;
}

const QuizSection: React.FC<QuizSectionProps> = ({ watch, setValue }) => {
    console.log("Rendering QuizSection");
    const quizSettings = watch("quizSettings");
    const answers = quizSettings?.answers || [];
    const mustAnswer = quizSettings?.mustAnswer || false;

    const addAnswer = () => {
        const newAnswer: QuizAnswer = {
            id: Date.now(),
            text: "",
            isCorrect: false,
        };

        const updatedAnswers = [...answers, newAnswer];
        setValue(
            "quizSettings",
            {
                ...quizSettings,
                mustAnswer,
                answers: updatedAnswers,
            },
            { shouldValidate: true }
        );
    };

    const removeAnswer = (answerId: number) => {
        if (answers.length <= 2) {
            return; // Minimum 2 answers required
        }

        const updatedAnswers = answers.filter((answer) => answer.id !== answerId);
        setValue(
            "quizSettings",
            {
                ...quizSettings,
                mustAnswer,
                answers: updatedAnswers,
            },
            { shouldValidate: true }
        );
    };

    const updateAnswer = (answerId: number, field: "text" | "isCorrect", value: string | boolean) => {
        const updatedAnswers = answers.map((answer) =>
            answer.id === answerId
                ? { ...answer, [field]: value }
                : answer // Allow multiple correct answers
        );

        setValue(
            "quizSettings",
            {
                ...quizSettings,
                mustAnswer,
                answers: updatedAnswers,
            },
            { shouldValidate: true }
        );
    };

    const toggleMustAnswer = () => {
        setValue(
            "quizSettings",
            {
                ...quizSettings,
                mustAnswer: !mustAnswer,
                answers,
            },
            { shouldValidate: true }
        );
    };

    // Validation helpers
    const hasCorrectAnswer = answers.some((answer) => answer.isCorrect);
    const hasEmptyAnswers = answers.some((answer) => !answer.text.trim());
    const hasMinimumAnswers = answers.length >= 2;

    // Initialize with default answers if none exist
    React.useEffect(() => {
        if (!quizSettings || answers.length === 0) {
            setValue(
                "quizSettings",
                {
                    mustAnswer: false,
                    answers: [
                        { id: 1, text: "", isCorrect: true },
                        { id: 2, text: "", isCorrect: false },
                        { id: 3, text: "", isCorrect: false },
                        { id: 4, text: "", isCorrect: false },
                    ],
                },
                { shouldValidate: true }
            );
        }
    }, [quizSettings, answers.length, setValue]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Quiz Settings</h2>
                        <p className="text-sm text-gray-600">Configure quiz answers and behavior</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Quiz Settings */}
                <div className="space-y-4">
                    {/* Must Answer Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Brain className="h-5 w-5 text-purple-500" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    Must Answer?
                                    <div className="relative group">
                                        <svg
                                            className="w-4 h-4 text-gray-400 hover:text-purple-500 cursor-help"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                            User must answer to keep watching the video.
                                        </div>
                                    </div>
                                </h3>
                                <p className="text-xs text-gray-600">Force users to answer before proceeding</p>
                            </div>
                        </div>
                        <button type="button" onClick={toggleMustAnswer} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${mustAnswer ? "bg-purple-600" : "bg-gray-200"}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mustAnswer ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                    </div>
                </div>

                {/* Quiz Answers */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">Quiz Answers</h3>
                        {answers.length < 4 && (
                            <Button
                                type="button"
                                onClick={addAnswer}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Answer</span>
                            </Button>
                        )}
                    </div>

                    {/* Validation Summary */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                            <div className="text-xs">
                                <h4 className="font-medium text-yellow-800 mb-1">Quiz Requirements:</h4>
                                <ul className="text-yellow-700 space-y-1">
                                    <li className={`flex items-center ${hasMinimumAnswers ? "text-green-700" : "text-red-700"}`}>
                                        {hasMinimumAnswers ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                        Minimum 2 answers ({answers.length}/2+)
                                    </li>
                                    <li className={`flex items-center ${hasCorrectAnswer ? "text-green-700" : "text-red-700"}`}>
                                        {hasCorrectAnswer ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                        At least 1 correct answer
                                    </li>
                                    <li className={`flex items-center ${!hasEmptyAnswers ? "text-green-700" : "text-red-700"}`}>
                                        {!hasEmptyAnswers ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                        All answers must have text
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Answer List */}
                    <div className="space-y-3">
                        {answers.map((answer, index) => (
                            <div key={answer.id} className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${answer.isCorrect ? "border-green-300 bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                                {/* Answer Number */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${answer.isCorrect ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"}`}>{index + 1}</div>

                                {/* Answer Text */}
                                <div className="flex-1">
                                    <input type="text" value={answer.text} onChange={(e) => updateAnswer(answer.id!, "text", e.target.value)} placeholder={`Answer ${index + 1}`} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${answer.text.trim() ? "border-gray-300" : "border-red-300 bg-red-50"}`} />
                                </div>

                                {/* Correct Answer Toggle */}
                                <div className="flex-shrink-0">
                                    <button type="button" onClick={() => updateAnswer(answer.id!, "isCorrect", !answer.isCorrect)} className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${answer.isCorrect ? "bg-green-100 text-green-800 border border-green-300" : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"}`} title={answer.isCorrect ? "Correct answer" : "Mark as correct"}>
                                        <Check className={`h-4 w-4 ${answer.isCorrect ? "text-green-600" : "text-gray-400"}`} />
                                        <span>{answer.isCorrect ? "Correct" : "Incorrect"}</span>
                                    </button>
                                </div>

                                {/* Remove Answer */}
                                <div className="flex-shrink-0">
                                    <button type="button" onClick={() => removeAnswer(answer.id!)} disabled={answers.length <= 2} className={`p-2 rounded-md transition-colors ${answers.length <= 2 ? "text-gray-300 cursor-not-allowed" : "text-red-500 hover:bg-red-50"}`} title={answers.length <= 2 ? "Minimum 2 answers required" : "Remove answer"}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <Brain className="h-5 w-5 text-purple-500 mt-0.5 mr-3" />
                        <div>
                            <h4 className="text-sm font-medium text-purple-900 mb-1">Quiz Configuration Tips</h4>
                            <ul className="text-xs text-purple-700 space-y-1">
                                <li>• Minimum 2 answers required, maximum 4 answers allowed</li>
                                <li>• At least one correct answer required (you can mark multiple)</li>
                                <li>• "Must Answer" forces users to respond before continuing</li>
                                <li>• Clear, concise answers work best for user engagement</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizSection;
