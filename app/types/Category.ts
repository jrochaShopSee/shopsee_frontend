export interface CategoryModel {
    categoryId: number;
    categoryName: string;
    description?: string;
    videoCount?: number;
    isActive: boolean;
    userId?: number | null;
    dateAdded?: string;
    dateModified?: string;
    parentCategoryId?: number | null;
    parentCategoryName?: string;
    subCategoriesQuantity?: number;
}

export interface CategoryResults {
    categories: CategoryModel[];
    totalCount: number;
}
