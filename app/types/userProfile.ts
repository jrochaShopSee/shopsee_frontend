export interface UserProfile {
    id: number;
    displayName: string;
    avatarImage: string | null;
    backgroundImage: string | null;
    joinedIn: string;
    likes: string;
    views: string;
    role: string;
    followers: number;
    isAuthenticated: boolean;
    currentUserRole: string;
    status: string;
    isFollowed: boolean;
    isOwnProfile: boolean;
}

export interface ProfileVideo {
    episodeId: string;
    title?: string;
    thumbnailUrl?: string;
    duration?: number;
    views?: number;
    likes?: number;
}

export interface ProfileProduct {
    id: number;
    name: string;
    productImage: string | null;
    price: number;
    salePrice?: number;
    comparePrice?: number;
    isFavorited: boolean;
    productType?: string;
}

export interface FollowUserRequest {
    userId: number;
}

export interface FollowUserResponse {
    status: boolean;
    message: string;
}
