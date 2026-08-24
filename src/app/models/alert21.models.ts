export type AdminRole = 'ADMIN';

export interface AdminUser {
  id: string;
  name: string;
  company: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  lastLogin: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface AlertUser {
  id: string;
  accountId: string;
  name: string;
  company: string;
  email: string;
  mobile: string;
  registeredAt: string;
  status: UserStatus;
  role: string;
  currentPlan?: string;
  smsBalance?: number;
  walletBalance?: number;
  totalSms?: number;
  deliveredSms?: number;
  failedSms?: number;
  assignedProviderId?: string;
}

export type DltStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface PrincipalEntity {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  peId: string;
  entityName: string;
  status: DltStatus;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  adminRemarks?: string;
  dltOperator?: string;
  entityType?: string;
}

export interface SenderIdHeader {
  id: string;
  userId: string;
  userName: string;
  peId: string;
  senderHeader: string;
  headerType: 'TRANSACTIONAL' | 'SERVICE_IMPLICIT' | 'SERVICE_EXPLICIT' | 'PROMOTIONAL';
  status: DltStatus;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  adminRemarks?: string;
}

export interface ContentTemplate {
  id: string;
  userId: string;
  userName: string;
  peId: string;
  senderHeader: string;
  templateId: string;
  templateName: string;
  templateContent: string;
  templateType: 'SERVICE_IMPLICIT' | 'SERVICE_EXPLICIT' | 'TRANSACTIONAL' | 'PROMOTIONAL';
  status: DltStatus;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  adminRemarks?: string;
}

export interface SmsProvider {
  id: string;
  name: string;
  code: string;
  baseUrl: string;
  callbackUrl?: string;
  username: string;
  passwordEncrypted: string;
  rawTelemarketerId: string;
  unicodeDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  isGlobalDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderRequestLog {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  providerId: string;
  providerName: string;
  recipientMobileMasked: string;
  peId: string;
  senderHeader: string;
  templateId: string;
  dltTelemarketerIdSha256: string;
  timestamp: string;
  latencyMs: number;
  httpStatus: number;
  normalizedStatus: 'SUCCESS' | 'FAILED' | 'REJECTED';
  errorMessage?: string;
  requestUrlMasked: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: AdminRole;
  action: string;
  entityType: 'USER' | 'PRINCIPAL_ENTITY' | 'SENDER_ID' | 'TEMPLATE' | 'PROVIDER' | 'ROUTING' | 'TELEMARKETER_ID';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  createdAt: string;
}
