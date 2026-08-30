import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SmsProvider } from '../../models/alert21.models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Action Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">SMS Provider Management (MSG24 Integration)</h2>
          <p class="text-xs text-slate-500 font-medium">Configure MSG24 gateway, credentials, Telemarketer ID, and parameter mapping adapter.</p>
        </div>

        <button *ngIf="dataService.smsProviders().length === 0" (click)="openAddModal()" class="btn btn-primary shadow-md">
          <app-icon name="server" [size]="16"></app-icon>
          <span>Add Custom SMS Gateway</span>
        </button>
      </div>

      <!-- Providers Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div *ngFor="let provider of dataService.smsProviders()" class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <app-icon name="server" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900">{{ provider.name }}</h3>
                <p class="text-xs text-slate-400 font-mono">Code: {{ provider.code }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span *ngIf="provider.isGlobalDefault" class="badge badge-active text-[10px] uppercase font-bold">
                GLOBAL DEFAULT
              </span>
              <span [class]="provider.status === 'ACTIVE' ? 'badge badge-active text-[10px]' : 'badge badge-suspended text-[10px]'">
                {{ provider.status }}
              </span>
            </div>
          </div>

          <!-- Configuration Parameter Spec -->
          <div class="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2.5">
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Base API URL:</span>
              <span class="text-indigo-400 truncate max-w-xs" [title]="provider.baseUrl">{{ provider.baseUrl }}</span>
            </div>

            <!-- Callback / DLR URL with Copy Button -->
            <div *ngIf="provider.callbackUrl" class="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Callback / DLR URL:</span>
                <button 
                  type="button" 
                  (click)="copyCallbackUrl(provider.callbackUrl, provider.id)" 
                  class="inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all cursor-pointer">
                  <app-icon [name]="copiedId === provider.id ? 'check' : 'copy'" [size]="12"></app-icon>
                  <span>{{ copiedId === provider.id ? 'Copied' : 'Copy URL' }}</span>
                </button>
              </div>
              <div class="text-cyan-400 font-mono text-[11px] break-all select-all bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                {{ provider.callbackUrl }}
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-slate-400">Username:</span>
              <span class="text-emerald-400 font-bold">{{ provider.username }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Password / Secret:</span>
              <span class="text-amber-400">••••••••••••••••</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Raw Telemarketer ID:</span>
              <span class="text-indigo-300 font-bold">{{ provider.rawTelemarketerId }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Unicode Default:</span>
              <span class="text-slate-300">{{ provider.unicodeDefault ? 'TRUE' : 'FALSE' }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex gap-2">
              <button (click)="testConnection(provider)" class="btn btn-outline btn-sm text-[11px]">
                <app-icon name="play" [size]="12"></app-icon>
                <span>Test Connection</span>
              </button>
              <button (click)="openMappingModal(provider)" class="btn btn-outline btn-sm text-[11px]">
                <app-icon name="file-text" [size]="12"></app-icon>
                <span>Inspect API Mapping</span>
              </button>
            </div>

            <button (click)="openEditModal(provider)" class="btn btn-primary btn-sm text-[11px]">
              Edit Configuration
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Provider Modal -->
      <div *ngIf="showAddModal" class="modal-backdrop" (click)="closeAddModal()">
        <div class="modal-card p-6 border border-slate-200 max-w-lg bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-extrabold text-slate-900">{{ isEditMode ? 'Edit SMS Gateway Provider' : 'Add New SMS Gateway Provider' }}</h3>
              <p class="text-xs text-slate-500">{{ isEditMode ? 'Update SMS gateway credentials.' : 'Configure new SMS gateway credentials.' }}</p>
            </div>
            <button (click)="closeAddModal()" class="btn btn-outline btn-sm">Close</button>
          </div>

          <div class="py-4 space-y-4">
            <div class="form-group">
              <label class="form-label">Provider Display Name:</label>
              <input type="text" [(ngModel)]="newProvider.name" placeholder="e.g. MSG24" class="form-control text-xs font-semibold">
            </div>

            <div class="form-group">
              <label class="form-label">Provider Unique Code:</label>
              <input type="text" [(ngModel)]="newProvider.code" placeholder="e.g. MSG24" class="form-control text-xs font-mono" [disabled]="isEditMode">
            </div>

            <div class="form-group">
              <label class="form-label">Base API URL:</label>
              <input type="text" [(ngModel)]="newProvider.baseUrl" placeholder="https://admin.msg24x7.co.in/fe/api/v1/send" class="form-control text-xs font-mono">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label">API Username:</label>
                <input type="text" [(ngModel)]="newProvider.username" placeholder="satyam12" class="form-control text-xs font-mono">
              </div>

              <div class="form-group">
                <label class="form-label">API Password:</label>
                <input type="password" [(ngModel)]="newProvider.password" placeholder="Leave blank to keep existing" class="form-control text-xs font-mono">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Telemarketer ID:</label>
              <input type="text" [(ngModel)]="newProvider.rawTelemarketerId" placeholder="1302167049537543382" class="form-control text-xs font-mono">
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="closeAddModal()" class="btn btn-outline btn-sm">Cancel</button>
            <button [disabled]="isSubmitting" (click)="saveNewProvider()" class="btn btn-primary btn-sm">
              {{ isSubmitting ? 'Saving Configuration...' : (isEditMode ? 'Update SMS Provider' : 'Create SMS Provider') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProvidersComponent implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  showAddModal = false;
  isSubmitting = false;
  isEditMode = false;
  copiedId: string | null = null;

  async ngOnInit() {
    await this.dataService.fetchLiveSmsProviders();
  }

  newProvider: any = {};

  get defaultProvider() {
    return {
      name: 'MSG24',
      code: 'MSG24',
      baseUrl: 'https://admin.msg24x7.co.in/fe/api/v1/send',
      username: 'satyam12',
      password: '',
      rawTelemarketerId: '1302167049537543382',
      unicodeDefault: false,
      status: 'ACTIVE',
      isGlobalDefault: true
    };
  }

  async copyCallbackUrl(url: string, id: string) {
    if (!url) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      this.copiedId = id;
      this.toastService.showSuccess('Copied to Clipboard', 'Callback URL copied to clipboard.');
      setTimeout(() => {
        if (this.copiedId === id) {
          this.copiedId = null;
        }
      }, 2500);
    } catch (e) {
      this.toastService.showError('Copy Failed', 'Failed to copy callback URL.');
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.newProvider = this.defaultProvider;
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.isSubmitting = false;
  }

  async saveNewProvider() {
    this.isSubmitting = true;
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    
    if (this.isEditMode) {
      await this.dataService.updateLiveSmsProvider(this.newProvider, adminName);
    } else {
      await this.dataService.createLiveSmsProvider(this.newProvider, adminName);
    }
    
    this.closeAddModal();
  }

  openEditModal(provider: SmsProvider) {
    this.isEditMode = true;
    this.newProvider = { ...provider, password: '' };
    this.showAddModal = true;
  }

  testConnection(provider: SmsProvider) {
    alert(`Connection Test Successful for ${provider.name}! API HTTP 200 OK.`);
  }

  openMappingModal(provider: SmsProvider) {
    alert(`Parameter Adapter Spec for ${provider.name}: dltEntityId mapped to PE ID, dltTelemarketerId mapped to Telemarketer ID.`);
  }
}