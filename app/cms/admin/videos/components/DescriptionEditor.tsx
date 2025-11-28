"use client";

import React, { useState, useMemo } from "react";
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from "react-hook-form";
import { Sparkles, CheckCircle, X } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { assistantApi } from "@/app/services/assistantApi";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface DescriptionEditorProps {
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors<FieldValues>;
    value?: string;
    setValue?: UseFormSetValue<FieldValues>;
    fieldName?: string;
}

export const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
    register,
    errors,
    value = "",
    setValue,
    fieldName = "description",
}) => {
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const hasContent = value && value.trim().length > 0;

    // Quill modules configuration
    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ color: [] }, { background: [] }],
                ["link"],
                ["clean"],
            ],
        }),
        []
    );

    // Quill formats
    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "color",
        "background",
        "link",
    ];

    // Handle AI improvement
    const handleAiImprove = async () => {
        if (!hasContent) {
            toast.warning("Please enter a description first");
            return;
        }

        setIsAiLoading(true);
        setShowSuggestions(false);

        try {
            // Strip HTML tags for AI processing
            const plainText = value.replace(/<[^>]*>/g, "");
            const suggestions = await assistantApi.improveDescription(plainText);

            if (suggestions && suggestions.length > 0) {
                setAiSuggestions(suggestions);
                setShowSuggestions(true);
                toast.success(`Generated ${suggestions.length} improved descriptions`);
            } else {
                toast.info("No suggestions available at this time");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to improve description");
            console.error("AI improvement error:", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Handle selecting an AI suggestion
    const handleSelectSuggestion = (suggestion: string) => {
        if (setValue) {
            setValue(fieldName, suggestion);
        }
        setShowSuggestions(false);
        toast.success("Description updated with AI suggestion");
    };

    // Handle editor content change
    const handleEditorChange = (content: string) => {
        if (setValue) {
            setValue(fieldName, content);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>

            <div className="space-y-4">
                {/* React Quill Editor */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Description
                    </label>

                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <ReactQuill
                            theme="snow"
                            value={value}
                            onChange={handleEditorChange}
                            modules={modules}
                            formats={formats}
                            placeholder="Enter a detailed description of your video..."
                            className="bg-white"
                            style={{ height: "250px" }}
                        />
                    </div>

                    {/* Hidden input for form registration */}
                    <input type="hidden" {...register(fieldName)} value={value} />

                    {errors[fieldName] && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors[fieldName]?.message as string}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Provide a clear and engaging description to help viewers understand your video
                        content.
                    </p>
                </div>

                {/* AI Improve Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={handleAiImprove}
                        disabled={!hasContent || isAiLoading}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                    >
                        {isAiLoading ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                <span>Improving...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                <span>Improve my video description</span>
                            </>
                        )}
                    </button>
                </div>

                {/* AI Suggestions */}
                {showSuggestions && aiSuggestions.length > 0 && (
                    <div className="border-2 border-purple-200 rounded-lg bg-purple-50 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-600" />
                                AI-Generated Suggestions
                            </h4>
                            <button
                                type="button"
                                onClick={() => setShowSuggestions(false)}
                                className="text-purple-600 hover:text-purple-800 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {aiSuggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-purple-200 rounded-lg p-3 hover:border-purple-400 transition-colors cursor-pointer group"
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-semibold">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {suggestion}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <CheckCircle className="h-5 w-5 text-purple-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-purple-700 mt-3">
                            Click on a suggestion to use it, or continue editing your original description.
                        </p>
                    </div>
                )}
            </div>

            {/* Custom styling for Quill editor */}
            <style jsx global>{`
                .ql-container {
                    font-family: inherit;
                    font-size: 14px;
                }
                .ql-editor {
                    min-height: 200px;
                }
                .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: normal;
                }
            `}</style>
        </div>
    );
};
