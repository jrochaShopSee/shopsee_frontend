import axiosClient from "@/app/utils/axiosClient";
import { 
    ProductDetails, 
    ProductFormData, 
    CreateProductRequest, 
    UpdateProductRequest,
    ProductsResponse,
    ProductStatistics,
    ProductExportParams
} from "@/app/types/Product";

export class AdminProductsApi {
    static async getAll(params?: { 
        skip?: number; 
        take?: number; 
        search?: string 
    }): Promise<ProductsResponse> {
        const res = await axiosClient.get("/api/admin-products", { params });
        return res.data;
    }

    static async getById(id: number | string): Promise<ProductDetails> {
        const res = await axiosClient.get<ProductDetails>(`/api/admin-products/${id}`);
        return res.data;
    }

    static async getFormData(): Promise<ProductFormData> {
        const res = await axiosClient.get<ProductFormData>("/api/admin-products/form-data");
        return res.data;
    }

    static async create(data: CreateProductRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/admin-products", data);
        return res.data;
    }

    static async update(id: number | string, data: UpdateProductRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/admin-products/${id}`, data);
        return res.data;
    }

    static async deactivate(id: number | string): Promise<{ message: string }> {
        const res = await axiosClient.post(`/api/admin-products/${id}/deactivate`);
        return res.data;
    }

    static async reactivate(id: number | string): Promise<{ message: string }> {
        const res = await axiosClient.post(`/api/admin-products/${id}/reactivate`);
        return res.data;
    }

    static async delete(id: number | string): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/admin-products/${id}`);
        return res.data;
    }

    static async export(params: ProductExportParams): Promise<Blob> {
        const res = await axiosClient.get("/api/admin-products/export", { 
            params,
            responseType: 'blob'
        });
        return res.data;
    }

    static async importFromShopify(): Promise<{ message: string }> {
        const res = await axiosClient.post("/api/admin-products/import/shopify");
        return res.data;
    }

    static async getStatistics(): Promise<ProductStatistics> {
        const res = await axiosClient.get("/api/admin-products/statistics");
        return res.data;
    }
}

export const adminProductsApi = AdminProductsApi;