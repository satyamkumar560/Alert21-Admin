import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-monitoring-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Website Monitoring Dashboard</h2>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Probes Active
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Real-time platform health, active probe worker status, incident tracking, and multi-channel alert delivery.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button (click)="refresh()" class="btn btn-outline btn-sm text-xs font-bold shadow-xs hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center gap-1.5">
            <app-icon name="rotate-cw" [size]="14" className="text-indigo-600"></app-icon>
            <span>Refresh Monitoring</span>
          </button>
        </div>
      </div>

      <!-- 1. PRIMARY PLATFORM METRICS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Active Monitors -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Monitors</span>
            <div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <app-icon name="globe" [size]="14"></app-icon>
            </div>
          </div>
          <div>
            <h4 class="text-2xl font-black text-slate-900 font-mono">{{ stats().totalActiveMonitors }}</h4>
            <div class="flex items-center gap-2 mt-1 text-[11px] font-semibold text-slate-500">
              <span class="text-emerald-600 font-bold">{{ stats().monitorsUp }} UP</span> •
              <span class="text-rose-600 font-bold">{{ stats().monitorsDown }} DOWN</span> •
              <span class="text-amber-600 font-bold">{{ stats().monitorsDegraded }} SLOW</span>
            </div>
          </div>
        </div>

        <!-- Incidents Today -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Open Incidents</span>
            <div class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <app-icon name="alert-triangle" [size]="14"></app-icon>
            </div>
          </div>
          <div>
            <h4 class="text-2xl font-black text-rose-600 font-mono">{{ stats().incidentsToday }}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">Two-step verified outages</p>
          </div>
        </div>

        <!-- Avg Platform Check Latency -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg Check Latency</span>
            <div class="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <app-icon name="activity" [size]="14"></app-icon>
            </div>
          </div>
          <div>
            <h4 class="text-2xl font-black text-slate-900 font-mono">{{ stats().avgPlatformLatencyMs }} <span class="text-xs font-normal text-slate-400">ms</span></h4>
            <p class="text-[10px] text-emerald-600 font-semibold mt-0.5">Ultra-fast HTTP worker response</p>
          </div>
        </div>

        <!-- Monitoring MRR -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Monitoring MRR</span>
            <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <app-icon name="indian-rupee" [size]="14"></app-icon>
            </div>
          </div>
          <div>
            <h4 class="text-2xl font-black text-emerald-600 font-mono">₹{{ stats().mrr | number:'1.0-0' }}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">ARR: ₹{{ stats().arr | number:'1.0-0' }}</p>
          </div>
        </div>

        <!-- Active Subscriptions -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Subscriptions</span>
            <div class="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <app-icon name="users" [size]="14"></app-icon>
            </div>
          </div>
          <div>
            <h4 class="text-2xl font-black text-slate-900 font-mono">{{ stats().activeSubscriptionsCount }}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">Paid + Starter users</p>
          </div>
        </div>
      </div>

      <!-- 2. PROBE SOURCES HEALTH & ALERTS DISPATCHED -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Probe Sources Status (2/3 Col) -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <app-icon name="layers" [size]="16" className="text-indigo-600"></app-icon>
                <span>Monitoring Probes & Worker Health (Section 2)</span>
              </h3>
              <p class="text-xs text-slate-500">Alert21 isolated native worker nodes executing two-step verification.</p>
            </div>
            <span class="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 text-slate-700">
              {{ dataService.monitoringSources().length }} Active Probes
            </span>
          </div>

          <div *ngIf="dataService.monitoringSources().length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div *ngFor="let src of dataService.monitoringSources()" class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h4 class="text-xs font-black text-slate-900">{{ src.name }}</h4>
                  </div>
                  <p class="text-[10px] font-mono text-slate-400 mt-0.5">{{ src.code }} • {{ src.region }}</p>
                </div>
                <span class="px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider"
                      [ngClass]="src.purpose === 'PRIMARY' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'">
                  {{ src.purpose }}
                </span>
              </div>

              <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
                <div>
                  <p class="text-[9px] uppercase font-bold text-slate-400">Success Rate</p>
                  <p class="text-xs font-black font-mono text-emerald-600">{{ src.successRate }}%</p>
                </div>
                <div>
                  <p class="text-[9px] uppercase font-bold text-slate-400">Avg Check</p>
                  <p class="text-xs font-black font-mono text-slate-800">{{ src.avgCheckTimeMs }}ms</p>
                </div>
                <div>
                  <p class="text-[9px] uppercase font-bold text-slate-400">Queue Lag</p>
                  <p class="text-xs font-black font-mono text-indigo-600">{{ src.queueLagMs }}ms</p>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="dataService.monitoringSources().length === 0" class="text-center py-8 text-slate-400 text-xs">
            No probe worker nodes reported from backend.
          </div>
        </div>

        <!-- Alerts Sent Today by Channel (1/3 Col) -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <app-icon name="bell" [size]="16" className="text-amber-500"></app-icon>
                <span>Alerts Sent Today</span>
              </h3>
              <span class="text-xs font-black text-indigo-600 font-mono">{{ stats().alertsSentToday.total }} Total</span>
            </div>
            <p class="text-xs text-slate-500 mb-4">Multi-channel incident & recovery notifications dispatched.</p>

            <div class="space-y-3">
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <app-icon name="mail" [size]="14"></app-icon>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-slate-800">Email Alerts</p>
                    <p class="text-[10px] text-slate-400">Included in plan</p>
                  </div>
                </div>
                <span class="text-sm font-black font-mono text-slate-900">{{ stats().alertsSentToday.email }}</span>
              </div>

              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <app-icon name="smartphone" [size]="14"></app-icon>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-slate-800">SMS Alerts</p>
                    <p class="text-[10px] text-slate-400">DLT 2-var verified</p>
                  </div>
                </div>
                <span class="text-sm font-black font-mono text-slate-900">{{ stats().alertsSentToday.sms }}</span>
              </div>

              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <app-icon name="message-square" [size]="14"></app-icon>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-slate-800">WhatsApp Alerts</p>
                    <p class="text-[10px] text-slate-400">Meta Utility approved</p>
                  </div>
                </div>
                <span class="text-sm font-black font-mono text-slate-900">{{ stats().alertsSentToday.whatsapp }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. TOP FAILING DOMAINS & RECENT WEBSITES STATUS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Repeated Incidents / Failing Domains -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <h3 class="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
            <app-icon name="alert-triangle" [size]="16" className="text-rose-500"></app-icon>
            <span>Top Repeated Outages & Failing Domains</span>
          </h3>
          <p class="text-xs text-slate-500 mb-4">Domains with repeated incident triggers requiring investigation.</p>

          <div *ngIf="stats().topFailingDomains.length > 0" class="space-y-2.5">
            <div *ngFor="let item of stats().topFailingDomains" class="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
              <div>
                <p class="text-xs font-bold text-slate-900 font-mono">{{ item.domain }}</p>
                <p class="text-[10px] text-slate-400">Total Downtime: {{ item.downtimeSeconds / 60 | number:'1.0-0' }} mins • {{ item.lastFailedAt }}</p>
              </div>
              <span class="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
                {{ item.incidentCount }} Incidents
              </span>
            </div>
          </div>

          <div *ngIf="stats().topFailingDomains.length === 0" class="text-center py-6 text-slate-400 text-xs">
            No repeated failing domains reported.
          </div>
        </div>

        <!-- Recent Incidents Snapshot -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <h3 class="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
            <app-icon name="clock" [size]="16" className="text-indigo-600"></app-icon>
            <span>Recent Incident Log Timeline</span>
          </h3>
          <p class="text-xs text-slate-500 mb-4">Latest two-step verified outage events and recovery timestamps.</p>

          <div *ngIf="dataService.monitorIncidents().length > 0" class="space-y-3">
            <div *ngFor="let inc of dataService.monitorIncidents()" class="p-3 rounded-xl border border-slate-100 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-slate-900">{{ inc.monitorName }}</span>
                <span class="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase"
                      [ngClass]="inc.status === 'OPEN' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'">
                  {{ inc.status }}
                </span>
              </div>
              <p class="text-[11px] text-slate-600 font-mono">{{ inc.failureReason }}</p>
              <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Started: {{ inc.startedAt | date:'shortTime' }}</span>
                <span class="font-bold text-slate-600">Duration: {{ inc.durationText }}</span>
              </div>
            </div>
          </div>

          <div *ngIf="dataService.monitorIncidents().length === 0" class="text-center py-6 text-slate-400 text-xs">
            No recent incidents recorded.
          </div>
        </div>
      </div>
    </div>
  `
})
export class MonitoringDashboardComponent implements OnInit {
  dataService = inject(DataService);
  stats = this.dataService.monitoringDashboardStats;

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    await Promise.all([
      this.dataService.fetchMonitoringDashboard(),
      this.dataService.fetchMonitoringSources(),
      this.dataService.fetchGlobalIncidents(),
      this.dataService.fetchGlobalMonitors()
    ]);
  }
}
