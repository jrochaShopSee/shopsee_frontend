import axiosClient from "../utils/axiosClient";
import {
    VideoMappingDataResponse,
    AddMappedItemRequest,
    AddMappedItemResponse,
    UpdateMappedItemRequest,
    AdjustMappedItemRequest,
    UpdateDockingBehaviorRequest,
    MapToEntireVideoRequest,
    MappedItem
} from "../types/VideoMapping";

export class VideoMappingApi {
    /**
     * Get all video mapping data including video info, products, content items, and existing mappings
     */
    static async getVideoMappingData(videoId: number): Promise<VideoMappingDataResponse> {
        const response = await axiosClient.get<VideoMappingDataResponse>(`/api/admin-video-mapping/${videoId}`);
        return response.data;
    }

    /**
     * Add a new mapped item to the video
     */
    static async addMappedItem(request: AddMappedItemRequest): Promise<AddMappedItemResponse> {
        const response = await axiosClient.post<AddMappedItemResponse>("/api/admin-video-mapping/items", request);
        return response.data;
    }

    /**
     * Update an existing mapped item
     */
    static async updateMappedItem(itemId: number, request: UpdateMappedItemRequest): Promise<{ status: string; message: string }> {
        const response = await axiosClient.put<{ status: string; message: string }>(`/api/admin-video-mapping/items/${itemId}`, request);
        return response.data;
    }

    /**
     * Adjust the position and size of a mapped item
     */
    static async adjustMappedItemPosition(itemId: number, request: AdjustMappedItemRequest): Promise<{ status: string; message: string }> {
        const response = await axiosClient.put<{ status: string; message: string }>(`/api/admin-video-mapping/items/${itemId}/position`, request);
        return response.data;
    }

    /**
     * Delete a mapped item
     */
    static async deleteMappedItem(itemId: number): Promise<{ status: string; message: string }> {
        const response = await axiosClient.delete<{ status: string; message: string }>(`/api/admin-video-mapping/items/${itemId}`);
        return response.data;
    }

    /**
     * Update video docking icons behavior
     */
    static async updateDockingBehavior(videoId: number, request: UpdateDockingBehaviorRequest): Promise<{ status: string; message: string }> {
        const response = await axiosClient.put<{ status: string; message: string }>(`/api/admin-video-mapping/${videoId}/docking-behavior`, request);
        return response.data;
    }

    /**
     * Map multiple products to the entire video duration and screen
     */
    static async mapProductsToEntireVideo(videoId: number, request: MapToEntireVideoRequest): Promise<{ status: string; message: string; itemIds: number[] }> {
        const response = await axiosClient.post<{ status: string; message: string; itemIds: number[] }>(`/api/admin-video-mapping/${videoId}/map-entire-video`, request);
        return response.data;
    }

    /**
     * Get details of a single mapped item
     */
    static async getMappedItem(itemId: number): Promise<MappedItem> {
        const response = await axiosClient.get<MappedItem>(`/api/admin-video-mapping/items/${itemId}`);
        return response.data;
    }
}
