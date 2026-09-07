import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';
import { RelayService } from '../../services/relay.service';
import { NavTab } from '../layout/sidebar.component';

@Component({
  selector: 'app-relay-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header & Quick Action Buttons -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">SMS Relay Engine</h2>
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">SPEC V2.0</span>
          </div>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Centralized intelligent regex tokenization, Android device pairing, OTP/Transaction extraction & real-time CRM webhook delivery.
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <button (click)="navigateTo('relay-builder')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all">
            <app-icon name="plus" [size]="14"></app-icon>
            <span>Launch Template Builder</span>
          </button>
          <button (click)="navigateTo('relay-sources')" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all">
            <app-icon name="layers" [size]="14"></app-icon>
            <span>Source Master</span>
          </button>
        </div>
      </div>

      <!-- Top Primary KPI Cards (Page 10 & 11) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" *ngIf="relayService.stats() as stats">
        <!-- Active Relay Users -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Relay Users</span>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <app-icon name="users" [size]="16"></app-icon>
            </div>
          </div>
          <h3 class="text-2xl font-extrabold text-slate-900 mt-2 font-mono">{{ stats.activeRelayUsers }}</h3>
          <p class="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <app-icon name="check-circle" [size]="12"></app-icon>
            <span>{{ stats.totalSubscribers }} Active Packages</span>
          </p>
        </div>

        <!-- Connected Android Devices -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:border-emerald-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Connected Devices</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <app-icon name="smartphone" [size]="16"></app-icon>
            </div>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <h3 class="text-2xl font-extrabold text-slate-900 font-mono">{{ stats.connectedDevices }}</h3>
            <span class="text-xs font-bold text-emerald-600 font-mono">({{ stats.onlineDevices }} Online)</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Live background heartbeat sync</p>
        </div>

        <!-- Today Ingested Events -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Today Relay Events</span>
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <app-icon name="activity" [size]="16"></app-icon>
            </div>
          </div>
          <h3 class="text-2xl font-extrabold text-slate-900 mt-2 font-mono">{{ stats.eventsToday | number }}</h3>
          <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
            <span class="text-indigo-600 font-bold font-mono">{{ stats.todayOtpEvents | number }} OTPs</span>
            <span>•</span>
            <span class="text-emerald-600 font-bold font-mono">{{ stats.todayTransactionEvents | number }} Txns</span>
          </div>
        </div>

        <!-- Webhook Health Rate -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:border-amber-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Webhook Delivery</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <app-icon name="send" [size]="16"></app-icon>
            </div>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <h3 class="text-2xl font-extrabold text-slate-900 font-mono">{{ stats.webhookSuccessRatePercent }}%</h3>
            <span class="text-[11px] text-slate-400">Success</span>
          </div>
          <p class="text-[11px] text-rose-500 font-medium mt-1 font-mono">
            {{ stats.matchFailuresToday }} match warnings / retries
          </p>
        </div>
      </div>

      <!-- Secondary KPIs Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Published Types</p>
            <p class="text-lg font-black font-mono mt-0.5">{{ relayService.messageTypes().length }} Types</p>
          </div>
          <app-icon name="copy" [size]="18" class="text-indigo-400"></app-icon>
        </div>

        <div class="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Variants</p>
            <p class="text-lg font-black font-mono mt-0.5">{{ countVariants() }} Variants</p>
          </div>
          <app-icon name="file-text" [size]="18" class="text-emerald-400"></app-icon>
        </div>

        <div class="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Source Masters</p>
            <p class="text-lg font-black font-mono mt-0.5">{{ relayService.sources().length }} Sources</p>
          </div>
          <app-icon name="layers" [size]="18" class="text-blue-400"></app-icon>
        </div>

        <div class="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Monthly Revenue</p>
            <p class="text-lg font-black font-mono mt-0.5 text-amber-400">₹ {{ (relayService.stats()?.totalRelayRevenue || 184500) | number }}</p>
          </div>
          <app-icon name="credit-card" [size]="18" class="text-amber-400"></app-icon>
        </div>
      </div>

      <!-- Quick Feature Showcase & Navigation Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Card 1: Interactive Template Builder -->
        <div (click)="navigateTo('relay-builder')" class="bg-white border border-slate-200/80 hover:border-indigo-500 rounded-2xl p-5 cursor-pointer transition-all group shadow-sm">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <app-icon name="code" [size]="20"></app-icon>
          </div>
          <h4 class="font-extrabold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">Visual Template Builder</h4>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Paste raw SMS, click tokens to assign <code class="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">{{'{{otp}}'}}</code> or <code class="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">{{'{{amount}}'}}</code>, auto-generate regex, test in live sandbox and publish.
          </p>
          <div class="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
            <span>Open Builder</span>
            <app-icon name="chevron-right" [size]="14"></app-icon>
          </div>
        </div>

        <!-- Card 2: Published Template Library -->
        <div (click)="navigateTo('relay-templates')" class="bg-white border border-slate-200/80 hover:border-emerald-500 rounded-2xl p-5 cursor-pointer transition-all group shadow-sm">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <app-icon name="copy" [size]="20"></app-icon>
          </div>
          <h4 class="font-extrabold text-slate-900 mt-3 group-hover:text-emerald-600 transition-colors">Template Library & Versions</h4>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Manage GST OTP, GoDaddy 2FA, Zoho CRM, HDFC/ICICI Bank credit & debit formats with immutable version checksums and 1-click rollback.
          </p>
          <div class="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <span>View Library ({{ relayService.messageTypes().length }})</span>
            <app-icon name="chevron-right" [size]="14"></app-icon>
          </div>
        </div>

        <!-- Card 3: Android Device Fleet -->
        <div (click)="navigateTo('relay-devices')" class="bg-white border border-slate-200/80 hover:border-blue-500 rounded-2xl p-5 cursor-pointer transition-all group shadow-sm">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <app-icon name="smartphone" [size]="20"></app-icon>
          </div>
          <h4 class="font-extrabold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors">Android Device Fleet</h4>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Monitor client Android nodes, live battery levels, config compilation checksums, heartbeat timestamps and instant remote revocation.
          </p>
          <div class="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600">
            <span>Inspect Devices ({{ relayService.devices().length }})</span>
            <app-icon name="chevron-right" [size]="14"></app-icon>
          </div>
        </div>
      </div>

      <!-- Live Stream: Ingested Relay Events & Webhook Deliveries -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h3 class="font-extrabold text-slate-900 text-sm">Real-time Ingested Relay Feed</h3>
            <span class="text-xs text-slate-400 font-mono">Live Stream</span>
          </div>
          <button (click)="navigateTo('relay-events')" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <span>View All Logs</span>
            <app-icon name="chevron-right" [size]="14"></app-icon>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-2.5 px-3">Event ID</th>
                <th class="py-2.5 px-3">Source & Sender</th>
                <th class="py-2.5 px-3">Message Type</th>
                <th class="py-2.5 px-3">Extracted Variables</th>
                <th class="py-2.5 px-3">Device</th>
                <th class="py-2.5 px-3">Webhook Delivery</th>
                <th class="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let evt of relayService.events()" class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-3 font-mono font-bold text-indigo-600">
                  {{ evt.id }}
                </td>
                <td class="py-3 px-3">
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800 text-[10px]">{{ evt.sourceCode }}</span>
                    <span class="font-mono text-slate-500 text-[11px]">{{ evt.sender }}</span>
                  </div>
                </td>
                <td class="py-3 px-3">
                  <span class="font-semibold text-slate-800">{{ evt.messageTypeName }}</span>
                  <span class="block text-[10px] font-mono text-slate-400">{{ evt.eventType }}</span>
                </td>
                <td class="py-3 px-3">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <ng-container *ngFor="let item of getVarEntries(evt.maskedVariables)">
                      <span class="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-mono">
                        <strong>{{ item.key }}:</strong> {{ item.value }}
                      </span>
                    </ng-container>
                  </div>
                </td>
                <td class="py-3 px-3">
                  <span class="font-medium text-slate-700">{{ evt.deviceName }}</span>
                  <span class="block text-[10px] text-slate-400">{{ evt.userName }}</span>
                </td>
                <td class="py-3 px-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="evt.webhookDeliveryStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : (evt.webhookDeliveryStatus === 'RETRYING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')">
                    {{ evt.webhookDeliveryStatus }}
                  </span>
                  <span *ngIf="evt.webhookResponseCode" class="ml-1 text-[10px] font-mono text-slate-400">({{ evt.webhookResponseCode }})</span>
                </td>
                <td class="py-3 px-3 font-mono text-slate-400 text-[11px]">
                  {{ evt.receivedAt | date:'mediumTime' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class RelayDashboardComponent {
  relayService = inject(RelayService);
  @Output() navigate = new EventEmitter<NavTab>();

  navigateTo(tab: NavTab) {
    this.navigate.emit(tab);
  }

  countVariants(): number {
    return this.relayService.messageTypes().reduce((acc, curr) => acc + (curr.variants?.length || 0), 0);
  }

  getVarEntries(vars: Record<string, any>): { key: string; value: any }[] {
    if (!vars) return [];
    return Object.keys(vars).map(k => ({ key: k, value: vars[k] }));
  }
}
