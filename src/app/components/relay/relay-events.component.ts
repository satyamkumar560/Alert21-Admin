import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { RelayService } from '../../services/relay.service';
import { RelayEvent } from '../../models/alert21.models';

@Component({
  selector: 'app-relay-events',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Relay Events & Webhook Deliveries</h2>
          <p class="text-xs text-slate-500 font-medium">
            Search ingested structured events, inspect parsed variables, and review customer CRM webhook delivery statuses and payloads.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="refreshEvents()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-all">
            <app-icon name="rotate-cw" [size]="14"></app-icon>
            <span>Refresh Events</span>
          </button>
        </div>
      </div>

      <!-- SEARCH & FILTER BAR -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <app-icon name="search" [size]="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search by event ID, sender, message type, user, device..." 
            class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
          />
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <select [(ngModel)]="categoryFilter" class="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Categories</option>
            <option value="OTP">OTP</option>
            <option value="LOGIN_SECURITY">LOGIN_SECURITY</option>
            <option value="TRANSACTION">TRANSACTION</option>
            <option value="BUSINESS_ALERT">BUSINESS_ALERT</option>
          </select>

          <select [(ngModel)]="statusFilter" class="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="ALL">All Delivery Statuses</option>
            <option value="DELIVERED">DELIVERED (200 OK)</option>
            <option value="RETRYING">RETRYING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      <!-- EVENTS TABLE -->
      <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Event ID & Time</th>
                <th class="py-3 px-4">Source & Sender</th>
                <th class="py-3 px-4">Message Type & Contract</th>
                <th class="py-3 px-4">Extracted Variables (Masked)</th>
                <th class="py-3 px-4">User & Device</th>
                <th class="py-3 px-4">Webhook Delivery</th>
                <th class="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let evt of filteredEvents()" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4 font-mono">
                  <span class="font-extrabold text-indigo-600 text-xs">{{ evt.id }}</span>
                  <span class="block text-[10px] text-slate-400">{{ evt.receivedAt | date:'medium' }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800 text-[10px]">{{ evt.sourceCode }}</span>
                    <span class="font-mono text-slate-600 font-bold text-xs">{{ evt.sender }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-extrabold text-slate-900 text-xs">{{ evt.messageTypeName }}</span>
                  <span class="block font-mono text-[10px] text-indigo-600">{{ evt.eventType }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex flex-wrap gap-1">
                    <ng-container *ngFor="let item of getVarEntries(evt.maskedVariables)">
                      <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono">
                        <strong class="text-indigo-700">{{ item.key }}:</strong> {{ item.value }}
                      </span>
                    </ng-container>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-bold text-slate-800">{{ evt.userName }}</span>
                  <span class="block font-mono text-[10px] text-slate-400">{{ evt.deviceName }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="evt.webhookDeliveryStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : (evt.webhookDeliveryStatus === 'RETRYING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')">
                    {{ evt.webhookDeliveryStatus }}
                  </span>
                  <span *ngIf="evt.webhookResponseCode" class="ml-1 font-mono text-[10px] font-bold text-slate-500">
                    HTTP {{ evt.webhookResponseCode }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button (click)="inspectEvent(evt)" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-[11px] transition-all flex items-center gap-1 ml-auto">
                    <app-icon name="eye" [size]="12"></app-icon>
                    <span>Inspect</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- EVENT INSPECTOR MODAL -->
      <div *ngIf="selectedEvent" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b pb-3">
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-slate-900 text-base">Relay Event Inspector</h3>
              <span class="font-mono text-xs text-indigo-600 font-bold">[{{ selectedEvent.id }}]</span>
            </div>
            <button (click)="selectedEvent = null" class="text-slate-400 hover:text-slate-600"><app-icon name="x" [size]="18"></app-icon></button>
          </div>

          <!-- Metadata Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl text-xs">
            <div>
              <span class="text-slate-400 uppercase font-bold text-[10px]">Client Event ID</span>
              <p class="font-mono font-bold text-slate-800 truncate">{{ selectedEvent.clientEventId }}</p>
            </div>
            <div>
              <span class="text-slate-400 uppercase font-bold text-[10px]">Source & Sender</span>
              <p class="font-bold text-slate-800">{{ selectedEvent.sourceName }} ({{ selectedEvent.sender }})</p>
            </div>
            <div>
              <span class="text-slate-400 uppercase font-bold text-[10px]">Template Version</span>
              <p class="font-mono font-bold text-indigo-600">v{{ selectedEvent.templateVersion }} ({{ selectedEvent.templateId }})</p>
            </div>
            <div>
              <span class="text-slate-400 uppercase font-bold text-[10px]">Device Name</span>
              <p class="font-bold text-slate-800">{{ selectedEvent.deviceName }}</p>
            </div>
            <div>
              <span class="text-slate-400 uppercase font-bold text-[10px]">Customer Account</span>
              <p class="font-bold text-slate-800">{{ selectedEvent.userName }}</p>
            </div>
            <div>
              <span class="text-slate-400 uppercase font-bold text-[10px]">Received Timestamp</span>
              <p class="font-mono text-slate-600">{{ selectedEvent.receivedAt | date:'medium' }}</p>
            </div>
          </div>

          <!-- Structured Payload JSON -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Standardized Customer Webhook JSON Payload</span>
              <span class="text-[10px] font-mono text-emerald-600">HMAC Signed (X-Alert21-Signature)</span>
            </div>
            <pre class="p-3.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto select-all leading-relaxed">{{ getWebhookPayloadJson(selectedEvent) }}</pre>
          </div>

          <!-- Webhook Delivery Attempts -->
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span class="font-bold text-slate-800">Webhook Delivery Status:</span>
              <span class="ml-2 font-mono font-bold uppercase" [ngClass]="selectedEvent.webhookDeliveryStatus === 'DELIVERED' ? 'text-emerald-600' : 'text-amber-600'">
                {{ selectedEvent.webhookDeliveryStatus }} (HTTP {{ selectedEvent.webhookResponseCode || 200 }})
              </span>
              <span class="block text-[10px] text-slate-400 font-mono mt-0.5">Attempt: 1/6 • Delivery ID: {{ selectedEvent.webhookDeliveryId }}</span>
            </div>

            <button (click)="retryWebhook(selectedEvent)" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all">
              <app-icon name="send" [size]="12"></app-icon>
              <span>Re-dispatch Webhook</span>
            </button>
          </div>

          <div class="flex justify-end pt-3 border-t">
            <button (click)="selectedEvent = null" class="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RelayEventsComponent implements OnInit {
  relayService = inject(RelayService);

  ngOnInit() {
    this.relayService.fetchEvents();
  }

  searchQuery = '';
  categoryFilter = 'ALL';
  statusFilter = 'ALL';

  selectedEvent: RelayEvent | null = null;

  filteredEvents(): RelayEvent[] {
    return this.relayService.events().filter(e => {
      if (this.categoryFilter !== 'ALL' && e.category !== this.categoryFilter) return false;
      if (this.statusFilter !== 'ALL' && e.webhookDeliveryStatus !== this.statusFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return e.id.toLowerCase().includes(q) || e.sender.toLowerCase().includes(q) || e.messageTypeName.toLowerCase().includes(q) || e.userName.toLowerCase().includes(q) || e.deviceName.toLowerCase().includes(q);
      }
      return true;
    });
  }

  getVarEntries(vars: Record<string, any>): { key: string; value: any }[] {
    if (!vars) return [];
    return Object.keys(vars).map(k => ({ key: k, value: vars[k] }));
  }

  inspectEvent(evt: RelayEvent) {
    this.selectedEvent = evt;
  }

  getWebhookPayloadJson(evt: RelayEvent): string {
    const payload = {
      id: evt.id,
      event: evt.eventType,
      category: evt.category,
      source: {
        code: evt.sourceCode,
        name: evt.sourceName,
        sender: evt.sender
      },
      message_type: {
        id: evt.messageTypeId,
        name: evt.messageTypeName
      },
      variables: evt.variables,
      device: {
        id: evt.deviceId,
        name: evt.deviceName
      },
      received_at: evt.receivedAt
    };
    return JSON.stringify(payload, null, 2);
  }

  retryWebhook(evt: RelayEvent) {
    alert(`Webhook re-dispatch queued for ${evt.id}.`);
  }

  refreshEvents() {
    this.relayService.fetchEvents();
  }
}
