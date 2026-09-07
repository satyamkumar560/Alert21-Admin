import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { WhatsappPhoneNumber } from '../../models/alert21.models';

@Component({
  selector: 'app-whatsapp-numbers',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">WhatsApp Phone Numbers</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Cross-tenant Meta sender identities, phone number IDs, quality health ratings, and messaging throughput tiers.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="refresh()" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Filters & Controls Bar -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Search -->
          <div class="relative w-full sm:w-72">
            <app-icon name="search" [size]="14" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search phone number, user, WABA..." 
              class="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all">
          </div>

          <!-- Status Filter -->
          <select 
            [(ngModel)]="selectedStatus" 
            (change)="refresh()"
            class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="RESTRICTED">Restricted</option>
            <option value="DISCONNECTED">Disconnected</option>
          </select>
        </div>

        <div class="text-xs font-bold text-slate-500">
          Total: <span class="text-slate-900 font-black">{{ filteredNumbers().length }}</span> Numbers
        </div>
      </div>

      <!-- Numbers Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">Display Phone Number</th>
                <th class="py-3 px-4">User Account (Tenant)</th>
                <th class="py-3 px-4">WABA ID</th>
                <th class="py-3 px-4">Phone Number ID</th>
                <th class="py-3 px-4">Quality Rating</th>
                <th class="py-3 px-4">Messaging Tier</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              <tr *ngFor="let n of filteredNumbers()" class="hover:bg-slate-50/60 transition-all">
                <!-- Phone Number -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-slate-900 text-[13px]">{{ n.displayPhoneNumber }}</span>
                    <span *ngIf="n.isDefault" class="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] font-bold">DEFAULT</span>
                  </div>
                  <div class="text-[11px] text-slate-400 font-medium" *ngIf="n.verifiedName">{{ n.verifiedName }}</div>
                </td>

                <!-- User Account -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900">{{ n.userName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">{{ n.userEmail }}</div>
                </td>

                <!-- WABA ID -->
                <td class="py-3.5 px-4 font-mono text-[11px] text-slate-600 font-bold">
                  {{ n.wabaId }}
                </td>

                <!-- Phone Number ID -->
                <td class="py-3.5 px-4 font-mono text-[11px] text-indigo-600 font-bold">
                  {{ n.phoneNumberId }}
                </td>

                <!-- Quality Rating -->
                <td class="py-3.5 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': n.qualityRating === 'GREEN',
                          'bg-amber-50 text-amber-700 border border-amber-200': n.qualityRating === 'YELLOW',
                          'bg-rose-50 text-rose-700 border border-rose-200': n.qualityRating === 'RED',
                          'bg-slate-100 text-slate-600': n.qualityRating === 'UNKNOWN'
                        }">
                    <span class="w-1.5 h-1.5 rounded-full"
                          [ngClass]="{
                            'bg-emerald-500': n.qualityRating === 'GREEN',
                            'bg-amber-500': n.qualityRating === 'YELLOW',
                            'bg-rose-500': n.qualityRating === 'RED',
                            'bg-slate-400': n.qualityRating === 'UNKNOWN'
                          }"></span>
                    <span>{{ n.qualityRating }}</span>
                  </span>
                </td>

                <!-- Messaging Tier -->
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold text-[10px]">
                    {{ n.messagingLimitTier }}
                  </span>
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase"
                        [ngClass]="n.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
                    {{ n.status }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <button 
                    (click)="openEditModal(n)" 
                    class="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-all">
                    Edit Tier
                  </button>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="filteredNumbers().length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  <app-icon name="smartphone" [size]="32" className="mx-auto mb-2 text-slate-300"></app-icon>
                  <p class="font-bold text-sm text-slate-600">No WhatsApp phone numbers found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Modal -->
      <div *ngIf="editingNumber" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">Edit Number Limits & Health</h3>
            <button (click)="closeModal()" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase">Number</label>
              <div class="font-mono font-bold text-slate-900 text-sm">{{ editingNumber.displayPhoneNumber }}</div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Quality Rating</label>
              <select [(ngModel)]="formQualityRating" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                <option value="GREEN">GREEN (High Quality)</option>
                <option value="YELLOW">YELLOW (Medium Quality Warning)</option>
                <option value="RED">RED (Low Quality Critical)</option>
                <option value="UNKNOWN">UNKNOWN</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Messaging Limit Tier</label>
              <select [(ngModel)]="formTier" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                <option value="TIER_250">TIER_250 (250 unique customers / 24h)</option>
                <option value="TIER_1K">TIER_1K (1,000 unique customers / 24h)</option>
                <option value="TIER_10K">TIER_10K (10,000 unique customers / 24h)</option>
                <option value="TIER_100K">TIER_100K (100,000 unique customers / 24h)</option>
                <option value="TIER_UNLIMITED">TIER_UNLIMITED (Unlimited unique customers)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status</label>
              <select [(ngModel)]="formStatus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="RESTRICTED">RESTRICTED</option>
                <option value="DISCONNECTED">DISCONNECTED</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="saveChanges()" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WhatsappNumbersComponent implements OnInit {
  dataService = inject(DataService);

  searchQuery = '';
  selectedStatus = 'ALL';
  editingNumber: WhatsappPhoneNumber | null = null;

  formQualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN' = 'GREEN';
  formTier = 'TIER_1K';
  formStatus = 'ACTIVE';

  ngOnInit() {
    this.refresh();
  }

  numbersList() {
    return this.dataService.whatsappPhoneNumbers();
  }

  filteredNumbers() {
    let list = this.numbersList();
    if (this.selectedStatus !== 'ALL') {
      list = list.filter((n) => n.status === this.selectedStatus);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.displayPhoneNumber?.toLowerCase().includes(q) ||
          n.userName?.toLowerCase().includes(q) ||
          n.wabaId?.toLowerCase().includes(q) ||
          n.phoneNumberId?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  refresh() {
    this.dataService.fetchWhatsappNumbers(this.selectedStatus);
  }

  openEditModal(n: WhatsappPhoneNumber) {
    this.editingNumber = n;
    this.formQualityRating = n.qualityRating;
    this.formTier = n.messagingLimitTier;
    this.formStatus = n.status;
  }

  closeModal() {
    this.editingNumber = null;
  }

  async saveChanges() {
    if (!this.editingNumber) return;
    await this.dataService.updateWhatsappPhoneNumber(this.editingNumber.id, {
      quality_rating: this.formQualityRating,
      messaging_limit_tier: this.formTier,
      status: this.formStatus
    });
    this.closeModal();
  }
}
