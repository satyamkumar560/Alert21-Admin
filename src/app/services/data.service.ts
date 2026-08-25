import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  AlertUser, 
  PrincipalEntity, 
  SenderIdHeader, 
  ContentTemplate, 
  SmsProvider, 
  ProviderRequestLog, 
  AdminAuditLog,
  UserStatus,
  DltStatus
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
      const pe = live.principalEntities || {};
      const snd = live.senderIds || {};
      const tpl = live.templates || {};
      const prv = live.smsProviders || {};
      const sms = live.smsMetrics || {};

      return {
        users: {
          total: u.total ?? allUsers.length,
          active: u.active ?? allUsers.filter(user => user.status === 'ACTIVE').length,
          suspended: u.suspended ?? allUsers.filter(user => user.status === 'SUSPENDED').length,
          blocked: u.blocked ?? allUsers.filter(user => user.status === 'BLOCKED').length
        },
        principalEntities: {
          pending: pe.pending ?? allPE.filter(e => e.status === 'PENDING').length,
          active: pe.active ?? allPE.filter(e => e.status === 'ACTIVE').length,
          total: pe.total ?? allPE.length
        },
        senderIds: {
          pending: snd.pending ?? allSenders.filter(s => s.status === 'PENDING').length,
          active: snd.active ?? allSenders.filter(s => s.status === 'ACTIVE').length,
          total: snd.total ?? allSenders.length
        },
        templates: {
          pending: tpl.pending ?? allTemplates.filter(t => t.status === 'PENDING').length,
          active: tpl.active ?? allTemplates.filter(t => t.status === 'ACTIVE').length,
          total: tpl.total ?? allTemplates.length
        },
        smsProviders: {
          total: prv.total ?? allProviders.length,
          active: prv.active ?? allProviders.filter(p => p.status === 'ACTIVE').length,
          globalDefault: prv.globalDefault || allProviders.find(p => p.isGlobalDefault) || allProviders[0] || null
        },
        smsMetrics: {
          totalSent: sms.totalSent ?? 0,
          delivered: sms.delivered ?? 0,
          failed: sms.failed ?? 0,
          pending: sms.pending ?? 0
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
}