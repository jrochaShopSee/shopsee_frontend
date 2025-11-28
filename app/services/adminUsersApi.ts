import axiosClient from "@/app/utils/axiosClient";

export interface AdminUser {
    id: number;
    displayName: string;
    userName: string;
    email: string;
    role: string;
    isLockedOut: boolean;
    dateCreated: string;
}

export interface UsersListResponse {
    status: string;
    data: AdminUser[];
    hasMore: boolean;
    totalCount: number;
    nextSkip?: number;
    errorMessage?: string;
}

export interface InfiniteScrollResponse<T> {
    data: T[];
    hasMore: boolean;
    totalCount: number;
    nextSkip?: number;
}

export interface AdminUserDetails {
    id: number;
    displayName: string;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    dateOfBirth: string;
    country: number;
    countryName: string;
    isLockedOut: boolean;
    dateCreated: string;
    dateModified?: string;
    subscriptionEndDate?: string;
    question: string;
    response: string;
    company: {
        id?: number;
        name: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: number;
        phone: string;
        email: string;
        website: string;
        description: string;
    };
    capabilities: number[];
}

export interface CreateAdminUserRequest {
    email: string;
    displayName: string;
    userName: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    role?: string;
    question: string;
    response: string;
    dateOfBirth: string;
    subscriptionEndDate: string;
    company: {
        name: string;
        website: string;
        address: {
            firstName: string;
            lastName: string;
            company?: string;
            streetAddress: string;
            streetAddress2?: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            phone: string;
            email: string;
        };
    };
    currency?: number;
    country: number;
    phone: string;
}

export interface UpdateAdminUserRequest {
    id: number;
    email: string;
    displayName: string;
    userName: string;
    firstName: string;
    lastName: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    question?: string;
    response?: string;
    dateOfBirth?: string;
    country: number;
    phone: string;
}

export interface UpdateUserCapabilitiesRequest {
    userId: number;
    capabilities: number[];
}

export interface AdminUserVideoLog {
    id: number;
    videoTitle: string;
    action: string;
    dateCreated: string;
    ipAddress: string;
}

export const adminUsersApi = {
    // Get all users with pagination and search
    getUsers: async (search?: string, skip: number = 0, take: number = 20): Promise<InfiniteScrollResponse<AdminUser>> => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            params.append('skip', skip.toString());
            params.append('take', take.toString());

            const response = await axiosClient.get<UsersListResponse>(`/api/adminusers?${params}`);
            
            if (response.data.status === "success") {
                return {
                    data: response.data.data || [],
                    hasMore: response.data.hasMore || false,
                    totalCount: response.data.totalCount || 0,
                    nextSkip: response.data.nextSkip,
                };
            } else {
                throw new Error(response.data.errorMessage || "Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    },

    // Get user by ID
    getById: async (id: number): Promise<AdminUserDetails> => {
        const response = await axiosClient.get<AdminUserDetails>(`/api/adminusers/${id}`);
        return response.data;
    },

    // Create new user
    create: async (data: CreateAdminUserRequest): Promise<void> => {
        await axiosClient.post('/api/adminusers', data);
    },

    // Update user
    update: async (id: number, data: UpdateAdminUserRequest): Promise<void> => {
        await axiosClient.put(`/api/adminusers/${id}`, data);
    },

    // Update user capabilities
    updateCapabilities: async (id: number, data: UpdateUserCapabilitiesRequest): Promise<void> => {
        await axiosClient.put(`/api/adminusers/${id}/capabilities`, data);
    },

    // Lock user
    lock: async (id: number): Promise<void> => {
        await axiosClient.post(`/api/adminusers/${id}/lock`);
    },

    // Unlock user
    unlock: async (id: number): Promise<void> => {
        await axiosClient.post(`/api/adminusers/${id}/unlock`);
    },

    // Send password reset email
    sendPasswordReset: async (id: number): Promise<void> => {
        await axiosClient.post(`/api/adminusers/${id}/send-password-reset`);
    },

    // Delete user
    delete: async (id: number): Promise<void> => {
        await axiosClient.delete(`/api/adminusers/${id}`);
    },

    // Get user video logs
    getVideoLogs: async (id: number): Promise<AdminUserVideoLog[]> => {
        const response = await axiosClient.get<AdminUserVideoLog[]>(`/api/adminusers/${id}/video-logs`);
        return response.data;
    },

    // Get countries
    getCountries: async (): Promise<Array<{ id: number; name: string; abbreviation: string; countryCallingCode: string }>> => {
        const response = await axiosClient.get<{ status: string; data: Array<{ id: number; name: string; abbreviation: string; countryCallingCode: string }> }>('/api/adminusers/countries');
        return response.data.data;
    }
};