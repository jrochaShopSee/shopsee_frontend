import axiosClient from "../utils/axiosClient";
import type {
  Consent,
  ConsentsResponse,
  DownloadConsentRequest,
  ResendConsentEmailRequest,
} from "@/app/types/Consent";

export class AdminConsentsApi {
  static async getAll(): Promise<Consent[]> {
    const response = await axiosClient.get<ConsentsResponse>("/api/consent/list");
    return response.data.data;
  }

  static async download(request: DownloadConsentRequest): Promise<Blob> {
    const response = await axiosClient.post("/api/consent/download", request, {
      responseType: "blob",
    });
    return response.data;
  }

  static async resendEmail(request: ResendConsentEmailRequest): Promise<{ message: string }> {
    const response = await axiosClient.post("/api/consent/sendEmail", request);
    return response.data;
  }

  static async delete(envelopeId: string): Promise<{ status: string; redirect: string }> {
    const response = await axiosClient.delete(`/api/consent?envelopeId=${envelopeId}`);
    return response.data;
  }
}