"use client";

import React, { useState, useMemo } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, FieldValues } from "react-hook-form";
import { AlertTriangle, Link as LinkIcon, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface SurveySectionProps {
    register: UseFormRegister<FieldValues>;
    setValue: UseFormSetValue<FieldValues>;
    watch: UseFormWatch<FieldValues>;
    errors: FieldErrors<FieldValues>;
    videoDuration?: number;
}

export const SurveySection: React.FC<SurveySectionProps> = ({
    register,
    setValue,
    watch,
    errors,
    videoDuration,
}) => {
    const [hasSurvey, setHasSurvey] = useState(false);
    const [surveyContent, setSurveyContent] = useState("");

    const consentSurveyTime = watch("consentSurveyTime");

    // Quill modules
    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link"],
                ["clean"],
            ],
        }),
        []
    );

    const formats = ["header", "bold", "italic", "underline", "list", "link"];

    const handleSurveyContentChange = (content: string) => {
        setSurveyContent(content);
        setValue("consentSurvey", content);
    };

    const hasTimeError = consentSurveyTime && videoDuration && consentSurveyTime >= videoDuration;

    return (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {/* Enable Survey Toggle */}
            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    checked={hasSurvey}
                    onChange={(e) => setHasSurvey(e.target.checked)}
                    className="h-4 w-4 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900 cursor-pointer block">
                        Survey
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                        Show a survey to viewers during or after the video
                    </p>
                </div>
            </div>

            {hasSurvey && (
                <div className="ml-6 space-y-4">
                    {/* Survey Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Survey Content
                        </label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                            <ReactQuill
                                value={surveyContent}
                                onChange={handleSurveyContentChange}
                                modules={modules}
                                formats={formats}
                                placeholder="Enter your survey content or questions..."
                                style={{ minHeight: "150px" }}
                            />
                        </div>
                    </div>

                    {/* Survey Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            External Survey Link (Optional)
                        </label>
                        <input
                            type="url"
                            {...register("consentSurveyLink", {
                                pattern: {
                                    value: /^https?:\/\/.+/,
                                    message: "Please enter a valid URL starting with http:// or https://",
                                },
                            })}
                            placeholder="https://example.com/survey"
                            maxLength={250}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        {errors.consentSurveyLink && (
                            <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                                <AlertTriangle className="h-4 w-4" />
                                <span>{errors.consentSurveyLink.message as string}</span>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Optionally link to an external survey platform
                        </p>
                    </div>

                    {/* Survey Timing */}
                    <div className="p-3 bg-white rounded-lg space-y-3">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Survey Display Time (seconds)
                        </label>
                        <input
                            type="number"
                            {...register("consentSurveyTime", {
                                valueAsNumber: true,
                                min: { value: 1, message: "Time must be at least 1 second" },
                            })}
                            placeholder="e.g., 8"
                            step="1"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        {hasTimeError && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                <span>
                                    Time must be less than video duration
                                    {videoDuration && ` (${videoDuration}s)`}
                                </span>
                            </div>
                        )}
                        {errors.consentSurveyTime && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                <span>{errors.consentSurveyTime.message as string}</span>
                            </div>
                        )}
                        <p className="text-xs text-gray-500">
                            Specify when the survey should appear during video playback
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
