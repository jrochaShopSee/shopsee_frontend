// Role types for settings management

export interface Role {
    roleId: number;
    name: string;
    description: string;
    order: number;
    isActive: boolean;
}

export interface RolesListResponse {
    data: Role[];
    hasMore: boolean;
    totalCount: number;
}

export interface UpdateRoleRequest {
    roleId: number;
    name: string;
    description: string;
    order: number;
    isActive: boolean;
}

export interface Capability {
    capabilityId: number;
    capabilityName: string;
    isActive: boolean;
}

export interface UpdateRoleCapabilitiesRequest {
    roleId: number;
    capabilityIds: number[];
}

export interface RolesQueryParams {
    skip?: number;
    take?: number;
    search?: string;
}

// Security Question types
export interface SecurityQuestion {
    id: number;
    question: string;
}

export interface SecurityQuestionsListResponse {
    data: SecurityQuestion[];
    hasMore: boolean;
    totalCount: number;
}

export interface CreateSecurityQuestionRequest {
    question: string;
}

export interface UpdateSecurityQuestionRequest {
    id: number;
    question: string;
}

export interface SecurityQuestionsQueryParams {
    skip?: number;
    take?: number;
    search?: string;
}

// Country types
export interface Country {
    id: number;
    countryName: string;
    abbr: string;
    order: number;
    isActive: boolean;
    stateCount: number;
}

export interface CountriesListResponse {
    data: Country[];
    hasMore: boolean;
    totalCount: number;
}

export interface CreateCountryRequest {
    countryName: string;
    abbr: string;
    order: number;
    isActive: boolean;
}

export interface UpdateCountryRequest {
    id: number;
    countryName: string;
    abbr: string;
    order: number;
    isActive: boolean;
}

export interface CountryDropdownItem {
    value: number;
    text: string;
}

export interface CountriesQueryParams {
    skip?: number;
    take?: number;
    search?: string;
}

// State types
export interface State {
    id: number;
    stateName: string;
    abbreviation: string;
    countryId: number;
    countryName: string;
    order: number;
    isActive: boolean;
}

export interface StatesListResponse {
    data: State[];
    hasMore: boolean;
    totalCount: number;
    countryId: number;
    countryName: string;
}

export interface CreateStateRequest {
    stateName: string;
    abbreviation: string;
    countryId: number;
    order: number;
    isActive: boolean;
}

export interface UpdateStateRequest {
    id: number;
    stateName: string;
    abbreviation: string;
    countryId: number;
    order: number;
    isActive: boolean;
}

export interface StatesQueryParams {
    skip?: number;
    take?: number;
    search?: string;
}

// Ecommerce Status types
export interface EcommerceStatus {
    id: number;
    statusName: string;
    isActive: boolean;
    emailTriggered: boolean;
    adminEmailTriggered: boolean;
    companyEmailTriggered: boolean;
}

export interface EcommerceStatusDetail {
    id: number;
    statusName: string;
    isActive: boolean;
    emailTriggered: boolean;
    emailSubject: string;
    emailMessage: string;
    adminEmailTriggered: boolean;
    adminEmailSubject: string;
    adminEmailMessage: string;
    companyEmailTriggered: boolean;
    companyEmailSubject: string;
    companyEmailMessage: string;
}

export interface EcommerceStatusesListResponse {
    data: EcommerceStatus[];
    hasMore: boolean;
    totalCount: number;
}

export interface CreateEcommerceStatusRequest {
    statusName: string;
    isActive: boolean;
    emailTriggered: boolean;
    emailSubject: string;
    emailMessage: string;
    adminEmailTriggered: boolean;
    adminEmailSubject: string;
    adminEmailMessage: string;
    companyEmailTriggered: boolean;
    companyEmailSubject: string;
    companyEmailMessage: string;
}

export interface UpdateEcommerceStatusRequest {
    id: number;
    statusName: string;
    isActive: boolean;
    emailTriggered: boolean;
    emailSubject: string;
    emailMessage: string;
    adminEmailTriggered: boolean;
    adminEmailSubject: string;
    adminEmailMessage: string;
    companyEmailTriggered: boolean;
    companyEmailSubject: string;
    companyEmailMessage: string;
}

export interface EcommerceStatusQueryParams {
    skip?: number;
    take?: number;
    search?: string;
}

// Currency types
export interface Currency {
    id: number;
    currencyName: string;
    currencyCode: string;
    isActive: boolean;
}

export interface CurrenciesListResponse {
    data: Currency[];
    hasMore: boolean;
    totalCount: number;
}

export interface CreateCurrencyRequest {
    currencyName: string;
    currencyCode: string;
    isActive: boolean;
}

export interface UpdateCurrencyRequest {
    id: number;
    currencyName: string;
    currencyCode: string;
    isActive: boolean;
}

export interface CurrencyQueryParams {
    skip?: number;
    take?: number;
    search?: string;
}

// Category types
export interface Category {
    categoryId: number;
    categoryName: string;
    isActive: boolean;
    parentCategoryId?: number;
    parentCategoryName?: string;
    subCategoriesCount: number;
}

export interface CategoriesListResponse {
    data: Category[];
    hasMore: boolean;
    totalCount: number;
}

export interface CategoryDetail {
    categoryId: number;
    categoryName: string;
    isActive: boolean;
    parentCategoryId?: number;
    parentCategoryName?: string;
}

export interface CreateCategoryRequest {
    categoryName: string;
    isActive: boolean;
    parentCategoryId?: number;
}

export interface UpdateCategoryRequest {
    categoryId: number;
    categoryName: string;
    isActive: boolean;
    parentCategoryId?: number;
}

export interface ParentCategoryDropdownItem {
    value: number;
    text: string;
}

export interface SubCategory {
    categoryId: number;
    categoryName: string;
    isActive: boolean;
    parentCategoryId?: number;
}

export interface SubCategoriesListResponse {
    data: SubCategory[];
    categoryId: number;
    categoryName: string;
}

export interface CategoriesQueryParams {
    skip?: number;
    take?: number;
    search?: string;
}

// Capability types for standalone management
export interface CapabilityManagement {
    capabilityId: number;
    capabilityName: string;
    isActive: boolean;
}

export interface CapabilitiesListResponse {
    data: CapabilityManagement[];
    hasMore: boolean;
    totalCount: number;
}

export interface CapabilityDetail {
    capabilityId: number;
    capabilityName: string;
    isActive: boolean;
}

export interface CreateCapabilityRequest {
    capabilityName: string;
    isActive: boolean;
}

export interface UpdateCapabilityRequest {
    capabilityId: number;
    capabilityName: string;
    isActive: boolean;
}

export interface CapabilitiesQueryParams {
    skip?: number;
    take?: number;
    search?: string;
}

// Payout Minimum Cost types
export interface PayoutMinimumCost {
    settingName: string;
    settingValue: string;
}

export interface UpdatePayoutMinimumCostRequest {
    minimumValue: number;
}

// System Errors types
export interface SystemError {
    errorId: string;
    message: string;
    timeUtc: string;
    statusCode: number;
    type: string;
    source: string;
    user: string;
    host: string;
}

export interface SystemErrorsListResponse {
    data: SystemError[];
    hasMore: boolean;
    totalCount: number;
}

export interface SystemErrorDetail {
    errorId: string;
    application: string;
    host: string;
    type: string;
    source: string;
    message: string;
    user: string;
    statusCode: number;
    timeUtc: string;
    sequence: number;
    allXml: string;
}

export interface SystemErrorsQueryParams {
    skip?: number;
    take?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    statusCode?: number;
}

// Video types
export interface Video {
    id: number;
    title: string;
    displayName: string;
    companyId: number;
    companyName: string;
    isActive: boolean;
    isPrivate: boolean;
    thumbnail?: string;
    videoLengthSeconds?: number;
    sourceType?: string;
    videoStatus?: string;
    createdDate: string;
    modifiedDate: string;
    guid?: string;
}

export interface VideosListResponse {
    data: Video[];
    hasMore: boolean;
    totalCount: number;
}

export interface VideoDetail {
    id: number;
    title: string;
    displayName: string;
    name: string;
    description?: string;
    companyId: number;
    companyName: string;
    isActive: boolean;
    isPrivate: boolean;
    isFeatured: boolean;
    thumbnail?: string;
    videoLengthSeconds?: number;
    sourceType?: string;
    videoUrl?: string;
    hlsManifestUrl?: string;
    dashManifestUrl?: string;
    usesDash?: boolean;
    usesHls?: boolean;
    displayBranding: boolean;
    hasConsent: boolean;
    canFastForward: boolean;
    consentTemplateId?: string;
    consentTime?: number;
    consentDischarge?: string;
    consentDischargeOptional?: boolean;
    consentDischargeTime?: number;
    consentSurvey?: string;
    consentSurveyLink?: string;
    consentSurveyTime?: number;
    consentSameUserCanSignAgain?: boolean;
    videoFingerprint?: string;
    videoDockIconsBehaviorTypeId: number;
    createdDate: string;
    modifiedDate: string;
    guid?: string;
    categoryIds: number[];
}

export interface CreateVideoRequest {
    companyId: number;
    title: string;
    displayName: string;
    name: string;
    description?: string;
    isActive?: boolean;
    isPrivate?: boolean;
    isFeatured?: boolean;
    sourceType?: string;
    videoUrl?: string;
    displayBranding?: boolean;
    hasConsent?: boolean;
    canFastForward?: boolean;
    consentTemplateId?: string;
    consentTime?: number;
    consentDischarge?: string;
    consentDischargeOptional?: boolean;
    consentDischargeTime?: number;
    consentSurvey?: string;
    consentSurveyLink?: string;
    consentSurveyTime?: number;
    consentSameUserCanSignAgain?: boolean;
    videoFingerprint?: string;
    videoDockIconsBehaviorTypeId?: number;
    categoryIds?: number[];
}

export interface UpdateVideoRequest {
    id: number;
    title: string;
    displayName: string;
    name: string;
    description?: string;
    isActive: boolean;
    isPrivate: boolean;
    isFeatured: boolean;
    displayBranding: boolean;
    hasConsent: boolean;
    canFastForward: boolean;
    consentTemplateId?: string;
    consentTime?: number;
    consentDischarge?: string;
    consentDischargeOptional?: boolean;
    consentDischargeTime?: number;
    consentSurvey?: string;
    consentSurveyLink?: string;
    consentSurveyTime?: number;
    consentSameUserCanSignAgain?: boolean;
    videoFingerprint?: string;
    videoDockIconsBehaviorTypeId: number;
    categoryIds: number[];
}

export interface VideoShareInfo {
    shareLink: string;
    embedCode: string;
}

export interface VideosQueryParams {
    skip?: number;
    take?: number;
    search?: string;
}
