// Category interface - matches API response from backend
export interface Category {
    categoryId: number;
    categoryName: string;
    description?: string;
    videoCount?: number;
    isActive: boolean;
    userId?: number | null;
    dateAdded?: string;
    dateModified?: string;
    parentCategoryId?: number;
    parentCategoryName?: string;
    subCategoriesQuantity?: number;
}

// Quiz interfaces
export interface QuizAnswer {
    id?: number;
    text: string;
    isCorrect: boolean;
}

export interface QuizSettings {
    mustAnswer: boolean;
    answers: QuizAnswer[];
}

// Product variation interfaces
export interface VariationOption {
    id?: number;
    name: string; // e.g., "Size", "Color"
    values: string[]; // e.g., ["Small", "Medium", "Large"]
}

export interface VariationCombination {
    id?: number;
    options: { [key: string]: string }; // e.g., { "Size": "Small", "Color": "Red" }
    price?: number;
    salePrice?: number;
    sku?: string;
    barcode?: string;
    currentInventory?: number;
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
}

export interface ProductVariation {
    options: VariationOption[];
    combinations: VariationCombination[];
}

// Donation price interface - matches the expected API format
export interface DonationPrice {
    id?: number;
    price: number; // Use 'price' to match the existing API expectation
}

// Main form data type matching ProductViewModel structure
export interface AddProductFormData {
    // Core product fields
    id?: number;
    companyId: number;
    name: string;
    description: string;
    isActive: boolean;
    price: number;
    comparePrice?: number;
    salePrice?: number;
    salePriceExpiration?: string;
    sku?: string;
    barcode?: string;
    priceColor: string;
    productTypeId: number;
    externalLink?: string;

    // Media fields (now storing URLs instead of FileList)
    productImage?: string;
    productIcon?: string;
    productHeaderImage?: string; // This maps to File3/HeaderImage

    // Affiliate fields
    affiliateQS?: string;
    affiliateKey?: string;

    // Display preferences
    showPrice: boolean;
    headerType?: string;
    buttonText: string;

    // Physical product dimensions
    length?: number;
    width?: number;
    height?: number;
    weight?: number;

    // Inventory management
    manageInventory: boolean;
    currentInventory?: number;
    allowBackorders: boolean;

    // Distributor fields
    distributorProduct: boolean;
    distributorId?: number;
    linkToExternal: boolean;

    // Shipping settings
    customShipping: boolean;
    flatRateShippingCost?: number;
    shippingPerProduct: boolean;
    shippingTypeId?: number;
    customPrices: boolean;

    // Category and tagging
    primaryCategory?: string;
    tags?: string;

    // Complex data structures
    categories: Category[];
    variations?: ProductVariation;
    quizSettings?: QuizSettings;
    donationPriceList: DonationPrice[];
}
