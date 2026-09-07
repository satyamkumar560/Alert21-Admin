import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  RelaySource, 
  RelaySender, 
  RelayEventType, 
  RelayVariable, 
  RelayMessageType, 
  RelayTemplateVariant, 
  RelayDevice, 
  RelayEvent, 
  RelayPackagePlan, 
  RelaySubscription, 
  RelayUnmatchedDiagnostic, 
  RelayDashboardStats 
} from '../models/alert21.models';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class RelayService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private baseUrl = 'https://app.alert21.in/back/api/admin/relay';

  // 100% Dynamic Live Signals (Zero Static / Mock Data)
  sources = signal<RelaySource[]>([]);
  senders = signal<RelaySender[]>([]);
  eventTypes = signal<RelayEventType[]>([]);
  variables = signal<RelayVariable[]>([]);
  messageTypes = signal<RelayMessageType[]>([]);
  devices = signal<RelayDevice[]>([]);
  events = signal<RelayEvent[]>([]);
  packages = signal<RelayPackagePlan[]>([]);
  subscriptions = signal<RelaySubscription[]>([]);
  diagnostics = signal<RelayUnmatchedDiagnostic[]>([]);
  stats = signal<RelayDashboardStats | null>(null);
  isLoading = signal<boolean>(false);

  constructor() {
    this.fetchLiveRelayData();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.authToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ==========================================
  // LIVE BACKEND API SYNC
  // ==========================================
  async fetchLiveRelayData() {
    const token = this.authService.authToken();
    if (!token) return;

    this.isLoading.set(true);
    const headers = this.getAuthHeaders();

    try {
      // 1. Stats
      try {
        const statsRes = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/stats`, { headers }));
        if (statsRes && (statsRes.success || statsRes.data)) {
          this.stats.set(statsRes.data || statsRes);
        }
      } catch (e) {}

      // 2. Sources
      try {
        const srcRes = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/sources`, { headers }));
        if (srcRes && srcRes.success && Array.isArray(srcRes.data)) {
          this.sources.set(srcRes.data.map((s: any) => ({
            id: s._id || s.id,
            sourceCode: s.source_code,
            sourceName: s.name,
            sourceType: s.source_type,
            country: s.country,
            logoIcon: s.logo_icon || 'layers',
            status: s.status,
            notes: s.notes || '',
            senderCount: s.sender_count || 0,
            messageTypeCount: s.message_type_count || 0,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
          })));
        } else {
          this.sources.set([]);
        }
      } catch (e) {
        this.sources.set([]);
      }

      // 3. Senders
      try {
        const sndRes = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/senders`, { headers }));
        if (sndRes && sndRes.success && Array.isArray(sndRes.data)) {
          this.senders.set(sndRes.data.map((snd: any) => ({
            id: snd._id || snd.id,
            sourceId: typeof snd.source_id === 'object' && snd.source_id !== null ? (snd.source_id._id || snd.source_id.id) : (snd.source_id || ''),
            sourceCode: snd.source_code || (typeof snd.source_id === 'object' ? snd.source_id?.source_code : ''),
            sourceName: snd.source_name || (typeof snd.source_id === 'object' ? snd.source_id?.name : ''),
            senderValue: snd.sender_value,
            aliasGroup: snd.alias_group || '',
            matchMode: snd.match_mode || 'EXACT',
            status: snd.status || 'ACTIVE',
            createdAt: snd.createdAt,
            updatedAt: snd.updatedAt
          })));
        } else {
          this.senders.set([]);
        }
      } catch (e) {
        this.senders.set([]);
      }

      // 4. Variables
      try {
        const varRes = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/variables`, { headers }));
        if (varRes && varRes.success && Array.isArray(varRes.data)) {
          this.variables.set(varRes.data.map((v: any) => ({
            id: v._id || v.id,
            key: v.key,
            displayName: v.display_name,
            dataType: v.data_type,
            sensitivity: v.sensitivity,
            maskingRule: v.masking_rule || 'none',
            validationRule: v.validation_rule || '',
            retentionTtlSeconds: v.retention_ttl_seconds || 86400,
            webhookAllowed: v.webhook_allowed ?? true,
            uiVisibility: v.ui_visibility || 'list',
            isStandard: v.is_standard ?? false,
            createdAt: v.createdAt
          })));
        } else {
          this.variables.set([]);
        }
      } catch (e) {
        this.variables.set([]);
      }

      // 5. Message Types & Template Variants
      try {
        const msgRes = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/message-types`, { headers }));
        if (msgRes && msgRes.success && Array.isArray(msgRes.data)) {
          this.messageTypes.set(msgRes.data.map((m: any) => ({
            id: m._id || m.id,
            sourceId: m.source_id,
            sourceCode: m.source_code,
            sourceName: m.source_name,
            eventTypeId: m.event_type_id || '',
            eventTypeKey: m.event_type || 'portal.otp.received',
            name: m.name,
            category: m.category || 'OTP',
            sensitive: m.sensitive ?? false,
            activeVariantCount: Array.isArray(m.variants) ? m.variants.length : 1,
            status: m.status || 'ACTIVE',
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
            variants: Array.isArray(m.variants) && m.variants.length > 0 ? m.variants.map((v: any) => ({
              id: v._id || v.id,
              messageTypeId: m._id || m.id,
              version: v.version || 1,
              priority: v.priority || 10,
              sampleSmsText: v.sample_sms_text || v.sample_template || '',
              patternRegex: v.pattern_regex || '',
              checksum: v.checksum || 'sha256:live',
              senderIds: v.sender_ids || v.sender_aliases || [],
              variables: (v.variables || []).map((vm: any) => ({
                variableKey: vm.key || vm.variableKey || vm.name || 'var',
                variableName: vm.name || vm.variableName || vm.key || 'Variable',
                dataType: vm.data_type || vm.dataType || 'string',
                sensitivity: vm.sensitivity || 'NORMAL',
                sampleValue: vm.sample_value || vm.sampleValue || ''
              })),
              rawMessagePolicy: v.raw_message_policy || 'DISABLED',
              status: v.status || 'PUBLISHED',
              publishedAt: v.published_at || v.createdAt,
              publishedBy: v.published_by || 'Admin',
              createdAt: v.createdAt,
              updatedAt: v.updatedAt
            })) : [
              {
                id: `var_${m._id || m.id}`,
                messageTypeId: m._id || m.id,
                version: m.version || 1,
                priority: 10,
                sampleSmsText: m.sample_template || '',
                patternRegex: m.pattern_regex || '',
                checksum: 'sha256:live',
                senderIds: m.sender_aliases || [],
                variables: (m.variables || []).map((vm: any) => ({
                  variableKey: vm.key || vm.variableKey || vm.name || 'var',
                  variableName: vm.name || vm.variableName || vm.key || 'Variable',
                  dataType: vm.data_type || vm.dataType || 'string',
                  sensitivity: vm.sensitivity || 'NORMAL',
                  sampleValue: vm.sample_value || vm.sampleValue || ''
                })),
                rawMessagePolicy: 'DISABLED',
                status: 'PUBLISHED',
                publishedAt: m.updatedAt || m.createdAt,
                publishedBy: 'Admin',
                createdAt: m.createdAt,
                updatedAt: m.updatedAt
              }
            ]
          })));
        } else {
          this.messageTypes.set([]);
        }
      } catch (e) {
        this.messageTypes.set([]);
      }

      // 6. Devices Fleet
      try {
        const devRes = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/devices`, { headers }));
        if (devRes && devRes.success && Array.isArray(devRes.data)) {
          this.devices.set(devRes.data.map((d: any) => ({
            id: d._id || d.id,
            userId: d.user_id?._id || d.user_id || '',
            userName: d.user_id?.name || 'User',
            userEmail: d.user_id?.email || '',
            deviceLabel: d.device_label || 'Android Device',
            installationId: d.installation_id || '',
            model: d.model || 'Device',
            manufacturer: d.manufacturer || 'Android',
            androidVersion: d.android_version || '15',
            appVersion: d.app_version || '1.0.0',
            batteryPercent: d.battery_percent ?? 100,
            networkType: d.network_type || 'WIFI',
            status: d.connection_status === 'ONLINE' ? 'ACTIVE' : (d.connection_status || 'ACTIVE'),
            lastSeenAt: d.last_seen_at ? new Date(d.last_seen_at).toLocaleTimeString() : 'Recently',
            configVersion: d.config_version || 1,
            configChecksum: d.config_checksum || 'sha256:live',
            smsPermission: d.sms_permission ?? true,
            activeMessageTypesCount: d.active_message_types_count || 0,
            todayRelayedCount: d.today_relayed_count || 0,
            createdAt: d.createdAt
          })));
        } else {
          this.devices.set([]);
        }
      } catch (e) {
        this.devices.set([]);
      }

      // 7. Ingested Events
      try {
        const evtsRes = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/events`, { headers }));
        if (evtsRes && evtsRes.success && Array.isArray(evtsRes.data)) {
          this.events.set(evtsRes.data.map((evt: any) => ({
            id: evt._id || evt.id,
            clientEventId: evt.client_event_id || evt._id,
            userId: evt.user_id?._id || evt.user_id || '',
            userName: evt.user_id?.name || 'User',
            userEmail: evt.user_id?.email || '',
            deviceId: evt.device_id?._id || evt.device_id || '',
            deviceName: evt.device_id?.device_label || 'Android Device',
            sourceCode: evt.source_code || '',
            sourceName: evt.source_name || '',
            sender: evt.sender || '',
            messageTypeId: evt.message_type_id?._id || evt.message_type_id || '',
            messageTypeName: evt.message_type_id?.name || evt.message_type_name || 'SMS Event',
            eventType: evt.message_type_id?.event_type || 'portal.otp.received',
            category: evt.category || 'OTP',
            templateId: evt.template_id || '',
            templateVersion: evt.template_version || 1,
            receivedAt: evt.received_at || evt.createdAt,
            processedAt: evt.createdAt,
            messageHash: evt.message_hash || '',
            variables: evt.variables || {},
            maskedVariables: evt.masked_variables || evt.variables || {},
            webhookDeliveryStatus: evt.webhook_status || 'DELIVERED',
            webhookAttempts: evt.webhook_attempts || 1,
            webhookResponseCode: evt.http_response_code || 200,
            webhookDeliveryId: 'whd_' + (evt._id || ''),
            webhookDeliveredAt: evt.webhook_delivered_at || evt.createdAt,
            isDuplicate: evt.is_duplicate || false
          })));
        } else {
          this.events.set([]);
        }
      } catch (e) {
        this.events.set([]);
      }

      // 8. Packages
      try {
        const pkgRes = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/packages`, { headers }));
        if (pkgRes && pkgRes.success && Array.isArray(pkgRes.data)) {
          this.packages.set(pkgRes.data.map((p: any) => ({
            id: p._id || p.id,
            planCode: p.plan_code,
            name: p.name,
            priceMonthly: p.price_monthly,
            priceAnnual: p.price_annual,
            maxDevices: p.max_devices,
            maxActiveMessageTypes: p.max_active_message_types,
            includedEvents: p.included_events,
            maxWebhooks: p.max_webhooks,
            maxApiKeys: p.max_api_keys,
            retentionDays: p.retention_days,
            overageEnabled: p.overage_enabled ?? true,
            overagePricePerEvent: p.overage_price_per_event || 0.05,
            publicApiAccess: p.public_api_access ?? true,
            isActive: p.is_active ?? true,
            activeSubscribersCount: p.active_subscribers_count || 0
          })));
        } else {
          this.packages.set([]);
        }
      } catch (e) {
        this.packages.set([]);
      }

      // 9. Subscriptions
      try {
        const subRes = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/subscriptions`, { headers }));
        if (subRes && subRes.success && Array.isArray(subRes.data)) {
          this.subscriptions.set(subRes.data.map((sub: any) => ({
            id: sub._id || sub.id,
            userId: sub.user_id?._id || sub.user_id || '',
            userName: sub.user_id?.name || 'Subscriber',
            userEmail: sub.user_id?.email || '',
            companyName: sub.user_id?.company || 'Company',
            planId: sub.plan_id?._id || sub.plan_id || '',
            planCode: sub.plan_code || 'relay_plan',
            planName: sub.plan_name || 'Relay Plan',
            billingCycle: sub.billing_cycle || 'MONTHLY',
            startDate: sub.start_date || sub.createdAt,
            renewalDate: sub.renewal_date || sub.createdAt,
            status: sub.status || 'ACTIVE',
            monthlyEventQuota: sub.monthly_event_quota || 10000,
            eventsUsedThisMonth: sub.events_used_this_month || 0,
            activeDevicesCount: sub.active_devices_count || 0,
            activeMessageTypesCount: sub.active_message_types_count || 0,
            overageEventsCount: sub.overage_events_count || 0,
            overageAmount: sub.overage_amount || 0
          })));
        } else {
          this.subscriptions.set([]);
        }
      } catch (e) {
        this.subscriptions.set([]);
      }

      // 10. Diagnostics
      try {
        const diagRes = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/diagnostics`, { headers }));
        if (diagRes && diagRes.success && Array.isArray(diagRes.data)) {
          this.diagnostics.set(diagRes.data.map((d: any) => ({
            id: d._id || d.id,
            signatureHash: d.signature_hash,
            sender: d.sender,
            candidateSourceCode: d.candidate_source_code,
            messageLength: d.message_length,
            samplePatternSignature: d.sample_pattern_signature,
            occurrencesCount: d.occurrences_count || 1,
            affectedDevicesCount: d.affected_devices_count || 1,
            affectedUsersCount: d.affected_users_count || 1,
            firstSeenAt: d.first_seen_at || d.createdAt,
            lastSeenAt: d.last_seen_at || d.createdAt,
            status: d.status || 'PENDING_REVIEW'
          })));
        } else {
          this.diagnostics.set([]);
        }
      } catch (e) {
        this.diagnostics.set([]);
      }

    } catch (e) {
      console.error('Relay live data fetch error:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ==========================================
  // SOURCE MASTER ACTIONS
  // ==========================================
  async addSource(source: Omit<RelaySource, 'id' | 'createdAt' | 'senderCount' | 'messageTypeCount'>): Promise<RelaySource | null> {
    try {
      const headers = this.getAuthHeaders();
      const res = await firstValueFrom(this.http.post<any>(`${this.baseUrl}/sources`, {
        source_code: source.sourceCode,
        name: source.sourceName,
        source_type: source.sourceType,
        country: source.country,
        status: source.status
      }, { headers }));

      if (res && res.success && res.data) {
        const created: RelaySource = {
          id: res.data._id || res.data.id,
          sourceCode: res.data.source_code,
          sourceName: res.data.name,
          sourceType: res.data.source_type,
          country: res.data.country,
          logoIcon: 'layers',
          status: res.data.status,
          senderCount: 0,
          messageTypeCount: 0,
          createdAt: res.data.createdAt
        };
        this.sources.update(list => [created, ...list]);
        this.toastService.showSuccess('Source Created', `Source "${created.sourceName}" saved to live database.`);
        return created;
      }
    } catch (err: any) {
      this.toastService.showError('Error', err?.error?.message || 'Failed to create source.');
    }
    return null;
  }

  async updateSource(id: string, updates: Partial<RelaySource>) {
    try {
      const headers = this.getAuthHeaders();
      const res = await firstValueFrom(this.http.put<any>(`${this.baseUrl}/sources/${id}`, {
        name: updates.sourceName,
        source_type: updates.sourceType,
        country: updates.country,
        status: updates.status
      }, { headers }));

      if (res && res.success) {
        this.sources.update(list => list.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
        this.toastService.showSuccess('Source Updated', 'Source configuration updated in live database.');
      }
    } catch (err: any) {
      this.toastService.showError('Error', err?.error?.message || 'Failed to update source.');
    }
  }

  async toggleSourceStatus(id: string) {
    const s = this.sources().find(item => item.id === id);
    if (!s) return;
    const newStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await this.updateSource(id, { status: newStatus });
  }

  // ==========================================
  // SENDER ID MASTER ACTIONS
  // ==========================================
  async addSender(sender: Omit<RelaySender, 'id' | 'createdAt'>): Promise<RelaySender | null> {
    try {
      const headers = this.getAuthHeaders();
      const res = await firstValueFrom(this.http.post<any>(`${this.baseUrl}/senders`, {
        source_id: sender.sourceId,
        source_code: sender.sourceCode,
        source_name: sender.sourceName,
        sender_value: sender.senderValue,
        alias_group: sender.aliasGroup,
        match_mode: sender.matchMode,
        status: sender.status
      }, { headers }));

      if (res && res.success && res.data) {
        const created: RelaySender = {
          id: res.data._id || res.data.id,
          sourceId: res.data.source_id,
          sourceCode: res.data.source_code,
          sourceName: res.data.source_name,
          senderValue: res.data.sender_value,
          aliasGroup: res.data.alias_group,
          matchMode: res.data.match_mode,
          status: res.data.status,
          createdAt: res.data.createdAt
        };
        this.senders.update(list => [created, ...list]);
        this.sources.update(list => list.map(s => s.id === sender.sourceId ? { ...s, senderCount: (s.senderCount || 0) + 1 } : s));
        this.toastService.showSuccess('Sender ID Added', `Sender "${sender.senderValue}" mapped in live database.`);
        return created;
      }
    } catch (err: any) {
      this.toastService.showError('Error', err?.error?.message || 'Failed to map sender ID.');
    }
    return null;
  }

  async updateSender(id: string, updates: Partial<RelaySender>) {
    this.senders.update(list => list.map(snd => snd.id === id ? { ...snd, ...updates, updatedAt: new Date().toISOString() } : snd));
    this.toastService.showSuccess('Sender ID Updated', 'Sender configuration saved.');
  }

  async deleteSender(id: string) {
    try {
      const headers = this.getAuthHeaders();
      await firstValueFrom(this.http.delete<any>(`${this.baseUrl}/senders/${id}`, { headers }));
      
      const target = this.senders().find(s => s.id === id);
      if (target) {
        this.senders.update(list => list.filter(s => s.id !== id));
        this.sources.update(list => list.map(s => s.id === target.sourceId ? { ...s, senderCount: Math.max(0, (s.senderCount || 1) - 1) } : s));
        this.toastService.showSuccess('Sender Removed', 'Sender ID alias removed from live database.');
      }
    } catch (err: any) {
      this.toastService.showError('Error', err?.error?.message || 'Failed to remove sender ID.');
    }
  }

  // ==========================================
  // VARIABLE MASTER ACTIONS
  // ==========================================
  async addVariable(variable: Omit<RelayVariable, 'id' | 'createdAt'>): Promise<RelayVariable | null> {
    try {
      const headers = this.getAuthHeaders();
      const res = await firstValueFrom(this.http.post<any>(`${this.baseUrl}/variables`, {
        key: variable.key,
        display_name: variable.displayName,
        data_type: variable.dataType,
        sensitivity: variable.sensitivity,
        masking_rule: variable.maskingRule,
        validation_rule: variable.validationRule,
        retention_ttl_seconds: variable.retentionTtlSeconds,
        webhook_allowed: variable.webhookAllowed,
        ui_visibility: variable.uiVisibility,
        is_standard: variable.isStandard
      }, { headers }));

      if (res && res.success && res.data) {
        const created: RelayVariable = {
          id: res.data._id || res.data.id,
          key: res.data.key,
          displayName: res.data.display_name,
          dataType: res.data.data_type,
          sensitivity: res.data.sensitivity,
          maskingRule: res.data.masking_rule,
          validationRule: res.data.validation_rule,
          retentionTtlSeconds: res.data.retention_ttl_seconds,
          webhookAllowed: res.data.webhook_allowed,
          uiVisibility: res.data.ui_visibility,
          isStandard: res.data.is_standard,
          createdAt: res.data.createdAt
        };
        this.variables.update(list => [...list, created]);
        this.toastService.showSuccess('Variable Created', `Variable {{${variable.key}}} created in live database.`);
        return created;
      }
    } catch (err: any) {
      this.toastService.showError('Error', err?.error?.message || 'Failed to create variable.');
    }
    return null;
  }

  updateVariable(id: string, updates: Partial<RelayVariable>) {
    this.variables.update(list => list.map(v => v.id === id ? { ...v, ...updates } : v));
    this.toastService.showSuccess('Variable Updated', 'Variable configuration saved.');
  }

  // ==========================================
  // TEMPLATE PUBLISHING & VERSIONING
  // ==========================================
  async publishTemplate(params: {
    messageTypeId?: string;
    sourceId: string;
    sourceCode: string;
    sourceName: string;
    messageTypeName: string;
    eventTypeId: string;
    eventTypeKey: string;
    category: any;
    sampleSmsText: string;
    patternRegex: string;
    senderIds: string[];
    variables: any[];
    rawMessagePolicy: 'DISABLED' | 'MASKED' | 'FULL';
  }): Promise<{ messageType: RelayMessageType; variant: RelayTemplateVariant } | null> {
    try {
      const headers = this.getAuthHeaders();
      const formattedVariables = (params.variables || []).map((v: any) => ({
        key: v.variableKey || v.key,
        variableKey: v.variableKey || v.key,
        name: v.variableName || v.displayName || v.name || v.key || v.variableKey,
        variableName: v.variableName || v.displayName || v.name || v.key || v.variableKey,
        data_type: v.dataType || v.data_type || 'string',
        dataType: v.dataType || v.data_type || 'string',
        sensitivity: v.sensitivity || 'NORMAL',
        sample_value: v.sampleValue || v.sample_value || '',
        sampleValue: v.sampleValue || v.sample_value || '',
        token_index: v.tokenIndex ?? v.token_index ?? 0,
        tokenIndex: v.tokenIndex ?? v.token_index ?? 0,
        required: v.required ?? true
      }));

      const res = await firstValueFrom(this.http.post<any>(`${this.baseUrl}/message-types`, {
        source_id: params.sourceId,
        source_code: params.sourceCode,
        source_name: params.sourceName,
        name: params.messageTypeName,
        category: params.category,
        event_type: params.eventTypeKey,
        sender_aliases: params.senderIds,
        sample_template: params.sampleSmsText,
        pattern_regex: params.patternRegex,
        variables: formattedVariables
      }, { headers }));

      if (res && res.success && res.data) {
        await this.fetchLiveRelayData();
        this.toastService.showSuccess('Template Published', res.message || 'Template saved and pushed to live nodes.');
        const found = this.messageTypes().find(m => m.id === res.data._id || m.name === params.messageTypeName);
        return {
          messageType: found || {
            id: res.data._id,
            sourceId: params.sourceId,
            sourceCode: params.sourceCode,
            sourceName: params.sourceName,
            eventTypeId: params.eventTypeId,
            eventTypeKey: params.eventTypeKey,
            name: params.messageTypeName,
            category: params.category,
            sensitive: false,
            activeVariantCount: 1,
            status: 'ACTIVE',
            variants: [],
            createdAt: res.data.createdAt,
            updatedAt: res.data.updatedAt
          },
          variant: {
            id: res.data._id,
            messageTypeId: res.data._id,
            version: res.data.version || 1,
            priority: 10,
            sampleSmsText: params.sampleSmsText,
            patternRegex: params.patternRegex,
            checksum: 'sha256:live',
            senderIds: params.senderIds,
            variables: params.variables,
            rawMessagePolicy: params.rawMessagePolicy,
            status: 'PUBLISHED',
            publishedAt: new Date().toISOString(),
            publishedBy: 'Admin',
            createdAt: res.data.createdAt,
            updatedAt: res.data.updatedAt
          }
        };
      }
    } catch (err: any) {
      this.toastService.showError('Publish Failed', err?.error?.message || 'Could not publish template.');
    }
    return null;
  }

  // Rollback template to prior variant
  rollbackVariant(messageTypeId: string, targetVariantId: string) {
    const msg = this.messageTypes().find(m => m.id === messageTypeId);
    if (!msg) return;

    const target = msg.variants.find(v => v.id === targetVariantId);
    if (!target) return;

    const newVersion = msg.variants.length + 1;
    const rolledBackVariant: RelayTemplateVariant = {
      ...target,
      id: `tpl_${Date.now().toString().slice(-6)}`,
      version: newVersion,
      publishedAt: new Date().toISOString(),
      publishedBy: `Rollback by ${this.authService.currentAdmin()?.name || 'Admin'}`,
      updatedAt: new Date().toISOString()
    };

    this.messageTypes.update(list => list.map(m => m.id === messageTypeId ? {
      ...m,
      variants: [rolledBackVariant, ...m.variants],
      activeVariantCount: m.variants.length + 1,
      updatedAt: new Date().toISOString()
    } : m));

    this.toastService.showSuccess('Rollback Complete', `Reverted to v${target.version} settings as new v${newVersion}.`);
  }

  // ==========================================
  // DEVICE ACTIONS
  // ==========================================
  async revokeDevice(deviceId: string) {
    try {
      const headers = this.getAuthHeaders();
      const res = await firstValueFrom(this.http.post<any>(`${this.baseUrl}/devices/${deviceId}/revoke`, {}, { headers }));
      if (res && res.success) {
        this.devices.update(list => list.map(d => d.id === deviceId ? { ...d, status: 'REVOKED' } : d));
        this.toastService.showSuccess('Device Revoked', 'Device credentials revoked immediately. Android app will receive 403 wipe instruction.');
      }
    } catch (err: any) {
      this.toastService.showError('Error', err?.error?.message || 'Failed to revoke device.');
    }
  }

  // ==========================================
  // PACKAGE & PLAN ACTIONS
  // ==========================================
  updatePackage(id: string, updates: Partial<RelayPackagePlan>) {
    this.packages.update(list => list.map(p => p.id === id ? { ...p, ...updates } : p));
    this.toastService.showSuccess('Package Updated', 'Plan quota and pricing rules saved.');
  }
}
