"use client";
import React, { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { IUserInfo } from "@/app/types";
import { axiosClient } from "@/app/utils";

interface CmsAuthContextType {
    userInfo: IUserInfo;
    loading: boolean;
    refreshUserInfo: () => Promise<void>;
}

const CmsAuthContext = createContext<CmsAuthContextType | undefined>(undefined);

export const useCmsAuth = (): CmsAuthContextType => {
    const context = useContext(CmsAuthContext);
    if (!context) {
        throw new Error("useCmsAuth must be used within a CmsAuthWrapper");
    }
    return context;
};

interface CmsAuthWrapperProps {
    children: React.ReactNode;
    requireAdmin?: boolean; // Optional flag for admin-only routes
}

const CmsAuthWrapper: React.FC<CmsAuthWrapperProps> = ({ children, requireAdmin = false }) => {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<IUserInfo>({
        authenticated: false,
        userName: "",
        redirect: "",
    });
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    const fetchAndPopulateUserInfo = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axiosClient.get<IUserInfo>("api/members/userInfo");
            setUserInfo(response.data);

            // Check authentication
            if (!response.data.authenticated) {
                console.log("User not authenticated, redirecting to home");
                router.push("/");
                return;
            }
            if (requireAdmin) {
                console.log("Admin access granted");
            }
        } catch (error) {
            console.error("Error fetching UserInfo:", error);
            // On error, redirect to home
            router.push("/");
        } finally {
            setLoading(false);
            setAuthChecked(true);
        }
    };

    useEffect(() => {
        fetchAndPopulateUserInfo();
    }, []);

    // Show loading spinner while checking authentication
    if (loading || !authChecked) {
        return <LoadingSpinner />;
    }

    // If user is not authenticated, don't render children
    // The redirect will handle navigation
    if (!userInfo.authenticated) {
        return <LoadingSpinner />;
    }

    const contextValue: CmsAuthContextType = {
        userInfo,
        loading,
        refreshUserInfo: fetchAndPopulateUserInfo,
    };

    return <CmsAuthContext.Provider value={contextValue}>{children}</CmsAuthContext.Provider>;
};

export default CmsAuthWrapper;
