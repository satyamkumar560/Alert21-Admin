import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../shared/icon.component';
import { WhatsappProviderConfig } from '../../models/alert21.models';

@Component({
  selector: 'app-whatsapp-config',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Meta App Configuration</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Configure Meta App ID, App Secret, Embedded Signup Configuration ID, Graph API version, and Webhook endpoints.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openEditModal()" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="edit" [size]="13"></app-icon>
            <span>Edit Meta Configuration</span>
          </button>
        </div>
      </div>

      <!-- Security Notice Alert (Task #07 Section 2 & 22) -->
      <div class="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950 shadow-xs">
        <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <app-icon name="shield-check" [size]="16"></app-icon>
        </div>
        <div class="space-y-0.5">
          <h4 class="font-black text-indigo-950 uppercase tracking-wider text-[11px]">Security & Meta Token Compliance</h4>
          <p class="text-indigo-800 text-[11px]">
            Meta App Secret, system user tokens, and long-lived credentials must never be exposed to the User Panel or browser.
            Stored encrypted at rest in backend and verified with SHA256 webhook signatures.
          </p>
        </div>
      </div>

      <!-- Provider Card with Dark Terminal Container (Exact Match with Image 1) -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between relative overflow-hidden space-y-4 max-w-3xl">
        <!-- Top Row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <app-icon name="message-circle" [size]="20"></app-icon>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900">{{ config()?.providerName || 'Meta WhatsApp Cloud API' }}</h3>
              <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Graph API: {{ config()?.graphApiVersion || 'v20.0' }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              GLOBAL DEFAULT
            </span>
            <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase"
                  [ngClass]="config()?.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
              {{ config()?.status || 'ACTIVE' }}
            </span>
          </div>
        </div>

        <!-- Configuration Parameter Spec (Dark Terminal Container) -->
        <div class="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2.5 shadow-inner">
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Base API URL:</span>
            <span class="text-indigo-400 font-bold truncate max-w-xs" [title]="'https://graph.facebook.com/' + (config()?.graphApiVersion || 'v20.0')">
              https://graph.facebook.com/{{ config()?.graphApiVersion || 'v20.0' }}
            </span>
          </div>

          <!-- Callback / Webhook URL with Box and Copy Button -->
          <div class="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-slate-400 text-[10px] uppercase font-bold tracking-wider">CALLBACK / DLR URL:</span>
              <button 
                type="button" 
                (click)="copyCallbackUrl(config()?.webhookCallbackUrl || defaultWebhookUrl)" 
                class="inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all cursor-pointer">
                <app-icon [name]="isCopied ? 'check' : 'copy'" [size]="12"></app-icon>
                <span>{{ isCopied ? 'Copied' : 'Copy URL' }}</span>
              </button>
            </div>
            <div class="text-cyan-400 font-mono text-[11px] break-all select-all bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
              {{ config()?.webhookCallbackUrl || defaultWebhookUrl }}
            </div>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-slate-400">Meta App ID:</span>
            <span class="text-emerald-400 font-bold">{{ config()?.metaAppId || '1092837465928172' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400">App Secret:</span>
            <span class="text-amber-400 font-bold">{{ config()?.metaAppSecretMasked || '••••••••••••••••' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Embedded Config ID:</span>
            <span class="text-indigo-300 font-bold">{{ config()?.embeddedSignupConfigId || '718293049182736' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Webhook Verify Token:</span>
            <span class="text-slate-300 font-bold">{{ config()?.webhookVerifyToken || 'alert21_meta_webhook_secret_token' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Environment:</span>
            <span class="text-emerald-400 font-bold">{{ config()?.environment || 'PRODUCTION' }}</span>
          </div>
        </div>

        <!-- Test Connection Result Feedback -->
        <div *ngIf="testResult" class="p-3 rounded-xl text-xs font-medium"
             [ngClass]="testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'">
          <div class="flex items-center gap-2">
            <app-icon [name]="testResult.success ? 'check-circle' : 'alert-triangle'" [size]="14"></app-icon>
            <span>{{ testResult.message }}</span>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center gap-2">
            <button 
              (click)="testConnection()" 
              [disabled]="isTesting"
              class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
              <app-icon [name]="isTesting ? 'refresh' : 'play'" [size]="12" [className]="isTesting ? 'animate-spin text-amber-500' : ''"></app-icon>
              <span>{{ isTesting ? 'Testing...' : 'Test Connection' }}</span>
            </button>
          </div>

          <button 
            (click)="openEditModal()" 
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all">
            Edit Configuration
          </button>
        </div>
      </div>

      <!-- Add / Edit Meta Config Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">
              Configure Meta App & Embedded Signup
            </h3>
            <button (click)="closeModal()" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3 font-sans text-xs">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Provider Name</label>
              <input type="text" [(ngModel)]="formProviderName" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Meta App ID *</label>
                <input type="text" [(ngModel)]="formMetaAppId" placeholder="1092837465928172" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Graph API Version</label>
                <select [(ngModel)]="formGraphApiVersion" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                  <option value="v20.0">v20.0 (Recommended)</option>
                  <option value="v19.0">v19.0</option>
                  <option value="v18.0">v18.0</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Meta App Secret (Leave blank to keep unchanged)
              </label>
              <input type="password" [(ngModel)]="formMetaAppSecret" placeholder="••••••••••••••••" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Facebook Login / Embedded Signup Config ID</label>
              <input type="text" [(ngModel)]="formEmbeddedConfigId" placeholder="718293049182736" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Webhook Verify Token</label>
                <input type="text" [(ngModel)]="formWebhookVerifyToken" placeholder="alert21_meta_webhook_secret_token" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Environment</label>
                <select [(ngModel)]="formEnvironment" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                  <option value="PRODUCTION">PRODUCTION</option>
                  <option value="DEVELOPMENT">DEVELOPMENT</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Webhook Callback URL</label>
              <input type="text" [(ngModel)]="formWebhookCallbackUrl" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Privacy Policy URL</label>
                <input type="text" [(ngModel)]="formPrivacyUrl" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Terms URL</label>
                <input type="text" [(ngModel)]="formTermsUrl" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="saveConfig()" [disabled]="isSaving" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              {{ isSaving ? 'Saving...' : 'Save Meta Configuration' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WhatsappConfigComponent implements OnInit {
  dataService = inject(DataService);
  toastService = inject(ToastService);

  defaultWebhookUrl = 'https://app.alert21.in/back/api/v1/whatsapp/meta/webhook';
  showModal = false;
  isSaving = false;
  isTesting = false;
  isCopied = false;
  testResult: { success: boolean; message: string } | null = null;

  formProviderName = 'Meta WhatsApp Cloud API';
  formMetaAppId = '';
  formMetaAppSecret = '';
  formEmbeddedConfigId = '';
  formGraphApiVersion = 'v20.0';
  formWebhookVerifyToken = 'alert21_meta_webhook_secret_token';
  formWebhookCallbackUrl = 'https://app.alert21.in/back/api/v1/whatsapp/meta/webhook';
  formPrivacyUrl = 'https://alert21.in/privacy-policy';
  formTermsUrl = 'https://alert21.in/terms';
  formEnvironment: 'PRODUCTION' | 'DEVELOPMENT' = 'PRODUCTION';
  formStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';

  ngOnInit() {
    this.dataService.fetchWhatsappConfig();
  }

  config() {
    return this.dataService.whatsappConfig();
  }

  openEditModal() {
    const c = this.config();
    if (c) {
      this.formProviderName = c.providerName;
      this.formMetaAppId = c.metaAppId;
      this.formMetaAppSecret = '';
      this.formEmbeddedConfigId = c.embeddedSignupConfigId || '';
      this.formGraphApiVersion = c.graphApiVersion || 'v20.0';
      this.formWebhookVerifyToken = c.webhookVerifyToken;
      this.formWebhookCallbackUrl = c.webhookCallbackUrl;
      this.formPrivacyUrl = c.privacyPolicyUrl;
      this.formTermsUrl = c.termsUrl;
      this.formEnvironment = c.environment || 'PRODUCTION';
      this.formStatus = c.status || 'ACTIVE';
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  copyCallbackUrl(url: string) {
    navigator.clipboard.writeText(url);
    this.isCopied = true;
    this.toastService.showSuccess('Copied', 'Meta Webhook Callback URL copied to clipboard.');
    setTimeout(() => (this.isCopied = false), 2500);
  }

  async saveConfig() {
    if (!this.formMetaAppId.trim()) {
      this.toastService.showError('Required', 'Meta App ID is required.');
      return;
    }
    this.isSaving = true;

    const ok = await this.dataService.saveWhatsappConfig({
      providerName: this.formProviderName,
      metaAppId: this.formMetaAppId.trim(),
      metaAppSecret: this.formMetaAppSecret.trim() ? this.formMetaAppSecret.trim() : undefined,
      embeddedSignupConfigId: this.formEmbeddedConfigId.trim(),
      graphApiVersion: this.formGraphApiVersion,
      webhookVerifyToken: this.formWebhookVerifyToken.trim(),
      webhookCallbackUrl: this.formWebhookCallbackUrl.trim(),
      privacyPolicyUrl: this.formPrivacyUrl.trim(),
      termsUrl: this.formTermsUrl.trim(),
      environment: this.formEnvironment,
      status: this.formStatus
    });

    this.isSaving = false;
    if (ok) {
      this.closeModal();
    }
  }

  async testConnection() {
    this.isTesting = true;
    this.testResult = await this.dataService.testWhatsappMetaConnection();
    this.isTesting = false;
  }
}
