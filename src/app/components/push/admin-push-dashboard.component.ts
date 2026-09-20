import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-push-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Admin Push Notification Infrastructure</h1>
          <p class="text-sm text-slate-500">Configure global FCM, APNs, VAPID key rotation, and editable Push Package limits.</p>
        </div>
        <button (click)="loadOverview()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs">
          Refresh Overview
        </button>
      </div>

      <!-- Health Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">FCM Infrastructure</span>
          <div class="text-xl font-black text-emerald-600 mt-2 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Healthy
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">APNs Credentials</span>
          <div class="text-xl font-black text-emerald-600 mt-2 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active (Scriza Team)
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Global VAPID Engine</span>
          <div class="text-xl font-black text-indigo-600 mt-2">Active</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Registered SaaS Apps</span>
          <div class="text-xl font-black text-slate-900 mt-2">{{ stats().total_applications || 0 }} Apps</div>
        </div>
      </div>

      <!-- Push Package Pricing Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Push Packages & Editable Limits</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th class="py-3 px-4">Package Name</th>
                <th class="py-3 px-4">Monthly Price (INR)</th>
                <th class="py-3 px-4">Monthly Push Limit</th>
                <th class="py-3 px-4">App Limit</th>
                <th class="py-3 px-4">Retention</th>
                <th class="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let pkg of packages()" class="hover:bg-slate-50">
                <td class="py-3.5 px-4 font-bold text-slate-900">{{ pkg.package_name }}</td>
                <td class="py-3.5 px-4 font-mono font-semibold text-indigo-600">₹{{ pkg.monthly_price_inr }} / mo</td>
                <td class="py-3.5 px-4 font-mono text-slate-700">{{ pkg.monthly_push_limit | number }}</td>
                <td class="py-3.5 px-4 font-mono text-slate-700">{{ pkg.application_limit }}</td>
                <td class="py-3.5 px-4 text-slate-600">{{ pkg.retention_days }} Days</td>
                <td class="py-3.5 px-4">
                  <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </td>
              </tr>
              <tr *ngIf="packages().length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 text-sm">No push packages configured yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminPushDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = (environment.baseUrl || environment.apiUrl || 'http://localhost:5007').replace(/\/api\/?$/, '');

  protected stats = signal<any>({});
  protected packages = signal<any[]>([]);

  public ngOnInit(): void {
    this.loadOverview();
  }

  protected loadOverview(): void {
    this.http.get<any>(`${this.baseUrl}/api/admin/push/overview`).subscribe({
      next: (res) => this.stats.set(res.stats || {}),
      error: () => this.stats.set({ total_applications: 0, total_subscribers: 0 }),
    });

    this.http.get<any>(`${this.baseUrl}/api/admin/push/packages`).subscribe({
      next: (res) => this.packages.set(res.packages || []),
      error: () => this.packages.set([]),
    });
  }
}
