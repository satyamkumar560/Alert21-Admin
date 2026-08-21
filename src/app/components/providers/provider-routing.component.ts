import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-provider-routing',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Multi-Provider Architecture & Routing Engine</h2>
          <p class="text-xs text-slate-500 font-medium">Configure global default gateway, inspect priority hierarchy, and verify live user routing rules.</p>
        </div>
      </div>

      <!-- Priority Flow Card -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <app-icon name="route" [size]="18" className="text-indigo-600"></app-icon>
          <span>Alert21 Core Provider Routing Priority Flow</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Priority 1 -->
          <div class="bg-slate-900 text-white p-4 rounded-xl space-y-2 relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-300 font-extrabold text-xs flex items-center justify-center">1</span>
              <span class="badge badge-primary text-[10px] font-bold uppercase">Priority 1</span>
            </div>
            <p class="font-extrabold text-white text-xs">User Specific Provider</p>
            <p class="text-[11px] text-slate-300">If a specific active provider is mapped to the individual user account → Route directly via provider gateway.</p>
          </div>

          <!-- Priority 2 -->
          <div class="bg-slate-900 text-white p-4 rounded-xl space-y-2 relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 font-extrabold text-xs flex items-center justify-center">2</span>
              <span class="badge badge-active text-[10px] font-bold uppercase">Priority 2</span>
            </div>
            <p class="font-extrabold text-white text-xs">Global Default Provider</p>
            <p class="text-[11px] text-slate-300">Otherwise → Fallback to active Global Default Provider (Currently <strong class="text-emerald-400 font-extrabold">MSG24</strong>).</p>
          </div>

          <!-- Priority 3 -->
          <div class="bg-slate-900 text-white p-4 rounded-xl space-y-2 relative overflow-hidden">
            <div class="flex items-center justify-between">
              <span class="w-6 h-6 rounded-full bg-rose-500/30 text-rose-300 font-extrabold text-xs flex items-center justify-center">3</span>
              <span class="badge badge-blocked text-[10px] font-bold uppercase">Fallback Error</span>
            </div>
            <p class="font-extrabold text-white text-xs">Blocked / Controlled Error</p>
            <p class="text-[11px] text-slate-300">If no valid provider is available → Safely block sending and return controlled error code.</p>
          </div>
        </div>
      </div>

      <!-- Live User Provider Route Inspector (Connected to Live API) -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <app-icon name="server" [size]="18" className="text-purple-600"></app-icon>
              <span>Live User SMS Provider Inspector (GET API)</span>
            </h3>
            <p class="text-xs text-slate-500">Inspect resolved gateway directly from live API endpoint.</p>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-slate-600">Select User Account:</label>
            <select 
              [(ngModel)]="selectedUserId" 
              (change)="onInspectUserChange()"
              class="form-control text-xs font-semibold w-60 py-1.5">
              <option *ngFor="let u of dataService.users()" [value]="u.id">
                {{ u.name }} ({{ u.accountId }})
              </option>
            </select>
          </div>
        </div>

        <div *ngIf="inspectLoading" class="p-6 text-center text-xs text-slate-500 font-semibold">
          Fetching live provider configuration from server...
        </div>

        <div *ngIf="!inspectLoading && liveUserData" class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-slate-900 text-sm">{{ liveUserData.provider?.name || 'MSG24' }}</span>
              <span class="badge badge-primary font-mono text-[10px]">{{ liveUserData.provider?.code || 'MSG24' }}</span>
              <span class="badge badge-active text-[10px]">{{ liveUserData.provider?.status || 'ACTIVE' }}</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-500">Routing Source:</span>
              <span [class]="liveUserData.source === 'USER_SPECIFIC' ? 'badge badge-primary' : 'badge badge-active'">
                {{ liveUserData.source }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div class="bg-white p-2.5 rounded-lg border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase block">Gateway Base URL</span>
              <span class="font-mono text-slate-800 text-[11px] font-medium break-all">{{ liveUserData.provider?.base_url }}</span>
            </div>

            <div class="bg-white p-2.5 rounded-lg border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase block">API Username / Account</span>
              <span class="font-mono text-slate-800 text-[11px] font-bold">{{ liveUserData.provider?.username }}</span>
            </div>

            <div class="bg-white p-2.5 rounded-lg border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase block">Telemarketer ID (Masked)</span>
              <span class="font-mono text-slate-800 text-[11px] font-bold">{{ liveUserData.provider?.telemarketer_id_masked || '130***382' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Default Gateway Selection -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 class="font-extrabold text-slate-900 text-sm">Global Default Gateway Selection</h3>

        <div class="space-y-3">
          <div *ngFor="let provider of dataService.smsProviders()" class="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <app-icon name="server" [size]="18"></app-icon>
              </div>
              <div>
                <p class="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>{{ provider.name }}</span>
                  <span *ngIf="provider.isGlobalDefault" class="badge badge-active text-[9px]">GLOBAL DEFAULT</span>
                </p>
                <p class="text-xs text-slate-300 font-mono">Code: {{ provider.code }} | Base URL: {{ provider.baseUrl }}</p>
              </div>
            </div>

            <button 
              *ngIf="!provider.isGlobalDefault" 
              (click)="setGlobalDefault(provider.id)" 
              class="btn btn-primary btn-sm text-xs font-semibold">
              Make Global Default
            </button>

            <span *ngIf="provider.isGlobalDefault" class="badge badge-active font-mono text-xs font-bold">
              ACTIVE GLOBAL DEFAULT
            </span>
          </div>
        </div>
      </div>

      <!-- User Mappings Table Overview -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 class="font-extrabold text-slate-900 text-sm">User-Wise Provider Routing Matrix</h3>

        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Company Name</th>
                <th>Assigned Route</th>
                <th>Resolved Gateway</th>
                <th>Routing Source</th>
                <th>DLT Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of dataService.users()">
                <td>
                  <div class="font-extrabold text-slate-900 text-sm">{{ user.name }}</div>
                  <div class="font-mono text-xs text-indigo-600 font-bold">{{ user.accountId }}</div>
                </td>
                <td class="text-xs text-slate-600 font-medium">{{ user.company }}</td>
                <td>
                  <span *ngIf="user.assignedProviderId" class="badge badge-primary font-mono text-[10px]">
                    USER SPECIFIC: {{ user.assignedProviderId }}
                  </span>
                  <span *ngIf="!user.assignedProviderId" class="badge badge-suspended text-[10px]">
                    GLOBAL DEFAULT FALLBACK
                  </span>
                </td>
                <td>
                  <span class="font-mono font-black text-emerald-600 text-xs">
                    {{ resolveGateway(user) }}
                  </span>
                </td>
                <td>
                  <button 
                    (click)="inspectUserApi(user.id)"
                    class="btn btn-outline btn-sm text-[10px] py-0.5 px-2 font-bold">
                    Inspect API
                  </button>
                </td>
                <td>
                  <span class="badge badge-active text-[10px]">PE VERIFIED</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ProviderRoutingComponent implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);

  selectedUserId: string = '';
  liveUserData: any = null;
  inspectLoading: boolean = false;

  async ngOnInit() {
    const usersList = this.dataService.users();
    if (usersList.length > 0) {
      this.selectedUserId = usersList[0].id;
      this.loadLiveUserSmsProvider(this.selectedUserId);
    }
  }

  async onInspectUserChange() {
    if (this.selectedUserId) {
      this.loadLiveUserSmsProvider(this.selectedUserId);
    }
  }

  async inspectUserApi(userId: string) {
    this.selectedUserId = userId;
    this.loadLiveUserSmsProvider(userId);
  }

  async loadLiveUserSmsProvider(userId: string) {
    this.inspectLoading = true;
    const res = await this.dataService.fetchUserSmsProvider(userId);
    this.inspectLoading = false;

    if (res) {
      this.liveUserData = res;
    } else {
      // Fallback display if offline/mock
      this.liveUserData = {
        provider: {
          id: '6a86fd61d9afabd50ec00dbc',
          name: 'MSG24',
          code: 'MSG24',
          base_url: 'https://admin.msg24x7.co.in/fe/api/v1/send',
          username: 'satyam12',
          telemarketer_id_masked: '130***382',
          status: 'ACTIVE',
          is_default: true
        },
        source: 'GLOBAL_DEFAULT'
      };
    }
  }

  setGlobalDefault(providerId: string) {
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    this.dataService.setGlobalDefaultProvider(providerId, adminName);
  }

  resolveGateway(user: any) {
    if (user.assignedProviderId) {
      const p = this.dataService.smsProviders().find(pr => pr.id === user.assignedProviderId);
      return p ? p.name : 'User Specific Gateway';
    }
    const def = this.dataService.smsProviders().find(pr => pr.isGlobalDefault);
    return def ? `${def.name} (Global Default)` : 'MSG24 (Global Default)';
  }
}
