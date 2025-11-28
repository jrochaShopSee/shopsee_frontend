// Chat user list model
export interface ChatUser {
    id: number;
    profilePicture: string;
    displayName: string;
    username: string;
    blocked: boolean;
    active: boolean;
    chatPendingToView: number;
    lastMessageDate: string;
    role: string;
}

// Chat message model
export interface ChatMessage {
    id: number;
    message: string;
    sentUsername: string;
    sentDisplayname: string;
    sentProfilePicture: string;
    receiverDisplayname: string;
    viewed: boolean;
    messageDate: string;
}

// Chat history response
export interface ChatHistoryResponse {
    chatMessages: ChatMessage[];
    updatedViewedStatusChatIds: number[];
}

// Chat API types
export interface SendMessageRequest {
    message: string;
    toUsername: string;
}

export interface GetChatHistoryRequest {
    username: string;
    page: number;
    lastPoint?: number | null;
}

export interface BlockUserRequest {
    userId: number;
}

export interface BlockUserResponse {
    message: string;
}
