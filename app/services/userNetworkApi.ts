import axiosClient from '../utils/axiosClient';
import type {
    NetworkSummary,
    SendInviteRequest,
    InviteActionRequest,
    BlockUserRequest,
    SearchNetworkRequest,
    PaginateUsersRequest,
    NetworkSearchResult,
    NetworkUser
} from '../types/userNetwork';
import { AxiosError } from 'axios';

const API_BASE = '/api/user-network';

export const UserNetworkApi = {
    async getNetworkSummary(): Promise<NetworkSummary> {
        try {
            const response = await axiosClient.get<NetworkSummary>(`${API_BASE}/summary`);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to fetch network summary');
        }
    },

    async sendInvite(request: SendInviteRequest): Promise<{ status: boolean; role: string }> {
        try {
            const response = await axiosClient.post<{ status: boolean; role: string }>(
                `${API_BASE}/send-invite`,
                request
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to send invite');
        }
    },

    async acceptInvite(request: InviteActionRequest): Promise<{ status: boolean }> {
        try {
            const response = await axiosClient.post<{ status: boolean }>(
                `${API_BASE}/accept-invite`,
                request
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to accept invite');
        }
    },

    async refuseInvite(request: InviteActionRequest): Promise<{ status: boolean }> {
        try {
            const response = await axiosClient.post<{ status: boolean }>(
                `${API_BASE}/refuse-invite`,
                request
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to refuse invite');
        }
    },

    async blockUser(request: BlockUserRequest): Promise<{ message: string }> {
        try {
            const response = await axiosClient.post<{ message: string }>(
                `${API_BASE}/block-user`,
                request
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to block/unblock user');
        }
    },

    async searchNetwork(request: SearchNetworkRequest): Promise<NetworkSearchResult> {
        try {
            const response = await axiosClient.post<NetworkSearchResult>(
                `${API_BASE}/search`,
                request
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to search network');
        }
    },

    async getPaginatedUsers(request: PaginateUsersRequest): Promise<NetworkUser[]> {
        try {
            const response = await axiosClient.post<NetworkUser[]>(
                `${API_BASE}/paginate`,
                request
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to fetch paginated users');
        }
    },
};
