import axiosClient from "@/app/utils/axiosClient";
import { CustomerSubscription, CustomerSubscriptionDetail } from "@/app/types/CustomerSubscription";

export class CustomerSubscriptionApi {
    static async getAll(params?: { skip?: number; take?: number; search?: string }): Promise<{ data: CustomerSubscription[]; hasMore: boolean; totalCount: number }> {
        const res = await axiosClient.get("/api/customer-subscriptions", { params });
        return res.data;
    }

    static async getDetail(id: number | string): Promise<CustomerSubscriptionDetail> {
        const res = await axiosClient.get<CustomerSubscriptionDetail>(`/api/customer-subscriptions/${id}`);
        return res.data;
    }

    static async updateStatus(id: number | string, enable: boolean): Promise<{ status: string }> {
        const url = `/api/customer-subscriptions/${id}/${enable ? "enable" : "disable"}`;
        const res = await axiosClient.post(url);
        return res.data;
    }
}

export const customerSubscriptionApi = CustomerSubscriptionApi;
