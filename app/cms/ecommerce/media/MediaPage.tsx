"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { toast } from "react-toastify";
import { mediaApi, MediaItem } from "@/app/services/mediaApi";
import { useAuth } from "@/app/hooks/useAuth";
import { Image as ImageIcon, Upload, Trash2, Plus, AlertCircle } from "lucide-react";

const MediaPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUploader, setShowUploader] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
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

    // Initial load
    useEffect(() => {
        const initialLoad = async () => {
            setMedia([]);
            setHasMore(true);
            setLoading(true);
            await loadMedia(true);
        };
        initialLoad();
    }, []);

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
            await mediaApi.uploadFile(file);
            toast.success(`${file.name} uploaded successfully`);
            await loadMedia(true); // Refresh the list
        } catch (err) {
            toast.error(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setUploadingFiles((prev) => prev.filter((id) => id !== fileId));
        }
    };

    const handleDeleteClick = (item: MediaItem) => {
        setMediaToDelete(item);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!mediaToDelete) return;

        setDeletingId(mediaToDelete.id);
        try {
            await mediaApi.deleteMedia(mediaToDelete.id);
            toast.success("Media deleted successfully");
            await loadMedia(true); // Refresh the list
        } catch (err) {
            toast.error(`Failed to delete media: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setDeletingId(null);
            setShowDeleteConfirm(false);
            setMediaToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setMediaToDelete(null);
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

    const renderMediaItem = (index: number, item: MediaItem) => {
        const isUploading = uploadingFiles.some((fileId) => fileId.includes(item.fileName || ""));
        const isDeleting = deletingId === item.id;

        return (
            <div key={item.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                    {/* Image preview */}
                    <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden relative">
                        {item.permalink ? (
                            <Image
                                src={item.permalink}
                                alt={item.friendlyName || item.fileName || "Media image"}
                                fill
                                className="object-cover"
                                sizes="128px"
                                onError={() => {
                                    // Handle error state - could set a state to show fallback
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                        )}
                    </div>

                    {/* Media info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 truncate">{item.friendlyName || item.fileName || "Unknown"}</h3>
                                {item.fileType && <p className="text-xs text-gray-500 mt-1">Type: {item.fileType}</p>}
                                {isAdmin && item.companyName && <p className="text-xs text-gray-500 mt-1">Company: {item.companyName}</p>}
                                {item.dateAdded && <p className="text-xs text-gray-500 mt-1">Added: {new Date(item.dateAdded).toLocaleDateString()}</p>}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                                <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => handleDeleteClick(item)} 
                                    disabled={isUploading || isDeleting} 
                                    className="flex items-center space-x-1"
                                >
                                    {isDeleting ? (
                                        <>
                                            <LoadingSpinner />
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-3 h-3" />
                                            <span>Delete</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Uploading indicator */}
                {isUploading && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600">
                        <LoadingSpinner />
                        <span>Uploading...</span>
                    </div>
                )}
            </div>
        );
    };

    if (loading && media.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <ImageIcon className="w-8 h-8 mr-3 text-blue-500" />
                            Media Management
                        </h1>
                        <p className="text-gray-600 mt-2">Upload and manage your media files</p>
                    </div>
                    <Button onClick={() => setShowUploader(!showUploader)} className="flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add New Media</span>
                    </Button>
                </div>

                {/* File Upload Area */}
                {showUploader && (
                    <Card className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                        <div className="text-center cursor-pointer" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">Upload Media Files</p>
                            <p className="text-gray-600 mb-4">Drag and drop your images here, or click to browse</p>
                            <p className="text-sm text-gray-500">Supported formats: JPG, PNG, GIF, WebP (Max 20MB per file)</p>
                            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </div>

                        {uploadingFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium text-gray-700">Uploading files:</p>
                                {uploadingFiles.map((fileId) => (
                                    <div key={fileId} className="flex items-center space-x-2 text-sm text-blue-600">
                                        <LoadingSpinner />
                                        <span>{fileId.split("-")[0]}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <div className="text-red-600 text-sm">{error}</div>
                        <Button onClick={() => loadMedia(true)} variant="outline" size="sm" className="ml-auto">
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            {/* Media Grid */}
            <InfiniteScrollList data={media} loading={loading} hasMore={hasMore} endReached={() => loadMedia(false)} itemContent={renderMediaItem} emptyIcon={<ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />} emptyTitle="No media found" emptyMessage="Upload your first media file to get started" height={720} footerLoading={<LoadingSpinner />} />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && mediaToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                            <h3 className="text-lg font-semibold text-gray-900">Delete Media</h3>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete this media file? This action cannot be undone.
                            </p>
                            
                            {/* Preview of media being deleted */}
                            <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3">
                                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden relative">
                                    {mediaToDelete.permalink ? (
                                        <Image
                                            src={mediaToDelete.permalink}
                                            alt="Media to delete"
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {mediaToDelete.friendlyName || mediaToDelete.fileName || "Unknown"}
                                    </p>
                                    {mediaToDelete.fileType && (
                                        <p className="text-xs text-gray-500">
                                            Type: {mediaToDelete.fileType}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-3">
                            <Button 
                                variant="outline" 
                                onClick={handleDeleteCancel}
                                disabled={deletingId !== null}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteConfirm}
                                disabled={deletingId !== null}
                                className="flex items-center space-x-2"
                            >
                                {deletingId !== null ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaPage;
