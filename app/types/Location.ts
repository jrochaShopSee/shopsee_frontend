export interface Location {
    id: number;
    streetAddress: string;
    streetAddress2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    contactFirstName: string;
    contactLastName: string;
    phone: string;
    email: string;
    active: boolean;
    addressName: string;
    dateAdded: string;
    dateModified: string;
}

export interface LocationsListResponse {
    data: Location[];
    hasMore: boolean;
    totalCount: number;
}

export interface DropdownItem {
    value: string;
    text: string;
}

export interface CountryModel {
    id: number;
    name: string;
    cellPhoneMask?: string;
}

export interface LocationFormData {
    countries: DropdownItem[];
    states: DropdownItem[];
    countriesWithMasks: CountryModel[];
    roles: DropdownItem[];
    companies: DropdownItem[];
    customers: DropdownItem[];
    admins: DropdownItem[];
    sales: DropdownItem[];
    addressTypes: DropdownItem[];
    role: string;
}

export interface LocationDetails {
    id: number;
    addressName?: string;
    firstName: string;
    lastName: string;
    streetAddress: string;
    streetAddress2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
    active: boolean;
}

export interface CreateLocationRequest {
    firstName: string;
    lastName: string;
    addressName?: string;
    streetAddress: string;
    streetAddress2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
    company?: string;
    addressType: string;
    isPrimary: boolean;
    selectedRole: string;
    companyId?: number;
    customerId?: number;
    adminId?: number;
    salesId?: number;
}

export interface UpdateLocationRequest {
    id: number;
    addressName?: string;
    firstName: string;
    lastName: string;
    streetAddress: string;
    streetAddress2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
}