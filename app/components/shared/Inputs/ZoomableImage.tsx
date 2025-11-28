"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ZoomableImageProps {
    src: string;
    alt?: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt = "Process Image" }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleImageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
    };

    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
    };

    return (
        <>
            {/* Thumbnail */}
            <div
                className="h-32 w-full rounded-md mb-4 overflow-hidden cursor-pointer"
                onClick={handleImageClick}
            >
                <img
                    src={src}
                    alt={alt}
                    className="object-cover w-full h-full rounded-md transition-transform duration-300 hover:scale-105"
                />
            </div>

            {/* Fullscreen Modal - Rendered via Portal at document body level */}
            {isOpen &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-8"
                        style={{ zIndex: 99999 }}
                        onClick={handleClose}
                    >
                        <div className="relative max-w-[95vw] max-h-[95vh]">
                            <button
                                className="absolute -top-16 right-0 bg-white text-gray-900 rounded-full p-3 hover:bg-gray-100 transition-colors shadow-lg"
                                onClick={handleClose}
                                aria-label="Close fullscreen image"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <img
                                src={src}
                                alt={alt}
                                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default ZoomableImage;
