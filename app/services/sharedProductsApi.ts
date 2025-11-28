import axiosClient from '@/app/utils/axiosClient';
import type {
    SharedProductManagementModel,
    ContentCreatorProductInfo,
    ShareProductRequest,
    EditProductRequest,
    ProductSharedDetails,
    ProductDetail
} from '@/app/types/sharedProducts';
import type { AxiosError } from 'axios';

const API_BASE = '/api/shared-products';

export const SharedProductsApi = {
    async getSharedProductsManagement(): Promise<SharedProductManagementModel> {
        try {
            const response = await axiosClient.get<SharedProductManagementModel>(API_BASE);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to fetch shared products management data');
        }
    },

    async getProductsForContentCreator(companyId: number): Promise<ContentCreatorProductInfo> {
        try {
            const response = await axiosClient.post<ContentCreatorProductInfo>(
                `${API_BASE}/creator-products`,
                { companyId }
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to fetch creator products');
        }
    },

    async shareProduct(request: ShareProductRequest): Promise<ProductDetail | null> {
        try {
            const response = await axiosClient.post<{ result: ProductDetail | null }>(
                `${API_BASE}/share`,
                request
            );
            return response.data.result;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to share product');
        }
    },

    async editProduct(request: EditProductRequest): Promise<ProductDetail | null> {
        try {
            const response = await axiosClient.patch<{ result: ProductDetail | null }>(
                `${API_BASE}/edit`,
                request
            );
            return response.data.result;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to edit product');
        }
    },

    async removeProduct(companyId: number, productId: number): Promise<boolean> {
        try {
            const response = await axiosClient.delete<{ status: boolean }>(
                `${API_BASE}/remove?companyId=${companyId}&productId=${productId}`
            );
            return response.data.status;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to remove product');
        }
    },

    async acceptProduct(productId: number): Promise<boolean> {
        try {
            const response = await axiosClient.patch<{ status: boolean }>(
                `${API_BASE}/accept`,
                { productId }
            );
            return response.data.status;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to accept product');
        }
    },

    async declineProduct(productId: number): Promise<boolean> {
        try {
            const response = await axiosClient.patch<{ status: boolean }>(
                `${API_BASE}/decline`,
                { productId }
            );
            return response.data.status;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to decline product');
        }
    },

    async searchSharedProducts(searchValue: string): Promise<ProductSharedDetails[]> {
        try {
            const response = await axiosClient.post<ProductSharedDetails[]>(
                `${API_BASE}/search`,
                { searchValue }
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to search shared products');
        }
    },

    async getSharedProduct(companyId: number, productId: number): Promise<{
        followersCount: number;
        image: string | null;
        name: string;
        videosCount: number;
        percentage: number;
        productDetailsShared: ProductDetail | null;
    }> {
        try {
            const response = await axiosClient.post(
                `${API_BASE}/get-shared-product`,
                { companyId, productId }
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to get shared product details');
        }
    },

    async getProductDetails(productId: number): Promise<{
        id: number;
        name: string;
        price: number;
        description: string;
        productImage: string;
        variations?: unknown[];
    }> {
        try {
            const response = await axiosClient.get(`/api/Products/${productId}`);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to get product details');
        }
    }
};
