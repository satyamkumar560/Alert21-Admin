import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
// import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Admin Audit Trail Logs</h2>
          <p class="text-xs text-slate-500 font-medium">Complete auditable log of administrative actions, DLT approvals, provider changes, and user status modifications.</p>
        </div>

        <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mr-7 shadow-xs">
          RBAC Governance Active
        </span>
      </div>

      <!-- Audit Logs Table -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Audit ID & Time</th>
                <th>Admin Operator</th>
                <th>Action Performed</th>
                <th>Entity Type & Identifier</th>
                <th style="min-width: 200px">Old Value</th>
                <th style="min-width: 200px">New Value</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let audit of dataService.auditLogs()">
                <td>
                  <span class="font-mono text-xs font-bold text-indigo-600">{{ audit.id }}</span>
                  <div class="text-[10px] text-slate-500 font-mono font-medium">{{ audit.createdAt | date:'medium' }}</div>
                </td>
                <td>
                  <div class="font-bold text-slate-900 text-xs">{{ audit.adminName }}</div>
                  <span class="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">{{ audit.adminRole }}</span>
                </td>
                <td>
                  <span class="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">{{ audit.action }}</span>
                </td>
                <td>
                  <span class="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">{{ audit.entityType }}</span>
                  <div class="font-mono text-[10px] font-semibold text-slate-500 mt-1">{{ audit.entityId }}</div>
                </td>
                <td>
                  <div class="font-mono text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 break-words max-w-[200px] whitespace-pre-wrap leading-tight">
                    {{ audit.oldValue || 'N/A' }}
                  </div>
                </td>
                <td>
                  <div class="font-mono text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-semibold break-words max-w-[200px] whitespace-pre-wrap leading-tight">
                    {{ audit.newValue || 'N/A' }}
                  </div>
                </td>
                <td>
                  <span class="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{{ audit.ipAddress }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AuditLogsComponent implements OnInit {
  dataService = inject(DataService);

  ngOnInit() {
    this.dataService.fetchLiveAuditLogs();
  }
}
