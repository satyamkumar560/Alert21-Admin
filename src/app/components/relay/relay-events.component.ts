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
            Manage global system webhooks broadcasted to all users & inspect real-time ingested events.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            (click)="openAddModal()" 
            class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all">
            <app-icon name="plus" [size]="15"></app-icon>
            <span>+ Add System Webhook</span>
          </button>

          <button (click)="refreshEvents()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-all">
            <app-icon name="rotate-cw" [size]="14"></app-icon>
            <span>Refresh Events</span>
          </button>
        </div>
      </div>

      <!-- SYSTEM WEBHOOKS MANAGEMENT CARD -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-5 shadow-lg text-white space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <app-icon name="globe" [size]="16"></app-icon>
            </div>
            <div>
              <h3 class="text-sm font-extrabold text-white tracking-tight">Global System Webhooks</h3>
              <p class="text-[11px] text-indigo-300/80 font-medium">Webhooks configured here automatically apply to ALL user accounts across SMS Relay.</p>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider">
            {{ relayService.webhooks().length }} Active System Webhook(s)
          </span>
        </div>

        <!-- Webhooks List -->
        <div *ngIf="relayService.webhooks().length > 0" class="space-y-2.5">
          <div *ngFor="let wh of relayService.webhooks()" class="bg-white/5 border border-white/10 hover:border-indigo-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono text-xs font-extrabold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800/60 truncate max-w-md">
                  {{ wh.url }}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 uppercase">GLOBAL ACTIVE</span>
              </div>
              <p class="text-[11px] text-slate-300 font-medium">{{ wh.description || 'System Global Webhook' }}</p>
              <div class="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                <span>Secret: {{ wh.secret ? wh.secret.substring(0, 14) + '...' : 'HMAC Signed' }}</span>
                <span>•</span>
                <span>Created: {{ wh.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>

            <button 
              (click)="deleteWebhook(wh._id || wh.id)" 
              class="self-end sm:self-center px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all flex items-center gap-1.5">
              <app-icon name="trash-2" [size]="13"></app-icon>
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div *ngIf="relayService.webhooks().length === 0" class="p-6 bg-white/5 border border-dashed border-white/10 rounded-xl text-center space-y-2">
          <p class="text-xs text-indigo-200 font-semibold">No Global Webhook Configured Yet.</p>
          <p class="text-[11px] text-slate-400">Click <strong>"+ Add System Webhook"</strong> to configure a webhook endpoint for all users.</p>
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

      <!-- ADD GLOBAL WEBHOOK MODAL -->
      <div *ngIf="showAddModal" class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <app-icon name="globe" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="font-extrabold text-slate-900 text-base">Add Global Webhook</h3>
                <p class="text-xs text-slate-500">Applied automatically to all user accounts</p>
              </div>
            </div>
            <button (click)="closeAddModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="submitGlobalWebhook()" class="space-y-4">
            <div>
              <label class="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">Webhook Target URL *</label>
              <input 
                type="url" 
                required 
                [(ngModel)]="newUrl" 
                name="newUrl"
                placeholder="https://api.yourdomain.com/webhooks/relay-events" 
                class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono font-medium text-slate-800 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">Description / Label</label>
              <input 
                type="text" 
                [(ngModel)]="newDescription" 
                name="newDescription"
                placeholder="e.g. Production Core Webhook Receiver" 
                class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-800 transition-all"
              />
            </div>

            <div class="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 font-medium">
              <app-icon name="info" [size]="14" class="text-amber-600 mt-0.5 shrink-0"></app-icon>
              <span>This webhook endpoint will receive all incoming SMS event payloads for all users automatically.</span>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                type="button" 
                (click)="closeAddModal()" 
                class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all">
                Cancel
              </button>
              <button 
                type="submit" 
                [disabled]="!newUrl || isSubmitting"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2">
                <app-icon *ngIf="!isSubmitting" name="check" [size]="14"></app-icon>
                <span>{{ isSubmitting ? 'Saving...' : 'Save & Activate Webhook' }}</span>
              </button>
            </div>
          </form>
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

  showAddModal = false;
  newUrl = '';
  newDescription = '';
  isSubmitting = false;

  searchQuery = '';
  categoryFilter = 'ALL';
  statusFilter = 'ALL';

  selectedEvent: RelayEvent | null = null;

  ngOnInit() {
    this.relayService.fetchEvents();
    this.relayService.fetchGlobalWebhooks();
  }

  openAddModal() {
    this.newUrl = '';
    this.newDescription = '';
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  async submitGlobalWebhook() {
    if (!this.newUrl) return;
    this.isSubmitting = true;
    const res = await this.relayService.createGlobalWebhook(this.newUrl, this.newDescription);
    this.isSubmitting = false;
    if (res) {
      this.closeAddModal();
    }
  }

  async deleteWebhook(id: string) {
    if (confirm('Are you sure you want to delete this global system webhook?')) {
      await this.relayService.deleteGlobalWebhook(id);
    }
  }

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
    this.relayService.fetchGlobalWebhooks();
  }
}
