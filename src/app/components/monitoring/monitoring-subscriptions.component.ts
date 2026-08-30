import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { MonitoringSubscription } from '../../models/alert21.models';

@Component({
  selector: 'app-monitoring-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Monitoring Subscriptions & Entitlements</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Manage user monitoring subscriptions, monitor quota entitlements, renewal cycles, and abuse status.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs border border-purple-100 font-mono">
            {{ dataService.monitoringSubscriptions().length }} Active Accounts
          </span>
        </div>
      </div>

      <!-- Subscriptions Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th class="py-3.5 px-4">User / Company</th>
                <th class="py-3.5 px-4">Current Plan</th>
                <th class="py-3.5 px-4">Monitor Quota Usage</th>
                <th class="py-3.5 px-4">Contacts Usage</th>
                <th class="py-3.5 px-4">Billing Cycle</th>
                <th class="py-3.5 px-4">Renewal Date</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let s of dataService.monitoringSubscriptions()" class="hover:bg-slate-50/50 transition-colors">
                <!-- User / Company -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-900">{{ s.userName }}</p>
                  <p class="text-[11px] text-slate-500">{{ s.companyName }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ s.userEmail }}</p>
                </td>

                <!-- Current Plan -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 font-mono">
                    {{ s.planName }}
                  </span>
                </td>

                <!-- Monitor Quota -->
                <td class="py-3.5 px-4">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span class="text-slate-700">{{ s.currentMonitorsCount }} / {{ s.maxMonitorsQuota }}</span>
                      <span class="text-slate-400">{{ (s.currentMonitorsCount / s.maxMonitorsQuota) * 100 | number:'1.0-0' }}%</span>
                    </div>
                    <div class="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-600 rounded-full" [style.width.%]="(s.currentMonitorsCount / s.maxMonitorsQuota) * 100"></div>
                    </div>
                  </div>
                </td>

                <!-- Contacts Usage -->
                <td class="py-3.5 px-4 font-mono font-bold text-slate-700">
                  {{ s.currentContactsCount }} / {{ s.maxContactsQuota }} contacts
                </td>

                <!-- Billing Cycle -->
                <td class="py-3.5 px-4 font-mono">
                  <span class="font-bold text-slate-800 uppercase">{{ s.billingCycle }}</span>
                  <p class="text-[10px] text-slate-400">Paid: ₹{{ s.paidAmount | number:'1.2-2' }}</p>
                </td>

                <!-- Renewal Date -->
                <td class="py-3.5 px-4 font-mono">
                  <p class="font-bold text-slate-800">{{ s.renewalDate | date:'mediumDate' }}</p>
                  <span *ngIf="s.autoRenew" class="text-[10px] font-bold text-emerald-600">Auto-Renew ON</span>
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
                    {{ s.status }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button (click)="openQuotaModal(s)" class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] transition-all">
                      Adjust Quota
                    </button>
                    <button (click)="togglePause(s)" class="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px] transition-all">
                      {{ s.status === 'PAUSED' ? 'Resume' : 'Pause' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Adjust Quota Modal (Section 5.4 with Mandatory Admin Note) -->
      <div *ngIf="selectedSub" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 font-sans">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-black text-slate-900">Adjust Monitor Entitlement Quota</h3>
            <button (click)="selectedSub = null" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <p class="text-xs text-slate-600">
            Adjusting entitlement quota for <strong class="text-slate-900">{{ selectedSub.userName }}</strong> ({{ selectedSub.companyName }}).
          </p>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Max Website Monitors Quota</label>
              <input type="number" [(ngModel)]="newMaxMonitors" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold">
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Max Notification Contacts Quota</label>
              <input type="number" [(ngModel)]="newMaxContacts" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold">
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mandatory Admin Audit Note *</label>
              <textarea 
                [(ngModel)]="adminNote" 
                rows="3" 
                placeholder="Reason for quota change (e.g. Add-on purchased offline, SLA upgrade)..." 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-medium">
              </textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="selectedSub = null" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="confirmQuotaChange()" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              Confirm & Save Entitlement
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MonitoringSubscriptionsComponent implements OnInit {
  dataService = inject(DataService);
  selectedSub: MonitoringSubscription | null = null;
  newMaxMonitors = 20;
  newMaxContacts = 5;
  adminNote = '';

  async ngOnInit() {
    await this.dataService.fetchMonitoringSubscriptions();
  }

  openQuotaModal(s: MonitoringSubscription) {
    this.selectedSub = s;
    this.newMaxMonitors = s.maxMonitorsQuota;
    this.newMaxContacts = s.maxContactsQuota;
    this.adminNote = '';
  }

  async confirmQuotaChange() {
    if (!this.selectedSub || !this.adminNote.trim()) return;
    await this.dataService.updateSubscriptionQuota(this.selectedSub.id, this.newMaxMonitors, this.newMaxContacts, this.adminNote);
    this.selectedSub = null;
  }

  async togglePause(s: MonitoringSubscription) {
    const isPaused = s.status === 'PAUSED';
    const note = prompt(`Enter mandatory admin note for ${isPaused ? 'resuming' : 'pausing'} subscription:`);
    if (note && note.trim()) {
      await this.dataService.togglePauseSubscription(s.id, !isPaused, note);
    }
  }
}
