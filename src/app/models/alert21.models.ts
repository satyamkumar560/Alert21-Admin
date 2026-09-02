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

// =========================================================
// WEBSITE MONITORING MODULE - PHASE 1 MODELS (SPECIFICATION)
// =========================================================

export type MonitorSourceType = 'NATIVE_HTTP' | 'EXTERNAL_API';
export type MonitorSourcePurpose = 'PRIMARY' | 'VERIFICATION' | 'BOTH';
export type MonitorSourceHealth = 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
export type MonitorSourceStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface MonitoringSource {
  id: string;
  name: string;
  code: string; // e.g. A21_NATIVE_PRIMARY
  type: MonitorSourceType;
  region: string; // Country / region label
  purpose: MonitorSourcePurpose;
  minIntervalSeconds: number; // 300 / 180 / 60 / 30
  timeoutSeconds: number; // default 10s
  maxConcurrency: number; // worker capacity
  priority: number; // 1, 2, 3...
  costRef?: number; // per 1000 checks
  health: MonitorSourceHealth;
  status: MonitorSourceStatus;
  lastHeartbeatAt?: string;
  successRate?: number;
  avgCheckTimeMs?: number;
  queueLagMs?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type MonitoringPlanStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type MonitoringPlanVisibility = 'PUBLIC' | 'HIDDEN' | 'CUSTOM';
export type MonitoringChannelMode = 'DISABLED' | 'USER_WALLET' | 'WALLET' | 'INCLUDED';

export interface MonitoringPlan {
  id: string;
  code: string; // unique, immutable
  name: string;
  monthlyPrice: number; // base before GST
  annualPrice: number; // base before GST
  gstPercent: number; // default 18
  includedMonitors: number;
  checkIntervalSeconds: number; // 300, 180, 60, 30
  retentionDays: number; // 7, 30, 90, 180, 365
  notificationContacts: number;
  emailInApp: boolean;
  smsMode: MonitoringChannelMode;
  whatsAppMode: MonitoringChannelMode;
  sslMonitoring: boolean;
  slowResponseAlert: boolean;
  slowThresholdMs?: number; // default 3000ms
  verificationSources: number; // 1 or 2
  webhooksStatusPage: boolean;
  addOnEligibility: string[]; // ['EXTRA_10_MONITORS', 'EXTRA_50_MONITORS', 'EXTRA_CONTACTS_5', 'EXTENDED_HISTORY_365']
  gracePeriodDays: number; // default 3
  visibility: MonitoringPlanVisibility;
  sortOrder: number;
  badge?: string; // 'Most Popular', 'Recommended'
  status: MonitoringPlanStatus;
  createdAt?: string;
}

export interface MonitoringAddon {
  id: string;
  sku: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  quotaDelta: number;
  type: 'MONITORS' | 'CONTACTS' | 'HISTORY' | 'REGION';
  ruleDescription: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type SubscriptionStatus = 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'PAUSED' | 'CANCELLED';
export type SubscriptionBillingCycle = 'MONTHLY' | 'ANNUAL';

export interface MonitoringSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  companyName: string;
  planId: string;
  planCode: string;
  planName: string;
  billingCycle: SubscriptionBillingCycle;
  status: SubscriptionStatus;
  currentMonitorsCount: number;
  maxMonitorsQuota: number;
  currentContactsCount: number;
  maxContactsQuota: number;
  startDate: string;
  endDate: string;
  graceEndDate?: string;
  renewalDate: string;
  autoRenew: boolean;
  monthlyAmount: number;
  annualAmount: number;
  paidAmount: number;
  smsWalletBalance?: number;
  whatsAppWalletBalance?: number;
  adminNotes?: string;
  createdAt?: string;
}

export type MonitorState = 'UP' | 'DOWN' | 'SUSPECT' | 'RECOVERING' | 'DEGRADED' | 'PAUSED' | 'MAINTENANCE';

export interface WebsiteMonitor {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  name: string;
  url: string;
  status: MonitorState;
  intervalSeconds: number;
  timeoutSeconds: number;
  thresholdMs: number;
  sslEnabled: boolean;
  sslValid?: boolean;
  sslDaysRemaining?: number;
  sslExpiresAt?: string;
  lastCheckAt?: string;
  nextCheckAt?: string;
  responseTimeMs?: number;
  uptime30d?: number;
  httpStatusCode?: number;
  lastErrorCode?: string; // DNS_ERROR, CONNECT_TIMEOUT, READ_TIMEOUT, TLS_ERROR, HTTP_4XX, HTTP_5XX, etc.
  lastIncidentAt?: string;
  sourceCode?: string;
  isPaused: boolean;
  softDeletedAt?: string;
  createdAt: string;
}

export type IncidentStatus = 'OPEN' | 'RESOLVED' | 'FLAPPING';

export interface MonitorIncident {
  id: string;
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  userId: string;
  userName: string;
  userEmail: string;
  startedAt: string;
  resolvedAt?: string;
  durationSeconds?: number;
  durationText?: string;
  failureReason: string;
  errorCode: string;
  detectionSource: string;
  verificationSource?: string;
  status: IncidentStatus;
  alertsSent: {
    email: number;
    sms: number;
    whatsapp: number;
    inApp: number;
  };
  deliveryStatus: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'SKIPPED';
}

export type MonitoringEventType = 'DOWN' | 'RECOVERY' | 'SLOW' | 'SSL_EXPIRY';
export type MonitoringChannel = 'SMS' | 'WHATSAPP' | 'EMAIL' | 'IN_APP';
export type MonitoringTemplateStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DISABLED';

export interface MonitoringTemplate {
  id: string;
  eventType: MonitoringEventType;
  channel: MonitoringChannel;
  templateCode: string;
  name: string;
  body: string;
  subject?: string; // For Email
  dltTemplateId?: string; // For SMS (Must have exactly 2 variables {#var#})
  metaTemplateName?: string; // For WhatsApp
  language?: string; // 'en', 'hi'
  status: MonitoringTemplateStatus;
  variablesCount: number;
  variableMapping?: string;
  category?: string; // 'Utility'
  updatedAt?: string;
}

export interface MonitoringDashboardStats {
  totalActiveMonitors: number;
  monitorsUp: number;
  monitorsDown: number;
  monitorsPaused: number;
  monitorsDegraded: number;
  incidentsToday: number;
  avgPlatformLatencyMs: number;
  alertsSentToday: {
    total: number;
    email: number;
    sms: number;
    whatsapp: number;
    inApp: number;
  };
  activeSubscriptionsCount: number;
  mrr: number;
  arr: number;
  upcomingRenewalsCount: number;
  expiredInGraceCount: number;
  pendingBankTransfersCount: number;
  topFailingDomains: {
    domain: string;
    incidentCount: number;
    downtimeSeconds: number;
    lastFailedAt: string;
  }[];
}

// =========================================================
// TASK #06: EMAIL ALERT SERVICE (AMAZON SES) MODELS
// =========================================================

export interface EmailProvider {
  id: string;
  name: string;
  code: string;
  region: string;
  accessKeyId: string;
  secretAccessKeyMasked: string;
  secretAccessKey?: string;
  configurationSet?: string;
  callbackSecret?: string;
  callbackUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type EmailDomainStatus = 'PENDING_DNS' | 'VERIFYING' | 'VERIFIED' | 'FAILED' | 'SUSPENDED';

export interface DnsRecordItem {
  recordType: 'CNAME' | 'TXT' | 'MX';
  name: string;
  value: string;
  status?: 'PENDING' | 'VERIFIED' | 'FAILED';
}

export interface EmailSendingDomain {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  domain: string;
  status: EmailDomainStatus;
  dkimTokens: string[];
  dnsRecords: DnsRecordItem[];
  customMailFromDomain?: string;
  customMailFromStatus?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EmailSender {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  domainId: string;
  domainName: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  name: string;
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  variables: string[];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

export type EmailTransactionStatus = 'SUBMITTED' | 'DELIVERED' | 'BOUNCED' | 'COMPLAINT' | 'FAILED' | 'PENDING';

export interface EmailTransaction {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  providerId?: string;
  providerName?: string;
  providerMessageId?: string;
  domainId?: string;
  domainName?: string;
  senderId?: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  subject: string;
  renderedHtml?: string;
  renderedText?: string;
  status: EmailTransactionStatus;
  providerStatus?: string;
  providerResponse?: any;
  errorCode?: string;
  errorMessage?: string;
  bounceType?: string;
  bounceSubType?: string;
  complaintFeedbackType?: string;
  createdAt: string;
  submittedAt?: string;
  deliveredAt?: string;
  bouncedAt?: string;
  complainedAt?: string;
}

export interface EmailPricingSlab {
  id: string;
  name: string;
  minQuantity: number;
  maxQuantity: number;
  ratePerEmail: number;
  gstPercent: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
}

export interface EmailDashboardStats {
  totalCreditsDistributed: number;
  currentTotalUserBalance: number;
  totalEmailsSold: number;
  totalEmailsSent: number;
  deliveredEmails: number;
  bouncedEmails: number;
  complaintCount: number;
  verifiedDomainsCount: number;
  activeTemplatesCount: number;
  totalBillingValue: number;
  gstCollected: number;
  avgSellingPricePerEmail: number;
  totalPaymentReceived: number;
  deliveryRatePercent: number;
  bounceRatePercent: number;
  complaintRatePercent: number;
}

