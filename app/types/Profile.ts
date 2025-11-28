export interface Address {
    id?: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    streetAddress?: string;
    streetAddress2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
    email?: string;
    isPrimary?: boolean;
}

export interface CreditCard {
    cardHolderName?: string;
    cardNumber?: string;
    expiryDate?: string;
}

export interface BankAccount {
    accountHolderName?: string;
    routingNumber?: string;
    accountNumber?: string;
    bankName?: string;
}

export interface Subscription {
    id: number;
    subscriptionId: number;
    name?: string;
    annual?: boolean;
    amount?: number;
    period?: string;
    status?: string;
    renewalDate?: string;
    subscriptionCanBeReactivated?: boolean;
    subscriptionOrigin?: string;
    cancelling?: boolean;
    isActive?: boolean;
}

export interface SubscriptionUsageStats {
    remainingMonthVideos?: number;
    maxMonthVideos?: number;
    remainingYearVideos?: number;
    maxYearVideos?: number;
    videoMaxLength?: number;
    productPerVideo?: number;
}

export interface SubscriptionData {
    subscription: Subscription | null;
    externalPayments: boolean;
    subscriptionPaymentId?: number;
    companyPaymentMethods?: CompanyPaymentMethod[];
    usageStats: SubscriptionUsageStats;
    role: string;
}

export interface CompanyPaymentMethod {
    paymentMethodId: number;
    name: string;
    mask: string;
    holderName?: string;
    isActive: boolean;
}

export interface SubscriptionPlan {
    id: number;
    subscriptionName: string;
    subscriptionDescription: string;
    isActive: boolean;
    price: number;
    priceAnnually: number;
    annualDiscount: number;
    videosPerMonth: number;
    maxLength: number;
    maxProducts: number;
    revenueSplit?: number;
    analytics?: boolean;
    onlineSupport?: boolean;
    isMostPopular?: boolean;
}

export interface UpdateSubscriptionRequest {
    newSubscriptionID: number;
    annual: boolean;
}

export interface UpgradeSubscriptionFromTrialRequest extends UpdateSubscriptionRequest {
    paymentMethodId: number;
}

export interface ProratePreviewResponse {
    currentPlanName: string;
    currentPrice: number;
    currentPeriod: string;
    newPlanName: string;
    newPrice: number;
    newPeriod: string;
    proratedAmount: number;
    isUpgrade: boolean;
    daysLeft: number;
    renewalDate?: string;
    description: string;
}

export interface UserInterest {
    categoryId: number;
    categoryName: string;
    isActive: boolean;
    dateAdded: string;
    dateModified: string;
}

export interface Profile {
    id: number;
    displayName: string;
    email: string;
    role: string;
    question?: string;
    image?: string;
    website?: string;
    dateOfBirth?: string;
    companyAddress?: Address;
    shippingAddress?: Address;
    creditCard?: CreditCard;
    bankAccount?: BankAccount;
    subscription?: Subscription;
    userInterests?: UserInterest[];
}

export interface ProfileFormData {
    profile: Profile;
    securityQuestions: string[];
}

export interface UpdateGeneralProfileRequest {
    displayName: string;
    dateOfBirth?: string;
    question: string;
    response?: string;
    website?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

// Address Management Types
export interface UserProfileAddressViewModel {
    customerAddresses: Address[];
    companyAddresses: Address[];
}

export interface AddEditAddressViewModel {
    id?: number;
    name?: string;
    firstName: string;
    lastName: string;
    company?: string;
    streetAddress: string;
    streetAddress2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email?: string;
    addressType?: string;
    isPrimary?: boolean;
}

export interface MarkPrimaryAddressRequest {
    type: string;
}

export interface DropdownItem {
    value: string;
    text: string;
}

export interface CountryWithMask {
    id: number;
    name: string;
    cellPhoneMask: string;
}

export interface AddressFormData {
    countries: DropdownItem[];
    states: DropdownItem[];
    countriesWithMasks: CountryWithMask[];
}

// Payment Method Types
export interface PaymentMethodViewModel {
    paymentMethodId: number;
    name: string;
    mask: string;
    holderName?: string;
    isDefault: boolean;
    isActive: boolean;
}

export interface UserProfilePaymentMethodsViewModel {
    customerPayments: PaymentMethodViewModel[];
    companyPayments: PaymentMethodViewModel[];
}

export interface AddPaymentMethodFormData {
    billingAddresses: DropdownItem[];
    companyBillingAddresses: DropdownItem[];
}

export interface AddCreditCardRequest {
    paymentName?: string;
    cardholderName: string;
    cardNumber: string;
    paymentType: string;
    cvv: string;
    expiryDate: string;
    billingAddressId: number;
    isDefault: boolean;
}

// User Interests Types
export interface AddUserInterestRequest {
    categoryId: number;
}
