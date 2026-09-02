import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, of, catchError } from 'rxjs';
import { 
  AlertUser, 
  PrincipalEntity, 
  SenderIdHeader, 
  ContentTemplate, 
  SmsProvider, 
  ProviderRequestLog, 
  AdminAuditLog,
  UserStatus,
  DltStatus,
  PricingSlab,
  PricingSlabStatus,
  BankTransferRequest,
  BankTransferStatus,
  SmsLedgerEntry,
  BillingDashboardStats,
  MonitoringSource,
  MonitoringPlan,
  MonitoringAddon,
  MonitoringSubscription,
  WebsiteMonitor,
  MonitorIncident,
  MonitoringTemplate,
  MonitoringDashboardStats,
  EmailProvider,
  EmailSendingDomain,
  EmailSender,
  EmailTemplate,
  EmailTransaction,
  EmailPricingSlab,
  EmailDashboardStats
} from '../models/alert21.models';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Live Signals
  users = signal<AlertUser[]>([]);
  principalEntities = signal<PrincipalEntity[]>([]);
  senderIds = signal<SenderIdHeader[]>([]);
  contentTemplates = signal<ContentTemplate[]>([]);
  smsProviders = signal<SmsProvider[]>([]);

  // Task #05 Billing & Balance Signals
  pricingSlabs = signal<PricingSlab[]>([]);
  bankTransfers = signal<BankTransferRequest[]>([]);
  billingStats = signal<BillingDashboardStats | null>(null);
  userLedger = signal<SmsLedgerEntry[]>([]);

  providerLogs = signal<ProviderRequestLog[]>([]);
  requestLogs = this.providerLogs;

  auditLogs = signal<AdminAuditLog[]>([]);

  liveApiStats = signal<any | null>(null);

  // Task #06 Email Alert Service Signals
  emailProviders = signal<EmailProvider[]>([]);
  emailDomains = signal<EmailSendingDomain[]>([]);
  emailSenders = signal<EmailSender[]>([]);
  emailTemplates = signal<EmailTemplate[]>([]);
  emailTransactions = signal<EmailTransaction[]>([]);
  emailPricingSlabs = signal<EmailPricingSlab[]>([]);
  emailDashboardStats = signal<EmailDashboardStats | null>(null);
  emailBankTransfers = signal<any[]>([]);

  constructor() {
    this.fetchLiveDashboardStats();
    this.fetchLiveUsers();
    this.fetchLivePrincipalEntities();
    this.fetchLiveSenderIds();
    this.fetchLiveTemplates();
    this.fetchLiveSmsProviders();
    this.fetchLivePricingSlabs();
    this.fetchLiveBankTransfers();
    this.fetchMonitoringBankTransfers();
    this.fetchEmailBankTransfers();
    this.fetchBillingDashboardStats();
  }

  /**
   * GET Live Dashboard Stats from https://app.alert21.in/back/api/admin/dashboard
   */
  async fetchLiveDashboardStats() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await firstValueFrom(
        this.http.get<any>(environment.dashboardUrl, { headers })
      );

      if (response && response.success && response.data) {
        this.liveApiStats.set(response.data);
      }
    } catch (e) {
      console.warn('Dashboard API fallback to local state store.');
    }
  }

  /**
   * Computed Dashboard Statistics matching STRICTLY the live API response schema
   */
  stats = computed(() => {
    const live = this.liveApiStats();
    const allUsers = this.users();
    const allPE = this.principalEntities();
    const allSenders = this.senderIds();
    const allTemplates = this.contentTemplates();
    const allProviders = this.smsProviders();

    if (live) {
      const u = live.users || {};
      const pe = live.principalEntities || live.dlt?.principalEntities || {};
      const snd = live.senderIds || live.dlt?.senderIds || {};
      const tpl = live.templates || live.dlt?.templates || {};
      const prv = live.smsProviders || {};
      const sms = live.sms || live.smsMetrics || {};

      const peTotal = typeof pe === 'number' ? pe : (pe.total ?? allPE.length);
      const sndTotal = typeof snd === 'number' ? snd : (snd.total ?? allSenders.length);
      const tplTotal = typeof tpl === 'number' ? tpl : (tpl.total ?? allTemplates.length);

      return {
        users: {
          total: u.total ?? allUsers.length,
          active: u.active ?? allUsers.filter(user => user.status === 'ACTIVE').length,
          suspended: u.suspended ?? allUsers.filter(user => user.status === 'SUSPENDED').length,
          blocked: u.blocked ?? allUsers.filter(user => user.status === 'BLOCKED').length
        },
        principalEntities: {
          pending: typeof pe === 'number' ? allPE.filter(e => e.status === 'PENDING').length : (pe.pending ?? allPE.filter(e => e.status === 'PENDING').length),
          active: typeof pe === 'number' ? peTotal : (pe.active ?? allPE.filter(e => e.status === 'ACTIVE').length),
          total: peTotal
        },
        senderIds: {
          pending: typeof snd === 'number' ? allSenders.filter(s => s.status === 'PENDING').length : (snd.pending ?? allSenders.filter(s => s.status === 'PENDING').length),
          active: typeof snd === 'number' ? sndTotal : (snd.active ?? allSenders.filter(s => s.status === 'ACTIVE').length),
          total: sndTotal
        },
        templates: {
          pending: typeof tpl === 'number' ? allTemplates.filter(t => t.status === 'PENDING').length : (tpl.pending ?? allTemplates.filter(t => t.status === 'PENDING').length),
          active: typeof tpl === 'number' ? tplTotal : (tpl.active ?? allTemplates.filter(t => t.status === 'ACTIVE').length),
          total: tplTotal
        },
        smsProviders: {
          total: prv.total ?? allProviders.length,
          active: prv.active ?? allProviders.filter(p => p.status === 'ACTIVE').length,
          globalDefault: prv.globalDefault || allProviders.find(p => p.isGlobalDefault) || allProviders[0] || null
        },
        smsMetrics: {
          totalSent: sms.total ?? sms.totalSent ?? 0,
          delivered: sms.delivered ?? 0,
          failed: sms.failed ?? 0,
          pending: sms.submitted ?? sms.pending ?? 0
        }
      };
    }

    return {
      users: {
        total: allUsers.length,
        active: allUsers.filter(u => u.status === 'ACTIVE').length,
        suspended: allUsers.filter(u => u.status === 'SUSPENDED').length,
        blocked: allUsers.filter(u => u.status === 'BLOCKED').length
      },
      principalEntities: {
        pending: allPE.filter(pe => pe.status === 'PENDING').length,
        active: allPE.filter(pe => pe.status === 'ACTIVE').length,
        total: allPE.length
      },
      senderIds: {
        pending: allSenders.filter(s => s.status === 'PENDING').length,
        active: allSenders.filter(s => s.status === 'ACTIVE').length,
        total: allSenders.length
      },
      templates: {
        pending: allTemplates.filter(t => t.status === 'PENDING').length,
        active: allTemplates.filter(t => t.status === 'ACTIVE').length,
        total: allTemplates.length
      },
      smsProviders: {
        total: allProviders.length,
        active: allProviders.filter(p => p.status === 'ACTIVE').length,
        globalDefault: allProviders.find(p => p.isGlobalDefault) || allProviders[0] || null
      },
      smsMetrics: {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        pending: 0
      }
    };
  });

  /**
   * GET Live SMS Providers from https://app.alert21.in/back/api/admin/sms-providers
   */
  async fetchLiveSmsProviders() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await firstValueFrom(
        this.http.get<any>('https://app.alert21.in/back/api/admin/sms-providers', { headers })
      );

      if (response && response.success && Array.isArray(response.data)) {
        const mappedProviders: SmsProvider[] = response.data.map((item: any) => ({
          id: item.id || item._id,
          name: item.name || 'MSG24',
          code: item.code || 'MSG24',
          baseUrl: item.base_url || 'https://admin.msg24x7.co.in/fe/api/v1/send',
          callbackUrl: item.callback_url || '',
          username: item.username || 'satyam12',
          passwordEncrypted: '••••••••••••••••',
          rawTelemarketerId: item.telemarketer_id || item.telemarketer_id_masked || '1302167049537543382',
          unicodeDefault: item.unicode_default ?? false,
          status: item.status || 'ACTIVE',
          isGlobalDefault: item.is_default ?? true,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString()
        }));
        this.smsProviders.set(mappedProviders);
      }
    } catch (e) {
      console.warn('SMS Providers GET API fallback.');
    }
  }

  /**
   * POST Live SMS Provider: https://app.alert21.in/back/api/admin/sms-providers
   */
  async createLiveSmsProvider(providerData: any, adminName: string = 'Admin'): Promise<boolean> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const body = {
        name: providerData.name || 'MSG24',
        code: providerData.code || 'MSG24',
        base_url: providerData.baseUrl || 'https://admin.msg24x7.co.in/fe/api/v1/send',
        username: providerData.username || 'satyam12',
        password: providerData.password || 'Satyam@123',
        telemarketer_id: providerData.rawTelemarketerId || '1302167049537543382',
        unicode_default: providerData.unicodeDefault ?? false,
        status: providerData.status || 'ACTIVE',
        is_default: providerData.isGlobalDefault ?? true
      };

      const response = await firstValueFrom(
        this.http.post<any>('https://app.alert21.in/back/api/admin/sms-providers', body, { headers })
      );

      if (response && response.success) {
        this.fetchLiveSmsProviders();
        this.fetchLiveDashboardStats();
        this.toastService.showSuccess('Provider Created', `SMS Gateway ${body.name} configured successfully.`);
        return true;
      }
    } catch (e) {
      console.warn('POST SMS Provider API fallback.', e);
      this.toastService.showError('Creation Failed', 'Could not create SMS Provider via API.');
    }
    return false;
  }

  /**
   * PATCH Live SMS Provider: https://app.alert21.in/back/api/admin/sms-providers/{id}
   */
  async updateLiveSmsProvider(providerData: any, adminName: string = 'Admin'): Promise<boolean> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const body: any = {
        name: providerData.name,
        base_url: providerData.baseUrl,
        username: providerData.username,
        telemarketer_id: providerData.rawTelemarketerId,
        unicode_default: providerData.unicodeDefault,
        status: providerData.status,
        is_default: providerData.isGlobalDefault
      };
      
      if (providerData.password && providerData.password.trim() !== '') {
        body.password = providerData.password;
      }

      const response = await firstValueFrom(
        this.http.patch<any>(`https://app.alert21.in/back/api/admin/sms-providers/${providerData.id}`, body, { headers })
      );

      if (response && response.success) {
        this.fetchLiveSmsProviders();
        this.toastService.showSuccess('Provider Updated', `SMS Gateway ${body.name} updated successfully.`);
        return true;
      }
    } catch (e) {
      console.warn('PATCH SMS Provider API fallback.', e);
      this.toastService.showError('Update Failed', 'Could not update SMS Provider via API.');
    }
    return false;
  }

  /**
   * GET Live Sender IDs from https://app.alert21.in/back/api/admin/dlt/sender-ids
   */
  async fetchLiveSenderIds() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await firstValueFrom(
        this.http.get<any>('https://app.alert21.in/back/api/admin/dlt/sender-ids?limit=1000', { headers })
      );

      const items = Array.isArray(response?.data?.items) ? response.data.items : (Array.isArray(response?.data) ? response.data : []);
      if (items.length > 0 || (response && response.success)) {
        const mappedSenders: SenderIdHeader[] = items.map((item: any) => ({
          id: item._id,
          userId: item.user_id?._id || '',
          userName: item.user_id?.fullName || 'User',
          peId: item.principal_entity_id || '',
          senderHeader: item.sender_id || 'SENDER',
          headerType: item.sender_type || 'TRANSACTIONAL',
          status: item.status || 'PENDING',
          submittedAt: item.created_at || new Date().toISOString(),
          adminRemarks: item.remarks || ''
        }));
        this.senderIds.set(mappedSenders);
      }
    } catch (e) {
      console.warn('Sender IDs API fallback.');
    }
  }

  /**
   * PATCH Live Sender ID Status: https://app.alert21.in/back/api/admin/dlt/sender-ids/{id}/status
   */
  async updateLiveSenderStatus(senderId: string, status: DltStatus, remarks?: string, adminName: string = 'Admin'): Promise<boolean> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const url = `https://app.alert21.in/back/api/admin/dlt/sender-ids/${senderId}/status`;
      const response = await firstValueFrom(
        this.http.patch<any>(url, { status }, { headers })
      );

      if (response && response.success) {
        const now = new Date().toISOString();
        this.senderIds.update(list => list.map(s => s.id === senderId ? {
          ...s,
          status,
          adminRemarks: remarks || s.adminRemarks,
          verifiedBy: adminName,
          verifiedAt: now
        } : s));

        this.fetchLiveDashboardStats();
        this.toastService.showSuccess('Status Updated', `Sender ID status changed to ${status}.`);
        return true;
      }
    } catch (err) {
      console.error('Sender status PATCH API error', err);
    }
    return false;
  }

  /**
   * GET Live DLT Templates from https://app.alert21.in/back/api/admin/dlt/templates
   */
  async fetchLiveTemplates() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await firstValueFrom(
        this.http.get<any>('https://app.alert21.in/back/api/admin/dlt/templates?limit=1000', { headers })
      );

      const items = Array.isArray(response?.data?.items) ? response.data.items : (Array.isArray(response?.data) ? response.data : []);
      if (items.length > 0 || (response && response.success)) {
        const mappedTemplates: ContentTemplate[] = items.map((item: any) => ({
          id: item._id,
          userId: item.user_id?._id || '',
          userName: item.user_id?.fullName || 'User',
          peId: item.principal_entity_id || '',
          senderHeader: item.sender_record_id || 'SENDER',
          templateId: item.template_id || '000000000000',
          templateName: item.template_name || 'Template',
          templateContent: item.template_content || '',
          templateType: item.template_type || 'TRANSACTIONAL',
          status: item.status || 'PENDING',
          submittedAt: item.created_at || new Date().toISOString(),
          adminRemarks: item.remarks || ''
        }));
        this.contentTemplates.set(mappedTemplates);
      }
    } catch (e) {
      console.warn('Templates API fallback.');
    }
  }

  /**
   * PATCH Live DLT Template Status: https://app.alert21.in/back/api/admin/dlt/templates/{id}/status
   */
  async updateLiveTemplateStatus(templateId: string, status: DltStatus, remarks?: string, adminName: string = 'Admin'): Promise<boolean> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const url = `https://app.alert21.in/back/api/admin/dlt/templates/${templateId}/status`;
      const response = await firstValueFrom(
        this.http.patch<any>(url, { status }, { headers })
      );

      if (response && response.success) {
        const now = new Date().toISOString();
        this.contentTemplates.update(list => list.map(t => t.id === templateId ? {
          ...t,
          status,
          adminRemarks: remarks || t.adminRemarks,
          verifiedBy: adminName,
          verifiedAt: now
        } : t));

        this.fetchLiveDashboardStats();
        this.toastService.showSuccess('Status Updated', `Template status changed to ${status}.`);
        return true;
      }
    } catch (err) {
      console.error('Template status PATCH API error', err);
    }
    return false;
  }

  async updateLivePeStatus(peId: string, status: DltStatus, remarks?: string, adminName: string = 'Admin'): Promise<boolean> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const url = `https://app.alert21.in/back/api/admin/dlt/principal-entities/${peId}/status`;
      const response = await firstValueFrom(
        this.http.patch<any>(url, { status }, { headers })
      );

      if (response && response.success) {
        const now = new Date().toISOString();
        this.principalEntities.update(list => list.map(pe => pe.id === peId ? {
          ...pe,
          status,
          adminRemarks: remarks || pe.adminRemarks,
          verifiedBy: adminName,
          verifiedAt: now
        } : pe));

        this.fetchLiveDashboardStats();
        this.toastService.showSuccess('Status Updated', `Entity status changed to ${status}.`);
        return true;
      }
    } catch (err) {
      console.error('PE Status PATCH API error', err);
    }
    return false;
  }

  async fetchLivePrincipalEntities() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await firstValueFrom(
        this.http.get<any>('https://app.alert21.in/back/api/admin/dlt/principal-entities?limit=1000', { headers })
      );

      const items = Array.isArray(response?.data?.items) ? response.data.items : (Array.isArray(response?.data) ? response.data : []);
      if (items.length > 0 || (response && response.success)) {
        const mappedPEs: PrincipalEntity[] = items.map((item: any) => ({
          id: item._id,
          userId: item.user_id?._id || '',
          userName: item.user_id?.fullName || 'User',
          companyName: item.pe_name || 'Company',
          peId: item.pe_id || '',
          entityName: item.pe_name || '',
          status: item.status || 'PENDING',
          submittedAt: item.created_at || new Date().toISOString(),
          adminRemarks: item.remarks || '',
          dltOperator: item.dlt_operator || 'JIO',
          entityType: item.entity_type || 'Private Limited',
          verifiedBy: item.verified_by ? 'Admin' : undefined,
          verifiedAt: item.verified_at
        }));
        this.principalEntities.set(mappedPEs);
      }
    } catch (e) {
      console.warn('PE API fallback to local state store.');
    }
  }

  async fetchLiveUsers() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await firstValueFrom(
        this.http.get<any>('https://app.alert21.in/back/api/admin/users?limit=1000', { headers })
      );

      let items: any[] = [];
      if (response && response.success && response.data) {
        if (Array.isArray(response.data.items)) {
          items = response.data.items;
        } else if (Array.isArray(response.data)) {
          items = response.data;
        }
      }

      if (items.length > 0) {
        const mappedUsers: AlertUser[] = items.map((item: any) => ({
          id: item._id,
          accountId: item.account_id || item._id,
          name: item.fullName || 'User',
          company: item.companyName || 'Corporate',
          email: item.email || '',
          mobile: item.mobileNumber ? `${item.mobileNumber}` : '',
          registeredAt: item.createdAt || new Date().toISOString(),
          status: item.status || 'ACTIVE',
          role: item.role || 'USER',
          currentPlan: item.currentPlan || 'No Plan',
          smsBalance: item.smsBalance ?? 0,
          walletBalance: item.walletBalance ?? 0,
          totalSms: item.totalSms ?? 0,
          deliveredSms: item.deliveredSms ?? 0,
          failedSms: item.failedSms ?? 0,
          assignedProviderId: undefined
        }));
        this.users.set(mappedUsers);
      }
    } catch (e) {
      console.warn('Users API fallback to local state store.');
    }
  }

  async updateUserStatus(userId: string, status: UserStatus, adminName: string): Promise<boolean> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const url = `https://app.alert21.in/back/api/admin/users/${userId}/status`;
      const response = await firstValueFrom(
        this.http.patch<any>(url, { status }, { headers })
      );

      if (response && response.success) {
        this.users.update(list => list.map(u => u.id === userId ? { ...u, status } : u));
        this.fetchLiveDashboardStats();
        this.toastService.showSuccess('Status Updated', `User status changed to ${status}.`);
        return true;
      }
    } catch (err) {
      console.error('User status PATCH API error', err);
    }
    return false;
  }

  assignUserProvider(userId: string, providerId: string | undefined, adminName: string) {
    this.users.update(list => list.map(u => u.id === userId ? { ...u, assignedProviderId: providerId } : u));
  }

  updatePeStatus(peId: string, status: DltStatus, remarks: string, adminName: string) {
    this.updateLivePeStatus(peId, status, remarks, adminName);
  }

  updateSenderStatus(senderId: string, status: DltStatus, remarks: string, adminName: string) {
    this.updateLiveSenderStatus(senderId, status, remarks, adminName);
  }

  updateTemplateStatus(templateId: string, status: DltStatus, remarks: string, adminName: string) {
    this.updateLiveTemplateStatus(templateId, status, remarks, adminName);
  }

  setGlobalDefaultProvider(providerId: string, adminName: string) {
    this.smsProviders.update(list => list.map(p => ({
      ...p,
      isGlobalDefault: p.id === providerId
    })));
  }

  updateSmsProvider(providerData: SmsProvider, adminName: string = 'Admin') {
    this.saveProviderConfig(providerData, adminName);
  }

  saveProviderConfig(providerData: Partial<SmsProvider>, adminName: string) {
    if (providerData.id) {
      this.smsProviders.update(list => list.map(p => p.id === providerData.id ? { ...p, ...providerData, updatedAt: new Date().toISOString() } : p));
    }
  }

  /**
   * GET Live User SMS Provider from https://app.alert21.in/back/api/admin/users/{userId}/sms-provider
   */
  async fetchUserSmsProvider(userId: string): Promise<{ provider: any; source: string } | null> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const url = `https://app.alert21.in/back/api/admin/users/${userId}/sms-provider`;
      const response = await firstValueFrom(
        this.http.get<any>(url, { headers })
      );

      if (response && response.success && response.data) {
        return response.data;
      }
    } catch (e) {
      console.warn('GET User SMS Provider API fallback.', e);
    }
    return null;
  }

  /**
   * POST Live DLT Telemarketer Hash from https://app.alert21.in/back/api/admin/tools/dlt-telemarketer-hash
   */
  async generateLiveDltHash(principalEntityId: string, telemarketerId: string): Promise<any | null> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const body = {
        principalEntityId,
        telemarketerId
      };

      const response = await firstValueFrom(
        this.http.post<any>('https://app.alert21.in/back/api/admin/tools/dlt-telemarketer-hash', body, { headers })
      );

      if (response && (response.success || response.hash || response.data)) {
        return response.data || response;
      }
    } catch (e) {
      console.warn('POST DLT Hash Tool API fallback.', e);
    }
    return null;
  }

  /**
   * GET Live SMS Logs from https://app.alert21.in/back/api/admin/sms-logs
   */
  async fetchLiveSmsLogs() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await firstValueFrom(
        this.http.get<any>('https://app.alert21.in/back/api/admin/sms-logs?limit=100', { headers })
      );

      const items = Array.isArray(response?.data?.items)
        ? response.data.items
        : (Array.isArray(response?.data) ? response.data : (Array.isArray(response?.items) ? response.items : null));

      if (items && Array.isArray(items)) {
        const mappedLogs: ProviderRequestLog[] = items.map((item: any) => ({
          id: item._id,
          transactionId: item.transaction_id || item.transactionId || item._id,
          userId: item.user_id?._id || item.user_id?.account_id || item.user_id || '',
          userName: item.user_id?.fullName || item.userName || 'User',
          providerId: item.provider_id?._id || item.provider_id || '',
          providerName: item.provider_id?.name || item.provider_name || 'MSG24',
          peId: item.principal_entity_id || item.peId || '',
          senderHeader: item.sender_id || item.senderHeader || '',
          templateId: item.template_id || item.templateId || '',
          dltTelemarketerIdSha256: item.telemarketer_id_hash || item.dltTelemarketerIdSha256 || '',
          recipientMobileMasked: item.recipient_masked || item.recipient || 'XXXXXX0000',
          messageContentHash: item.message_hash || item.messageContentHash || '',
          requestUrlMasked: item.request_url || item.requestUrlMasked || '',
          httpStatus: item.http_status || item.httpStatus || 200,
          latencyMs: item.latency_ms ?? item.latencyMs ?? 0,
          normalizedStatus: item.status || item.normalizedStatus || 'SUCCESS',
          rawProviderResponse: item.provider_response || item.rawProviderResponse || '',
          timestamp: item.created_at || item.createdAt || new Date().toISOString()
        }));
        this.providerLogs.set(mappedLogs);
      }
    } catch (e) {
      console.warn('SMS Logs API fallback.');
    }
  }

  /**
   * GET Live Audit Logs from https://app.alert21.in/back/api/admin/audit-logs
   */
  async fetchLiveAuditLogs() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const response = await firstValueFrom(
        this.http.get<any>('https://app.alert21.in/back/api/admin/audit-logs', { headers })
      );

      if (response && response.success && response.data && Array.isArray(response.data.items)) {
        const mappedAuditLogs: AdminAuditLog[] = response.data.items.map((item: any) => ({
          id: item._id,
          adminId: item.admin_id?._id || '',
          adminName: item.admin_id?.fullName || 'Admin',
          adminRole: item.admin_id?.role || 'ADMIN',
          action: item.action || '',
          entityType: item.entity_type || '',
          entityId: item.entity_id || '',
          oldValue: item.old_value ? JSON.stringify(item.old_value) : '',
          newValue: item.new_value ? JSON.stringify(item.new_value) : '',
          ipAddress: item.ip || '',
          createdAt: item.created_at || new Date().toISOString()
        }));
        this.auditLogs.set(mappedAuditLogs);
      }
    } catch (e) {
      console.warn('Audit Logs API fallback.');
    }
  }

  // ==========================================
  // TASK #05: BILLING & SMS BALANCE MANAGEMENT
  // ==========================================

  /**
   * GET Live SMS Pricing Slabs from https://app.alert21.in/back/api/admin/billing/pricing
   */
  async fetchLivePricingSlabs() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      const response = await firstValueFrom(
        this.http.get<any>('https://app.alert21.in/back/api/admin/billing/pricing', { headers })
      );

      if (response && response.success && Array.isArray(response.data)) {
        const mappedSlabs: PricingSlab[] = response.data.map((item: any) => ({
          id: item._id || item.id,
          minQuantity: item.min_quantity ?? item.minQuantity ?? 100,
          maxQuantity: item.max_quantity ?? item.maxQuantity ?? 10000,
          ratePerSms: item.rate_per_sms ?? item.ratePerSms ?? 0.26,
          gstPercentage: item.gst_percentage ?? item.gstPercentage ?? 18,
          status: item.status || 'ACTIVE',
          sortOrder: item.sort_order ?? item.sortOrder ?? 1,
          createdAt: item.created_at || item.createdAt,
          updatedAt: item.updated_at || item.updatedAt
        }));
        this.pricingSlabs.set(mappedSlabs);
      }
    } catch (e) {
      console.warn('Pricing Slabs API fallback.');
    }
  }

  /**
   * POST Create Pricing Slab: https://app.alert21.in/back/api/admin/billing/pricing
   */
  async createPricingSlab(slabData: Partial<PricingSlab>): Promise<boolean> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const body = {
        min_quantity: Number(slabData.minQuantity),
        max_quantity: Number(slabData.maxQuantity),
        rate_per_sms: Number(slabData.ratePerSms),
        gst_percentage: Number(slabData.gstPercentage ?? 18),
        status: slabData.status || 'ACTIVE',
        sort_order: Number(slabData.sortOrder ?? 1)
      };

      const response = await firstValueFrom(
        this.http.post<any>('https://app.alert21.in/back/api/admin/billing/pricing', body, { headers })
      );

      if (response && response.success) {
        await this.fetchLivePricingSlabs();
        this.toastService.showSuccess('Pricing Slab Created', 'New SMS Pricing Slab created successfully.');
        return true;
      }
    } catch (e: any) {
      console.error('Create pricing slab API error', e);
      this.toastService.showError('Creation Failed', e?.error?.message || 'Could not create pricing slab.');
    }
    return false;
  }

  /**
   * PUT Update Pricing Slab: https://app.alert21.in/back/api/admin/billing/pricing/{id}
   */
  async updatePricingSlab(id: string, slabData: Partial<PricingSlab>): Promise<boolean> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const body: any = {
        min_quantity: Number(slabData.minQuantity),
        max_quantity: Number(slabData.maxQuantity),
        rate_per_sms: Number(slabData.ratePerSms),
        gst_percentage: Number(slabData.gstPercentage ?? 18),
        status: slabData.status,
        sort_order: Number(slabData.sortOrder ?? 1)
      };

      const response = await firstValueFrom(
        this.http.put<any>(`https://app.alert21.in/back/api/admin/billing/pricing/${id}`, body, { headers })
      );

      if (response && response.success) {
        await this.fetchLivePricingSlabs();
        this.toastService.showSuccess('Pricing Slab Updated', 'SMS Pricing Slab updated successfully.');
        return true;
      }
    } catch (e: any) {
      console.error('Update pricing slab API error', e);
      this.toastService.showError('Update Failed', e?.error?.message || 'Could not update pricing slab.');
    }
    return false;
  }

  /**
   * GET Live Bank Transfer Requests from https://app.alert21.in/back/api/admin/billing/bank-transfers
   */
  async fetchLiveBankTransfers() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      const response = await firstValueFrom(
        this.http.get<any>('https://app.alert21.in/back/api/admin/billing/bank-transfers?limit=1000', { headers })
      );

      const items = Array.isArray(response?.data?.items) ? response.data.items : (Array.isArray(response?.data) ? response.data : []);
      if (items.length > 0 || (response && response.success)) {
        // Try fetching orders and dashboard recentBankTransfers to resolve order details
        let ordersMap = new Map<string, any>();
        
        // 1. Resolve order details from dashboard recentBankTransfers if available
        try {
          const dashRes = await firstValueFrom(
            this.http.get<any>(environment.dashboardUrl, { headers }).pipe(catchError(() => of(null)))
          );
          if (dashRes && dashRes.success && Array.isArray(dashRes.data?.recentBankTransfers)) {
            dashRes.data.recentBankTransfers.forEach((r: any) => {
              if (r.order_id) ordersMap.set(String(r.order_id), r);
              if (r.id) ordersMap.set(String(r.id), r);
              if (r._id) ordersMap.set(String(r._id), r);
              if (r.utr_number) ordersMap.set(String(r.utr_number), r);
              if (r.sms_order_id) ordersMap.set(String(r.sms_order_id), r);
            });
          }
        } catch (e) {}

        const mappedTransfers: BankTransferRequest[] = items.map((item: any) => {
          let order = typeof item.order_id === 'object' && item.order_id !== null ? item.order_id : null;
          const orderKey = String(item.order_id || item.orderId || item._id);
          const utrKey = String(item.utr_number || item.utrNumber || '');

          if (!order && ordersMap.has(orderKey)) {
            order = ordersMap.get(orderKey);
          } else if (!order && utrKey && ordersMap.has(utrKey)) {
            order = ordersMap.get(utrKey);
          }

          const orderIdStr = order ? (order.order_id || order.sms_order_id || order.orderId || order.order_number || order._id) : orderKey;

          const smsQty = order?.sms_quantity ?? order?.smsQuantity ?? item.sms_quantity ?? item.smsQuantity ?? item.quantity ?? 0;
          const rate = order?.rate_per_sms ?? order?.ratePerSms ?? item.rate_per_sms ?? item.ratePerSms ?? item.rate ?? 0;
          const baseAmt = order?.base_amount ?? order?.baseAmount ?? item.base_amount ?? item.baseAmount ?? (smsQty && rate ? (smsQty * rate) : 0);
          const gstAmt = order?.gst_amount ?? order?.gstAmount ?? item.gst_amount ?? item.gstAmount ?? (baseAmt ? (baseAmt * 0.18) : 0);
          const totalAmt = order?.total_amount ?? order?.totalAmount ?? item.total_amount ?? item.totalAmount ?? item.amount ?? (baseAmt + gstAmt) ?? 0;

          let proofUrl = order?.payment_proof || item.payment_proof || item.paymentProof || '';
          if (proofUrl && proofUrl.startsWith('/')) {
            proofUrl = `https://app.alert21.in/back${proofUrl}`;
          }

          return {
            id: item._id || item.id,
            orderId: orderIdStr || 'ORD-000',
            userId: item.user_id?._id || item.user_id || item.userId || '',
            userName: item.user_id?.fullName || item.userName || 'User',
            userEmail: item.user_id?.email || item.userEmail || '',
            companyName: item.user_id?.companyName || item.companyName || '',
            smsQuantity: smsQty,
            ratePerSms: rate,
            baseAmount: baseAmt,
            gstAmount: gstAmt,
            totalAmount: totalAmt,
            paymentMethod: item.payment_method || item.paymentMethod || 'BANK_TRANSFER',
            paymentStatus: item.payment_status || item.paymentStatus || (item.status === 'APPROVED' ? 'PAID' : 'PENDING'),
            purchaseStatus: (item.status || item.purchase_status || item.purchaseStatus || 'PENDING').toUpperCase() as BankTransferStatus,
            utrNumber: item.utr_number || item.utrNumber || item.reference_id || 'N/A',
            paymentProof: proofUrl,
            paymentDate: item.payment_date || item.paymentDate || item.createdAt || new Date().toISOString(),
            requestDate: item.createdAt || item.requestDate || new Date().toISOString(),
            paidAt: item.paid_at || item.paidAt,
            approvedAt: item.approved_at || item.approvedAt,
            approvedBy: item.approved_by || item.approvedBy,
            rejectionRemarks: item.rejection_remarks || item.remarks
          };
        });
        this.bankTransfers.set(mappedTransfers);
      }
    } catch (e) {
      console.warn('Bank Transfers API fallback.');
    }
  }

  /**
   * POST Approve Bank Transfer: https://app.alert21.in/back/api/admin/billing/bank-transfers/{id}/approve
   */
  async approveBankTransfer(id: string, orderId?: string, adminName: string = 'Admin'): Promise<boolean> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const response = await firstValueFrom(
        this.http.post<any>(`https://app.alert21.in/back/api/admin/billing/bank-transfers/${id}/approve`, {}, { headers })
      );

      if (response && (response.success || response.status === 'success' || response.data)) {
        this.bankTransfers.update(list => list.map(t => (t.id === id || (orderId && t.orderId === orderId)) ? {
          ...t,
          purchaseStatus: 'APPROVED',
          paymentStatus: 'PAID',
          approvedAt: new Date().toISOString(),
          approvedBy: adminName
        } : t));

        await this.fetchLiveUsers();
        await this.fetchBillingDashboardStats();
        this.toastService.showSuccess('Bank Transfer Approved', 'Payment approved and SMS balance credited to user.');
        return true;
      }
    } catch (e: any) {
      console.error('Approve bank transfer error', e);
      this.toastService.showError('Approval Failed', e?.error?.message || 'Failed to approve bank transfer.');
    }
    return false;
  }

  /**
   * POST Reject Bank Transfer: https://app.alert21.in/back/api/admin/billing/bank-transfers/{id}/reject
   */
  async rejectBankTransfer(id: string, remarks: string, orderId?: string, adminName: string = 'Admin'): Promise<boolean> {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const body = { remarks: remarks.trim() };
      const response = await firstValueFrom(
        this.http.post<any>(`https://app.alert21.in/back/api/admin/billing/bank-transfers/${id}/reject`, body, { headers })
      );

      if (response && (response.success || response.status === 'success' || response.data)) {
        this.bankTransfers.update(list => list.map(t => (t.id === id || (orderId && t.orderId === orderId)) ? {
          ...t,
          purchaseStatus: 'REJECTED',
          rejectionRemarks: remarks
        } : t));

        await this.fetchBillingDashboardStats();
        this.toastService.showSuccess('Bank Transfer Rejected', 'Request has been marked as REJECTED.');
        return true;
      }
    } catch (e: any) {
      console.error('Reject bank transfer error', e);
      this.toastService.showError('Rejection Failed', e?.error?.message || 'Failed to reject bank transfer.');
    }
    return false;
  }

  /**
   * POST Admin Manual SMS Credit
   */
  async creditUserSms(userId: string, quantity: number, remarks: string, adminName: string = 'Admin'): Promise<boolean> {
    const token = this.authService.authToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body = {
      user_id: userId,
      userId: userId,
      sms_quantity: Number(quantity),
      quantity: Number(quantity),
      smsQuantity: Number(quantity),
      amount: Number(quantity),
      remarks: remarks.trim(),
      note: remarks.trim(),
      admin_name: adminName
    };

    const candidateUrls = [
      `https://app.alert21.in/back/api/admin/users/${userId}/sms-credit`,
      `https://app.alert21.in/back/api/admin/billing/users/${userId}/sms-credit`,
      `https://app.alert21.in/back/api/admin/users/${userId}/credit`,
      `https://app.alert21.in/back/api/admin/billing/credit`,
      `https://app.alert21.in/back/api/admin/billing/sms-credit`
    ];

    let lastError = '';
    for (const url of candidateUrls) {
      try {
        const response = await firstValueFrom(
          this.http.post<any>(url, body, { headers })
        );

        if (response && (response.success || response.status === 'success' || response.data)) {
          this.users.update(list => list.map(u => u.id === userId ? {
            ...u,
            smsBalance: (u.smsBalance ?? 0) + Number(quantity)
          } : u));

          await this.fetchBillingDashboardStats();
          this.toastService.showSuccess('SMS Credited', `Successfully credited ${quantity} SMS to user balance.`);
          return true;
        }
      } catch (e: any) {
        lastError = e?.error?.message || e?.message || lastError;
      }
    }

    this.toastService.showError('Credit Failed', lastError || 'Failed to credit SMS to user.');
    return false;
  }

  /**
   * POST Admin Manual SMS Debit
   */
  async debitUserSms(userId: string, quantity: number, remarks: string, adminName: string = 'Admin'): Promise<boolean> {
    const token = this.authService.authToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body = {
      user_id: userId,
      userId: userId,
      sms_quantity: Number(quantity),
      quantity: Number(quantity),
      smsQuantity: Number(quantity),
      amount: Number(quantity),
      remarks: remarks.trim(),
      note: remarks.trim(),
      admin_name: adminName
    };

    const candidateUrls = [
      `https://app.alert21.in/back/api/admin/users/${userId}/sms-debit`,
      `https://app.alert21.in/back/api/admin/billing/users/${userId}/sms-debit`,
      `https://app.alert21.in/back/api/admin/users/${userId}/debit`,
      `https://app.alert21.in/back/api/admin/billing/debit`,
      `https://app.alert21.in/back/api/admin/billing/sms-debit`
    ];

    let lastError = '';
    for (const url of candidateUrls) {
      try {
        const response = await firstValueFrom(
          this.http.post<any>(url, body, { headers })
        );

        if (response && (response.success || response.status === 'success' || response.data)) {
          this.users.update(list => list.map(u => u.id === userId ? {
            ...u,
            smsBalance: Math.max(0, (u.smsBalance ?? 0) - Number(quantity))
          } : u));

          await this.fetchBillingDashboardStats();
          this.toastService.showSuccess('SMS Debited', `Successfully debited ${quantity} SMS from user balance.`);
          return true;
        }
      } catch (e: any) {
        lastError = e?.error?.message || e?.message || lastError;
      }
    }

    this.toastService.showError('Debit Failed', lastError || 'Failed to debit SMS from user.');
    return false;
  }

  /**
   * GET Live User SMS Ledger
   */
  async fetchUserSmsLedger(userId: string): Promise<SmsLedgerEntry[]> {
    const token = this.authService.authToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const candidateUrls = [
      `https://app.alert21.in/back/api/admin/users/${userId}/sms-ledger`,
      `https://app.alert21.in/back/api/admin/billing/users/${userId}/ledger`,
      `https://app.alert21.in/back/api/admin/users/${userId}/ledger`,
      `https://app.alert21.in/back/api/admin/billing/ledger/${userId}`,
      `https://app.alert21.in/back/api/billing/ledger/${userId}`
    ];

    for (const url of candidateUrls) {
      try {
        const response = await firstValueFrom(
          this.http.get<any>(url, { headers })
        );

        const list = Array.isArray(response?.data) 
          ? response.data 
          : (Array.isArray(response?.data?.ledger) ? response.data.ledger : (Array.isArray(response) ? response : null));

        if (list && Array.isArray(list)) {
          const mappedEntries: SmsLedgerEntry[] = list.map((item: any) => ({
            id: item._id || item.id,
            userId: item.user_id || userId,
            userName: item.user_name || item.userName,
            type: item.type || item.transaction_type || 'ADMIN_CREDIT',
            smsQuantity: item.sms_quantity ?? item.quantity ?? 0,
            balanceBefore: item.balance_before ?? item.balanceBefore ?? 0,
            balanceAfter: item.balance_after ?? item.balanceAfter ?? 0,
            referenceType: item.reference_type || item.referenceType,
            referenceId: item.reference_id || item.referenceId,
            rate: item.rate ?? item.rate_per_sms,
            amount: item.amount ?? item.total_amount,
            remarks: item.remarks || item.note || '',
            createdBy: item.created_by || item.createdBy || 'Admin',
            createdAt: item.created_at || item.createdAt || new Date().toISOString()
          }));
          this.userLedger.set(mappedEntries);
          return mappedEntries;
        }
      } catch (e) {}
    }

    return [];
  }

  /**
   * GET Live Dashboard Stats from https://app.alert21.in/back/api/admin/dashboard
   */
  async fetchBillingDashboardStats() {
    try {
      const token = this.authService.authToken();
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

      const response = await firstValueFrom(
        this.http.get<any>(environment.dashboardUrl, { headers })
      );

      if (response && response.success && response.data) {
        const d = response.data;
        const m = d.metrics || d;

        const stats: BillingDashboardStats = {
          totalSmsDistributed: m.totalSmsDistributed ?? m.total_sms_distributed ?? 0,
          currentTotalUserSmsBalance: m.userSmsBalance ?? m.currentTotalUserSmsBalance ?? m.current_total_user_sms_balance ?? 0,
          totalSmsSold: m.totalSmsSold ?? m.total_sms_sold ?? 0,
          totalBillingValue: m.totalBillingValue ?? m.total_billing_value ?? 0,
          gstCollected: m.gstCollected ?? m.gst_collected ?? 0,
          averageSellingPricePerSms: m.averageSellingPrice ?? m.averageSellingPricePerSms ?? m.average_selling_price_per_sms ?? 0.22,
          totalPaymentReceived: m.totalPaymentReceived ?? m.total_payment_received ?? 0,
          pendingBankTransferCount: m.pendingBankTransfers?.count ?? m.pendingBankTransferCount ?? m.pending_bank_transfer_count ?? 0,
          pendingBankTransferAmount: m.pendingBankTransfers?.amount ?? m.pendingBankTransferAmount ?? m.pending_bank_transfer_amount ?? 0
        };
        this.billingStats.set(stats);

        // Also if backend dashboard returns rich recentBankTransfers, update bankTransfers signal
        if (Array.isArray(d.recentBankTransfers) && d.recentBankTransfers.length > 0) {
          const mappedRecent: BankTransferRequest[] = d.recentBankTransfers.map((item: any) => {
            let proofUrl = item.payment_proof || item.paymentProof || '';
            if (proofUrl && proofUrl.startsWith('/')) {
              proofUrl = `https://app.alert21.in/back${proofUrl}`;
            }

            return {
              id: item._id || item.id,
              orderId: item.order_id || item.sms_order_id || item.orderId || item._id || 'ORD-000',
              userId: item.user_id?._id || item.user_id || item.userId || '',
              userName: item.user_id?.fullName || item.fullName || item.userName || 'User',
              userEmail: item.user_id?.email || item.email || item.userEmail || '',
              companyName: item.user_id?.companyName || item.companyName || '',
              smsQuantity: item.sms_quantity ?? item.smsQuantity ?? item.quantity ?? 0,
              ratePerSms: item.rate_per_sms ?? item.ratePerSms ?? item.rate ?? 0,
              baseAmount: item.base_amount ?? item.baseAmount ?? 0,
              gstAmount: item.gst_amount ?? item.gstAmount ?? 0,
              totalAmount: item.total_amount ?? item.totalAmount ?? 0,
              paymentMethod: item.payment_method || item.paymentMethod || 'BANK_TRANSFER',
              paymentStatus: item.payment_status || item.paymentStatus || (item.status === 'APPROVED' ? 'PAID' : 'PENDING'),
              purchaseStatus: (item.status || item.purchase_status || item.purchaseStatus || 'PENDING').toUpperCase() as BankTransferStatus,
              utrNumber: item.utr_number || item.utrNumber || item.reference_id || 'N/A',
              paymentProof: proofUrl,
              paymentDate: item.payment_date || item.paymentDate || item.createdAt || new Date().toISOString(),
              requestDate: item.createdAt || item.requestDate || new Date().toISOString(),
              paidAt: item.paid_at || item.paidAt,
              approvedAt: item.approved_at || item.approvedAt,
              approvedBy: item.approved_by || item.approvedBy,
              rejectionRemarks: item.rejection_remarks || item.remarks
            };
          });

          this.bankTransfers.set(mappedRecent);
        }
      }
    } catch (e) {
      console.warn('Dashboard Stats API fallback.');
    }
  }

  // =========================================================================
  // WEBSITE MONITORING MODULE - PHASE 1 SIGNALS & METHODS (SPECIFICATION)
  // =========================================================================

  // 1. Monitoring Sources Signal
  monitoringSources = signal<MonitoringSource[]>([]);

  // 2. Monitoring Plans Signal
  monitoringPlans = signal<MonitoringPlan[]>([]);

  // 3. Monitoring Addons Signal
  monitoringAddons = signal<MonitoringAddon[]>([]);

  // 4. Monitoring Subscriptions Signal
  monitoringSubscriptions = signal<MonitoringSubscription[]>([]);

  // 4b. Monitoring Bank Transfer Orders Signal
  monitoringBankTransfers = signal<any[]>([]);

  // 5. Global Website Monitors Signal
  websiteMonitors = signal<WebsiteMonitor[]>([]);

  // 6. Global Incidents Signal
  monitorIncidents = signal<MonitorIncident[]>([]);

  // 7. Monitoring Templates Signal
  monitoringTemplates = signal<MonitoringTemplate[]>([]);

  // 8. Live Monitoring Dashboard Stats Signal
  monitoringDashboardStats = signal<MonitoringDashboardStats>({
    totalActiveMonitors: 0,
    monitorsUp: 0,
    monitorsDown: 0,
    monitorsPaused: 0,
    monitorsDegraded: 0,
    incidentsToday: 0,
    avgPlatformLatencyMs: 0,
    alertsSentToday: { total: 0, email: 0, sms: 0, whatsapp: 0, inApp: 0 },
    activeSubscriptionsCount: 0,
    mrr: 0,
    arr: 0,
    upcomingRenewalsCount: 0,
    expiredInGraceCount: 0,
    pendingBankTransfersCount: 0,
    topFailingDomains: []
  });

  // =========================================================================
  // API METHODS - WEBSITE MONITORING (SECTION 13.2 LIVE API ENDPOINTS)
  // =========================================================================

  private getAuthHeaders() {
    const token = this.authService.authToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * GET /api/v1/admin/monitoring/dashboard
   */
  async fetchMonitoringDashboard() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/dashboard',
      'https://app.alert21.in/back/api/admin/monitoring/dashboard'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        if (res && (res.success || res.data)) {
          const d = res.data || res;
          const kpis = d.kpis || d;
          const monitors = this.websiteMonitors();
          const activeMonitors = monitors.filter(m => !m.softDeletedAt);
          const upCount = activeMonitors.filter(m => m.status === 'UP').length;
          const downCount = activeMonitors.filter(m => m.status === 'DOWN').length;
          const pausedCount = activeMonitors.filter(m => m.status === 'PAUSED' || m.isPaused).length;
          const degradedCount = activeMonitors.filter(m => m.status === 'DEGRADED').length;
          const calculatedAvgLatency = activeMonitors.length 
            ? Math.round(activeMonitors.reduce((sum, m) => sum + (m.responseTimeMs || 0), 0) / activeMonitors.length) 
            : 0;

          this.monitoringDashboardStats.set({
            totalActiveMonitors: kpis.total_monitors ?? kpis.totalMonitors ?? (activeMonitors.length || 0),
            monitorsUp: kpis.monitors_up ?? kpis.monitorsUp ?? (upCount || 0),
            monitorsDown: kpis.monitors_down ?? kpis.monitorsDown ?? (downCount || 0),
            monitorsPaused: kpis.monitors_paused ?? kpis.monitorsPaused ?? (pausedCount || 0),
            monitorsDegraded: kpis.monitors_degraded ?? kpis.monitorsDegraded ?? (degradedCount || 0),
            incidentsToday: kpis.incidents_today ?? kpis.incidentsToday ?? this.monitorIncidents().filter(i => i.status === 'OPEN').length,
            avgPlatformLatencyMs: d.avgPlatformLatencyMs ?? d.avg_latency ?? (calculatedAvgLatency || 0),
            alertsSentToday: d.alertsSentToday || {
              total: d.alerts_total ?? d.alertsSentToday?.total ?? 0,
              email: d.alerts_email ?? d.alertsSentToday?.email ?? 0,
              sms: d.alerts_sms ?? d.alertsSentToday?.sms ?? 0,
              whatsapp: d.alerts_whatsapp ?? d.alertsSentToday?.whatsapp ?? 0,
              inApp: d.alerts_inapp ?? d.alertsSentToday?.inApp ?? 0
            },
            activeSubscriptionsCount: kpis.active_subscriptions ?? kpis.activeSubscriptionsCount ?? this.monitoringSubscriptions().filter(s => s.status === 'ACTIVE').length,
            mrr: d.mrr ?? 0,
            arr: d.arr ?? (d.mrr ? d.mrr * 12 : 0),
            upcomingRenewalsCount: d.upcomingRenewalsCount ?? 0,
            expiredInGraceCount: d.expiredInGraceCount ?? 0,
            pendingBankTransfersCount: kpis.pending_bank_transfers ?? d.pendingBankTransfersCount ?? 0,
            topFailingDomains: Array.isArray(d.topFailingDomains) ? d.topFailingDomains : []
          });
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * GET /api/v1/admin/monitoring/sources
   */
  async fetchMonitoringSources() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/sources?limit=1000',
      'https://app.alert21.in/back/api/admin/monitoring/sources?limit=1000'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.sources)
          ? res.data.sources
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.sources) ? res.sources : (Array.isArray(res) ? res : null))));

        if (list && Array.isArray(list)) {
          const mapped: MonitoringSource[] = list.map((s: any) => ({
            id: s._id || s.id,
            name: s.name,
            code: s.code,
            type: s.type || 'NATIVE_HTTP',
            region: s.region || 'India',
            purpose: s.purpose || 'PRIMARY',
            minIntervalSeconds: s.min_interval_seconds ?? s.minIntervalSeconds ?? 30,
            timeoutSeconds: s.timeout_seconds ?? s.timeoutSeconds ?? 10,
            maxConcurrency: s.max_concurrency ?? s.maxConcurrency ?? 500,
            priority: s.priority ?? 1,
            costRef: s.cost_ref ?? s.costRef ?? 0,
            health: s.health || 'HEALTHY',
            status: s.status || 'ACTIVE',
            lastHeartbeatAt: s.last_heartbeat_at || s.lastHeartbeatAt || s.updatedAt,
            successRate: s.success_rate ?? s.successRate ?? 100,
            avgCheckTimeMs: s.avg_check_time_ms ?? s.avgCheckTimeMs ?? 40,
            queueLagMs: s.queue_lag_ms ?? s.queueLagMs ?? 0,
            createdAt: s.createdAt || s.created_at
          }));
          this.monitoringSources.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * POST /api/v1/admin/monitoring/sources
   */
  async createMonitoringSource(source: Partial<MonitoringSource>): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const src = source as any;
    const payload: any = {
      name: source.name || 'Custom Worker',
      code: (source.code || 'SRC_' + Date.now()).toUpperCase(),
      type: source.type || 'NATIVE_HTTP',
      region: source.region || 'India (Mumbai)',
      purpose: source.purpose || 'PRIMARY',
      min_interval_seconds: Number(source.minIntervalSeconds ?? src.min_interval_seconds ?? 30),
      minIntervalSeconds: Number(source.minIntervalSeconds ?? src.min_interval_seconds ?? 30),
      timeout_seconds: Number(source.timeoutSeconds ?? src.timeout_seconds ?? 10),
      timeoutSeconds: Number(source.timeoutSeconds ?? src.timeout_seconds ?? 10),
      max_concurrency: Number(source.maxConcurrency ?? src.max_concurrency ?? 500),
      maxConcurrency: Number(source.maxConcurrency ?? src.max_concurrency ?? 500),
      priority: Number(source.priority ?? 1),
      status: source.status || 'ACTIVE'
    };

    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/sources',
      'https://app.alert21.in/back/api/admin/monitoring/sources'
    ];

    let lastError = '';
    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, payload, { headers })
        );
        if (res && (res.success || res.data)) {
          await this.fetchMonitoringSources();
          this.toastService.showSuccess('Source Created', 'Monitoring probe worker registered successfully.');
          return true;
        }
      } catch (e: any) {
        lastError = e?.error?.message || e?.message || lastError;
      }
    }
    if (lastError) {
      this.toastService.showError('Source Registration Failed', lastError);
    }
    return false;
  }

  /**
   * PATCH /api/v1/admin/monitoring/sources/:id/status
   */
  async toggleSourceStatus(id: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const urls = [
      `https://app.alert21.in/back/api/v1/admin/monitoring/sources/${id}/status`,
      `https://app.alert21.in/back/api/admin/monitoring/sources/${id}/status`
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.patch<any>(url, {}, { headers }).pipe(catchError(() => of(null)))
        );
        if (res && (res.success || res.data)) {
          await this.fetchMonitoringSources();
          this.toastService.showSuccess('Status Updated', 'Monitoring source status toggled.');
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  /**
   * GET /api/v1/admin/monitoring/plans
   */
  async fetchMonitoringPlans() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/plans?limit=1000',
      'https://app.alert21.in/back/api/admin/monitoring/plans?limit=1000'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.plans)
          ? res.data.plans
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.plans) ? res.plans : (Array.isArray(res) ? res : null))));

        if (list && Array.isArray(list)) {
          const mapped: MonitoringPlan[] = list.map((p: any) => ({
            id: p._id || p.id,
            code: p.code,
            name: p.name,
            monthlyPrice: p.monthly_price ?? p.monthlyPrice ?? 0,
            annualPrice: p.annual_price ?? p.annualPrice ?? 0,
            gstPercent: p.gst_percent ?? p.gstPercent ?? 18,
            includedMonitors: p.included_monitors ?? p.includedMonitors ?? 1,
            checkIntervalSeconds: p.check_interval_seconds ?? p.checkIntervalSeconds ?? 60,
            retentionDays: p.retention_days ?? p.retentionDays ?? 30,
            notificationContacts: p.notification_contacts ?? p.notificationContacts ?? 2,
            emailInApp: p.email_in_app ?? p.emailInApp ?? true,
            smsMode: (p.sms_mode === 'USER_WALLET' || p.sms_mode === 'WALLET') ? 'USER_WALLET' : (p.sms_mode ?? 'USER_WALLET'),
            whatsAppMode: (p.whatsapp_mode === 'USER_WALLET' || p.whatsapp_mode === 'WALLET') ? 'USER_WALLET' : (p.whatsapp_mode ?? 'USER_WALLET'),
            sslMonitoring: p.ssl_monitoring ?? p.sslMonitoring ?? true,
            slowResponseAlert: p.slow_response_alert ?? p.slowResponseAlert ?? true,
            slowThresholdMs: p.slow_threshold_ms ?? p.slowThresholdMs ?? 3000,
            verificationSources: p.verification_sources ?? p.verificationSources ?? 1,
            webhooksStatusPage: p.webhooks_status_page ?? p.webhooksStatusPage ?? false,
            addOnEligibility: p.add_on_eligibility ?? p.addOnEligibility ?? [],
            gracePeriodDays: p.grace_period_days ?? p.gracePeriodDays ?? 3,
            visibility: p.visibility || 'PUBLIC',
            sortOrder: p.sort_order ?? p.sortOrder ?? 0,
            badge: p.badge,
            status: p.status || 'ACTIVE',
            createdAt: p.createdAt || p.created_at
          }));
          this.monitoringPlans.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * POST /api/v1/admin/monitoring/plans
   */
  async createMonitoringPlan(plan: Partial<MonitoringPlan>): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const p = plan as any;
    const monthlyPrice = Number(plan.monthlyPrice ?? p.monthly_price ?? 0);
    const annualPrice = Number(plan.annualPrice ?? p.annual_price ?? 0);
    const includedMonitors = Number(plan.includedMonitors ?? p.included_monitors ?? 1);
    const checkInterval = Number(plan.checkIntervalSeconds ?? p.check_interval_seconds ?? 60);
    const retention = Number(plan.retentionDays ?? p.retention_days ?? 30);
    const contacts = Number(plan.notificationContacts ?? p.notification_contacts ?? 2);

    const resolveMode = (val?: string) => {
      if (!val) return 'USER_WALLET';
      if (val === 'WALLET') return 'USER_WALLET';
      return val;
    };

    const payload: any = {
      code: plan.code || 'PLAN_' + Date.now(),
      name: plan.name || 'New Tier',
      monthly_price: monthlyPrice,
      annual_price: annualPrice,
      monthlyPrice: monthlyPrice,
      annualPrice: annualPrice,
      gst_percent: plan.gstPercent ?? p.gst_percent ?? 18,
      gstPercent: plan.gstPercent ?? p.gst_percent ?? 18,
      included_monitors: includedMonitors,
      includedMonitors: includedMonitors,
      check_interval_seconds: checkInterval,
      checkIntervalSeconds: checkInterval,
      retention_days: retention,
      retentionDays: retention,
      notification_contacts: contacts,
      notificationContacts: contacts,
      email_in_app: plan.emailInApp ?? p.email_in_app ?? true,
      emailInApp: plan.emailInApp ?? p.email_in_app ?? true,
      sms_mode: resolveMode(plan.smsMode ?? p.sms_mode),
      smsMode: resolveMode(plan.smsMode ?? p.sms_mode),
      whatsapp_mode: resolveMode(plan.whatsAppMode ?? p.whatsapp_mode),
      whatsAppMode: resolveMode(plan.whatsAppMode ?? p.whatsapp_mode),
      ssl_monitoring: plan.sslMonitoring ?? p.ssl_monitoring ?? true,
      sslMonitoring: plan.sslMonitoring ?? p.ssl_monitoring ?? true,
      slow_response_alert: plan.slowResponseAlert ?? p.slow_response_alert ?? true,
      slowResponseAlert: plan.slowResponseAlert ?? p.slow_response_alert ?? true,
      slow_threshold_ms: plan.slowThresholdMs ?? p.slow_threshold_ms ?? 3000,
      slowThresholdMs: plan.slowThresholdMs ?? p.slow_threshold_ms ?? 3000,
      verification_sources: plan.verificationSources ?? p.verification_sources ?? 1,
      verificationSources: plan.verificationSources ?? p.verification_sources ?? 1,
      webhooks_status_page: plan.webhooksStatusPage ?? p.webhooks_status_page ?? false,
      webhooksStatusPage: plan.webhooksStatusPage ?? p.webhooks_status_page ?? false,
      add_on_eligibility: plan.addOnEligibility ?? p.add_on_eligibility ?? [],
      addOnEligibility: plan.addOnEligibility ?? p.add_on_eligibility ?? [],
      grace_period_days: plan.gracePeriodDays ?? p.grace_period_days ?? 3,
      gracePeriodDays: plan.gracePeriodDays ?? p.grace_period_days ?? 3,
      visibility: plan.visibility || 'PUBLIC',
      sort_order: Number(plan.sortOrder ?? p.sort_order ?? 0),
      sortOrder: Number(plan.sortOrder ?? p.sort_order ?? 0),
      badge: plan.badge,
      status: plan.status || 'ACTIVE'
    };

    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/plans',
      'https://app.alert21.in/back/api/admin/monitoring/plans'
    ];

    let lastError = '';
    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, payload, { headers })
        );
        if (res && (res.success || res.data)) {
          await this.fetchMonitoringPlans();
          this.toastService.showSuccess('Plan Created', 'Monitoring plan registered successfully.');
          return true;
        }
      } catch (e: any) {
        lastError = e?.error?.message || e?.message || lastError;
      }
    }
    if (lastError) {
      this.toastService.showError('Plan Creation Failed', lastError);
    }
    return false;
  }

  /**
   * PUT /api/v1/admin/monitoring/plans/:id
   */
  async updateMonitoringPlan(id: string, updates: Partial<MonitoringPlan>): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const resolveMode = (val?: string) => {
      if (!val) return 'USER_WALLET';
      if (val === 'WALLET') return 'USER_WALLET';
      return val;
    };
    const payload: any = { ...updates };
    if (updates.monthlyPrice !== undefined) payload.monthly_price = Number(updates.monthlyPrice);
    if (updates.annualPrice !== undefined) payload.annual_price = Number(updates.annualPrice);
    if (updates.includedMonitors !== undefined) payload.included_monitors = Number(updates.includedMonitors);
    if (updates.checkIntervalSeconds !== undefined) payload.check_interval_seconds = Number(updates.checkIntervalSeconds);
    if (updates.retentionDays !== undefined) payload.retention_days = Number(updates.retentionDays);
    if (updates.notificationContacts !== undefined) payload.notification_contacts = Number(updates.notificationContacts);
    if (updates.smsMode !== undefined) payload.sms_mode = resolveMode(updates.smsMode);
    if (updates.whatsAppMode !== undefined) payload.whatsapp_mode = resolveMode(updates.whatsAppMode);
    if (updates.sslMonitoring !== undefined) payload.ssl_monitoring = updates.sslMonitoring;
    if (updates.slowResponseAlert !== undefined) payload.slow_response_alert = updates.slowResponseAlert;
    if (updates.slowThresholdMs !== undefined) payload.slow_threshold_ms = Number(updates.slowThresholdMs);
    if (updates.verificationSources !== undefined) payload.verification_sources = Number(updates.verificationSources);
    if (updates.webhooksStatusPage !== undefined) payload.webhooks_status_page = updates.webhooksStatusPage;
    if (updates.addOnEligibility !== undefined) payload.add_on_eligibility = updates.addOnEligibility;
    if (updates.gracePeriodDays !== undefined) payload.grace_period_days = Number(updates.gracePeriodDays);
    if (updates.sortOrder !== undefined) payload.sort_order = Number(updates.sortOrder);

    const urls = [
      `https://app.alert21.in/back/api/v1/admin/monitoring/plans/${id}`,
      `https://app.alert21.in/back/api/admin/monitoring/plans/${id}`
    ];

    let lastError = '';
    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.patch<any>(url, payload, { headers })
        );
        if (res && (res.success || res.data)) {
          await this.fetchMonitoringPlans();
          this.toastService.showSuccess('Plan Updated', 'Monitoring plan updated successfully.');
          return true;
        }
      } catch (e: any) {
        lastError = e?.error?.message || e?.message || lastError;
      }
    }
    if (lastError) {
      this.toastService.showError('Plan Update Failed', lastError);
    }
    return false;
  }

  /**
   * DELETE /api/v1/admin/monitoring/plans/:id
   */
  async deleteMonitoringPlan(id: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const urls = [
      `https://app.alert21.in/back/api/v1/admin/monitoring/plans/${id}`,
      `https://app.alert21.in/back/api/admin/monitoring/plans/${id}`
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.delete<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        if (res && (res.success || res.data)) {
          await this.fetchMonitoringPlans();
          this.toastService.showSuccess('Plan Archived', 'Plan marked as archived.');
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  /**
   * GET /api/v1/admin/monitoring/addons
   */
  async fetchMonitoringAddons() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/addons?limit=1000',
      'https://app.alert21.in/back/api/admin/monitoring/addons?limit=1000'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.addons)
          ? res.data.addons
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.addons) ? res.addons : (Array.isArray(res) ? res : null))));

        if (list && Array.isArray(list)) {
          const mapped: MonitoringAddon[] = list.map((a: any) => ({
            id: a._id || a.id,
            sku: a.sku,
            name: a.name,
            monthlyPrice: a.monthly_price ?? a.monthlyPrice ?? 0,
            annualPrice: a.annual_price ?? a.annualPrice ?? 0,
            quotaDelta: a.quota_delta ?? a.quotaDelta ?? 0,
            type: a.type || 'MONITORS',
            ruleDescription: a.rule_description ?? a.ruleDescription ?? '',
            status: a.status || 'ACTIVE'
          }));
          this.monitoringAddons.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * GET /api/v1/admin/monitoring/subscriptions
   */
  async fetchMonitoringSubscriptions() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/subscriptions?limit=1000',
      'https://app.alert21.in/back/api/admin/monitoring/subscriptions?limit=1000'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.subscriptions)
          ? res.data.subscriptions
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.subscriptions) ? res.subscriptions : (Array.isArray(res) ? res : null))));

        if (list && Array.isArray(list)) {
          const allMonitors = this.websiteMonitors();
          const mapped: MonitoringSubscription[] = list.map((s: any) => {
            const uId = typeof s.user_id === 'object' && s.user_id ? (s.user_id._id || s.user_id.id) : (s.user_id || s.userId);
            const userLiveMonitors = allMonitors.filter(m => String(m.userId) === String(uId) && !m.softDeletedAt);
            const maxMonitors = s.entitlement_snapshot?.max_monitors ?? s.max_monitors_quota ?? s.plan_id?.included_monitors ?? s.maxMonitorsQuota ?? 5;
            const maxContacts = s.entitlement_snapshot?.max_contacts ?? s.max_contacts_quota ?? s.plan_id?.notification_contacts ?? s.maxContactsQuota ?? 2;
            const monitorsCount = s.current_monitors_count ?? (userLiveMonitors.length || 0);
            const planMonthly = s.plan_id?.monthly_price ?? s.monthly_amount ?? (s.plan_code === 'BASIC' || s.plan_id?.code === 'BASIC' ? 299 : 0);
            const planAnnual = s.plan_id?.annual_price ?? s.annual_amount ?? (s.plan_code === 'BASIC' || s.plan_id?.code === 'BASIC' ? 2999 : 0);
            const basePrice = s.billing_cycle === 'ANNUAL' ? planAnnual : planMonthly;
            const gstRate = s.plan_id?.gst_percent ?? 18;
            const calculatedTotal = basePrice > 0 ? Number((basePrice + (basePrice * gstRate / 100)).toFixed(2)) : 0;
            const paidAmt = s.paid_amount ?? s.paidAmount ?? (calculatedTotal > 0 ? calculatedTotal : (basePrice > 0 ? basePrice : 0));

            return {
              id: s._id || s.id,
              userId: uId,
              userName: typeof s.user_id === 'object' && s.user_id ? (s.user_id.fullName || s.user_id.name || 'User') : (s.userName || 'User'),
              userEmail: typeof s.user_id === 'object' && s.user_id ? (s.user_id.email || '') : (s.userEmail || ''),
              companyName: typeof s.user_id === 'object' && s.user_id ? (s.user_id.companyName || '') : (s.companyName || ''),
              planId: typeof s.plan_id === 'object' && s.plan_id ? (s.plan_id._id || s.plan_id.id) : (s.plan_id || s.planId),
              planCode: typeof s.plan_id === 'object' && s.plan_id ? (s.plan_id.code || 'FREE') : (s.plan_code || s.planCode || 'FREE'),
              planName: typeof s.plan_id === 'object' && s.plan_id ? (s.plan_id.name || 'Plan') : (s.planName || 'Free Plan'),
              billingCycle: s.billing_cycle || s.billingCycle || 'FREE',
              status: s.status || 'ACTIVE',
              currentMonitorsCount: monitorsCount,
              maxMonitorsQuota: maxMonitors,
              currentContactsCount: s.current_contacts_count ?? s.currentContactsCount ?? 0,
              maxContactsQuota: maxContacts,
              startDate: s.starts_at || s.start_date || s.startDate || s.createdAt,
              endDate: s.expires_at || s.end_date || s.endDate,
              graceEndDate: s.grace_ends_at || s.grace_end_date || s.graceEndDate,
              renewalDate: s.expires_at || s.renewal_date || s.renewalDate || s.end_date,
              autoRenew: s.auto_renew ?? s.autoRenew ?? true,
              monthlyAmount: planMonthly,
              annualAmount: planAnnual,
              paidAmount: paidAmt,
              smsWalletBalance: s.sms_wallet_balance ?? s.smsWalletBalance ?? 0,
              whatsAppWalletBalance: s.whatsapp_wallet_balance ?? s.whatsAppWalletBalance ?? 0,
              adminNotes: s.admin_notes || s.adminNotes,
              createdAt: s.createdAt || s.created_at
            };
          });
          this.monitoringSubscriptions.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * GET /api/v1/admin/monitoring/bank-transfers
   */
  async fetchMonitoringBankTransfers() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/bank-transfers',
      'https://app.alert21.in/back/api/admin/monitoring/bank-transfers'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(`${url}?limit=1000`, { headers }).pipe(catchError(() => of(null)))
        );
        if (res && (res.success || res.data)) {
          const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data?.orders) ? res.data.orders : []));
          const mapped = list.map((item: any) => ({
            id: item._id || item.id,
            orderNumber: item.order_number || item.orderNumber || 'MON-ORD-000',
            userId: item.user_id?._id || item.user_id || '',
            userName: item.user_id?.fullName || item.userName || 'User',
            userEmail: item.user_id?.email || item.userEmail || '',
            userMobile: item.user_id?.mobileNumber || item.userMobile || '',
            companyName: item.user_id?.companyName || item.companyName || '',
            planName: item.plan_id?.name || item.planName || 'Monitoring Plan',
            planCode: item.plan_id?.code || item.planCode || '',
            billingCycle: item.billing_cycle || item.billingCycle || 'MONTHLY',
            baseAmount: item.base_amount || item.baseAmount || 0,
            taxableAmount: item.taxable_amount || item.taxableAmount || 0,
            gstRate: item.gst_rate || item.gstRate || 18,
            gstAmount: item.gst_amount || item.gstAmount || 0,
            totalPayable: item.total_payable || item.totalPayable || 0,
            paymentMethod: item.payment_method || 'BANK_TRANSFER',
            paymentStatus: item.payment_status || 'PENDING',
            utrNumber: item.bank_transfer_details?.utr_number || item.utr_number || item.utrNumber || 'N/A',
            bankName: item.bank_transfer_details?.bank_name || item.bank_name || '',
            paymentDate: item.bank_transfer_details?.payment_date || item.payment_date || item.created_at || new Date().toISOString(),
            paymentProof: item.bank_transfer_details?.proof_file_url || item.proof_file_url || '',
            adminStatus: item.bank_transfer_details?.admin_status || (item.payment_status === 'PAID' ? 'APPROVED' : (item.payment_status === 'FAILED' ? 'REJECTED' : 'PENDING')),
            adminRemarks: item.bank_transfer_details?.admin_remarks || item.admin_remarks || '',
            createdAt: item.created_at || item.createdAt || new Date().toISOString()
          }));
          this.monitoringBankTransfers.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * POST /api/v1/admin/monitoring/bank-transfer/:id/approve
   */
  async approveMonitoringBankTransfer(id: string, remarks: string = 'Approved by Admin'): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const urls = [
      `https://app.alert21.in/back/api/v1/admin/monitoring/bank-transfer/${id}/approve`,
      `https://app.alert21.in/back/api/admin/monitoring/bank-transfer/${id}/approve`
    ];

    let lastError = '';
    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, { remarks }, { headers })
        );
        if (res && (res.success || res.message)) {
          await this.fetchMonitoringBankTransfers();
          await this.fetchMonitoringSubscriptions();
          await this.fetchMonitoringDashboard();
          this.toastService.showSuccess('Transfer Approved', 'Website monitoring subscription activated.');
          return true;
        }
      } catch (e: any) {
        lastError = e?.error?.message || e?.message || lastError;
      }
    }
    if (lastError) {
      this.toastService.showError('Approval Failed', lastError);
    }
    return false;
  }

  /**
   * POST /api/v1/admin/monitoring/bank-transfer/:id/reject
   */
  async rejectMonitoringBankTransfer(id: string, reason: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const urls = [
      `https://app.alert21.in/back/api/v1/admin/monitoring/bank-transfer/${id}/reject`,
      `https://app.alert21.in/back/api/admin/monitoring/bank-transfer/${id}/reject`
    ];

    let lastError = '';
    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, { reason }, { headers })
        );
        if (res && (res.success || res.message)) {
          await this.fetchMonitoringBankTransfers();
          this.toastService.showSuccess('Transfer Rejected', 'Website monitoring order rejected.');
          return true;
        }
      } catch (e: any) {
        lastError = e?.error?.message || e?.message || lastError;
      }
    }
    if (lastError) {
      this.toastService.showError('Rejection Failed', lastError);
    }
    return false;
  }

  /**
   * PATCH /api/v1/admin/monitoring/subscriptions/:id/quota
   */
  async updateSubscriptionQuota(id: string, maxMonitors: number, maxContacts: number, notes: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const body = { max_monitors: maxMonitors, max_contacts: maxContacts, notes: notes.trim() };
    const urls = [
      `https://app.alert21.in/back/api/v1/admin/monitoring/subscriptions/${id}/quota`,
      `https://app.alert21.in/back/api/admin/monitoring/subscriptions/${id}/quota`
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.patch<any>(url, body, { headers }).pipe(catchError(() => of(null)))
        );
        if (res && (res.success || res.data)) {
          await this.fetchMonitoringSubscriptions();
          this.toastService.showSuccess('Quota Updated', 'User monitoring quota updated with audit entry.');
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  /**
   * POST /api/v1/admin/monitoring/subscriptions/:id/toggle-pause
   */
  async togglePauseSubscription(id: string, pause: boolean, notes: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const body = { pause: pause, notes: notes.trim() };
    const urls = [
      `https://app.alert21.in/back/api/v1/admin/monitoring/subscriptions/${id}/toggle-pause`,
      `https://app.alert21.in/back/api/admin/monitoring/subscriptions/${id}/toggle-pause`
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, body, { headers }).pipe(catchError(() => of(null)))
        );
        if (res && (res.success || res.data)) {
          await this.fetchMonitoringSubscriptions();
          this.toastService.showSuccess('Subscription Updated', `Subscription marked as ${pause ? 'PAUSED' : 'ACTIVE'}.`);
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  /**
   * GET /api/v1/admin/monitoring/monitors
   */
  async fetchGlobalMonitors() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/monitors?limit=1000',
      'https://app.alert21.in/back/api/admin/monitoring/monitors?limit=1000'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.monitors)
          ? res.data.monitors
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.monitors) ? res.monitors : (Array.isArray(res) ? res : null))));

        if (list && Array.isArray(list)) {
          const mapped: WebsiteMonitor[] = list.map((m: any) => ({
            id: m._id || m.id,
            userId: typeof m.user_id === 'object' && m.user_id ? (m.user_id._id || m.user_id.id) : (m.user_id || m.userId || ''),
            userName: typeof m.user_id === 'object' && m.user_id ? (m.user_id.fullName || m.user_id.name || 'User') : (m.userName || 'User'),
            userEmail: typeof m.user_id === 'object' && m.user_id ? (m.user_id.email || '') : (m.userEmail || ''),
            name: m.name || 'Website Monitor',
            url: m.url || '',
            status: m.status || 'UP',
            intervalSeconds: m.interval_sec ?? m.interval_seconds ?? m.intervalSeconds ?? 60,
            timeoutSeconds: m.timeout_sec ?? m.timeout_seconds ?? m.timeoutSeconds ?? 10,
            thresholdMs: m.slow_threshold_ms ?? m.threshold_ms ?? m.thresholdMs ?? 3000,
            sslEnabled: m.ssl_enabled ?? m.sslEnabled ?? false,
            sslValid: m.ssl_info?.valid ?? m.ssl_valid ?? m.sslValid ?? true,
            sslDaysRemaining: m.ssl_info?.days_remaining ?? m.ssl_days_remaining ?? m.sslDaysRemaining ?? 0,
            sslExpiresAt: m.ssl_info?.expires_at || m.ssl_expires_at || m.sslExpiresAt,
            lastCheckAt: m.last_check_at || m.lastCheckAt || m.updated_at || m.updatedAt,
            nextCheckAt: m.next_check_at || m.nextCheckAt,
            responseTimeMs: m.last_response_time_ms ?? m.response_time_ms ?? m.responseTimeMs ?? 0,
            uptime30d: m.uptime_stats?.uptime_30d ?? m.uptime_30d ?? m.uptime30d ?? 100,
            httpStatusCode: m.last_http_status ?? m.http_status_code ?? m.httpStatusCode ?? 200,
            lastErrorCode: m.last_error_code ?? m.lastErrorCode,
            lastIncidentAt: m.last_incident_at || m.lastIncidentAt,
            sourceCode: m.source_code || m.sourceCode || 'A21_NATIVE_PRIMARY',
            isPaused: m.status === 'PAUSED' || m.is_paused || m.isPaused || false,
            softDeletedAt: m.deleted_at || m.soft_deleted_at || m.softDeletedAt,
            createdAt: m.created_at || m.createdAt || new Date().toISOString()
          }));
          this.websiteMonitors.set(mapped);
          
          // Re-calculate dashboard metrics with real loaded monitors
          const activeMonitors = mapped.filter(m => !m.softDeletedAt);
          const upCount = activeMonitors.filter(m => m.status === 'UP').length;
          const downCount = activeMonitors.filter(m => m.status === 'DOWN').length;
          const pausedCount = activeMonitors.filter(m => m.status === 'PAUSED' || m.isPaused).length;
          const degradedCount = activeMonitors.filter(m => m.status === 'DEGRADED').length;
          const calculatedAvgLatency = activeMonitors.length 
            ? Math.round(activeMonitors.reduce((sum, m) => sum + (m.responseTimeMs || 0), 0) / activeMonitors.length) 
            : 0;

          this.monitoringDashboardStats.update(stats => ({
            ...stats,
            totalActiveMonitors: stats.totalActiveMonitors || activeMonitors.length,
            monitorsUp: stats.monitorsUp || upCount,
            monitorsDown: stats.monitorsDown || downCount,
            monitorsPaused: stats.monitorsPaused || pausedCount,
            monitorsDegraded: stats.monitorsDegraded || degradedCount,
            avgPlatformLatencyMs: stats.avgPlatformLatencyMs || calculatedAvgLatency
          }));
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * POST /api/v1/admin/monitoring/recheck/:id
   */
  async recheckMonitor(id: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const urls = [
      `https://app.alert21.in/back/api/v1/admin/monitoring/recheck/${id}`,
      `https://app.alert21.in/back/api/admin/monitoring/recheck/${id}`
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, {}, { headers }).pipe(catchError(() => of(null)))
        );
        if (res && (res.success || res.data)) {
          await this.fetchGlobalMonitors();
          this.toastService.showSuccess('Re-check Triggered', 'Safe instant re-check completed.');
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  /**
   * POST /api/v1/admin/monitoring/monitors/:id/toggle-pause
   */
  async togglePauseMonitor(id: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const urls = [
      `https://app.alert21.in/back/api/v1/admin/monitoring/monitors/${id}/toggle-pause`,
      `https://app.alert21.in/back/api/admin/monitoring/monitors/${id}/toggle-pause`
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, {}, { headers }).pipe(catchError(() => of(null)))
        );
        if (res && (res.success || res.data)) {
          await this.fetchGlobalMonitors();
          this.toastService.showSuccess('Monitor Toggled', 'Monitor pause/resume status updated.');
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  /**
   * GET /api/v1/admin/monitoring/incidents
   */
  async fetchGlobalIncidents() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/incidents?limit=1000',
      'https://app.alert21.in/back/api/admin/monitoring/incidents?limit=1000'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.incidents)
          ? res.data.incidents
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.incidents) ? res.incidents : (Array.isArray(res) ? res : null))));

        if (list && Array.isArray(list)) {
          const mapped: MonitorIncident[] = list.map((i: any) => ({
            id: i._id || i.id,
            monitorId: typeof i.monitor_id === 'object' && i.monitor_id ? (i.monitor_id._id || i.monitor_id.id) : (i.monitor_id || i.monitorId),
            monitorName: typeof i.monitor_id === 'object' && i.monitor_id ? (i.monitor_id.name || 'Target Monitor') : (i.monitorName || 'Target Monitor'),
            monitorUrl: typeof i.monitor_id === 'object' && i.monitor_id ? (i.monitor_id.url || '') : (i.monitorUrl || ''),
            userId: typeof i.user_id === 'object' && i.user_id ? (i.user_id._id || i.user_id.id) : (i.user_id || i.userId),
            userName: typeof i.user_id === 'object' && i.user_id ? (i.user_id.fullName || i.user_id.name || 'User') : (i.userName || 'User'),
            userEmail: typeof i.user_id === 'object' && i.user_id ? (i.user_id.email || '') : (i.userEmail || ''),
            startedAt: i.started_at || i.startedAt || i.createdAt,
            resolvedAt: i.resolved_at || i.resolvedAt,
            durationSeconds: i.duration_sec ?? i.duration_seconds ?? i.durationSeconds ?? 0,
            durationText: i.duration_text || (i.duration_sec ? `${Math.round(i.duration_sec / 60)} mins` : 'Ongoing Outage'),
            failureReason: i.root_cause_message || i.failure_reason || i.failureReason || 'Target website failed automated health checks',
            errorCode: i.root_cause_error_code || i.error_code || i.errorCode || 'OUTAGE_DETECTED',
            detectionSource: i.detection_source || i.detectionSource || 'A21_NATIVE_PRIMARY',
            verificationSource: i.verification_source || i.verificationSource,
            status: i.state || i.status || 'OPEN',
            alertsSent: i.alerts_sent || i.alertsSent || { email: 0, sms: 0, whatsapp: 0, inApp: 0 },
            deliveryStatus: i.delivery_status || i.deliveryStatus || 'DELIVERED'
          }));
          this.monitorIncidents.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * POST /api/v1/admin/monitoring/incidents/:id/resend
   */
  async resendIncidentAlert(incidentId: string, channel: string, reason: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const body = { channel: channel, reason: reason.trim() };
    const urls = [
      `https://app.alert21.in/back/api/v1/admin/monitoring/incidents/${incidentId}/resend`,
      `https://app.alert21.in/back/api/admin/monitoring/incidents/${incidentId}/resend`
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, body, { headers }).pipe(catchError(() => of(null)))
        );
        if (res && (res.success || res.data)) {
          this.toastService.showSuccess('Alert Dispatched', `Re-sent alert for incident via ${channel}.`);
          await this.fetchGlobalIncidents();
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  /**
   * GET /api/v1/admin/monitoring/templates
   */
  async fetchMonitoringTemplates() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/templates?limit=1000',
      'https://app.alert21.in/back/api/admin/monitoring/templates?limit=1000'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.templates)
          ? res.data.templates
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.templates) ? res.templates : (Array.isArray(res) ? res : null))));

        if (list && Array.isArray(list)) {
          const mapped: MonitoringTemplate[] = list.map((t: any) => ({
            id: t._id || t.id,
            eventType: t.event_type || t.eventType || 'DOWN',
            channel: t.channel || 'SMS',
            templateCode: t.template_code || t.templateCode || 'MONITOR_DOWN',
            name: t.name,
            body: t.body,
            subject: t.subject,
            dltTemplateId: t.dlt_template_id || t.dltTemplateId,
            metaTemplateName: t.meta_template_name || t.metaTemplateName,
            language: t.language || 'en',
            status: t.status || 'APPROVED',
            variablesCount: t.variables_count ?? t.variablesCount ?? 2,
            variableMapping: t.variable_mapping || t.variableMapping,
            category: t.category || 'Utility',
            updatedAt: t.updatedAt || t.updated_at
          }));
          this.monitoringTemplates.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * POST /api/v1/admin/monitoring/templates
   */
  async saveMonitoringTemplate(template: Partial<MonitoringTemplate>): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const t = template as any;
    const payload: any = {
      event_type: template.eventType || t.event_type || 'DOWN',
      eventType: template.eventType || t.event_type || 'DOWN',
      channel: template.channel || 'SMS',
      template_code: template.templateCode || t.template_code,
      templateCode: template.templateCode || t.template_code,
      name: template.name,
      body: template.body,
      subject: template.subject,
      dlt_template_id: template.dltTemplateId || t.dlt_template_id,
      dltTemplateId: template.dltTemplateId || t.dlt_template_id,
      meta_template_name: template.metaTemplateName || t.meta_template_name,
      metaTemplateName: template.metaTemplateName || t.meta_template_name,
      language: template.language || 'en',
      status: template.status || 'APPROVED',
      variables_count: Number(template.variablesCount ?? t.variables_count ?? 2),
      variablesCount: Number(template.variablesCount ?? t.variables_count ?? 2),
      variable_mapping: template.variableMapping || t.variable_mapping,
      variableMapping: template.variableMapping || t.variable_mapping,
      category: template.category || 'Utility'
    };

    const urls = [
      'https://app.alert21.in/back/api/v1/admin/monitoring/templates',
      'https://app.alert21.in/back/api/admin/monitoring/templates'
    ];

    let lastError = '';
    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, payload, { headers })
        );
        if (res && (res.success || res.data)) {
          await this.fetchMonitoringTemplates();
          this.toastService.showSuccess('Template Saved', 'Monitoring template saved successfully.');
          return true;
        }
      } catch (e: any) {
        lastError = e?.error?.message || e?.message || lastError;
      }
    }
    if (lastError) {
      this.toastService.showError('Template Save Failed', lastError);
    }
    return false;
  }

  // =========================================================
  // TASK #06: EMAIL ALERT SERVICE (AMAZON SES) API METHODS
  // =========================================================

  /**
   * GET /api/admin/email/dashboard
   */
  async fetchEmailDashboardStats() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/email/dashboard',
      'https://app.alert21.in/back/api/admin/email/dashboard'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        if (res && res.success && res.data) {
          const d = res.data;
          const sent = d.total_emails_sent ?? d.totalEmailsSent ?? 0;
          const delivered = d.delivered_emails ?? d.deliveredEmails ?? 0;
          const bounced = d.bounced_emails ?? d.bouncedEmails ?? 0;
          const complaints = d.complaint_count ?? d.complaintCount ?? 0;

          const stats: EmailDashboardStats = {
            totalCreditsDistributed: d.total_credits_distributed ?? d.totalCreditsDistributed ?? 0,
            currentTotalUserBalance: d.current_total_user_balance ?? d.currentTotalUserBalance ?? 0,
            totalEmailsSold: d.total_emails_sold ?? d.totalEmailsSold ?? 0,
            totalEmailsSent: sent,
            deliveredEmails: delivered,
            bouncedEmails: bounced,
            complaintCount: complaints,
            verifiedDomainsCount: d.verified_domains_count ?? d.verifiedDomainsCount ?? 0,
            activeTemplatesCount: d.active_templates_count ?? d.activeTemplatesCount ?? 0,
            totalBillingValue: d.total_billing_value ?? d.totalBillingValue ?? 0,
            gstCollected: d.gst_collected ?? d.gstCollected ?? 0,
            avgSellingPricePerEmail: d.avg_selling_price ?? d.avgSellingPricePerEmail ?? 0.15,
            totalPaymentReceived: d.total_payment_received ?? d.totalPaymentReceived ?? 0,
            deliveryRatePercent: sent > 0 ? Number(((delivered / sent) * 100).toFixed(1)) : 100,
            bounceRatePercent: sent > 0 ? Number(((bounced / sent) * 100).toFixed(2)) : 0,
            complaintRatePercent: sent > 0 ? Number(((complaints / sent) * 100).toFixed(3)) : 0
          };
          this.emailDashboardStats.set(stats);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * GET /api/admin/email/providers
   */
  async fetchEmailProviders() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/email/providers',
      'https://app.alert21.in/back/api/admin/email/providers'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.providers)
          ? res.data.providers
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.providers) ? res.providers : null)));

        if (list && Array.isArray(list)) {
          const mapped: EmailProvider[] = list.map((p: any) => ({
            id: p._id || p.id,
            name: p.name || 'Amazon SES',
            code: p.code || 'AWS_SES',
            region: p.region || 'ap-southeast-2',
            accessKeyId: p.access_key_id || p.accessKeyId || '',
            secretAccessKeyMasked: p.secret_access_key_masked || p.secretAccessKeyMasked || '••••••••••••••••',
            configurationSet: p.configuration_set || p.configurationSet,
            callbackSecret: p.callback_secret || p.callbackSecret,
            callbackUrl: p.callback_url || p.callbackUrl || 'https://app.alert21.in/back/api/v1/email/callback/aws-ses',
            status: p.status || 'ACTIVE',
            isDefault: p.is_default ?? p.isDefault ?? true,
            createdAt: p.createdAt || p.created_at,
            updatedAt: p.updatedAt || p.updated_at
          }));
          this.emailProviders.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * POST /api/admin/email/providers or PUT /api/admin/email/providers/:id
   */
  async saveEmailProvider(provider: Partial<EmailProvider>): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const isEdit = !!provider.id;
    const payload: any = {
      name: provider.name || 'Amazon SES',
      code: provider.code || 'AWS_SES',
      region: provider.region || 'ap-southeast-2',
      access_key_id: provider.accessKeyId,
      configuration_set: provider.configurationSet,
      callback_secret: provider.callbackSecret,
      status: provider.status || 'ACTIVE'
    };
    if (provider.secretAccessKey && provider.secretAccessKey.trim()) {
      payload.secret_access_key = provider.secretAccessKey.trim();
    }

    const base = isEdit 
      ? `https://app.alert21.in/back/api/admin/email/providers/${provider.id}`
      : `https://app.alert21.in/back/api/admin/email/providers`;

    try {
      const res = isEdit
        ? await firstValueFrom(this.http.put<any>(base, payload, { headers }))
        : await firstValueFrom(this.http.post<any>(base, payload, { headers }));

      if (res && (res.success || res.data)) {
        await this.fetchEmailProviders();
        this.toastService.showSuccess('Provider Saved', 'Amazon SES provider configuration saved successfully.');
        return true;
      }
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || 'Failed to save SES provider configuration';
      this.toastService.showError('Provider Error', msg);
    }
    return false;
  }

  /**
   * POST /api/admin/email/providers/:id/test
   */
  async testEmailProviderConnection(providerId: string): Promise<{ success: boolean; message: string; quota?: any }> {
    const headers = this.getAuthHeaders();
    const url = `https://app.alert21.in/back/api/admin/email/providers/${providerId}/test`;
    try {
      const res = await firstValueFrom(this.http.post<any>(url, {}, { headers }));
      if (res && res.success) {
        this.toastService.showSuccess('SES Connection Verified', res.message || 'Amazon SES credentials and region verified successfully.');
        return { success: true, message: res.message || 'Connection verified', quota: res.data?.quota };
      } else {
        const msg = res?.message || 'Failed to connect to Amazon SES.';
        this.toastService.showError('SES Test Failed', msg);
        return { success: false, message: msg };
      }
    } catch (e: any) {
      let rawMsg = e?.error?.message || e?.message || 'SES Connection Test Failed';
      const msgMatch = rawMsg.match(/<Message>([^<]+)<\/Message>/);
      const codeMatch = rawMsg.match(/<Code>([^<]+)<\/Code>/);
      let cleanMsg = msgMatch 
        ? `${msgMatch[1]}${codeMatch ? ` (${codeMatch[1]})` : ''}`
        : rawMsg.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      return { success: false, message: cleanMsg };
    }
  }

  /**
   * GET /api/admin/email/domains
   */
  async fetchEmailDomains() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/email/domains?limit=1000',
      'https://app.alert21.in/back/api/admin/email/domains?limit=1000'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.domains)
          ? res.data.domains
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.domains) ? res.domains : null)));

        if (list && Array.isArray(list)) {
          const mapped: EmailSendingDomain[] = list.map((d: any) => ({
            id: d._id || d.id,
            userId: d.user_id?._id || d.user_id || '',
            userName: d.user_id?.fullName || d.userName || 'User',
            userEmail: d.user_id?.email || d.userEmail || '',
            domain: d.domain,
            status: ((d.verification_status || d.status || 'PENDING_DNS') as any).toUpperCase(),
            dkimTokens: Array.isArray(d.dkim_tokens) ? d.dkim_tokens : (d.dkimTokens || []),
            dnsRecords: Array.isArray(d.dns_records) ? d.dns_records.map((r: any) => ({
              recordType: r.record_type || r.type || 'CNAME',
              name: r.name || r.host,
              value: r.value || r.target,
              status: r.status || 'PENDING'
            })) : [],
            customMailFromDomain: d.custom_mail_from_domain || d.customMailFromDomain,
            customMailFromStatus: d.custom_mail_from_status || d.customMailFromStatus,
            verifiedAt: d.verified_at || d.verifiedAt,
            createdAt: d.createdAt || d.created_at || new Date().toISOString(),
            updatedAt: d.updatedAt || d.updated_at
          }));
          this.emailDomains.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * POST /api/admin/email/domains/:id/verify (Admin Manual Override / Force Approve)
   */
  async approveEmailDomain(domainId: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const url = `https://app.alert21.in/back/api/admin/email/domains/${domainId}/verify`;
    try {
      const res = await firstValueFrom(this.http.post<any>(url, {}, { headers }));
      if (res && res.success) {
        await this.fetchEmailDomains();
        await this.fetchEmailSenders();
        this.toastService.showSuccess('Domain Approved', res.message || 'Domain marked as VERIFIED and active.');
        return true;
      }
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || 'Approval failed';
      this.toastService.showError('Approval Error', msg);
    }
    return false;
  }

  /**
   * POST /api/admin/email/domains/:id/check-verification
   */
  async checkEmailDomainVerification(domainId: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const url = `https://app.alert21.in/back/api/admin/email/domains/${domainId}/check-verification`;
    try {
      const res = await firstValueFrom(this.http.post<any>(url, {}, { headers }));
      if (res && res.success) {
        await this.fetchEmailDomains();
        await this.fetchEmailSenders();
        this.toastService.showSuccess('Verification Synced', res.message || 'Domain status synced with Amazon SES.');
        return true;
      }
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || 'Verification check failed';
      this.toastService.showError('Verification Error', msg);
    }
    return false;
  }

  /**
   * GET /api/admin/email/senders
   */
  async fetchEmailSenders() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/email/senders?limit=1000',
      'https://app.alert21.in/back/api/admin/email/senders?limit=1000'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.senders)
          ? res.data.senders
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.senders) ? res.senders : null)));

        if (list && Array.isArray(list)) {
          const mapped: EmailSender[] = list.map((s: any) => ({
            id: s._id || s.id,
            userId: s.user_id?._id || s.user_id || '',
            userName: s.user_id?.fullName || s.userName || 'User',
            userEmail: s.user_id?.email || s.userEmail || '',
            domainId: s.domain_id?._id || s.domain_id || '',
            domainName: s.domain_id?.domain || s.domainName || '',
            fromName: s.from_name || s.fromName || '',
            fromEmail: s.from_email || s.fromEmail || '',
            replyToEmail: s.reply_to_email || s.replyToEmail,
            status: s.status || 'ACTIVE',
            createdAt: s.createdAt || s.created_at || new Date().toISOString()
          }));
          this.emailSenders.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * GET /api/admin/email/templates
   */
  async fetchEmailTemplates() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/email/templates?limit=1000',
      'https://app.alert21.in/back/api/admin/email/templates?limit=1000'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.templates)
          ? res.data.templates
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.templates) ? res.templates : null)));

        if (list && Array.isArray(list)) {
          const mapped: EmailTemplate[] = list.map((t: any) => ({
            id: t._id || t.id,
            userId: t.user_id?._id || t.user_id || '',
            userName: t.user_id?.fullName || t.userName || 'User',
            userEmail: t.user_id?.email || t.userEmail || '',
            name: t.name,
            subject: t.subject,
            htmlBody: t.html_body || t.htmlBody || '',
            plainTextBody: t.plain_text_body || t.plainTextBody,
            variables: Array.isArray(t.variables) ? t.variables : [],
            status: t.status || 'ACTIVE',
            createdAt: t.createdAt || t.created_at || new Date().toISOString(),
            updatedAt: t.updatedAt || t.updated_at
          }));
          this.emailTemplates.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * GET /api/admin/email/logs
   */
  async fetchEmailTransactions() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/email/logs?limit=500',
      'https://app.alert21.in/back/api/admin/email/logs?limit=500'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.transactions)
          ? res.data.transactions
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.items) ? res.items : null)));

        if (list && Array.isArray(list)) {
          const mapped: EmailTransaction[] = list.map((tx: any) => ({
            id: tx._id || tx.id,
            transactionId: tx.transaction_id || tx.transactionId || tx._id,
            userId: tx.user_id?._id || tx.user_id || '',
            userName: tx.user_id?.fullName || tx.userName || 'User',
            userEmail: tx.user_id?.email || tx.userEmail || '',
            providerId: tx.provider_id || '',
            providerName: tx.provider_name || 'Amazon SES',
            providerMessageId: tx.provider_message_id || tx.providerMessageId,
            domainId: tx.domain_id || '',
            domainName: tx.domain_name || '',
            senderId: tx.sender_id || '',
            fromEmail: tx.from_email || tx.fromEmail || '',
            fromName: tx.from_name || tx.fromName || '',
            toEmail: tx.to_email || tx.toEmail || '',
            subject: tx.subject || '',
            renderedHtml: tx.rendered_html || tx.renderedHtml,
            renderedText: tx.rendered_text || tx.renderedText,
            status: tx.status || 'SUBMITTED',
            providerStatus: tx.provider_status || tx.providerStatus,
            providerResponse: tx.provider_response || tx.providerResponse,
            errorCode: tx.error_code || tx.errorCode,
            errorMessage: tx.error_message || tx.errorMessage,
            bounceType: tx.bounce_type || tx.bounceType,
            bounceSubType: tx.bounce_sub_type || tx.bounceSubType,
            complaintFeedbackType: tx.complaint_feedback_type || tx.complaintFeedbackType,
            createdAt: tx.createdAt || tx.created_at || new Date().toISOString(),
            submittedAt: tx.submitted_at || tx.submittedAt,
            deliveredAt: tx.delivered_at || tx.deliveredAt,
            bouncedAt: tx.bounced_at || tx.bouncedAt,
            complainedAt: tx.complained_at || tx.complainedAt
          }));
          this.emailTransactions.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * GET /api/admin/email/pricing-slabs
   */
  async fetchEmailPricingSlabs() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/v1/admin/email/pricing-slabs',
      'https://app.alert21.in/back/api/admin/email/pricing-slabs'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data?.slabs)
          ? res.data.slabs
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data)
                  ? res.data
                  : (Array.isArray(res?.slabs) ? res.slabs : null)));

        if (list && Array.isArray(list)) {
          const mapped: EmailPricingSlab[] = list.map((s: any) => ({
            id: s._id || s.id,
            name: s.name || 'Tier',
            minQuantity: s.min_quantity ?? s.minQuantity ?? 1000,
            maxQuantity: s.max_quantity ?? s.maxQuantity ?? 10000,
            ratePerEmail: s.rate_per_email ?? s.ratePerEmail ?? 0.15,
            gstPercent: s.gst_percent ?? s.gstPercent ?? 18,
            isActive: s.is_active ?? s.isActive ?? true,
            description: s.description,
            createdAt: s.createdAt || s.created_at
          }));
          this.emailPricingSlabs.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * POST /api/admin/email/pricing-slabs
   */
  async saveEmailPricingSlab(slab: Partial<EmailPricingSlab>): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const isEdit = !!slab.id;
    const payload = {
      name: slab.name,
      min_quantity: Number(slab.minQuantity),
      max_quantity: Number(slab.maxQuantity),
      rate_per_email: Number(slab.ratePerEmail),
      gst_percent: Number(slab.gstPercent ?? 18),
      is_active: slab.isActive ?? true,
      description: slab.description
    };

    const url = isEdit
      ? `https://app.alert21.in/back/api/admin/email/pricing-slabs/${slab.id}`
      : `https://app.alert21.in/back/api/admin/email/pricing-slabs`;

    try {
      const res = isEdit
        ? await firstValueFrom(this.http.put<any>(url, payload, { headers }))
        : await firstValueFrom(this.http.post<any>(url, payload, { headers }));

      if (res && (res.success || res.data)) {
        await this.fetchEmailPricingSlabs();
        this.toastService.showSuccess('Slab Saved', 'Email pricing slab saved successfully.');
        return true;
      }
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || 'Failed to save email pricing slab';
      this.toastService.showError('Slab Error', msg);
    }
    return false;
  }

  /**
   * DELETE /api/admin/email/pricing-slabs/:id
   */
  async deleteEmailPricingSlab(id: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const url = `https://app.alert21.in/back/api/admin/email/pricing-slabs/${id}`;
    try {
      const res = await firstValueFrom(this.http.delete<any>(url, { headers }));
      if (res && res.success) {
        await this.fetchEmailPricingSlabs();
        this.toastService.showSuccess('Slab Deleted', 'Email pricing slab removed successfully.');
        return true;
      }
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || 'Failed to delete slab';
      this.toastService.showError('Delete Error', msg);
    }
    return false;
  }

  /**
   * POST /api/admin/users/:userId/email-credit or email-debit
   */
  async adjustUserEmailBalance(userId: string, type: 'CREDIT' | 'DEBIT', amount: number, remarks: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const endpoint = type === 'CREDIT' ? 'email-credit' : 'email-debit';
    const url = `https://app.alert21.in/back/api/admin/users/${userId}/${endpoint}`;
    const payload = {
      amount: Number(amount),
      remarks: remarks.trim()
    };

    try {
      const res = await firstValueFrom(this.http.post<any>(url, payload, { headers }));
      if (res && res.success) {
        await this.fetchLiveUsers();
        this.toastService.showSuccess('Email Balance Updated', `Successfully ${type.toLowerCase()}ed ${amount} email credits.`);
        return true;
      }
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || `Failed to ${type.toLowerCase()} email balance`;
      this.toastService.showError('Adjustment Failed', msg);
    }
    return false;
  }

  /**
   * GET /api/admin/email/bank-transfers
   */
  async fetchEmailBankTransfers() {
    const headers = this.getAuthHeaders();
    const urls = [
      'https://app.alert21.in/back/api/admin/email/bank-transfers',
      'https://app.alert21.in/back/api/v1/admin/email/bank-transfers'
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.get<any>(url, { headers }).pipe(catchError(() => of(null)))
        );
        const list = Array.isArray(res?.data)
          ? res.data
          : (Array.isArray(res?.data?.items)
              ? res.data.items
              : (Array.isArray(res?.data?.orders)
                  ? res.data.orders
                  : (Array.isArray(res?.orders) ? res.orders : null)));

        if (list && Array.isArray(list)) {
          const mapped = list.map((ord: any) => ({
            id: ord._id || ord.id,
            orderNumber: ord.order_number || ord.orderNumber || ord._id,
            userId: ord.user_id?._id || ord.user_id || '',
            userName: ord.user_id?.fullName || ord.userName || 'User',
            userEmail: ord.user_id?.email || ord.userEmail || '',
            companyName: ord.user_id?.companyName || ord.companyName || '',
            emailQuantity: ord.email_quantity || ord.emailQuantity || 0,
            ratePerEmail: ord.rate_per_email || ord.ratePerEmail || 0.15,
            baseAmount: ord.base_amount ?? ord.baseAmount ?? 0,
            gstRate: ord.gst_rate ?? ord.gstRate ?? 18,
            gstAmount: ord.gst_amount ?? ord.gstAmount ?? 0,
            totalPayable: ord.total_payable ?? ord.totalPayable ?? 0,
            paymentMethod: ord.payment_method || 'BANK_TRANSFER',
            paymentStatus: ord.payment_status || 'PENDING',
            utrNumber: ord.bank_transfer_details?.utr_number || ord.utr_number || ord.utrNumber || 'N/A',
            paymentProof: ord.bank_transfer_details?.payment_proof || ord.payment_proof || ord.paymentProof || null,
            adminStatus: ord.bank_transfer_details?.admin_status || ord.admin_status || 'PENDING',
            adminRemarks: ord.bank_transfer_details?.admin_remarks || ord.admin_remarks || '',
            createdAt: ord.createdAt || ord.created_at || new Date().toISOString()
          }));
          this.emailBankTransfers.set(mapped);
          break;
        }
      } catch (e) {}
    }
  }

  /**
   * POST /api/admin/email/bank-transfers/:id/approve
   */
  async approveEmailBankTransfer(id: string, remarks: string = 'Approved by Admin'): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const urls = [
      `https://app.alert21.in/back/api/admin/email/bank-transfers/${id}/approve`,
      `https://app.alert21.in/back/api/v1/admin/email/bank-transfers/${id}/approve`
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, { remarks }, { headers })
        );
        if (res && (res.success || res.data)) {
          await this.fetchEmailBankTransfers();
          await this.fetchLiveUsers();
          this.toastService.showSuccess('Order Approved', res.message || 'Email bank transfer approved and credits added.');
          return true;
        }
      } catch (e: any) {
        const msg = e?.error?.message || e?.message || 'Approval failed';
        this.toastService.showError('Approval Error', msg);
        return false;
      }
    }
    return false;
  }

  /**
   * POST /api/admin/email/bank-transfers/:id/reject
   */
  async rejectEmailBankTransfer(id: string, reason: string): Promise<boolean> {
    const headers = this.getAuthHeaders();
    const urls = [
      `https://app.alert21.in/back/api/admin/email/bank-transfers/${id}/reject`,
      `https://app.alert21.in/back/api/v1/admin/email/bank-transfers/${id}/reject`
    ];

    for (const url of urls) {
      try {
        const res = await firstValueFrom(
          this.http.post<any>(url, { reason }, { headers })
        );
        if (res && (res.success || res.data)) {
          await this.fetchEmailBankTransfers();
          this.toastService.showSuccess('Order Rejected', res.message || 'Email bank transfer marked as rejected.');
          return true;
        }
      } catch (e: any) {
        const msg = e?.error?.message || e?.message || 'Rejection failed';
        this.toastService.showError('Rejection Error', msg);
        return false;
      }
    }
    return false;
  }
}