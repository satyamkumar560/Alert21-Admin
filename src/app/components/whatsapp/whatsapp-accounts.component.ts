import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { WhatsappAccount, WhatsappConnectionStatus } from '../../models/alert21.models';

@Component({
  selector: 'app-whatsapp-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Connected Accounts & WABAs</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Cross-tenant Meta Business Accounts, WABA IDs, user ownership mapping, and connection lifecycle status.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="refresh()" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Sync All</span>
          </button>
        </div>
      </div>

      <!-- Filters & Controls Bar -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Search -->
          <div class="relative w-full sm:w-72">
            <app-icon name="search" [size]="14" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (input)="onSearch()"
              placeholder="Search user, WABA ID, Business ID..." 
              class="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all">
          </div>

          <!-- Status Filter -->
          <select 
            [(ngModel)]="selectedStatus" 
            (change)="onFilterChange()"
            class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Statuses</option>
            <option value="CONNECTED">Connected</option>
            <option value="ACTION_REQUIRED">Action Required</option>
            <option value="TOKEN_EXPIRED">Token Expired</option>
            <option value="DISCONNECTED">Disconnected</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div class="text-xs font-bold text-slate-500">
          Showing <span class="text-slate-900 font-black">{{ accountsList().length }}</span> WABAs
        </div>
      </div>

      <!-- Accounts Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">User Account (Tenant)</th>
                <th class="py-3 px-4">Meta Business ID</th>
                <th class="py-3 px-4">WABA ID / Name</th>
                <th class="py-3 px-4 text-center">Numbers</th>
                <th class="py-3 px-4 text-center">Templates</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Connected Date</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              <tr *ngFor="let a of accountsList()" class="hover:bg-slate-50/60 transition-all">
                <!-- User Account -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900">{{ a.userName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">{{ a.userEmail }}</div>
                </td>

                <!-- Meta Business ID -->
                <td class="py-3.5 px-4 font-mono font-bold text-indigo-600 text-[11px]">
                  {{ a.metaBusinessId }}
                </td>

                <!-- WABA ID & Name -->
                <td class="py-3.5 px-4">
                  <div class="font-mono font-bold text-slate-900 text-[11px]">{{ a.wabaId }}</div>
                  <div class="text-[10px] text-slate-400 font-sans" *ngIf="a.wabaName">{{ a.wabaName }}</div>
                </td>

                <!-- Numbers -->
                <td class="py-3.5 px-4 text-center">
                  <span class="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold text-[11px]">
                    {{ a.phoneNumbersCount ?? 0 }}
                  </span>
                </td>

                <!-- Templates -->
                <td class="py-3.5 px-4 text-center">
                  <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-[11px]">
                    {{ a.templatesCount ?? 0 }}
                  </span>
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': a.connectionStatus === 'CONNECTED',
                          'bg-amber-50 text-amber-700 border border-amber-200': a.connectionStatus === 'ACTION_REQUIRED',
                          'bg-rose-50 text-rose-700 border border-rose-200': a.connectionStatus === 'FAILED' || a.connectionStatus === 'TOKEN_EXPIRED',
                          'bg-slate-100 text-slate-600': a.connectionStatus === 'DISCONNECTED' || a.connectionStatus === 'SUSPENDED'
                        }">
                    {{ a.connectionStatus }}
                  </span>
                </td>

                <!-- Connected Date -->
                <td class="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                  {{ a.connectedAt | date:'mediumDate' }}
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      (click)="syncAccount(a)" 
                      [disabled]="syncingId === a.id"
                      class="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-all"
                      title="Refresh status from Meta">
                      {{ syncingId === a.id ? 'Syncing...' : 'Sync Meta' }}
                    </button>

                    <button 
                      (click)="openStatusModal(a)" 
                      class="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                      title="Manage Status">
                      <app-icon name="more-horizontal" [size]="15"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="accountsList().length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  <app-icon name="server" [size]="32" className="mx-auto mb-2 text-slate-300"></app-icon>
                  <p class="font-bold text-sm text-slate-600">No WABA accounts found</p>
                  <p class="text-xs text-slate-400 mt-0.5">Users who complete Meta Embedded Signup will appear here.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Manage Status Modal -->
      <div *ngIf="selectedAccount" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">Manage WABA Connection</h3>
            <button (click)="closeStatusModal()" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase">Tenant User</label>
              <div class="font-bold text-slate-900">{{ selectedAccount.userName }} ({{ selectedAccount.userEmail }})</div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase">WABA ID</label>
              <div class="font-mono font-bold text-slate-800">{{ selectedAccount.wabaId }}</div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Update Status</label>
              <select [(ngModel)]="modalStatus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                <option value="CONNECTED">CONNECTED (Active & Usable)</option>
                <option value="ACTION_REQUIRED">ACTION_REQUIRED (Requires Meta Verification)</option>
                <option value="SUSPENDED">SUSPENDED (Disabled by Admin)</option>
                <option value="DISCONNECTED">DISCONNECTED (Revoked)</option>
                <option value="FAILED">FAILED (Setup Failed)</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="closeStatusModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="saveStatusChange()" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              Apply Status
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WhatsappAccountsComponent implements OnInit {
  dataService = inject(DataService);

  searchQuery = '';
  selectedStatus = 'ALL';
  syncingId: string | null = null;
  selectedAccount: WhatsappAccount | null = null;
  modalStatus: WhatsappConnectionStatus = 'CONNECTED';

  ngOnInit() {
    this.refresh();
  }

  accountsList() {
    return this.dataService.whatsappAccounts();
  }

  refresh() {
    this.dataService.fetchWhatsappAccounts(this.selectedStatus, this.searchQuery);
  }

  onFilterChange() {
    this.refresh();
  }

  onSearch() {
    this.refresh();
  }

  async syncAccount(a: WhatsappAccount) {
    this.syncingId = a.id;
    await this.dataService.syncWhatsappAccount(a.id);
    this.syncingId = null;
  }

  openStatusModal(a: WhatsappAccount) {
    this.selectedAccount = a;
    this.modalStatus = a.connectionStatus;
  }

  closeStatusModal() {
    this.selectedAccount = null;
  }

  async saveStatusChange() {
    if (!this.selectedAccount) return;
    await this.dataService.updateWhatsappAccountStatus(this.selectedAccount.id, this.modalStatus);
    this.closeStatusModal();
  }
}
