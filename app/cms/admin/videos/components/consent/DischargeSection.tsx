"use client";

import React, { useState } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, FieldValues } from "react-hook-form";
import { FileText, Upload, X, Info } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import axiosClient from "@/app/utils/axiosClient";
import { FileUploadResponse } from "./types";

interface DischargeSectionProps {
    register: UseFormRegister<FieldValues>;
    setValue: UseFormSetValue<FieldValues>;
    watch: UseFormWatch<FieldValues>;
    errors: FieldErrors<FieldValues>;
    videoDuration?: number;
}

export const DischargeSection: React.FC<DischargeSectionProps> = ({
    register,
    setValue,
    watch,
    videoDuration,
}) => {
    const [hasDischarge, setHasDischarge] = useState(false);
    const [dischargeFileName, setDischargeFileName] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [customDischargeTime, setCustomDischargeTime] = useState(false);

    const consentDischargeTime = watch("consentDischargeTime");

    // Handle discharge PDF upload
    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setIsUploading(true);
        try {
            const response = await axiosClient.post<FileUploadResponse>(
                "/api/consent/discharge/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.status === "success" && response.data.url) {
                setValue("consentDischarge", response.data.url);
                setDischargeFileName(file.name);
                toast.success("Discharge PDF uploaded successfully");
            } else {
                toast.error(response.data.message || "Failed to upload discharge PDF");
            }
        } catch (error) {
            console.error("Error uploading discharge:", error);
            toast.error("Failed to upload discharge PDF");
        } finally {
            setIsUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        multiple: false,
    });

    const handleRemoveDischarge = () => {
        setValue("consentDischarge", null);
        setDischargeFileName(null);
    };

    const hasTimeError = consentDischargeTime && videoDuration && consentDischargeTime >= videoDuration;

    return (
        <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            {/* Enable Discharge Toggle */}
            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    checked={hasDischarge}
                    onChange={(e) => setHasDischarge(e.target.checked)}
                    className="h-4 w-4 mt-0.5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900 cursor-pointer block">
                        Discharge
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                        Require viewers to review and accept a discharge document
                    </p>
                </div>
            </div>

            {hasDischarge && (
                <div className="ml-6 space-y-4">
                    {/* Upload Discharge PDF */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Discharge PDF
                        </label>

                        {!dischargeFileName ? (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                    isDragActive
                                        ? "border-orange-500 bg-orange-100"
                                        : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                                }`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                                {isDragActive ? (
                                    <p className="text-sm text-orange-600">Drop the discharge PDF here...</p>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Drag and drop your discharge PDF file here
                                        </p>
                                        <p className="text-xs text-gray-500">or click to browse</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-white border border-orange-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                    <span className="text-sm text-gray-900 font-medium">{dischargeFileName}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveDischarge}
                                    className="p-1 hover:bg-orange-100 rounded transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                        )}

                        {isUploading && (
                            <div className="text-center py-3">
                                <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-orange-600 border-r-transparent"></div>
                                <p className="text-xs text-gray-600 mt-2">Uploading...</p>
                            </div>
                        )}
                    </div>

                    {/* Discharge Options */}
                    {dischargeFileName && (
                        <>
                            {/* Optional Discharge */}
                            <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                                <input
                                    type="checkbox"
                                    {...register("consentDischargeOptional")}
                                    className="h-4 w-4 mt-0.5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700 cursor-pointer block">
                                        Discharge is Optional
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Info className="h-3 w-3" />
                                        Viewers can close the discharge popup without agreeing and proceed to sign consent
                                    </p>
                                </div>
                            </div>

                            {/* Custom Discharge Timing */}
                            <div className="space-y-3 p-3 bg-white rounded-lg">
                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        checked={customDischargeTime}
                                        onChange={(e) => setCustomDischargeTime(e.target.checked)}
                                        className="h-4 w-4 mt-0.5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer block">
                                            Choose when discharge will appear
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            If unchecked, discharge appears before the consent document
                                        </p>
                                    </div>
                                </div>

                                {customDischargeTime && (
                                    <div className="ml-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Discharge Time (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            {...register("consentDischargeTime", {
                                                valueAsNumber: true,
                                                min: { value: 1, message: "Time must be at least 1 second" },
                                            })}
                                            placeholder="e.g., 8"
                                            step="1"
                                            min="1"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                        />
                                        {hasTimeError && (
                                            <p className="text-red-600 text-xs mt-1">
                                                Time must be less than video duration {videoDuration && `(${videoDuration}s)`}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
