import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { SignupSecurityTelemetry, SecuritySettings } from '../../models/alert21.models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-security-management',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Signup Security & Anti-Abuse Engine</h2>
          <p class="text-xs text-slate-500 font-medium">Monitor suspicious registrations, Cloudflare Turnstile CAPTCHA verification, Disposable Email domains & IP/Device rate limits.</p>
        </div>

        <button (click)="loadAllData()" class="btn btn-outline shadow-sm flex items-center gap-2">
          <app-icon name="rotate-cw" [size]="14"></app-icon>
          <span>Refresh Data</span>
        </button>
      </div>

      <!-- Quick Stats & Settings Switch Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" *ngIf="settings">
        <!-- Turnstile Status Card -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Cloudflare Turnstile</span>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full"
              [ngClass]="settings.turnstileEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
              {{ settings.turnstileEnabled ? 'ENABLED' : 'DISABLED' }}
            </span>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs text-slate-600">Require CAPTCHA on Signup</span>
            <button (click)="toggleTurnstile()" class="text-xs px-3 py-1 font-bold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200">
              Toggle
            </button>
          </div>
        </div>

        <!-- Disposable Email Filter Card -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Disposable Email Filter</span>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full"
              [ngClass]="settings.disposableEmailBlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
              {{ settings.disposableEmailBlocked ? 'BLOCKING' : 'OFF' }}
            </span>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs text-slate-600">Block Temporary Domains</span>
            <button (click)="toggleDisposableBlock()" class="text-xs px-3 py-1 font-bold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200">
              Toggle
            </button>
          </div>
        </div>

        <!-- IP Rate Limit Card -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">IP Velocity Limit</div>
          <div class="text-2xl font-black text-slate-900 mt-1">{{ settings.ipRateLimitPerHour }} <span class="text-xs font-normal text-slate-500">/ hour</span></div>
          <div class="text-[11px] text-slate-500 mt-1">Max signups allowed per IP address</div>
        </div>

        <!-- Device Velocity Limit Card -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Device Fingerprint Limit</div>
          <div class="text-2xl font-black text-slate-900 mt-1">{{ settings.deviceRateLimitPerHour }} <span class="text-xs font-normal text-slate-500">/ hour</span></div>
          <div class="text-[11px] text-slate-500 mt-1">Max signups allowed per device hash</div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="border-b border-slate-200 flex gap-6 text-sm font-bold">
        <button (click)="activeSubTab = 'telemetry'" class="pb-3 border-b-2"
          [ngClass]="activeSubTab === 'telemetry' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'">
          Signup Telemetry & Audit Logs
        </button>
        <button (click)="activeSubTab = 'disposable'" class="pb-3 border-b-2"
          [ngClass]="activeSubTab === 'disposable' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'">
          Disposable Email Blocklist
        </button>
      </div>

      <!-- TAB 1: TELEMETRY & SUSPICIOUS SIGNUPS -->
      <div *ngIf="activeSubTab === 'telemetry'" class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-900">Recent Registrations & Risk Ratings</h3>
          <span class="text-xs text-slate-500">Showing last {{ logs.length }} signup events</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead class="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-3">User & Contact</th>
                <th class="p-3">IP & Device Hash</th>
                <th class="p-3">Risk Score & Flags</th>
                <th class="p-3">Verifications</th>
                <th class="p-3">Account Status</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let item of logs" class="hover:bg-slate-50/50">
                <td class="p-3">
                  <div class="font-extrabold text-slate-900">{{ item.userId?.name || 'Pending User' }}</div>
                  <div class="text-[11px] text-slate-500 font-mono">{{ item.userId?.email }}</div>
                  <div class="text-[11px] text-slate-500 font-mono">{{ item.userId?.mobile }}</div>
                </td>
                <td class="p-3">
                  <div class="font-mono font-semibold text-slate-800">{{ item.ipAddress }}</div>
                  <div class="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">{{ item.deviceHash }}</div>
                </td>
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 font-mono font-black text-xs rounded-md"
                      [ngClass]="getRiskBadgeClass(item.riskScore)">
                      Score: {{ item.riskScore }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span *ngFor="let flag of item.riskFlags" class="px-1.5 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                      {{ flag }}
                    </span>
                  </div>
                </td>
                <td class="p-3 font-medium">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full" [ngClass]="item.captchaVerified ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    <span>CAPTCHA: {{ item.captchaVerified ? 'Passed' : 'Failed' }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="w-2 h-2 rounded-full" [ngClass]="item.emailOtpVerified ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    <span>Email OTP: {{ item.emailOtpVerified ? 'Verified' : 'Pending' }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="w-2 h-2 rounded-full" [ngClass]="item.mobileOtpVerified ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    <span>Mobile OTP: {{ item.mobileOtpVerified ? 'Verified' : 'Pending' }}</span>
                  </div>
                </td>
                <td class="p-3">
                  <span class="px-2.5 py-1 text-[10px] font-black uppercase rounded-full"
                    [ngClass]="getStatusBadgeClass(item.userId?.status)">
                    {{ item.userId?.status || 'UNKNOWN' }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button *ngIf="item.userId?._id && item.userId?.status !== 'ACTIVE'"
                      (click)="approveUser(item.userId!._id!)"
                      class="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg">
                      Approve
                    </button>
                    <button *ngIf="item.userId?._id && item.userId?.status !== 'BLOCKED'"
                      (click)="blockUser(item.userId!._id!)"
                      class="px-2.5 py-1 text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg">
                      Block
                    </button>
                    <button (click)="banIp(item.ipAddress)"
                      class="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg"
                      title="Ban IP Address">
                      Ban IP
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="logs.length === 0">
                <td colspan="6" class="p-8 text-center text-slate-400">No security telemetry logs available.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: DISPOSABLE DOMAINS -->
      <div *ngIf="activeSubTab === 'disposable'" class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-900">Blocked Disposable Email Domains</h3>
          
          <div class="flex gap-2">
            <input type="text" [(ngModel)]="newDomain" placeholder="e.g. mailinator.com" class="px-3 py-1.5 text-xs border rounded-lg w-64" />
            <button (click)="addDomain()" class="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Add Domain
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2">
          <div *ngFor="let dom of disposableDomains" class="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span class="font-mono text-slate-800 truncate">{{ dom.domain }}</span>
            <button (click)="removeDomain(dom.domain)" class="text-rose-500 hover:text-rose-700 font-bold ml-1">✕</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SecurityManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  activeSubTab: 'telemetry' | 'disposable' = 'telemetry';
  logs: SignupSecurityTelemetry[] = [];
  settings: SecuritySettings | null = null;
  disposableDomains: any[] = [];
  newDomain = '';

  ngOnInit() {
    this.loadAllData();
  }

  async loadAllData() {
    try {
      const headers = this.authService.getAuthHeaders();
      const baseUrl = environment.apiUrl;

      const [telemetryRes, settingsRes, domainsRes]: any = await Promise.all([
        firstValueFrom(this.http.get(`${baseUrl}/admin/security/suspicious-signups`, { headers })),
        firstValueFrom(this.http.get(`${baseUrl}/admin/security/settings`, { headers })),
        firstValueFrom(this.http.get(`${baseUrl}/admin/security/disposable-domains`, { headers }))
      ]);

      this.logs = telemetryRes.data || [];
      this.settings = settingsRes.data || null;
      this.disposableDomains = domainsRes.data || [];
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  }

  async toggleTurnstile() {
    if (!this.settings) return;
    this.settings.turnstileEnabled = !this.settings.turnstileEnabled;
    await this.saveSettings();
  }

  async toggleDisposableBlock() {
    if (!this.settings) return;
    this.settings.disposableEmailBlocked = !this.settings.disposableEmailBlocked;
    await this.saveSettings();
  }

  async saveSettings() {
    try {
      const headers = this.authService.getAuthHeaders();
      const baseUrl = environment.apiUrl;
      await firstValueFrom(this.http.put(`${baseUrl}/admin/security/settings`, this.settings, { headers }));
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  }

  async approveUser(userId: string) {
    try {
      const headers = this.authService.getAuthHeaders();
      const baseUrl = environment.apiUrl;
      await firstValueFrom(this.http.post(`${baseUrl}/admin/security/approve-user`, { userId }, { headers }));
      await this.loadAllData();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  }

  async blockUser(userId: string) {
    try {
      const headers = this.authService.getAuthHeaders();
      const baseUrl = environment.apiUrl;
      await firstValueFrom(this.http.post(`${baseUrl}/admin/security/block-user`, { userId, reason: 'Admin manual block' }, { headers }));
      await this.loadAllData();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }

  async banIp(ipAddress: string) {
    try {
      const headers = this.authService.getAuthHeaders();
      const baseUrl = environment.apiUrl;
      await firstValueFrom(this.http.post(`${baseUrl}/admin/security/ban-ip-device`, { ipAddress, reason: 'Admin security ban' }, { headers }));
      alert(`IP address ${ipAddress} has been banned.`);
      await this.loadAllData();
    } catch (error) {
      console.error('Error banning IP:', error);
    }
  }

  async addDomain() {
    if (!this.newDomain.trim()) return;
    try {
      const headers = this.authService.getAuthHeaders();
      const baseUrl = environment.apiUrl;
      await firstValueFrom(this.http.post(`${baseUrl}/admin/security/disposable-domains`, { domain: this.newDomain.trim() }, { headers }));
      this.newDomain = '';
      await this.loadAllData();
    } catch (error) {
      console.error('Error adding disposable domain:', error);
    }
  }

  async removeDomain(domain: string) {
    try {
      const headers = this.authService.getAuthHeaders();
      const baseUrl = environment.apiUrl;
      await firstValueFrom(this.http.delete(`${baseUrl}/admin/security/disposable-domains/${domain}`, { headers }));
      await this.loadAllData();
    } catch (error) {
      console.error('Error removing disposable domain:', error);
    }
  }

  getRiskBadgeClass(score: number): string {
    if (score >= 80) return 'bg-rose-100 text-rose-800 border border-rose-200';
    if (score >= 40) return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
      case 'UNDER_REVIEW': return 'bg-amber-100 text-amber-800';
      case 'BLOCKED': return 'bg-rose-100 text-rose-800';
      case 'PENDING_EMAIL':
      case 'PENDING_MOBILE': return 'bg-sky-100 text-sky-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
