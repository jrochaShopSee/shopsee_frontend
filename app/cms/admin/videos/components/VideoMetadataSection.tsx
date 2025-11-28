import React from "react";
import { UseFormRegister, FieldErrors, FieldValues } from "react-hook-form";

interface Company {
    id: number;
    name: string;
}

interface VideoMetadataSectionProps {
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors<FieldValues>;
    companies?: Company[];
    showCompanySelector?: boolean;
    showBrandingToggle?: boolean;
    userRole?: string;
}

export const VideoMetadataSection: React.FC<VideoMetadataSectionProps> = ({
    register,
    errors,
    companies = [],
    showCompanySelector = false,
    showBrandingToggle = false,
    userRole = "User",
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General</h3>

            <div className="space-y-4">
                {/* Company Selector - Only for Admin/Sales */}
                {showCompanySelector && (userRole === "Admin" || userRole === "Sales") && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register("companyId", { valueAsNumber: true })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={0}>Select a company</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                        {errors.companyId && (
                            <p className="mt-1 text-sm text-red-600">{errors.companyId.message as string}</p>
                        )}
                    </div>
                )}

                {/* Disable Branding - Admin only */}
                {showBrandingToggle && userRole === "Admin" && (
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register("displayBranding")}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Disable Branding</span>
                        </label>
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("title")}
                        maxLength={150}
                        placeholder="Video Title"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
                    )}
                </div>

                {/* Status Toggles */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register("isActive")}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register("isPrivate")}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Private</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};
