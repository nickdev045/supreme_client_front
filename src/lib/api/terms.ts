import { apiData, apiRequest } from "@/lib/api/client";

export type ApiTermsCondition = {
  pk_terms_condition: number;
  title: string | null;
  description: string | null;
  document_type: string;
  audience: string;
  jurisdiction: string;
  locale: string;
  version: string;
  status: string;
  effective_at: string | null;
  content_hash: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PendingTermsResult = {
  data: ApiTermsCondition[];
  meta: {
    company_jurisdiction: string;
    audience: string;
    total_applicable: number;
    total_pending: number;
  };
};

export function listPendingTerms(token: string) {
  return apiRequest<PendingTermsResult>("/api/v1/engagement/terms/pending", {
    method: "GET",
    token,
  });
}

export function acceptTerms(token: string, id: number) {
  return apiData<{
    pk_user_terms_condition: number;
    fk_terms_condition: number;
    is_accepted: boolean | null;
    accepted_at: string | null;
  }>(`/api/v1/engagement/terms/${id}/acceptance`, {
    method: "PUT",
    token,
  });
}
