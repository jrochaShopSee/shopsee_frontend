"use client";
import { useState, useEffect } from "react";
import axiosClient from "@/app/utils/axiosClient";

interface UserCapabilities {
    canAddConsentVideo: boolean;
    canAddDownloadContent: boolean;
}

interface UserInfo {
    userId: number;
    userName: string;
    displayName?: string;
    isAdmin: boolean;
    isAuthenticated: boolean;
    companies: Array<{ id: number; name: string }>;
    email?: string;
    isFromShopify: boolean;
    capabilities: UserCapabilities;
}

interface UseAuthReturn {
    user: UserInfo | null;
    isAdmin: boolean;
    isAuthenticated: boolean;
    isFromShopify: boolean;
    isLoading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    canAddConsentVideo: boolean;
    canAddDownloadContent: boolean;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserInfo = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axiosClient.get<UserInfo>("/api/analytics/user-info");

            // If user is not authenticated (locked out), clear user session
            if (response.data && !response.data.isAuthenticated) {
                console.warn("User is locked out");
                setError("Your account has been locked. Please contact support.");
                setUser(null);
            } else {
                setUser(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch user info:", err);
            setError("Failed to load user information");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        await fetchUserInfo();
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    return {
        user,
        isAdmin: user?.isAdmin || false,
        isAuthenticated: user?.isAuthenticated || false,
        isFromShopify: user?.isFromShopify || false,
        isLoading,
        error,
        refreshUser,
        canAddConsentVideo: user?.capabilities?.canAddConsentVideo || false,
        canAddDownloadContent: user?.capabilities?.canAddDownloadContent || false,
    };
};
