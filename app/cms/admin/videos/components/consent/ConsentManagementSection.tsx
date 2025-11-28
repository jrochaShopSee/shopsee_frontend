"use client";

import React, { useState } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, FieldValues } from "react-hook-form";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { ConsentInputTabs } from "./ConsentInputTabs";
import { DischargeSection } from "./DischargeSection";
import { SurveySection } from "./SurveySection";
import { ConsentTimingControl } from "./ConsentTimingControl";
import { DocuSignPreviewModal } from "./DocuSignPreviewModal";

interface ConsentManagementSectionProps {
    register: UseFormRegister<FieldValues>;
    setValue: UseFormSetValue<FieldValues>;
    watch: UseFormWatch<FieldValues>;
    errors: FieldErrors<FieldValues>;
    videoDuration?: number;
}

export const ConsentManagementSection: React.FC<ConsentManagementSectionProps> = ({
    register,
    setValue,
    watch,
    errors,
    videoDuration,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const hasConsent = watch("hasConsent");
    const consentTemplateId = watch("consentTemplateId");

    const handleShowPreview = (url: string) => {
        setPreviewUrl(url);
        setShowPreviewModal(true);
    };

    const handleClosePreview = () => {
        setShowPreviewModal(false);
        setPreviewUrl(null);
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Consent Management</h2>
                                <p className="text-sm text-gray-600">Require viewers to sign consent with DocuSign integration</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Require Consent Toggle */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            {...register("hasConsent")}
                            className="h-4 w-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label className="text-sm font-medium text-gray-700 cursor-pointer">
                            Require Consent
                        </label>
                    </div>

                    {/* Expanded Content - Only show if hasConsent is enabled and expanded */}
                    {hasConsent && isExpanded && (
                        <div className="space-y-6 border-t border-gray-200 pt-6">
                            {/* Consent Input Tabs (Text or PDF) */}
                            <ConsentInputTabs
                                register={register}
                                setValue={setValue}
                                watch={watch}
                                errors={errors}
                                consentTemplateId={consentTemplateId}
                                onShowPreview={handleShowPreview}
                            />

                            {/* Consent Timing */}
                            <ConsentTimingControl
                                register={register}
                                watch={watch}
                                errors={errors}
                                fieldName="consentTime"
                                label="Custom Consent Popup Timing"
                                helpText="If unchecked, the consent popup will appear at the end of the video"
                                videoDuration={videoDuration}
                            />

                            {/* Discharge Section */}
                            <DischargeSection
                                register={register}
                                setValue={setValue}
                                watch={watch}
                                errors={errors}
                                videoDuration={videoDuration}
                            />

                            {/* Survey Section */}
                            <SurveySection
                                register={register}
                                setValue={setValue}
                                watch={watch}
                                errors={errors}
                                videoDuration={videoDuration}
                            />

                            {/* Allow Same User to Sign Again */}
                            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    {...register("consentSameUserCanSignAgain")}
                                    className="h-4 w-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <label className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Allow same user to sign consent again
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Coming Soon Notice - Show when not expanded */}
                    {hasConsent && !isExpanded && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-xs text-purple-800">
                                <strong>Click to expand</strong> - Configure DocuSign consent, discharge PDFs, surveys, and timing options
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* DocuSign Preview Modal */}
            <DocuSignPreviewModal
                isOpen={showPreviewModal}
                onClose={handleClosePreview}
                previewUrl={previewUrl}
            />
        </>
    );
};
