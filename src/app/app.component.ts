import { Component, inject } from '@angular/core';
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
export class AppComponent {
  authService = inject(AuthService);
  activeTab: NavTab = 'dashboard';
  isSidebarOpen = true;

  onTabChange(tab: NavTab) {
    this.activeTab = tab;
  }
}
