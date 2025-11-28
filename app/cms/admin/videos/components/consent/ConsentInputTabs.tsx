"use client";

import React, { useState, useMemo } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, FieldValues } from "react-hook-form";
import { FileText, Upload, Eye } from "lucide-react";
import dynamic from "next/dynamic";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import axiosClient from "@/app/utils/axiosClient";
import { DocuSignResponse, FileUploadResponse } from "./types";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface ConsentInputTabsProps {
    register: UseFormRegister<FieldValues>;
    setValue: UseFormSetValue<FieldValues>;
    watch: UseFormWatch<FieldValues>;
    errors: FieldErrors<FieldValues>;
    consentTemplateId?: string | null;
    onShowPreview: (url: string) => void;
}

export const ConsentInputTabs: React.FC<ConsentInputTabsProps> = ({
    setValue,
    onShowPreview,
}) => {
    const [activeTab, setActiveTab] = useState<"text" | "pdf">("text");
    const [textContent, setTextContent] = useState("");
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

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

    // Handle text editor change
    const handleTextChange = (content: string) => {
        setTextContent(content);
    };

    // Generate DocuSign preview from HTML
    const handleReviewTextDocument = async () => {
        const plainText = textContent.replace(/<[^>]*>/g, "").trim();
        if (!plainText) {
            toast.error("Please add content to your consent");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await axiosClient.post<DocuSignResponse>(
                "/api/consent/docusign/html",
                { htmlContent: textContent }
            );

            if (response.data.status === "success" && response.data.result) {
                setValue("consentTemplateId", response.data.result.envelopeId);
                onShowPreview(response.data.result.url);
            } else {
                toast.error("Failed to generate document preview");
            }
        } catch (error) {
            console.error("Error generating preview:", error);
            toast.error("Failed to generate document preview");
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle PDF upload
    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setIsGenerating(true);
        try {
            const response = await axiosClient.post<FileUploadResponse>(
                "/api/consent/docusign/PdfUpload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.status === "success" && response.data.envelopeId) {
                setValue("consentTemplateId", response.data.envelopeId);
                setUploadedFileName(file.name);
                toast.success("PDF uploaded successfully");

                // Fetch preview URL
                const previewResponse = await axiosClient.get<{ url: string }>(
                    `/api/consent/docusign?envelopeId=${response.data.envelopeId}`
                );
                onShowPreview(previewResponse.data.url);
            } else {
                toast.error(response.data.message || "Failed to upload PDF");
            }
        } catch (error) {
            console.error("Error uploading PDF:", error);
            toast.error("Failed to upload PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        multiple: false,
    });

    return (
        <div className="space-y-4">
            {/* Tab Buttons */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setActiveTab("text")}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === "text"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                    <FileText className="inline-block h-4 w-4 mr-2" />
                    Type Your Consent
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("pdf")}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === "pdf"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                    <Upload className="inline-block h-4 w-4 mr-2" />
                    Upload PDF
                </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
                {/* Text Editor Tab */}
                {activeTab === "text" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Consent Content
                            </label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <ReactQuill
                                    value={textContent}
                                    onChange={handleTextChange}
                                    modules={modules}
                                    formats={formats}
                                    placeholder="Enter your consent text here..."
                                    className="bg-white"
                                    style={{ minHeight: "200px" }}
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleReviewTextDocument}
                            disabled={isGenerating || !textContent.trim()}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            <Eye className="h-4 w-4" />
                            {isGenerating ? "Generating..." : "Review Document"}
                        </button>
                    </div>
                )}

                {/* PDF Upload Tab */}
                {activeTab === "pdf" && (
                    <div className="space-y-4">
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                isDragActive
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
                            }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            {isDragActive ? (
                                <p className="text-sm text-purple-600">Drop the PDF file here...</p>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Drag and drop your consent PDF file here, or click to browse
                                    </p>
                                    <p className="text-xs text-gray-500">Accepts PDF files only</p>
                                </>
                            )}
                        </div>

                        {uploadedFileName && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <FileText className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-800 font-medium">{uploadedFileName}</span>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="text-center py-4">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                                <p className="text-sm text-gray-600 mt-2">Uploading and processing PDF...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
