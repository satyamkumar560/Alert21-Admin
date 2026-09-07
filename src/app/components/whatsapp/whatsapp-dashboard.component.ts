import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { NavTab } from '../layout/sidebar.component';

@Component({
  selector: 'app-whatsapp-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
              <app-icon name="message-circle" [size]="18"></app-icon>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Meta WhatsApp SaaS Dashboard</h2>
          </div>
          <p class="text-xs text-slate-500 font-medium mt-1">
            Real-time Meta Cloud API metrics, connected WABAs, phone numbers, template health, campaigns, and billing value.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            (click)="refresh()" 
            class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Refresh Stats</span>
          </button>
        </div>
      </div>

      <!-- Top Primary 4 KPI Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Connected Users -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Connected Tenants</span>
            <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <app-icon name="users" [size]="15"></app-icon>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-3xl font-black text-slate-900">{{ stats()?.totalConnectedUsers ?? 0 }}</div>
            <p class="text-[11px] text-slate-400 mt-0.5 font-medium">Distinct users with Meta WABAs</p>
          </div>
        </div>

        <!-- Total WABAs -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Total WABAs</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <app-icon name="server" [size]="15"></app-icon>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-3xl font-black text-emerald-600">{{ stats()?.totalWabas ?? 0 }}</div>
            <div class="flex items-center gap-2 mt-1 text-[11px] font-bold">
              <span class="text-emerald-700">{{ stats()?.activeAccounts ?? 0 }} Connected</span>
              <span class="text-slate-300">•</span>
              <span class="text-amber-600">{{ stats()?.actionRequiredAccounts ?? 0 }} Action Req</span>
            </div>
          </div>
        </div>

        <!-- Phone Numbers -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Connected Numbers</span>
            <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <app-icon name="smartphone" [size]="15"></app-icon>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-3xl font-black text-purple-600">{{ stats()?.totalConnectedPhoneNumbers ?? 0 }}</div>
            <p class="text-[11px] text-slate-400 mt-0.5 font-medium">Verified WhatsApp Sender IDs</p>
          </div>
        </div>

        <!-- Today Dispatched -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Today's Volume</span>
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <app-icon name="send" [size]="15"></app-icon>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-3xl font-black text-blue-600">{{ stats()?.todayMessages ?? 0 }}</div>
            <div class="flex items-center gap-1.5 mt-1 text-[11px] font-bold">
              <span class="text-emerald-600">✓ {{ stats()?.todayDelivered ?? 0 }} Del</span>
              <span class="text-slate-300">•</span>
              <span class="text-blue-600">👁 {{ stats()?.todayRead ?? 0 }} Read</span>
              <span class="text-slate-300">•</span>
              <span class="text-rose-600">✗ {{ stats()?.todayFailed ?? 0 }} Fail</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Metrics Row (Templates, Campaigns, Financials) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Templates Health -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider">Template Approval Health</h3>
            <span class="text-xs font-bold text-slate-400">Total: {{ stats()?.totalTemplates ?? 0 }}</span>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span class="font-bold text-slate-700">Approved / Active</span>
              </div>
              <span class="font-mono font-black text-emerald-600">{{ stats()?.approvedTemplates ?? 0 }}</span>
            </div>

            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <span class="font-bold text-slate-700">Pending Meta Review</span>
              </div>
              <span class="font-mono font-black text-amber-600">{{ stats()?.pendingTemplates ?? 0 }}</span>
            </div>

            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <span class="font-bold text-slate-700">Rejected by Meta</span>
              </div>
              <span class="font-mono font-black text-rose-600">{{ stats()?.rejectedTemplates ?? 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Campaigns & Traffic -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider">Campaigns & Traffic</h3>
            <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">LIVE QUEUE</span>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Active Running Campaigns:</span>
              <span class="font-mono font-black text-indigo-600">{{ stats()?.activeCampaigns ?? 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Today Delivered Rate:</span>
              <span class="font-mono font-black text-emerald-600">
                {{ ((stats()?.todayDelivered || 0) / ((stats()?.todayMessages || 1) || 1) * 100) | number:'1.1-1' }}%
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Today Read Engagement:</span>
              <span class="font-mono font-black text-blue-600">
                {{ ((stats()?.todayRead || 0) / ((stats()?.todayMessages || 1) || 1) * 100) | number:'1.1-1' }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Financial & Credits Snapshot -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider">Credits & Ledger</h3>
            <span class="text-xs font-bold text-emerald-600">₹{{ stats()?.totalBillingValue ?? 0 | number:'1.2-2' }}</span>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Credits Distributed:</span>
              <span class="font-mono font-bold text-slate-800">{{ stats()?.totalCreditsDistributed ?? 0 | number }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Current User Wallet Balance:</span>
              <span class="font-mono font-bold text-indigo-600">{{ stats()?.currentTotalUserBalance ?? 0 | number }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Pending Bank Transfers:</span>
              <span class="font-mono font-bold text-amber-600">{{ stats()?.pendingPaymentCount ?? 0 }} (₹{{ stats()?.pendingPaymentAmount ?? 0 | number:'1.0-0' }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Shortcuts Grid -->
      <div class="bg-slate-900 text-slate-200 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <app-icon name="zap" [size]="16"></app-icon>
            </div>
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider">WhatsApp Cloud API Quick Controls</h3>
              <p class="text-[11px] text-slate-400">Directly access cross-tenant management and Meta webhook consoles.</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button (click)="dataService.fetchWhatsappConfig()" class="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700/60 transition-all group">
            <div class="text-[10px] font-bold text-indigo-400 uppercase">Configuration</div>
            <div class="text-xs font-black text-white mt-1 group-hover:text-indigo-300">Meta App & Embedded</div>
          </button>

          <button (click)="dataService.fetchWhatsappAccounts()" class="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700/60 transition-all group">
            <div class="text-[10px] font-bold text-emerald-400 uppercase">Tenants & WABAs</div>
            <div class="text-xs font-black text-white mt-1 group-hover:text-emerald-300">Connected Accounts</div>
          </button>

          <button (click)="dataService.fetchWhatsappTemplates()" class="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700/60 transition-all group">
            <div class="text-[10px] font-bold text-purple-400 uppercase">Templates</div>
            <div class="text-xs font-black text-white mt-1 group-hover:text-purple-300">Meta Approvals</div>
          </button>

          <button (click)="dataService.fetchWhatsappTransactions()" class="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700/60 transition-all group">
            <div class="text-[10px] font-bold text-cyan-400 uppercase">Telemetry</div>
            <div class="text-xs font-black text-white mt-1 group-hover:text-cyan-300">Message Logs & DLR</div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class WhatsappDashboardComponent implements OnInit {
  dataService = inject(DataService);

  ngOnInit() {
    this.refresh();
  }

  stats() {
    return this.dataService.whatsappStats();
  }

  refresh() {
    this.dataService.fetchWhatsappStats();
  }
}
