import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { SidebarComponent, NavTab } from './components/layout/sidebar.component';
import { HeaderComponent } from './components/layout/header.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { DltApprovalsComponent } from './components/dlt/dlt-approvals.component';
import { SenderIdsComponent } from './components/dlt/sender-ids.component';
import { DltTemplatesComponent } from './components/dlt/dlt-templates.component';
import { ProvidersComponent } from './components/providers/providers.component';
import { ProviderRoutingComponent } from './components/providers/provider-routing.component';
import { DltHashToolComponent } from './components/tools/dlt-hash-tool.component';
import { SmsLogsComponent } from './components/logs/sms-logs.component';
import { AuditLogsComponent } from './components/logs/audit-logs.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/auth/login.component';
import { SmsPricingComponent } from './components/billing/sms-pricing.component';
import { BankTransfersComponent } from './components/billing/bank-transfers.component';
import { BillingDashboardComponent } from './components/billing/billing-dashboard.component';

// Website Monitoring Module (Phase 1)
import { MonitoringDashboardComponent } from './components/monitoring/monitoring-dashboard.component';
import { MonitoringAllMonitorsComponent } from './components/monitoring/monitoring-all-monitors.component';
import { MonitoringIncidentsComponent } from './components/monitoring/monitoring-incidents.component';
import { MonitoringPlansComponent } from './components/monitoring/monitoring-plans.component';
import { MonitoringSubscriptionsComponent } from './components/monitoring/monitoring-subscriptions.component';
import { MonitoringSourcesComponent } from './components/monitoring/monitoring-sources.component';
import { MonitoringTemplatesComponent } from './components/monitoring/monitoring-templates.component';

// Task #06: Email Alert Service (Amazon SES)
import { EmailDashboardComponent } from './components/email/email-dashboard.component';
import { EmailProvidersComponent } from './components/email/email-providers.component';
import { EmailDomainsComponent } from './components/email/email-domains.component';
import { EmailSendersComponent } from './components/email/email-senders.component';
import { EmailTemplatesComponent } from './components/email/email-templates.component';
import { EmailLogsComponent } from './components/email/email-logs.component';
import { EmailPricingComponent } from './components/email/email-pricing.component';
import { EmailReputationComponent } from './components/email/email-reputation.component';

// Task #07: Meta WhatsApp Business Platform (SaaS)
import { WhatsappDashboardComponent } from './components/whatsapp/whatsapp-dashboard.component';
import { WhatsappConfigComponent } from './components/whatsapp/whatsapp-config.component';
import { WhatsappAccountsComponent } from './components/whatsapp/whatsapp-accounts.component';
import { WhatsappNumbersComponent } from './components/whatsapp/whatsapp-numbers.component';
import { WhatsappTemplatesComponent } from './components/whatsapp/whatsapp-templates.component';
import { WhatsappCampaignsComponent } from './components/whatsapp/whatsapp-campaigns.component';
import { WhatsappLogsComponent } from './components/whatsapp/whatsapp-logs.component';
import { WhatsappWebhookLogsComponent } from './components/whatsapp/whatsapp-webhook-logs.component';
import { WhatsappPricingComponent } from './components/whatsapp/whatsapp-pricing.component';

// Task #08: Business SMS, OTP & Transaction Relay Platform Components (Spec V2.0)
import { RelayDashboardComponent } from './components/relay/relay-dashboard.component';
import { RelayBuilderComponent } from './components/relay/relay-builder.component';
import { RelayTemplatesComponent } from './components/relay/relay-templates.component';
import { RelaySourcesComponent } from './components/relay/relay-sources.component';
import { RelayVariablesComponent } from './components/relay/relay-variables.component';
import { RelayDevicesComponent } from './components/relay/relay-devices.component';
import { RelayEventsComponent } from './components/relay/relay-events.component';
import { RelayPackagesComponent } from './components/relay/relay-packages.component';
import { RelayDiagnosticsComponent } from './components/relay/relay-diagnostics.component';
import { RelayOutboundSmsComponent } from './components/relay/relay-outbound-sms.component';

import { ToastComponent } from './components/shared/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    UsersComponent,
    SmsPricingComponent,
    BankTransfersComponent,
    BillingDashboardComponent,
    MonitoringDashboardComponent,
    MonitoringAllMonitorsComponent,
    MonitoringIncidentsComponent,
    MonitoringPlansComponent,
    MonitoringSubscriptionsComponent,
    MonitoringSourcesComponent,
    MonitoringTemplatesComponent,
    EmailDashboardComponent,
    EmailProvidersComponent,
    EmailDomainsComponent,
    EmailSendersComponent,
    EmailTemplatesComponent,
    EmailLogsComponent,
    EmailPricingComponent,
    EmailReputationComponent,
    WhatsappDashboardComponent,
    WhatsappConfigComponent,
    WhatsappAccountsComponent,
    WhatsappNumbersComponent,
    WhatsappTemplatesComponent,
    WhatsappCampaignsComponent,
    WhatsappLogsComponent,
    WhatsappWebhookLogsComponent,
    WhatsappPricingComponent,
    RelayDashboardComponent,
    RelayBuilderComponent,
    RelayTemplatesComponent,
    RelaySourcesComponent,
    RelayVariablesComponent,
    RelayDevicesComponent,
    RelayEventsComponent,
    RelayPackagesComponent,
    RelayDiagnosticsComponent,
    RelayOutboundSmsComponent,
    DltApprovalsComponent,
    SenderIdsComponent,
    DltTemplatesComponent,
    ProvidersComponent,
    ProviderRoutingComponent,
    DltHashToolComponent,
    SmsLogsComponent,
    AuditLogsComponent,
    SettingsComponent,
    LoginComponent,
    ToastComponent
  ],
  template: `
    <app-toast></app-toast>
    
    <!-- If not authenticated as Admin, show Admin Login -->
    <ng-container *ngIf="!authService.isLoggedIn()">
      <app-login></app-login>
    </ng-container>

    <!-- Admin Panel Shell -->
    <ng-container *ngIf="authService.isLoggedIn()">
      <div class="min-h-screen bg-slate-50 text-slate-900 flex">
        <!-- Sidebar Navigation -->
        <app-sidebar 
          [activeTab]="activeTab" 
          [isSidebarOpen]="isSidebarOpen"
          (tabChange)="onTabChange($event)">
        </app-sidebar>

        <!-- Main Workspace Area -->
        <div 
          class="flex-1 flex flex-col min-h-screen transition-all duration-300"
          [ngClass]="isSidebarOpen ? 'ml-[260px]' : 'ml-0'">
          
          <!-- Top Header -->
          <app-header 
            [isSidebarOpen]="isSidebarOpen"
            (toggleSidebar)="isSidebarOpen = !isSidebarOpen">
          </app-header>

          <!-- Main View Body -->
          <main class="flex-1 mt-[70px] p-6 max-w-7xl w-full mx-auto">
            <app-dashboard *ngIf="activeTab === 'dashboard'" (navigate)="onTabChange($event)"></app-dashboard>
            <app-users *ngIf="activeTab === 'users'"></app-users>
            <app-sms-pricing *ngIf="activeTab === 'sms-pricing'"></app-sms-pricing>
            <app-bank-transfers *ngIf="activeTab === 'bank-transfers'"></app-bank-transfers>
            <app-billing-dashboard *ngIf="activeTab === 'billing-dashboard'" (navigate)="onTabChange($event)"></app-billing-dashboard>
            
            <!-- Website Monitoring Components -->
            <app-monitoring-dashboard *ngIf="activeTab === 'monitoring-dashboard'"></app-monitoring-dashboard>
            <app-monitoring-all-monitors *ngIf="activeTab === 'monitoring-monitors'"></app-monitoring-all-monitors>
            <app-monitoring-incidents *ngIf="activeTab === 'monitoring-incidents'"></app-monitoring-incidents>
            <app-monitoring-plans *ngIf="activeTab === 'monitoring-plans'"></app-monitoring-plans>
            <app-monitoring-subscriptions *ngIf="activeTab === 'monitoring-subscriptions'"></app-monitoring-subscriptions>
            <app-monitoring-sources *ngIf="activeTab === 'monitoring-sources'"></app-monitoring-sources>
            <app-monitoring-templates *ngIf="activeTab === 'monitoring-templates'"></app-monitoring-templates>

            <!-- Task #06: Email Alert Service Components -->
            <app-email-dashboard *ngIf="activeTab === 'email-dashboard'" (navigate)="onTabChange($event)"></app-email-dashboard>
            <app-email-providers *ngIf="activeTab === 'email-providers'"></app-email-providers>
            <app-email-domains *ngIf="activeTab === 'email-domains'"></app-email-domains>
            <app-email-senders *ngIf="activeTab === 'email-senders'"></app-email-senders>
            <app-email-templates *ngIf="activeTab === 'email-templates'"></app-email-templates>
            <app-email-logs *ngIf="activeTab === 'email-logs'"></app-email-logs>
            <app-email-pricing *ngIf="activeTab === 'email-pricing'"></app-email-pricing>
            <app-email-reputation *ngIf="activeTab === 'email-reputation'"></app-email-reputation>

            <!-- Task #07: Meta WhatsApp Business SaaS Components -->
            <app-whatsapp-dashboard *ngIf="activeTab === 'whatsapp-dashboard'"></app-whatsapp-dashboard>
            <app-whatsapp-config *ngIf="activeTab === 'whatsapp-config'"></app-whatsapp-config>
            <app-whatsapp-accounts *ngIf="activeTab === 'whatsapp-accounts'"></app-whatsapp-accounts>
            <app-whatsapp-numbers *ngIf="activeTab === 'whatsapp-numbers'"></app-whatsapp-numbers>
            <app-whatsapp-templates *ngIf="activeTab === 'whatsapp-templates'"></app-whatsapp-templates>
            <app-whatsapp-campaigns *ngIf="activeTab === 'whatsapp-campaigns'"></app-whatsapp-campaigns>
            <app-whatsapp-logs *ngIf="activeTab === 'whatsapp-logs'"></app-whatsapp-logs>
            <app-whatsapp-webhook-logs *ngIf="activeTab === 'whatsapp-webhook-logs'"></app-whatsapp-webhook-logs>
            <app-whatsapp-pricing *ngIf="activeTab === 'whatsapp-pricing'"></app-whatsapp-pricing>

            <!-- Task #08: Business SMS, OTP & Transaction Relay Platform Components (Spec V2.0) -->
            <app-relay-dashboard *ngIf="activeTab === 'relay-dashboard'" (navigate)="onTabChange($event)"></app-relay-dashboard>
            <app-relay-builder *ngIf="activeTab === 'relay-builder'"></app-relay-builder>
            <app-relay-templates *ngIf="activeTab === 'relay-templates'" (navigate)="onTabChange($event)"></app-relay-templates>
            <app-relay-sources *ngIf="activeTab === 'relay-sources'"></app-relay-sources>
            <app-relay-variables *ngIf="activeTab === 'relay-variables'"></app-relay-variables>
            <app-relay-devices *ngIf="activeTab === 'relay-devices'"></app-relay-devices>
            <app-relay-events *ngIf="activeTab === 'relay-events'"></app-relay-events>
            <app-relay-packages *ngIf="activeTab === 'relay-packages'"></app-relay-packages>
            <app-relay-diagnostics *ngIf="activeTab === 'relay-diagnostics'" (navigate)="onTabChange($event)"></app-relay-diagnostics>
            <app-relay-outbound-sms *ngIf="activeTab === 'relay-outbound'"></app-relay-outbound-sms>

            <!-- DLT & Gateway Components -->
            <app-dlt-approvals *ngIf="activeTab === 'dlt-pe'"></app-dlt-approvals>
            <app-sender-ids *ngIf="activeTab === 'dlt-sender'"></app-sender-ids>
            <app-dlt-templates *ngIf="activeTab === 'dlt-template'"></app-dlt-templates>
            <app-providers *ngIf="activeTab === 'providers'"></app-providers>
            <app-provider-routing *ngIf="activeTab === 'provider-routing'"></app-provider-routing>
            <app-dlt-hash-tool *ngIf="activeTab === 'dlt-hash-tool'"></app-dlt-hash-tool>
            <app-sms-logs *ngIf="activeTab === 'sms-logs'"></app-sms-logs>
            <app-audit-logs *ngIf="activeTab === 'audit-logs'"></app-audit-logs>
            <app-settings *ngIf="activeTab === 'settings'"></app-settings>
          </main>
        </div>
      </div>
    </ng-container>
  `
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  activeTab: NavTab = 'dashboard';
  isSidebarOpen = true;

  private validTabs: NavTab[] = [
    'dashboard', 'users', 'sms-pricing', 'bank-transfers', 'billing-dashboard',
    'monitoring-dashboard', 'monitoring-monitors', 'monitoring-incidents',
    'monitoring-plans', 'monitoring-subscriptions', 'monitoring-sources', 'monitoring-templates',
    'email-dashboard', 'email-providers', 'email-domains', 'email-senders',
    'email-templates', 'email-logs', 'email-pricing', 'email-reputation',
    'whatsapp-dashboard', 'whatsapp-config', 'whatsapp-accounts', 'whatsapp-numbers',
    'whatsapp-templates', 'whatsapp-campaigns', 'whatsapp-logs', 'whatsapp-webhook-logs', 'whatsapp-pricing',
    'relay-dashboard', 'relay-builder', 'relay-templates', 'relay-sources', 'relay-variables', 'relay-devices',
    'relay-events', 'relay-packages', 'relay-diagnostics', 'relay-outbound',
    'dlt-pe', 'dlt-sender', 'dlt-template', 'providers', 'provider-routing',
    'dlt-hash-tool', 'sms-logs', 'audit-logs', 'settings'
  ];

  constructor() {}

  ngOnInit() {
    this.restoreActiveTab();
  }

  @HostListener('window:hashchange', ['$event'])
  onHashChange() {
    this.restoreActiveTab();
  }

  private restoreActiveTab() {
    // 1. Try URL hash first (e.g. #bank-transfers or #/bank-transfers)
    let hashTab = window.location.hash ? window.location.hash.replace(/^#\/?/, '').split('?')[0] : '';
    if (hashTab && this.validTabs.includes(hashTab as NavTab)) {
      this.activeTab = hashTab as NavTab;
      localStorage.setItem('alert21_admin_active_tab', hashTab);
      return;
    }

    // 2. Fallback to localStorage
    const savedTab = localStorage.getItem('alert21_admin_active_tab');
    if (savedTab && this.validTabs.includes(savedTab as NavTab)) {
      this.activeTab = savedTab as NavTab;
      window.location.hash = savedTab;
      return;
    }

    // 3. Default to dashboard
    this.activeTab = 'dashboard';
    window.location.hash = 'dashboard';
  }

  onTabChange(tab: NavTab) {
    this.activeTab = tab;
    localStorage.setItem('alert21_admin_active_tab', tab);
    window.location.hash = tab;
  }
}
