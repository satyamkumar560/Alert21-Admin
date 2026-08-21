import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { NavTab } from '../layout/sidebar.component';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title Far Left & Refresh Button Far Right (Explicit flex layout to prevent stacking) -->
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px;">
        <div style="text-align: left;">
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard Overview</h2>
          <p class="text-xs text-slate-500 font-medium">Real-time system overview and account statistics.</p>
        </div>

        <button (click)="refreshStats()" class="btn btn-outline btn-sm text-xs font-bold shadow-xs hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center gap-1.5" style="margin-right: 28px;">
          <app-icon name="route" [size]="14" className="text-indigo-600"></app-icon>
          <span>Refresh Live Stats</span>
        </button>
      </div>

      <!-- Top Overview Metric Cards (Rich Aesthetic Upgrade) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- 1. Total Users Card -->
        <div (click)="navigateTo('users')" class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer relative overflow-hidden group">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Users</span>
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <app-icon name="users" [size]="20"></app-icon>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-baseline gap-2">
              <h3 class="text-3xl font-black text-slate-900 tracking-tight">{{ dataService.stats().users.total }}</h3>
              <span class="text-xs text-slate-400 font-medium">accounts</span>
            </div>
            <div class="mt-3 flex items-center gap-1.5">
              <span class="badge badge-active text-[10px]">
                <span class="dot"></span> {{ dataService.stats().users.active }} Active
              </span>
            </div>
          </div>
        </div>

        <!-- 2. Principal Entities Card -->
        <div (click)="navigateTo('dlt-pe')" class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-purple-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer relative overflow-hidden group">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Principal Entities</span>
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <app-icon name="shield-check" [size]="20"></app-icon>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-baseline gap-2">
              <h3 class="text-3xl font-black text-slate-900 tracking-tight">{{ dataService.stats().principalEntities.total }}</h3>
              <span class="text-xs text-slate-400 font-medium">PE IDs</span>
            </div>
            <div class="mt-3 flex items-center gap-1.5">
              <span class="badge badge-active text-[10px]">{{ dataService.stats().principalEntities.active }} Active</span>
              <span *ngIf="dataService.stats().principalEntities.pending > 0" class="badge badge-pending text-[10px]">{{ dataService.stats().principalEntities.pending }} Pending</span>
            </div>
          </div>
        </div>

        <!-- 3. Sender IDs Card -->
        <div (click)="navigateTo('dlt-sender')" class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer relative overflow-hidden group">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Sender Headers</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <app-icon name="file-text" [size]="20"></app-icon>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-baseline gap-2">
              <h3 class="text-3xl font-black text-slate-900 tracking-tight">{{ dataService.stats().senderIds.total }}</h3>
              <span class="text-xs text-slate-400 font-medium">Headers</span>
            </div>
            <div class="mt-3 flex items-center gap-1.5">
              <span class="badge badge-active text-[10px]">{{ dataService.stats().senderIds.active }} Active</span>
              <span *ngIf="dataService.stats().senderIds.pending > 0" class="badge badge-pending text-[10px]">{{ dataService.stats().senderIds.pending }} Pending</span>
            </div>
          </div>
        </div>

        <!-- 4. Content Templates Card -->
        <div (click)="navigateTo('dlt-template')" class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer relative overflow-hidden group">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Content Templates</span>
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <app-icon name="copy" [size]="20"></app-icon>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-baseline gap-2">
              <h3 class="text-3xl font-black text-slate-900 tracking-tight">{{ dataService.stats().templates.total }}</h3>
              <span class="text-xs text-slate-400 font-medium">Templates</span>
            </div>
            <div class="mt-3 flex items-center gap-1.5">
              <span class="badge badge-active text-[10px]">{{ dataService.stats().templates.active }} Active</span>
              <span *ngIf="dataService.stats().templates.pending > 0" class="badge badge-pending text-[10px]">{{ dataService.stats().templates.pending }} Pending</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Live API Response Breakdown Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Block 1: User Accounts Breakdown -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <app-icon name="users" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-extrabold text-slate-900">User Accounts</h3>
                <p class="text-[11px] text-slate-400 font-medium">Account status distribution</p>
              </div>
            </div>
            <span class="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
              {{ dataService.stats().users.total }} Total
            </span>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span class="text-slate-600 font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span> Total Registered
              </span>
              <span class="font-mono text-sm font-black text-slate-900">{{ dataService.stats().users.total }}</span>
            </div>
            
            <div class="flex justify-between items-center bg-emerald-50/60 p-3 rounded-xl border border-emerald-100/80">
              <span class="text-emerald-800 font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Active Accounts
              </span>
              <span class="font-mono text-sm font-black text-emerald-700">{{ dataService.stats().users.active }}</span>
            </div>

            <div class="flex justify-between items-center bg-amber-50/60 p-3 rounded-xl border border-amber-100/80">
              <span class="text-amber-800 font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span> Suspended Accounts
              </span>
              <span class="font-mono text-sm font-black text-amber-700">{{ dataService.stats().users.suspended }}</span>
            </div>

            <div class="flex justify-between items-center bg-rose-50/60 p-3 rounded-xl border border-rose-100/80">
              <span class="text-rose-800 font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span> Blocked Accounts
              </span>
              <span class="font-mono text-sm font-black text-rose-700">{{ dataService.stats().users.blocked }}</span>
            </div>
          </div>
        </div>

        <!-- Block 2: DLT Hierarchy Breakdown -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <app-icon name="shield-check" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-extrabold text-slate-900">DLT Master Registry</h3>
                <p class="text-[11px] text-slate-400 font-medium">TRAI compliance entities</p>
              </div>
            </div>
          </div>

          <div class="space-y-3 text-xs">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-slate-700 font-extrabold">Principal Entities</span>
                <span class="font-mono text-xs font-black text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded">
                  {{ dataService.stats().principalEntities.total }} Total
                </span>
              </div>
              <div class="flex items-center gap-2 pt-1">
                <span class="badge badge-active text-[10px]">{{ dataService.stats().principalEntities.active }} Active</span>
                <span class="badge badge-pending text-[10px]">{{ dataService.stats().principalEntities.pending }} Pending</span>
              </div>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-slate-700 font-extrabold">Sender Headers</span>
                <span class="font-mono text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  {{ dataService.stats().senderIds.total }} Total
                </span>
              </div>
              <div class="flex items-center gap-2 pt-1">
                <span class="badge badge-active text-[10px]">{{ dataService.stats().senderIds.active }} Active</span>
                <span class="badge badge-pending text-[10px]">{{ dataService.stats().senderIds.pending }} Pending</span>
              </div>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-slate-700 font-extrabold">Content Templates</span>
                <span class="font-mono text-xs font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  {{ dataService.stats().templates.total }} Total
                </span>
              </div>
              <div class="flex items-center gap-2 pt-1">
                <span class="badge badge-active text-[10px]">{{ dataService.stats().templates.active }} Active</span>
                <span class="badge badge-pending text-[10px]">{{ dataService.stats().templates.pending }} Pending</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Block 3: SMS Providers & Traffic Metrics -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <app-icon name="route" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-extrabold text-slate-900">SMS Gateway & Metrics</h3>
                <p class="text-[11px] text-slate-400 font-medium">Gateway & traffic statistics</p>
              </div>
            </div>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span class="text-slate-600 font-bold">Total Providers</span>
              <span class="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                {{ dataService.stats().smsProviders.total }} Active
              </span>
            </div>

            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-3.5 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Global Default Provider</span>
                <span class="font-mono text-sm font-extrabold text-slate-900 mt-0.5 block">
                  {{ dataService.stats().smsProviders.globalDefault?.name || 'MSG24' }} 
                  <span class="text-indigo-600 font-bold text-xs">({{ dataService.stats().smsProviders.globalDefault?.code || 'MSG24' }})</span>
                </span>
              </div>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"></span>
            </div>

            <div class="grid grid-cols-2 gap-2.5 pt-1">
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-center">
                <span class="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Total Sent</span>
                <span class="font-mono text-base font-black text-slate-900 mt-1 block">{{ dataService.stats().smsMetrics.totalSent }}</span>
              </div>

              <div class="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60 text-center">
                <span class="text-[10px] text-emerald-700 font-black uppercase tracking-wider block">Delivered</span>
                <span class="font-mono text-base font-black text-emerald-700 mt-1 block">{{ dataService.stats().smsMetrics.delivered }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  dataService = inject(DataService);

  @Output() navigate = new EventEmitter<NavTab>();

  navigateTo(tab: NavTab) {
    this.navigate.emit(tab);
  }

  refreshStats() {
    this.dataService.fetchLiveDashboardStats();
  }
}
