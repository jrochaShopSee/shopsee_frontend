import axiosClient from "../utils/axiosClient";
import {
    Role,
    RolesListResponse,
    RolesQueryParams,
    UpdateRoleRequest,
    Capability,
    UpdateRoleCapabilitiesRequest,
    SecurityQuestion,
    SecurityQuestionsListResponse,
    SecurityQuestionsQueryParams,
    CreateSecurityQuestionRequest,
    UpdateSecurityQuestionRequest,
    Country,
    CountriesListResponse,
    CountriesQueryParams,
    CreateCountryRequest,
    UpdateCountryRequest,
    CountryDropdownItem,
    State,
    StatesListResponse,
    StatesQueryParams,
    CreateStateRequest,
    UpdateStateRequest,
    EcommerceStatusDetail,
    EcommerceStatusesListResponse,
    EcommerceStatusQueryParams,
    CreateEcommerceStatusRequest,
    UpdateEcommerceStatusRequest,
    Currency,
    CurrenciesListResponse,
    CurrencyQueryParams,
    CreateCurrencyRequest,
    UpdateCurrencyRequest,
    CategoriesListResponse,
    CategoriesQueryParams,
    CategoryDetail,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    ParentCategoryDropdownItem,
    SubCategoriesListResponse,
    CapabilitiesListResponse,
    CapabilitiesQueryParams,
    CapabilityDetail,
    CreateCapabilityRequest,
    UpdateCapabilityRequest,
    PayoutMinimumCost,
    UpdatePayoutMinimumCostRequest,
    SystemErrorsListResponse,
    SystemErrorsQueryParams,
    SystemErrorDetail,
} from "../types/Role";

class SettingsApi {
    // Roles Management
    async getRoles(params?: RolesQueryParams): Promise<RolesListResponse> {
        const res = await axiosClient.get("/api/settings/roles", { params });
        return res.data.data;
    }

    async getRoleById(id: number): Promise<Role> {
        const res = await axiosClient.get(`/api/settings/roles/${id}`);
        return res.data.data;
    }

    async updateRole(id: number, data: UpdateRoleRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/settings/roles/${id}`, data);
        return res.data.data;
    }

    // Capabilities Management
    async getAllCapabilities(): Promise<Capability[]> {
        const res = await axiosClient.get("/api/settings/capabilities/all");
        return res.data.data;
    }

    async getRoleCapabilities(roleId: number): Promise<Capability[]> {
        const res = await axiosClient.get(`/api/settings/roles/${roleId}/capabilities`);
        return res.data.data;
    }

    async updateRoleCapabilities(roleId: number, data: UpdateRoleCapabilitiesRequest): Promise<{ message: string }> {
        const res = await axiosClient.post(`/api/settings/roles/${roleId}/capabilities`, data);
        return res.data.data;
    }

    // Security Questions Management
    async getSecurityQuestions(params?: SecurityQuestionsQueryParams): Promise<SecurityQuestionsListResponse> {
        const res = await axiosClient.get("/api/settings/security-questions", { params });
        return res.data.data;
    }

    async getSecurityQuestionById(id: number): Promise<SecurityQuestion> {
        const res = await axiosClient.get(`/api/settings/security-questions/${id}`);
        return res.data.data;
    }

    async createSecurityQuestion(data: CreateSecurityQuestionRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/settings/security-questions", data);
        return res.data.data;
    }

    async updateSecurityQuestion(id: number, data: UpdateSecurityQuestionRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/settings/security-questions/${id}`, data);
        return res.data.data;
    }

    async deleteSecurityQuestion(id: number): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/settings/security-questions/${id}`);
        return res.data.data;
    }

    // Countries Management
    async getCountries(params?: CountriesQueryParams): Promise<CountriesListResponse> {
        const res = await axiosClient.get("/api/settings/countries", { params });
        return res.data.data;
    }

    async getCountryById(id: number): Promise<Country> {
        const res = await axiosClient.get(`/api/settings/countries/${id}`);
        return res.data.data;
    }

    async createCountry(data: CreateCountryRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/settings/countries", data);
        return res.data.data;
    }

    async updateCountry(id: number, data: UpdateCountryRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/settings/countries/${id}`, data);
        return res.data.data;
    }

    async toggleCountryStatus(id: number): Promise<{ message: string; isActive: boolean }> {
        const res = await axiosClient.post(`/api/settings/countries/${id}/toggle-status`);
        return res.data.data;
    }

    async deleteCountry(id: number): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/settings/countries/${id}`);
        return res.data.data;
    }

    async getCountriesDropdown(): Promise<CountryDropdownItem[]> {
        const res = await axiosClient.get("/api/settings/countries/dropdown");
        return res.data.data;
    }

    // States Management
    async getStatesByCountry(countryId: number, params?: StatesQueryParams): Promise<StatesListResponse> {
        const res = await axiosClient.get(`/api/settings/countries/${countryId}/states`, { params });
        return res.data.data;
    }

    async getStateById(id: number): Promise<State> {
        const res = await axiosClient.get(`/api/settings/states/${id}`);
        return res.data.data;
    }

    async createState(data: CreateStateRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/settings/states", data);
        return res.data.data;
    }

    async updateState(id: number, data: UpdateStateRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/settings/states/${id}`, data);
        return res.data.data;
    }

    async toggleStateStatus(id: number): Promise<{ message: string; isActive: boolean }> {
        const res = await axiosClient.post(`/api/settings/states/${id}/toggle-status`);
        return res.data.data;
    }

    async deleteState(id: number): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/settings/states/${id}`);
        return res.data.data;
    }

    // Ecommerce Status Management
    async getEcommerceStatuses(params?: EcommerceStatusQueryParams): Promise<EcommerceStatusesListResponse> {
        const res = await axiosClient.get("/api/settings/ecommerce-status", { params });
        return res.data.data;
    }

    async getEcommerceStatusById(id: number): Promise<EcommerceStatusDetail> {
        const res = await axiosClient.get(`/api/settings/ecommerce-status/${id}`);
        return res.data.data;
    }

    async createEcommerceStatus(data: CreateEcommerceStatusRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/settings/ecommerce-status", data);
        return res.data.data;
    }

    async updateEcommerceStatus(id: number, data: UpdateEcommerceStatusRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/settings/ecommerce-status/${id}`, data);
        return res.data.data;
    }

    async toggleEcommerceStatusStatus(id: number): Promise<{ message: string; isActive: boolean }> {
        const res = await axiosClient.post(`/api/settings/ecommerce-status/${id}/toggle-status`);
        return res.data.data;
    }

    async deleteEcommerceStatus(id: number): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/settings/ecommerce-status/${id}`);
        return res.data.data;
    }

    // Currency Management
    async getCurrencies(params?: CurrencyQueryParams): Promise<CurrenciesListResponse> {
        const res = await axiosClient.get("/api/settings/currencies", { params });
        return res.data.data;
    }

    async getCurrencyById(id: number): Promise<Currency> {
        const res = await axiosClient.get(`/api/settings/currencies/${id}`);
        return res.data.data;
    }

    async createCurrency(data: CreateCurrencyRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/settings/currencies", data);
        return res.data.data;
    }

    async updateCurrency(id: number, data: UpdateCurrencyRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/settings/currencies/${id}`, data);
        return res.data.data;
    }

    async toggleCurrencyStatus(id: number): Promise<{ message: string; isActive: boolean }> {
        const res = await axiosClient.post(`/api/settings/currencies/${id}/toggle-status`);
        return res.data.data;
    }

    // Categories Management
    async getCategories(params?: CategoriesQueryParams): Promise<CategoriesListResponse> {
        const res = await axiosClient.get("/api/settings/categories", { params });
        return res.data.data;
    }

    async getCategoryById(id: number): Promise<CategoryDetail> {
        const res = await axiosClient.get(`/api/settings/categories/${id}`);
        return res.data.data;
    }

    async getSubCategories(id: number): Promise<SubCategoriesListResponse> {
        const res = await axiosClient.get(`/api/settings/categories/${id}/subcategories`);
        return res.data.data;
    }

    async getParentCategoriesDropdown(): Promise<ParentCategoryDropdownItem[]> {
        const res = await axiosClient.get("/api/settings/categories/dropdown");
        return res.data.data;
    }

    async createCategory(data: CreateCategoryRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/settings/categories", data);
        return res.data.data;
    }

    async updateCategory(id: number, data: UpdateCategoryRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/settings/categories/${id}`, data);
        return res.data.data;
    }

    async deleteCategory(id: number): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/settings/categories/${id}`);
        return res.data.data;
    }

    // Capabilities Management (standalone)
    async getCapabilitiesManagement(params?: CapabilitiesQueryParams): Promise<CapabilitiesListResponse> {
        const res = await axiosClient.get("/api/settings/capabilities/management", { params });
        return res.data.data;
    }

    async getCapabilityById(id: number): Promise<CapabilityDetail> {
        const res = await axiosClient.get(`/api/settings/capabilities/management/${id}`);
        return res.data.data;
    }

    async createCapability(data: CreateCapabilityRequest): Promise<{ message: string; id: number }> {
        const res = await axiosClient.post("/api/settings/capabilities/management", data);
        return res.data.data;
    }

    async updateCapability(id: number, data: UpdateCapabilityRequest): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/settings/capabilities/management/${id}`, data);
        return res.data.data;
    }

    async deleteCapability(id: number): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/settings/capabilities/management/${id}`);
        return res.data.data;
    }

    // Payout Minimum Cost Management
    async getPayoutMinimumCost(): Promise<PayoutMinimumCost> {
        const res = await axiosClient.get("/api/settings/payout-minimum-cost");
        return res.data.data;
    }

    async updatePayoutMinimumCost(data: UpdatePayoutMinimumCostRequest): Promise<{ message: string }> {
        const res = await axiosClient.put("/api/settings/payout-minimum-cost", data);
        return res.data.data;
    }

    // System Errors Management
    async getSystemErrors(params?: SystemErrorsQueryParams): Promise<SystemErrorsListResponse> {
        const res = await axiosClient.get("/api/settings/system-errors", { params });
        return res.data.data;
    }

    async getSystemErrorById(id: string): Promise<SystemErrorDetail> {
        const res = await axiosClient.get(`/api/settings/system-errors/${id}`);
        return res.data.data;
    }
}

export const settingsApi = new SettingsApi();
