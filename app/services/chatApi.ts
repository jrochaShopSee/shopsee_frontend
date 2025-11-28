import axiosClient from '@/app/utils/axiosClient';
import type {
    ChatUser,
    ChatHistoryResponse,
    GetChatHistoryRequest,
    BlockUserRequest,
    BlockUserResponse
} from '@/app/types/chat';
import type { AxiosError } from 'axios';

const API_BASE = '/api/chat';

export const ChatApi = {
    async getUserConnections(): Promise<ChatUser[]> {
        try {
            const response = await axiosClient.get<ChatUser[]>(`${API_BASE}/connections`);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to fetch user connections');
        }
    },

    async getChatHistory(request: GetChatHistoryRequest): Promise<ChatHistoryResponse> {
        try {
            const response = await axiosClient.post<ChatHistoryResponse>(
                `${API_BASE}/history`,
                request
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to fetch chat history');
        }
    },

    async blockOrUnblockUser(request: BlockUserRequest): Promise<BlockUserResponse> {
        try {
            const response = await axiosClient.post<BlockUserResponse>(
                `${API_BASE}/block`,
                request
            );
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to block/unblock user');
        }
    }
};
