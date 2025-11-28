import axiosClient from "../utils/axiosClient";
import {
    VideosListResponse,
    VideosQueryParams,
    VideoDetail,
    CreateVideoRequest,
    UpdateVideoRequest,
    VideoShareInfo,
} from "../types/Role";

const VIDEOS_BASE_URL = "/api/admin/videos";

export const videosApi = {
    // Get all videos with pagination and search
    getVideos: async (params: VideosQueryParams = {}): Promise<VideosListResponse> => {
        const response = await axiosClient.get<VideosListResponse>(VIDEOS_BASE_URL, { params });
        return response.data;
    },

    // Get video by ID
    getVideoById: async (id: number): Promise<VideoDetail> => {
        const response = await axiosClient.get<VideoDetail>(`${VIDEOS_BASE_URL}/${id}`);
        return response.data;
    },

    // Create new video
    createVideo: async (data: CreateVideoRequest): Promise<{ message: string; id: number }> => {
        const response = await axiosClient.post<{ message: string; id: number }>(VIDEOS_BASE_URL, data);
        return response.data;
    },

    // Update video
    updateVideo: async (id: number, data: UpdateVideoRequest): Promise<{ message: string }> => {
        const response = await axiosClient.put<{ message: string }>(`${VIDEOS_BASE_URL}/${id}`, data);
        return response.data;
    },

    // Toggle video status (activate/deactivate)
    toggleVideoStatus: async (id: number): Promise<{ message: string; isActive: boolean }> => {
        const response = await axiosClient.post<{ message: string; isActive: boolean }>(
            `${VIDEOS_BASE_URL}/${id}/toggle-status`
        );
        return response.data;
    },

    // Delete video
    deleteVideo: async (id: number): Promise<{ message: string }> => {
        const response = await axiosClient.delete<{ message: string }>(`${VIDEOS_BASE_URL}/${id}`);
        return response.data;
    },

    // Get share link for video
    getShareLink: async (id: number): Promise<VideoShareInfo> => {
        const response = await axiosClient.get<VideoShareInfo>(`${VIDEOS_BASE_URL}/${id}/share`);
        return response.data;
    },

    // Get video processing status
    getVideoStatus: async (id: number): Promise<{
        id: number;
        videoStatusId: number;
        videoStatus: string;
        hasUrls: boolean;
        isReady: boolean;
    }> => {
        const response = await axiosClient.get(`${VIDEOS_BASE_URL}/${id}/status`);
        return response.data;
    },

    // Manually process streaming URLs
    processStreamingUrls: async (id: number): Promise<{
        message: string;
        status: string;
        videoStatusId: number;
    }> => {
        const response = await axiosClient.post(`${VIDEOS_BASE_URL}/${id}/process`);
        return response.data;
    },
};
