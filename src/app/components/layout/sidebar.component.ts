// import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IconComponent } from '../shared/icon.component';
// import { DataService } from '../../services/data.service';

// export type NavTab = 
//   | 'dashboard' 
//   | 'users' 
//   | 'dlt-pe' 
//   | 'dlt-sender' 
//   | 'dlt-template' 
//   | 'providers' 
//   | 'provider-routing' 
//   | 'dlt-hash-tool' 
//   | 'sms-logs' 
//   | 'audit-logs' 
//   | 'settings';

// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [CommonModule, IconComponent],
//   template: `
//     <aside 
//       class="w-[260px] bg-[#0b1120] border-r border-slate-800/80 h-screen flex flex-col fixed left-0 top-0 z-40 text-slate-300 transition-transform duration-300 ease-in-out"
//       [ngClass]="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'">
//       <!-- Top Branding Logo matching Image 1 EXACTLY -->
//       <div class="h-[76px] px-6 flex items-center gap-3.5 border-b border-slate-800/80">
//         <!-- Rounded purple squircle with crisp white lightning bolt -->
//         <div class="w-10 h-10 rounded-2xl bg-[#5d55fa] flex items-center justify-center shadow-lg shadow-indigo-600/30">
//           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
//             <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"></polygon>
//           </svg>
//         </div>
//         <span class="font-extrabold text-2xl text-white tracking-tight">Alert21</span>
//       </div>

//       <!-- Navigation Links -->
//       <div class="flex-1 overflow-y-auto px-3.5 py-6 space-y-1">
//         <!-- Dashboard -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('dashboard')"
//           [ngClass]="getNavClass('dashboard')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
//           <app-icon name="layout-dashboard" [size]="16"></app-icon>
//           <span>Dashboard</span>
//         </button>

//         <!-- User Accounts -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('users')"
//           [ngClass]="getNavClass('users')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
//           <app-icon name="users" [size]="16"></app-icon>
//           <span>User Accounts</span>
//           <span class="ml-auto bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">4</span>
//         </button>

//         <!-- Principal Entities -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('dlt-pe')"
//           [ngClass]="getNavClass('dlt-pe')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
//           <app-icon name="shield-check" [size]="16"></app-icon>
//           <span>Principal Entities</span>
//         </button>

//         <!-- Sender IDs -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('dlt-sender')"
//           [ngClass]="getNavClass('dlt-sender')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
//           <app-icon name="file-text" [size]="16"></app-icon>
//           <span>Sender IDs</span>
//         </button>

//         <!-- DLT Templates -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('dlt-template')"
//           [ngClass]="getNavClass('dlt-template')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
//           <app-icon name="copy" [size]="16"></app-icon>
//           <span>DLT Templates</span>
//         </button>

//         <!-- SMS Providers (MSG24) -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('providers')"
//           [ngClass]="getNavClass('providers')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
//           <app-icon name="server" [size]="16"></app-icon>
//           <span>SMS Providers (MSG24)</span>
//         </button>

//         <!-- Provider Routing -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('provider-routing')"
//           [ngClass]="getNavClass('provider-routing')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
//           <app-icon name="route" [size]="16"></app-icon>
//           <span>Provider Routing</span>
//         </button>

//         <!-- DLT Hash Tool -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('dlt-hash-tool')"
//           [ngClass]="getNavClass('dlt-hash-tool')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative">
//           <app-icon name="hash" [size]="16"></app-icon>
//           <span>DLT Hash Tool</span>
//           <span class="ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow">SHA256</span>
//         </button>

//         <!-- SMS Logs / Reports -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('sms-logs')"
//           [ngClass]="getNavClass('sms-logs')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
//           <app-icon name="file-text" [size]="16"></app-icon>
//           <span>SMS Reports & Logs</span>
//         </button>

//         <!-- Admin Audit Logs -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('audit-logs')"
//           [ngClass]="getNavClass('audit-logs')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
//           <app-icon name="history" [size]="16"></app-icon>
//           <span>Admin Audit Logs</span>
//         </button>

//         <!-- Settings -->
//         <button 
//           type="button" 
//           (click)="onSelectTab('settings')"
//           [ngClass]="getNavClass('settings')"
//           class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
//           <app-icon name="settings" [size]="16"></app-icon>
//           <span>Settings</span>
//         </button>
//       </div>

//       <!-- Footer / System Badge -->
//       <div class="p-4 border-t border-slate-800 bg-slate-950/80">
//         <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3" *ngIf="activeGateway()">
//           <div class="w-2.5 h-2.5 rounded-full animate-pulse" [ngClass]="activeGateway()?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'"></div>
//           <div class="overflow-hidden flex-1">
//             <p class="text-xs font-semibold text-slate-200 truncate">{{ activeGateway()?.name || 'Unknown' }} Gateway</p>
//             <p class="text-[10px] text-slate-400 font-mono truncate" [title]="activeGateway()?.baseUrl">{{ activeGateway()?.baseUrl }}</p>
//           </div>
//         </div>
        
//         <div class="bg-slate-900 border border-rose-900/50 rounded-xl p-3 flex items-center gap-3" *ngIf="!activeGateway()">
//           <div class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
//           <div class="overflow-hidden flex-1">
//             <p class="text-xs font-semibold text-rose-400 truncate">No Gateway Active</p>
//             <p class="text-[10px] text-rose-500 font-mono truncate">System Offline</p>
//           </div>
//         </div>
//       </div>
//     </aside>
//   `
// })
// export class SidebarComponent {
//   dataService = inject(DataService);

//   @Input() activeTab: NavTab = 'dashboard';
//   @Input() isSidebarOpen = true;
//   @Output() tabChange = new EventEmitter<NavTab>();

//   activeGateway = computed(() => {
//     const providers = this.dataService.smsProviders();
//     return providers.find(p => p.isGlobalDefault) || providers[0] || null;
//   });

//   onSelectTab(tab: NavTab) {
//     this.tabChange.emit(tab);
//   }

//   getNavClass(tab: NavTab): string {
//     if (this.activeTab === tab) {
//       return 'bg-[#5d55fa] text-white font-extrabold shadow-md shadow-indigo-600/30';
//     }
//     return 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60';
//   }
// }



import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';
import { DataService } from '../../services/data.service';

export type NavTab =
  | 'dashboard'
  | 'users'
  | 'sms-pricing'
  | 'bank-transfers'
  | 'billing-dashboard'
  | 'dlt-pe'
  | 'dlt-sender'
  | 'dlt-template'
  | 'providers'
  | 'provider-routing'
  | 'dlt-hash-tool'
  | 'sms-logs'
  | 'audit-logs'
  | 'settings';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <aside
      class="w-[260px] bg-[#0b1120] border-r border-slate-800/80 h-screen flex flex-col fixed left-0 top-0 z-40 text-slate-300 transition-transform duration-300 ease-in-out"
      [ngClass]="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'">

      <!-- Top Branding Logo -->
      <div class="h-[76px] p-1.5 flex items-center justify-center border-b border-slate-800/80">
        <div class="w-full h-full bg-white px-3 py-1 rounded-xl flex items-center justify-center shadow-sm">
          <img src="/logo.png" alt="Alert21" class="h-11 max-h-[52px] w-auto max-w-full object-contain">
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">

        <!-- Dashboard -->
        <button
          type="button"
          (click)="onSelectTab('dashboard')"
          [ngClass]="getNavClass('dashboard')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="layout-dashboard" [size]="16"></app-icon>
          <span>Dashboard</span>
        </button>

        <!-- User Accounts -->
        <button
          type="button"
          (click)="onSelectTab('users')"
          [ngClass]="getNavClass('users')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="users" [size]="16"></app-icon>
          <span>User Accounts</span>

          <span
            class="ml-auto bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {{ dataService.users().length }}
          </span>
        </button>

        <!-- BILLING SECTION (Task #05) -->
        <div class="pt-3 pb-1 px-3">
          <p class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Billing & SMS</p>
        </div>

        <!-- SMS Pricing -->
        <button
          type="button"
          (click)="onSelectTab('sms-pricing')"
          [ngClass]="getNavClass('sms-pricing')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="tag" [size]="16"></app-icon>
          <span>SMS Pricing Slabs</span>
        </button>

        <!-- Bank Transfer Requests -->
        <button
          type="button"
          (click)="onSelectTab('bank-transfers')"
          [ngClass]="getNavClass('bank-transfers')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="bank" [size]="16"></app-icon>
          <span>Bank Transfers</span>

          <span
            *ngIf="pendingTransfersCount() > 0"
            class="ml-auto bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-sm">
            {{ pendingTransfersCount() }}
          </span>
        </button>

        <!-- Billing Dashboard -->
        <button
          type="button"
          (click)="onSelectTab('billing-dashboard')"
          [ngClass]="getNavClass('billing-dashboard')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="credit-card" [size]="16"></app-icon>
          <span>Billing Dashboard</span>
        </button>

        <!-- DLT REGISTRY SECTION -->
        <div class="pt-3 pb-1 px-3">
          <p class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">DLT Compliance</p>
        </div>

        <!-- Principal Entities -->
        <button
          type="button"
          (click)="onSelectTab('dlt-pe')"
          [ngClass]="getNavClass('dlt-pe')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="shield-check" [size]="16"></app-icon>
          <span>Principal Entities</span>
        </button>

        <!-- Sender IDs -->
        <button
          type="button"
          (click)="onSelectTab('dlt-sender')"
          [ngClass]="getNavClass('dlt-sender')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="file-text" [size]="16"></app-icon>
          <span>Sender IDs</span>
        </button>

        <!-- DLT Templates -->
        <button
          type="button"
          (click)="onSelectTab('dlt-template')"
          [ngClass]="getNavClass('dlt-template')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="copy" [size]="16"></app-icon>
          <span>DLT Templates</span>
        </button>

        <!-- DLT Hash Tool -->
        <button
          type="button"
          (click)="onSelectTab('dlt-hash-tool')"
          [ngClass]="getNavClass('dlt-hash-tool')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative">

          <app-icon name="hash" [size]="16"></app-icon>
          <span>DLT Hash Tool</span>

          <span
            class="ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
            SHA256
          </span>
        </button>

        <!-- GATEWAYS & LOGS SECTION -->
        <div class="pt-3 pb-1 px-3">
          <p class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Gateways & Logs</p>
        </div>

        <!-- SMS Providers -->
        <button
          type="button"
          (click)="onSelectTab('providers')"
          [ngClass]="getNavClass('providers')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="server" [size]="16"></app-icon>
          <span>SMS Providers (MSG24)</span>
        </button>

        <!-- Provider Routing -->
        <button
          type="button"
          (click)="onSelectTab('provider-routing')"
          [ngClass]="getNavClass('provider-routing')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="route" [size]="16"></app-icon>
          <span>Provider Routing</span>
        </button>

        <!-- SMS Logs / Reports -->
        <button
          type="button"
          (click)="onSelectTab('sms-logs')"
          [ngClass]="getNavClass('sms-logs')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="file-text" [size]="16"></app-icon>
          <span>SMS Reports & Logs</span>
        </button>

        <!-- Admin Audit Logs -->
        <button
          type="button"
          (click)="onSelectTab('audit-logs')"
          [ngClass]="getNavClass('audit-logs')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="history" [size]="16"></app-icon>
          <span>Admin Audit Logs</span>
        </button>

        <!-- Settings -->
        <button
          type="button"
          (click)="onSelectTab('settings')"
          [ngClass]="getNavClass('settings')"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all">

          <app-icon name="settings" [size]="16"></app-icon>
          <span>Settings</span>
        </button>

      </div>

      <!-- Footer / System Badge -->
      <div class="p-4 border-t border-slate-800 bg-slate-950/80">

        <!-- Active Gateway -->
        <div
          *ngIf="activeGateway()"
          class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">

          <div
            class="w-2.5 h-2.5 rounded-full animate-pulse"
            [ngClass]="activeGateway().status === 'ACTIVE'
              ? 'bg-emerald-500'
              : 'bg-rose-500'">
          </div>

          <div class="overflow-hidden flex-1">

            <p class="text-xs font-semibold text-slate-200 truncate">
              {{ activeGateway().name || 'Unknown' }} Gateway
            </p>

            <p
              class="text-[10px] text-slate-400 font-mono truncate"
              [title]="activeGateway().baseUrl">

              {{ activeGateway().baseUrl }}

            </p>

          </div>
        </div>

        <!-- No Active Gateway -->
        <div
          *ngIf="!activeGateway()"
          class="bg-slate-900 border border-rose-900/50 rounded-xl p-3 flex items-center gap-3">

          <div
            class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse">
          </div>

          <div class="overflow-hidden flex-1">

            <p class="text-xs font-semibold text-rose-400 truncate">
              No Gateway Active
            </p>

            <p class="text-[10px] text-rose-500 font-mono truncate">
              System Offline
            </p>

          </div>
        </div>

      </div>

    </aside>
  `
})
export class SidebarComponent {

  dataService = inject(DataService);

  @Input() activeTab: NavTab = 'dashboard';

  @Input() isSidebarOpen = true;

  @Output() tabChange = new EventEmitter<NavTab>();

  activeGateway = computed(() => {
    const providers = this.dataService.smsProviders();

    return providers.find(p => p.isGlobalDefault)
      || providers[0]
      || null;
  });

  pendingTransfersCount(): number {
    return this.dataService.bankTransfers().filter(t => t.purchaseStatus === 'PENDING').length;
  }

  onSelectTab(tab: NavTab) {
    this.tabChange.emit(tab);
  }

  getNavClass(tab: NavTab): string {
    if (this.activeTab === tab) {
      return 'bg-[#5d55fa] text-white font-extrabold shadow-md shadow-indigo-600/30';
    }

    return 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60';
  }
}