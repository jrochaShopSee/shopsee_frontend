"use client";

import React from "react";
import { X } from "lucide-react";

interface DocuSignPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    previewUrl: string | null;
}

export const DocuSignPreviewModal: React.FC<DocuSignPreviewModalProps> = ({
    isOpen,
    onClose,
    previewUrl,
}) => {
    if (!isOpen || !previewUrl) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">DocuSign Document Preview</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            type="button"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Content - iframe */}
                    <div className="flex-1 overflow-hidden">
                        <iframe
                            id="docusignIntegrationIframe"
                            src={previewUrl}
                            className="w-full h-full"
                            style={{ minHeight: "70vh" }}
                            title="DocuSign Document Preview"
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            type="button"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
