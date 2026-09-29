import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ContentTemplate, DltStatus } from '../../models/alert21.models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-dlt-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Breadcrumbs -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">DLT Content Templates</h2>
          <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <span>🏠 Dashboard</span>
            <span>›</span>
            <span>DLT Management</span>
            <span>›</span>
            <span class="text-slate-700 font-bold">DLT Templates</span>
          </div>
        </div>
      </div>

      <!-- Summary Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <app-icon name="copy" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Templates</p>
            <h3 class="text-2xl font-black text-slate-900 mt-0.5">{{ dataService.contentTemplates().length }}</h3>
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
            placeholder="Search Template Name, Template ID, Content..." 
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
                <th>Template Name & ID</th>
                <th>User Owner</th>
                <th>Category</th>
                <th>Registered Content</th>
                <th>Status</th>
                <th>Date Added</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tpl of filteredTemplates()">
                <td>
                  <div class="font-extrabold text-indigo-700 text-sm">{{ tpl.templateName }}</div>
                  <div class="font-mono text-[11px] text-slate-500 font-semibold mt-0.5">ID: {{ tpl.templateId }}</div>
                </td>
                <td>
                  <div class="font-bold text-slate-900 text-xs">{{ tpl.userName }}</div>
                </td>
                <td>
                  <span class="badge badge-primary text-[10px] font-bold">{{ tpl.templateType }}</span>
                </td>
                <td class="max-w-md">
                  <p class="font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 leading-normal">
                    {{ tpl.templateContent }}
                  </p>
                </td>
                <td>
                  <span [class]="getBadgeClass(tpl.status)">
                    <span class="dot"></span>
                    {{ tpl.status }}
                  </span>
                </td>
                <td>
                  <span class="text-xs text-slate-600 font-medium">{{ tpl.submittedAt | date:'mediumDate' }}</span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      (click)="openEditModal(tpl)" 
                      title="Edit DLT Template Details" 
                      class="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 border border-indigo-200 shadow-xs transition-all cursor-pointer">
                      <app-icon name="edit" [size]="13"></app-icon>
                      <span>Edit</span>
                    </button>
                    <button 
                      (click)="openReviewModal(tpl)" 
                      title="Update Template Status" 
                      class="btn btn-outline btn-sm font-semibold text-xs">
                      <app-icon name="user-check" [size]="14"></app-icon>
                      <span>Update Status</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredTemplates().length === 0">
                <td colspan="7" class="text-center py-8 text-slate-400 font-medium text-xs">
                  No DLT Templates found matching your query.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Template Modal -->
      <div *ngIf="editingTemplate" class="modal-backdrop" (click)="closeEditModal()">
        <div class="modal-card p-6 border border-slate-200 bg-white rounded-2xl shadow-2xl max-w-lg w-full" (click)="$event.stopPropagation()">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-extrabold text-slate-900">Edit DLT Content Template</h3>
              <p class="text-xs text-slate-500 font-medium">Modify template details, content, category, and approval status.</p>
            </div>
            <button (click)="closeEditModal()" class="btn btn-outline btn-sm">Close</button>
          </div>

          <div class="py-4 space-y-4 text-xs">
            <div class="form-group">
              <label class="form-label font-bold text-slate-700 mb-1">Template Name *</label>
              <input 
                type="text" 
                [(ngModel)]="editForm.templateName" 
                placeholder="e.g. password_has_been_changed" 
                class="form-control text-xs font-semibold">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label font-bold text-slate-700 mb-1">DLT Template ID *</label>
                <input 
                  type="text" 
                  [(ngModel)]="editForm.templateId" 
                  placeholder="e.g. 1207176837469017312" 
                  class="form-control text-xs font-mono font-bold">
              </div>

              <div class="form-group">
                <label class="form-label font-bold text-slate-700 mb-1">Category / Type *</label>
                <select [(ngModel)]="editForm.templateType" class="form-control text-xs font-semibold">
                  <option value="TRANSACTIONAL">TRANSACTIONAL</option>
                  <option value="SERVICE_IMPLICIT">SERVICE_IMPLICIT</option>
                  <option value="SERVICE_EXPLICIT">SERVICE_EXPLICIT</option>
                  <option value="PROMOTIONAL">PROMOTIONAL</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-slate-700 mb-1">Registered Content Template *</label>
              <textarea 
                [(ngModel)]="editForm.templateContent" 
                rows="4" 
                placeholder="Registered DLT text template with {#var#} variables..." 
                class="form-control text-xs font-mono leading-normal"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label font-bold text-slate-700 mb-1">Status *</label>
                <select [(ngModel)]="editForm.status" class="form-control text-xs font-semibold">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label font-bold text-slate-700 mb-1">User Owner</label>
                <input 
                  type="text" 
                  [value]="editingTemplate.userName" 
                  disabled 
                  class="form-control text-xs bg-slate-100 text-slate-500 font-medium">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-slate-700 mb-1">Admin Verification Remarks</label>
              <textarea 
                [(ngModel)]="editForm.adminRemarks" 
                placeholder="Enter admin verification remarks..." 
                class="form-control text-xs"></textarea>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button (click)="closeEditModal()" class="btn btn-outline btn-sm">Cancel</button>
            <button 
              [disabled]="isSavingEdit"
              (click)="saveEditAction()" 
              class="btn btn-primary btn-sm">
              <span *ngIf="isSavingEdit" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isSavingEdit ? 'Saving Changes...' : 'Save Template Changes' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Status Update Modal -->
      <div *ngIf="selectedTemplate" class="modal-backdrop" (click)="closeReviewModal()">
        <div class="modal-card p-6 border border-slate-200 bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-extrabold text-slate-900">Update DLT Template Status</h3>
              <p class="text-xs text-slate-500 font-medium">Update DLT Content Template status.</p>
            </div>
            <button (click)="closeReviewModal()" class="btn btn-outline btn-sm">Close</button>
          </div>

          <div class="py-4 space-y-4">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-slate-500">Template Name:</span>
                <span class="text-indigo-700 font-bold">{{ selectedTemplate.templateName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Template ID:</span>
                <span class="text-slate-900 font-bold">{{ selectedTemplate.templateId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Current Status:</span>
                <span [class]="getBadgeClass(selectedTemplate.status)">{{ selectedTemplate.status }}</span>
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
export class DltTemplatesComponent implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);

  searchQuery = '';
  selectedTemplate: ContentTemplate | null = null;
  targetStatus: DltStatus = 'ACTIVE';
  adminRemarks = '';
  isUpdating = false;

  editingTemplate: ContentTemplate | null = null;
  editForm = {
    templateName: '',
    templateId: '',
    templateType: 'TRANSACTIONAL' as 'SERVICE_IMPLICIT' | 'SERVICE_EXPLICIT' | 'TRANSACTIONAL' | 'PROMOTIONAL',
    templateContent: '',
    status: 'ACTIVE' as DltStatus,
    adminRemarks: ''
  };
  isSavingEdit = false;

  async ngOnInit() {
    await this.dataService.fetchLiveTemplates();
  }

  get activeCount(): number {
    return this.dataService.contentTemplates().filter(t => t.status === 'ACTIVE').length;
  }

  get pendingCount(): number {
    return this.dataService.contentTemplates().filter(t => t.status === 'PENDING').length;
  }

  filteredTemplates() {
    return this.dataService.contentTemplates().filter(t => {
      const q = this.searchQuery.toLowerCase();
      return !q || t.templateName.toLowerCase().includes(q) || t.templateId.toLowerCase().includes(q) || t.templateContent.toLowerCase().includes(q) || t.userName.toLowerCase().includes(q);
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

  openEditModal(template: ContentTemplate) {
    this.editingTemplate = template;
    this.editForm = {
      templateName: template.templateName,
      templateId: template.templateId,
      templateType: template.templateType || 'TRANSACTIONAL',
      templateContent: template.templateContent,
      status: template.status || 'ACTIVE',
      adminRemarks: template.adminRemarks || ''
    };
  }

  closeEditModal() {
    this.editingTemplate = null;
    this.isSavingEdit = false;
  }

  async saveEditAction() {
    if (!this.editingTemplate) return;
    this.isSavingEdit = true;
    const adminName = this.authService.currentAdmin()?.name || 'Admin';

    await this.dataService.updateLiveTemplateDetails(
      this.editingTemplate.id,
      {
        templateName: this.editForm.templateName,
        templateId: this.editForm.templateId,
        templateType: this.editForm.templateType,
        templateContent: this.editForm.templateContent,
        status: this.editForm.status,
        adminRemarks: this.editForm.adminRemarks
      },
      adminName
    );

    this.closeEditModal();
  }

  openReviewModal(template: ContentTemplate) {
    this.selectedTemplate = template;
    this.targetStatus = template.status || 'ACTIVE';
    this.adminRemarks = template.adminRemarks || '';
  }

  closeReviewModal() {
    this.selectedTemplate = null;
    this.isUpdating = false;
  }

  async applyAction() {
    if (!this.selectedTemplate) return;
    this.isUpdating = true;
    const adminName = this.authService.currentAdmin()?.name || 'Admin';

    await this.dataService.updateLiveTemplateStatus(this.selectedTemplate.id, this.targetStatus, this.adminRemarks, adminName);
    this.closeReviewModal();
  }
}
