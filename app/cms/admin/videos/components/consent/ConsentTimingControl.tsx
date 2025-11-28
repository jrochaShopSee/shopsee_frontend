"use client";

import React, { useState } from "react";
import { UseFormRegister, UseFormWatch, FieldErrors, FieldValues } from "react-hook-form";
import { Clock, AlertTriangle } from "lucide-react";

interface ConsentTimingControlProps {
    register: UseFormRegister<FieldValues>;
    watch: UseFormWatch<FieldValues>;
    errors: FieldErrors<FieldValues>;
    fieldName: string;
    label: string;
    helpText?: string;
    videoDuration?: number;
}

export const ConsentTimingControl: React.FC<ConsentTimingControlProps> = ({
    register,
    watch,
    errors,
    fieldName,
    label,
    helpText,
    videoDuration,
}) => {
    const [enabled, setEnabled] = useState(false);
    const timeValue = watch(fieldName);

    const hasError = timeValue && videoDuration && timeValue >= videoDuration;

    return (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="h-4 w-4 mt-0.5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 cursor-pointer block">
                        {label}
                    </label>
                    {helpText && (
                        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
                    )}
                </div>
            </div>

            {enabled && (
                <div className="ml-6 space-y-2">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                            Time (seconds)
                        </label>
                    </div>
                    <input
                        type="number"
                        {...register(fieldName, {
                            valueAsNumber: true,
                            min: { value: 1, message: "Time must be at least 1 second" },
                        })}
                        placeholder="e.g., 8"
                        step="1"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    />
                    {hasError && (
                        <div className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            <span>
                                Time must be less than video duration
                                {videoDuration && ` (${videoDuration}s)`}
                            </span>
                        </div>
                    )}
                    {errors[fieldName] && (
                        <div className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{errors[fieldName]?.message as string}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
