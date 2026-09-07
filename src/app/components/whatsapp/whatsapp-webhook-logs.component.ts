import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { WhatsappWebhookLog, WhatsappTransaction } from '../../models/alert21.models';

@Component({
  selector: 'app-whatsapp-webhook-logs',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Webhook & Inbound Events</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Raw Meta Webhook payloads, challenge verification events, and inbound customer conversation telemetry.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="refresh()" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Refresh Events</span>
          </button>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button 
          (click)="activeTab = 'webhooks'" 
          [ngClass]="activeTab === 'webhooks' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all">
          Meta Webhook Payloads ({{ webhookLogs().length }})
        </button>

        <button 
          (click)="activeTab = 'inbound'" 
          [ngClass]="activeTab === 'inbound' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all">
          Inbound Customer Replies ({{ inboundLogs().length }})
        </button>
      </div>

      <!-- TAB 1: WEBHOOK PAYLOADS -->
      <div *ngIf="activeTab === 'webhooks'" class="space-y-4">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th class="py-3 px-4">Event Type</th>
                  <th class="py-3 px-4">Meta Message ID (wamid)</th>
                  <th class="py-3 px-4">Recipient</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Received Time</th>
                  <th class="py-3 px-4 text-right">Inspect JSON</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                <tr *ngFor="let l of webhookLogs()" class="hover:bg-slate-50/60 transition-all">
                  <!-- Event Type -->
                  <td class="py-3.5 px-4 font-mono font-bold text-indigo-600 text-[11px]">
                    {{ l.eventType }}
                  </td>

                  <!-- Meta ID -->
                  <td class="py-3.5 px-4 font-mono text-[11px] text-slate-800 truncate max-w-xs" [title]="l.metaMessageId">
                    {{ l.metaMessageId || 'N/A' }}
                  </td>

                  <!-- Recipient -->
                  <td class="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                    {{ l.recipientId || 'N/A' }}
                  </td>

                  <!-- Status -->
                  <td class="py-3.5 px-4">
                    <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase font-mono">
                      {{ l.status || 'OK' }}
                    </span>
                  </td>

                  <!-- Timestamp -->
                  <td class="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                    {{ l.receivedAt | date:'medium' }}
                  </td>

                  <!-- Actions -->
                  <td class="py-3.5 px-4 text-right">
                    <button 
                      (click)="inspectPayload(l)" 
                      class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-all">
                      View Raw JSON
                    </button>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr *ngIf="webhookLogs().length === 0">
                  <td colspan="6" class="py-12 text-center text-slate-400">
                    <app-icon name="activity" [size]="32" className="mx-auto mb-2 text-slate-300"></app-icon>
                    <p class="font-bold text-sm text-slate-600">No webhook events received yet</p>
                    <p class="text-xs text-slate-400 mt-0.5">Delivery and status events sent by Meta will appear here in real-time.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: INBOUND CUSTOMER REPLIES -->
      <div *ngIf="activeTab === 'inbound'" class="space-y-4">
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th class="py-3 px-4">User Account (Tenant)</th>
                  <th class="py-3 px-4">Customer Phone</th>
                  <th class="py-3 px-4">Inbound Message / Response</th>
                  <th class="py-3 px-4">Received Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                <tr *ngFor="let inMsg of inboundLogs()" class="hover:bg-slate-50/60 transition-all">
                  <!-- User -->
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-900">{{ inMsg.userName }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ inMsg.userEmail }}</div>
                  </td>

                  <!-- Customer Phone -->
                  <td class="py-3.5 px-4 font-mono font-bold text-slate-800 text-[12px]">
                    {{ inMsg.recipient }}
                  </td>

                  <!-- Message Content -->
                  <td class="py-3.5 px-4 font-sans text-slate-700 max-w-md">
                    <div class="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-950">
                      {{ inMsg.templateName || 'Inbound reply event' }}
                    </div>
                  </td>

                  <!-- Received Time -->
                  <td class="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                    {{ inMsg.createdAt | date:'medium' }}
                  </td>
                </tr>

                <!-- Empty State -->
                <tr *ngIf="inboundLogs().length === 0">
                  <td colspan="4" class="py-12 text-center text-slate-400">
                    <app-icon name="message-square" [size]="32" className="mx-auto mb-2 text-slate-300"></app-icon>
                    <p class="font-bold text-sm text-slate-600">No inbound messages logged</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- JSON Payload Viewer Modal -->
      <div *ngIf="selectedWebhookLog" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase">Meta Webhook Payload Inspector</h3>
            <button (click)="closeInspect()" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-500">Event Type: <strong class="text-indigo-600">{{ selectedWebhookLog.eventType }}</strong></span>
              <span class="text-slate-400">{{ selectedWebhookLog.receivedAt | date:'medium' }}</span>
            </div>

            <!-- JSON Box -->
            <pre class="bg-slate-950 text-cyan-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 select-all border border-slate-800">{{ selectedWebhookLog.payload | json }}</pre>
          </div>

          <div class="flex items-center justify-end pt-3 border-t border-slate-100">
            <button (click)="closeInspect()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WhatsappWebhookLogsComponent implements OnInit {
  dataService = inject(DataService);

  activeTab: 'webhooks' | 'inbound' = 'webhooks';
  selectedWebhookLog: WhatsappWebhookLog | null = null;

  ngOnInit() {
    this.refresh();
  }

  webhookLogs() {
    return this.dataService.whatsappWebhookLogs();
  }

  inboundLogs() {
    return this.dataService.whatsappInboundLogs();
  }

  refresh() {
    this.dataService.fetchWhatsappWebhookLogs();
    this.dataService.fetchWhatsappInboundLogs();
  }

  inspectPayload(log: WhatsappWebhookLog) {
    this.selectedWebhookLog = log;
  }

  closeInspect() {
    this.selectedWebhookLog = null;
  }
}
