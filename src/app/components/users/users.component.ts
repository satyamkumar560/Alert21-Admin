import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { AlertUser, UserStatus, SmsLedgerEntry } from '../../models/alert21.models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title Far Left & Compact Filters -->
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px;">
        <div style="text-align: left;">
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
          <p class="text-xs text-slate-500 font-medium">View accounts, SMS balance credits/debits, DLT hierarchy, and user-wise provider routing.</p>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end; margin-right: 28px;">
          <!-- Compact Search Box -->
          <div class="relative" style="width: 180px;">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (ngModelChange)="currentPage = 1"
              placeholder="Search users..." 
              class="form-control search-input text-xs py-1.5">
            <div class="absolute left-2.5 top-2 text-slate-400 pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
          
          <!-- Compact Status Dropdown -->
          <select [(ngModel)]="statusFilter" (change)="currentPage = 1" class="form-control text-xs font-semibold" style="width: 110px; padding-top: 0.375rem; padding-bottom: 0.375rem;">
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </div>
      </div>

      <!-- Main Users White Card -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <!-- Users Table -->
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Name / Company</th>
                <th>Contact Information</th>
                <th>SMS Balance</th>
                <th>Registration Date</th>
                <th>Assigned Provider</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of paginatedUsers()">
                <td>
                  <span class="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">
                    {{ user.accountId }}
                  </span>
                </td>
                <td>
                  <div class="font-extrabold text-slate-900 text-sm whitespace-nowrap">{{ user.name }}</div>
                  <div class="text-xs text-slate-500 font-medium whitespace-nowrap">{{ user.company }}</div>
                </td>
                <td>
                  <div class="text-xs font-semibold text-slate-800 whitespace-nowrap">{{ user.email }}</div>
                  <div class="text-xs font-mono text-slate-500 whitespace-nowrap">{{ user.mobile }}</div>
                </td>
                <td>
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-black text-xs">
                    <span>{{ user.smsBalance ?? 0 | number }}</span>
                    <span class="text-[9px] uppercase font-bold text-indigo-500">SMS</span>
                  </div>
                </td>
                <td>
                  <span class="text-xs text-slate-600 font-mono font-medium whitespace-nowrap">{{ user.registeredAt | date:'mediumDate' }}</span>
                </td>
                <td>
                  <span *ngIf="user.assignedProviderId" class="badge badge-primary font-mono text-[10px]">
                    {{ user.assignedProviderId }}
                  </span>
                  <span *ngIf="!user.assignedProviderId" class="badge badge-suspended text-[10px]">
                    GLOBAL DEFAULT
                  </span>
                </td>
                <td>
                  <span [class]="getStatusBadgeClass(user.status)">
                    <span class="dot"></span>
                    {{ user.status }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-2 whitespace-nowrap">
                    <!-- View Account (Impersonate Read-Only Mode) -->
                    <button 
                      (click)="viewAsUser(user)" 
                      title="View User Portal Modules (Read-Only Mode)" 
                      class="px-3 py-1.5 rounded-lg text-[11px] font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition-all">
                      <app-icon name="eye" [size]="13"></app-icon>
                      <span>View Account</span>
                    </button>

                    <!-- SMS Balance & Ledger Button -->
                    <button 
                      (click)="openBalanceModal(user)" 
                      title="Manage SMS Balance & Ledger" 
                      class="btn btn-primary btn-sm text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700">
                      <app-icon name="credit-card" [size]="13"></app-icon>
                      <span>SMS Balance</span>
                    </button>

                    <!-- DLT Hierarchy Button -->
                    <button 
                      (click)="openDltHierarchy(user)" 
                      title="View DLT Hierarchy Tree" 
                      class="btn btn-outline btn-sm text-[11px] font-semibold">
                      <app-icon name="shield-check" [size]="13" className="text-indigo-600"></app-icon>
                      <span>DLT Hierarchy</span>
                    </button>

                    <!-- Assign Provider Button -->
                    <button 
                      (click)="openAssignProvider(user)" 
                      title="Assign SMS Gateway Provider" 
                      class="btn btn-outline btn-sm text-[11px] font-semibold">
                      <app-icon name="route" [size]="13" className="text-purple-600"></app-icon>
                      <span>Assign Provider</span>
                    </button>

                    <!-- Change Status Dropdown -->
                    <select 
                      #statusSelect 
                      (change)="changeUserStatus(user, statusSelect.value)" 
                      [value]="user.status" 
                      class="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-600 font-semibold shadow-xs">
                      <option value="ACTIVE">Activate</option>
                      <option value="INACTIVE">Inactivate</option>
                      <option value="SUSPENDED">Suspend</option>
                      <option value="BLOCKED">Block</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredUsers().length === 0">
                <td colspan="8" class="text-center py-8 text-slate-400 font-medium text-xs">
                  No user accounts match your filter criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls Bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          <div class="text-slate-500 font-medium">
            Showing <strong class="text-slate-900">{{ startIndex + 1 }}</strong> to 
            <strong class="text-slate-900">{{ endIndex }}</strong> of 
            <strong class="text-slate-900">{{ filteredUsers().length }}</strong> entries
          </div>

          <div class="flex items-center gap-1">
            <button 
              [disabled]="currentPage === 1" 
              (click)="currentPage = currentPage - 1"
              class="px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none">
              Previous
            </button>
            <button 
              *ngFor="let page of pagesArray()" 
              (click)="currentPage = page"
              [class]="page === currentPage ? 'bg-indigo-600 text-white font-bold' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'"
              class="w-8 h-8 rounded-lg text-xs flex items-center justify-center">
              {{ page }}
            </button>
            <button 
              [disabled]="currentPage === totalPages" 
              (click)="currentPage = currentPage + 1"
              class="px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- SMS Balance & Ledger Modal (Task #05 Requirement) -->
      <div *ngIf="selectedBalanceUser" class="modal-backdrop" (click)="closeBalanceModal()">
        <div class="modal-card p-6 border border-slate-200 max-w-2xl bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <app-icon name="credit-card" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900">SMS Balance Management</h3>
                <p class="text-xs text-slate-500 font-medium">{{ selectedBalanceUser.name }} ({{ selectedBalanceUser.email }})</p>
              </div>
            </div>
            <button (click)="closeBalanceModal()" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Current Balance Highlight -->
          <div class="py-4 bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between my-3">
            <div>
              <p class="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Available SMS Balance</p>
              <h2 class="text-3xl font-black text-white font-mono mt-0.5">{{ selectedBalanceUser.smsBalance ?? 0 | number }} <span class="text-sm text-indigo-400">Credits</span></h2>
            </div>
            <div class="text-right text-xs text-slate-400 font-medium">
              <p>Account ID: <span class="text-white font-mono font-bold">{{ selectedBalanceUser.accountId }}</span></p>
              <p>Status: <span class="text-emerald-400 font-bold">{{ selectedBalanceUser.status }}</span></p>
            </div>
          </div>

          <!-- Tabs: Credit SMS | Debit SMS | Ledger History -->
          <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button 
              (click)="activeBalanceTab = 'CREDIT'"
              [class]="activeBalanceTab === 'CREDIT' ? 'bg-emerald-600 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
              class="px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5">
              <app-icon name="plus" [size]="13"></app-icon>
              <span>Credit SMS</span>
            </button>

            <button 
              (click)="activeBalanceTab = 'DEBIT'"
              [class]="activeBalanceTab === 'DEBIT' ? 'bg-rose-600 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
              class="px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5">
              <app-icon name="minus" [size]="13"></app-icon>
              <span>Debit SMS</span>
            </button>

            <button 
              (click)="activeBalanceTab = 'LEDGER'"
              [class]="activeBalanceTab === 'LEDGER' ? 'bg-indigo-600 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
              class="px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ml-auto">
              <app-icon name="file-text" [size]="13"></app-icon>
              <span>Balance Ledger History</span>
            </button>
          </div>

          <!-- Tab Content 1: Credit SMS -->
          <div *ngIf="activeBalanceTab === 'CREDIT'" class="py-4 space-y-4 font-sans">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">SMS Quantity to Credit: <span class="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  [(ngModel)]="creditQuantity" 
                  min="1" 
                  placeholder="e.g. 5000" 
                  class="form-control text-xs font-mono font-bold text-emerald-600">
              </div>

              <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
                <div class="flex justify-between text-emerald-800">
                  <span>Balance Before:</span>
                  <span class="font-mono font-bold">{{ selectedBalanceUser.smsBalance ?? 0 | number }}</span>
                </div>
                <div class="flex justify-between text-emerald-900 font-extrabold">
                  <span>Balance After:</span>
                  <span class="font-mono">{{ (selectedBalanceUser.smsBalance ?? 0) + (creditQuantity || 0) | number }}</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Remarks (Mandatory for Audit Trail): <span class="text-rose-500">*</span></label>
              <textarea 
                [(ngModel)]="creditRemarks" 
                rows="2" 
                placeholder="e.g. Approved promotional campaign credits as per ticket #8942" 
                class="form-control text-xs font-sans">
              </textarea>
            </div>

            <div *ngIf="actionError" class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {{ actionError }}
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button (click)="closeBalanceModal()" class="btn btn-outline btn-sm">Cancel</button>
              <button (click)="submitCredit()" [disabled]="isSubmittingBalance" class="btn btn-primary btn-sm bg-emerald-600 hover:bg-emerald-700 border-emerald-600">
                {{ isSubmittingBalance ? 'Processing...' : 'Confirm & Credit SMS' }}
              </button>
            </div>
          </div>

          <!-- Tab Content 2: Debit SMS -->
          <div *ngIf="activeBalanceTab === 'DEBIT'" class="py-4 space-y-4 font-sans">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">SMS Quantity to Debit: <span class="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  [(ngModel)]="debitQuantity" 
                  min="1" 
                  [max]="selectedBalanceUser.smsBalance ?? 0"
                  placeholder="e.g. 1000" 
                  class="form-control text-xs font-mono font-bold text-rose-600">
              </div>

              <div class="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs space-y-1">
                <div class="flex justify-between text-rose-800">
                  <span>Balance Before:</span>
                  <span class="font-mono font-bold">{{ selectedBalanceUser.smsBalance ?? 0 | number }}</span>
                </div>
                <div class="flex justify-between text-rose-900 font-extrabold">
                  <span>Balance After:</span>
                  <span class="font-mono">{{ Math.max(0, (selectedBalanceUser.smsBalance ?? 0) - (debitQuantity || 0)) | number }}</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Remarks (Mandatory for Audit Trail): <span class="text-rose-500">*</span></label>
              <textarea 
                [(ngModel)]="debitRemarks" 
                rows="2" 
                placeholder="e.g. Balance adjustment / refund deduction" 
                class="form-control text-xs font-sans">
              </textarea>
            </div>

            <div *ngIf="actionError" class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {{ actionError }}
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button (click)="closeBalanceModal()" class="btn btn-outline btn-sm">Cancel</button>
              <button (click)="submitDebit()" [disabled]="isSubmittingBalance" class="btn btn-primary btn-sm bg-rose-600 hover:bg-rose-700 border-rose-600">
                {{ isSubmittingBalance ? 'Processing...' : 'Confirm & Debit SMS' }}
              </button>
            </div>
          </div>

          <!-- Tab Content 3: Balance Ledger History -->
          <div *ngIf="activeBalanceTab === 'LEDGER'" class="py-4 space-y-3 font-sans">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Historical Transactions</h4>
              <button (click)="loadLedger(selectedBalanceUser.id)" class="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                <app-icon name="rotate-cw" [size]="12"></app-icon>
                <span>Refresh Ledger</span>
              </button>
            </div>

            <div class="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500">
                    <th class="py-2.5 px-3">Date</th>
                    <th class="py-2.5 px-3">Type</th>
                    <th class="py-2.5 px-3">SMS Units</th>
                    <th class="py-2.5 px-3">Before &rarr; After</th>
                    <th class="py-2.5 px-3">Remarks / Done By</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-[11px] font-medium text-slate-700">
                  <tr *ngFor="let entry of userLedgerList" class="hover:bg-slate-50">
                    <td class="py-2.5 px-3 font-mono text-slate-400">{{ entry.createdAt | date:'short' }}</td>
                    <td class="py-2.5 px-3">
                      <span [class]="getLedgerBadgeClass(entry.type)" class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                        {{ entry.type }}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 font-mono font-bold" [class]="entry.type.includes('CREDIT') ? 'text-emerald-600' : 'text-rose-600'">
                      {{ entry.type.includes('CREDIT') ? '+' : '-' }}{{ entry.smsQuantity | number }}
                    </td>
                    <td class="py-2.5 px-3 font-mono text-slate-500">
                      {{ entry.balanceBefore | number }} &rarr; <strong class="text-slate-900">{{ entry.balanceAfter | number }}</strong>
                    </td>
                    <td class="py-2.5 px-3">
                      <span class="block text-slate-800">{{ entry.remarks || 'N/A' }}</span>
                      <span class="text-[10px] text-slate-400 font-mono">By: {{ entry.createdBy }}</span>
                    </td>
                  </tr>
                  <tr *ngIf="userLedgerList.length === 0">
                    <td colspan="5" class="py-6 text-center text-slate-400 italic">No ledger transactions found for this user.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-end pt-2">
              <button (click)="closeBalanceModal()" class="btn btn-outline btn-sm">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- DLT Hierarchy Modal -->
      <div *ngIf="selectedHierarchyUser" class="modal-backdrop" (click)="closeDltHierarchy()">
        <div class="modal-card p-6 border border-slate-200 max-w-2xl bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <app-icon name="shield-check" [size]="20" className="text-indigo-600"></app-icon>
                <span>DLT Hierarchy Tree</span>
              </h3>
              <p class="text-xs text-slate-500">User: <strong class="text-slate-900">{{ selectedHierarchyUser.name }}</strong> ({{ selectedHierarchyUser.accountId }})</p>
            </div>
            <button (click)="closeDltHierarchy()" class="btn btn-outline btn-sm">Close</button>
          </div>

          <div class="py-4 space-y-4">
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="font-extrabold text-indigo-700 text-sm flex items-center gap-2">
                <app-icon name="users" [size]="16"></app-icon>
                <span>User: {{ selectedHierarchyUser.name }} ({{ selectedHierarchyUser.company }})</span>
              </div>

              <div class="tree-node space-y-3 mt-3">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Principal Entity IDs (PE)</p>

                <div *ngFor="let pe of getUserPes(selectedHierarchyUser.id)" class="bg-white p-3 rounded-lg border border-slate-200">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-indigo-600 font-bold text-xs">{{ pe.peId }}</span>
                    <span [class]="getStatusBadgeClass(pe.status)">{{ pe.status }}</span>
                  </div>
                  <p class="text-xs text-slate-800 font-bold mt-1">{{ pe.entityName }}</p>

                  <div class="tree-node space-y-2 mt-2">
                    <p class="text-[11px] font-bold text-slate-500 uppercase">Sender Headers</p>

                    <div *ngFor="let snd of getUserSenders(pe.peId)" class="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <div class="flex items-center justify-between">
                        <span class="font-mono text-emerald-600 font-bold text-xs">{{ snd.senderHeader }}</span>
                        <span class="text-[10px] text-slate-500 font-bold uppercase">{{ snd.headerType }}</span>
                      </div>

                      <div class="tree-node space-y-1.5 mt-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase">Content Templates</p>

                        <div *ngFor="let tpl of getUserTemplates(snd.senderHeader)" class="bg-white p-2.5 rounded border border-slate-200 text-xs">
                          <div class="flex items-center justify-between font-mono text-[11px]">
                            <span class="text-indigo-700 font-bold">{{ tpl.templateName }}</span>
                            <span class="text-slate-500">ID: {{ tpl.templateId }}</span>
                          </div>
                          <p class="text-[11px] text-slate-700 font-mono mt-1 bg-slate-50 p-2 rounded border border-slate-100">{{ tpl.templateContent }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex justify-end">
            <button (click)="closeDltHierarchy()" class="btn btn-primary btn-sm">Done</button>
          </div>
        </div>
      </div>

      <!-- Assign Provider Modal -->
      <div *ngIf="selectedAssignUser" class="modal-backdrop" (click)="closeAssignProvider()">
        <div class="modal-card p-6 border border-slate-200 bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="pb-4 border-b border-slate-100">
            <h3 class="text-lg font-extrabold text-slate-900">Assign SMS Gateway Provider</h3>
            <p class="text-xs text-slate-500">User-wise provider routing override for {{ selectedAssignUser.name }}.</p>
          </div>

          <div class="py-4 space-y-4">
            <div class="form-group">
              <label class="form-label">Select SMS Provider:</label>
              <select #provSelect class="form-control text-xs font-semibold" [value]="selectedAssignUser.assignedProviderId || ''">
                <option value="">-- Use Global Default Provider (MSG24) --</option>
                <option *ngFor="let prov of dataService.smsProviders()" [value]="prov.id">
                  {{ prov.name }} ({{ prov.code }}) - Status: {{ prov.status }}
                </option>
              </select>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
              <p class="font-bold text-slate-900">Routing Rule Behavior:</p>
              <p class="mt-1">If a specific provider is assigned, all SMS requests from this user will route via that provider. Switching providers does not require DLT master re-verification.</p>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="closeAssignProvider()" class="btn btn-outline btn-sm">Cancel</button>
            <button (click)="saveAssignedProvider(selectedAssignUser, provSelect.value)" class="btn btn-primary btn-sm">
              Save Provider Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);
  Math = Math;

  searchQuery = '';
  statusFilter = 'ALL';

  currentPage = 1;
  pageSize = 10;

  selectedHierarchyUser: AlertUser | null = null;
  selectedAssignUser: AlertUser | null = null;

  // Balance & Ledger Modal state
  selectedBalanceUser: AlertUser | null = null;
  activeBalanceTab: 'CREDIT' | 'DEBIT' | 'LEDGER' = 'CREDIT';
  creditQuantity: number | null = null;
  creditRemarks = '';
  debitQuantity: number | null = null;
  debitRemarks = '';
  actionError = '';
  isSubmittingBalance = false;
  userLedgerList: SmsLedgerEntry[] = [];

  async ngOnInit() {
    await this.dataService.fetchLiveUsers();
  }

  filteredUsers() {
    return this.dataService.users().filter(u => {
      const q = this.searchQuery.toLowerCase();
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.company.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.accountId.toLowerCase().includes(q);
      const matchesStatus = this.statusFilter === 'ALL' || u.status === this.statusFilter;
      return matchesQuery && matchesStatus;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize));
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredUsers().length);
  }

  paginatedUsers() {
    return this.filteredUsers().slice(this.startIndex, this.endIndex);
  }

  pagesArray(): number[] {
    const total = this.totalPages;
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStatusBadgeClass(status: string) {
    switch (status) {
      case 'ACTIVE': return 'badge badge-active';
      case 'INACTIVE': return 'badge badge-inactive';
      case 'SUSPENDED': return 'badge badge-suspended';
      case 'BLOCKED': return 'badge badge-blocked';
      default: return 'badge badge-suspended';
    }
  }

  getLedgerBadgeClass(type: string) {
    if (type.includes('CREDIT')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (type.includes('DEBIT')) return 'bg-rose-50 text-rose-700 border border-rose-200';
    return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
  }

  changeUserStatus(user: AlertUser, newStatus: string) {
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    this.dataService.updateUserStatus(user.id, newStatus as UserStatus, adminName);
  }

  openBalanceModal(user: AlertUser) {
    this.selectedBalanceUser = user;
    this.activeBalanceTab = 'CREDIT';
    this.creditQuantity = null;
    this.creditRemarks = '';
    this.debitQuantity = null;
    this.debitRemarks = '';
    this.actionError = '';
    this.loadLedger(user.id);
  }

  closeBalanceModal() {
    this.selectedBalanceUser = null;
    this.actionError = '';
  }

  async loadLedger(userId: string) {
    this.userLedgerList = await this.dataService.fetchUserSmsLedger(userId);
  }

  async submitCredit() {
    if (!this.selectedBalanceUser) return;
    if (!this.creditQuantity || this.creditQuantity <= 0) {
      this.actionError = 'Please enter a valid positive SMS quantity.';
      return;
    }
    if (!this.creditRemarks.trim()) {
      this.actionError = 'Remarks are mandatory for manual credit audit trail.';
      return;
    }

    this.isSubmittingBalance = true;
    this.actionError = '';
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    const success = await this.dataService.creditUserSms(
      this.selectedBalanceUser.id,
      this.creditQuantity,
      this.creditRemarks,
      adminName
    );

    this.isSubmittingBalance = false;
    if (success) {
      this.selectedBalanceUser.smsBalance = (this.selectedBalanceUser.smsBalance ?? 0) + this.creditQuantity;
      this.creditQuantity = null;
      this.creditRemarks = '';
      await this.loadLedger(this.selectedBalanceUser.id);
    }
  }

  async submitDebit() {
    if (!this.selectedBalanceUser) return;
    if (!this.debitQuantity || this.debitQuantity <= 0) {
      this.actionError = 'Please enter a valid positive SMS quantity.';
      return;
    }
    if (this.debitQuantity > (this.selectedBalanceUser.smsBalance ?? 0)) {
      this.actionError = 'Debit quantity cannot exceed current SMS balance.';
      return;
    }
    if (!this.debitRemarks.trim()) {
      this.actionError = 'Remarks are mandatory for manual debit audit trail.';
      return;
    }

    this.isSubmittingBalance = true;
    this.actionError = '';
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    const success = await this.dataService.debitUserSms(
      this.selectedBalanceUser.id,
      this.debitQuantity,
      this.debitRemarks,
      adminName
    );

    this.isSubmittingBalance = false;
    if (success) {
      this.selectedBalanceUser.smsBalance = Math.max(0, (this.selectedBalanceUser.smsBalance ?? 0) - this.debitQuantity);
      this.debitQuantity = null;
      this.debitRemarks = '';
      await this.loadLedger(this.selectedBalanceUser.id);
    }
  }

  openDltHierarchy(user: AlertUser) {
    this.selectedHierarchyUser = user;
  }

  closeDltHierarchy() {
    this.selectedHierarchyUser = null;
  }

  getUserPes(userId: string) {
    return this.dataService.principalEntities().filter(pe => pe.userId === userId);
  }

  getUserSenders(peId: string) {
    return this.dataService.senderIds().filter(s => s.peId === peId);
  }

  getUserTemplates(senderHeader: string) {
    return this.dataService.contentTemplates().filter(t => t.senderHeader === senderHeader);
  }

  openAssignProvider(user: AlertUser) {
    this.selectedAssignUser = user;
  }

  closeAssignProvider() {
    this.selectedAssignUser = null;
  }

  saveAssignedProvider(user: AlertUser, providerId: string) {
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    this.dataService.assignUserProvider(user.id, providerId || undefined, adminName);
    this.closeAssignProvider();
  }

  async viewAsUser(user: AlertUser) {
    const res = await this.dataService.impersonateUser(user.id);
    if (res.success && res.token) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const portalBase = isLocal ? 'http://localhost:4200' : 'https://app.alert21.in';
      const targetUrl = `${portalBase}/#/impersonate?token=${res.token}`;
      window.open(targetUrl, '_blank');
    }
  }
}
