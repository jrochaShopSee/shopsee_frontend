import axiosClient from "@/app/utils/axiosClient";

export interface MediaItem {
    id: number;
    companyId?: number;
    companyName?: string;
    friendlyName?: string;
    fileName?: string;
    fileType?: string;
    mimeType?: string;
    permalink?: string;
    dateAdded?: string;
    dateModified?: string;
    active?: boolean;
}

export interface MediaListResponse {
    status: string;
    data: MediaItem[];
    hasMore: boolean;
    totalCount: number;
    nextSkip: number;
}

export interface MediaUploadResponse {
    status: string;
    message: string;
    data?: MediaItem;
}

export interface MediaDeleteResponse {
    status: string;
    message: string;
}

class MediaApi {
    async getAll(params: { skip?: number; take?: number } = {}): Promise<MediaListResponse> {
        const { skip = 0, take = 20 } = params;
        const response = await axiosClient.get<MediaListResponse>("/api/MediaManagement", {
            params: { skip, take },
        });
        return response.data;
    }

    async uploadFile(file: File, companyId?: number): Promise<MediaUploadResponse> {
        const formData = new FormData();
        formData.append("file", file);
        if (companyId) {
            formData.append("companyId", companyId.toString());
        }

        const response = await axiosClient.post<MediaUploadResponse>("/api/MediaManagement/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    }

    async deleteMedia(id: number): Promise<MediaDeleteResponse> {
        const response = await axiosClient.delete<MediaDeleteResponse>(`/api/MediaManagement/${id}`);
        return response.data;
    }
}

export const mediaApi = new MediaApi();