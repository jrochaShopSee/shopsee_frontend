import axiosClient from "../utils/axiosClient";
import type {
  PendingPayoutsResponse,
  PaidPayoutsResponse,
  PendingPayoutsParams,
  PaidPayoutsParams,
  PayPayoutRequest,
  UndoPayoutRequest
} from "@/app/types/Payouts";

export class AdminPayoutsApi {
  static async getPendingPayouts(params: PendingPayoutsParams = {}): Promise<PendingPayoutsResponse> {
    const response = await axiosClient.get("/api/admin-payouts/pending", { params });
    return response.data;
  }

  static async getPaidPayouts(params: PaidPayoutsParams = {}): Promise<PaidPayoutsResponse> {
    const response = await axiosClient.get("/api/admin-payouts/paid", { params });
    return response.data;
  }

  static async payPayout(request: PayPayoutRequest): Promise<{ message: string }> {
    const response = await axiosClient.post("/api/admin-payouts/pay", request);
    return response.data;
  }

  static async undoPayout(request: UndoPayoutRequest): Promise<{ message: string }> {
    const response = await axiosClient.post("/api/admin-payouts/undo", request);
    return response.data;
  }
}