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
  entityType: 'USER' | 'PRINCIPAL_ENTITY' | 'SENDER_ID' | 'TEMPLATE' | 'PROVIDER' | 'ROUTING' | 'TELEMARKETER_ID' | 'BILLING_PRICING' | 'BANK_TRANSFER' | 'SMS_BALANCE';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  createdAt: string;
}

export type PricingSlabStatus = 'ACTIVE' | 'INACTIVE';

export interface PricingSlab {
  id: string;
  minQuantity: number;
  maxQuantity: number;
  ratePerSms: number;
  gstPercentage: number;
  status: PricingSlabStatus;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BankTransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BankTransferRequest {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  companyName: string;
  smsQuantity: number;
  ratePerSms: number;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  purchaseStatus: BankTransferStatus;
  utrNumber: string;
  paymentProof?: string;
  paymentDate: string;
  requestDate: string;
  paidAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionRemarks?: string;
}

export type LedgerTransactionType = 
  | 'PURCHASE_CREDIT' 
  | 'ADMIN_CREDIT' 
  | 'ADMIN_DEBIT' 
  | 'SMS_DEBIT' 
  | 'REFUND' 
  | 'ADJUSTMENT';

export interface SmsLedgerEntry {
  id: string;
  userId: string;
  userName?: string;
  type: LedgerTransactionType;
  smsQuantity: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  rate?: number;
  amount?: number;
  remarks: string;
  createdBy: string;
  createdAt: string;
}

export interface BillingDashboardStats {
  totalSmsDistributed: number;
  currentTotalUserSmsBalance: number;
  totalSmsSold: number;
  totalBillingValue: number;
  gstCollected: number;
  averageSellingPricePerSms: number;
  totalPaymentReceived: number;
  pendingBankTransferCount: number;
  pendingBankTransferAmount: number;
}
