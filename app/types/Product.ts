// Product Types
export interface Product {
    id: number;
    companyName: string;
    name: string;
    productTypeName: string;
    productTypeId: number;
    price: number;
    isActive: boolean;
    modifiedDate: string;
    createdDate: string;
    companyId: number;
    donationPrices: number[];
    shopifyProductId?: number | null;
    shopifyShopId?: string | null;
}

// Category type for product categories (matches backend CategoryViewModel)
export interface ProductCategory {
    categoryId: number;
    categoryName: string;
    description?: string;
    videoCount?: number;
    isActive?: boolean;
    userId?: number | null;
    dateAdded?: string;
    dateModified?: string;
    parentCategoryId?: number | null;
    parentCategoryName?: string;
}

// Product Variation types (matches backend ProductVariation)
export interface ProductVariationOption {
    id: string;
    name: string;
    values: string[];
}

export interface ProductVariationCombination {
    id?: string;
    shopifyVariantId?: number | null;
    options: Record<string, string>;
    price?: number | null;
    salePrice?: number | null;
    currentInventory?: number | null;
    sku?: string | null;
    barcode?: string | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
    weight?: number | null;
}

export interface ProductVariation {
    options: ProductVariationOption[];
    combinations: ProductVariationCombination[];
}

// Quiz Answer type for UI display
export interface QuizAnswer {
    id?: number;
    text: string;
    isCorrect: boolean;
}

// Quiz Settings type - supports both backend format and UI format
export interface QuizSettings {
    // Backend format (QuizSettingsViewModel)
    productQuizOptionId?: number;
    firstAnswer?: string;
    secondAnswer?: string;
    thirdAnswer?: string | null;
    fourthAnswer?: string | null;
    correctAnswers?: string[];
    mustAnswer?: boolean;
    multiple?: boolean;
    // UI format (transformed for display)
    answers?: QuizAnswer[];
}

export interface ProductDetails {
    id: number;
    companyId: number;
    companyName: string;
    name: string;
    description: string;
    isActive: boolean;
    price: number;
    comparePrice?: number | null;
    salePrice?: number | null;
    salePriceExpiration?: string | null;
    sku?: string | null;
    barCode?: string | null;
    priceColor?: string | null;
    productTypeId: number;
    externalLink?: string | null;
    productImage?: string | null;
    productIcon?: string | null;
    productHeaderImage?: string | null;
    affiliateQS?: string | null;
    affiliateKey?: string | null;
    showPrice: boolean;
    headerType?: string | null;
    buttonText?: string | null;
    length: number;
    width: number;
    height: number;
    weight: number;
    shopifyShopId?: string | null;
    shopifyProductId?: number | null;
    shopifyAccessId?: string | null;
    shopifyDefaultVariantId?: number | null;
    manageInventory: boolean;
    currentInventory?: number | null;
    allowBackorders: boolean;
    linkToExternal: boolean;
    customShipping: boolean;
    flatRateShippingCost?: number | null;
    shippingPerProduct: boolean;
    shippingTypeId?: number | null;
    customPrices: boolean;
    donationPriceList: DonationPrice[];
    categories?: ProductCategory[];
    variations?: ProductVariation | null;
    quizSettings?: QuizSettings | null;
    createdDate: string;
    modifiedDate: string;
}

export interface DonationPrice {
    id?: number;
    price: number;
    productId?: number;
}

export interface ProductFormData {
    companies: SelectOption[];
    productTypes: SelectOption[];
    headerTypes: SelectOption[];
    shippingTypes: SelectOption[];
    currencies: SelectOption[];
    distributors: SelectOption[];
    role: string;
    companyId: number;
    subscriptionLevel: number;
}

export interface SelectOption {
    Value: string;
    Text: string;
    Selected?: boolean;
}

export interface CreateProductRequest {
    product: ProductCreateData;
    donationPriceList?: DonationPrice[];
}

export interface UpdateProductRequest {
    product: ProductUpdateData;
    donationPriceList?: DonationPrice[];
}

export interface ProductCreateData {
    companyId: number;
    name: string;
    description: string;
    isActive: boolean;
    price: number;
    comparePrice?: number;
    salePrice?: number;
    salePriceExpiration?: string;
    sku?: string;
    barCode?: string;
    priceColor?: string;
    productTypeId: number;
    externalLink?: string;
    productImage?: string;
    productIcon?: string;
    productHeaderImage?: string;
    affiliateQS?: string;
    affiliateKey?: string;
    showPrice: boolean;
    headerType?: string;
    buttonText?: string;
    length: number | undefined;
    width: number | undefined;
    height: number | undefined;
    weight: number | undefined;
    manageInventory: boolean;
    currentInventory?: number;
    allowBackorders: boolean;
    distributorId?: number;
    linkToExternal: boolean;
    customShipping: boolean;
    flatRateShippingCost?: number;
    shippingPerProduct: boolean;
    shippingTypeId?: number;
    customPrices: boolean;
}

export interface ProductUpdateData extends ProductCreateData {
    id: number;
}

export interface ProductsResponse {
    data: Product[];
    hasMore: boolean;
    totalCount: number;
    isFromShopify: boolean;
    role: string;
    companyId: number;
    shopAccess?: unknown;
    shopName?: string;
}

export interface ProductStatistics {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    averagePrice: number;
}

export interface ProductExportParams {
    format: "csv" | "json";
}

export const PRODUCT_TYPES = {
    SIMPLE: 1,
    VARIABLE: 2,
    EXTERNAL: 3,
    DIGITAL: 4,
    DONATION: 5,
    PHYSICAL: 6,
    QUIZ: 7,
} as const;
