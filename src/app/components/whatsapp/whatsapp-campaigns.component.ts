import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { WhatsappCampaign } from '../../models/alert21.models';

@Component({
  selector: 'app-whatsapp-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Broadcast Campaigns (All Users)</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Monitor bulk broadcast queues, delivery progression, read rates, and cross-tenant execution states.
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
          <!-- Status Filter -->
          <select 
            [(ngModel)]="selectedStatus" 
            (change)="refresh()"
            class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Campaign Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PAUSED">Paused</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div class="text-xs font-bold text-slate-500">
          Showing <span class="text-slate-900 font-black">{{ campaignsList().length }}</span> Campaigns
        </div>
      </div>

      <!-- Campaigns Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">Campaign Name & User</th>
                <th class="py-3 px-4">Sender Number</th>
                <th class="py-3 px-4">Template</th>
                <th class="py-3 px-4 text-center">Audience</th>
                <th class="py-3 px-4">Progress & Delivery</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Started / Scheduled</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              <tr *ngFor="let c of campaignsList()" class="hover:bg-slate-50/60 transition-all">
                <!-- Name & User -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900">{{ c.name }}</div>
                  <div class="text-[11px] text-slate-400">{{ c.userName }} ({{ c.userEmail }})</div>
                </td>

                <!-- Sender Number -->
                <td class="py-3.5 px-4 font-mono font-bold text-slate-800 text-[11px]">
                  {{ c.displayPhoneNumber || 'Primary WABA' }}
                </td>

                <!-- Template -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-800">{{ c.templateName || 'Template' }}</div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold uppercase">{{ c.templateCategory }}</span>
                </td>

                <!-- Audience Count -->
                <td class="py-3.5 px-4 text-center font-mono font-black text-slate-900">
                  {{ c.totalAudience | number }}
                </td>

                <!-- Progress & Delivery Stats -->
                <td class="py-3.5 px-4">
                  <div class="space-y-1 w-48">
                    <div class="flex items-center justify-between text-[10px] font-bold">
                      <span class="text-emerald-600">✓ {{ c.deliveredCount }} Del</span>
                      <span class="text-blue-600">👁 {{ c.readCount }} Read</span>
                      <span class="text-rose-600">✗ {{ c.failedCount }} Fail</span>
                    </div>
                    <!-- Progress Bar -->
                    <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                      <div class="bg-emerald-500 h-full" [style.width.%]="(c.deliveredCount / (c.totalAudience || 1)) * 100"></div>
                      <div class="bg-rose-500 h-full" [style.width.%]="(c.failedCount / (c.totalAudience || 1)) * 100"></div>
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': c.status === 'RUNNING' || c.status === 'COMPLETED',
                          'bg-amber-50 text-amber-700 border border-amber-200': c.status === 'SCHEDULED' || c.status === 'PAUSED',
                          'bg-rose-50 text-rose-700 border border-rose-200': c.status === 'FAILED' || c.status === 'CANCELLED',
                          'bg-slate-100 text-slate-600': c.status === 'DRAFT'
                        }">
                    {{ c.status }}
                  </span>
                </td>

                <!-- Date -->
                <td class="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                  {{ (c.startedAt || c.scheduledAt || c.createdAt) | date:'mediumDate' }}
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      *ngIf="c.status === 'RUNNING'"
                      (click)="updateStatus(c.id, 'PAUSED')" 
                      class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] transition-all">
                      Pause
                    </button>
                    <button 
                      *ngIf="c.status === 'PAUSED'"
                      (click)="updateStatus(c.id, 'RUNNING')" 
                      class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-all">
                      Resume
                    </button>
                    <button 
                      *ngIf="c.status === 'RUNNING' || c.status === 'SCHEDULED'"
                      (click)="updateStatus(c.id, 'CANCELLED')" 
                      class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-all">
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="campaignsList().length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  <app-icon name="send" [size]="32" className="mx-auto mb-2 text-slate-300"></app-icon>
                  <p class="font-bold text-sm text-slate-600">No campaigns found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class WhatsappCampaignsComponent implements OnInit {
  dataService = inject(DataService);

  selectedStatus = 'ALL';

  ngOnInit() {
    this.refresh();
  }

  campaignsList() {
    return this.dataService.whatsappCampaigns();
  }

  refresh() {
    this.dataService.fetchWhatsappCampaigns(this.selectedStatus);
  }

  async updateStatus(id: string, status: string) {
    await this.dataService.updateWhatsappCampaignStatus(id, status);
  }
}
