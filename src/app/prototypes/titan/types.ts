/** Статусы запроса доступа */
export type AccessRequestStatus =
  | 'pending'
  | 'approved'
  | 'active'
  | 'rejected'
  | 'revoked'
  | 'expired';

/** Статус интеграции на стороне плагина Front */
export type IntegrationStatus = 'active' | 'inactive' | 'blocked';

/** Scope (разрешения) запроса */
export interface AccessScope {
  id: string;
  label: string;
  description: string;
}

/** Запрос на доступ к API */
export interface AccessRequest {
  id: string;
  partnerName: string;
  partnerDescription: string;
  status: AccessRequestStatus;
  scopes: AccessScope[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  apiKeyPreview?: string;
  rejectionReason?: string;
  auditLog: AuditLogEntry[];
}

/** Запись аудит-лога */
export interface AuditLogEntry {
  action: 'created' | 'approved' | 'rejected' | 'revoked' | 'revert_rejection';
  actor: string;
  timestamp: string;
  reason?: string;
}

/** Состояние плагина Front */
export interface PluginState {
  integration_status: IntegrationStatus;
  reason: string | null;
  payment_types_visible: boolean;
  last_updated: string;
}
