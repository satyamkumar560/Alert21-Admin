import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { AlertUser, UserStatus } from '../../models/alert21.models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title Far Left & Compact Filters Shifted Left with Generous Right Margin -->
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px;">
        <!-- Title Aligned Far Left -->
        <div style="text-align: left;">
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
          <p class="text-xs text-slate-500 font-medium">View accounts, status controls, DLT hierarchy, and user-wise provider routing.</p>
        </div>

        <!-- Filters Shifted Left with Explicit 28px Right Margin -->
        <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end; margin-right: 28px;">
          <!-- Compact Search Box (160px) -->
          <div class="relative" style="width: 160px;">
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
          
          <!-- Compact Status Dropdown (110px) -->
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
                <td colspan="7" class="text-center py-8 text-slate-400 font-medium text-xs">
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

          <div class="flex items-center gap-2">
            <span class="text-slate-500 font-medium">Rows per page:</span>
            <select 
              [(ngModel)]="pageSize" 
              (change)="currentPage = 1"
              class="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 text-xs font-semibold focus:outline-none focus:border-indigo-600">
              <option [ngValue]="5">5</option>
              <option [ngValue]="10">10</option>
              <option [ngValue]="20">20</option>
              <option [ngValue]="50">50</option>
            </select>
          </div>

          <div class="flex items-center gap-1">
            <button 
              [disabled]="currentPage === 1" 
              (click)="currentPage = currentPage - 1"
              class="btn btn-outline btn-sm text-xs px-2.5 py-1">
              ‹ Prev
            </button>

            <button 
              *ngFor="let p of pagesArray()" 
              (click)="currentPage = p"
              [class.bg-indigo-600]="currentPage === p"
              [class.text-white]="currentPage === p"
              [class.font-bold]="currentPage === p"
              [class.bg-slate-100]="currentPage !== p"
              [class.text-slate-700]="currentPage !== p"
              class="w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all">
              {{ p }}
            </button>

            <button 
              [disabled]="currentPage >= totalPages" 
              (click)="currentPage = currentPage + 1"
              class="btn btn-outline btn-sm text-xs px-2.5 py-1">
              Next ›
            </button>
          </div>
        </div>
      </div>

      <!-- User DLT Hierarchy Modal -->
      <div *ngIf="selectedHierarchyUser" class="modal-backdrop" (click)="closeDltHierarchy()">
        <div class="modal-card p-6 border border-slate-200 max-w-3xl bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
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
export class UsersComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);

  searchQuery = '';
  statusFilter = 'ALL';

  currentPage = 1;
  pageSize = 5;

  selectedHierarchyUser: AlertUser | null = null;
  selectedAssignUser: AlertUser | null = null;

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

  changeUserStatus(user: AlertUser, newStatus: string) {
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    this.dataService.updateUserStatus(user.id, newStatus as UserStatus, adminName);
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
}
