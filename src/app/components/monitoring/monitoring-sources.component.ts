import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { MonitoringSource } from '../../models/alert21.models';

@Component({
  selector: 'app-monitoring-sources',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Monitoring Sources & Probe Architecture</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Configure isolated external probe workers, set primary/verification priorities, timeouts, and check capacities.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button (click)="openAddModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5">
            <app-icon name="plus" [size]="14"></app-icon>
            <span>Register Probe Source</span>
          </button>
        </div>
      </div>

      <!-- Sources Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div *ngFor="let src of dataService.monitoringSources()" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <app-icon name="server" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">{{ src.name }}</h3>
                <p class="text-[10px] font-mono text-slate-400">{{ src.code }} • {{ src.type }}</p>
              </div>
            </div>

            <span class="px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase"
                  [ngClass]="src.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'">
              {{ src.status }}
            </span>
          </div>

          <!-- Configuration Details -->
          <div class="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono">
            <div>
              <span class="text-[9px] uppercase font-bold text-slate-400 block">Region</span>
              <span class="font-bold text-slate-800 font-sans">{{ src.region }}</span>
            </div>
            <div>
              <span class="text-[9px] uppercase font-bold text-slate-400 block">Probe Role / Purpose</span>
              <span class="font-black text-indigo-600">{{ src.purpose }}</span>
            </div>
            <div>
              <span class="text-[9px] uppercase font-bold text-slate-400 block">Min Interval / Timeout</span>
              <span class="font-bold text-slate-800">{{ src.minIntervalSeconds }}s / {{ src.timeoutSeconds }}s</span>
            </div>
            <div>
              <span class="text-[9px] uppercase font-bold text-slate-400 block">Worker Capacity</span>
              <span class="font-bold text-slate-800">{{ src.maxConcurrency }} concurrent</span>
            </div>
          </div>

          <!-- Live Metrics -->
          <div class="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div class="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100/60">
              <span class="text-[9px] font-bold text-emerald-700 uppercase block">Success Rate</span>
              <span class="font-mono font-black text-emerald-800 text-sm">{{ src.successRate }}%</span>
            </div>
            <div class="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100/60">
              <span class="text-[9px] font-bold text-indigo-700 uppercase block">Avg Check Latency</span>
              <span class="font-mono font-black text-indigo-800 text-sm">{{ src.avgCheckTimeMs }} ms</span>
            </div>
            <div class="p-2 rounded-lg bg-purple-50/60 border border-purple-100/60">
              <span class="text-[9px] font-bold text-purple-700 uppercase block">Queue Lag</span>
              <span class="font-mono font-black text-purple-800 text-sm">{{ src.queueLagMs }} ms</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-sans">
            <div class="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Heartbeat: {{ src.lastHeartbeatAt | date:'shortTime' }}</span>
            </div>
            <button (click)="toggleSource(src)" class="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all">
              {{ src.status === 'ACTIVE' ? 'Disable Source' : 'Enable Source' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add Source Modal -->
      <div *ngIf="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 font-sans">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-black text-slate-900">Register Monitoring Probe Source</h3>
            <button (click)="showAddModal = false" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Source Name</label>
              <input type="text" [(ngModel)]="newSource.name" placeholder="e.g. Alert21 Secondary Worker" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Source Code</label>
              <input type="text" [(ngModel)]="newSource.code" placeholder="e.g. A21_PROBE_SOUTH" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Region / Location</label>
              <input type="text" [(ngModel)]="newSource.region" placeholder="e.g. India (Bengaluru)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Purpose / Role</label>
              <select [(ngModel)]="newSource.purpose" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
                <option value="PRIMARY">Primary Check</option>
                <option value="VERIFICATION">Verification Outage Confirmation</option>
                <option value="BOTH">Primary & Verification</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Min Interval (s)</label>
              <input type="number" [(ngModel)]="newSource.minIntervalSeconds" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Timeout (s)</label>
              <input type="number" [(ngModel)]="newSource.timeoutSeconds" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Priority</label>
              <input type="number" [(ngModel)]="newSource.priority" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Worker Capacity (Concurrency)</label>
              <input type="number" [(ngModel)]="newSource.maxConcurrency" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="showAddModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="saveSource()" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              Save Probe Source
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MonitoringSourcesComponent implements OnInit {
  dataService = inject(DataService);
  showAddModal = false;
  newSource: Partial<MonitoringSource> = {};

  async ngOnInit() {
    await this.dataService.fetchMonitoringSources();
  }

  openAddModal() {
    this.newSource = {
      name: '',
      code: '',
      region: 'India (Bengaluru)',
      purpose: 'VERIFICATION',
      minIntervalSeconds: 30,
      timeoutSeconds: 10,
      priority: 2,
      maxConcurrency: 500
    };
    this.showAddModal = true;
  }

  async saveSource() {
    await this.dataService.createMonitoringSource(this.newSource);
    this.showAddModal = false;
  }

  async toggleSource(src: MonitoringSource) {
    await this.dataService.toggleSourceStatus(src.id);
  }
}
