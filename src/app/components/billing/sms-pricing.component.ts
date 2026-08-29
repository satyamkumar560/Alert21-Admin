import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { PricingSlab, PricingSlabStatus } from '../../models/alert21.models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-sms-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">SMS Pricing Slabs</h2>
          <p class="text-xs text-slate-500 font-medium">Configure volume-based pricing tiers, rates, and 18% GST rules for user purchases.</p>
        </div>

        <button (click)="openAddModal()" class="btn btn-primary shadow-sm flex items-center gap-2">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Add Pricing Slab</span>
        </button>
      </div>

      <!-- Pricing Slabs Overview Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <app-icon name="tag" [size]="18"></app-icon>
            </div>
            <div>
              <h3 class="text-sm font-extrabold text-slate-900">Active Pricing Tiers</h3>
              <p class="text-xs text-slate-400">Flat slab pricing applied automatically when users purchase SMS credits</p>
            </div>
          </div>
          
          <button (click)="dataService.fetchLivePricingSlabs()" class="btn btn-outline btn-sm text-xs flex items-center gap-1.5" title="Refresh Pricing">
            <app-icon name="rotate-cw" [size]="12"></app-icon>
            <span>Refresh</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200/70 bg-slate-50/50 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th class="py-3.5 px-5">Sort</th>
                <th class="py-3.5 px-5">From Quantity</th>
                <th class="py-3.5 px-5">To Quantity</th>
                <th class="py-3.5 px-5">Rate / SMS</th>
                <th class="py-3.5 px-5">GST Rate</th>
                <th class="py-3.5 px-5">Status</th>
                <th class="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              <tr *ngFor="let slab of sortedSlabs(); let i = index" class="hover:bg-slate-50/80 transition-all">
                <td class="py-3.5 px-5 text-slate-400 font-mono">#{{ slab.sortOrder }}</td>
                <td class="py-3.5 px-5 font-extrabold text-slate-900 font-mono">{{ slab.minQuantity | number }}</td>
                <td class="py-3.5 px-5 font-extrabold text-slate-900 font-mono">{{ slab.maxQuantity | number }}</td>
                <td class="py-3.5 px-5">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold font-mono">
                    ₹{{ slab.ratePerSms | number:'1.2-4' }}
                  </span>
                </td>
                <td class="py-3.5 px-5 text-slate-600 font-mono">{{ slab.gstPercentage }}%</td>
                <td class="py-3.5 px-5">
                  <button 
                    (click)="toggleStatus(slab)"
                    [class]="slab.status === 'ACTIVE' ? 'badge badge-active text-[10px]' : 'badge badge-suspended text-[10px]'"
                    class="cursor-pointer hover:opacity-80 transition-all"
                    title="Click to toggle status">
                    {{ slab.status }}
                  </button>
                </td>
                <td class="py-3.5 px-5 text-right">
                  <button (click)="openEditModal(slab)" class="btn btn-outline btn-sm text-[11px] inline-flex items-center gap-1">
                    <app-icon name="settings" [size]="12"></app-icon>
                    <span>Edit</span>
                  </button>
                </td>
              </tr>

              <tr *ngIf="dataService.pricingSlabs().length === 0">
                <td colspan="7" class="py-8 text-center text-slate-400 text-xs font-medium">
                  No pricing slabs configured. Click "Add Pricing Slab" to create the first tier.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-card p-6 border border-slate-200 max-w-md bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-extrabold text-slate-900">{{ isEditMode ? 'Edit Pricing Slab' : 'Add New Pricing Slab' }}</h3>
              <p class="text-xs text-slate-500 font-medium">Define volume tier quantity range and SMS price rate.</p>
            </div>
            <button (click)="closeModal()" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveSlab()" class="py-4 space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label">From Quantity (Min): <span class="text-rose-500">*</span></label>
                <input type="number" [(ngModel)]="currentSlab.minQuantity" name="minQuantity" required min="1" class="form-control text-xs font-mono font-bold" placeholder="100">
              </div>

              <div class="form-group">
                <label class="form-label">To Quantity (Max): <span class="text-rose-500">*</span></label>
                <input type="number" [(ngModel)]="currentSlab.maxQuantity" name="maxQuantity" required min="1" class="form-control text-xs font-mono font-bold" placeholder="10000">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label">Rate Per SMS (₹): <span class="text-rose-500">*</span></label>
                <input type="number" step="0.001" [(ngModel)]="currentSlab.ratePerSms" name="ratePerSms" required min="0.01" class="form-control text-xs font-mono font-bold text-indigo-600" placeholder="0.26">
              </div>

              <div class="form-group">
                <label class="form-label">GST Rate (%):</label>
                <input type="number" [(ngModel)]="currentSlab.gstPercentage" name="gstPercentage" required class="form-control text-xs font-mono" placeholder="18">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label">Sort Order:</label>
                <input type="number" [(ngModel)]="currentSlab.sortOrder" name="sortOrder" class="form-control text-xs font-mono" placeholder="1">
              </div>

              <div class="form-group">
                <label class="form-label">Status:</label>
                <select [(ngModel)]="currentSlab.status" name="status" class="form-control text-xs font-bold">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div *ngIf="errorMessage" class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <app-icon name="alert-triangle" [size]="14"></app-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">Cancel</button>
              <button type="submit" [disabled]="isSubmitting" class="btn btn-primary btn-sm">
                {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Slab' : 'Create Slab') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SmsPricingComponent implements OnInit {
  dataService = inject(DataService);

  showModal = false;
  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';

  currentSlab: Partial<PricingSlab> = {};

  ngOnInit() {
    this.dataService.fetchLivePricingSlabs();
  }

  sortedSlabs() {
    return [...this.dataService.pricingSlabs()].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  openAddModal() {
    this.isEditMode = false;
    this.errorMessage = '';
    const slabs = this.dataService.pricingSlabs();
    const nextSort = slabs.length + 1;
    this.currentSlab = {
      minQuantity: 100,
      maxQuantity: 10000,
      ratePerSms: 0.26,
      gstPercentage: 18,
      status: 'ACTIVE',
      sortOrder: nextSort
    };
    this.showModal = true;
  }

  openEditModal(slab: PricingSlab) {
    this.isEditMode = true;
    this.errorMessage = '';
    this.currentSlab = { ...slab };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isSubmitting = false;
    this.errorMessage = '';
  }

  async toggleStatus(slab: PricingSlab) {
    const newStatus: PricingSlabStatus = slab.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await this.dataService.updatePricingSlab(slab.id, { ...slab, status: newStatus });
  }

  async saveSlab() {
    if (!this.currentSlab.minQuantity || !this.currentSlab.maxQuantity || !this.currentSlab.ratePerSms) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    if (Number(this.currentSlab.minQuantity) >= Number(this.currentSlab.maxQuantity)) {
      this.errorMessage = 'Min Quantity must be less than Max Quantity.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    let success = false;
    if (this.isEditMode && this.currentSlab.id) {
      success = await this.dataService.updatePricingSlab(this.currentSlab.id, this.currentSlab);
    } else {
      success = await this.dataService.createPricingSlab(this.currentSlab);
    }

    if (success) {
      this.closeModal();
    } else {
      this.isSubmitting = false;
    }
  }
}
