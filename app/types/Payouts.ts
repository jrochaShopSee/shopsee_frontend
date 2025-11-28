// Main data interfaces
export interface PayoutListItem {
  payoutId: number;
  vendorId: number;
  vendorName: string;
  lastOrderDate: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  orders: OrderDetails[];
}

export interface PaidPayoutListItem {
  vendorId: number;
  vendorName: string;
  orderDate: string;
  total: number;
  vendorPayouts: VendorPayoutDetails[];
}

export interface VendorPayoutDetails {
  payoutId: number;
  lastOrderDate: string;
  total: number;
  orders: OrderDetails[];
}

export interface OrderDetails {
  id: number;
  orderDate: string;
  total: number;
  subTotal: number;
  applicationFee: number;
  tax: number;
  shipping: number;
  items: OrderItemDetails[];
}

export interface OrderItemDetails {
  productName: string;
  quantity: number;
  total: number;
  subtotal: number;
  tax: number;
}

export interface VendorListItem {
  value: string;
  text: string;
}

// API Response interfaces
export interface PendingPayoutsResponse {
  data: PayoutListItem[];
  hasMore: boolean;
  totalCount: number;
  minimumCost: number;
  totalPending: number;
  totalPhysicalProducts: number;
  totalDigitalProducts: number;
  totalDonationProducts: number;
  vendorsList: VendorListItem[];
  aboveMinimumCount: number;
  belowMinimumCount: number;
  section: string;
}

export interface PaidPayoutsResponse {
  data: PaidPayoutListItem[];
  hasMore: boolean;
  totalCount: number;
  totalPaid: number;
  totalPhysicalProducts: number;
  totalDigitalProducts: number;
  totalDonationProducts: number;
  vendorsList: VendorListItem[];
}

// Request interfaces
export interface PayPayoutRequest {
  orderIds: number[];
}

export interface UndoPayoutRequest {
  payoutIds: number[];
}

// API Query parameters
export interface PendingPayoutsParams {
  skip?: number;
  take?: number;
  section?: 'above' | 'below';
  search?: string;
  sortBy?: 'Vendor' | 'Total' | 'LastOrder';
  sortOrder?: 'Asc' | 'Desc';
  vendorId?: number;
}

export interface PaidPayoutsParams {
  skip?: number;
  take?: number;
  search?: string;
  sortBy?: 'Vendor' | 'Total' | 'LastOrder';
  sortOrder?: 'Asc' | 'Desc';
  vendorId?: number;
}

// Constants
export const SORT_OPTIONS = [
  { value: 'Vendor', label: 'Vendor' },
  { value: 'Total', label: 'Total' },
  { value: 'LastOrder', label: 'Last Order Date' }
] as const;

export const SORT_ORDERS = [
  { value: 'Desc', label: 'Descending' },
  { value: 'Asc', label: 'Ascending' }
] as const;

export const PAYOUT_SECTIONS = [
  { value: 'above', label: 'Above Minimum' },
  { value: 'below', label: 'Below Minimum' }
] as const;