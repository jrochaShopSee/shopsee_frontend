export interface Brand {
    id: number;
    name: string;
    website?: string;
    isActive: boolean;
    canAddExternalLink: boolean;
    productCount: number;
    videosCount: number;
    canAddConsentVideo: boolean;
    canAddDownloadContent: boolean;
}

export interface BrandsListResponse {
    data: Brand[];
    hasMore: boolean;
    totalCount: number;
}

export interface Address {
    firstName?: string;
    lastName?: string;
    company?: string;
    streetAddress?: string;
    streetAddress2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    email?: string;
    phone?: string;
}

export interface BankAccount {
    accountHolderName?: string;
    routingNumber?: string;
    accountNumber?: string;
}

export interface BrandDetails {
    id: number;
    name: string;
    website?: string;
    isActive: boolean;
    canAddExternalLink: boolean;
    productCount: number;
    videosCount: number;
    canAddConsentVideo: boolean;
    canAddDownloadContent: boolean;
    companyAddress?: Address;
    billingAddress?: Address;
    bankAccount?: BankAccount;
}

export interface ToggleFeatureRequest {
    enable: boolean;
}
