import axiosClient from "../utils/axiosClient";

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const MAX_RETRIES = 3;

export interface UploadStartResponse {
    assetName: string;
    sasUrl: string;
}

export interface ChunkMetadata {
    index: number;
    uuid: string;
}

export interface UploadProgress {
    uploadedBytes: number;
    totalBytes: number;
    percentage: number;
    currentChunk: number;
    totalChunks: number;
}

export class VideoUploadService {
    private assetName: string | null = null;
    private sasUrl: string | null = null;
    private chunkIds: ChunkMetadata[] = [];
    private abortController: AbortController | null = null;

    /**
     * Generate a UUID v4
     */
    private generateUUID(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Start the upload process - creates asset and gets SAS URL
     */
    async startUpload(): Promise<UploadStartResponse> {
        const response = await axiosClient.post<UploadStartResponse>("/api/videos/upload/start");

        this.assetName = response.data.assetName;
        this.sasUrl = response.data.sasUrl;
        this.chunkIds = [];
        this.abortController = new AbortController();

        return response.data;
    }

    /**
     * Upload a single chunk with retry logic
     */
    private async uploadChunkWithRetry(
        chunk: Blob,
        chunkIndex: number,
        totalChunks: number,
        file: File,
        retryCount = 0
    ): Promise<void> {
        try {
            const uuid = btoa(this.generateUUID());

            const formData = new FormData();
            formData.append("file", chunk, file.name);
            formData.append("dzUuid", uuid);
            formData.append("dzChunkIndex", chunkIndex.toString());
            formData.append("dzTotalFileSize", file.size.toString());
            formData.append("dzCurrentChunkSize", chunk.size.toString());
            formData.append("dzTotalChunkCount", totalChunks.toString());
            formData.append("dzChunkByteOffset", (chunkIndex * CHUNK_SIZE).toString());
            formData.append("dzChunkSize", CHUNK_SIZE.toString());
            formData.append("dzFileName", file.name);
            formData.append("sasUrl", this.sasUrl || "");
            formData.append("assetName", this.assetName || "");

            await axiosClient.post("/api/videos/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                signal: this.abortController?.signal,
            });

            // Store chunk ID for commit phase
            this.chunkIds.push({ index: chunkIndex, uuid });
        } catch (error) {
            if (retryCount < MAX_RETRIES) {
                // Retry with exponential backoff
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                return this.uploadChunkWithRetry(chunk, chunkIndex, totalChunks, file, retryCount + 1);
            }
            throw error;
        }
    }

    /**
     * Upload file with chunking and progress tracking
     */
    async uploadFile(
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string> {
        if (!this.assetName || !this.sasUrl) {
            throw new Error("Upload not initialized. Call startUpload() first.");
        }

        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let uploadedBytes = 0;

        // Upload chunks in parallel (with concurrency limit)
        const PARALLEL_UPLOADS = 3;
        const chunks: Promise<void>[] = [];

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const uploadPromise = this.uploadChunkWithRetry(
                chunk,
                chunkIndex,
                totalChunks,
                file
            ).then(() => {
                uploadedBytes += chunk.size;

                if (onProgress) {
                    onProgress({
                        uploadedBytes,
                        totalBytes: file.size,
                        percentage: Math.round((uploadedBytes / file.size) * 100),
                        currentChunk: chunkIndex + 1,
                        totalChunks,
                    });
                }
            });

            chunks.push(uploadPromise);

            // Wait if we've reached the parallel upload limit
            if (chunks.length >= PARALLEL_UPLOADS) {
                await Promise.race(chunks);
                // Remove completed promises
                const completedIndex = chunks.findIndex(async (p) => {
                    try {
                        await Promise.race([p, Promise.resolve()]);
                        return true;
                    } catch {
                        return false;
                    }
                });
                if (completedIndex !== -1) {
                    chunks.splice(completedIndex, 1);
                }
            }
        }

        // Wait for all remaining chunks to complete
        await Promise.all(chunks);

        // Commit all chunks
        await this.commitUpload();

        return this.assetName;
    }

    /**
     * Commit all uploaded chunks
     */
    private async commitUpload(): Promise<void> {
        if (!this.assetName || !this.sasUrl) {
            throw new Error("Upload not initialized");
        }

        // Sort chunks by index
        const sortedChunkIds = this.chunkIds
            .sort((a, b) => a.index - b.index)
            .map((c) => c.uuid);

        const formData = new FormData();
        formData.append("SasUrl", this.sasUrl);
        formData.append("AssetName", this.assetName);

        // Append each chunk ID as a separate form field
        sortedChunkIds.forEach((id) => {
            formData.append("SplittedFileNames", id);
        });

        await axiosClient.post("/api/videos/upload/blob/commit", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    /**
     * Cancel ongoing upload
     */
    cancelUpload(): void {
        this.abortController?.abort();
    }

    /**
     * Delete uploaded video asset
     */
    async deleteUpload(): Promise<void> {
        if (!this.assetName) {
            return;
        }

        try {
            await axiosClient.delete(`/api/videos?assetName=${this.assetName}`);
        } catch (error) {
            console.error("Failed to delete video upload:", error);
        } finally {
            this.cleanup();
        }
    }

    /**
     * Clean up upload state
     */
    private cleanup(): void {
        this.assetName = null;
        this.sasUrl = null;
        this.chunkIds = [];
        this.abortController = null;
    }
}
