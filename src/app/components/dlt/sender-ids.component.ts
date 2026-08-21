import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { SenderIdHeader, DltStatus } from '../../models/alert21.models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-sender-ids',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Breadcrumbs -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Sender Headers (Sender IDs)</h2>
          <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <span>🏠 Dashboard</span>
            <span>›</span>
            <span>DLT Management</span>
            <span>›</span>
            <span class="text-slate-700 font-bold">Sender IDs</span>
          </div>
        </div>
      </div>

      <!-- Summary Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <app-icon name="file-text" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sender Headers</p>
            <h3 class="text-2xl font-black text-slate-900 mt-0.5">{{ dataService.senderIds().length }}</h3>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <app-icon name="check-circle" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Approved</p>
            <h3 class="text-2xl font-black text-slate-900 mt-0.5">{{ activeCount }}</h3>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <app-icon name="alert-triangle" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Approval</p>
            <h3 class="text-2xl font-black text-slate-900 mt-0.5">{{ pendingCount }}</h3>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div class="relative w-full md:w-96">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search Sender Header, User Owner..." 
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
                <th>Sender Header</th>
                <th>User Owner</th>
                <th>Principal Entity ID</th>
                <th>Header Category</th>
                <th>Status</th>
                <th>Date Added</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let snd of filteredSenders()">
                <td>
                  <span class="font-mono text-emerald-600 font-extrabold text-sm bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">
                    {{ snd.senderHeader }}
                  </span>
                </td>
                <td>
                  <div class="font-extrabold text-slate-900 text-sm">{{ snd.userName }}</div>
                </td>
                <td>
                  <span class="font-mono text-xs text-indigo-600 font-bold">{{ snd.peId }}</span>
                </td>
                <td>
                  <span class="badge badge-primary text-[10px] font-bold">{{ snd.headerType }}</span>
                </td>
                <td>
                  <span [class]="getBadgeClass(snd.status)">
                    <span class="dot"></span>
                    {{ snd.status }}
                  </span>
                </td>
                <td>
                  <span class="text-xs text-slate-600 font-medium">{{ snd.submittedAt | date:'mediumDate' }}</span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      (click)="openReviewModal(snd)" 
                      title="Update Sender Status" 
                      class="btn btn-outline btn-sm font-semibold text-xs">
                      <app-icon name="user-check" [size]="14"></app-icon>
                      <span>Update Status</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredSenders().length === 0">
                <td colspan="7" class="text-center py-8 text-slate-400 font-medium text-xs">
                  No Sender Headers found matching your query.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Status Update Modal -->
      <div *ngIf="selectedSender" class="modal-backdrop" (click)="closeReviewModal()">
        <div class="modal-card p-6 border border-slate-200 bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-extrabold text-slate-900">Update Sender Header Status</h3>
              <p class="text-xs text-slate-500 font-medium">Update Sender Header verification status.</p>
            </div>
            <button (click)="closeReviewModal()" class="btn btn-outline btn-sm">Close</button>
          </div>

          <div class="py-4 space-y-4">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-slate-500">Sender Header:</span>
                <span class="text-emerald-600 font-bold">{{ selectedSender.senderHeader }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">User Owner:</span>
                <span class="text-slate-900 font-bold">{{ selectedSender.userName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Current Status:</span>
                <span [class]="getBadgeClass(selectedSender.status)">{{ selectedSender.status }}</span>
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
              (click)="applyAction()" 
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
export class SenderIdsComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);

  searchQuery = '';
  selectedSender: SenderIdHeader | null = null;
  targetStatus: DltStatus = 'ACTIVE';
  adminRemarks = '';
  isUpdating = false;

  get activeCount(): number {
    return this.dataService.senderIds().filter(s => s.status === 'ACTIVE').length;
  }

  get pendingCount(): number {
    return this.dataService.senderIds().filter(s => s.status === 'PENDING').length;
  }

  filteredSenders() {
    return this.dataService.senderIds().filter(s => {
      const q = this.searchQuery.toLowerCase();
      return !q || s.senderHeader.toLowerCase().includes(q) || s.userName.toLowerCase().includes(q) || s.peId.toLowerCase().includes(q);
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

  openReviewModal(sender: SenderIdHeader) {
    this.selectedSender = sender;
    this.targetStatus = sender.status || 'ACTIVE';
    this.adminRemarks = sender.adminRemarks || '';
  }

  closeReviewModal() {
    this.selectedSender = null;
    this.isUpdating = false;
  }

  async applyAction() {
    if (!this.selectedSender) return;
    this.isUpdating = true;
    const adminName = this.authService.currentAdmin()?.name || 'Admin';

    await this.dataService.updateLiveSenderStatus(this.selectedSender.id, this.targetStatus, this.adminRemarks, adminName);
    this.closeReviewModal();
  }
}
