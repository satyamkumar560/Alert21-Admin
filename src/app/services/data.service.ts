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
  BillingDashboardStats
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

  constructor() {
    this.fetchLiveDashboardStats();
    this.fetchLiveUsers();
    this.fetchLivePrincipalEntities();
    this.fetchLiveSenderIds();
    this.fetchLiveTemplates();
    this.fetchLiveSmsProviders();
    this.fetchLivePricingSlabs();
    this.fetchLiveBankTransfers();
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
        this.http.get<any>('https://app.alert21.in/back/api/admin/dlt/sender-ids', { headers })
      );

      if (response && response.success && Array.isArray(response.data)) {
        const mappedSenders: SenderIdHeader[] = response.data.map((item: any) => ({
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
        this.http.get<any>('https://app.alert21.in/back/api/admin/dlt/templates', { headers })
      );

      if (response && response.success && Array.isArray(response.data)) {
        const mappedTemplates: ContentTemplate[] = response.data.map((item: any) => ({
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
        this.http.get<any>('https://app.alert21.in/back/api/admin/dlt/principal-entities', { headers })
      );

      if (response && response.success && Array.isArray(response.data)) {
        const mappedPEs: PrincipalEntity[] = response.data.map((item: any) => ({
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
        this.http.get<any>('https://app.alert21.in/back/api/admin/users', { headers })
      );

      if (response && response.success && response.data && Array.isArray(response.data.items)) {
        const mappedUsers: AlertUser[] = response.data.items.map((item: any) => ({
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
        this.http.get<any>('https://app.alert21.in/back/api/admin/sms-logs', { headers })
      );

      if (response && response.success && Array.isArray(response.data)) {
        const mappedLogs: ProviderRequestLog[] = response.data.map((item: any) => ({
          id: item._id,
          transactionId: item.transaction_id || item._id,
          userId: item.user_id?._id || '',
          userName: item.user_id?.fullName || 'User',
          providerId: item.provider_id || '',
          providerName: item.provider_name || 'MSG24',
          peId: item.principal_entity_id || '',
          senderHeader: item.sender_id || '',
          templateId: item.template_id || '',
          dltTelemarketerIdSha256: item.telemarketer_id_hash || '',
          recipientMobileMasked: item.recipient_masked || item.recipient || 'XXXXXX0000',
          messageContentHash: item.message_hash || '',
          requestUrlMasked: item.request_url || '',
          httpStatus: item.http_status || 200,
          latencyMs: item.latency_ms || 0,
          normalizedStatus: item.status || 'SUCCESS',
          rawProviderResponse: item.provider_response || '',
          timestamp: item.created_at || new Date().toISOString()
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
        this.http.get<any>('https://app.alert21.in/back/api/admin/billing/bank-transfers', { headers })
      );

      if (response && response.success && Array.isArray(response.data)) {
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

        const mappedTransfers: BankTransferRequest[] = response.data.map((item: any) => {
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

      const body = { order_id: orderId || id, orderId: orderId || id, id: id };
      const response = await firstValueFrom(
        this.http.post<any>(`https://app.alert21.in/back/api/admin/billing/bank-transfers/${id}/approve`, body, { headers })
      );

      if (response && response.success) {
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

      const body = { remarks: remarks.trim(), order_id: orderId || id, orderId: orderId || id, id: id };
      const response = await firstValueFrom(
        this.http.post<any>(`https://app.alert21.in/back/api/admin/billing/bank-transfers/${id}/reject`, body, { headers })
      );

      if (response && response.success) {
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
}