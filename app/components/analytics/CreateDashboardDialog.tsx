"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { UserDashboard } from "../../types/analytics";

interface CreateDashboardDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateDashboard: (name: string, description?: string) => Promise<void>;
    onUpdateDashboard: (dashboardId: number, name: string, description?: string) => Promise<void>;
    editingDashboard: UserDashboard | null;
}

export default function CreateDashboardDialog({ isOpen, onClose, onCreateDashboard, onUpdateDashboard, editingDashboard }: CreateDashboardDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

    const isEditMode = editingDashboard !== null;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editingDashboard) {
                setName(editingDashboard.name);
                setDescription(editingDashboard.description || "");
            } else {
                setName("");
                setDescription("");
            }
            setErrors({});
        }
    }, [isOpen, isEditMode, editingDashboard]);

    const validateForm = () => {
        const newErrors: { name?: string; description?: string } = {};

        if (!name.trim()) {
            newErrors.name = "Dashboard name is required";
        } else if (name.trim().length < 3) {
            newErrors.name = "Dashboard name must be at least 3 characters";
        } else if (name.trim().length > 50) {
            newErrors.name = "Dashboard name must be less than 50 characters";
        }

        if (description.length > 200) {
            newErrors.description = "Description must be less than 200 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            if (isEditMode && editingDashboard) {
                await onUpdateDashboard(editingDashboard.id, name.trim(), description.trim());
            } else {
                await onCreateDashboard(name.trim(), description.trim());
            }
            onClose();
        } catch (error) {
            console.error("Failed to save dashboard:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{isEditMode ? "Edit Dashboard" : "Create New Dashboard"}</h2>
                    <button onClick={handleClose} disabled={isSubmitting} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="dashboard-name" className="block text-sm font-medium text-gray-700 mb-2">
                                Dashboard Name *
                            </label>
                            <input id="dashboard-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter dashboard name" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? "border-red-300" : "border-gray-300"}`} disabled={isSubmitting} autoFocus />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Description Field */}
                        <div>
                            <label htmlFor="dashboard-description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea id="dashboard-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description for your dashboard" rows={3} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? "border-red-300" : "border-gray-300"}`} disabled={isSubmitting} />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            <p className="mt-1 text-sm text-gray-500">{description.length}/200 characters</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || !name.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {isEditMode ? "Updating..." : "Creating..."}
                                </>
                            ) : isEditMode ? (
                                "Update Dashboard"
                            ) : (
                                "Create Dashboard"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
