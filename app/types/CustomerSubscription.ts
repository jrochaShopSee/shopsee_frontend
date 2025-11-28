export interface CustomerSubscription {
    id: number;
    subscriptionName: string;
    companyId: number;
    companyName: string;
    active: boolean;
    orderDate: string;
    renewalDate: string;
    recurringCost: number;
    paymentMethod: string;
    activeDisplay: string;
    numberOfVideos: number;
    numberOfProductsPerVideo: number;
    annualSubscription: boolean;
}

export interface SubscriptionHistoryEntry {
    date?: string;
    amount?: number;
    status?: string;
    // Add more fields as needed based on backend shape
}

export interface CompanyDto {
    id: number;
    name: string;
    email?: string;
    phone?: string;
}

export interface AddressDto {
    id: number;
    streetAddress: string;
    streetAddress2: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    contactFirstName?: string;
    contactLastName?: string;
}

export interface CustomerSubscriptionDetail {
    customerSubscription: CustomerSubscription;
    company: CompanyDto;
    paymentAddress: AddressDto;
    history: SubscriptionHistoryEntry[];
}
