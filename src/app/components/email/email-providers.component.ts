import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../shared/icon.component';
import { EmailProvider } from '../../models/alert21.models';

@Component({
  selector: 'app-email-providers',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Email Provider Management</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Configure email gateway credentials, regions, event publishing configuration sets, and adapter integration.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openAddModal()" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="plus" [size]="13"></app-icon>
            <span>Add Provider</span>
          </button>
        </div>
      </div>

      <!-- Security Notice Alert -->
      <div class="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950 shadow-xs">
        <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <app-icon name="shield-check" [size]="16"></app-icon>
        </div>
        <div class="space-y-0.5">
          <h4 class="font-black text-indigo-950 uppercase tracking-wider text-[11px]">Security & Permission Rule</h4>
          <p class="text-indigo-800 text-[11px]">
            Root credentials must never be used. Use a dedicated IAM / API User with only required email sending and domain verification permissions.
            Secret keys are AES encrypted at rest and masked in this dashboard.
          </p>
        </div>
      </div>

      <!-- Providers Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" *ngIf="providersList().length > 0">
        <div *ngFor="let p of providersList()" class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between relative overflow-hidden space-y-4">
          <!-- Top Row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                <app-icon name="server" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900">{{ p.name }}</h3>
                <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Code: {{ p.code }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span *ngIf="p.isDefault" class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                GLOBAL DEFAULT
              </span>
              <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase"
                    [ngClass]="p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
                {{ p.status }}
              </span>
            </div>
          </div>

          <!-- Configuration Parameter Spec (Dark Terminal Container) -->
          <div class="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2.5 shadow-inner">
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Base API URL:</span>
              <span class="text-indigo-400 font-bold truncate max-w-xs" [title]="'https://email.' + p.region + '.amazonaws.com'">
                https://email.{{ p.region }}.amazonaws.com
              </span>
            </div>

            <!-- Callback / DLR URL with Box and Copy Button -->
            <div class="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-slate-400 text-[10px] uppercase font-bold tracking-wider">CALLBACK / DLR URL:</span>
                <button 
                  type="button" 
                  (click)="copyCallbackUrl(p.callbackUrl || defaultCallbackUrl, p.id)" 
                  class="inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all cursor-pointer">
                  <app-icon [name]="copiedId === p.id ? 'check' : 'copy'" [size]="12"></app-icon>
                  <span>{{ copiedId === p.id ? 'Copied' : 'Copy URL' }}</span>
                </button>
              </div>
              <div class="text-cyan-400 font-mono text-[11px] break-all select-all bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                {{ p.callbackUrl || defaultCallbackUrl }}
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-slate-400">Username:</span>
              <span class="text-emerald-400 font-bold">{{ p.accessKeyId || 'AKIAIOSFODNN7EXAMPLE' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Password / Secret:</span>
              <span class="text-amber-400 font-bold">••••••••••••••••</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Raw Telemarketer ID:</span>
              <span class="text-indigo-300 font-bold">{{ p.region }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Unicode Default:</span>
              <span class="text-slate-300">FALSE</span>
            </div>
          </div>

          <!-- Test Connection Result Feedback -->
          <div *ngIf="testResult[p.id]" class="p-3 rounded-xl text-xs font-medium"
               [ngClass]="testResult[p.id].success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'">
            <div class="flex items-center gap-2">
              <app-icon [name]="testResult[p.id].success ? 'check-circle' : 'alert-triangle'" [size]="14"></app-icon>
              <span>{{ testResult[p.id].message }}</span>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-2">
              <button 
                (click)="testConnection(p)" 
                [disabled]="testingId === p.id"
                class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
                <app-icon [name]="testingId === p.id ? 'refresh' : 'play'" [size]="12" [className]="testingId === p.id ? 'animate-spin text-amber-500' : ''"></app-icon>
                <span>{{ testingId === p.id ? 'Testing...' : 'Test Connection' }}</span>
              </button>
            </div>

            <button 
              (click)="openEditModal(p)" 
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all">
              Edit Configuration
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State Card -->
      <div *ngIf="providersList().length === 0" class="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <app-icon name="server" [size]="36" className="mx-auto mb-3 text-slate-300"></app-icon>
        <h3 class="text-base font-black text-slate-800">No Email Provider Configured</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Add your email credentials and region to enable transactional email delivery for all users.
        </p>
        <button (click)="openAddModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs">
          Configure Email Provider
        </button>
      </div>

      <!-- Add / Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">
              {{ editingProvider ? 'Edit Email Provider Configuration' : 'Configure Email Provider' }}
            </h3>
            <button (click)="closeModal()" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3 font-sans text-xs">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Provider Name</label>
              <input type="text" [(ngModel)]="formName" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Provider Code</label>
                <input type="text" [(ngModel)]="formCode" readonly class="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-600">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Region</label>
                <select [(ngModel)]="formRegion" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                  <option value="ap-southeast-2">Asia Pacific (Sydney) - ap-southeast-2</option>
                  <option value="ap-south-1">Asia Pacific (Mumbai) - ap-south-1</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore) - ap-southeast-1</option>
                  <option value="us-east-1">US East (N. Virginia) - us-east-1</option>
                  <option value="us-west-2">US West (Oregon) - us-west-2</option>
                  <option value="eu-west-1">Europe (Ireland) - eu-west-1</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Access Key ID *</label>
              <input type="text" [(ngModel)]="formAccessKey" placeholder="AKIAIOSFODNN7EXAMPLE" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Secret Access Key {{ editingProvider ? '(Leave blank to keep unchanged)' : '*' }}
              </label>
              <input type="password" [(ngModel)]="formSecretKey" placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Configuration Set (Optional)</label>
                <input type="text" [(ngModel)]="formConfigSet" placeholder="Alert21-Events" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status</label>
                <select [(ngModel)]="formStatus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <!-- Callback URL in Modal -->
            <div class="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 space-y-1.5 mt-2">
              <label class="block text-[10px] font-bold text-indigo-900 uppercase">Event Webhook / Callback URL</label>
              <div class="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-200">
                <span class="font-mono text-[11px] text-slate-700 truncate">{{ defaultCallbackUrl }}</span>
                <button (click)="copyCallbackUrl(defaultCallbackUrl)" class="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold shrink-0">
                  Copy
                </button>
              </div>
              <p class="text-[10px] text-slate-500">Use this URL in your email provider configuration to track delivered, bounced & complained emails.</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="saveProvider()" [disabled]="isSaving" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              {{ isSaving ? 'Saving...' : 'Save Configuration' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmailProvidersComponent implements OnInit {
  dataService = inject(DataService);
  toastService = inject(ToastService);

  defaultCallbackUrl = 'https://app.alert21.in/back/api/v1/email/callback/aws-ses';
  showModal = false;
  editingProvider: EmailProvider | null = null;
  isSaving = false;
  testingId: string | null = null;
  testResult: Record<string, { success: boolean; message: string }> = {};

  formName = 'Email Gateway';
  formCode = 'EMAIL_GATEWAY';
  formRegion = 'ap-southeast-2';
  formAccessKey = '';
  formSecretKey = '';
  formConfigSet = '';
  formStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';

  ngOnInit() {
    this.dataService.fetchEmailProviders();
  }

  providersList() {
    return this.dataService.emailProviders();
  }

  openAddModal() {
    this.editingProvider = null;
    this.formName = 'Email Gateway';
    this.formCode = 'EMAIL_GATEWAY';
    this.formRegion = 'ap-southeast-2';
    this.formAccessKey = '';
    this.formSecretKey = '';
    this.formConfigSet = '';
    this.formStatus = 'ACTIVE';
    this.showModal = true;
  }

  openEditModal(p: EmailProvider) {
    this.editingProvider = p;
    this.formName = p.name;
    this.formCode = p.code;
    this.formRegion = p.region;
    this.formAccessKey = p.accessKeyId;
    this.formSecretKey = '';
    this.formConfigSet = p.configurationSet || '';
    this.formStatus = p.status;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingProvider = null;
  }

  copiedId: string | null = null;

  copyCallbackUrl(url: string, id?: string) {
    navigator.clipboard.writeText(url);
    if (id) {
      this.copiedId = id;
      setTimeout(() => (this.copiedId = null), 2500);
    }
    this.toastService.showSuccess('Copied', 'Callback URL copied to clipboard.');
  }

  async saveProvider() {
    if (!this.formAccessKey.trim()) return;
    this.isSaving = true;

    const payload: Partial<EmailProvider> = {
      id: this.editingProvider ? this.editingProvider.id : undefined,
      name: this.formName,
      code: this.formCode,
      region: this.formRegion,
      accessKeyId: this.formAccessKey.trim(),
      secretAccessKey: this.formSecretKey.trim() ? this.formSecretKey.trim() : undefined,
      configurationSet: this.formConfigSet.trim(),
      status: this.formStatus
    };

    const ok = await this.dataService.saveEmailProvider(payload);
    this.isSaving = false;
    if (ok) {
      this.closeModal();
    }
  }

  async testConnection(p: EmailProvider) {
    this.testingId = p.id;
    const res = await this.dataService.testEmailProviderConnection(p.id);
    this.testingId = null;
    this.testResult[p.id] = {
      success: res.success,
      message: res.message
    };
  }
}
