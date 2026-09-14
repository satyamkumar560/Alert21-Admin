import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../shared/icon.component';

export interface AdminStaffItem {
  _id: string;
  account_id?: {
    _id: string;
    fullName: string;
    companyName: string;
    email: string;
    mobileNumber?: string;
  };
  full_name: string;
  email: string;
  mobile_number?: string;
  designation?: string;
  department?: string;
  role_id?: {
    _id: string;
    name: string;
    code: string;
  };
  custom_permissions?: string[];
  status: 'ACTIVE' | 'INACTIVE';
  login_allowed: boolean;
  access_valid_until?: string;
  created_at: string;
}

export interface AdminStaffLog {
  _id: string;
  account_id?: {
    _id: string;
    fullName: string;
    companyName: string;
    email: string;
  };
  staff_name: string;
  module: string;
  action: string;
  target?: string;
  ip_address?: string;
  status: 'SUCCESS' | 'FAILED';
  details?: any;
  created_at: string;
}

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px;">
        <div style="text-align: left;">
          <h2 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <app-icon name="shield" [size]="18"></app-icon>
            </span>
            <span>Staff & Access Control (RBAC)</span>
          </h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">Platform-wide visibility into customer staff members, role permissions, login switches, and centralized audit trails.</p>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end; margin-right: 28px;">
          <button (click)="fetchStaff(); fetchLogs()" class="btn btn-outline btn-sm text-xs font-bold shadow-xs hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center gap-1.5">
            <app-icon name="rotate-cw" [size]="14" className="text-indigo-600"></app-icon>
            <span>Refresh Live Data</span>
          </button>
        </div>
      </div>

      <!-- 4 TOP METRICS STATS CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Staff -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Platform Staff</span>
            <div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <app-icon name="users" [size]="14"></app-icon>
            </div>
          </div>
          <div>
            <h4 class="text-xl font-black text-slate-900 font-mono">{{ staffList().length }}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">Created across all tenant accounts</p>
          </div>
        </div>

        <!-- 2. Active Logins -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Staff Logins</span>
            <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <app-icon name="user-check" [size]="14"></app-icon>
            </div>
          </div>
          <div>
            <h4 class="text-xl font-black text-emerald-600 font-mono">{{ activeStaffCount() }}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">Allowed to access web portal</p>
          </div>
        </div>

        <!-- 3. Locked / Suspended -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Locked / Disabled</span>
            <div class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <app-icon name="lock" [size]="14"></app-icon>
            </div>
          </div>
          <div>
            <h4 class="text-xl font-black text-rose-600 font-mono">{{ lockedStaffCount() }}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">Login restricted by Owner / Admin</p>
          </div>
        </div>

        <!-- 4. Total Audit Actions -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Audit Trail Records</span>
            <div class="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <app-icon name="activity" [size]="14"></app-icon>
            </div>
          </div>
          <div>
            <h4 class="text-xl font-black text-purple-600 font-mono">{{ logList().length }}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">Recorded operations & changes</p>
          </div>
        </div>
      </div>

      <!-- NAVIGATION TABS PILLS -->
      <div class="flex items-center justify-between border-b border-slate-200 pb-3">
        <div class="flex items-center gap-2">
          <button 
            type="button" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            [ngClass]="activeSubTab() === 'members' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
            (click)="activeSubTab.set('members')">
            <app-icon name="users" [size]="15"></app-icon>
            <span>Tenant Staff Members</span>
            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-black"
              [ngClass]="activeSubTab() === 'members' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'">
              {{ staffList().length }}
            </span>
          </button>

          <button 
            type="button" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            [ngClass]="activeSubTab() === 'logs' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
            (click)="activeSubTab.set('logs'); fetchLogs()">
            <app-icon name="activity" [size]="15"></app-icon>
            <span>Audit Activity Logs</span>
            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-black"
              [ngClass]="activeSubTab() === 'logs' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'">
              {{ logList().length }}
            </span>
          </button>

          <button 
            type="button" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            [ngClass]="activeSubTab() === 'matrix' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
            (click)="activeSubTab.set('matrix')">
            <app-icon name="shield" [size]="15"></app-icon>
            <span>System Role Matrix</span>
          </button>
        </div>
      </div>

      <!-- ================= TAB 1: STAFF MEMBERS ================= -->
      <div *ngIf="activeSubTab() === 'members'" class="space-y-4">
        <!-- Search & Filter Controls -->
        <div class="flex items-center justify-between gap-4">
          <div class="relative w-80">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (ngModelChange)="filterStaff()"
              placeholder="Search staff, email, customer..." 
              class="form-control search-input text-xs py-2 pl-9 bg-white border border-slate-200 rounded-xl w-full">
            <div class="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div class="flex items-center gap-2.5">
            <select [(ngModel)]="statusFilter" (change)="fetchStaff()" class="form-control text-xs font-semibold w-36 py-2 px-3 bg-white border border-slate-200 rounded-xl">
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <button class="btn btn-outline btn-sm text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5" (click)="fetchStaff()">
              <app-icon name="rotate-cw" [size]="13" className="text-slate-600"></app-icon>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- Table Card -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Parent Customer / Tenant</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Staff Member</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Email & Mobile</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Assigned Role</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Login Access</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Status</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400 text-right">Emergency Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let staff of filteredStaff()" class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="font-black text-slate-900 text-xs">{{ staff.account_id?.companyName || staff.account_id?.fullName || 'Tenant Customer' }}</div>
                    <div class="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <app-icon name="mail" [size]="10"></app-icon>
                      {{ staff.account_id?.email || '—' }}
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs flex items-center justify-center shadow-xs">
                        {{ staff.full_name ? staff.full_name.charAt(0).toUpperCase() : 'U' }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900 text-xs">{{ staff.full_name }}</div>
                        <div class="text-[11px] text-slate-500">{{ staff.designation || 'Staff Member' }} • <span class="text-slate-400">{{ staff.department || 'General' }}</span></div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="text-xs text-slate-800 font-semibold">{{ staff.email }}</div>
                    <div class="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <app-icon name="phone" [size]="10"></app-icon>
                      {{ staff.mobile_number || '—' }}
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs flex items-center gap-1">
                        <app-icon name="shield" [size]="11"></app-icon>
                        {{ staff.role_id?.name || 'Staff' }}
                      </span>
                      <span *ngIf="staff.custom_permissions && staff.custom_permissions.length > 0" class="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        +{{ staff.custom_permissions.length }} Custom
                      </span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase"
                      [ngClass]="staff.login_allowed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="staff.login_allowed ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'"></span>
                      {{ staff.login_allowed ? 'Allowed' : 'Blocked' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <span 
                      class="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide"
                      [ngClass]="staff.status === 'ACTIVE' ? 'bg-emerald-100/70 text-emerald-800' : 'bg-slate-100 text-slate-600'">
                      {{ staff.status }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button 
                      type="button"
                      class="btn btn-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                      [ngClass]="staff.login_allowed 
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-xs'"
                      (click)="toggleLogin(staff)">
                      <app-icon [name]="staff.login_allowed ? 'lock' : 'unlock'" [size]="12"></app-icon>
                      <span>{{ staff.login_allowed ? 'Lock Access' : 'Allow Access' }}</span>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredStaff().length === 0">
                  <td colspan="7" class="text-center py-16 text-slate-400">
                    <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                      <app-icon name="users" [size]="24"></app-icon>
                    </div>
                    <p class="text-xs font-bold text-slate-600">No staff members found.</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">Staff members created by tenant account owners will appear here automatically.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= TAB 2: AUDIT ACTIVITY LOGS ================= -->
      <div *ngIf="activeSubTab() === 'logs'" class="space-y-4">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="font-black text-slate-900 text-sm">Platform Audit Activity Trail</h3>
              <p class="text-[11px] text-slate-400 font-medium">Recorded user actions and security events across all tenant staff members.</p>
            </div>
            <button class="btn btn-outline btn-xs font-bold" (click)="fetchLogs()">
              <app-icon name="rotate-cw" [size]="12" className="text-indigo-600"></app-icon>
              <span>Refresh Logs</span>
            </button>
          </div>

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Timestamp</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Tenant Customer</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Staff Member</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Module</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Action</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">IP Address</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let log of logList()" class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3 px-4 text-xs text-slate-500 font-mono">{{ log.created_at | date:'medium' }}</td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900 text-xs">{{ log.account_id?.companyName || log.account_id?.fullName || 'Tenant Account' }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-indigo-700 text-xs flex items-center gap-1.5">
                      <app-icon name="user" [size]="12"></app-icon>
                      {{ log.staff_name }}
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {{ log.module }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="text-xs font-mono font-bold text-indigo-600 bg-indigo-50/70 px-2 py-0.5 rounded border border-indigo-100">
                      {{ log.action }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-xs font-mono text-slate-500">{{ log.ip_address || '—' }}</td>
                  <td class="py-3 px-4 text-center">
                    <span 
                      class="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase"
                      [ngClass]="log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
                      {{ log.status }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="logList().length === 0">
                  <td colspan="7" class="text-center py-16 text-slate-400">
                    <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                      <app-icon name="activity" [size]="24"></app-icon>
                    </div>
                    <p class="text-xs font-bold text-slate-600">No activity logs recorded yet.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= TAB 3: ROLE MATRIX ================= -->
      <div *ngIf="activeSubTab() === 'matrix'" class="space-y-4">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div class="mb-4">
            <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
              <app-icon name="shield" [size]="16" className="text-indigo-600"></app-icon>
              <span>Default Platform Role Access Control Matrix</span>
            </h3>
            <p class="text-[11px] text-slate-400 font-medium mt-0.5">Pre-configured system roles automatically provisioned for every Alert21 tenant account.</p>
          </div>

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Role Name</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Role Code</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Permissions Scope</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">DLT & SMS</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">SMS Relay (Android)</th>
                  <th class="py-3 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Billing & Top-up</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Account Owner
                    </span>
                  </td>
                  <td class="py-3.5 px-4"><code class="text-xs font-mono font-bold text-slate-600">OWNER</code></td>
                  <td class="py-3.5 px-4 text-xs font-semibold text-slate-700">Permanent Full System Authority</td>
                  <td class="py-3.5 px-4"><span class="text-emerald-600 font-black text-xs">✓ Unrestricted</span></td>
                  <td class="py-3.5 px-4"><span class="text-emerald-600 font-black text-xs">✓ Unrestricted</span></td>
                  <td class="py-3.5 px-4"><span class="text-emerald-600 font-black text-xs">✓ Full Access</span></td>
                </tr>
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                      Admin Staff
                    </span>
                  </td>
                  <td class="py-3.5 px-4"><code class="text-xs font-mono font-bold text-slate-600">ADMIN_STAFF</code></td>
                  <td class="py-3.5 px-4 text-xs font-semibold text-slate-700">All features & config except billing payments</td>
                  <td class="py-3.5 px-4"><span class="text-emerald-600 font-black text-xs">✓ Full Access</span></td>
                  <td class="py-3.5 px-4"><span class="text-emerald-600 font-black text-xs">✓ Full Access</span></td>
                  <td class="py-3.5 px-4"><span class="text-rose-500 font-bold text-xs">✗ Restricted</span></td>
                </tr>
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                      Operator
                    </span>
                  </td>
                  <td class="py-3.5 px-4"><code class="text-xs font-mono font-bold text-slate-600">OPERATOR</code></td>
                  <td class="py-3.5 px-4 text-xs font-semibold text-slate-700">Send SMS, WhatsApp, Relay & Email alerts</td>
                  <td class="py-3.5 px-4"><span class="text-blue-600 font-bold text-xs">✓ Send Only</span></td>
                  <td class="py-3.5 px-4"><span class="text-blue-600 font-bold text-xs">✓ Send & Rules</span></td>
                  <td class="py-3.5 px-4"><span class="text-rose-500 font-bold text-xs">✗ Restricted</span></td>
                </tr>
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                      Viewer
                    </span>
                  </td>
                  <td class="py-3.5 px-4"><code class="text-xs font-mono font-bold text-slate-600">VIEWER</code></td>
                  <td class="py-3.5 px-4 text-xs font-semibold text-slate-700">Read-only view of delivery reports & logs</td>
                  <td class="py-3.5 px-4"><span class="text-amber-600 font-bold text-xs">✓ Reports Only</span></td>
                  <td class="py-3.5 px-4"><span class="text-amber-600 font-bold text-xs">✓ Inbox Only</span></td>
                  <td class="py-3.5 px-4"><span class="text-rose-500 font-bold text-xs">✗ Restricted</span></td>
                </tr>
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                      Technical
                    </span>
                  </td>
                  <td class="py-3.5 px-4"><code class="text-xs font-mono font-bold text-slate-600">TECHNICAL</code></td>
                  <td class="py-3.5 px-4 text-xs font-semibold text-slate-700">Device pairing, API credentials & Webhooks</td>
                  <td class="py-3.5 px-4"><span class="text-amber-600 font-bold text-xs">✓ API / Whitelist</span></td>
                  <td class="py-3.5 px-4"><span class="text-emerald-600 font-black text-xs">✓ Pair Devices</span></td>
                  <td class="py-3.5 px-4"><span class="text-rose-500 font-bold text-xs">✗ Restricted</span></td>
                </tr>
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Accounts
                    </span>
                  </td>
                  <td class="py-3.5 px-4"><code class="text-xs font-mono font-bold text-slate-600">ACCOUNTS</code></td>
                  <td class="py-3.5 px-4 text-xs font-semibold text-slate-700">Invoices, Bank Reconciliation & purchase history</td>
                  <td class="py-3.5 px-4"><span class="text-rose-500 font-bold text-xs">✗ Restricted</span></td>
                  <td class="py-3.5 px-4"><span class="text-emerald-600 font-black text-xs">✓ Bank Recon</span></td>
                  <td class="py-3.5 px-4"><span class="text-emerald-600 font-black text-xs">✓ Ledgers & Buy</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StaffComponent implements OnInit {
  private http = inject(HttpClient);
  public authService = inject(AuthService);
  private toast = inject(ToastService);

  private baseUrl = 'https://app.alert21.in/back/api/admin/staff';

  public activeSubTab = signal<'members' | 'logs' | 'matrix'>('members');
  public staffList = signal<AdminStaffItem[]>([]);
  public logList = signal<AdminStaffLog[]>([]);
  public searchQuery = '';
  public statusFilter = 'ALL';

  public activeStaffCount(): number {
    return this.staffList().filter((s) => s.login_allowed && s.status === 'ACTIVE').length;
  }

  public lockedStaffCount(): number {
    return this.staffList().filter((s) => !s.login_allowed || s.status === 'INACTIVE').length;
  }

  public ngOnInit(): void {
    this.fetchStaff();
    this.fetchLogs();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  public async fetchStaff(): Promise<void> {
    try {
      const params: any = {};
      if (this.statusFilter !== 'ALL') params.status = this.statusFilter;

      const res: any = await firstValueFrom(
        this.http.get<{ success: boolean; data: any }>(`${this.baseUrl}/members`, {
          headers: this.getHeaders(),
          params,
        })
      );

      if (res?.success) {
        this.staffList.set(res.data.items || res.data.staff || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch admin staff list:', err);
    }
  }

  public async toggleLogin(staff: AdminStaffItem): Promise<void> {
    try {
      const res: any = await firstValueFrom(
        this.http.post<{ success: boolean; message: string; data: any }>(
          `${this.baseUrl}/members/${staff._id}/toggle-login`,
          {},
          { headers: this.getHeaders() }
        )
      );

      if (res?.success) {
        this.toast.success(res.message || 'Staff login status updated.');
        this.staffList.update((list) =>
          list.map((s) => (s._id === staff._id ? { ...s, login_allowed: !s.login_allowed } : s))
        );
      }
    } catch (err: any) {
      this.toast.error(err?.error?.message || 'Failed to toggle login status.');
    }
  }

  public async fetchLogs(): Promise<void> {
    try {
      const res: any = await firstValueFrom(
        this.http.get<{ success: boolean; data: any }>(`${this.baseUrl}/activity-logs`, {
          headers: this.getHeaders(),
        })
      );

      if (res?.success) {
        this.logList.set(res.data.items || res.data.logs || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch activity logs:', err);
    }
  }

  public filteredStaff(): AdminStaffItem[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.staffList();

    return this.staffList().filter((s) => {
      const nameMatch = s.full_name?.toLowerCase().includes(q);
      const emailMatch = s.email?.toLowerCase().includes(q);
      const companyMatch = s.account_id?.companyName?.toLowerCase().includes(q) || s.account_id?.fullName?.toLowerCase().includes(q);
      return nameMatch || emailMatch || companyMatch;
    });
  }

  public filterStaff(): void {
    // triggers change detection via filteredStaff()
  }
}

