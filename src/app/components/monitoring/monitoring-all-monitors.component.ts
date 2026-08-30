import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { WebsiteMonitor, MonitorState } from '../../models/alert21.models';

@Component({
  selector: 'app-monitoring-all-monitors',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">All Website Monitors (Global)</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Admin oversight of all registered client website monitors, real-time response latency, SSL states, and probe execution.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100 font-mono">
            {{ filteredMonitors().length }} Monitors Total
          </span>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <!-- Search Input -->
        <div class="relative w-full md:w-80">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search by URL, Name, or User..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium transition-all"
          />
          <span class="absolute left-3 top-2.5 text-slate-400">
            <app-icon name="globe" [size]="14"></app-icon>
          </span>
        </div>

        <!-- Filter Status Buttons -->
        <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button 
            *ngFor="let tab of filterTabs" 
            (click)="selectedStatus = tab.key"
            [ngClass]="selectedStatus === tab.key ? 'bg-indigo-600 text-white font-extrabold shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
            class="px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap">
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Monitors Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th class="py-3.5 px-4">Website / Target URL</th>
                <th class="py-3.5 px-4">User Account</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4">Interval / Timeout</th>
                <th class="py-3.5 px-4">Response Time</th>
                <th class="py-3.5 px-4">SSL Expiry</th>
                <th class="py-3.5 px-4">Uptime (30d)</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let m of filteredMonitors()" class="hover:bg-slate-50/50 transition-colors">
                <!-- Website / Name -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <app-icon name="globe" [size]="16"></app-icon>
                    </div>
                    <div>
                      <h4 class="font-bold text-slate-900">{{ m.name }}</h4>
                      <a [href]="m.url" target="_blank" class="text-[11px] text-indigo-600 hover:underline font-mono flex items-center gap-1">
                        <span>{{ m.url }}</span>
                        <app-icon name="external-link" [size]="10"></app-icon>
                      </a>
                    </div>
                  </div>
                </td>

                <!-- User Account -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-800">{{ m.userName }}</p>
                  <p class="text-[10px] text-slate-400">{{ m.userEmail }}</p>
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800 border border-emerald-200': m.status === 'UP',
                          'bg-rose-100 text-rose-800 border border-rose-200': m.status === 'DOWN',
                          'bg-amber-100 text-amber-800 border border-amber-200': m.status === 'DEGRADED' || m.status === 'SUSPECT',
                          'bg-slate-100 text-slate-700 border border-slate-200': m.status === 'PAUSED'
                        }">
                    <span class="w-1.5 h-1.5 rounded-full" 
                          [ngClass]="{
                            'bg-emerald-500': m.status === 'UP',
                            'bg-rose-500 animate-pulse': m.status === 'DOWN',
                            'bg-amber-500': m.status === 'DEGRADED' || m.status === 'SUSPECT',
                            'bg-slate-400': m.status === 'PAUSED'
                          }"></span>
                    {{ m.status }}
                  </span>
                </td>

                <!-- Interval -->
                <td class="py-3.5 px-4 font-mono text-slate-600">
                  <p class="font-bold">{{ m.intervalSeconds }}s interval</p>
                  <p class="text-[10px] text-slate-400">Timeout: {{ m.timeoutSeconds }}s</p>
                </td>

                <!-- Response Time -->
                <td class="py-3.5 px-4">
                  <span *ngIf="m.status !== 'PAUSED'" class="font-mono font-bold"
                        [ngClass]="(m.responseTimeMs || 0) > 1000 ? 'text-amber-600' : 'text-slate-900'">
                    {{ m.responseTimeMs }} ms
                  </span>
                  <span *ngIf="m.status === 'PAUSED'" class="text-slate-400 font-mono text-[11px]">—</span>
                </td>

                <!-- SSL Certificate -->
                <td class="py-3.5 px-4">
                  <div *ngIf="m.sslEnabled" class="flex items-center gap-1.5">
                    <app-icon name="shield-check" [size]="13" className="text-emerald-600"></app-icon>
                    <span class="text-[11px] font-bold text-slate-700">{{ m.sslDaysRemaining }} days</span>
                  </div>
                  <span *ngIf="!m.sslEnabled" class="text-[10px] text-slate-400 font-bold uppercase">Disabled</span>
                </td>

                <!-- Uptime 30d -->
                <td class="py-3.5 px-4 font-mono font-bold"
                    [ngClass]="(m.uptime30d || 0) >= 99 ? 'text-emerald-600' : 'text-amber-600'">
                  {{ m.uptime30d }}%
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      (click)="recheck(m)" 
                      title="Force safe re-check"
                      class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] transition-all flex items-center gap-1">
                      <app-icon name="rotate-cw" [size]="12"></app-icon>
                      <span>Recheck</span>
                    </button>
                    <button 
                      (click)="togglePause(m)" 
                      [title]="m.isPaused ? 'Resume Monitoring' : 'Pause Monitoring'"
                      class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
                      <app-icon [name]="m.isPaused ? 'play' : 'pause'" [size]="13"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredMonitors().length === 0">
                <td colspan="8" class="text-center py-10 text-slate-400 text-xs">
                  No website monitors match the search filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MonitoringAllMonitorsComponent implements OnInit {
  dataService = inject(DataService);
  searchQuery = '';
  selectedStatus: string = 'ALL';

  async ngOnInit() {
    await this.dataService.fetchGlobalMonitors();
  }

  filterTabs = [
    { label: 'All Monitors', key: 'ALL' },
    { label: 'Online (UP)', key: 'UP' },
    { label: 'Outage (DOWN)', key: 'DOWN' },
    { label: 'Degraded / Slow', key: 'DEGRADED' },
    { label: 'Paused', key: 'PAUSED' }
  ];

  filteredMonitors() {
    return this.dataService.websiteMonitors().filter(m => {
      if (this.selectedStatus !== 'ALL' && m.status !== this.selectedStatus) {
        return false;
      }
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.url.toLowerCase().includes(q) || m.userName.toLowerCase().includes(q);
      }
      return true;
    });
  }

  async recheck(m: WebsiteMonitor) {
    await this.dataService.recheckMonitor(m.id);
  }

  async togglePause(m: WebsiteMonitor) {
    await this.dataService.togglePauseMonitor(m.id);
  }
}
