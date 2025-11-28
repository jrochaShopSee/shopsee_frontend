"use client";

import React from "react";
import { Button } from "@/app/components/ui/Button";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "warning" | "danger" | "info" | "success";
    loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning",
    loading = false,
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "warning":
                return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
            case "danger":
                return <AlertTriangle className="w-6 h-6 text-red-600" />;
            case "success":
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            case "info":
            default:
                return <Info className="w-6 h-6 text-blue-600" />;
        }
    };

    const getConfirmButtonVariant = () => {
        switch (type) {
            case "danger":
                return "bg-red-600 hover:bg-red-700 text-white";
            case "success":
                return "bg-green-600 hover:bg-green-700 text-white";
            case "warning":
                return "bg-yellow-600 hover:bg-yellow-700 text-white";
            case "info":
            default:
                return "bg-blue-600 hover:bg-blue-700 text-white";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-center mb-4">
                        {getIcon()}
                        <h3 className="ml-3 text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    </div>

                    {/* Message */}
                    <p className="text-gray-600 mb-6">{message}</p>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            className={getConfirmButtonVariant()}
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;