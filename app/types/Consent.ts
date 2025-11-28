// Consent data structures matching backend ViewModels

export interface Consent {
  id: number;
  companyId: number;
  consentEnvelopeId: string;
  consentSignerId: string;
  consentName: string;
  videoName: string;
  signature: string;
  signatureEmail: string;
  createdDate: string;
}

export interface ConsentsResponse {
  data: Consent[];
}

export interface DownloadConsentRequest {
  envelopeId: string;
}

export interface ResendConsentEmailRequest {
  envelopeId: string;
  emails: string[];
}

export interface DeleteConsentRequest {
  envelopeId: string;
}