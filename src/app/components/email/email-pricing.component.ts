import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { EmailPricingSlab } from '../../models/alert21.models';

@Component({
  selector: 'app-email-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Email Pricing Slabs</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Configure volume-based pricing tiers for transactional email credits (GST 18% calculated automatically).
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openAddModal()" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="plus" [size]="13"></app-icon>
            <span>Add Pricing Slab</span>
          </button>
        </div>
      </div>

      <!-- Slabs Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6" *ngIf="slabsList().length > 0">
        <div *ngFor="let s of slabsList()" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between relative overflow-hidden space-y-4 hover:border-indigo-200 transition-all">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-black text-slate-900">{{ s.name }}</h3>
            <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase"
                  [ngClass]="s.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
              {{ s.isActive ? 'ACTIVE' : 'INACTIVE' }}
            </span>
          </div>

          <div class="space-y-1">
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-indigo-600 font-mono">₹{{ s.ratePerEmail }}</span>
              <span class="text-xs text-slate-400 font-medium">/ email</span>
            </div>
            <p class="text-xs text-slate-500 font-medium">+ 18% GST Applicable</p>
          </div>

          <!-- Quantity Range -->
          <div class="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100 font-mono">
            <div class="flex justify-between">
              <span class="text-slate-500">Min Quantity:</span>
              <span class="font-bold text-slate-900">{{ s.minQuantity | number }} emails</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Max Quantity:</span>
              <span class="font-bold text-slate-900">{{ s.maxQuantity | number }} emails</span>
            </div>
          </div>

          <p *ngIf="s.description" class="text-xs text-slate-500 font-medium">{{ s.description }}</p>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <button (click)="deleteSlab(s.id)" class="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1">
              <app-icon name="trash" [size]="13"></app-icon>
              <span>Delete</span>
            </button>
            <button (click)="openEditModal(s)" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs">
              Edit Slab
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State Card -->
      <div *ngIf="slabsList().length === 0" class="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <app-icon name="tag" [size]="36" className="mx-auto mb-3 text-slate-300"></app-icon>
        <h3 class="text-base font-black text-slate-800">No Email Pricing Slabs Configured</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Create volume pricing slabs (e.g. 1,000–10,000 emails &#64; ₹0.15/email) so tenants can purchase transactional email packs.
        </p>
        <button (click)="openAddModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs">
          Add Pricing Slab
        </button>
      </div>

      <!-- Add/Edit Slab Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">
              {{ editingSlab ? 'Edit Pricing Slab' : 'Add New Pricing Slab' }}
            </h3>
            <button (click)="closeModal()" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Slab / Tier Name</label>
              <input type="text" [(ngModel)]="formName" placeholder="e.g. Starter Tier" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Min Quantity</label>
                <input type="number" [(ngModel)]="formMinQty" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Max Quantity</label>
                <input type="number" [(ngModel)]="formMaxQty" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Rate Per Email (₹)</label>
              <input type="number" step="0.01" [(ngModel)]="formRate" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description (Optional)</label>
              <input type="text" [(ngModel)]="formDesc" placeholder="Best for startups" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500">
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input type="checkbox" id="slabActive" [(ngModel)]="formActive" class="rounded text-indigo-600 focus:ring-indigo-500">
              <label for="slabActive" class="text-xs font-bold text-slate-700">Active for purchases</label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="saveSlab()" [disabled]="isSaving" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              {{ isSaving ? 'Saving...' : 'Save Slab' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmailPricingComponent implements OnInit {
  dataService = inject(DataService);

  showModal = false;
  editingSlab: EmailPricingSlab | null = null;
  isSaving = false;

  formName = '';
  formMinQty = 1000;
  formMaxQty = 10000;
  formRate = 0.15;
  formDesc = '';
  formActive = true;

  ngOnInit() {
    this.dataService.fetchEmailPricingSlabs();
  }

  slabsList() {
    return this.dataService.emailPricingSlabs();
  }

  openAddModal() {
    this.editingSlab = null;
    this.formName = '';
    this.formMinQty = 1000;
    this.formMaxQty = 10000;
    this.formRate = 0.15;
    this.formDesc = '';
    this.formActive = true;
    this.showModal = true;
  }

  openEditModal(s: EmailPricingSlab) {
    this.editingSlab = s;
    this.formName = s.name;
    this.formMinQty = s.minQuantity;
    this.formMaxQty = s.maxQuantity;
    this.formRate = s.ratePerEmail;
    this.formDesc = s.description || '';
    this.formActive = s.isActive;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingSlab = null;
  }

  async saveSlab() {
    if (!this.formName.trim()) return;
    this.isSaving = true;

    const ok = await this.dataService.saveEmailPricingSlab({
      id: this.editingSlab ? this.editingSlab.id : undefined,
      name: this.formName.trim(),
      minQuantity: Number(this.formMinQty),
      maxQuantity: Number(this.formMaxQty),
      ratePerEmail: Number(this.formRate),
      description: this.formDesc.trim(),
      isActive: this.formActive
    });

    this.isSaving = false;
    if (ok) {
      this.closeModal();
    }
  }

  async deleteSlab(id: string) {
    if (confirm('Are you sure you want to remove this pricing slab?')) {
      await this.dataService.deleteEmailPricingSlab(id);
    }
  }
}
