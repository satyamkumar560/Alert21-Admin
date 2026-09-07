import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { WhatsappPricingSlab } from '../../models/alert21.models';

@Component({
  selector: 'app-whatsapp-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">WhatsApp Pricing & Category Slabs</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Configure tiered pricing per WhatsApp conversation category: Utility, Marketing, and Authentication (OTP).
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openAddModal()" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="plus" [size]="13"></app-icon>
            <span>Add Pricing Slab</span>
          </button>
        </div>
      </div>

      <!-- Slabs Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div *ngFor="let s of slabsList()" class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4 relative overflow-hidden">
          <!-- Top Badge -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-black text-base text-slate-900">{{ s.name }}</h3>
              <span class="text-[10px] font-mono font-bold text-slate-400">
                {{ s.minQuantity | number }} - {{ s.maxQuantity | number }} credits
              </span>
            </div>

            <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase"
                  [ngClass]="s.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
              {{ s.isActive ? 'ACTIVE' : 'INACTIVE' }}
            </span>
          </div>

          <!-- Category Rates Table -->
          <div class="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-100 text-xs font-mono">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Utility Rate:</span>
              <span class="font-bold text-indigo-600">₹{{ s.ratePerUtility | number:'1.2-4' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Marketing Rate:</span>
              <span class="font-bold text-purple-600">₹{{ s.ratePerMarketing | number:'1.2-4' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Authentication Rate:</span>
              <span class="font-bold text-amber-600">₹{{ s.ratePerAuth | number:'1.2-4' }}</span>
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span class="text-slate-500 font-sans text-[11px]">GST Applicable:</span>
              <span class="font-bold text-slate-700">{{ s.gstPercent }}%</span>
            </div>
          </div>

          <p *ngIf="s.description" class="text-[11px] text-slate-500 font-medium">
            {{ s.description }}
          </p>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <button 
              (click)="openEditModal(s)" 
              class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all">
              Edit Slab
            </button>

            <button 
              (click)="deleteSlab(s.id)" 
              class="p-1.5 rounded-xl hover:bg-rose-50 text-rose-500 transition-all"
              title="Delete Slab">
              <app-icon name="trash" [size]="14"></app-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">
              {{ editingSlab ? 'Edit Pricing Slab' : 'Add WhatsApp Pricing Slab' }}
            </h3>
            <button (click)="closeModal()" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3 font-sans text-xs">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Slab Name</label>
              <input type="text" [(ngModel)]="formName" placeholder="Growth Tier" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
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

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Utility (₹)</label>
                <input type="number" step="0.01" [(ngModel)]="formRateUtility" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Marketing (₹)</label>
                <input type="number" step="0.01" [(ngModel)]="formRateMarketing" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Auth / OTP (₹)</label>
                <input type="number" step="0.01" [(ngModel)]="formRateAuth" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">GST %</label>
                <input type="number" [(ngModel)]="formGstPercent" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Active Status</label>
                <select [(ngModel)]="formIsActive" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                  <option [ngValue]="true">ACTIVE</option>
                  <option [ngValue]="false">INACTIVE</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description (Optional)</label>
              <input type="text" [(ngModel)]="formDescription" placeholder="Tier description" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="saveSlab()" [disabled]="isSaving" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              {{ isSaving ? 'Saving...' : 'Save Pricing Slab' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WhatsappPricingComponent implements OnInit {
  dataService = inject(DataService);

  showModal = false;
  editingSlab: WhatsappPricingSlab | null = null;
  isSaving = false;

  formName = '';
  formMinQty = 1;
  formMaxQty = 10000;
  formRateUtility = 0.35;
  formRateMarketing = 0.78;
  formRateAuth = 0.30;
  formGstPercent = 18;
  formIsActive = true;
  formDescription = '';

  ngOnInit() {
    this.refresh();
  }

  slabsList() {
    return this.dataService.whatsappPricingSlabs();
  }

  refresh() {
    this.dataService.fetchWhatsappPricingSlabs();
  }

  openAddModal() {
    this.editingSlab = null;
    this.formName = '';
    this.formMinQty = 1;
    this.formMaxQty = 10000;
    this.formRateUtility = 0.35;
    this.formRateMarketing = 0.78;
    this.formRateAuth = 0.30;
    this.formGstPercent = 18;
    this.formIsActive = true;
    this.formDescription = '';
    this.showModal = true;
  }

  openEditModal(s: WhatsappPricingSlab) {
    this.editingSlab = s;
    this.formName = s.name;
    this.formMinQty = s.minQuantity;
    this.formMaxQty = s.maxQuantity;
    this.formRateUtility = s.ratePerUtility;
    this.formRateMarketing = s.ratePerMarketing;
    this.formRateAuth = s.ratePerAuth;
    this.formGstPercent = s.gstPercent;
    this.formIsActive = s.isActive;
    this.formDescription = s.description || '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingSlab = null;
  }

  async saveSlab() {
    if (!this.formName.trim()) return;
    this.isSaving = true;

    const payload = {
      name: this.formName.trim(),
      minQuantity: this.formMinQty,
      maxQuantity: this.formMaxQty,
      ratePerUtility: this.formRateUtility,
      ratePerMarketing: this.formRateMarketing,
      ratePerAuth: this.formRateAuth,
      gstPercent: this.formGstPercent,
      isActive: this.formIsActive,
      description: this.formDescription.trim()
    };

    if (this.editingSlab) {
      await this.dataService.updateWhatsappPricingSlab(this.editingSlab.id, payload);
    } else {
      await this.dataService.createWhatsappPricingSlab(payload);
    }

    this.isSaving = false;
    this.closeModal();
  }

  async deleteSlab(id: string) {
    if (confirm('Are you sure you want to delete this pricing slab?')) {
      await this.dataService.deleteWhatsappPricingSlab(id);
    }
  }
}
