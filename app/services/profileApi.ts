import axiosClient from "../utils/axiosClient";
import {
    Profile,
    ProfileFormData,
    UpdateGeneralProfileRequest,
    UserProfileAddressViewModel,
    AddEditAddressViewModel,
    MarkPrimaryAddressRequest,
    AddressFormData,
    SubscriptionData,
    SubscriptionPlan,
    UpdateSubscriptionRequest,
    UpgradeSubscriptionFromTrialRequest,
    ProratePreviewResponse,
    UserProfilePaymentMethodsViewModel,
    AddPaymentMethodFormData,
    AddCreditCardRequest,
    AddUserInterestRequest,
} from "../types/Profile";

class ProfileApi {
    async getProfile(): Promise<Profile> {
        const res = await axiosClient.get("/api/profile");
        return res.data.data;
    }

    async getFormData(): Promise<ProfileFormData> {
        const res = await axiosClient.get("/api/profile/form-data");
        return res.data.data;
    }

    async updateGeneral(data: UpdateGeneralProfileRequest): Promise<{ message: string }> {
        const res = await axiosClient.put("/api/profile/general", data);
        return res.data.data;
    }

    async uploadImage(userId: number, file: File): Promise<{ path: string; message: string }> {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axiosClient.post(`/api/members/UserFile/${userId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    }

    async removeImage(userId: number): Promise<string> {
        const res = await axiosClient.patch(`/api/members/UserFile/${userId}`);
        return res.data;
    }

    // Address Management Methods
    async getAddressFormData(): Promise<AddressFormData> {
        const res = await axiosClient.get("/api/profile/addresses/form-data");
        return res.data.data;
    }

    async getAddresses(): Promise<UserProfileAddressViewModel> {
        const res = await axiosClient.get("/api/profile/addresses");
        return res.data.data;
    }

    async getAddress(id: number): Promise<AddEditAddressViewModel> {
        const res = await axiosClient.get(`/api/profile/addresses/${id}`);
        return res.data.data;
    }

    async addAddress(data: AddEditAddressViewModel): Promise<{ message: string }> {
        const res = await axiosClient.post("/api/profile/addresses", data);
        return res.data.data;
    }

    async updateAddress(id: number, data: AddEditAddressViewModel): Promise<{ message: string }> {
        const res = await axiosClient.put(`/api/profile/addresses/${id}`, data);
        return res.data.data;
    }

    async deleteAddress(id: number): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/profile/addresses/${id}`);
        return res.data.data;
    }

    async markPrimaryAddress(id: number, type: string): Promise<{ message: string }> {
        const res = await axiosClient.post(`/api/profile/addresses/${id}/mark-primary`, { type } as MarkPrimaryAddressRequest);
        return res.data.data;
    }

    // Subscription Management Methods
    async getSubscription(): Promise<SubscriptionData> {
        const res = await axiosClient.get("/api/profile/subscription");
        return res.data.data;
    }

    async getAvailableSubscriptions(): Promise<{ subscriptions: SubscriptionPlan[] }> {
        const res = await axiosClient.get("/api/subscription/active");
        return res.data;
    }

    async updateSubscription(data: UpdateSubscriptionRequest): Promise<{ status: string; redirect?: string }> {
        const res = await axiosClient.post("/api/subscription/update", data);
        return res.data;
    }

    async subscribeToNew(data: UpdateSubscriptionRequest): Promise<{ status: string; redirect: string }> {
        const res = await axiosClient.post("/api/subscription/subscribe", data);
        return res.data;
    }

    async subscribeFromTrial(data: UpgradeSubscriptionFromTrialRequest): Promise<{ status: string; redirect: string }> {
        const res = await axiosClient.post("/api/subscription/subscribeFromTrial", data);
        return res.data;
    }

    async cancelSubscription(): Promise<{ status: string }> {
        const res = await axiosClient.delete("/api/subscription/Cancel");
        return res.data;
    }

    async reactivateSubscription(): Promise<{ status: string }> {
        const res = await axiosClient.put("/api/subscription/reactivate");
        return res.data;
    }

    async changePaymentMethod(paymentMethodId: number): Promise<{ status: string }> {
        const res = await axiosClient.put("/api/subscription/paymentMethod", {
            id: paymentMethodId
        });
        return res.data;
    }

    async getProratePreview(data: UpdateSubscriptionRequest): Promise<ProratePreviewResponse> {
        const res = await axiosClient.post("/api/subscription/prorate-preview", data);
        return res.data;
    }

    // Payment Methods Management
    async getPaymentMethods(): Promise<UserProfilePaymentMethodsViewModel> {
        const res = await axiosClient.get("/api/profile/payment-methods");
        return res.data.data;
    }

    async deletePaymentMethod(paymentId: number, type: string): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/profile/payment-methods/${paymentId}?type=${type}`);
        return res.data.data;
    }

    async setDefaultPaymentMethod(paymentId: number, type: string): Promise<{ message: string }> {
        const res = await axiosClient.post(`/api/profile/payment-methods/${paymentId}/set-default`, { type });
        return res.data.data;
    }

    async getPaymentMethodFormData(): Promise<AddPaymentMethodFormData> {
        const res = await axiosClient.get("/api/profile/payment-methods/form-data");
        return res.data.data;
    }

    async addPaymentMethod(data: AddCreditCardRequest): Promise<{ message: string }> {
        const res = await axiosClient.post("/api/profile/payment-methods", data);
        return res.data.data;
    }

    // User Interests Management
    async addUserInterest(data: AddUserInterestRequest): Promise<{ message: string }> {
        const res = await axiosClient.post("/api/profile/interests", data);
        return res.data.data;
    }

    async removeUserInterest(categoryId: number): Promise<{ message: string }> {
        const res = await axiosClient.delete(`/api/profile/interests/${categoryId}`);
        return res.data.data;
    }
}

export const profileApi = new ProfileApi();
