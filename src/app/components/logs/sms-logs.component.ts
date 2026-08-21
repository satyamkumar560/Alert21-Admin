import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ProviderRequestLog } from '../../models/alert21.models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-sms-logs',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900">SMS Provider Request Logs</h2>
          <p class="text-xs text-slate-500">Outbound request audit trail with masked mobile numbers, PE ID, Sender ID, latency, and secret masking.</p>
        </div>

        <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-700 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Credential Masking Audit Active</span>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User Account</th>
                <th>Gateway Provider</th>
                <th>Masked Recipient</th>
                <th>DLT Hierarchy Identifiers</th>
                <th>HTTP Status / Latency</th>
                <th>Normalized Status</th>
                <th class="text-right">Inspect Payload</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of dataService.requestLogs()">
                <td>
                  <span class="font-mono text-xs font-bold text-indigo-600">{{ log.transactionId }}</span>
                  <div class="text-[10px] text-slate-500 font-mono mt-0.5">{{ log.timestamp | date:'short' }}</div>
                </td>
                <td>
                  <div class="font-bold text-slate-900 text-xs">{{ log.userName }}</div>
                  <div class="font-mono text-[10px] text-slate-500">{{ log.userId }}</div>
                </td>
                <td>
                  <span class="badge badge-primary text-[10px] font-mono">{{ log.providerName }}</span>
                </td>
                <td>
                  <span class="font-mono text-xs font-medium text-slate-700">{{ log.recipientMobileMasked }}</span>
                </td>
                <td>
                  <div class="text-[11px] font-mono space-y-0.5">
                    <div>PE: <span class="text-indigo-600 font-medium">{{ log.peId }}</span></div>
                    <div>Sender: <span class="text-emerald-600 font-bold">{{ log.senderHeader }}</span></div>
                    <div>Tpl: <span class="text-blue-600 font-medium">{{ log.templateId }}</span></div>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-xs" [class]="log.httpStatus === 200 ? 'text-emerald-600' : 'text-rose-600'">
                      HTTP {{ log.httpStatus }}
                    </span>
                    <span class="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-medium">
                      {{ log.latencyMs }}ms
                    </span>
                  </div>
                </td>
                <td>
                  <span [class]="log.normalizedStatus === 'SUCCESS' ? 'badge badge-active' : 'badge badge-blocked'">
                    {{ log.normalizedStatus }}
                  </span>
                </td>
                <td class="text-right">
                  <button (click)="openPayloadModal(log)" class="btn btn-outline btn-sm text-[11px]">
                    Inspect URL
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payload Inspector Modal -->
      <div *ngIf="selectedLog" class="modal-backdrop" (click)="closePayloadModal()">
        <div class="modal-card p-6 border border-slate-200 max-w-2xl bg-white shadow-xl" (click)="$event.stopPropagation()">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-extrabold text-slate-900">Outbound Request URL Inspector</h3>
              <p class="text-xs text-slate-500 mt-0.5">Txn: <strong class="text-indigo-600 font-mono">{{ selectedLog.transactionId }}</strong></p>
            </div>
            <button (click)="closePayloadModal()" class="btn btn-outline btn-sm">Close</button>
          </div>

          <div class="py-4 space-y-4">
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-slate-600 font-medium">Generated DLT Telemarketer SHA256:</span>
                <span class="text-amber-600 font-bold text-[10px] break-all">{{ selectedLog.dltTelemarketerIdSha256 }}</span>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-xs font-bold text-slate-700">Full Masked Outbound GET Endpoint:</p>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-600 break-all leading-relaxed">
                {{ selectedLog.requestUrlMasked }}
              </div>
            </div>

            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2 font-medium">
              <app-icon name="shield-check" [size]="18" className="text-emerald-500"></app-icon>
              <span>Security Rule Passed: Plain text password and secrets are strictly excluded from logs.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SmsLogsComponent implements OnInit {
  dataService = inject(DataService);
  selectedLog: ProviderRequestLog | null = null;

  ngOnInit() {
    this.dataService.fetchLiveSmsLogs();
  }

  openPayloadModal(log: ProviderRequestLog) {
    this.selectedLog = log;
  }

  closePayloadModal() {
    this.selectedLog = null;
  }
}