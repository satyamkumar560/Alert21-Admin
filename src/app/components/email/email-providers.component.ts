import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
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
            Configure Amazon SES credentials, regions, event publishing configuration sets, and adapter integration.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openAddModal()" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="plus" [size]="13"></app-icon>
            <span>Add Provider (SES)</span>
          </button>
        </div>
      </div>

      <!-- Security Notice Alert -->
      <div class="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950 shadow-xs">
        <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <app-icon name="shield-check" [size]="16"></app-icon>
        </div>
        <div class="space-y-0.5">
          <h4 class="font-black text-indigo-950 uppercase tracking-wider text-[11px]">Security & IAM Permission Rule</h4>
          <p class="text-indigo-800 text-[11px]">
            AWS root credentials must never be used. Use an IAM User with only <strong>ses:SendRawEmail</strong> and <strong>ses:GetIdentityVerificationAttributes</strong> permissions.
            Secret keys are AES encrypted at rest and masked in this dashboard.
          </p>
        </div>
      </div>

      <!-- Providers Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" *ngIf="providersList().length > 0">
        <div *ngFor="let p of providersList()" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between relative overflow-hidden space-y-4">
          <!-- Top Badge -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                <app-icon name="server" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900">{{ p.name }}</h3>
                <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{{ p.code }}</span>
              </div>
            </div>

            <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase"
                  [ngClass]="p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
              {{ p.status }}
            </span>
          </div>

          <!-- Configuration Details List -->
          <div class="bg-slate-50 rounded-xl p-4 space-y-2.5 text-xs font-mono border border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">AWS Region:</span>
              <span class="font-bold text-indigo-600">{{ p.region }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Access Key ID:</span>
              <span class="font-bold text-slate-800">{{ p.accessKeyId || 'AKIA••••••••••••' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Secret Access Key:</span>
              <span class="font-bold text-slate-400">{{ p.secretAccessKeyMasked || '••••••••••••••••' }}</span>
            </div>
            <div class="flex items-center justify-between" *ngIf="p.configurationSet">
              <span class="text-slate-500">Config Set:</span>
              <span class="font-bold text-slate-800">{{ p.configurationSet }}</span>
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
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <button 
              (click)="testConnection(p)" 
              [disabled]="testingId === p.id"
              class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
              <app-icon name="activity" [size]="13" [className]="testingId === p.id ? 'animate-spin' : 'text-amber-500'"></app-icon>
              <span>{{ testingId === p.id ? 'Testing SES...' : 'Test Connection' }}</span>
            </button>

            <button 
              (click)="openEditModal(p)" 
              class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all">
              Edit Credentials
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State Card -->
      <div *ngIf="providersList().length === 0" class="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <app-icon name="server" [size]="36" className="mx-auto mb-3 text-slate-300"></app-icon>
        <h3 class="text-base font-black text-slate-800">No Amazon SES Provider Configured</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Add your AWS SES credentials and region to enable transactional email delivery for all users.
        </p>
        <button (click)="openAddModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs">
          Configure Amazon SES
        </button>
      </div>

      <!-- Add / Edit SES Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">
              {{ editingProvider ? 'Edit Amazon SES Configuration' : 'Configure Amazon SES Provider' }}
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
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">AWS Region</label>
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
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">AWS Access Key ID *</label>
              <input type="text" [(ngModel)]="formAccessKey" placeholder="AKIAIOSFODNN7EXAMPLE" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                AWS Secret Access Key {{ editingProvider ? '(Leave blank to keep unchanged)' : '*' }}
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

  showModal = false;
  editingProvider: EmailProvider | null = null;
  isSaving = false;
  testingId: string | null = null;
  testResult: { [id: string]: { success: boolean; message: string } } = {};

  formName = 'Amazon SES';
  formCode = 'AWS_SES';
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
    this.formName = 'Amazon SES';
    this.formCode = 'AWS_SES';
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
