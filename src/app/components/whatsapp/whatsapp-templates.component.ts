import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { WhatsappTemplate, WhatsappTemplateCategory, WhatsappTemplateStatus } from '../../models/alert21.models';

@Component({
  selector: 'app-whatsapp-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Message Templates (All Users)</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Cross-tenant Meta WhatsApp templates, approval states, variable mappings, and rejection reasons.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="refresh()" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Filters & Controls Bar -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <!-- Search -->
          <div class="relative w-full sm:w-64">
            <app-icon name="search" [size]="14" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search template name, user..." 
              class="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all">
          </div>

          <!-- Category Filter -->
          <select 
            [(ngModel)]="selectedCategory" 
            (change)="refresh()"
            class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Categories</option>
            <option value="UTILITY">Utility</option>
            <option value="AUTHENTICATION">Authentication (OTP)</option>
            <option value="MARKETING">Marketing</option>
          </select>

          <!-- Status Filter -->
          <select 
            [(ngModel)]="selectedStatus" 
            (change)="refresh()"
            class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved / Active</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>

        <div class="text-xs font-bold text-slate-500">
          Showing <span class="text-slate-900 font-black">{{ filteredTemplates().length }}</span> Templates
        </div>
      </div>

      <!-- Templates Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="filteredTemplates().length > 0">
        <div *ngFor="let t of filteredTemplates()" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <!-- Top Row -->
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-black text-sm text-slate-900">{{ t.name }}</h3>
                <span class="text-[10px] font-mono text-slate-400">{{ t.language }} • {{ t.wabaId }}</span>
              </div>

              <!-- Status Badge -->
              <span class="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md uppercase shrink-0"
                    [ngClass]="{
                      'bg-emerald-50 text-emerald-700 border border-emerald-200': t.status === 'APPROVED' || t.status === 'ACTIVE',
                      'bg-amber-50 text-amber-700 border border-amber-200': t.status === 'PENDING' || t.status === 'IN_REVIEW',
                      'bg-rose-50 text-rose-700 border border-rose-200': t.status === 'REJECTED',
                      'bg-slate-100 text-slate-600': t.status === 'PAUSED' || t.status === 'DISABLED'
                    }">
                {{ t.status }}
              </span>
            </div>

            <!-- Category Pill & User -->
            <div class="flex items-center justify-between text-[11px] pt-1">
              <span class="px-2 py-0.5 rounded font-bold text-[10px]"
                    [ngClass]="{
                      'bg-indigo-50 text-indigo-700': t.category === 'UTILITY',
                      'bg-amber-50 text-amber-700': t.category === 'AUTHENTICATION',
                      'bg-purple-50 text-purple-700': t.category === 'MARKETING'
                    }">
                {{ t.category }}
              </span>
              <span class="text-slate-500 font-bold truncate max-w-[150px]">{{ t.userName }}</span>
            </div>
          </div>

          <!-- Body Preview Box (WhatsApp Chat Style) -->
          <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
            <div *ngIf="t.headerContent" class="text-xs font-black text-slate-800 pb-1 border-b border-slate-200/60">
              {{ t.headerContent }}
            </div>
            <div class="text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-line select-text line-clamp-4">
              {{ t.body }}
            </div>
            <div *ngIf="t.footer" class="text-[10px] text-slate-400 italic">
              {{ t.footer }}
            </div>
          </div>

          <!-- Rejection Reason Alert -->
          <div *ngIf="t.rejectionReason" class="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-[11px] text-rose-800 space-y-0.5">
            <div class="font-bold flex items-center gap-1">
              <app-icon name="alert-triangle" [size]="12"></app-icon>
              <span>Meta Rejection Reason:</span>
            </div>
            <p>{{ t.rejectionReason }}</p>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <button 
              (click)="syncTemplate(t)" 
              [disabled]="syncingId === t.id"
              class="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all">
              <app-icon [name]="syncingId === t.id ? 'refresh' : 'play'" [size]="11" [className]="syncingId === t.id ? 'animate-spin text-amber-500' : ''"></app-icon>
              <span>{{ syncingId === t.id ? 'Syncing...' : 'Sync Meta' }}</span>
            </button>

            <button 
              (click)="openInspectModal(t)" 
              class="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-all">
              Inspect / Override
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredTemplates().length === 0" class="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <app-icon name="file-text" [size]="36" className="mx-auto mb-3 text-slate-300"></app-icon>
        <h3 class="text-base font-black text-slate-800">No Message Templates Found</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Templates created by users across tenants or synced from Meta Cloud API will appear here.
        </p>
      </div>

      <!-- Inspect / Override Modal -->
      <div *ngIf="selectedTemplate" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">Template Inspector</h3>
            <button (click)="closeInspectModal()" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
              <div>
                <span class="text-slate-400 text-[10px] font-bold uppercase">Name</span>
                <div class="font-bold text-slate-900">{{ selectedTemplate.name }}</div>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] font-bold uppercase">Category</span>
                <div class="font-bold text-indigo-600">{{ selectedTemplate.category }}</div>
              </div>
            </div>

            <div>
              <span class="text-slate-400 text-[10px] font-bold uppercase">Full Body Content</span>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans text-xs text-slate-800 whitespace-pre-line mt-1">
                {{ selectedTemplate.body }}
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Override Approval Status</label>
              <select [(ngModel)]="modalStatus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                <option value="APPROVED">APPROVED / ACTIVE</option>
                <option value="PENDING">PENDING REVIEW</option>
                <option value="REJECTED">REJECTED</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>

            <div class="space-y-1" *ngIf="modalStatus === 'REJECTED'">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Rejection Reason</label>
              <textarea [(ngModel)]="modalReason" rows="2" placeholder="e.g. Invalid formatting or missing opt-out mechanism" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="closeInspectModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="saveTemplateOverride()" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              Save Override
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WhatsappTemplatesComponent implements OnInit {
  dataService = inject(DataService);

  searchQuery = '';
  selectedCategory = 'ALL';
  selectedStatus = 'ALL';
  syncingId: string | null = null;
  selectedTemplate: WhatsappTemplate | null = null;
  modalStatus: WhatsappTemplateStatus = 'APPROVED';
  modalReason = '';

  ngOnInit() {
    this.refresh();
  }

  templatesList() {
    return this.dataService.whatsappTemplates();
  }

  filteredTemplates() {
    let list = this.templatesList();
    if (this.selectedCategory !== 'ALL') {
      list = list.filter((t) => t.category === this.selectedCategory);
    }
    if (this.selectedStatus !== 'ALL') {
      list = list.filter((t) => t.status === this.selectedStatus);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.userName?.toLowerCase().includes(q) ||
          t.wabaId?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  refresh() {
    this.dataService.fetchWhatsappTemplates(this.selectedStatus, this.selectedCategory);
  }

  async syncTemplate(t: WhatsappTemplate) {
    this.syncingId = t.id;
    await this.dataService.syncWhatsappTemplate(t.id);
    this.syncingId = null;
  }

  openInspectModal(t: WhatsappTemplate) {
    this.selectedTemplate = t;
    this.modalStatus = t.status;
    this.modalReason = t.rejectionReason || '';
  }

  closeInspectModal() {
    this.selectedTemplate = null;
  }

  async saveTemplateOverride() {
    if (!this.selectedTemplate) return;
    await this.dataService.updateWhatsappTemplateStatus(this.selectedTemplate.id, {
      status: this.modalStatus,
      rejection_reason: this.modalReason
    });
    this.closeInspectModal();
  }
}
