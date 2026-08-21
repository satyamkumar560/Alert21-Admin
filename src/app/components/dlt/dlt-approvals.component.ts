import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { PrincipalEntity, DltStatus } from '../../models/alert21.models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-dlt-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Breadcrumbs -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Principal Entities (PE)</h2>
          <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <span>🏠 Dashboard</span>
            <span>›</span>
            <span>DLT Management</span>
            <span>›</span>
            <span class="text-slate-700 font-bold">Principal Entities</span>
          </div>
        </div>
      </div>

      <!-- Summary Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <app-icon name="shield-check" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Entities</p>
            <h3 class="text-2xl font-black text-slate-900 mt-0.5">{{ dataService.principalEntities().length }}</h3>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <app-icon name="check-circle" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Approved</p>
            <h3 class="text-2xl font-black text-slate-900 mt-0.5">{{ activePeCount }}</h3>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <app-icon name="alert-triangle" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Approval</p>
            <h3 class="text-2xl font-black text-slate-900 mt-0.5">{{ pendingPeCount }}</h3>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div class="relative w-full md:w-96">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search Entity Name, PE ID, Operator..." 
            class="form-control text-xs pl-9 pr-4 py-2.5">
          <div class="absolute left-3 top-3 text-slate-400">
            <app-icon name="layout-dashboard" [size]="14"></app-icon>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Entity / Business Name</th>
                <th>DLT PE ID</th>
                <th>DLT Operator</th>
                <th>Entity Type</th>
                <th>Status</th>
                <th>Date Added</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let pe of filteredPEs()">
                <td>
                  <div class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <app-icon name="shield-check" [size]="16" className="text-indigo-600"></app-icon>
                    <span>{{ pe.entityName }}</span>
                  </div>
                  <div class="text-xs text-slate-500 font-medium pl-6">Owner: {{ pe.userName }}</div>
                </td>
                <td>
                  <span class="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                    {{ pe.peId }}
                  </span>
                </td>
                <td>
                  <span class="text-xs font-bold text-slate-700">{{ pe.dltOperator || 'JIO' }}</span>
                </td>
                <td>
                  <span class="text-xs font-semibold text-slate-600">{{ pe.entityType || 'Private Limited' }}</span>
                </td>
                <td>
                  <span [class]="getBadgeClass(pe.status)">
                    <span class="dot"></span>
                    {{ pe.status }}
                  </span>
                </td>
                <td>
                  <span class="text-xs text-slate-600 font-medium">{{ pe.submittedAt | date:'mediumDate' }}</span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      (click)="openReviewModal(pe)" 
                      title="Update DLT PE Status" 
                      class="btn btn-outline btn-sm font-semibold text-xs">
                      <app-icon name="user-check" [size]="14"></app-icon>
                      <span>Update Status</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredPEs().length === 0">
                <td colspan="7" class="text-center py-8 text-slate-400 font-medium text-xs">
                  No Principal Entities found matching your query.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Status Update Modal -->
      <div *ngIf="selectedItem" class="modal-backdrop" (click)="closeReviewModal()">
        <div class="modal-card p-6 border border-slate-200 bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-extrabold text-slate-900">Update DLT PE Status</h3>
              <p class="text-xs text-slate-500 font-medium">Update Principal Entity verification status.</p>
            </div>
            <button (click)="closeReviewModal()" class="btn btn-outline btn-sm">Close</button>
          </div>

          <div class="py-4 space-y-4">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-slate-500">Entity Name:</span>
                <span class="text-slate-900 font-bold">{{ selectedItem.entityName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">PE ID:</span>
                <span class="text-indigo-600 font-bold">{{ selectedItem.peId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Current Status:</span>
                <span [class]="getBadgeClass(selectedItem.status)">{{ selectedItem.status }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Target Allowed Status:</label>
              <select [(ngModel)]="targetStatus" class="form-control text-xs font-semibold">
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECTED">REJECTED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Admin Verification Remarks:</label>
              <textarea 
                [(ngModel)]="adminRemarks" 
                placeholder="Enter verification notes..." 
                class="form-control text-xs"></textarea>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button (click)="closeReviewModal()" class="btn btn-outline btn-sm">Cancel</button>
            <button 
              [disabled]="isUpdating"
              (click)="applyAction(targetStatus)" 
              class="btn btn-primary btn-sm">
              <span *ngIf="isUpdating" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isUpdating ? 'Updating Status...' : 'Apply Status Update' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DltApprovalsComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);

  searchQuery: string = '';
  selectedItem: PrincipalEntity | null = null;
  adminRemarks: string = '';
  targetStatus: DltStatus = 'ACTIVE';
  isUpdating = false;

  get activePeCount(): number {
    return this.dataService.principalEntities().filter(pe => pe.status === 'ACTIVE').length;
  }

  get pendingPeCount(): number {
    return this.dataService.principalEntities().filter(pe => pe.status === 'PENDING').length;
  }

  filteredPEs() {
    return this.dataService.principalEntities().filter(pe => {
      const q = this.searchQuery.toLowerCase();
      return !q || pe.entityName.toLowerCase().includes(q) || pe.peId.toLowerCase().includes(q) || pe.userName.toLowerCase().includes(q);
    });
  }

  getBadgeClass(status: DltStatus) {
    switch (status) {
      case 'ACTIVE': return 'badge badge-active';
      case 'PENDING': return 'badge badge-pending';
      case 'REJECTED': return 'badge badge-rejected';
      case 'SUSPENDED': return 'badge badge-suspended';
      default: return 'badge badge-suspended';
    }
  }

  openReviewModal(item: PrincipalEntity) {
    this.selectedItem = item;
    this.targetStatus = item.status || 'ACTIVE';
    this.adminRemarks = item.adminRemarks || '';
  }

  closeReviewModal() {
    this.selectedItem = null;
    this.isUpdating = false;
  }

  async applyAction(newStatus: DltStatus) {
    if (!this.selectedItem) return;

    this.isUpdating = true;
    const adminName = this.authService.currentAdmin()?.name || 'Admin';

    await this.dataService.updateLivePeStatus(this.selectedItem.id, newStatus, this.adminRemarks, adminName);
    this.closeReviewModal();
  }
}
