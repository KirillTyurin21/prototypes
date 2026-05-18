/**
 * Типы для прототипа Halyk Consent (API Key + UI Consent)
 */

export type AccessRequestStatus = 'pending' | 'approved' | 'active' | 'rejected' | 'revoked' | 'blocked';

export type IntegrationStatus = 'active' | 'inactive' | 'blocked';

export interface AccessRequest {
  id: string;
  bank_id: string;
  bank_name: string;
  request_text: string;
  scope: string[];
  status: AccessRequestStatus;
  api_key_preview: string | null;
  expires_at: string | null;
  created_at: string;
  decided_by: string | null;
  decided_by_name: string | null;
  decided_at: string | null;
  reason: string | null;
  audit_log: AuditLogEntry[];
}

export interface AuditLogEntry {
  action: 'approved' | 'rejected' | 'revoked' | 'reverted' | 'blocked' | 'unblocked';
  user_name: string;
  user_role: string;
  timestamp: string;
  reason: string | null;
}

export interface PluginState {
  integration_status: IntegrationStatus;
  reason: string | null;
  payment_types_visible: boolean;
  last_updated: string;
}
