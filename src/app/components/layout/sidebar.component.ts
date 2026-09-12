import { Component, Input, Output, EventEmitter, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';
import { DataService } from '../../services/data.service';
import { RelayService } from '../../services/relay.service';

export type NavTab =
  | 'dashboard'
  | 'users'
  | 'sms-pricing'
  | 'bank-transfers'
  | 'billing-dashboard'
  | 'monitoring-dashboard'
  | 'monitoring-monitors'
  | 'monitoring-incidents'
  | 'monitoring-plans'
  | 'monitoring-subscriptions'
  | 'monitoring-sources'
  | 'monitoring-templates'
  | 'email-dashboard'
  | 'email-providers'
  | 'email-domains'
  | 'email-senders'
  | 'email-templates'
  | 'email-logs'
  | 'email-pricing'
  | 'email-reputation'
  | 'whatsapp-dashboard'
  | 'whatsapp-config'
  | 'whatsapp-accounts'
  | 'whatsapp-numbers'
  | 'whatsapp-templates'
  | 'whatsapp-campaigns'
  | 'whatsapp-logs'
  | 'whatsapp-webhook-logs'
  | 'whatsapp-pricing'
  | 'relay-dashboard'
  | 'relay-builder'
  | 'relay-templates'
  | 'relay-sources'
  | 'relay-variables'
  | 'relay-devices'
  | 'relay-outbound'
  | 'relay-events'
  | 'relay-packages'
  | 'relay-diagnostics'
  | 'dlt-pe'
  | 'dlt-sender'
  | 'dlt-template'
  | 'providers'
  | 'provider-routing'
  | 'dlt-hash-tool'
  | 'sms-logs'
  | 'audit-logs'
  | 'settings';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <aside
      class="w-[268px] bg-[#0b1120] border-r border-slate-800/80 h-screen flex flex-col fixed left-0 top-0 z-40 text-slate-300 transition-transform duration-300 ease-in-out select-none"
      [ngClass]="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'">

      <!-- Top Branding Logo -->
      <div class="h-[76px] p-2 flex items-center justify-center border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div class="w-full h-full bg-white px-3 py-1 rounded-xl flex items-center justify-center shadow-sm">
          <img src="/logo.png" alt="Alert21" class="h-10 max-h-[48px] w-auto max-w-full object-contain">
        </div>
      </div>

      <!-- Navigation Links (Scrollable) -->
      <div class="flex-1 overflow-y-auto px-3 py-4 space-y-3">

        <!-- 1. SYSTEM CORE DROPDOWN -->
        <div>
          <button
            type="button"
            (click)="toggleSection('core')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-300 transition-all cursor-pointer shadow-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-md shadow-indigo-400/80"></span>
              <span class="text-xs font-black uppercase tracking-wider text-indigo-200">System Core</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">MAIN</span>
              <svg
                class="w-4 h-4 text-indigo-300 transition-transform duration-200"
                [ngClass]="isCoreOpen() ? 'rotate-180' : 'rotate-0'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div *ngIf="isCoreOpen()" class="mt-1.5 ml-2.5 pl-2.5 border-l-2 border-indigo-500/30 space-y-1 transition-all">
            <!-- Dashboard -->
            <button
              type="button"
              (click)="onSelectTab('dashboard')"
              [ngClass]="getNavClass('dashboard')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="layout-dashboard" [size]="15"></app-icon>
              <span>Dashboard</span>
            </button>

            <!-- User Accounts -->
            <button
              type="button"
              (click)="onSelectTab('users')"
              [ngClass]="getNavClass('users')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="users" [size]="15"></app-icon>
              <span>User Accounts</span>
              <span class="ml-auto bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ dataService.users().length }}
              </span>
            </button>
          </div>
        </div>

        <!-- 2. BILLING & SMS DROPDOWN -->
        <div>
          <button
            type="button"
            (click)="toggleSection('billing')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 transition-all cursor-pointer shadow-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/80 animate-pulse"></span>
              <span class="text-xs font-black uppercase tracking-wider text-amber-200">Billing & SMS</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span
                *ngIf="pendingTransfersCount() > 0"
                class="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm">
                {{ pendingTransfersCount() }}
              </span>
              <span class="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">PAYMENTS</span>
              <svg
                class="w-4 h-4 text-amber-300 transition-transform duration-200"
                [ngClass]="isBillingOpen() ? 'rotate-180' : 'rotate-0'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div *ngIf="isBillingOpen()" class="mt-1.5 ml-2.5 pl-2.5 border-l-2 border-amber-500/30 space-y-1 transition-all">
            <!-- SMS Pricing -->
            <button
              type="button"
              (click)="onSelectTab('sms-pricing')"
              [ngClass]="getNavClass('sms-pricing')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="tag" [size]="15"></app-icon>
              <span>SMS Pricing Slabs</span>
            </button>

            <!-- Bank Transfers -->
            <button
              type="button"
              (click)="onSelectTab('bank-transfers')"
              [ngClass]="getNavClass('bank-transfers')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="bank" [size]="15"></app-icon>
              <span>Bank Transfers</span>
              <span
                *ngIf="pendingTransfersCount() > 0"
                class="ml-auto bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                {{ pendingTransfersCount() }}
              </span>
            </button>

            <!-- Billing Dashboard -->
            <button
              type="button"
              (click)="onSelectTab('billing-dashboard')"
              [ngClass]="getNavClass('billing-dashboard')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="credit-card" [size]="15"></app-icon>
              <span>Billing Dashboard</span>
            </button>
          </div>
        </div>

        <!-- 3. WEBSITE MONITORING DROPDOWN -->
        <div>
          <button
            type="button"
            (click)="toggleSection('monitoring')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 transition-all cursor-pointer shadow-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/80"></span>
              <span class="text-xs font-black uppercase tracking-wider text-emerald-200">Website Monitoring</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span
                *ngIf="dataService.monitorIncidents().length > 0"
                class="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {{ dataService.monitorIncidents().length }}
              </span>
              <span class="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">UPTIME</span>
              <svg
                class="w-4 h-4 text-emerald-300 transition-transform duration-200"
                [ngClass]="isMonitoringOpen() ? 'rotate-180' : 'rotate-0'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div *ngIf="isMonitoringOpen()" class="mt-1.5 ml-2.5 pl-2.5 border-l-2 border-emerald-500/30 space-y-1 transition-all">
            <!-- Monitoring Dashboard -->
            <button
              type="button"
              (click)="onSelectTab('monitoring-dashboard')"
              [ngClass]="getNavClass('monitoring-dashboard')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="activity" [size]="15"></app-icon>
              <span>Monitoring Dashboard</span>
            </button>

            <!-- All Monitors -->
            <button
              type="button"
              (click)="onSelectTab('monitoring-monitors')"
              [ngClass]="getNavClass('monitoring-monitors')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="globe" [size]="15"></app-icon>
              <span>All Monitors</span>
              <span class="ml-auto bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ dataService.websiteMonitors().length }}
              </span>
            </button>

            <!-- Incidents & Alerts -->
            <button
              type="button"
              (click)="onSelectTab('monitoring-incidents')"
              [ngClass]="getNavClass('monitoring-incidents')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="alert-triangle" [size]="15"></app-icon>
              <span>Incidents & Alerts</span>
              <span
                *ngIf="dataService.monitorIncidents().length > 0"
                class="ml-auto bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ dataService.monitorIncidents().length }}
              </span>
            </button>

            <!-- Plans & Pricing -->
            <button
              type="button"
              (click)="onSelectTab('monitoring-plans')"
              [ngClass]="getNavClass('monitoring-plans')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="tag" [size]="15"></app-icon>
              <span>Plans & Pricing</span>
            </button>

            <!-- Subscriptions -->
            <button
              type="button"
              (click)="onSelectTab('monitoring-subscriptions')"
              [ngClass]="getNavClass('monitoring-subscriptions')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="users" [size]="15"></app-icon>
              <span>Subscriptions</span>
            </button>

            <!-- Probe Sources -->
            <button
              type="button"
              (click)="onSelectTab('monitoring-sources')"
              [ngClass]="getNavClass('monitoring-sources')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="layers" [size]="15"></app-icon>
              <span>Probe Sources</span>
            </button>

            <!-- Alert Templates -->
            <button
              type="button"
              (click)="onSelectTab('monitoring-templates')"
              [ngClass]="getNavClass('monitoring-templates')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="message-square" [size]="15"></app-icon>
              <span>Alert Templates</span>
            </button>
          </div>
        </div>

        <!-- 4. EMAIL ALERTS DROPDOWN -->
        <div>
          <button
            type="button"
            (click)="toggleSection('email')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-300 transition-all cursor-pointer shadow-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-md shadow-sky-400/80"></span>
              <span class="text-xs font-black uppercase tracking-wider text-sky-200">Email Alerts</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="bg-sky-500/20 text-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-sky-500/30">SES</span>
              <svg
                class="w-4 h-4 text-sky-300 transition-transform duration-200"
                [ngClass]="isEmailOpen() ? 'rotate-180' : 'rotate-0'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div *ngIf="isEmailOpen()" class="mt-1.5 ml-2.5 pl-2.5 border-l-2 border-sky-500/30 space-y-1 transition-all">
            <!-- Email Dashboard -->
            <button
              type="button"
              (click)="onSelectTab('email-dashboard')"
              [ngClass]="getNavClass('email-dashboard')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="activity" [size]="15"></app-icon>
              <span>Email Dashboard</span>
            </button>

            <!-- Email Providers -->
            <button
              type="button"
              (click)="onSelectTab('email-providers')"
              [ngClass]="getNavClass('email-providers')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="server" [size]="15"></app-icon>
              <span>Email Providers</span>
            </button>

            <!-- Sending Domains -->
            <button
              type="button"
              (click)="onSelectTab('email-domains')"
              [ngClass]="getNavClass('email-domains')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="globe" [size]="15"></app-icon>
              <span>Sending Domains</span>
              <span class="ml-auto bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ dataService.emailDomains().length }}
              </span>
            </button>

            <!-- Sender From Emails -->
            <button
              type="button"
              (click)="onSelectTab('email-senders')"
              [ngClass]="getNavClass('email-senders')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="mail" [size]="15"></app-icon>
              <span>Sender From Emails</span>
            </button>

            <!-- Email Templates -->
            <button
              type="button"
              (click)="onSelectTab('email-templates')"
              [ngClass]="getNavClass('email-templates')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="copy" [size]="15"></app-icon>
              <span>Email Templates</span>
              <span class="ml-auto bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ dataService.emailTemplates().length }}
              </span>
            </button>

            <!-- Email Logs -->
            <button
              type="button"
              (click)="onSelectTab('email-logs')"
              [ngClass]="getNavClass('email-logs')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="file-text" [size]="15"></app-icon>
              <span>Email Logs & Delivery</span>
            </button>

            <!-- Email Pricing Slabs -->
            <button
              type="button"
              (click)="onSelectTab('email-pricing')"
              [ngClass]="getNavClass('email-pricing')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="tag" [size]="15"></app-icon>
              <span>Email Pricing Slabs</span>
            </button>

            <!-- Bounce & Reputation -->
            <button
              type="button"
              (click)="onSelectTab('email-reputation')"
              [ngClass]="getNavClass('email-reputation')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="shield-check" [size]="15"></app-icon>
              <span>Bounce & Reputation</span>
            </button>
          </div>
        </div>

        <!-- 5. WHATSAPP BUSINESS DROPDOWN -->
        <div>
          <button
            type="button"
            (click)="toggleSection('whatsapp')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 text-teal-300 transition-all cursor-pointer shadow-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-md shadow-teal-400/80"></span>
              <span class="text-xs font-black uppercase tracking-wider text-teal-200">WhatsApp Business</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="bg-teal-500/20 text-teal-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-teal-500/30">META SAAS</span>
              <svg
                class="w-4 h-4 text-teal-300 transition-transform duration-200"
                [ngClass]="isWhatsappOpen() ? 'rotate-180' : 'rotate-0'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div *ngIf="isWhatsappOpen()" class="mt-1.5 ml-2.5 pl-2.5 border-l-2 border-teal-500/30 space-y-1 transition-all">
            <!-- WhatsApp Dashboard -->
            <button
              type="button"
              (click)="onSelectTab('whatsapp-dashboard')"
              [ngClass]="getNavClass('whatsapp-dashboard')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="activity" [size]="15"></app-icon>
              <span>WhatsApp Dashboard</span>
            </button>

            <!-- Meta App Configuration -->
            <button
              type="button"
              (click)="onSelectTab('whatsapp-config')"
              [ngClass]="getNavClass('whatsapp-config')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="server" [size]="15"></app-icon>
              <span>Meta Configuration</span>
            </button>

            <!-- Connected Accounts (WABAs) -->
            <button
              type="button"
              (click)="onSelectTab('whatsapp-accounts')"
              [ngClass]="getNavClass('whatsapp-accounts')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="users" [size]="15"></app-icon>
              <span>Connected Accounts</span>
              <span *ngIf="dataService.whatsappAccounts().length > 0" class="ml-auto bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ dataService.whatsappAccounts().length }}
              </span>
            </button>

            <!-- WhatsApp Phone Numbers -->
            <button
              type="button"
              (click)="onSelectTab('whatsapp-numbers')"
              [ngClass]="getNavClass('whatsapp-numbers')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="smartphone" [size]="15"></app-icon>
              <span>WhatsApp Numbers</span>
              <span *ngIf="dataService.whatsappPhoneNumbers().length > 0" class="ml-auto bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ dataService.whatsappPhoneNumbers().length }}
              </span>
            </button>

            <!-- Message Templates -->
            <button
              type="button"
              (click)="onSelectTab('whatsapp-templates')"
              [ngClass]="getNavClass('whatsapp-templates')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="file-text" [size]="15"></app-icon>
              <span>Message Templates</span>
              <span *ngIf="dataService.whatsappTemplates().length > 0" class="ml-auto bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ dataService.whatsappTemplates().length }}
              </span>
            </button>

            <!-- Broadcast Campaigns -->
            <button
              type="button"
              (click)="onSelectTab('whatsapp-campaigns')"
              [ngClass]="getNavClass('whatsapp-campaigns')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="send" [size]="15"></app-icon>
              <span>Broadcast Campaigns</span>
            </button>

            <!-- Message Logs & Delivery -->
            <button
              type="button"
              (click)="onSelectTab('whatsapp-logs')"
              [ngClass]="getNavClass('whatsapp-logs')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="file-text" [size]="15"></app-icon>
              <span>Message Logs & Delivery</span>
            </button>

            <!-- Webhook Logs -->
            <button
              type="button"
              (click)="onSelectTab('whatsapp-webhook-logs')"
              [ngClass]="getNavClass('whatsapp-webhook-logs')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="activity" [size]="15"></app-icon>
              <span>Webhook Logs</span>
            </button>

            <!-- WhatsApp Pricing Slabs -->
            <button
              type="button"
              (click)="onSelectTab('whatsapp-pricing')"
              [ngClass]="getNavClass('whatsapp-pricing')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="tag" [size]="15"></app-icon>
              <span>WhatsApp Pricing</span>
            </button>
          </div>
        </div>

        <!-- 6. SMS RELAY PLATFORM DROPDOWN -->
        <div>
          <button
            type="button"
            (click)="toggleSection('relay')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-300 transition-all cursor-pointer shadow-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-md shadow-purple-400/80 animate-pulse"></span>
              <span class="text-xs font-black uppercase tracking-wider text-purple-200">SMS Relay Platform</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="bg-purple-500/20 text-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-500/30">V2.0 PRO</span>
              <svg
                class="w-4 h-4 text-purple-300 transition-transform duration-200"
                [ngClass]="isRelayOpen() ? 'rotate-180' : 'rotate-0'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div *ngIf="isRelayOpen()" class="mt-1.5 ml-2.5 pl-2.5 border-l-2 border-purple-500/30 space-y-1 transition-all">
            <!-- Relay Dashboard -->
            <button
              type="button"
              (click)="onSelectTab('relay-dashboard')"
              [ngClass]="getNavClass('relay-dashboard')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="activity" [size]="15"></app-icon>
              <span>Relay Dashboard</span>
            </button>

            <!-- Template Builder -->
            <button
              type="button"
              (click)="onSelectTab('relay-builder')"
              [ngClass]="getNavClass('relay-builder')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="code" [size]="15"></app-icon>
              <span>Template Builder</span>
              <span class="ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow font-bold">Core</span>
            </button>

            <!-- Template Library -->
            <button
              type="button"
              (click)="onSelectTab('relay-templates')"
              [ngClass]="getNavClass('relay-templates')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="file-text" [size]="15"></app-icon>
              <span>Template Library</span>
              <span *ngIf="relayService.messageTypes().length > 0" class="ml-auto bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ relayService.messageTypes().length }}
              </span>
            </button>

            <!-- Sources & Senders -->
            <button
              type="button"
              (click)="onSelectTab('relay-sources')"
              [ngClass]="getNavClass('relay-sources')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="layers" [size]="15"></app-icon>
              <span>Sources & Senders</span>
            </button>

            <!-- Variable Master -->
            <button
              type="button"
              (click)="onSelectTab('relay-variables')"
              [ngClass]="getNavClass('relay-variables')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="sliders" [size]="15"></app-icon>
              <span>Variables & Taxonomy</span>
            </button>

            <!-- Android Devices -->
            <button
              type="button"
              (click)="onSelectTab('relay-devices')"
              [ngClass]="getNavClass('relay-devices')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="smartphone" [size]="15"></app-icon>
              <span>Android Devices</span>
              <span *ngIf="relayService.devices().length > 0" class="ml-auto bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ relayService.devices().length }}
              </span>
            </button>

            <!-- Outbound SMS Gateway Controls & Logs [NEW] -->
            <button
              type="button"
              (click)="onSelectTab('relay-outbound')"
              [ngClass]="getNavClass('relay-outbound')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="send" [size]="15"></app-icon>
              <span>Outbound SMS & Logs</span>
              <span class="ml-auto bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">GATEWAY</span>
            </button>

            <!-- Relay Events & Webhooks -->
            <button
              type="button"
              (click)="onSelectTab('relay-events')"
              [ngClass]="getNavClass('relay-events')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="database" [size]="15"></app-icon>
              <span>Relay Ingest & Webhooks</span>
            </button>

            <!-- Packages & Subscriptions -->
            <button
              type="button"
              (click)="onSelectTab('relay-packages')"
              [ngClass]="getNavClass('relay-packages')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="tag" [size]="15"></app-icon>
              <span>Packages & Plans</span>
            </button>

            <!-- Diagnostics -->
            <button
              type="button"
              (click)="onSelectTab('relay-diagnostics')"
              [ngClass]="getNavClass('relay-diagnostics')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="shield" [size]="15"></app-icon>
              <span>Unmatched Diagnostics</span>
              <span *ngIf="relayService.diagnostics().length > 0" class="ml-auto bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {{ relayService.diagnostics().length }}
              </span>
            </button>
          </div>
        </div>

        <!-- 7. DLT COMPLIANCE DROPDOWN -->
        <div>
          <button
            type="button"
            (click)="toggleSection('dlt')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 transition-all cursor-pointer shadow-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-md shadow-rose-400/80"></span>
              <span class="text-xs font-black uppercase tracking-wider text-rose-200">DLT Compliance</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="bg-rose-500/20 text-rose-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30">TRAI</span>
              <svg
                class="w-4 h-4 text-rose-300 transition-transform duration-200"
                [ngClass]="isDltOpen() ? 'rotate-180' : 'rotate-0'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div *ngIf="isDltOpen()" class="mt-1.5 ml-2.5 pl-2.5 border-l-2 border-rose-500/30 space-y-1 transition-all">
            <!-- Principal Entities -->
            <button
              type="button"
              (click)="onSelectTab('dlt-pe')"
              [ngClass]="getNavClass('dlt-pe')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="shield-check" [size]="15"></app-icon>
              <span>Principal Entities</span>
            </button>

            <!-- Sender IDs -->
            <button
              type="button"
              (click)="onSelectTab('dlt-sender')"
              [ngClass]="getNavClass('dlt-sender')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="file-text" [size]="15"></app-icon>
              <span>Sender IDs</span>
            </button>

            <!-- DLT Templates -->
            <button
              type="button"
              (click)="onSelectTab('dlt-template')"
              [ngClass]="getNavClass('dlt-template')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="copy" [size]="15"></app-icon>
              <span>DLT Templates</span>
            </button>

            <!-- DLT Hash Tool -->
            <button
              type="button"
              (click)="onSelectTab('dlt-hash-tool')"
              [ngClass]="getNavClass('dlt-hash-tool')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative">
              <app-icon name="hash" [size]="15"></app-icon>
              <span>DLT Hash Tool</span>
              <span class="ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                SHA256
              </span>
            </button>
          </div>
        </div>

        <!-- 8. GATEWAYS & LOGS DROPDOWN -->
        <div>
          <button
            type="button"
            (click)="toggleSection('gateways')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 transition-all cursor-pointer shadow-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/80"></span>
              <span class="text-xs font-black uppercase tracking-wider text-cyan-200">Gateways & Logs</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="bg-cyan-500/20 text-cyan-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">ROUTING</span>
              <svg
                class="w-4 h-4 text-cyan-300 transition-transform duration-200"
                [ngClass]="isGatewaysOpen() ? 'rotate-180' : 'rotate-0'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div *ngIf="isGatewaysOpen()" class="mt-1.5 ml-2.5 pl-2.5 border-l-2 border-cyan-500/30 space-y-1 transition-all">
            <!-- SMS Providers -->
            <button
              type="button"
              (click)="onSelectTab('providers')"
              [ngClass]="getNavClass('providers')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="server" [size]="15"></app-icon>
              <span>SMS Providers (MSG24)</span>
            </button>

            <!-- Provider Routing -->
            <button
              type="button"
              (click)="onSelectTab('provider-routing')"
              [ngClass]="getNavClass('provider-routing')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="route" [size]="15"></app-icon>
              <span>Provider Routing</span>
            </button>

            <!-- SMS Logs / Reports -->
            <button
              type="button"
              (click)="onSelectTab('sms-logs')"
              [ngClass]="getNavClass('sms-logs')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="file-text" [size]="15"></app-icon>
              <span>SMS Reports & Logs</span>
            </button>

            <!-- Admin Audit Logs -->
            <button
              type="button"
              (click)="onSelectTab('audit-logs')"
              [ngClass]="getNavClass('audit-logs')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="history" [size]="15"></app-icon>
              <span>Admin Audit Logs</span>
            </button>

            <!-- Settings -->
            <button
              type="button"
              (click)="onSelectTab('settings')"
              [ngClass]="getNavClass('settings')"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
              <app-icon name="settings" [size]="15"></app-icon>
              <span>System Settings</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Footer / System Badge -->
      <div class="p-3 border-t border-slate-800 bg-slate-950/80 shrink-0">
        <!-- Active Gateway -->
        <div
          *ngIf="activeGateway()"
          class="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
          <div
            class="w-2.5 h-2.5 rounded-full animate-pulse"
            [ngClass]="activeGateway().status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'">
          </div>
          <div class="overflow-hidden flex-1">
            <p class="text-xs font-semibold text-slate-200 truncate">
              {{ activeGateway().name || 'Unknown' }} Gateway
            </p>
            <p class="text-[10px] text-slate-400 font-mono truncate" [title]="activeGateway().baseUrl">
              {{ activeGateway().baseUrl }}
            </p>
          </div>
        </div>

        <!-- No Active Gateway -->
        <div
          *ngIf="!activeGateway()"
          class="bg-slate-900 border border-rose-900/50 rounded-xl p-2.5 flex items-center gap-2.5">
          <div class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
          <div class="overflow-hidden flex-1">
            <p class="text-xs font-semibold text-rose-400 truncate">No Gateway Active</p>
            <p class="text-[10px] text-rose-500 font-mono truncate">System Offline</p>
          </div>
        </div>
      </div>

    </aside>
  `
})
export class SidebarComponent {
  dataService = inject(DataService);
  relayService = inject(RelayService);

  @Input() activeTab: NavTab = 'dashboard';
  @Input() isSidebarOpen = true;
  @Output() tabChange = new EventEmitter<NavTab>();

  // Accordion open/collapse states for all modules (closed by default upon login)
  isCoreOpen = signal<boolean>(false);
  isBillingOpen = signal<boolean>(false);
  isMonitoringOpen = signal<boolean>(false);
  isEmailOpen = signal<boolean>(false);
  isWhatsappOpen = signal<boolean>(false);
  isRelayOpen = signal<boolean>(false);
  isDltOpen = signal<boolean>(false);
  isGatewaysOpen = signal<boolean>(false);

  toggleSection(section: 'core' | 'billing' | 'monitoring' | 'email' | 'whatsapp' | 'relay' | 'dlt' | 'gateways') {
    switch (section) {
      case 'core':
        this.isCoreOpen.update(v => !v);
        break;
      case 'billing':
        this.isBillingOpen.update(v => !v);
        break;
      case 'monitoring':
        this.isMonitoringOpen.update(v => !v);
        break;
      case 'email':
        this.isEmailOpen.update(v => !v);
        break;
      case 'whatsapp':
        this.isWhatsappOpen.update(v => !v);
        break;
      case 'relay':
        this.isRelayOpen.update(v => !v);
        break;
      case 'dlt':
        this.isDltOpen.update(v => !v);
        break;
      case 'gateways':
        this.isGatewaysOpen.update(v => !v);
        break;
    }
  }

  activeGateway = computed(() => {
    const providers = this.dataService.smsProviders();
    return providers.find(p => p.isGlobalDefault) || providers[0] || null;
  });

  pendingTransfersCount(): number {
    return this.dataService.bankTransfers().filter(t => t.purchaseStatus === 'PENDING').length;
  }

  onSelectTab(tab: NavTab) {
    this.tabChange.emit(tab);
  }

  getNavClass(tab: NavTab): string {
    if (this.activeTab === tab) {
      return 'bg-[#5d55fa] text-white font-extrabold shadow-md shadow-indigo-600/30';
    }
    return 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60';
  }
}