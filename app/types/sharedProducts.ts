export interface ProductSharedDetails {
    id: number;
    name: string;
    owner: string;
    image: string;
    percentage: number;
    soldCount: number;
    ownerId: number;
}

export interface UserConnectionDetails {
    id: number;
    displayName: string;
    profilePicture: string;
    userRole: string;
    sharedProductsCount: number;
    sold: number;
    revenue: number;
    sharedPendingProductsList: ProductSharedDetails[];
    sharedProductsList: ProductSharedDetails[];
}

export interface SharedProductManagementModel {
    userConnectionDetailsList: UserConnectionDetails[];
    pendingReviewProductsList: ProductSharedDetails[];
    productsSharedWithMe: ProductSharedDetails[];
}

export interface ContentCreatorProductInfo {
    followersCount: number;
    image: string;
    name: string;
    videosCount: number;
    productDetailsSharedList: ProductDetail[];
}

export interface ProductDetail {
    id: number;
    name: string;
    price: number;
    productImage: string;
}

export interface ProductDetailForEdit extends ProductDetail {
    percentage: number;
}

export interface ShareProductRequest {
    companyId: number;
    productId: number;
    percentage: number;
}

export interface EditProductRequest {
    companyId: number;
    productId: number;
    percentage: number;
}

export interface RemoveProductRequest {
    companyId: number;
    productId: number;
}

export interface ProductReviewDetails {
    id: number;
    name: string;
    price: number;
    description: string;
    productImage: string;
    variations?: ProductVariation[];
}

export interface ProductVariation {
    name: string;
    enabled: boolean;
    options: VariationOption[];
}

export interface VariationOption {
    name: string;
}
