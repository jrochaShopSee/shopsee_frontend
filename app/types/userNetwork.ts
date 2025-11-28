export interface NetworkUser {
    id: number;
    displayName: string;
    userRole: string;
    profilePicture: string | null;
    userName?: string;
    coverImage?: string | null;
    connectionAccepted?: boolean;
    blocked?: boolean;
}

export interface NetworkCapacity {
    current: number;
    total: number;
}

export interface NetworkSummary {
    role: string;
    availableConnectionSlots: NetworkCapacity;
    availableInviteSlots: NetworkCapacity;
    connectedUsers: NetworkUser[];
    pendingReview: NetworkUser[];
    pendingUsers: NetworkUser[];
    blockedUsers: NetworkUser[];
    notConnectedUsers: NetworkUser[];
}

export interface SendInviteRequest {
    userId: number;
}

export interface InviteActionRequest {
    userId: number;
}

export interface BlockUserRequest {
    userId: number;
}

export interface SearchNetworkRequest {
    searchValue: string;
    page?: number;
}

export interface PaginateUsersRequest {
    searchValue?: string;
    page: number;
}

export interface NetworkSearchResult {
    connectedUsers: NetworkUser[];
    pendingReview: NetworkUser[];
    pendingUsers: NetworkUser[];
    blockedUsers: NetworkUser[];
    notConnectedUsers: NetworkUser[];
}

export type UserCardAction =
    | { type: 'send-invite'; userId: number }
    | { type: 'accept-invite'; userId: number }
    | { type: 'refuse-invite'; userId: number }
    | { type: 'remove-connection'; userId: number }
    | { type: 'block-user'; userId: number }
    | { type: 'unblock-user'; userId: number };

export type UserCardState = 'connected' | 'pending-review' | 'pending' | 'not-connected' | 'blocked';
