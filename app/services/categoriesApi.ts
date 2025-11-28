import axiosClient from "@/app/utils/axiosClient";

// Import the Category interface from the correct location
export interface Category {
    id: number;
    name: string;
    description?: string;
    videoCount?: number;
    productCount?: number;
    isActive: boolean;
    parentId?: number;
    parentName?: string;
    children?: Category[];
    selected?: boolean;
}

class CategoriesApi {
    async getNestedCategories(): Promise<Category[]> {
        // The nested endpoint returns OrderedCategoryViewModel[] directly
        const response = await axiosClient.get<Category[]>("/api/Categories/Nested");
        return response.data;
    }

    async getAllCategories(): Promise<Category[]> {
        // The general endpoint returns OrderedCategoryViewModel[] directly
        const response = await axiosClient.get<Category[]>("/api/Categories/");
        return response.data;
    }

    async getOrderedCategories(): Promise<Category[]> {
        // The ordered endpoint returns OrderedCategoryViewModel[] directly
        const response = await axiosClient.get<Category[]>("/api/Categories/Ordered");
        return response.data;
    }

    async getCategoryById(id: number): Promise<Category> {
        const response = await axiosClient.get<Category>(`/api/Categories/${id}`);
        return response.data;
    }

    async getSubCategories(parentId: number): Promise<Category[]> {
        const response = await axiosClient.get<Category[]>(`/api/Categories/${parentId}/Subcategories`);
        return response.data;
    }
}

export const categoriesApi = new CategoriesApi();