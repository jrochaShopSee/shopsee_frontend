"use client";

import React, { useState, useCallback } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { Download, Upload, File, X, CheckCircle } from "lucide-react";
import { AddProductFormData } from "../types";

interface DigitalProductSectionProps {
    register: UseFormRegister<AddProductFormData>;
    errors: FieldErrors<AddProductFormData>;
    watch: UseFormWatch<AddProductFormData>;
}

const DigitalProductSection: React.FC<DigitalProductSectionProps> = ({
    // register,
    // errors,
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setUploadedFile(file);
        // Simulate upload progress
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 100);
    };

    const removeFile = () => {
        setUploadedFile(null);
        setUploadProgress(0);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                        <Download className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Digital Product Files</h2>
                        <p className="text-sm text-gray-600">Upload files that customers can download</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* File Upload Area */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Digital Product File <span className="text-red-500">*</span>
                    </label>
                    
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            dragActive 
                                ? 'border-cyan-400 bg-cyan-50' 
                                : 'border-gray-300 hover:border-cyan-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {uploadedFile ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <File className="h-8 w-8 text-gray-600" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="ml-auto p-1 text-red-500 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                
                                {/* Upload Progress */}
                                {uploadProgress < 100 ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Upload Complete</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div>
                                    <p className="text-lg font-medium text-gray-900">Drop your file here</p>
                                    <p className="text-sm text-gray-600">or click to browse</p>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>Supported formats: PDF, ZIP, DOCX, MP4, MP3, and more</p>
                                    <p>Maximum file size: 100MB</p>
                                </div>
                            </div>
                        )}
                        
                        <input
                            type="file"
                            // {...register("digitalFile", {
                            //     required: "Digital file is required for digital products"
                            // })}
                            onChange={handleChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".pdf,.zip,.doc,.docx,.mp4,.mp3,.avi,.mov,.jpg,.jpeg,.png"
                        />
                    </div>
                    
                    {/* {errors.digitalFile && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            {errors.digitalFile.message}
                        </p>
                    )} */}
                </div>

                {/* Max Downloads Setting */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Maximum Downloads per Purchase
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            max="999"
                            // {...register("maxDownloads", {
                            //     min: { value: 1, message: "Must allow at least 1 download" },
                            //     max: { value: 999, message: "Maximum 999 downloads allowed" }
                            // })}
                            placeholder="Unlimited"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                        />
                    </div>
                    {/* {errors.maxDownloads && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            {errors.maxDownloads.message}
                        </p>
                    )} */}
                    <p className="text-xs text-gray-500">
                        💡 Leave empty for unlimited downloads. Set a number to limit how many times customers can download this file.
                    </p>
                </div>

                {/* Download Instructions */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                        <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Customer Download Process</h4>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Customers will receive download links after successful payment</li>
                                <li>• Download links will be valid for 7 days by default</li>
                                <li>• Files are securely stored and tracked for analytics</li>
                                <li>• Download attempts are logged and limited per purchase</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalProductSection;