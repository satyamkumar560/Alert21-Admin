import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { RelayService } from '../../services/relay.service';
import { RelayVariable, RelayEventType, RelayVariableSensitivity, RelayVariableDataType, RelayVariableMasking, RelayCategoryType } from '../../models/alert21.models';

@Component({
  selector: 'app-relay-variables',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Variable & Event Master</h2>
          <p class="text-xs text-slate-500 font-medium">
            Standard and custom regex extraction variables, sensitivity classification, privacy masking & API event contract taxonomy.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openAddVariableModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all">
            <app-icon name="plus" [size]="14"></app-icon>
            <span>Add Custom Variable</span>
          </button>
        </div>
      </div>

      <!-- Navigation Sub-tabs -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button 
          (click)="activeTab = 'variables'"
          [class]="activeTab === 'variables' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
          <app-icon name="code" [size]="14"></app-icon>
          <span>Variable Master</span>
          <span class="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">{{ relayService.variables().length }}</span>
        </button>

        <button 
          (click)="activeTab = 'events'"
          [class]="activeTab === 'events' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
          <app-icon name="activity" [size]="14"></app-icon>
          <span>Event Type Taxonomy</span>
          <span class="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">{{ relayService.eventTypes().length }}</span>
        </button>
      </div>

      <!-- 1. VARIABLE MASTER TAB -->
      <div *ngIf="activeTab === 'variables'" class="space-y-4">
        <!-- Search & Filter -->
        <div class="flex items-center gap-3">
          <div class="relative flex-1">
            <app-icon name="search" [size]="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search variables by key, label, data type..." 
              class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
            />
          </div>

          <select [(ngModel)]="sensitivityFilter" class="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Sensitivities</option>
            <option value="NORMAL">NORMAL</option>
            <option value="SENSITIVE">SENSITIVE</option>
            <option value="SECRET">SECRET (OTP)</option>
          </select>
        </div>

        <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th class="py-3 px-4">Variable Token & Key</th>
                  <th class="py-3 px-4">Display Label</th>
                  <th class="py-3 px-4">Data Type</th>
                  <th class="py-3 px-4">Sensitivity</th>
                  <th class="py-3 px-4">Masking Rule</th>
                  <th class="py-3 px-4">TTL / Retention</th>
                  <th class="py-3 px-4">Webhook Allowed</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let v of filteredVariables()" class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3.5 px-4 font-mono">
                    <span class="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs">
                      {{'{{' + v.key + '}}'}}
                    </span>
                    <span *ngIf="v.isStandard" class="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold uppercase">Standard</span>
                  </td>
                  <td class="py-3.5 px-4 font-extrabold text-slate-800">
                    {{ v.displayName }}
                  </td>
                  <td class="py-3.5 px-4 font-mono font-bold text-slate-600">
                    {{ v.dataType }}
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                      [ngClass]="v.sensitivity === 'SECRET' ? 'bg-rose-100 text-rose-800' : (v.sensitivity === 'SENSITIVE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')">
                      {{ v.sensitivity }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {{ v.maskingRule }}
                  </td>
                  <td class="py-3.5 px-4 font-mono text-[11px]">
                    {{ v.retentionTtlSeconds ? (v.retentionTtlSeconds + ' sec (' + (v.retentionTtlSeconds/60) + 'm)') : 'Standard Plan' }}
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="font-bold font-mono text-[11px]" [ngClass]="v.webhookAllowed ? 'text-emerald-600' : 'text-slate-400'">
                      {{ v.webhookAllowed ? 'YES' : 'NO' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button (click)="openEditVariableModal(v)" class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all">
                      <app-icon name="edit" [size]="14"></app-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 2. EVENT TAXONOMY TAB -->
      <div *ngIf="activeTab === 'events'" class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">API Event Key (Contract)</th>
                <th class="py-3 px-4">Display Name</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Description</th>
                <th class="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let ev of relayService.eventTypes()" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4 font-mono font-extrabold text-indigo-600 text-xs">
                  {{ ev.eventKey }}
                </td>
                <td class="py-3.5 px-4 font-extrabold text-slate-900">
                  {{ ev.displayName }}
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold font-mono text-[10px]">
                    {{ ev.category }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-slate-500 text-[11px] max-w-sm">
                  {{ ev.description || '—' }}
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    {{ ev.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ADD/EDIT VARIABLE MODAL -->
      <div *ngIf="showVariableModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <h3 class="font-extrabold text-slate-900 text-base">{{ editingVariableId ? 'Edit Variable' : 'Create Custom Variable' }}</h3>
            <button (click)="showVariableModal = false" class="text-slate-400 hover:text-slate-600"><app-icon name="x" [size]="18"></app-icon></button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Variable Key (lowercase snake_case) *</label>
              <input type="text" [(ngModel)]="variableForm.key" placeholder="e.g. invoice_id, token_hash" class="w-full px-3 py-2 border rounded-xl font-mono lowercase focus:outline-none focus:border-indigo-500" [disabled]="!!editingVariableId" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Display Label *</label>
              <input type="text" [(ngModel)]="variableForm.displayName" placeholder="e.g. Invoice Number" class="w-full px-3 py-2 border rounded-xl font-medium focus:outline-none focus:border-indigo-500" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Data Type *</label>
                <select [(ngModel)]="variableForm.dataType" class="w-full px-3 py-2 border rounded-xl font-semibold focus:outline-none focus:border-indigo-500">
                  <option value="string">String / Text</option>
                  <option value="decimal">Decimal Amount</option>
                  <option value="integer">Integer Count</option>
                  <option value="date">ISO Date</option>
                  <option value="time">Time</option>
                  <option value="enum">Enum Options</option>
                  <option value="boolean">Boolean (True/False)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Sensitivity Classification *</label>
                <select [(ngModel)]="variableForm.sensitivity" class="w-full px-3 py-2 border rounded-xl font-semibold focus:outline-none focus:border-indigo-500">
                  <option value="NORMAL">NORMAL (Non-secret)</option>
                  <option value="SENSITIVE">SENSITIVE (Mask in UI)</option>
                  <option value="SECRET">SECRET (OTP / Auth Code)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Masking Rule *</label>
                <select [(ngModel)]="variableForm.maskingRule" class="w-full px-3 py-2 border rounded-xl font-semibold focus:outline-none focus:border-indigo-500">
                  <option value="none">None (Plaintext)</option>
                  <option value="last4">Last 4 Digits only</option>
                  <option value="full-mask">Full Mask (••••••)</option>
                  <option value="custom">Custom Pattern</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Retention TTL Seconds (Optional)</label>
                <input type="number" [(ngModel)]="variableForm.retentionTtlSeconds" placeholder="e.g. 600 for 10m OTP" class="w-full px-3 py-2 border rounded-xl font-mono focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input type="checkbox" id="whAllowed" [(ngModel)]="variableForm.webhookAllowed" class="rounded text-indigo-600 focus:ring-0" />
              <label for="whAllowed" class="font-bold text-slate-700 cursor-pointer">Allow variable delivery to customer webhook</label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t">
            <button (click)="showVariableModal = false" class="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100">Cancel</button>
            <button (click)="saveVariable()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md">
              {{ editingVariableId ? 'Save Variable' : 'Create Variable' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RelayVariablesComponent {
  relayService = inject(RelayService);

  activeTab: 'variables' | 'events' = 'variables';
  searchQuery = '';
  sensitivityFilter = 'ALL';

  showVariableModal = false;
  editingVariableId: string | null = null;
  variableForm = {
    key: '',
    displayName: '',
    dataType: 'string' as RelayVariableDataType,
    sensitivity: 'NORMAL' as RelayVariableSensitivity,
    maskingRule: 'none' as RelayVariableMasking,
    validationRule: '',
    retentionTtlSeconds: 0,
    webhookAllowed: true,
    uiVisibility: 'list' as 'list' | 'detail' | 'admin-only',
    isStandard: false
  };

  filteredVariables(): RelayVariable[] {
    return this.relayService.variables().filter(v => {
      if (this.sensitivityFilter !== 'ALL' && v.sensitivity !== this.sensitivityFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return v.key.toLowerCase().includes(q) || v.displayName.toLowerCase().includes(q) || v.dataType.toLowerCase().includes(q);
      }
      return true;
    });
  }

  openAddVariableModal() {
    this.editingVariableId = null;
    this.variableForm = {
      key: '',
      displayName: '',
      dataType: 'string',
      sensitivity: 'NORMAL',
      maskingRule: 'none',
      validationRule: '',
      retentionTtlSeconds: 0,
      webhookAllowed: true,
      uiVisibility: 'list',
      isStandard: false
    };
    this.showVariableModal = true;
  }

  openEditVariableModal(v: RelayVariable) {
    this.editingVariableId = v.id;
    this.variableForm = {
      key: v.key,
      displayName: v.displayName,
      dataType: v.dataType,
      sensitivity: v.sensitivity,
      maskingRule: v.maskingRule,
      validationRule: v.validationRule || '',
      retentionTtlSeconds: v.retentionTtlSeconds || 0,
      webhookAllowed: v.webhookAllowed,
      uiVisibility: v.uiVisibility,
      isStandard: v.isStandard
    };
    this.showVariableModal = true;
  }

  saveVariable() {
    if (!this.variableForm.key.trim() || !this.variableForm.displayName.trim()) return;
    if (this.editingVariableId) {
      this.relayService.updateVariable(this.editingVariableId, this.variableForm);
    } else {
      this.relayService.addVariable(this.variableForm);
    }
    this.showVariableModal = false;
  }
}
