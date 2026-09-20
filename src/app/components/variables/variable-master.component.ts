import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { VariableMasterAdminService, VariableMasterItem } from '../../services/variable-master-admin.service';

@Component({
  selector: 'app-variable-master',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 text-slate-900">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
            <app-icon name="sliders" [size]="22"></app-icon>
          </div>
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Variable Master Repository</h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">Central taxonomy registry for Universal Master Template Engine variables</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            type="button" 
            (click)="openModal()"
            class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Add Master Variable</span>
          </button>
        </div>
      </div>

      <!-- Filters & Data Table Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <!-- Search -->
            <div class="relative w-full sm:w-72">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onFilterChange()"
                placeholder="Search variable key, name, sample..." 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium">
            </div>

            <!-- Category Filter Dropdown -->
            <select 
              [(ngModel)]="selectedCategory"
              (change)="onFilterChange()"
              class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-purple-500 focus:bg-white">
              <option value="">All Categories</option>
              <option *ngFor="let cat of adminService.categories()" [value]="cat.slug">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <span class="text-xs font-semibold text-slate-500">
            Total Variables: <span class="text-purple-600 font-extrabold">{{ adminService.variables().length }}</span>
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th class="py-3 px-4">Variable Key</th>
                <th class="py-3 px-4">Display Name & Category</th>
                <th class="py-3 px-4">Type & Security</th>
                <th class="py-3 px-4">Allowed Channels</th>
                <th class="py-3 px-4">Sample Value</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let v of adminService.variables()" class="hover:bg-slate-50/60 transition-colors">
                <!-- Variable Key -->
                <td class="py-3.5 px-4 font-mono font-bold text-indigo-700">
                  <span class="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs">
                    {{ '{{ ' + v.variableKey + ' }}' }}
                  </span>
                </td>

                <!-- Name & Category -->
                <td class="py-3.5 px-4">
                  <div class="font-extrabold text-slate-900 text-sm">{{ v.displayName }}</div>
                  <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                    Category: <span class="text-indigo-600 font-extrabold">{{ v.category }}</span>
                  </div>
                </td>

                <!-- Type & Security -->
                <td class="py-3.5 px-4 space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-bold uppercase border border-slate-200">
                      {{ v.dataType }}
                    </span>
                    <span 
                      [ngClass]="v.isSensitive ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
                      class="px-2 py-0.5 rounded text-[10px] font-black border uppercase">
                      {{ v.isSensitive ? 'Sensitive' : 'Normal' }}
                    </span>
                  </div>
                  <div *ngIf="v.maskingPattern && v.maskingPattern !== 'NONE'" class="text-[10px] text-amber-600 font-mono font-bold">
                    Mask: {{ v.maskingPattern }}
                  </div>
                </td>

                <!-- Channel Eligibility -->
                <td class="py-3.5 px-4">
                  <div class="flex flex-wrap items-center gap-1">
                    <span [ngClass]="v.allowedChannels.sms ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'" class="px-1.5 py-0.5 rounded text-[9px] font-bold border">SMS</span>
                    <span [ngClass]="v.allowedChannels.whatsapp ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-400 border-slate-200'" class="px-1.5 py-0.5 rounded text-[9px] font-bold border">WA</span>
                    <span [ngClass]="v.allowedChannels.email ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-slate-100 text-slate-400 border-slate-200'" class="px-1.5 py-0.5 rounded text-[9px] font-bold border">Email</span>
                    <span [ngClass]="v.allowedChannels.push ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-400 border-slate-200'" class="px-1.5 py-0.5 rounded text-[9px] font-bold border">Push</span>
                  </div>
                </td>

                <!-- Sample Value -->
                <td class="py-3.5 px-4 font-mono text-slate-700 max-w-xs truncate font-medium">
                  {{ v.sampleValue || '-' }}
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right space-x-2">
                  <button 
                    (click)="editVariable(v)"
                    class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors">
                    Edit
                  </button>
                  <button 
                    (click)="deleteVariable(v)"
                    class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold border border-rose-100 transition-colors">
                    Delete
                  </button>
                </td>
              </tr>
              <tr *ngIf="adminService.variables().length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 font-medium">
                  No variables found matching query.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Variable Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-black text-slate-900">
              {{ isEditing ? 'Edit Master Variable' : 'Create Master Variable' }}
            </h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveVariable()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Variable Key *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.variableKey" 
                  name="variableKey" 
                  required
                  placeholder="e.g. otp"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-indigo-700 font-bold focus:outline-none focus:border-purple-500 focus:bg-white">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Display Name *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.displayName" 
                  name="displayName" 
                  required
                  placeholder="e.g. One-Time Password (OTP)"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-500 focus:bg-white">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select 
                  [(ngModel)]="formData.category" 
                  name="category"
                  required
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-500 focus:bg-white">
                  <option value="" disabled>Select category</option>
                  <option *ngFor="let cat of adminService.categories()" [value]="cat.slug">
                    {{ cat.name }} ({{ cat.slug }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Data Type *</label>
                <select 
                  [(ngModel)]="formData.dataType" 
                  name="dataType"
                  required
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-500 focus:bg-white">
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="date">date</option>
                  <option value="array">array</option>
                  <option value="object">object</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Security Level</label>
                <select 
                  [ngModel]="formData.isSensitive" 
                  (ngModelChange)="formData.isSensitive = $event"
                  name="isSensitive"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-500 focus:bg-white">
                  <option [ngValue]="false">Normal</option>
                  <option [ngValue]="true">Sensitive / Masked</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Masking Pattern</label>
                <select 
                  [(ngModel)]="formData.maskingPattern" 
                  name="maskingPattern"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-500 focus:bg-white">
                  <option value="NONE">NONE</option>
                  <option value="FULL">FULL</option>
                  <option value="LAST4">LAST4</option>
                  <option value="EMAIL">EMAIL</option>
                </select>
              </div>
            </div>

            <!-- Allowed Channels Checkboxes -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">Allowed Channels</label>
              <div class="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <label class="flex items-center gap-2 text-xs text-slate-800 font-bold cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.allowedChannels!.sms" name="sms" class="rounded bg-white border-slate-300 text-purple-600 focus:ring-0">
                  <span>SMS</span>
                </label>
                <label class="flex items-center gap-2 text-xs text-slate-800 font-bold cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.allowedChannels!.whatsapp" name="whatsapp" class="rounded bg-white border-slate-300 text-purple-600 focus:ring-0">
                  <span>WhatsApp</span>
                </label>
                <label class="flex items-center gap-2 text-xs text-slate-800 font-bold cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.allowedChannels!.email" name="email" class="rounded bg-white border-slate-300 text-purple-600 focus:ring-0">
                  <span>Email</span>
                </label>
                <label class="flex items-center gap-2 text-xs text-slate-800 font-bold cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.allowedChannels!.push" name="push" class="rounded bg-white border-slate-300 text-purple-600 focus:ring-0">
                  <span>Push</span>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Sample Value</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.sampleValue" 
                  name="sampleValue" 
                  placeholder="e.g. 584920"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 font-medium focus:outline-none focus:border-purple-500 focus:bg-white">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Validation Regex</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.validationRegex" 
                  name="validationRegex" 
                  placeholder="e.g. ^[0-9]{6}$"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 font-medium focus:outline-none focus:border-purple-500 focus:bg-white">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea 
                [(ngModel)]="formData.description" 
                name="description" 
                rows="2"
                placeholder="Technical usage guidelines for this variable"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-500 focus:bg-white"></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                (click)="closeModal()" 
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                Save Variable
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class VariableMasterComponent implements OnInit {
  adminService = inject(VariableMasterAdminService);

  searchQuery = '';
  selectedCategory = '';
  showModal = false;
  isEditing = false;
  editingId: string | null = null;

  formData: Partial<VariableMasterItem> = {
    variableKey: '',
    displayName: '',
    category: '',
    dataType: 'string',
    isSensitive: false,
    maskingPattern: 'NONE',
    allowedChannels: { sms: true, whatsapp: true, email: true, push: true },
    sampleValue: '',
    validationRegex: '',
    description: '',
    isActive: true
  };

  async ngOnInit() {
    await this.adminService.loadCategories();
    await this.adminService.loadVariables();
  }

  onFilterChange() {
    this.adminService.loadVariables(this.selectedCategory, this.searchQuery);
  }

  openModal() {
    this.isEditing = false;
    this.editingId = null;
    const defaultCat = this.adminService.categories().length > 0 ? this.adminService.categories()[0].slug : '';
    this.formData = {
      variableKey: '',
      displayName: '',
      category: defaultCat,
      dataType: 'string',
      isSensitive: false,
      maskingPattern: 'NONE',
      allowedChannels: { sms: true, whatsapp: true, email: true, push: true },
      sampleValue: '',
      validationRegex: '',
      description: '',
      isActive: true
    };
    this.showModal = true;
  }

  editVariable(v: VariableMasterItem) {
    this.isEditing = true;
    this.editingId = v._id || v.id || null;
    this.formData = {
      variableKey: v.variableKey,
      displayName: v.displayName,
      category: v.category,
      dataType: v.dataType || 'string',
      isSensitive: !!v.isSensitive,
      maskingPattern: v.maskingPattern || 'NONE',
      allowedChannels: {
        sms: v.allowedChannels?.sms !== false,
        whatsapp: v.allowedChannels?.whatsapp !== false,
        email: v.allowedChannels?.email !== false,
        push: v.allowedChannels?.push !== false
      },
      sampleValue: v.sampleValue || '',
      validationRegex: v.validationRegex || '',
      description: v.description || '',
      isActive: v.isActive !== false
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  async saveVariable() {
    if (!this.formData.variableKey || !this.formData.displayName || !this.formData.category) return;
    if (this.isEditing && this.editingId) {
      const ok = await this.adminService.updateVariable(this.editingId, this.formData);
      if (ok) this.closeModal();
    } else {
      const ok = await this.adminService.createVariable(this.formData);
      if (ok) this.closeModal();
    }
  }

  async deleteVariable(v: VariableMasterItem) {
    const id = v._id || v.id;
    if (!id) return;
    if (confirm(`Are you sure you want to delete variable "{{${v.variableKey}}}"?`)) {
      await this.adminService.deleteVariable(id);
    }
  }
}
