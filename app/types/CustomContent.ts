// CustomContent Types
export interface CustomContent {
    itemContentId: number;
    name: string;
    companyName: string;
    companyId: number;
    contentType: string;
    contentTypeId: number;
    isActive: boolean;
    itemContentValue?: string | null;
    itemImageValue?: string | null;
    itemDownloadLink?: string | null;
    itemContentIcon?: string | null;
}

export interface CustomContentDetails {
    itemContentId: number;
    companyId: number;
    name: string;
    contentTypeId: number;
    itemContentValue?: string | null;
    itemImageValue?: string | null;
    itemDownloadLink?: string | null;
    contentType: string;
    isActive: boolean;
    itemContentIcon?: string | null;
}

export interface CustomContentFormData {
    companies: Array<{
        value: string;
        text: string;
    }>;
    contentTypes: Array<{
        value: string;
        text: string;
    }>;
    role: string;
    userCompanyId?: number | null;
}

export interface CreateCustomContentRequest {
    companyId: number;
    name: string;
    contentTypeId: number;
    itemContentValue?: string | null;
    itemImageValue?: string | null;
    itemDownloadLink?: string | null;
    itemContentIcon?: string | null;
    isActive: boolean;
}

export interface UpdateCustomContentRequest {
    itemContentId: number;
    companyId: number;
    name: string;
    contentTypeId: number;
    itemContentValue?: string | null;
    itemImageValue?: string | null;
    itemDownloadLink?: string | null;
    itemContentIcon?: string | null;
    isActive: boolean;
}

export interface CustomContentResponse {
    data: CustomContent[];
    hasMore: boolean;
    totalCount: number;
    role: string;
    userCompanyId?: number | null;
    isAdmin: boolean;
}

// Form data interface for React Hook Form
export interface CustomContentFormFields {
    companyId: number;
    name: string;
    contentTypeId: number;
    itemContentValue?: string;
    itemImageValue?: string;
    itemDownloadLink?: string;
    itemContentIcon?: string;
    isActive: boolean;
}

// Content Type Constants
export const CONTENT_TYPES = {
    TEXT: 'Text',
    IMAGE: 'Image',
    IMAGE_AND_TEXT: 'Image And Text',
    DOWNLOAD: 'Download'
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];