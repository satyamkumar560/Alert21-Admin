import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { WhatsappTransaction } from '../../models/alert21.models';

@Component({
  selector: 'app-whatsapp-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">WhatsApp Message Logs & Transactions</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            End-to-end telemetry snapshots, Meta message IDs (wamid), DLR statuses, and credit consumption records.
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
              (input)="refresh()"
              placeholder="Search recipient, Tx ID, wamid..." 
              class="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all">
          </div>

          <!-- Status Filter -->
          <select 
            [(ngModel)]="selectedStatus" 
            (change)="refresh()"
            class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Statuses</option>
            <option value="SENT">Sent / Submitted</option>
            <option value="DELIVERED">Delivered</option>
            <option value="READ">Read</option>
            <option value="FAILED">Failed</option>
          </select>

          <!-- Direction Filter -->
          <select 
            [(ngModel)]="selectedDirection" 
            (change)="refresh()"
            class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Directions</option>
            <option value="OUTBOUND">Outbound</option>
            <option value="INBOUND">Inbound Replies</option>
          </select>
        </div>

        <div class="text-xs font-bold text-slate-500">
          Total Logs: <span class="text-slate-900 font-black">{{ transactionsList().length }}</span>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">Transaction & Meta ID</th>
                <th class="py-3 px-4">User (Tenant)</th>
                <th class="py-3 px-4">Recipient</th>
                <th class="py-3 px-4">Direction / Source</th>
                <th class="py-3 px-4">Template / Category</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Cost / Debit</th>
                <th class="py-3 px-4">Timestamp</th>
                <th class="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              <tr *ngFor="let tx of transactionsList()" class="hover:bg-slate-50/60 transition-all">
                <!-- Transaction ID & Wamid -->
                <td class="py-3.5 px-4">
                  <div class="font-mono font-bold text-slate-900 text-[11px]">{{ tx.transactionId }}</div>
                  <div class="text-[10px] text-indigo-600 font-mono truncate max-w-[140px]" [title]="tx.metaMessageId" *ngIf="tx.metaMessageId">
                    wamid: {{ tx.metaMessageId }}
                  </div>
                </td>

                <!-- User -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900">{{ tx.userName }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ tx.userEmail }}</div>
                </td>

                <!-- Recipient -->
                <td class="py-3.5 px-4 font-mono font-bold text-slate-800 text-[12px]">
                  {{ tx.recipient }}
                </td>

                <!-- Direction & Source -->
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                        [ngClass]="tx.direction === 'OUTBOUND' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'">
                    {{ tx.direction }}
                  </span>
                  <span class="text-[10px] text-slate-400 ml-1.5 font-bold">{{ tx.source }}</span>
                </td>

                <!-- Template -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-800">{{ tx.templateName || 'Direct / Flow' }}</div>
                  <span class="text-[10px] text-slate-400 uppercase font-mono">{{ tx.templateCategory }}</span>
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': tx.status === 'DELIVERED',
                          'bg-blue-50 text-blue-700 border border-blue-200': tx.status === 'READ',
                          'bg-amber-50 text-amber-700 border border-amber-200': tx.status === 'SENT' || tx.status === 'SUBMITTED',
                          'bg-rose-50 text-rose-700 border border-rose-200': tx.status === 'FAILED'
                        }">
                    {{ tx.status }}
                  </span>
                  <div *ngIf="tx.errorMessage" class="text-[10px] text-rose-600 font-medium truncate max-w-[120px]" [title]="tx.errorMessage">
                    {{ tx.errorMessage }}
                  </div>
                </td>

                <!-- Cost / Debit -->
                <td class="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-800">
                  -{{ tx.creditDebit }} cr
                </td>

                <!-- Timestamp -->
                <td class="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                  {{ tx.createdAt | date:'short' }}
                </td>

                <!-- Details -->
                <td class="py-3.5 px-4 text-right">
                  <button 
                    (click)="openInspectModal(tx)" 
                    class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-all">
                    Inspect
                  </button>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="transactionsList().length === 0">
                <td colspan="9" class="py-12 text-center text-slate-400">
                  <app-icon name="activity" [size]="32" className="mx-auto mb-2 text-slate-300"></app-icon>
                  <p class="font-bold text-sm text-slate-600">No message transactions found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Transaction Inspect Modal -->
      <div *ngIf="inspectTx" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">Message Audit Snapshot</h3>
            <button (click)="closeInspectModal()" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-400">Tx ID:</span>
                <span class="text-cyan-400 font-bold">{{ inspectTx.transactionId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Meta Message ID:</span>
                <span class="text-indigo-400 font-bold truncate max-w-xs">{{ inspectTx.metaMessageId || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Recipient:</span>
                <span class="text-emerald-400 font-bold">{{ inspectTx.recipient }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Status:</span>
                <span class="text-amber-400 font-bold">{{ inspectTx.status }}</span>
              </div>
            </div>

            <div *ngIf="inspectTx.errorMessage" class="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800">
              <div class="font-bold text-[11px] uppercase">Failure Reason</div>
              <div class="mt-0.5 font-mono text-[11px]">{{ inspectTx.errorMessage }}</div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
              <div>
                <span class="text-slate-400 text-[10px] font-bold uppercase">Sent At</span>
                <div class="font-mono text-slate-800">{{ inspectTx.sentAt ? (inspectTx.sentAt | date:'medium') : (inspectTx.createdAt | date:'medium') }}</div>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] font-bold uppercase">Delivered At</span>
                <div class="font-mono text-slate-800">{{ inspectTx.deliveredAt ? (inspectTx.deliveredAt | date:'medium') : 'Pending DLR' }}</div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end pt-3 border-t border-slate-100">
            <button (click)="closeInspectModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WhatsappLogsComponent implements OnInit {
  dataService = inject(DataService);

  searchQuery = '';
  selectedStatus = 'ALL';
  selectedDirection = 'ALL';
  inspectTx: WhatsappTransaction | null = null;

  ngOnInit() {
    this.refresh();
  }

  transactionsList() {
    return this.dataService.whatsappTransactions();
  }

  refresh() {
    this.dataService.fetchWhatsappTransactions(this.selectedStatus, this.selectedDirection, this.searchQuery);
  }

  openInspectModal(tx: WhatsappTransaction) {
    this.inspectTx = tx;
  }

  closeInspectModal() {
    this.inspectTx = null;
  }
}
