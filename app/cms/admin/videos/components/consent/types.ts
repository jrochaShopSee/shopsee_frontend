export interface ConsentFormData {
    hasConsent: boolean;
    consentTemplateId?: string | null;
    consentTime?: number | null;
    consentDischarge?: string | null;
    consentDischargeOptional?: boolean | null;
    consentDischargeTime?: number | null;
    consentSurvey?: string | null;
    consentSurveyLink?: string | null;
    consentSurveyTime?: number | null;
    consentSameUserCanSignAgain?: boolean | null;
}

export interface DocuSignResponse {
    status: string;
    result?: {
        url: string;
        envelopeId: string;
    };
}

export interface FileUploadResponse {
    status: string;
    url?: string;
    envelopeId?: string;
    message?: string;
}

export type ConsentInputType = "text" | "pdf";
