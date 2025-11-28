import axiosClient from "../utils/axiosClient";
import { BrandsListResponse, BrandDetails, ToggleFeatureRequest } from "../types/Brand";

export class AdminBrandsApi {
    /**
     * Get all brands with pagination and search
     */
    static async getAll(params?: { skip?: number; take?: number; search?: string }): Promise<BrandsListResponse> {
        const res = await axiosClient.get("/api/admin-brands", { params });
        return res.data; // Unwrap BaseApiController.Success() wrapper
    }

    /**
     * Get brand details by ID
     */
    static async getById(id: number | string): Promise<BrandDetails> {
        const res = await axiosClient.get(`/api/admin-brands/${id}`);
        return res.data;
    }

    /**
     * Toggle external link capability
     */
    static async toggleExternalLink(id: number | string, enable: boolean): Promise<{ message: string }> {
        const res = await axiosClient.post(`/api/admin-brands/${id}/toggle-external-link`, {
            enable,
        } as ToggleFeatureRequest);
        return res.data.data;
    }

    /**
     * Toggle consent video capability
     */
    static async toggleConsentVideo(id: number | string): Promise<{ message: string }> {
        const res = await axiosClient.post(`/api/admin-brands/${id}/toggle-consent-video`);
        return res.data.data;
    }

    /**
     * Toggle download content capability
     */
    static async toggleDownloadContent(id: number | string): Promise<{ message: string }> {
        const res = await axiosClient.post(`/api/admin-brands/${id}/toggle-download-content`);
        return res.data.data;
    }
}

export const adminBrandsApi = AdminBrandsApi;
