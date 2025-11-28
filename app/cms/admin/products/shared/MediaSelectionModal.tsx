"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { mediaApi, MediaItem } from "@/app/services/mediaApi";
import { useAuth } from "@/app/hooks/useAuth";
import { Image as ImageIcon, Upload, X, Plus, AlertCircle, Check } from "lucide-react";

interface MediaSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (mediaUrl: string) => void;
    title?: string;
    selectedUrl?: string;
    allowUpload?: boolean;
}

const MediaSelectionModal: React.FC<MediaSelectionModalProps> = ({ isOpen, onClose, onSelect, title = "Select Media", selectedUrl, allowUpload = true }) => {
    const { isAdmin } = useAuth();
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUploader, setShowUploader] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load media (infinite scroll)
    const loadMedia = useCallback(
        async (reset = false) => {
            if (!hasMore && !reset) return;
            setError(null);
            if (reset) setLoading(true);

            const skip = reset ? 0 : media.length;
            try {
                const res = await mediaApi.getAll({ skip, take: 20 });
                if (reset) {
                    setMedia(res.data);
                } else {
                    setMedia((prev) => [...prev, ...res.data]);
                }
                setHasMore(res.hasMore);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load media");
            } finally {
                setLoading(false);
            }
        },
        [hasMore, media.length]
    );

    // Initial load when modal opens
    useEffect(() => {
        if (isOpen) {
            const initialLoad = async () => {
                setMedia([]);
                setHasMore(true);
                setLoading(true);
                await loadMedia(true);
            };
            initialLoad();
        }
    }, [isOpen]);

    // Filter media based on search
    const filteredMedia = media.filter((item) => !searchTerm || item.friendlyName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            uploadFile(file);
        });

        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const uploadFile = async (file: File) => {
        const fileId = `${file.name}-${Date.now()}`;
        setUploadingFiles((prev) => [...prev, fileId]);

        try {
            const response = await mediaApi.uploadFile(file);
            toast.success(`${file.name} uploaded successfully`);

            // Add the new media to the top of the list
            if (response.data) {
                setMedia((prev) => [response.data!, ...prev]);
            }

            await loadMedia(true); // Refresh the list
        } catch (err) {
            toast.error(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setUploadingFiles((prev) => prev.filter((id) => id !== fileId));
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const files = event.dataTransfer.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith("image/")) {
                uploadFile(file);
            } else {
                toast.error(`${file.name} is not a valid image file`);
            }
        });
    };

    const handleMediaSelect = (mediaItem: MediaItem) => {
        if (mediaItem.permalink) {
            onSelect(mediaItem.permalink);
            onClose();
        }
    };

    const renderMediaItem = (item: MediaItem) => {
        const isSelected = selectedUrl === item.permalink;
        const isUploading = uploadingFiles.some((fileId) => fileId.includes(item.fileName || ""));

        return (
            <div key={item.id} className={`group relative bg-white rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${isSelected ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.02]" : "border-gray-200 hover:border-blue-300"}`} onClick={() => handleMediaSelect(item)}>
                {/* Selection indicator */}
                {isSelected && (
                    <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg border-2 border-white">
                            <Check className="w-4 h-4" />
                        </div>
                    </div>
                )}

                {/* Image preview */}
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden relative">
                    {item.permalink ? (
                        <Image
                            src={item.permalink}
                            alt={item.friendlyName || item.fileName || "Media image"}
                            fill
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            onError={() => {
                                // Handle error state
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-white bg-opacity-90 rounded-full p-2">
                                <Check className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media info - compact overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent text-white p-3 rounded-b-lg">
                    <h4 className="text-xs font-medium truncate">{item.friendlyName || item.fileName || "Unknown"}</h4>
                    <div className="flex items-center justify-between text-xs opacity-80">
                        <span>{item.fileType}</span>
                        {isAdmin && item.companyName && <span className="truncate ml-2">{item.companyName}</span>}
                    </div>
                </div>

                {/* Uploading indicator */}
                {isUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-xl backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <LoadingSpinner />
                            <span className="text-xs text-blue-600 mt-2 font-medium">Uploading...</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh] mx-4 transform transition-all flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-600 p-3 rounded-xl">
                                    <ImageIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-sm text-gray-600">
                                            {filteredMedia.length} media file{filteredMedia.length !== 1 ? "s" : ""}
                                            {searchTerm && ` matching "${searchTerm}"`}
                                        </p>
                                        {hasMore && !searchTerm && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">More available</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                {allowUpload && (
                                    <Button onClick={() => setShowUploader(!showUploader)} variant={showUploader ? "default" : "outline"} size="sm" className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        <span>{showUploader ? "Hide Upload" : "Upload New"}</span>
                                    </Button>
                                )}

                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white hover:bg-opacity-50 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload section */}
                {showUploader && allowUpload && (
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900 mb-1">Upload Media Files</p>
                            <p className="text-xs text-gray-600 mb-2">Drag and drop your images here, or click to browse</p>
                            <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, WebP (Max 20MB per file)</p>
                            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </div>

                        {uploadingFiles.length > 0 && (
                            <div className="mt-3 space-y-1">
                                <p className="text-xs font-medium text-gray-700">Uploading files:</p>
                                {uploadingFiles.map((fileId) => (
                                    <div key={fileId} className="flex items-center space-x-2 text-xs text-blue-600">
                                        <LoadingSpinner />
                                        <span>{fileId.split("-")[0]}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                    <input type="text" placeholder="Search media..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-50 border-b border-gray-200">
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                            <div className="text-red-600 text-sm">{error}</div>
                            <Button onClick={() => loadMedia(true)} variant="outline" size="sm" className="ml-auto">
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                {/* Media Grid */}
                <div className="flex-1 overflow-hidden">
                    {loading && filteredMedia.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <LoadingSpinner />
                                <p className="text-gray-500 mt-4">Loading media...</p>
                            </div>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center max-w-sm mx-auto p-8">
                                <div className="bg-gray-100 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No media found</h3>
                                <p className="text-gray-500 mb-4">{searchTerm ? "Try adjusting your search terms" : "Upload your first media file to get started"}</p>
                                {allowUpload && !searchTerm && (
                                    <Button onClick={() => setShowUploader(true)} className="flex items-center gap-2 mx-auto">
                                        <Plus className="w-4 h-4" />
                                        Upload Media
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto">
                            {/* Responsive Grid Container */}
                            <div className="p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">{filteredMedia.map((item) => renderMediaItem(item))}</div>

                                {/* Infinite Scroll Loading */}
                                {hasMore && !searchTerm && (
                                    <div className="flex justify-center mt-8 mb-4">
                                        {loading ? (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <LoadingSpinner />
                                                <span>Loading more media...</span>
                                            </div>
                                        ) : (
                                            <Button onClick={() => loadMedia(false)} variant="outline" className="flex items-center gap-2">
                                                <Plus className="w-4 h-4" />
                                                Load More Media
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Search Results Info */}
                                {searchTerm && (
                                    <div className="text-center mt-8 mb-4">
                                        <p className="text-gray-500">
                                            {filteredMedia.length} result{filteredMedia.length !== 1 ? "s" : ""} for "{searchTerm}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="p-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {selectedUrl ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                            <Image src={selectedUrl} alt="Selected media" width={48} height={48} className="object-cover w-full h-full" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">1 media selected</p>
                                            <p className="text-xs text-gray-500">Ready to use</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">No media selected</p>
                                            <p className="text-xs text-gray-500">Click on an image to select it</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <Button variant="outline" onClick={onClose} className="px-6">
                                    Cancel
                                </Button>
                                <Button onClick={() => selectedUrl && onClose()} disabled={!selectedUrl} className="px-6 flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Use Selected
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaSelectionModal;
