import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { NavTab } from '../layout/sidebar.component';

@Component({
  selector: 'app-email-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Transactional Email Dashboard</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Real-time delivery performance, Amazon SES outbound metrics, bounce health, and credit consumption.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="refresh()" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Refresh Stats</span>
          </button>
          <button (click)="navigate.emit('email-providers')" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="server" [size]="13"></app-icon>
            <span>SES Settings</span>
          </button>
        </div>
      </div>

      <!-- Core Summary Cards (Grid) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Sent -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Emails Sent</span>
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <app-icon name="mail" [size]="18"></app-icon>
            </div>
          </div>
          <div class="mt-3">
            <h3 class="text-2xl font-black text-slate-900 font-mono">{{ stats().totalEmailsSent | number }}</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Dispatched via Amazon SES</p>
          </div>
        </div>

        <!-- 2. Delivered -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Delivered</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <app-icon name="check-circle" [size]="18"></app-icon>
            </div>
          </div>
          <div class="mt-3">
            <div class="flex items-baseline gap-2">
              <h3 class="text-2xl font-black text-emerald-600 font-mono">{{ stats().deliveredEmails | number }}</h3>
              <span class="text-xs font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded">{{ stats().deliveryRatePercent }}%</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Inbox delivery confirmed</p>
          </div>
        </div>

        <!-- 3. Bounced / Failed -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-rose-700 uppercase tracking-wider">Bounced / Rejected</span>
            <div class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <app-icon name="alert-triangle" [size]="18"></app-icon>
            </div>
          </div>
          <div class="mt-3">
            <div class="flex items-baseline gap-2">
              <h3 class="text-2xl font-black text-rose-600 font-mono">{{ stats().bouncedEmails | number }}</h3>
              <span class="text-xs font-bold text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded">{{ stats().bounceRatePercent }}%</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Target: Keep under 5.0%</p>
          </div>
        </div>

        <!-- 4. User Email Balances -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-purple-700 uppercase tracking-wider">User Balance Total</span>
            <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <app-icon name="credit-card" [size]="18"></app-icon>
            </div>
          </div>
          <div class="mt-3">
            <h3 class="text-2xl font-black text-purple-700 font-mono">{{ stats().currentTotalUserBalance | number }}</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Active user wallet credits</p>
          </div>
        </div>
      </div>

      <!-- Secondary Metrics Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div (click)="navigate.emit('email-domains')" class="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 cursor-pointer transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Verified Domains</span>
            <app-icon name="globe" [size]="14" className="text-slate-400"></app-icon>
          </div>
          <h4 class="text-xl font-black text-slate-900 font-mono mt-2">{{ stats().verifiedDomainsCount }} Domains</h4>
          <p class="text-[10px] text-indigo-600 font-bold mt-0.5">Manage DKIM Records &rarr;</p>
        </div>

        <div (click)="navigate.emit('email-templates')" class="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 cursor-pointer transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Active Templates</span>
            <app-icon name="copy" [size]="14" className="text-slate-400"></app-icon>
          </div>
          <h4 class="text-xl font-black text-slate-900 font-mono mt-2">{{ stats().activeTemplatesCount }} Templates</h4>
          <p class="text-[10px] text-indigo-600 font-bold mt-0.5">View Platform Templates &rarr;</p>
        </div>

        <div (click)="navigate.emit('email-reputation')" class="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 cursor-pointer transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider">SES Reputation Status</span>
            <app-icon name="shield-check" [size]="14" className="text-emerald-600"></app-icon>
          </div>
          <h4 class="text-xl font-black text-emerald-600 font-mono mt-2">HEALTHY</h4>
          <p class="text-[10px] text-emerald-700 font-medium mt-0.5">Complaint: {{ stats().complaintRatePercent }}%</p>
        </div>

        <div (click)="navigate.emit('email-pricing')" class="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 cursor-pointer transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Email Credit Billing</span>
            <app-icon name="tag" [size]="14" className="text-slate-400"></app-icon>
          </div>
          <h4 class="text-xl font-black text-slate-900 font-mono mt-2">₹{{ stats().totalBillingValue | number:'1.2-2' }}</h4>
          <p class="text-[10px] text-indigo-600 font-bold mt-0.5">Manage Pricing Slabs &rarr;</p>
        </div>
      </div>

      <!-- Quick Action / Status Banner -->
      <div class="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black border border-emerald-500/30 uppercase">
              Amazon SES Engine Active
            </span>
            <span class="text-xs text-slate-300 font-mono">Region: ap-southeast-2</span>
          </div>
          <h3 class="text-base font-black">High-Deliverability Transactional Email Gateway</h3>
          <p class="text-xs text-slate-300">
            Automated DKIM signature verification, bounce webhooks, and template variable injection are live.
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button (click)="navigate.emit('email-logs')" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-white/20">
            <app-icon name="file-text" [size]="14"></app-icon>
            <span>Live Email Logs</span>
          </button>
          <button (click)="navigate.emit('email-domains')" class="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5">
            <app-icon name="plus" [size]="14"></app-icon>
            <span>Add Sending Domain</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class EmailDashboardComponent implements OnInit {
  dataService = inject(DataService);
  @Output() navigate = new EventEmitter<NavTab>();

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.dataService.fetchEmailDashboardStats();
    this.dataService.fetchEmailDomains();
    this.dataService.fetchEmailTemplates();
    this.dataService.fetchEmailProviders();
    this.dataService.fetchEmailTransactions();
  }

  stats() {
    const live = this.dataService.emailDashboardStats();
    const domains = this.dataService.emailDomains();
    const templates = this.dataService.emailTemplates();
    const txs = this.dataService.emailTransactions();

    const verifiedDomains = domains.filter(d => d.status === 'VERIFIED').length;
    const activeTpls = templates.filter(t => t.status === 'ACTIVE').length;

    const totalSent = txs.length;
    const delivered = txs.filter(t => t.status === 'DELIVERED').length;
    const bounced = txs.filter(t => t.status === 'BOUNCED' || t.status === 'FAILED').length;
    const complaints = txs.filter(t => t.status === 'COMPLAINT').length;

    const users = this.dataService.users();
    const totalUserBal = users.reduce((sum, u) => sum + (Number((u as any).emailBalance || 0)), 0);

    if (live) {
      return {
        ...live,
        currentTotalUserBalance: live.currentTotalUserBalance || totalUserBal,
        verifiedDomainsCount: live.verifiedDomainsCount || verifiedDomains,
        activeTemplatesCount: live.activeTemplatesCount || activeTpls,
        totalEmailsSent: live.totalEmailsSent || totalSent,
        deliveredEmails: live.deliveredEmails || delivered,
        bouncedEmails: live.bouncedEmails || bounced
      };
    }

    return {
      totalCreditsDistributed: totalUserBal,
      currentTotalUserBalance: totalUserBal,
      totalEmailsSold: totalUserBal,
      totalEmailsSent: totalSent,
      deliveredEmails: delivered,
      bouncedEmails: bounced,
      complaintCount: complaints,
      verifiedDomainsCount: verifiedDomains,
      activeTemplatesCount: activeTpls,
      totalBillingValue: 0,
      gstCollected: 0,
      avgSellingPricePerEmail: 0,
      totalPaymentReceived: 0,
      deliveryRatePercent: totalSent > 0 ? Number(((delivered / totalSent) * 100).toFixed(1)) : 100,
      bounceRatePercent: totalSent > 0 ? Number(((bounced / totalSent) * 100).toFixed(2)) : 0,
      complaintRatePercent: totalSent > 0 ? Number(((complaints / totalSent) * 100).toFixed(3)) : 0
    };
  }
}
