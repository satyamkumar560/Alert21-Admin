import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../shared/icon.component';
import { EmailSendingDomain, DnsRecordItem } from '../../models/alert21.models';

@Component({
  selector: 'app-email-domains',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Sending Domains (All Users)</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Cross-tenant domain identities, Amazon SES Easy DKIM verification tokens, and DNS records inspection.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="dataService.fetchEmailDomains()" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Refresh Domains</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <!-- Search Input -->
        <div class="relative w-full md:w-80 flex items-center">
          <span class="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            <app-icon name="globe" [size]="14"></app-icon>
          </span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search by domain, user or email..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium transition-all"
          />
        </div>

        <!-- Filter Status Buttons -->
        <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button 
            *ngFor="let tab of filterTabs" 
            (click)="selectedStatus = tab.key"
            [ngClass]="selectedStatus === tab.key ? 'bg-indigo-600 text-white font-extrabold shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
            class="px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap">
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Domains Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th class="py-3.5 px-4">Domain Name</th>
                <th class="py-3.5 px-4">User Account</th>
                <th class="py-3.5 px-4">Verification Status</th>
                <th class="py-3.5 px-4">DKIM Records</th>
                <th class="py-3.5 px-4">Custom MAIL FROM</th>
                <th class="py-3.5 px-4">Added On</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let d of filteredDomains()" class="hover:bg-slate-50/50 transition-colors">
                <!-- Domain -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <app-icon name="globe" [size]="16"></app-icon>
                    </div>
                    <div>
                      <p class="font-bold text-slate-900 font-mono">{{ d.domain }}</p>
                      <p class="text-[10px] text-slate-400 font-mono">ID: {{ d.id }}</p>
                    </div>
                  </div>
                </td>

                <!-- User -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-800">{{ d.userName }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ d.userEmail }}</p>
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase"
                        [ngClass]="getStatusBadgeClass(d.status)">
                    {{ d.status }}
                  </span>
                </td>

                <!-- DKIM Records count -->
                <td class="py-3.5 px-4">
                  <button (click)="openDnsModal(d)" class="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    <app-icon name="layers" [size]="12"></app-icon>
                    <span>{{ d.dnsRecords.length || 3 }} DNS Records</span>
                  </button>
                </td>

                <!-- Custom MAIL FROM -->
                <td class="py-3.5 px-4 font-mono text-[11px]">
                  <span *ngIf="d.customMailFromDomain" class="text-slate-700 font-semibold">{{ d.customMailFromDomain }}</span>
                  <span *ngIf="!d.customMailFromDomain" class="text-slate-400">amazonses.com (Default)</span>
                </td>

                <!-- Created At -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-700">{{ d.createdAt | date:'mediumDate' }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ d.createdAt | date:'shortTime' }}</p>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      *ngIf="d.status !== 'VERIFIED'"
                      (click)="approveDomain(d)" 
                      [disabled]="checkingId === d.id"
                      class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all">
                      <app-icon name="check" [size]="11"></app-icon>
                      <span>Approve</span>
                    </button>
                    <button 
                      (click)="syncStatus(d)" 
                      [disabled]="checkingId === d.id"
                      class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all">
                      <app-icon name="refresh" [size]="11" [className]="checkingId === d.id ? 'animate-spin' : ''"></app-icon>
                      <span>{{ checkingId === d.id ? 'Syncing...' : 'Sync SES' }}</span>
                    </button>
                    <button 
                      (click)="openDnsModal(d)" 
                      class="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-all">
                      View DNS
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredDomains().length === 0">
                <td colspan="7" class="py-16 text-center text-slate-400">
                  <app-icon name="globe" [size]="32" className="mx-auto mb-2 text-slate-300"></app-icon>
                  <p class="font-bold text-slate-700">No Sending Domains Found</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">When users register their custom sending domains, they will appear here for verification.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- DNS Inspection Modal -->
      <div *ngIf="selectedDomain" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase">DNS Records for {{ selectedDomain.domain }}</h3>
              <p class="text-[11px] text-slate-500 font-medium">Add these CNAME records to domain registrar DNS zone to verify Amazon SES identity.</p>
            </div>
            <button (click)="selectedDomain = null" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <!-- DNS Records List -->
          <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
            <div *ngFor="let rec of getRecordsForDomain(selectedDomain); let i = index"
                 class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-indigo-700">Record #{{ i + 1 }} ({{ rec.recordType }})</span>
                <span class="text-[10px] px-2 py-0.5 rounded font-bold border"
                      [ngClass]="selectedDomain.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'">
                  {{ selectedDomain.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING DNS' }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span class="text-[10px] text-slate-400 block">Host / Name:</span>
                  <div class="flex items-center justify-between gap-1 bg-white p-1.5 rounded border border-slate-200">
                    <span class="truncate text-slate-800 text-[11px]">{{ rec.name }}</span>
                    <button (click)="copyText(rec.name)" class="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold shrink-0">
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <span class="text-[10px] text-slate-400 block">Points to / Value:</span>
                  <div class="flex items-center justify-between gap-1 bg-white p-1.5 rounded border border-slate-200">
                    <span class="truncate text-slate-800 text-[11px]">{{ rec.value }}</span>
                    <button (click)="copyText(rec.value)" class="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold shrink-0">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="getRecordsForDomain(selectedDomain).length === 0" class="py-8 text-center text-slate-400 bg-slate-50 rounded-xl">
              <app-icon name="globe" [size]="24" className="mx-auto mb-1 text-slate-300"></app-icon>
              <p class="font-bold text-slate-600">No DNS Records Found</p>
              <p class="text-[10px] text-slate-400">Click Check Verification Now below to fetch tokens from Amazon SES.</p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <span class="text-[11px] text-slate-500 font-medium">DNS propagation can take between 5 minutes to 24 hours.</span>
            <div class="flex items-center gap-2">
              <button 
                *ngIf="selectedDomain.status !== 'VERIFIED'"
                (click)="approveDomain(selectedDomain)" 
                [disabled]="checkingId === selectedDomain.id" 
                class="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                Approve Domain Now
              </button>
              <button 
                (click)="syncStatus(selectedDomain)" 
                [disabled]="checkingId === selectedDomain.id" 
                class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                {{ checkingId === selectedDomain.id ? 'Checking SES...' : 'Check Verification' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmailDomainsComponent implements OnInit {
  dataService = inject(DataService);
  toastService = inject(ToastService);

  selectedStatus = 'ALL';
  searchQuery = '';
  selectedDomain: EmailSendingDomain | null = null;
  checkingId: string | null = null;

  filterTabs = [
    { key: 'ALL', label: 'All Domains' },
    { key: 'VERIFIED', label: 'Verified' },
    { key: 'PENDING_DNS', label: 'Pending DNS' },
    { key: 'FAILED', label: 'Failed' }
  ];

  ngOnInit() {
    this.dataService.fetchEmailDomains();
  }

  filteredDomains() {
    return this.dataService.emailDomains().filter(d => {
      const matchStatus = this.selectedStatus === 'ALL' || d.status === this.selectedStatus;
      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q || d.domain.toLowerCase().includes(q) || d.userName.toLowerCase().includes(q) || d.userEmail.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }

  getStatusBadgeClass(status: string) {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'PENDING_DNS':
      case 'VERIFYING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'FAILED':
      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  openDnsModal(d: EmailSendingDomain) {
    this.selectedDomain = d;
  }

  getRecordsForDomain(d: EmailSendingDomain): DnsRecordItem[] {
    if (d.dnsRecords && d.dnsRecords.length > 0) return d.dnsRecords;
    if (d.dkimTokens && d.dkimTokens.length > 0) {
      return d.dkimTokens.map(token => ({
        recordType: 'CNAME' as const,
        name: `${token}._domainkey.${d.domain}`,
        value: `${token}.dkim.amazonses.com`
      }));
    }
    return [];
  }

  copyText(val: string) {
    navigator.clipboard.writeText(val);
    this.toastService.showSuccess('Copied', 'DNS value copied to clipboard.');
  }

  async approveDomain(d: EmailSendingDomain) {
    this.checkingId = d.id;
    const success = await this.dataService.approveEmailDomain(d.id);
    this.checkingId = null;
    if (success && this.selectedDomain && this.selectedDomain.id === d.id) {
      this.selectedDomain = { ...this.selectedDomain, status: 'VERIFIED' };
    }
  }

  async syncStatus(d: EmailSendingDomain) {
    this.checkingId = d.id;
    await this.dataService.checkEmailDomainVerification(d.id);
    this.checkingId = null;
  }
}
