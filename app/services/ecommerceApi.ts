// services/ecommerceApi.ts
import axiosClient from "@/app/utils/axiosClient";
import type { EcommerceCustomer, EcommerceOrder, CustomersListResponse, OrdersListResponse, OrderDetailsResponse, CustomerDetailsResponse, OrderNotesResponse, EcommerceFilters, PaginationParams, InfiniteScrollResponse, OrderStatus, OrderNote, OrderStatistics, CustomerStatistics, AddOrderNoteRequest, UpdateOrderStatusRequest, UpdateTrackingRequest } from "@/app/types/ecommerce";

export class EcommerceApiService {
    private baseUrl = "/api/ecommerce";

    // Statistics Endpoints
    async getOrderStatistics(filters: EcommerceFilters = {}): Promise<OrderStatistics> {
        try {
            const response = await axiosClient.get<{ status: string; data: OrderStatistics }>(`${this.baseUrl}/orders/statistics`, {
                params: {
                    search: filters.search || "",
                    status: filters.status || "",
                    dateFrom: filters.dateFrom || "",
                    dateTo: filters.dateTo || "",
                    customerId: filters.customerId || null,
                },
            });

            if (response.data.status === "success") {
                return response.data.data;
            } else {
                throw new Error("Failed to fetch order statistics");
            }
        } catch (error) {
            console.error("Error fetching order statistics:", error);
            throw error;
        }
    }

    async getCustomerStatistics(filters: Pick<EcommerceFilters, "search"> = {}): Promise<CustomerStatistics> {
        try {
            const response = await axiosClient.get<{ status: string; data: CustomerStatistics }>(`${this.baseUrl}/customers/statistics`, {
                params: {
                    search: filters.search || "",
                },
            });

            if (response.data.status === "success") {
                return response.data.data;
            } else {
                throw new Error("Failed to fetch customer statistics");
            }
        } catch (error) {
            console.error("Error fetching customer statistics:", error);
            throw error;
        }
    }

    // Customers
    async getCustomers(params: PaginationParams & EcommerceFilters = { skip: 0, take: 50 }): Promise<InfiniteScrollResponse<EcommerceCustomer>> {
        try {
            const response = await axiosClient.get<CustomersListResponse>(`${this.baseUrl}/customers`, {
                params: {
                    skip: params.skip,
                    take: params.take,
                    search: params.search || "",
                    sortBy: params.sortBy || "dateCreated",
                    sortDirection: params.sortDirection || "desc",
                },
            });

            if (response.data.status === "success") {
                return {
                    data: response.data.data || [],
                    hasMore: response.data.hasMore || false,
                    totalCount: response.data.totalCount || 0,
                    nextSkip: response.data.nextSkip,
                };
            } else {
                throw new Error(response.data.errorMessage || "Failed to fetch customers");
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
            throw error;
        }
    }

    async getCustomer(id: number): Promise<EcommerceCustomer> {
        try {
            const response = await axiosClient.get<CustomerDetailsResponse>(`${this.baseUrl}/customers/${id}`);

            if (response.data.status === "success" && response.data.data) {
                return response.data.data;
            } else {
                throw new Error(response.data.errorMessage || "Failed to fetch customer");
            }
        } catch (error) {
            console.error("Error fetching customer:", error);
            throw error;
        }
    }

    // Orders
    async getOrders(params: PaginationParams & EcommerceFilters = { skip: 0, take: 50 }): Promise<InfiniteScrollResponse<EcommerceOrder>> {
        try {
            const response = await axiosClient.get<OrdersListResponse>(`${this.baseUrl}/orders`, {
                params: {
                    skip: params.skip,
                    take: params.take,
                    search: params.search || "",
                    status: params.status || "",
                    dateFrom: params.dateFrom || "",
                    dateTo: params.dateTo || "",
                    customerId: params.customerId || null,
                    sortBy: params.sortBy || "orderDate",
                    sortDirection: params.sortDirection || "desc",
                },
            });

            if (response.data.status === "success") {
                console.log(response.data.data);
                return {
                    data: response.data.data || [],
                    hasMore: response.data.hasMore || false,
                    totalCount: response.data.totalCount || 0,
                    nextSkip: response.data.nextSkip,
                };
            } else {
                throw new Error(response.data.errorMessage || "Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error;
        }
    }

    async getOrder(id: number, isShopify: boolean = false): Promise<EcommerceOrder> {
        try {
            const response = await axiosClient.get<OrderDetailsResponse>(`${this.baseUrl}/orders/${id}`, {
                params: {
                    isShopify: isShopify
                }
            });

            if (response.data.status === "success" && response.data.data) {
                return response.data.data;
            } else {
                throw new Error(response.data.errorMessage || "Failed to fetch order");
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            throw error;
        }
    }

    // Order Status Management
    async getOrderStatuses(): Promise<OrderStatus[]> {
        try {
            // Try the primary endpoint
            const response = await axiosClient.get<{ status: string; data: OrderStatus[] }>(`${this.baseUrl}/order-statuses`);

            if (response.data.status === "success" && response.data.data) {
                return response.data.data;
            }

            // Fallback to alternative endpoint structure
            if (Array.isArray(response.data)) {
                // eslint-disable-next-line
                return response.data.map((status: any) => ({
                    id: status.ID || status.id,
                    statusName: status.Value || status.StatusName || status.statusName || status.name,
                    active: status.Active ?? status.active ?? true,
                    emailTriggered: status.EmailTriggered ?? status.emailTriggered ?? false,
                    adminEmailTriggered: status.AdminEmailTriggered ?? status.adminEmailTriggered ?? false,
                    companyEmailTriggered: status.CompanyEmailTriggered ?? status.companyEmailTriggered ?? false,
                }));
            }

            throw new Error("Invalid response format for order statuses");
        } catch (error) {
            console.error("Error fetching order statuses:", error);

            throw error;
        }
    }

    // Order Management Methods
    async updateOrderStatus(orderId: number, status: string): Promise<void> {
        try {
            const payload: UpdateOrderStatusRequest = { status };
            const response = await axiosClient.put(`${this.baseUrl}/orders/${orderId}/status`, payload);

            if (response.data.status !== "success") {
                throw new Error(response.data.errorMessage || "Failed to update order status");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            throw error;
        }
    }

    // Order Notes Management
    async getOrderNotes(orderId: number): Promise<OrderNote[]> {
        try {
            const response = await axiosClient.get<OrderNotesResponse>(`${this.baseUrl}/orders/${orderId}/notes`);

            if (response.data.status === "success") {
                return response.data.data || [];
            } else {
                throw new Error(response.data.errorMessage || "Failed to fetch order notes");
            }
        } catch (error) {
            console.error("Error fetching order notes:", error);

            // Return empty array instead of throwing - notes are not critical
            console.warn("Returning empty notes array due to API error");
            return [];
        }
    }

    async addOrderNote(orderId: number, note: string, isCustomerNote: boolean = false): Promise<void> {
        try {
            const payload: AddOrderNoteRequest = {
                content: note,
                isCustomerNote: isCustomerNote,
            };

            const response = await axiosClient.post(`${this.baseUrl}/orders/${orderId}/notes`, payload);

            if (response.data.status !== "success") {
                throw new Error(response.data.errorMessage || "Failed to add order note");
            }
        } catch (error) {
            console.error("Error adding order note:", error);
            throw error;
        }
    }

    // Order Tracking Management
    async updateOrderTracking(orderId: number, trackingNumber: string, shippingMethod?: string): Promise<void> {
        try {
            const payload: UpdateTrackingRequest = {
                trackingNumber: trackingNumber,
                shippingMethod: shippingMethod,
            };

            const response = await axiosClient.put(`${this.baseUrl}/orders/${orderId}/tracking`, payload);

            if (response.data.status !== "success") {
                throw new Error(response.data.errorMessage || "Failed to update tracking information");
            }
        } catch (error) {
            console.error("Error updating order tracking:", error);
            throw error;
        }
    }
    exportCustomersToCSV(customers: EcommerceCustomer[]): void {
        const csvContent = this.convertToCSV(customers, [
            { key: "id", label: "ID" },
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "totalOrders", label: "Total Orders" },
            { key: "totalSpent", label: "Total Spent" },
            { key: "customerSince", label: "Customer Since" },
            { key: "isActive", label: "Active" },
        ]);
        this.downloadCSV(csvContent, "customers.csv");
    }

    exportOrdersToCSV(orders: EcommerceOrder[]): void {
        const csvContent = this.convertToCSV(orders, [
            { key: "id", label: "Order ID" },
            { key: "guid", label: "Order GUID" },
            { key: "customerName", label: "Customer Name" },
            { key: "customerEmail", label: "Customer Email" },
            { key: "orderTotal", label: "Total Amount" },
            { key: "orderStatus", label: "Status" },
            { key: "formattedDate", label: "Order Date" },
            { key: "itemsCount", label: "Items Count" },
            { key: "trackingNumber", label: "Tracking Number" },
        ]);
        this.downloadCSV(csvContent, "orders.csv");
    }

    private convertToCSV(data: EcommerceCustomer[] | EcommerceOrder[], columns: { key: string; label: string }[]): string {
        const headers = columns.map((col) => col.label).join(",");
        const rows = data.map((item) =>
            columns
                .map((col) => {
                    const value = this.getNestedValue(item as unknown as Record<string, unknown>, col.key);
                    return `"${value || ""}"`;
                })
                .join(",")
        );
        return [headers, ...rows].join("\n");
    }

    private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
        return path.split(".").reduce((current: unknown, key: string) => {
            if (current && typeof current === "object" && current !== null && key in current) {
                return (current as Record<string, unknown>)[key];
            }
            return undefined;
        }, obj as unknown);
    }

    private downloadCSV(content: string, filename: string): void {
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Create and export the service instance
export const ecommerceApi = new EcommerceApiService();
