"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { VideoMappingDataResponse, CONTENT_TYPES } from "@/app/types/VideoMapping";

interface MapContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (contentTypeId: number, productId?: number, contentItemId?: number) => void;
    mappingData: VideoMappingDataResponse | null;
}

export const MapContentModal: React.FC<MapContentModalProps> = ({ isOpen, onClose, onConfirm, mappingData }) => {
    const [selectedContentTypeId, setSelectedContentTypeId] = useState<number | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedContentItemId, setSelectedContentItemId] = useState<number | null>(null);
    console.log(mappingData);
    const selectedContentType = mappingData?.contentTypes.find((ct) => ct.contentTypeId === selectedContentTypeId);
    console.log(selectedContentType);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedContentTypeId(null);
            setSelectedProductId(null);
            setSelectedContentItemId(null);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (!selectedContentTypeId) {
            return;
        }

        const contentTypeName = selectedContentType?.contentTypeName;

        // Validate based on content type
        if (contentTypeName === CONTENT_TYPES.PRODUCT && !selectedProductId) {
            return;
        }
        if (contentTypeName === CONTENT_TYPES.QUIZ && !selectedProductId) {
            return;
        }
        if (contentTypeName !== CONTENT_TYPES.PRODUCT && contentTypeName !== CONTENT_TYPES.QUIZ && !selectedContentItemId) {
            return;
        }

        onConfirm(selectedContentTypeId, selectedProductId ?? undefined, selectedContentItemId ?? undefined);
    };

    if (!isOpen || !mappingData) return null;

    // Filter products and content items
    const products = mappingData.products.filter((p) => p.productType !== CONTENT_TYPES.QUIZ);
    const quizzes = mappingData.products.filter((p) => p.productType === CONTENT_TYPES.QUIZ);
    const textContent = mappingData.contentItems.filter((c) => c.contentType === CONTENT_TYPES.TEXT);
    const imageContent = mappingData.contentItems.filter((c) => c.contentType === CONTENT_TYPES.IMAGE);
    const imageAndTextContent = mappingData.contentItems.filter((c) => c.contentType === CONTENT_TYPES.IMAGE_AND_TEXT);
    const downloadContent = mappingData.contentItems.filter((c) => c.contentType === CONTENT_TYPES.DOWNLOAD);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Map Content to Video</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Content Type Selection */}
                    <div>
                        <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
                            Content Type <span className="text-red-600">*</span>
                        </label>
                        <select
                            id="contentType"
                            value={selectedContentTypeId ?? ""}
                            onChange={(e) => {
                                setSelectedContentTypeId(Number(e.target.value));
                                setSelectedProductId(null);
                                setSelectedContentItemId(null);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="">Select Content Type</option>
                            {mappingData.contentTypes.map((ct) => (
                                <option key={ct.contentTypeId} value={ct.contentTypeId}>
                                    {ct.contentTypeName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Product Dropdown */}
                    {selectedContentType?.contentTypeName === CONTENT_TYPES.PRODUCT && (
                        <div>
                            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                                Product <span className="text-red-600">*</span>
                            </label>
                            <select id="product" value={selectedProductId ?? ""} onChange={(e) => setSelectedProductId(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
                                <option value="">Select Product</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Quiz Dropdown */}
                    {selectedContentType?.contentTypeName === CONTENT_TYPES.QUIZ && (
                        <div>
                            <label htmlFor="quiz" className="block text-sm font-medium text-gray-700 mb-2">
                                Quiz <span className="text-red-600">*</span>
                            </label>
                            <select id="quiz" value={selectedProductId ?? ""} onChange={(e) => setSelectedProductId(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
                                <option value="">Select Quiz</option>
                                {quizzes.map((q) => (
                                    <option key={q.id} value={q.id}>
                                        {q.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Text Content Dropdown */}
                    {selectedContentType?.contentTypeName === CONTENT_TYPES.TEXT && (
                        <div>
                            <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-2">
                                Text Content <span className="text-red-600">*</span>
                            </label>
                            <select id="textContent" value={selectedContentItemId ?? ""} onChange={(e) => setSelectedContentItemId(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
                                <option value="">Select Text Content</option>
                                {textContent.map((c) => (
                                    <option key={c.itemContentId} value={c.itemContentId}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Image Content Dropdown */}
                    {selectedContentType?.contentTypeName === CONTENT_TYPES.IMAGE && (
                        <div>
                            <label htmlFor="imageContent" className="block text-sm font-medium text-gray-700 mb-2">
                                Image Content <span className="text-red-600">*</span>
                            </label>
                            <select id="imageContent" value={selectedContentItemId ?? ""} onChange={(e) => setSelectedContentItemId(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
                                <option value="">Select Image Content</option>
                                {imageContent.map((c) => (
                                    <option key={c.itemContentId} value={c.itemContentId}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Image and Text Content Dropdown */}
                    {selectedContentType?.contentTypeName === CONTENT_TYPES.IMAGE_AND_TEXT && (
                        <div>
                            <label htmlFor="imageAndTextContent" className="block text-sm font-medium text-gray-700 mb-2">
                                Image and Text Content <span className="text-red-600">*</span>
                            </label>
                            <select id="imageAndTextContent" value={selectedContentItemId ?? ""} onChange={(e) => setSelectedContentItemId(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
                                <option value="">Select Image and Text Content</option>
                                {imageAndTextContent.map((c) => (
                                    <option key={c.itemContentId} value={c.itemContentId}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Download Content Dropdown */}
                    {selectedContentType?.contentTypeName === CONTENT_TYPES.DOWNLOAD && (
                        <div>
                            <label htmlFor="downloadContent" className="block text-sm font-medium text-gray-700 mb-2">
                                Download Content <span className="text-red-600">*</span>
                            </label>
                            <select id="downloadContent" value={selectedContentItemId ?? ""} onChange={(e) => setSelectedContentItemId(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500">
                                <option value="">Select Download Content</option>
                                {downloadContent.map((c) => (
                                    <option key={c.itemContentId} value={c.itemContentId}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedContentTypeId || (selectedContentType?.contentTypeName === CONTENT_TYPES.PRODUCT && !selectedProductId) || (selectedContentType?.contentTypeName === CONTENT_TYPES.QUIZ && !selectedProductId) || (selectedContentType?.contentTypeName !== CONTENT_TYPES.PRODUCT && selectedContentType?.contentTypeName !== CONTENT_TYPES.QUIZ && !selectedContentItemId)}
                        className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
