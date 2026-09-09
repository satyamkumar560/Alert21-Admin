import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { RelayService } from '../../services/relay.service';
import { RelaySource, RelaySender, RelaySourceType, RelaySenderMatchMode } from '../../models/alert21.models';

@Component({
  selector: 'app-relay-sources',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Source & Sender Master</h2>
          <p class="text-xs text-slate-500 font-medium">
            Maintain logical service/business sources (GST, GoDaddy, Banks, CRMs) and map provider sender ID aliases.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openAddSourceModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all">
            <app-icon name="plus" [size]="14"></app-icon>
            <span>Add Business Source</span>
          </button>
          <button (click)="openAddSenderModal()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all">
            <app-icon name="tag" [size]="14"></app-icon>
            <span>Map Sender ID</span>
          </button>
        </div>
      </div>

      <!-- Navigation Sub-tabs -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button 
          (click)="activeTab = 'sources'"
          [class]="activeTab === 'sources' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
          <app-icon name="layers" [size]="14"></app-icon>
          <span>Sources / Services Master</span>
          <span class="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">{{ relayService.sources().length }}</span>
        </button>

        <button 
          (click)="activeTab = 'senders'"
          [class]="activeTab === 'senders' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
          <app-icon name="tag" [size]="14"></app-icon>
          <span>Sender ID Aliases</span>
          <span class="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">{{ relayService.senders().length }}</span>
        </button>
      </div>

      <!-- SEARCH & FILTER BAR -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <app-icon name="search" [size]="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search by source name, code, sender alias..." 
            class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
          />
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <select [(ngModel)]="typeFilter" class="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Source Types</option>
            <option value="GOVT_PORTAL">Govt Portal (GST/IT)</option>
            <option value="BANK">Banking / UPI</option>
            <option value="CRM">CRM / ERP</option>
            <option value="SAAS">SaaS / Cloud</option>
            <option value="CUSTOM">Custom Portals</option>
          </select>
        </div>
      </div>

      <!-- 1. SOURCES TABLE TAB -->
      <div *ngIf="activeTab === 'sources'" class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Source Name & Code</th>
                <th class="py-3 px-4">Type</th>
                <th class="py-3 px-4">Country</th>
                <th class="py-3 px-4">Delivery Channels</th>
                <th class="py-3 px-4">Mapped Sender</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Notes</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let src of filteredSources()" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <app-icon [name]="src.logoIcon || 'layers'" [size]="16"></app-icon>
                    </div>
                    <div>
                      <span class="font-extrabold text-slate-900 text-sm">{{ src.sourceName }}</span>
                      <span class="block font-mono text-indigo-600 text-[11px] font-bold">[{{ src.sourceCode }}]</span>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide"
                    [ngClass]="getSourceTypeBadgeClass(src.sourceType)">
                    {{ src.sourceType }}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-bold text-slate-700 uppercase font-mono text-[11px]">{{ src.country }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                      [ngClass]="src.dashboardAllowed !== false ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-400'">
                      Dash: {{ src.dashboardAllowed !== false ? 'YES' : 'NO' }}
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                      [ngClass]="src.webhookAllowed !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'">
                      Webhook: {{ src.webhookAllowed !== false ? 'YES' : 'NO' }}
                    </span>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <!-- If a sender is mapped: Show single sender badge with delete/edit -->
                    <ng-container *ngIf="getSendersForSource(src).length > 0">
                      <div *ngFor="let s of getSendersForSource(src)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs font-extrabold shadow-sm group">
                        <span>{{ s.senderValue }}</span>
                        <button (click)="deleteSenderDirect(s, $event)" title="Delete / Change Sender" class="text-indigo-400 hover:text-rose-600 transition-colors p-0.5 rounded hover:bg-rose-50">
                          <app-icon name="x" [size]="12"></app-icon>
                        </button>
                      </div>
                    </ng-container>

                    <!-- If no sender mapped yet: Show + Map Sender button -->
                    <button *ngIf="getSendersForSource(src).length === 0" (click)="openAddSenderModal(src)" class="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1">
                      <app-icon name="plus" [size]="12"></app-icon>
                      <span>Map Sender</span>
                    </button>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <button (click)="relayService.toggleSourceStatus(src.id)" class="cursor-pointer">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                      [ngClass]="src.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'">
                      {{ src.status }}
                    </span>
                  </button>
                </td>
                <td class="py-3.5 px-4 max-w-xs truncate text-slate-500 text-[11px]">
                  {{ src.notes || '—' }}
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button (click)="openEditSourceModal(src)" class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all mr-1">
                    <app-icon name="edit" [size]="14"></app-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. SENDERS TABLE TAB -->
      <div *ngIf="activeTab === 'senders'" class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Raw Sender Observed</th>
                <th class="py-3 px-4">Normalised Sender</th>
                <th class="py-3 px-4">Logical Source</th>
                <th class="py-3 px-4">Priority</th>
                <th class="py-3 px-4">Match Mode</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let snd of filteredSenders()" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>{{ snd.senderValue }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-4 font-mono font-bold text-indigo-700">
                  {{ snd.normalisedSender || snd.senderValue }}
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-bold text-slate-800">{{ snd.sourceName || snd.sourceCode }}</span>
                  <span class="ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-[10px] font-bold">[{{ snd.sourceCode }}]</span>
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-700 font-bold">
                  {{ snd.priority || 100 }}
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold"
                    [ngClass]="snd.matchMode === 'EXACT' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'">
                    {{ snd.matchMode }}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="snd.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'">
                    {{ snd.status }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button (click)="relayService.deleteSender(snd.id)" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ADD/EDIT SOURCE MODAL -->
      <div *ngIf="showSourceModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <h3 class="font-extrabold text-slate-900 text-base">{{ editingSourceId ? 'Edit Business Source' : 'Register New Business Source' }}</h3>
            <button (click)="showSourceModal = false" class="text-slate-400 hover:text-slate-600"><app-icon name="x" [size]="18"></app-icon></button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Source Code (Immutable uppercase key) *</label>
              <input type="text" [(ngModel)]="sourceForm.sourceCode" placeholder="e.g. GST, GODADDY, ZOHOCRM, HDFC" class="w-full px-3 py-2 border rounded-xl font-mono uppercase focus:outline-none focus:border-indigo-500" [disabled]="!!editingSourceId" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Source Display Name *</label>
              <input type="text" [(ngModel)]="sourceForm.sourceName" placeholder="e.g. GST Portal (Govt of India)" class="w-full px-3 py-2 border rounded-xl font-medium focus:outline-none focus:border-indigo-500" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Source Type *</label>
                <select [(ngModel)]="sourceForm.sourceType" class="w-full px-3 py-2 border rounded-xl font-semibold focus:outline-none focus:border-indigo-500">
                  <option value="GOVT_PORTAL">GOVT_PORTAL</option>
                  <option value="BANK">BANK</option>
                  <option value="CRM">CRM</option>
                  <option value="SAAS">SAAS</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Country *</label>
                <input type="text" [(ngModel)]="sourceForm.country" placeholder="IN / global" class="w-full px-3 py-2 border rounded-xl font-medium focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <!-- Delivery Permissions -->
            <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="sourceForm.dashboardAllowed" class="rounded text-indigo-600 focus:ring-0" />
                <span class="font-bold text-slate-700">Dashboard Allowed</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="sourceForm.webhookAllowed" class="rounded text-indigo-600 focus:ring-0" />
                <span class="font-bold text-slate-700">Webhook Allowed</span>
              </label>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Internal Notes & Description</label>
              <textarea [(ngModel)]="sourceForm.notes" rows="2" placeholder="e.g. Relays login OTP and bank credit notifications..." class="w-full px-3 py-2 border rounded-xl font-medium focus:outline-none focus:border-indigo-500"></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t">
            <button (click)="showSourceModal = false" class="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100">Cancel</button>
            <button (click)="saveSource()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md">
              {{ editingSourceId ? 'Save Changes' : 'Create Source' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ADD SENDER ID MODAL -->
      <div *ngIf="showSenderModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <h3 class="font-extrabold text-slate-900 text-base">Map Sender ID Alias</h3>
            <button (click)="showSenderModal = false" class="text-slate-400 hover:text-slate-600"><app-icon name="x" [size]="18"></app-icon></button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Business Source *</label>
              <select [(ngModel)]="senderForm.sourceId" (change)="onSourceSelectedForSender()" class="w-full px-3 py-2 border rounded-xl font-semibold focus:outline-none focus:border-indigo-500">
                <option *ngFor="let s of relayService.sources()" [value]="s.id">{{ s.sourceName }} [{{ s.sourceCode }}]</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Exact Sender ID Observed on Android *</label>
              <input type="text" [(ngModel)]="senderForm.senderValue" (ngModelChange)="onRawSenderChanged()" placeholder="e.g. JD-GSTNIN, VM-HDFCBK, GODADY" class="w-full px-3 py-2 border rounded-xl font-mono uppercase focus:outline-none focus:border-indigo-500" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Normalised Sender</label>
                <input type="text" [(ngModel)]="senderForm.normalisedSender" placeholder="e.g. GSTNIN, HDFCBK" class="w-full px-3 py-2 border rounded-xl font-mono uppercase focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Priority (e.g. 100)</label>
                <input type="number" [(ngModel)]="senderForm.priority" class="w-full px-3 py-2 border rounded-xl font-mono focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Match Mode *</label>
                <select [(ngModel)]="senderForm.matchMode" class="w-full px-3 py-2 border rounded-xl font-semibold focus:outline-none focus:border-indigo-500">
                  <option value="EXACT">EXACT</option>
                  <option value="WILDCARD">WILDCARD (*)</option>
                  <option value="PREFIX">PREFIX</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Alias Group</label>
                <input type="text" [(ngModel)]="senderForm.aliasGroup" placeholder="e.g. JIO-MUMBAI" class="w-full px-3 py-2 border rounded-xl font-mono focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t">
            <button (click)="showSenderModal = false" class="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100">Cancel</button>
            <button (click)="saveSender()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md">
              Save Sender ID
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RelaySourcesComponent implements OnInit {
  relayService = inject(RelayService);

  ngOnInit() {
    this.relayService.fetchSources();
    this.relayService.fetchSenders();
  }

  activeTab: 'sources' | 'senders' = 'sources';
  searchQuery = '';
  typeFilter = 'ALL';

  showSourceModal = false;
  editingSourceId: string | null = null;
  sourceForm = {
    sourceCode: '',
    sourceName: '',
    sourceType: 'GOVT_PORTAL' as RelaySourceType,
    country: 'IN',
    dashboardAllowed: true,
    webhookAllowed: true,
    notes: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  };

  showSenderModal = false;
  senderForm = {
    sourceId: '',
    sourceCode: '',
    sourceName: '',
    senderValue: '',
    normalisedSender: '',
    priority: 100,
    exactMatch: true,
    aliasGroup: '',
    matchMode: 'EXACT' as RelaySenderMatchMode,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  };

  filteredSources(): RelaySource[] {
    return this.relayService.sources().filter(s => {
      if (this.typeFilter !== 'ALL' && s.sourceType !== this.typeFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return s.sourceName.toLowerCase().includes(q) || s.sourceCode.toLowerCase().includes(q) || (s.notes || '').toLowerCase().includes(q);
      }
      return true;
    });
  }

  filteredSenders(): RelaySender[] {
    return this.relayService.senders().filter(snd => {
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return snd.senderValue.toLowerCase().includes(q) || (snd.normalisedSender || '').toLowerCase().includes(q) || snd.sourceCode.toLowerCase().includes(q) || (snd.sourceName || '').toLowerCase().includes(q);
      }
      return true;
    });
  }

  getSendersForSource(source: RelaySource | string): RelaySender[] {
    const srcId = typeof source === 'string' ? source : source.id;
    const srcCode = typeof source === 'string' ? '' : (source.sourceCode || '').toUpperCase();
    return this.relayService.senders().filter(s => {
      if (s.sourceId && s.sourceId === srcId) return true;
      if (srcCode && s.sourceCode && s.sourceCode.toUpperCase() === srcCode) return true;
      return false;
    });
  }

  getSourceTypeBadgeClass(type: RelaySourceType): string {
    switch (type) {
      case 'GOVT_PORTAL': return 'bg-purple-100 text-purple-800';
      case 'BANK': return 'bg-emerald-100 text-emerald-800';
      case 'CRM': return 'bg-amber-100 text-amber-800';
      case 'SAAS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  openAddSourceModal() {
    this.editingSourceId = null;
    this.sourceForm = { sourceCode: '', sourceName: '', sourceType: 'GOVT_PORTAL', country: 'IN', dashboardAllowed: true, webhookAllowed: true, notes: '', status: 'ACTIVE' };
    this.showSourceModal = true;
  }

  openEditSourceModal(src: RelaySource) {
    this.editingSourceId = src.id;
    this.sourceForm = {
      sourceCode: src.sourceCode,
      sourceName: src.sourceName,
      sourceType: src.sourceType,
      country: src.country,
      dashboardAllowed: src.dashboardAllowed !== false,
      webhookAllowed: src.webhookAllowed !== false,
      notes: src.notes || '',
      status: src.status
    };
    this.showSourceModal = true;
  }

  saveSource() {
    if (!this.sourceForm.sourceCode.trim() || !this.sourceForm.sourceName.trim()) return;
    if (this.editingSourceId) {
      this.relayService.updateSource(this.editingSourceId, this.sourceForm);
    } else {
      this.relayService.addSource(this.sourceForm);
    }
    this.showSourceModal = false;
  }

  openAddSenderModal(source?: RelaySource) {
    const src = source || this.relayService.sources()[0];
    this.senderForm = {
      sourceId: src ? src.id : '',
      sourceCode: src ? src.sourceCode : '',
      sourceName: src ? src.sourceName : '',
      senderValue: '',
      normalisedSender: '',
      priority: 100,
      exactMatch: true,
      aliasGroup: '',
      matchMode: 'EXACT',
      status: 'ACTIVE'
    };
    this.showSenderModal = true;
  }

  onRawSenderChanged() {
    const raw = this.senderForm.senderValue || '';
    // Auto-strip 2-letter operator prefix (e.g. JD-GSTNIN -> GSTNIN)
    this.senderForm.normalisedSender = raw.replace(/^[A-Za-z]{2}-/, '');
  }

  onSourceSelectedForSender() {
    const src = this.relayService.sources().find(s => s.id === this.senderForm.sourceId);
    if (src) {
      this.senderForm.sourceCode = src.sourceCode;
      this.senderForm.sourceName = src.sourceName;
    }
  }

  async saveSender() {
    if (!this.senderForm.sourceId || !this.senderForm.senderValue.trim()) return;
    
    // If source already has an existing sender mapped, remove the old one first so only single sender remains
    const existingSenders = this.getSendersForSource(this.senderForm.sourceId);
    if (existingSenders.length > 0) {
      for (const oldSender of existingSenders) {
        await this.relayService.deleteSender(oldSender.id);
      }
    }

    await this.relayService.addSender(this.senderForm);
    this.showSenderModal = false;
  }

  deleteSenderDirect(sender: RelaySender, event: Event) {
    event.stopPropagation();
    if (confirm(`Remove sender ID "${sender.senderValue}"?`)) {
      this.relayService.deleteSender(sender.id);
    }
  }
}
