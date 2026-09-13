import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { EmailPackageMaster } from '../../models/alert21.models';

@Component({
  selector: 'app-email-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Email Package Master</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Manage fixed prepaid packages, validity periods, domain & sender limits, and FEFO credit rules.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="fetchPackages()" class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh-cw" [size]="13"></app-icon>
            <span>Refresh</span>
          </button>
          <button (click)="openAddModal()" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="plus" [size]="13"></app-icon>
            <span>Add Email Package</span>
          </button>
        </div>
      </div>

      <!-- Packages Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" *ngIf="packagesList().length > 0">
        <div *ngFor="let p of packagesList()" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between relative overflow-hidden space-y-4 hover:border-indigo-300 transition-all">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[10px] font-mono uppercase font-bold text-indigo-600 tracking-wider block">{{ p.code }}</span>
              <h3 class="text-base font-black text-slate-900 mt-0.5">{{ p.name }}</h3>
            </div>
            <div class="flex items-center gap-1">
              <span *ngIf="p.isFreeTrial" class="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                TRIAL
              </span>
              <span class="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md uppercase"
                    [ngClass]="p.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
                {{ p.active ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </div>
          </div>

          <!-- Price & Effective Rate -->
          <div class="space-y-1 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-black text-slate-900 font-mono">₹{{ p.basePrice | number }}</span>
              <span class="text-xs text-slate-500 font-medium">+ {{ p.gstPercent }}% GST</span>
            </div>
            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 font-mono">
              <span class="text-slate-500">Effective Rate:</span>
              <strong class="text-indigo-600">₹{{ p.effectiveRate || (p.credits > 0 ? (p.basePrice / p.credits).toFixed(4) : '0') }} / email</strong>
            </div>
          </div>

          <!-- Entitlements Summary -->
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500 flex items-center gap-1.5"><app-icon name="mail" [size]="12"></app-icon> Credits:</span>
              <strong class="font-mono text-slate-800 font-bold">{{ p.credits | number }}</strong>
            </div>
            <div class="flex items-center justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500 flex items-center gap-1.5"><app-icon name="calendar" [size]="12"></app-icon> Validity:</span>
              <strong class="font-mono text-slate-800 font-bold">{{ p.validityDays }} Days</strong>
            </div>
            <div class="flex items-center justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500 flex items-center gap-1.5"><app-icon name="globe" [size]="12"></app-icon> Domain Limit:</span>
              <strong class="font-mono text-slate-800 font-bold">{{ p.domainLimit }} Domain{{ p.domainLimit > 1 ? 's' : '' }}</strong>
            </div>
            <div class="flex items-center justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500 flex items-center gap-1.5"><app-icon name="send" [size]="12"></app-icon> Sender Limit:</span>
              <strong class="font-mono text-slate-800 font-bold">{{ p.senderLimit }} Sender{{ p.senderLimit > 1 ? 's' : '' }}</strong>
            </div>
            <div class="flex items-center justify-between py-1">
              <span class="text-slate-500 flex items-center gap-1.5"><app-icon name="clock" [size]="12"></app-icon> Log Retention:</span>
              <strong class="font-mono text-slate-800 font-bold">{{ p.logRetentionDays }} Days</strong>
            </div>
          </div>

          <p *ngIf="p.description" class="text-xs text-slate-500 font-medium italic">{{ p.description }}</p>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <button (click)="deletePackage(p.id || p._id!)" class="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1">
              <app-icon name="trash" [size]="13"></app-icon>
              <span>Delete</span>
            </button>
            <button (click)="openEditModal(p)" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs">
              Edit Package
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State Card -->
      <div *ngIf="packagesList().length === 0" class="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <app-icon name="box" [size]="36" className="mx-auto mb-3 text-slate-300"></app-icon>
        <h3 class="text-base font-black text-slate-800">No Email Packages Configured</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Click below to load standard commercial fixed packages or create a custom package.
        </p>
        <button (click)="openAddModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs">
          Add Package Now
        </button>
      </div>

      <!-- Add/Edit Package Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase">
                {{ editingPackage ? 'Edit Email Package' : 'Create New Email Package' }}
              </h3>
              <p class="text-[11px] text-slate-500">Fixed commercial pricing package and tenant entitlements</p>
            </div>
            <button (click)="closeModal()" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Package Code *</label>
                <input type="text" [(ngModel)]="formCode" placeholder="e.g. EMAIL_BIZ_100K" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Display Name *</label>
                <input type="text" [(ngModel)]="formName" placeholder="e.g. Business" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Credits *</label>
                <input type="number" [(ngModel)]="formCredits" (ngModelChange)="calcEffectiveRate()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Base Price (₹) *</label>
                <input type="number" [(ngModel)]="formBasePrice" (ngModelChange)="calcEffectiveRate()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
            </div>

            <!-- Calculated Effective Rate Display (Read-Only) -->
            <div class="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
              <span class="text-indigo-900 font-medium">Calculated Effective Rate:</span>
              <strong class="font-mono text-indigo-700 font-bold">₹{{ effectiveRatePreview }} / email</strong>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Validity (Days) *</label>
                <input type="number" [(ngModel)]="formValidityDays" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Domain Limit *</label>
                <input type="number" [(ngModel)]="formDomainLimit" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Sender Limit *</label>
                <input type="number" [(ngModel)]="formSenderLimit" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Log Retention (Days)</label>
                <input type="number" [(ngModel)]="formLogRetentionDays" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">GST (%)</label>
                <input type="number" [(ngModel)]="formGstPercent" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500">
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
              <input type="text" [(ngModel)]="formDescription" placeholder="e.g. Standard production high volume pack" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500">
            </div>

            <div class="flex items-center gap-6 pt-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="pkgActive" [(ngModel)]="formActive" class="rounded text-indigo-600 focus:ring-indigo-500">
                <label for="pkgActive" class="text-xs font-bold text-slate-700">Active for purchase</label>
              </div>

              <div class="flex items-center gap-2">
                <input type="checkbox" id="pkgTrial" [(ngModel)]="formIsFreeTrial" class="rounded text-emerald-600 focus:ring-emerald-500">
                <label for="pkgTrial" class="text-xs font-bold text-slate-700">Is Free Trial Package</label>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="savePackage()" [disabled]="isSaving" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              {{ isSaving ? 'Saving...' : 'Save Package' }}
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
  editingPackage: EmailPackageMaster | null = null;
  isSaving = false;

  formCode = '';
  formName = '';
  formCredits = 10000;
  formBasePrice = 1200;
  formGstPercent = 18;
  formValidityDays = 180;
  formDomainLimit = 1;
  formSenderLimit = 2;
  formLogRetentionDays = 30;
  formActive = true;
  formIsFreeTrial = false;
  formDisplayOrder = 1;
  formDescription = '';
  effectiveRatePreview = '0.1200';

  ngOnInit() {
    this.fetchPackages();
  }

  packagesList() {
    return this.dataService.emailPackages();
  }

  fetchPackages() {
    this.dataService.fetchEmailPackages();
  }

  calcEffectiveRate() {
    if (this.formCredits > 0) {
      this.effectiveRatePreview = (this.formBasePrice / this.formCredits).toFixed(4);
    } else {
      this.effectiveRatePreview = '0.0000';
    }
  }

  openAddModal() {
    this.editingPackage = null;
    this.formCode = '';
    this.formName = '';
    this.formCredits = 10000;
    this.formBasePrice = 1200;
    this.formGstPercent = 18;
    this.formValidityDays = 180;
    this.formDomainLimit = 1;
    this.formSenderLimit = 2;
    this.formLogRetentionDays = 30;
    this.formActive = true;
    this.formIsFreeTrial = false;
    this.formDisplayOrder = 1;
    this.formDescription = '';
    this.calcEffectiveRate();
    this.showModal = true;
  }

  openEditModal(p: EmailPackageMaster) {
    this.editingPackage = p;
    this.formCode = p.code;
    this.formName = p.name;
    this.formCredits = p.credits;
    this.formBasePrice = p.basePrice;
    this.formGstPercent = p.gstPercent;
    this.formValidityDays = p.validityDays;
    this.formDomainLimit = p.domainLimit;
    this.formSenderLimit = p.senderLimit;
    this.formLogRetentionDays = p.logRetentionDays;
    this.formActive = p.active;
    this.formIsFreeTrial = p.isFreeTrial;
    this.formDisplayOrder = p.displayOrder;
    this.formDescription = p.description || '';
    this.calcEffectiveRate();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingPackage = null;
  }

  async savePackage() {
    if (!this.formCode.trim() || !this.formName.trim()) return;
    this.isSaving = true;

    const ok = await this.dataService.saveEmailPackage({
      id: this.editingPackage ? (this.editingPackage.id || this.editingPackage._id) : undefined,
      code: this.formCode.trim(),
      name: this.formName.trim(),
      credits: Number(this.formCredits),
      basePrice: Number(this.formBasePrice),
      gstPercent: Number(this.formGstPercent),
      validityDays: Number(this.formValidityDays),
      domainLimit: Number(this.formDomainLimit),
      senderLimit: Number(this.formSenderLimit),
      logRetentionDays: Number(this.formLogRetentionDays),
      active: this.formActive,
      isFreeTrial: this.formIsFreeTrial,
      displayOrder: Number(this.formDisplayOrder),
      description: this.formDescription.trim()
    });

    this.isSaving = false;
    if (ok) {
      this.closeModal();
    }
  }

  async deletePackage(id: string) {
    if (confirm('Are you sure you want to remove this email package?')) {
      await this.dataService.deleteEmailPackage(id);
    }
  }
}

