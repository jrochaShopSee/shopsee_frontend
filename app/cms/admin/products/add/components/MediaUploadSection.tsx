"use client";

import React, { useState } from "react";
import { FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Image, X, Edit } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { AddProductFormData } from "../types";
import MediaSelectionModal from "../../shared/MediaSelectionModal";

interface MediaUploadSectionProps {
    errors: FieldErrors<AddProductFormData>;
    watch: UseFormWatch<AddProductFormData>;
    setValue: UseFormSetValue<AddProductFormData>;
    isShopifyProduct?: boolean;
}

const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
    watch,
    setValue,
    isShopifyProduct = false,
}) => {
    const [activeModal, setActiveModal] = useState<'productImage' | 'productIcon' | 'productHeaderImage' | null>(null);

    const productImage = watch("productImage");
    const productIcon = watch("productIcon");
    const productHeaderImage = watch("productHeaderImage");
    const headerType = watch("headerType");
    // Only show header image if headerType is "Image" (not "Text" or empty)
    const showHeaderImage = headerType === "Image";

    // Clear productHeaderImage when headerType is not "Image"
    React.useEffect(() => {
        if (!showHeaderImage && productHeaderImage) {
            setValue("productHeaderImage", undefined);
        }
    }, [showHeaderImage, productHeaderImage, setValue]);

    const handleMediaSelect = (mediaUrl: string, field: 'productImage' | 'productIcon' | 'productHeaderImage') => {
        setValue(field, mediaUrl, { shouldValidate: true });
        setActiveModal(null);
    };

    const removeImage = (field: 'productImage' | 'productIcon' | 'productHeaderImage') => {
        setValue(field, undefined, { shouldValidate: true });
    };

    const MediaField = ({
        title,
        description,
        dimensions,
        fieldName,
        imageUrl,
        disabled = false
    }: {
        title: string;
        description: string;
        dimensions: string;
        fieldName: 'productImage' | 'productIcon' | 'productHeaderImage';
        imageUrl?: string;
        disabled?: boolean;
    }) => (
        <div className={`space-y-3 ${disabled ? 'opacity-60' : ''}`}>
            <label className="block text-sm font-medium text-gray-700">
                {title}
            </label>
            <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 ${!disabled ? 'hover:border-purple-400 cursor-pointer' : 'cursor-not-allowed'} transition-colors`}>
                {imageUrl ? (
                    <div className="relative">
                        <div className="flex items-center justify-center">
                            <img
                                src={imageUrl}
                                alt={`${title} preview`}
                                className={`rounded-lg ${
                                    fieldName === 'productImage' ? 'max-h-48' :
                                    fieldName === 'productIcon' ? 'max-h-24' : 'max-h-20'
                                }`}
                            />
                        </div>
                        {!disabled && (
                            <div className="absolute top-2 right-2 flex space-x-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(fieldName)}
                                    className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                                    title="Change image"
                                >
                                    <Edit className="h-3 w-3" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeImage(fieldName)}
                                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    title="Remove image"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8" onClick={() => !disabled && setActiveModal(fieldName)}>
                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Choose {title.toLowerCase()}</p>
                        <p className="text-xs text-gray-500 mt-1">Ideal dimensions: {dimensions}</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            disabled={disabled}
                        >
                            Select from Media Library
                        </Button>
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-500">
                💡 {description}
            </p>
        </div>
    );

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Image className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Media & Images</h2>
                            <p className="text-sm text-gray-600">Select images from your media library</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Product Image */}
                    <MediaField
                        title="Product Image"
                        description="This image will be displayed as the main product image"
                        dimensions="360x600px"
                        fieldName="productImage"
                        imageUrl={productImage}
                    />

                    {/* Product Icon */}
                    <MediaField
                        title="Product Icon"
                        description="Small icon representation of your product"
                        dimensions="100x100px"
                        fieldName="productIcon"
                        imageUrl={productIcon}
                    />

                    {/* Header Image - Only show if header type is selected */}
                    {showHeaderImage && (
                        <MediaField
                            title="Header Image"
                            description="Header image for your selected header type"
                            dimensions="360x80px"
                            fieldName="productHeaderImage"
                            imageUrl={productHeaderImage}
                            disabled={isShopifyProduct}
                        />
                    )}
                </div>
            </div>

            {/* Media Selection Modals */}
            <MediaSelectionModal
                isOpen={activeModal === 'productImage'}
                onClose={() => setActiveModal(null)}
                onSelect={(mediaUrl) => handleMediaSelect(mediaUrl, 'productImage')}
                title="Select Product Image"
                selectedUrl={productImage}
            />

            <MediaSelectionModal
                isOpen={activeModal === 'productIcon'}
                onClose={() => setActiveModal(null)}
                onSelect={(mediaUrl) => handleMediaSelect(mediaUrl, 'productIcon')}
                title="Select Product Icon"
                selectedUrl={productIcon}
            />

            <MediaSelectionModal
                isOpen={activeModal === 'productHeaderImage'}
                onClose={() => setActiveModal(null)}
                onSelect={(mediaUrl) => handleMediaSelect(mediaUrl, 'productHeaderImage')}
                title="Select Header Image"
                selectedUrl={productHeaderImage}
            />
        </>
    );
};

export default MediaUploadSection;