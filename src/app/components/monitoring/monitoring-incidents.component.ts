import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { MonitorIncident } from '../../models/alert21.models';

@Component({
  selector: 'app-monitoring-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Incidents & Alert Delivery Logs</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Two-step verified outage logs, duration timelines, and multi-channel notification dispatch records.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="activeTab = 'OPEN'" 
                  [ngClass]="activeTab === 'OPEN' ? 'bg-rose-600 text-white font-extrabold shadow-xs' : 'bg-slate-100 text-slate-700'"
                  class="px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5">
            <app-icon name="alert-triangle" [size]="13"></app-icon>
            <span>Open Incidents ({{ openCount() }})</span>
          </button>
          <button (click)="activeTab = 'RESOLVED'" 
                  [ngClass]="activeTab === 'RESOLVED' ? 'bg-emerald-600 text-white font-extrabold shadow-xs' : 'bg-slate-100 text-slate-700'"
                  class="px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5">
            <app-icon name="check-circle" [size]="13"></app-icon>
            <span>Resolved ({{ resolvedCount() }})</span>
          </button>
        </div>
      </div>

      <!-- Incidents Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th class="py-3.5 px-4">Incident / Target URL</th>
                <th class="py-3.5 px-4">User Account</th>
                <th class="py-3.5 px-4">Outage Reason</th>
                <th class="py-3.5 px-4">Detection Probes</th>
                <th class="py-3.5 px-4">Started / Duration</th>
                <th class="py-3.5 px-4">Dispatched Alerts</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let inc of filteredIncidents()" class="hover:bg-slate-50/50 transition-colors">
                <!-- Target / Name -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold"
                         [ngClass]="inc.status === 'OPEN' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'">
                      <app-icon [name]="inc.status === 'OPEN' ? 'alert-triangle' : 'shield-check'" [size]="16"></app-icon>
                    </div>
                    <div>
                      <h4 class="font-bold text-slate-900">{{ inc.monitorName }}</h4>
                      <p class="text-[11px] font-mono text-slate-400 truncate max-w-xs">{{ inc.monitorUrl }}</p>
                    </div>
                  </div>
                </td>

                <!-- User Account -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-800">{{ inc.userName }}</p>
                  <p class="text-[10px] text-slate-400">{{ inc.userEmail }}</p>
                </td>

                <!-- Failure Reason -->
                <td class="py-3.5 px-4 max-w-sm">
                  <div class="space-y-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border"
                            [ngClass]="getErrorBadge(inc.errorCode).class">
                        {{ getErrorBadge(inc.errorCode).label }}
                      </span>
                      <span class="text-[9px] font-mono text-slate-400">Code: {{ inc.errorCode }}</span>
                    </div>
                    <p class="text-xs text-slate-800 font-medium leading-relaxed">{{ inc.failureReason }}</p>
                  </div>
                </td>

                <!-- Detection Probes -->
                <td class="py-3.5 px-4 font-mono text-[11px]">
                  <p class="text-slate-700 font-bold">1: {{ inc.detectionSource }}</p>
                  <p class="text-purple-600 font-semibold" *ngIf="inc.verificationSource">2: {{ inc.verificationSource }}</p>
                </td>

                <!-- Started / Duration -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-800">{{ inc.startedAt | date:'mediumDate' }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ inc.startedAt | date:'shortTime' }}</p>
                  <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold"
                        [ngClass]="inc.status === 'OPEN' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'">
                    {{ inc.durationText }}
                  </span>
                </td>

                <!-- Dispatched Alerts -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2">
                    <span title="Email Alerts Sent" class="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      <app-icon name="mail" [size]="11"></app-icon> {{ inc.alertsSent.email }}
                    </span>
                    <span title="SMS Alerts Sent" class="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      <app-icon name="smartphone" [size]="11"></app-icon> {{ inc.alertsSent.sms }}
                    </span>
                    <span title="WhatsApp Alerts Sent" class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <app-icon name="message-square" [size]="11"></app-icon> {{ inc.alertsSent.whatsapp }}
                    </span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <button 
                    (click)="openResendModal(inc)" 
                    class="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px] transition-all">
                    Resend Alert
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredIncidents().length === 0">
                <td colspan="7" class="py-12 text-center text-slate-400">
                  <app-icon name="shield-check" [size]="32" className="mx-auto mb-2 text-emerald-500 opacity-60"></app-icon>
                  <p class="font-bold text-slate-600">No {{ activeTab.toLowerCase() }} incidents recorded.</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">All monitored endpoints are operating normally within SLA.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Resend Modal -->
      <div *ngIf="selectedIncident" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">Manual Alert Dispatch</h3>
            <button (click)="selectedIncident = null" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <p class="text-xs text-slate-600">
            Resend incident alert for <strong class="font-bold text-slate-900">{{ selectedIncident.monitorName }}</strong>.
          </p>

          <div class="space-y-3 font-sans">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Select Alert Channel</label>
              <select [(ngModel)]="resendChannel" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
                <option value="EMAIL">Email (Included)</option>
                <option value="SMS">SMS (DLT Template)</option>
                <option value="WHATSAPP">WhatsApp (Meta Utility Template)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mandatory Admin Reason</label>
              <textarea 
                [(ngModel)]="resendReason" 
                rows="3" 
                placeholder="Reason for manual dispatch..." 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-medium">
              </textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button (click)="selectedIncident = null" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="confirmResend()" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              Confirm & Resend Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MonitoringIncidentsComponent implements OnInit {
  dataService = inject(DataService);
  activeTab: 'OPEN' | 'RESOLVED' = 'OPEN';
  selectedIncident: MonitorIncident | null = null;
  resendChannel = 'EMAIL';
  resendReason = '';

  async ngOnInit() {
    await this.dataService.fetchGlobalIncidents();
  }

  openCount() {
    return this.dataService.monitorIncidents().filter(i => i.status === 'OPEN').length;
  }

  resolvedCount() {
    return this.dataService.monitorIncidents().filter(i => i.status === 'RESOLVED').length;
  }

  filteredIncidents() {
    return this.dataService.monitorIncidents().filter(i => i.status === this.activeTab);
  }

  getErrorBadge(code: string) {
    const c = (code || '').toUpperCase();
    if (c.includes('TIMEOUT')) {
      return { label: '⏱️ Connection Timeout', class: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    if (c.includes('DNS')) {
      return { label: '🌐 DNS Resolution Failure', class: 'bg-rose-50 text-rose-800 border-rose-200' };
    }
    if (c.includes('REFUSED')) {
      return { label: '🔌 Connection Refused', class: 'bg-red-50 text-red-800 border-red-200' };
    }
    if (c.includes('SOCKET') || c.includes('RESET')) {
      return { label: '🔀 Socket Reset / Dropped', class: 'bg-orange-50 text-orange-800 border-orange-200' };
    }
    if (c.includes('REDIRECT')) {
      return { label: '🔁 Redirect Loop', class: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
    }
    if (c.includes('SSL') || c.includes('TLS')) {
      return { label: '🔒 SSL / TLS Failure', class: 'bg-purple-50 text-purple-800 border-purple-200' };
    }
    if (c.includes('5XX') || c.includes('500') || c.includes('502') || c.includes('503')) {
      return { label: '⚠️ HTTP 5xx Server Error', class: 'bg-rose-50 text-rose-800 border-rose-200' };
    }
    if (c.includes('4XX') || c.includes('404') || c.includes('403')) {
      return { label: '🚫 HTTP 4xx Client Error', class: 'bg-blue-50 text-blue-800 border-blue-200' };
    }
    return { label: '⚠️ Outage Detected', class: 'bg-slate-100 text-slate-800 border-slate-200' };
  }

  openResendModal(inc: MonitorIncident) {
    this.selectedIncident = inc;
    this.resendReason = '';
  }

  async confirmResend() {
    if (!this.selectedIncident || !this.resendReason.trim()) return;
    await this.dataService.resendIncidentAlert(this.selectedIncident.id, this.resendChannel, this.resendReason);
    this.selectedIncident = null;
  }
}
