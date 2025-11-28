import axiosClient from '../utils/axiosClient';
import { AxiosError } from 'axios';
import type { UserProfile, FollowUserRequest, FollowUserResponse } from '../types/userProfile';

const API_BASE = '/api/user-profile';

export const UserProfileApi = {
    async getUserProfile(userId: number): Promise<UserProfile> {
        try {
            const response = await axiosClient.get<UserProfile>(`${API_BASE}/${userId}`);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to fetch user profile');
        }
    },

    async followUser(request: FollowUserRequest): Promise<FollowUserResponse> {
        try {
            const response = await axiosClient.patch<FollowUserResponse>(`/api/follow/${request.userId}`);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to follow user');
        }
    },

    async unfollowUser(request: FollowUserRequest): Promise<FollowUserResponse> {
        try {
            const response = await axiosClient.patch<FollowUserResponse>(`/api/follow/${request.userId}/unfollow`);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            throw new Error(axiosError.response?.data?.error || 'Failed to unfollow user');
        }
    },
};
