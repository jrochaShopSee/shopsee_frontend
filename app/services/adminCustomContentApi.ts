import axiosClient from "@/app/utils/axiosClient";
import {
    CustomContentDetails,
    CustomContentFormData,
    CreateCustomContentRequest,
    UpdateCustomContentRequest,
    CustomContentResponse
} from "@/app/types/CustomContent";

export class AdminCustomContentApi {
    static async getAll(params?: {
        skip?: number;
        take?: number;
        search?: string;
        companyId?: number;
    }): Promise<CustomContentResponse> {
        const res = await axiosClient.get("/api/admin-custom-content", { params });
        return res.data;
    }

    static async getById(id: number | string): Promise<CustomContentDetails> {
        const res = await axiosClient.get<CustomContentDetails>(`/api/admin-custom-content/${id}`);
        return res.data;
    }

    static async getFormData(): Promise<CustomContentFormData> {
        const res = await axiosClient.get<CustomContentFormData>("/api/admin-custom-content/form-data");
        return res.data;
    }

    static async create(data: CreateCustomContentRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/admin-custom-content", data);
        return res.data;
    }

    static async update(id: number | string, data: UpdateCustomContentRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/admin-custom-content/${id}`, data);
        return res.data;
    }

    static async toggleActiveStatus(id: number | string): Promise<{ message: string; isActive: boolean }> {
        const res = await axiosClient.post(`/api/admin-custom-content/${id}/toggle-active`);
        return res.data;
    }

    static async delete(id: number | string): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/admin-custom-content/${id}`);
        return res.data;
    }
}

export const adminCustomContentApi = AdminCustomContentApi;