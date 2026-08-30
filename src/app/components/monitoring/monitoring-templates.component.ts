import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { MonitoringTemplate, MonitoringChannel } from '../../models/alert21.models';

@Component({
  selector: 'app-monitoring-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Alert Channel Templates Master</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Configure DLT-compliant SMS templates (exactly 2 variables), Meta WhatsApp utility templates, and email notifications.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openAddModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5">
            <app-icon name="plus" [size]="14"></app-icon>
            <span>Add Template</span>
          </button>
        </div>
      </div>

      <!-- Channel Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button 
          *ngFor="let ch of channelTabs"
          (click)="selectedChannel = ch.key"
          [ngClass]="selectedChannel === ch.key ? 'bg-indigo-600 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
          class="px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2">
          <app-icon [name]="ch.icon" [size]="14"></app-icon>
          <span>{{ ch.label }}</span>
        </button>
      </div>

      <!-- Section Note for SMS DLT Constraint -->
      <div *ngIf="selectedChannel === 'SMS'" class="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
          <app-icon name="shield-check" [size]="16"></app-icon>
        </div>
        <div class="text-xs text-indigo-900 space-y-1">
          <p class="font-extrabold">DLT Compliance Rule: EXACTLY 2 Variables Mandated (Section 8)</p>
          <p class="text-indigo-700">
            All Website Monitoring SMS templates must map to approved DLT Template IDs with exactly two variables (<code>&#123;#var#&#125;</code>) for Domain and Timestamp/Duration.
          </p>
        </div>
      </div>

      <!-- Templates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div *ngFor="let t of filteredTemplates()" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="flex items-start justify-between">
              <div>
                <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{{ t.templateCode }}</span>
                <h3 class="text-sm font-black text-slate-900">{{ t.name }}</h3>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    [ngClass]="t.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                {{ t.status }}
              </span>
            </div>

            <!-- Subject (if Email) -->
            <div *ngIf="t.subject" class="text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
              Subject: {{ t.subject }}
            </div>

            <!-- Body Content -->
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs text-slate-700 whitespace-pre-line leading-relaxed">
              {{ t.body }}
            </div>

            <!-- Metadata details -->
            <div class="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 pt-1">
              <div *ngIf="t.dltTemplateId">
                <span class="font-bold text-slate-700">DLT ID:</span> {{ t.dltTemplateId }}
              </div>
              <div *ngIf="t.metaTemplateName">
                <span class="font-bold text-slate-700">Meta Name:</span> {{ t.metaTemplateName }}
              </div>
              <div>
                <span class="font-bold text-slate-700">Event:</span> {{ t.eventType }}
              </div>
              <div>
                <span class="font-bold text-slate-700">Variables:</span> {{ t.variablesCount }}
              </div>
            </div>

            <div *ngIf="t.variableMapping" class="text-[10px] text-slate-500 font-mono bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
              <strong>Param Mapping:</strong> {{ t.variableMapping }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="openEditModal(t)" class="px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
              Edit Template
            </button>
          </div>
        </div>
      </div>

      <!-- Add / Edit Template Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 font-sans">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-black text-slate-900">{{ isEditing ? 'Edit Template' : 'Add New Alert Template' }}</h3>
            <button (click)="showModal = false" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 uppercase mb-1">Channel</label>
                <select [(ngModel)]="currentTpl.channel" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
                  <option value="SMS">SMS (DLT Exact 2 Vars)</option>
                  <option value="WHATSAPP">WhatsApp (Meta Utility)</option>
                  <option value="EMAIL">Email</option>
                  <option value="IN_APP">In-App Notification</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 uppercase mb-1">Event Type</label>
                <select [(ngModel)]="currentTpl.eventType" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
                  <option value="DOWN">DOWN Outage</option>
                  <option value="RECOVERY">RECOVERY Normal</option>
                  <option value="SLOW">SLOW Response</option>
                  <option value="SSL_EXPIRY">SSL Expiry Warning</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Template Name</label>
              <input type="text" [(ngModel)]="currentTpl.name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
            </div>

            <div *ngIf="currentTpl.channel === 'SMS'">
              <label class="block font-bold text-slate-700 uppercase mb-1">DLT Template ID</label>
              <input type="text" [(ngModel)]="currentTpl.dltTemplateId" placeholder="DLT-1787..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>

            <div *ngIf="currentTpl.channel === 'WHATSAPP'">
              <label class="block font-bold text-slate-700 uppercase mb-1">Meta Template Name (Lowercase)</label>
              <input type="text" [(ngModel)]="currentTpl.metaTemplateName" placeholder="website_down_alert" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Template Body Content</label>
              <textarea [(ngModel)]="currentTpl.body" rows="4" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono"></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="showModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="saveTemplate()" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MonitoringTemplatesComponent implements OnInit {
  dataService = inject(DataService);
  selectedChannel: MonitoringChannel = 'SMS';
  showModal = false;
  isEditing = false;
  currentTpl: Partial<MonitoringTemplate> = {};

  async ngOnInit() {
    await this.dataService.fetchMonitoringTemplates();
  }

  channelTabs: { label: string; key: MonitoringChannel; icon: string }[] = [
    { label: 'SMS (DLT 2-Vars)', key: 'SMS', icon: 'smartphone' },
    { label: 'WhatsApp (Meta Utility)', key: 'WHATSAPP', icon: 'message-square' },
    { label: 'Email Notifications', key: 'EMAIL', icon: 'mail' },
    { label: 'In-App Alerts', key: 'IN_APP', icon: 'bell' }
  ];

  filteredTemplates() {
    return this.dataService.monitoringTemplates().filter(t => t.channel === this.selectedChannel);
  }

  openAddModal() {
    this.isEditing = false;
    this.currentTpl = {
      channel: this.selectedChannel,
      eventType: 'DOWN',
      name: '',
      body: '',
      status: 'APPROVED',
      variablesCount: 2
    };
    this.showModal = true;
  }

  openEditModal(t: MonitoringTemplate) {
    this.isEditing = true;
    this.currentTpl = { ...t };
    this.showModal = true;
  }

  async saveTemplate() {
    await this.dataService.saveMonitoringTemplate(this.currentTpl);
    this.showModal = false;
  }
}
