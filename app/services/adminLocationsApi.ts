import axiosClient from "@/app/utils/axiosClient";
import {
    LocationsListResponse,
    LocationFormData,
    LocationDetails,
    CreateLocationRequest,
    UpdateLocationRequest
} from "@/app/types/Location";

class AdminLocationsApi {
    async getAll(params?: {
        skip?: number;
        take?: number;
        search?: string
    }): Promise<LocationsListResponse> {
        const res = await axiosClient.get("/api/admin-locations", { params });
        return res.data.data;
    }

    async getById(id: number | string): Promise<LocationDetails> {
        const res = await axiosClient.get(`/api/admin-locations/${id}`);
        return res.data.data;
    }

    async getFormData(): Promise<LocationFormData> {
        const res = await axiosClient.get("/api/admin-locations/form-data");
        return res.data.data;
    }

    async create(data: CreateLocationRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/admin-locations", data);
        return res.data.data;
    }

    async update(id: number | string, data: UpdateLocationRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/admin-locations/${id}`, data);
        return res.data.data;
    }

    async toggle(id: number | string): Promise<{ message: string }> {
        const res = await axiosClient.post(`/api/admin-locations/${id}/toggle`);
        return res.data.data;
    }
}

export const adminLocationsApi = new AdminLocationsApi();