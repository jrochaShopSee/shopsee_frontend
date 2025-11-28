// types/ecommerce.ts

// Core ecommerce entities
export interface EcommerceCustomer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
    dateCreated: string | Date;
    customerSince: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string | Date | null;
    merchantId?: number;
    addresses?: CustomerAddress[];
    paymentMethods?: CustomerPaymentMethod[];
}

export interface EcommerceOrder {
    id: number;
    guid: string;
    orderDate: string | Date;
    orderStatus: string;
    orderTotal: number;
    orderTax?: number;
    orderShipping?: number;
    orderDiscount?: number;
    customerName: string;
    customerEmail: string;
    customerId?: number;
    itemsCount: number;
    trackingNumber?: string;
    notes?: string;
    formattedDate: string;
    formattedTotal: string;
    isShopifyOrder?: boolean;
    customer?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variation?: string;
    variationCombination?: ProductVariationValue;
}

export interface ProductVariationValue {
    id: number;
    combinations: Array<{
        optionName: string;
        combinationItemName: string;
    }>;
}

export interface CustomerAddress {
    id: number;
    streetAddress: string;
    streetAddress2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
    type: "default" | "additional";
}

export interface CustomerPaymentMethod {
    paymentMethodId: number;
    name: string;
    mask?: string;
    brand?: string;
    isDefault: boolean;
}

export interface OrderStatus {
    id: number;
    statusName: string;
    active?: boolean;
    emailTriggered?: boolean;
    adminEmailTriggered?: boolean;
    companyEmailTriggered?: boolean;
}

// Order Notes interface
export interface OrderNote {
    id: number;
    content: string;
    isCustomerNote: boolean;
    dateAdded: string;
    addedBy: string;
    formattedDate: string;
}

// Statistics interfaces
export interface OrderStatistics {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    formattedTotalRevenue: string;
    formattedAverageOrderValue: string;
}

export interface CustomerStatistics {
    totalCustomers: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    averageCustomerValue: number;
    formattedTotalRevenue: string;
    formattedAverageOrderValue: string;
    formattedAverageCustomerValue: string;
}

// Generic statistics interface for future use
export interface EcommerceStatistics {
    orders: OrderStatistics;
    customers: CustomerStatistics;
}

// API Response Types
export interface CustomersListResponse {
    status: "success" | "error";
    data?: EcommerceCustomer[];
    totalCount?: number;
    hasMore?: boolean;
    nextSkip?: number;
    errorMessage?: string;
}

export interface OrdersListResponse {
    status: "success" | "error";
    data?: EcommerceOrder[];
    totalCount?: number;
    hasMore?: boolean;
    nextSkip?: number;
    errorMessage?: string;
}

export interface OrderDetailsResponse {
    status: "success" | "error";
    data?: EcommerceOrder;
    errorMessage?: string;
}

export interface CustomerDetailsResponse {
    status: "success" | "error";
    data?: EcommerceCustomer;
    errorMessage?: string;
}

export interface OrderNotesResponse {
    status: "success" | "error";
    data?: OrderNote[];
    errorMessage?: string;
}

// Filter and pagination types
export interface EcommerceFilters {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    customerId?: number;
}

export interface PaginationParams {
    skip: number;
    take: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
}

export interface InfiniteScrollResponse<T> {
    data: T[];
    hasMore: boolean;
    totalCount: number;
    nextSkip?: number;
}

// API Request Types
export interface AddOrderNoteRequest {
    content: string;
    isCustomerNote: boolean;
}

export interface UpdateOrderStatusRequest {
    status: string;
}

export interface UpdateTrackingRequest {
    trackingNumber: string;
    shippingMethod?: string;
}
