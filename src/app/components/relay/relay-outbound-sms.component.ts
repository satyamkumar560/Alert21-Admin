import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { RelayService } from '../../services/relay.service';
import { RelayOutboundSmsLog, RelayUserLimit, OutboundSmsStatus } from '../../models/alert21.models';

@Component({
  selector: 'app-relay-outbound-sms',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/80 animate-pulse"></span>
            <span class="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              Android SMS Gateway v1.0
            </span>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Outbound SMS Send Controls & Logs</h2>
          <p class="text-xs text-slate-500 font-medium">
            Manage global outbound gateway permissions, monitor paired Android device queues, inspect live send logs, and configure user limits.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openSettingsModal()" class="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-indigo-200">
            <app-icon name="settings" [size]="14"></app-icon>
            <span>Gateway Limits & Config</span>
          </button>
          <button (click)="refreshAll()" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm">
            <app-icon name="rotate-cw" [size]="14"></app-icon>
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      <!-- MASTER CONTROLS BAR (3 QUICK SWITCHES) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" *ngIf="relayService.outboundSettings() as cfg">
        <!-- Switch 1: Global Outbound Gateway -->
        <div class="bg-white p-4 rounded-2xl border transition-all" [ngClass]="cfg.global_outbound_enabled ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg" [ngClass]="cfg.global_outbound_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                <app-icon name="send" [size]="18"></app-icon>
              </div>
              <div>
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-900">Global Android SMS Gateway</h4>
                <p class="text-[11px] text-slate-500">Master switch for entire platform</p>
              </div>
            </div>
            <button 
              type="button" 
              (click)="toggleSetting('global_outbound_enabled')" 
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              [ngClass]="cfg.global_outbound_enabled ? 'bg-emerald-500' : 'bg-slate-300'">
              <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                [ngClass]="cfg.global_outbound_enabled ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>
          <div class="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
            <span class="text-slate-500">Service Status:</span>
            <span [ngClass]="cfg.global_outbound_enabled ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'">
              {{ cfg.global_outbound_enabled ? 'LIVE / ACCEPTING JOBS' : 'SERVICE PAUSED' }}
            </span>
          </div>
        </div>

        <!-- Switch 2: API Sending -->
        <div class="bg-white p-4 rounded-2xl border transition-all" [ngClass]="cfg.api_sending_enabled ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200'">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                <app-icon name="code" [size]="18"></app-icon>
              </div>
              <div>
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-900">External API Sending</h4>
                <p class="text-[11px] text-slate-500">POST /android-sms/send</p>
              </div>
            </div>
            <button 
              type="button" 
              (click)="toggleSetting('api_sending_enabled')" 
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              [ngClass]="cfg.api_sending_enabled ? 'bg-indigo-600' : 'bg-slate-300'">
              <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                [ngClass]="cfg.api_sending_enabled ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>
          <div class="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
            <span class="text-slate-500">Customer API Traffic:</span>
            <span [ngClass]="cfg.api_sending_enabled ? 'text-indigo-700 font-bold' : 'text-slate-400'">
              {{ cfg.api_sending_enabled ? 'ENABLED' : 'BLOCKED' }}
            </span>
          </div>
        </div>

        <!-- Switch 3: Dashboard Sending -->
        <div class="bg-white p-4 rounded-2xl border transition-all" [ngClass]="cfg.dashboard_sending_enabled ? 'border-violet-200 bg-violet-50/20' : 'border-slate-200'">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-lg">
                <app-icon name="layout" [size]="18"></app-icon>
              </div>
              <div>
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-900">User Dashboard Sending</h4>
                <p class="text-[11px] text-slate-500">Manual SMS send from web panel</p>
              </div>
            </div>
            <button 
              type="button" 
              (click)="toggleSetting('dashboard_sending_enabled')" 
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              [ngClass]="cfg.dashboard_sending_enabled ? 'bg-violet-600' : 'bg-slate-300'">
              <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                [ngClass]="cfg.dashboard_sending_enabled ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>
          <div class="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
            <span class="text-slate-500">Web Portal Send:</span>
            <span [ngClass]="cfg.dashboard_sending_enabled ? 'text-violet-700 font-bold' : 'text-slate-400'">
              {{ cfg.dashboard_sending_enabled ? 'ALLOWED' : 'DISABLED' }}
            </span>
          </div>
        </div>
      </div>

      <!-- TOP METRIC CARDS -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" *ngIf="relayService.outboundSummary() as sm">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Sent</span>
            <span class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <app-icon name="send" [size]="14"></app-icon>
            </span>
          </div>
          <div class="text-2xl font-black text-slate-900 mt-2">{{ sm.todaySent | number }}</div>
          <div class="text-[11px] text-slate-400 font-medium mt-0.5">Outbound jobs dispatched</div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivered</span>
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <app-icon name="check-circle" [size]="14"></app-icon>
            </span>
          </div>
          <div class="text-2xl font-black text-emerald-600 mt-2">{{ sm.todayDelivered | number }}</div>
          <div class="text-[11px] text-emerald-700 font-semibold mt-0.5">
            {{ sm.todaySent > 0 ? (sm.todayDelivered / sm.todaySent * 100).toFixed(1) : 0 }}% Success Rate
          </div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Failed / Expired</span>
            <span class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <app-icon name="alert-circle" [size]="14"></app-icon>
            </span>
          </div>
          <div class="text-2xl font-black text-rose-600 mt-2">{{ sm.todayFailed | number }}</div>
          <div class="text-[11px] text-rose-600 font-medium mt-0.5">Offline / SIM / Network</div>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Recorded</span>
            <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <app-icon name="database" [size]="14"></app-icon>
            </span>
          </div>
          <div class="text-2xl font-black text-slate-900 mt-2">{{ sm.totalLogs | number }}</div>
          <div class="text-[11px] text-slate-400 font-medium mt-0.5">Lifetime Outbound Queue</div>
        </div>
      </div>

      <!-- MAIN TABS: LIVE LOGS vs USER QUOTAS -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <!-- View Switcher -->
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              (click)="activeView = 'LOGS'" 
              class="px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all"
              [ngClass]="activeView === 'LOGS' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'">
              <app-icon name="list" [size]="13" class="inline mr-1"></app-icon>
              Outbound SMS Logs
            </button>
            <button 
              type="button" 
              (click)="activeView = 'USER_LIMITS'; loadUserLimits()" 
              class="px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all"
              [ngClass]="activeView === 'USER_LIMITS' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'">
              <app-icon name="users" [size]="13" class="inline mr-1"></app-icon>
              User Limits & Quotas
            </button>
          </div>

          <!-- Controls when in LOGS view -->
          <div *ngIf="activeView === 'LOGS'" class="flex items-center gap-2 flex-wrap">
            <div class="relative">
              <app-icon name="search" [size]="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="applyFilters()"
                placeholder="Search SMS ID, Mobile, Text..." 
                class="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 w-52 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
              <option value="ALL">All Statuses</option>
              <option value="QUEUED">QUEUED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="DEVICE_RECEIVED">DEVICE_RECEIVED</option>
              <option value="SENDING">SENDING</option>
              <option value="SENT">SENT (Device Dispatched)</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="FAILED">FAILED</option>
              <option value="DEVICE_OFFLINE">DEVICE_OFFLINE</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>

            <select [(ngModel)]="sourceFilter" (change)="applyFilters()" class="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
              <option value="ALL">All Sources</option>
              <option value="API">API</option>
              <option value="DASHBOARD">DASHBOARD</option>
            </select>

            <button (click)="applyFilters()" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all">
              Filter
            </button>
          </div>
        </div>

        <!-- VIEW 1: OUTBOUND SMS LOGS TABLE -->
        <div *ngIf="activeView === 'LOGS'" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">Date & Time</th>
                <th class="py-3 px-4">SMS ID & User</th>
                <th class="py-3 px-4">Recipient</th>
                <th class="py-3 px-4">Assigned Device & SIM</th>
                <th class="py-3 px-4">Source</th>
                <th class="py-3 px-4">Message Content</th>
                <th class="py-3 px-4 text-center">Lifecycle Status</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              <tr *ngFor="let log of relayService.outboundLogs()" class="hover:bg-slate-50/80 transition-colors">
                <!-- Date -->
                <td class="py-3 px-4 whitespace-nowrap">
                  <div class="font-bold text-slate-900">{{ log.createdAt | date:'mediumDate' }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ log.createdAt | date:'mediumTime' }}</div>
                </td>

                <!-- SMS ID & User -->
                <td class="py-3 px-4">
                  <span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {{ log.sms_id }}
                  </span>
                  <div class="mt-1 font-semibold text-slate-900 text-[11px]">
                    {{ log.user_id?.name || 'API Client' }}
                  </div>
                  <div class="text-[10px] text-slate-400">{{ log.user_id?.company || log.user_id?.email }}</div>
                </td>

                <!-- Recipient Mobile -->
                <td class="py-3 px-4 whitespace-nowrap">
                  <span class="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                    <app-icon name="smartphone" [size]="12" class="text-slate-400"></app-icon>
                    +91 {{ log.mobile }}
                  </span>
                </td>

                <!-- Device & SIM -->
                <td class="py-3 px-4 whitespace-nowrap">
                  <div class="font-bold text-slate-800 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full" [ngClass]="log.device_id?.connection_status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                    {{ log.device_id?.device_label || 'Auto Assign' }}
                  </div>
                  <div class="text-[10px] text-slate-500 font-bold mt-0.5">
                    <span class="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">SIM {{ log.sim_slot || 1 }}</span>
                    <span class="ml-1 text-slate-400">{{ log.device_id?.model }}</span>
                  </div>
                </td>

                <!-- Source -->
                <td class="py-3 px-4 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="log.source === 'API' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-violet-50 text-violet-700 border border-violet-200'">
                    {{ log.source }}
                  </span>
                </td>

                <!-- Message Preview -->
                <td class="py-3 px-4 max-w-xs">
                  <div class="truncate font-sans text-slate-700 font-medium" [title]="log.message">
                    {{ log.message }}
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    {{ log.character_count || log.message.length }} chars &bull; {{ log.sms_parts || 1 }} part(s)
                  </div>
                </td>

                <!-- Status Lifecycle -->
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1"
                    [ngClass]="getStatusBadgeClass(log.status)">
                    <span *ngIf="log.status === 'SENDING' || log.status === 'QUEUED'" class="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                    {{ log.status }}
                  </span>
                  <div *ngIf="log.error_message || log.error_code" class="text-[10px] text-rose-600 font-bold mt-0.5 truncate max-w-[140px]" [title]="log.error_message">
                    {{ log.error_code || log.error_message }}
                  </div>
                </td>

                <!-- Action Button -->
                <td class="py-3 px-4 text-right whitespace-nowrap">
                  <button (click)="viewDetails(log)" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all">
                    Inspect
                  </button>
                </td>
              </tr>

              <tr *ngIf="relayService.outboundLogs().length === 0 && !relayService.isLoading()">
                <td colspan="8" class="text-center py-12 text-slate-400 text-xs">
                  <app-icon name="inbox" [size]="28" class="mx-auto mb-2 text-slate-300"></app-icon>
                  No outbound SMS logs match the selected filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VIEW 2: USER LIMITS & QUOTAS TABLE -->
        <div *ngIf="activeView === 'USER_LIMITS'" class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">User Outbound SMS Permissions & Throttle Quotas</h3>
              <p class="text-xs text-slate-500">Configure custom daily/monthly limits and rate-limiting per customer account.</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th class="py-3 px-4">User Account</th>
                  <th class="py-3 px-4">Outbound SMS Status</th>
                  <th class="py-3 px-4">API Send</th>
                  <th class="py-3 px-4">Dashboard Send</th>
                  <th class="py-3 px-4">Daily Limit</th>
                  <th class="py-3 px-4">Monthly Limit</th>
                  <th class="py-3 px-4">Max Devices</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                <tr *ngFor="let ul of relayService.userLimits()" class="hover:bg-slate-50">
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900">{{ ul.user_id?.name || 'Customer' }}</div>
                    <div class="text-[10px] text-slate-400">{{ ul.user_id?.email }} &bull; {{ ul.user_id?.company }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" [ngClass]="ul.outbound_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                      {{ ul.outbound_enabled ? 'ENABLED' : 'BLOCKED' }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold" [ngClass]="ul.api_enabled ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'">
                      {{ ul.api_enabled ? 'ACTIVE' : 'OFF' }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold" [ngClass]="ul.dashboard_enabled ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-400'">
                      {{ ul.dashboard_enabled ? 'ACTIVE' : 'OFF' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-bold">{{ ul.daily_limit | number }} SMS</td>
                  <td class="py-3 px-4 font-bold">{{ ul.monthly_limit | number }} SMS</td>
                  <td class="py-3 px-4 font-bold">{{ ul.max_devices || 5 }} Phones</td>
                  <td class="py-3 px-4 text-right">
                    <button (click)="openUserLimitModal(ul)" class="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all">
                      Edit Quotas
                    </button>
                  </td>
                </tr>

                <tr *ngIf="relayService.userLimits().length === 0">
                  <td colspan="8" class="text-center py-8 text-slate-400 text-xs">
                    All users currently inherit global default quotas (1,000/day, 25,000/month).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL / LIFECYCLE TIMELINE MODAL -->
    <div *ngIf="selectedLog" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm font-black text-indigo-700">{{ selectedLog.sms_id }}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase" [ngClass]="getStatusBadgeClass(selectedLog.status)">
                {{ selectedLog.status }}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Dispatched to +91 {{ selectedLog.mobile }}</p>
          </div>
          <button (click)="selectedLog = null" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <app-icon name="x" [size]="16"></app-icon>
          </button>
        </div>

        <!-- Full Message Box -->
        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dispatched Message Content</div>
          <p class="text-xs font-mono text-slate-900 whitespace-pre-wrap leading-relaxed">{{ selectedLog.message }}</p>
          <div class="mt-2 text-[10px] text-slate-400 font-semibold flex items-center justify-between">
            <span>Length: {{ selectedLog.message.length }} chars ({{ selectedLog.sms_parts || 1 }} part)</span>
            <span *ngIf="selectedLog.client_reference_id">Ref: {{ selectedLog.client_reference_id }}</span>
          </div>
        </div>

        <!-- Lifecycle Stage Progress Timeline -->
        <div>
          <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">Lifecycle &amp; Delivery Timeline</h4>
          <div class="space-y-3 pl-2 border-l-2 border-indigo-200 ml-2">
            <div class="relative pl-4">
              <span class="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-sm"></span>
              <div class="text-xs font-bold text-slate-900">Job Queued &amp; Validated</div>
              <div class="text-[10px] text-slate-400">{{ selectedLog.createdAt | date:'medium' }}</div>
            </div>

            <div class="relative pl-4" *ngIf="selectedLog.assigned_at || selectedLog.status !== 'QUEUED'">
              <span class="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow-sm"></span>
              <div class="text-xs font-bold text-slate-900">Assigned to {{ selectedLog.device_id?.device_label || 'Paired Phone' }}</div>
              <div class="text-[10px] text-slate-400">{{ (selectedLog.assigned_at || selectedLog.createdAt) | date:'medium' }}</div>
            </div>

            <div class="relative pl-4" *ngIf="selectedLog.sent_at || selectedLog.status === 'SENT' || selectedLog.status === 'DELIVERED'">
              <span class="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></span>
              <div class="text-xs font-bold text-slate-900">Submitted via Android SIM {{ selectedLog.sim_slot || 1 }}</div>
              <div class="text-[10px] text-slate-400">{{ (selectedLog.sent_at || selectedLog.updatedAt) | date:'medium' }}</div>
            </div>

            <div class="relative pl-4" *ngIf="selectedLog.delivered_at || selectedLog.status === 'DELIVERED'">
              <span class="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-sm"></span>
              <div class="text-xs font-bold text-emerald-700">Delivered to Recipient (Operator DLR Received)</div>
              <div class="text-[10px] text-slate-400">{{ (selectedLog.delivered_at || selectedLog.updatedAt) | date:'medium' }}</div>
            </div>

            <div class="relative pl-4" *ngIf="selectedLog.status === 'FAILED' || selectedLog.status === 'DEVICE_OFFLINE' || selectedLog.status === 'EXPIRED'">
              <span class="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-sm"></span>
              <div class="text-xs font-bold text-rose-700">{{ selectedLog.status }}: {{ selectedLog.error_code || 'Execution Error' }}</div>
              <div class="text-[10px] text-rose-500">{{ selectedLog.error_message || 'Device was unreachable or permission denied' }}</div>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-slate-100">
          <button (click)="selectedLog = null" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
            Close Inspector
          </button>
        </div>
      </div>
    </div>

    <!-- GLOBAL LIMITS CONFIG MODAL -->
    <div *ngIf="showConfigModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-extrabold text-slate-900">Global Android SMS Gateway Settings</h3>
          <button (click)="showConfigModal = false" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
            <app-icon name="x" [size]="16"></app-icon>
          </button>
        </div>

        <div class="space-y-3" *ngIf="editingConfig">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Default Daily SMS Limit</label>
              <input type="number" [(ngModel)]="editingConfig.default_daily_limit" class="w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Default Monthly SMS Limit</label>
              <input type="number" [(ngModel)]="editingConfig.default_monthly_limit" class="w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Max Devices per User</label>
              <input type="number" [(ngModel)]="editingConfig.max_devices_per_user" class="w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Max SMS per Minute (Throttle)</label>
              <input type="number" [(ngModel)]="editingConfig.max_sms_per_minute" class="w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Default Queue Expiry (Minutes)</label>
            <input type="number" [(ngModel)]="editingConfig.default_queue_expiry_minutes" class="w-full px-3 py-2 text-xs border rounded-xl font-mono font-bold" />
            <span class="text-[11px] text-slate-400 mt-1 block">Unassigned SMS jobs older than this will automatically expire.</span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button (click)="showConfigModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button (click)="saveGlobalSettings()" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">Save Global Rules</button>
        </div>
      </div>
    </div>
  `
})
export class RelayOutboundSmsComponent implements OnInit {
  relayService = inject(RelayService);

  activeView: 'LOGS' | 'USER_LIMITS' = 'LOGS';
  searchQuery = '';
  statusFilter = 'ALL';
  sourceFilter = 'ALL';

  selectedLog: RelayOutboundSmsLog | null = null;
  showConfigModal = false;
  editingConfig: any = null;

  ngOnInit() {
    this.refreshAll();
  }

  refreshAll() {
    this.relayService.fetchOutboundSettings();
    this.applyFilters();
  }

  applyFilters() {
    this.relayService.fetchOutboundLogs({
      search: this.searchQuery,
      status: this.statusFilter,
      source: this.sourceFilter,
      page: 1,
      limit: 50
    });
  }

  loadUserLimits() {
    this.relayService.fetchUserLimits();
  }

  async toggleSetting(field: 'global_outbound_enabled' | 'api_sending_enabled' | 'dashboard_sending_enabled') {
    const current = this.relayService.outboundSettings();
    if (!current) return;
    const newVal = !current[field];
    await this.relayService.updateOutboundSettings({
      [field]: newVal
    });
  }

  openSettingsModal() {
    const curr = this.relayService.outboundSettings();
    this.editingConfig = {
      default_daily_limit: curr?.default_daily_limit ?? 1000,
      default_monthly_limit: curr?.default_monthly_limit ?? 25000,
      max_devices_per_user: curr?.max_devices_per_user ?? 5,
      max_sms_per_minute: curr?.max_sms_per_minute ?? 60,
      default_queue_expiry_minutes: curr?.default_queue_expiry_minutes ?? 30,
    };
    this.showConfigModal = true;
  }

  async saveGlobalSettings() {
    if (!this.editingConfig) return;
    const ok = await this.relayService.updateOutboundSettings(this.editingConfig);
    if (ok) {
      this.showConfigModal = false;
    }
  }

  viewDetails(log: RelayOutboundSmsLog) {
    this.selectedLog = log;
  }

  openUserLimitModal(ul: RelayUserLimit) {
    const newLimit = prompt(`Enter new daily SMS limit for ${ul.user_id?.name || 'User'}:`, String(ul.daily_limit || 1000));
    if (newLimit !== null) {
      const num = parseInt(newLimit, 10);
      if (!isNaN(num)) {
        const uid = ul.user_id?._id || ul._id || ul.id;
        if (uid) {
          this.relayService.updateUserLimit(uid, { daily_limit: num });
        }
      }
    }
  }

  getStatusBadgeClass(status: OutboundSmsStatus): string {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'SENT':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'SENDING':
      case 'DEVICE_RECEIVED':
      case 'ASSIGNED':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'QUEUED':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'FAILED':
      case 'PERMISSION_DENIED':
      case 'DEVICE_OFFLINE':
      case 'NO_SIM':
      case 'NO_NETWORK':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      case 'EXPIRED':
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}
