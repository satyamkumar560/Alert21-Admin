import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { RelayService } from '../../services/relay.service';
import { RelayDevice } from '../../models/alert21.models';

@Component({
  selector: 'app-relay-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Connected Android Devices</h2>
          <p class="text-xs text-slate-500 font-medium">
            Monitor client Android listener devices, battery level, network connection, live heartbeat, compiled config version, and remote revoke.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="refreshDevices()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-all">
            <app-icon name="rotate-cw" [size]="14"></app-icon>
            <span>Refresh Devices</span>
          </button>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Paired Devices</span>
          <h3 class="text-2xl font-extrabold text-slate-900 font-mono mt-1">{{ relayService.devices().length }}</h3>
        </div>

        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active & Online</span>
          <h3 class="text-2xl font-extrabold text-emerald-600 font-mono mt-1">{{ getActiveCount() }}</h3>
        </div>

        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">Config Version</span>
          <h3 class="text-2xl font-extrabold text-slate-900 font-mono mt-1">v27 (Latest)</h3>
        </div>

        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">SMS Permission Rate</span>
          <h3 class="text-2xl font-extrabold text-slate-900 font-mono mt-1">100% Granted</h3>
        </div>
      </div>

      <!-- SEARCH & FILTER BAR -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <app-icon name="search" [size]="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search by device label, model, user name, email..." 
            class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
          />
        </div>

        <select [(ngModel)]="statusFilter" class="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
          <option value="ALL">All Device Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="OFFLINE">OFFLINE</option>
          <option value="REVOKED">REVOKED</option>
        </select>
      </div>

      <!-- DEVICES TABLE -->
      <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Device Label & Hardware</th>
                <th class="py-3 px-4">User Account</th>
                <th class="py-3 px-4">SIM 1 / SIM 2 Slots</th>
                <th class="py-3 px-4">Battery & Network</th>
                <th class="py-3 px-4">Outbound SMS</th>
                <th class="py-3 px-4">Status & Heartbeat</th>
                <th class="py-3 px-4">Today Relayed / Sent</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let dev of filteredDevices()" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <app-icon name="smartphone" [size]="18"></app-icon>
                    </div>
                    <div>
                      <span class="font-extrabold text-slate-900 text-sm">{{ dev.deviceLabel }}</span>
                      <span class="block font-mono text-slate-400 text-[10px]">{{ dev.model }} ({{ dev.manufacturer }}) &bull; Android {{ dev.androidVersion }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-bold text-slate-800">{{ dev.userName }}</span>
                  <span class="block text-slate-400 text-[10px]">{{ dev.userEmail }}</span>
                </td>
                <!-- SIM 1 / SIM 2 Slots -->
                <td class="py-3.5 px-4">
                  <div class="space-y-1">
                    <div class="flex items-center gap-1.5 text-[10px]">
                      <span class="px-1.5 py-0.5 rounded font-bold" [ngClass]="dev.sim1Available !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'">
                        SIM 1
                      </span>
                      <span class="text-slate-600 font-semibold">{{ dev.sim1Carrier || 'Airtel (Active)' }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-[10px]" *ngIf="dev.sim2Available">
                      <span class="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">SIM 2</span>
                      <span class="text-slate-600 font-semibold">{{ dev.sim2Carrier || 'Jio' }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1 font-mono font-bold" [ngClass]="dev.batteryPercent > 20 ? 'text-emerald-600' : 'text-rose-600'">
                      <app-icon name="battery" [size]="14"></app-icon>
                      <span>{{ dev.batteryPercent }}%</span>
                    </div>
                    <span class="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[9px] font-bold text-slate-600 uppercase">{{ dev.networkType }}</span>
                  </div>
                </td>
                <!-- Outbound SMS Gateway State -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2">
                    <button 
                      type="button" 
                      (click)="toggleSend(dev.id)"
                      class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider transition-all"
                      [ngClass]="dev.allowSmsSend !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'">
                      {{ dev.allowSmsSend !== false ? 'SEND ON' : 'SEND OFF' }}
                    </button>
                    <span *ngIf="dev.isBlocked" class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-extrabold uppercase">BLOCKED</span>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="dev.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : (dev.status === 'OFFLINE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')">
                    {{ dev.status }}
                  </span>
                  <span class="block text-[10px] text-slate-400 font-mono mt-0.5">{{ dev.lastSeenAt }}</span>
                </td>
                <td class="py-3.5 px-4 font-mono">
                  <div class="font-extrabold text-slate-900">{{ dev.todayRelayedCount | number }} in</div>
                  <div class="text-[10px] text-indigo-600 font-bold">{{ dev.todaySentCount || 0 }} out</div>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      (click)="toggleBlock(dev.id)" 
                      class="px-2 py-1 rounded-lg text-[10px] font-bold border transition-all"
                      [ngClass]="dev.isBlocked ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'">
                      {{ dev.isBlocked ? 'Unblock' : 'Block' }}
                    </button>
                    <button 
                      *ngIf="dev.status !== 'REVOKED'" 
                      (click)="revoke(dev.id)" 
                      class="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 transition-all">
                      Revoke
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class RelayDevicesComponent implements OnInit {
  relayService = inject(RelayService);

  ngOnInit() {
    this.relayService.fetchDevices();
  }

  searchQuery = '';
  statusFilter = 'ALL';

  filteredDevices(): RelayDevice[] {
    return this.relayService.devices().filter(d => {
      if (this.statusFilter !== 'ALL' && d.status !== this.statusFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return d.deviceLabel.toLowerCase().includes(q) || d.model.toLowerCase().includes(q) || d.userName.toLowerCase().includes(q) || d.userEmail.toLowerCase().includes(q);
      }
      return true;
    });
  }

  getActiveCount(): number {
    return this.relayService.devices().filter(d => d.status === 'ACTIVE' || (d as any).connection_status === 'ONLINE').length;
  }

  refreshDevices() {
    this.relayService.fetchDevices();
  }

  toggleSend(id: string) {
    this.relayService.toggleDeviceSend(id);
  }

  toggleBlock(id: string) {
    this.relayService.toggleDeviceBlock(id);
  }

  revoke(id: string) {
    if (confirm('Are you sure you want to revoke this Android device credential? The device will immediately wipe local rules.')) {
      this.relayService.revokeDevice(id);
    }
  }
}
