import { Component, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { RelayService } from '../../services/relay.service';
import { RelayMessageType, RelayTemplateVariant } from '../../models/alert21.models';
import { NavTab } from '../layout/sidebar.component';

@Component({
  selector: 'app-relay-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Template Library & Versions</h2>
          <p class="text-xs text-slate-500 font-medium">
            Browse published message types, multiple template wording variants, version history, SHA256 checksums, and 1-click rollback.
          </p>
        </div>

        <button (click)="navigateToBuilder()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all">
          <app-icon name="plus" [size]="14"></app-icon>
          <span>Create New Template</span>
        </button>
      </div>

      <!-- SEARCH & FILTER BAR -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <app-icon name="search" [size]="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search template name, event key, sender ID, source..." 
            class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
          />
        </div>

        <select [(ngModel)]="categoryFilter" class="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
          <option value="ALL">All Categories</option>
          <option value="OTP">OTP (One-Time Passwords)</option>
          <option value="LOGIN_SECURITY">LOGIN_SECURITY (2FA)</option>
          <option value="TRANSACTION">TRANSACTION (Credit/Debit)</option>
          <option value="BUSINESS_ALERT">BUSINESS_ALERT</option>
        </select>
      </div>

      <!-- TEMPLATE CARDS LIST -->
      <div class="space-y-4">
        <div *ngFor="let msg of filteredMessageTypes()" class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden hover:border-indigo-300 transition-all">
          <!-- Card Header Strip -->
          <div class="p-5 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start md:items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <app-icon name="file-text" [size]="20"></app-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-900 text-sm">{{ msg.name }}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase"
                    [ngClass]="{
                      'bg-purple-100 text-purple-700': msg.category === 'OTP',
                      'bg-emerald-100 text-emerald-700': msg.category === 'TRANSACTION',
                      'bg-amber-100 text-amber-700': msg.category === 'LOGIN_SECURITY',
                      'bg-blue-100 text-blue-700': msg.category === 'BUSINESS_ALERT'
                    }">
                    {{ msg.category }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                    {{ msg.sourceCode }}
                  </span>
                </div>
                <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono">
                  <span>Event: <strong class="text-indigo-600">{{ msg.eventTypeKey }}</strong></span>
                  <span>•</span>
                  <span>Variants: {{ msg.variants.length }} active</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold"
                [ngClass]="msg.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
                ● {{ msg.status }}
              </span>
            </div>
          </div>

          <!-- Variants Sub-list -->
          <div class="p-5 space-y-4">
            <div *ngFor="let variant of msg.variants; let vIndex = index" class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    V{{ variant.version }}
                  </span>
                  <span class="font-mono text-xs font-semibold text-slate-800">{{ vIndex === 0 ? 'Current Active (v' + variant.version + ')' : 'Variant (v' + variant.version + ')' }}</span>
                  <span *ngIf="vIndex === 0" class="px-2 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider">
                    Default
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">SHA: {{ variant.checksum | slice:0:8 }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <button 
                    *ngIf="vIndex > 0" 
                    (click)="rollback(msg.id, variant.id)" 
                    class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-sm transition-all">
                    <app-icon name="rotate-ccw" [size]="12"></app-icon>
                    <span>Set Default</span>
                  </button>
                </div>
              </div>

              <!-- Sample Pattern & Regex Preview -->
              <div class="space-y-1.5">
                <div class="text-[11px] font-medium text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/60 font-sans">
                  <strong class="text-slate-400 text-[10px] uppercase block mb-0.5 font-bold">Sample SMS Template:</strong>
                  "{{ variant.sampleSmsText }}"
                </div>
                
                <div class="text-[11px] font-mono text-indigo-900 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100 break-all">
                  <strong class="text-indigo-400 text-[10px] uppercase block mb-0.5 font-bold">Compiled Regex Pattern:</strong>
                  <code>{{ variant.patternRegex }}</code>
                </div>
              </div>

              <!-- Senders and Variables Badges -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <span class="text-[10px] font-bold text-slate-400 uppercase">Allowed Senders</span>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    <span *ngFor="let snd of variant.senderIds" class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200">
                      {{ snd }}
                    </span>
                  </div>
                </div>

                <div>
                  <span class="text-[10px] font-bold text-slate-400 uppercase">Mapped Variables ({{ variant.variables.length }})</span>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    <span *ngFor="let vm of variant.variables" class="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold">
                      {{'{{' + (vm.variableKey || vm.key || vm.name || 'var') + '}}'}}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RelayTemplatesComponent implements OnInit {
  relayService = inject(RelayService);
  @Output() navigate = new EventEmitter<NavTab>();

  ngOnInit() {
    this.relayService.fetchMessageTypes();
  }

  searchQuery = '';
  categoryFilter = 'ALL';

  filteredMessageTypes(): RelayMessageType[] {
    return this.relayService.messageTypes().filter(m => {
      if (this.categoryFilter !== 'ALL' && m.category !== this.categoryFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.eventTypeKey.toLowerCase().includes(q) || m.sourceCode.toLowerCase().includes(q);
      }
      return true;
    });
  }

  navigateToBuilder() {
    this.navigate.emit('relay-builder');
  }

  rollback(msgTypeId: string, variantId: string) {
    this.relayService.rollbackVariant(msgTypeId, variantId);
  }
}
