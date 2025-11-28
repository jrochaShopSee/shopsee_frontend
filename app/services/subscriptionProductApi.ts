import axiosClient from "@/app/utils/axiosClient";
import {
    SubscriptionProduct,
    SubscriptionType,
    CreateSubscriptionProductRequest,
    UpdateSubscriptionProductRequest,
    SubscriptionProductStatistics
} from "@/app/types/SubscriptionProduct";

export class SubscriptionProductApi {
    static async getSubscriptionTypes(): Promise<SubscriptionType[]> {
        const res = await axiosClient.get<SubscriptionType[]>("/api/subscription-products/subscription-types");
        return res.data;
    }

    static async getAll(params?: {
        skip?: number;
        take?: number;
        search?: string
    }): Promise<{
        data: SubscriptionProduct[];
        hasMore: boolean;
        totalCount: number
    }> {
        const res = await axiosClient.get("/api/subscription-products", { params });
        return res.data;
    }

    static async getById(id: number | string): Promise<SubscriptionProduct> {
        const res = await axiosClient.get<SubscriptionProduct>(`/api/subscription-products/${id}`);
        return res.data;
    }

    static async create(data: CreateSubscriptionProductRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/subscription-products", data);
        return res.data;
    }

    static async update(id: number | string, data: UpdateSubscriptionProductRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/subscription-products/${id}`, data);
        return res.data;
    }

    static async toggleStatus(id: number | string, isActive: boolean): Promise<{ message: string }> {
        const res = await axiosClient.patch(`/api/subscription-products/${id}/toggle-status`, { isActive });
        return res.data;
    }

    static async resubmitToStripe(id: number | string): Promise<{ message: string }> {
        const res = await axiosClient.post(`/api/subscription-products/${id}/resubmit-to-stripe`);
        return res.data;
    }

    static async delete(id: number | string): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/subscription-products/${id}`);
        return res.data;
    }

    static async getStatistics(search?: string): Promise<SubscriptionProductStatistics> {
        const params = search ? { search } : undefined;
        const res = await axiosClient.get("/api/subscription-products/statistics", { params });
        return res.data;
    }
}

export const subscriptionProductApi = SubscriptionProductApi;