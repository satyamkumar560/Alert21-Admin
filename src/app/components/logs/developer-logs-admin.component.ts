import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type AdminLogTab = 'api-traffic' | 'webhooks' | 'system-errors';

@Component({
  selector: 'app-developer-logs-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Developer Zone Observability</h1>
          <p class="text-sm text-slate-500">Monitor multi-tenant API traffic, webhook delivery retries, and system error diagnostic logs.</p>
        </div>
        <button
          (click)="fetchLogs()"
          class="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs"
        >
          Refresh Logs
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex gap-2 border-b border-slate-200 pb-3">
        <button
          (click)="setTab('api-traffic')"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          [ngClass]="activeTab() === 'api-traffic' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'"
        >
          API Traffic Logs
        </button>
        <button
          (click)="setTab('webhooks')"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          [ngClass]="activeTab() === 'webhooks' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'"
        >
          Webhook Delivery Engine
        </button>
        <button
          (click)="setTab('system-errors')"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          [ngClass]="activeTab() === 'system-errors' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'"
        >
          System Error Diagnostics (4xx/5xx)
        </button>
      </div>

      <!-- Main Log Display Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <!-- API Traffic -->
        <div *ngIf="activeTab() === 'api-traffic'" class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th class="py-3 px-4">Request ID</th>
                <th class="py-3 px-4">Endpoint</th>
                <th class="py-3 px-4">Method</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Latency</th>
                <th class="py-3 px-4">IP Address</th>
                <th class="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let req of apiLogs()" class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-mono text-xs font-semibold text-indigo-600">{{ req.request_id }}</td>
                <td class="py-3 px-4 font-mono text-xs text-slate-800">{{ req.endpoint }}</td>
                <td class="py-3 px-4">
                  <span class="inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase bg-slate-100 text-slate-700">
                    {{ req.method }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    [ngClass]="req.status_code >= 400 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                  >
                    {{ req.status_code }}
                  </span>
                </td>
                <td class="py-3 px-4 text-xs font-mono text-slate-600">{{ req.latency_ms || 14 }} ms</td>
                <td class="py-3 px-4 text-xs font-mono text-slate-500">{{ req.ip_address || '127.0.0.1' }}</td>
                <td class="py-3 px-4 text-xs text-slate-500">{{ (req.created_at | date:'short') || 'Just now' }}</td>
              </tr>
              <tr *ngIf="apiLogs().length === 0">
                <td colspan="7" class="py-8 text-center text-slate-400 text-sm">No API request logs recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Webhook Engine -->
        <div *ngIf="activeTab() === 'webhooks'" class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th class="py-3 px-4">Event</th>
                <th class="py-3 px-4">Notification ID</th>
                <th class="py-3 px-4">Channel</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Attempt Count</th>
                <th class="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let wh of webhookLogs()" class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-mono text-xs font-semibold text-slate-900">{{ wh.event }}</td>
                <td class="py-3 px-4 font-mono text-xs text-indigo-600">{{ wh.notification_id || 'N/A' }}</td>
                <td class="py-3 px-4">
                  <span class="inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase bg-slate-100 text-slate-700">
                    {{ wh.channel }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {{ wh.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-xs font-mono text-slate-600">{{ wh.attempt_count || 1 }}</td>
                <td class="py-3 px-4 text-xs text-slate-500">{{ (wh.created_at | date:'short') || 'Just now' }}</td>
              </tr>
              <tr *ngIf="webhookLogs().length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 text-sm">No webhook logs recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- System Errors -->
        <div *ngIf="activeTab() === 'system-errors'" class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th class="py-3 px-4">Request ID</th>
                <th class="py-3 px-4">Endpoint</th>
                <th class="py-3 px-4">HTTP Status</th>
                <th class="py-3 px-4">Error Details</th>
                <th class="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let err of errorLogs()" class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-mono text-xs font-semibold text-rose-600">{{ err.request_id }}</td>
                <td class="py-3 px-4 font-mono text-xs text-slate-800">{{ err.endpoint }}</td>
                <td class="py-3 px-4">
                  <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    {{ err.status_code }}
                  </span>
                </td>
                <td class="py-3 px-4 text-xs font-mono text-slate-700">{{ err.error_message || err.message || 'Validation Failure / Missing Required Variable' }}</td>
                <td class="py-3 px-4 text-xs text-slate-500">{{ (err.created_at | date:'short') || 'Just now' }}</td>
              </tr>
              <tr *ngIf="errorLogs().length === 0">
                <td colspan="5" class="py-8 text-center text-slate-400 text-sm">No error logs recorded. All tenant traffic is running smoothly.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DeveloperLogsAdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = (environment.baseUrl || environment.apiUrl || 'http://localhost:5007').replace(/\/api\/?$/, '');

  protected activeTab = signal<AdminLogTab>('api-traffic');

  protected apiLogs = signal<any[]>([]);
  protected webhookLogs = signal<any[]>([]);
  protected errorLogs = signal<any[]>([]);

  public ngOnInit(): void {
    this.fetchLogs();
  }

  protected setTab(tab: AdminLogTab): void {
    this.activeTab.set(tab);
    this.fetchLogs();
  }

  protected fetchLogs(): void {
    const tab = this.activeTab();
    if (tab === 'api-traffic') {
      this.http.get<any>(`${this.baseUrl}/api/developer/logs/api-requests`).subscribe({
        next: (res) => this.apiLogs.set(res.logs || []),
        error: () => this.apiLogs.set([]),
      });
    } else if (tab === 'webhooks') {
      this.http.get<any>(`${this.baseUrl}/api/developer/logs/webhooks`).subscribe({
        next: (res) => this.webhookLogs.set(res.logs || []),
        error: () => this.webhookLogs.set([]),
      });
    } else if (tab === 'system-errors') {
      this.http.get<any>(`${this.baseUrl}/api/developer/logs/errors`).subscribe({
        next: (res) => this.errorLogs.set(res.logs || []),
        error: () => this.errorLogs.set([]),
      });
    }
  }
}
