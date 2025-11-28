export interface SubscriptionProduct {
    id: number;
    subscriptionName: string;
    subscriptionDescription: string;
    isActive: boolean;
    price: number;
    annualDiscount: number;
    videosPerMonth: number;
    maxLength: number;
    maxProducts: number;
    revenueSplit?: number;
    merchantId?: string;
    subscriptionTypeId: number;
    subscriptionTypeName?: string;
    dateCreated: string;
    dateModified: string;
}

export interface SubscriptionType {
    id: number;
    name: string;
}

export interface CreateSubscriptionProductRequest {
    subscriptionName: string;
    subscriptionDescription: string;
    isActive: boolean;
    price: number;
    annualDiscount: number;
    videosPerMonth: number;
    maxLength: number;
    maxProducts: number;
    revenueSplit?: number;
    subscriptionTypeId: number;
}

export interface UpdateSubscriptionProductRequest {
    subscriptionName: string;
    subscriptionDescription: string;
    isActive: boolean;
    price: number;
    annualDiscount: number;
    videosPerMonth: number;
    maxLength: number;
    maxProducts: number;
    revenueSplit?: number;
    subscriptionTypeId: number;
}

export interface SubscriptionProductStatistics {
    totalSubscriptionProducts: number;
    activeSubscriptionProducts: number;
    inactiveSubscriptionProducts: number;
    averagePrice: number;
}