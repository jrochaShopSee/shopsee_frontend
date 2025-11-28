// Re-export Category from categoriesApi - this is what the UI components use
// The categoriesApi Category uses: id, name, parentId, parentName (matching backend JsonProperty serialization)
import { Category } from "@/app/services/categoriesApi";
export type { Category };

// Re-export ProductVariation types from Product.ts - matches backend format
import {
    ProductVariation,
    ProductVariationOption,
    ProductVariationCombination,
    QuizSettings,
    QuizAnswer
} from "@/app/types/Product";
export type {
    ProductVariation,
    ProductVariationOption as VariationOption,
    ProductVariationCombination as VariationCombination,
    QuizSettings,
    QuizAnswer
};

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
