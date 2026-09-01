import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { EmailTransaction } from '../../models/alert21.models';

@Component({
  selector: 'app-email-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Email Delivery Logs & Audit Trail</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Complete transaction snapshots, SES provider message IDs, delivery events, bounce codes, and complaint tracking.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="dataService.fetchEmailTransactions()" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <div class="relative w-full md:w-80 flex items-center">
          <span class="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            <app-icon name="mail" [size]="14"></app-icon>
          </span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search by Txn ID, recipient, subject, user..." 
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

      <!-- Transactions Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th class="py-3.5 px-4">Transaction ID</th>
                <th class="py-3.5 px-4">Recipient / To</th>
                <th class="py-3.5 px-4">Sender / From</th>
                <th class="py-3.5 px-4">Subject</th>
                <th class="py-3.5 px-4">User Account</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4">Dispatched At</th>
                <th class="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let tx of filteredTransactions()" class="hover:bg-slate-50/50 transition-colors">
                <!-- Transaction ID -->
                <td class="py-3.5 px-4">
                  <span class="font-mono text-xs font-bold text-indigo-600">{{ tx.transactionId }}</span>
                  <div class="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]" *ngIf="tx.providerMessageId">
                    SES: {{ tx.providerMessageId }}
                  </div>
                </td>

                <!-- To Email -->
                <td class="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {{ tx.toEmail }}
                </td>

                <!-- From -->
                <td class="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                  <span class="font-bold">{{ tx.fromName }}</span>
                  <div class="text-[10px] text-slate-400">&lt;{{ tx.fromEmail }}&gt;</div>
                </td>

                <!-- Subject -->
                <td class="py-3.5 px-4 max-w-xs truncate font-medium text-slate-800">
                  {{ tx.subject }}
                </td>

                <!-- User -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-800">{{ tx.userName }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ tx.userEmail }}</p>
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase border"
                        [ngClass]="getStatusClass(tx.status)">
                    {{ tx.status }}
                  </span>
                </td>

                <!-- Created At -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-700">{{ tx.createdAt | date:'mediumDate' }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ tx.createdAt | date:'shortTime' }}</p>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <button (click)="openInspect(tx)" class="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px] transition-all">
                    Inspect
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredTransactions().length === 0">
                <td colspan="8" class="py-16 text-center text-slate-400">
                  <app-icon name="mail" [size]="32" className="mx-auto mb-2 text-slate-300"></app-icon>
                  <p class="font-bold text-slate-700">No Transactional Email Logs</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Dispatched transactional emails and SES delivery webhooks will appear here.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inspect Payload Modal -->
      <div *ngIf="selectedTx" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase">Transaction Inspector</h3>
              <p class="text-[11px] text-indigo-600 font-mono font-bold">{{ selectedTx.transactionId }}</p>
            </div>
            <button (click)="selectedTx = null" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 text-xs font-mono">
            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span class="text-slate-400 text-[10px] block">Provider / Message ID:</span>
                <span class="font-bold text-slate-800">{{ selectedTx.providerName }} ({{ selectedTx.providerMessageId || 'N/A' }})</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Delivery Status:</span>
                <span class="font-bold text-emerald-700">{{ selectedTx.status }}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Recipient (To):</span>
                <span class="font-bold text-slate-800">{{ selectedTx.toEmail }}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Sender (From):</span>
                <span class="font-bold text-slate-800">{{ selectedTx.fromName }} &lt;{{ selectedTx.fromEmail }}&gt;</span>
              </div>
            </div>

            <!-- Subject -->
            <div>
              <span class="font-bold text-slate-700 text-[11px] block mb-1 font-sans">Email Subject:</span>
              <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-sans font-semibold text-slate-800">
                {{ selectedTx.subject }}
              </div>
            </div>

            <!-- Rendered HTML Snapshot -->
            <div *ngIf="selectedTx.renderedHtml">
              <span class="font-bold text-slate-700 text-[11px] block mb-1 font-sans">Rendered Body Snapshot:</span>
              <div class="p-4 bg-white rounded-lg border border-slate-200 max-h-60 overflow-y-auto font-sans" [innerHTML]="selectedTx.renderedHtml"></div>
            </div>

            <!-- Error or Bounce Details if any -->
            <div *ngIf="selectedTx.errorMessage || selectedTx.bounceType" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
              <span class="font-bold">Failure / Bounce Metadata:</span>
              <p class="text-[11px]">{{ selectedTx.errorMessage || selectedTx.bounceType }} ({{ selectedTx.bounceSubType || 'Permanent' }})</p>
            </div>
          </div>

          <div class="flex items-center justify-end pt-2 border-t border-slate-100">
            <button (click)="selectedTx = null" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200">
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmailLogsComponent implements OnInit {
  dataService = inject(DataService);
  searchQuery = '';
  selectedStatus = 'ALL';
  selectedTx: EmailTransaction | null = null;

  filterTabs = [
    { key: 'ALL', label: 'All Logs' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'BOUNCED', label: 'Bounced' },
    { key: 'COMPLAINT', label: 'Complaints' },
    { key: 'FAILED', label: 'Failed' }
  ];

  ngOnInit() {
    this.dataService.fetchEmailTransactions();
  }

  filteredTransactions() {
    return this.dataService.emailTransactions().filter(tx => {
      const matchStatus = this.selectedStatus === 'ALL' || tx.status === this.selectedStatus;
      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q || tx.transactionId.toLowerCase().includes(q) || tx.toEmail.toLowerCase().includes(q) || tx.subject.toLowerCase().includes(q) || tx.userName.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SUBMITTED':
      case 'PENDING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'BOUNCED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'COMPLAINT':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  openInspect(tx: EmailTransaction) {
    this.selectedTx = tx;
  }
}
