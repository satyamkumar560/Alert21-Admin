import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-email-reputation',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Email Reputation & Health</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Monitor ISP delivery thresholds, bounce telemetry, and spam complaints to ensure high email deliverability.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="refresh()" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Sync Reputation</span>
          </button>
        </div>
      </div>

      <!-- Health Threshold Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Bounce Rate Gauge Card -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Account Bounce Rate</span>
              <h3 class="text-3xl font-black font-mono mt-1" [ngClass]="bounceRate() < 5 ? 'text-emerald-600' : 'text-rose-600'">
                {{ bounceRate() }}%
              </h3>
            </div>
            <span class="px-3 py-1 rounded-xl text-xs font-bold font-mono"
                  [ngClass]="bounceRate() < 5 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
              {{ bounceRate() < 5 ? 'HEALTHY' : 'NEEDS ATTENTION' }}
            </span>
          </div>

          <!-- Progress bar -->
          <div class="space-y-1.5">
            <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" [style.width.%]="bounceRate() * 10"></div>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0% (Ideal)</span>
              <span>5% (SES Warning)</span>
              <span>10% (SES Pause)</span>
            </div>
          </div>

          <p class="text-xs text-slate-500 font-medium">
            Amazon SES requires account bounce rate to stay below <strong>5.0%</strong>. Rates above 10% may cause SES account suspension.
          </p>
        </div>

        <!-- Complaint Rate Gauge Card -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Spam Complaint Rate</span>
              <h3 class="text-3xl font-black font-mono mt-1" [ngClass]="complaintRate() < 0.1 ? 'text-emerald-600' : 'text-rose-600'">
                {{ complaintRate() }}%
              </h3>
            </div>
            <span class="px-3 py-1 rounded-xl text-xs font-bold font-mono"
                  [ngClass]="complaintRate() < 0.1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
              {{ complaintRate() < 0.1 ? 'HEALTHY' : 'CRITICAL' }}
            </span>
          </div>

          <!-- Progress bar -->
          <div class="space-y-1.5">
            <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" [style.width.%]="complaintRate() * 500"></div>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0%</span>
              <span>0.1% (SES Max Limit)</span>
              <span>0.5% (Severe)</span>
            </div>
          </div>

          <p class="text-xs text-slate-500 font-medium">
            Amazon SES requires complaint rate to remain below <strong>0.1% (1 complaint per 1,000 emails)</strong>.
          </p>
        </div>
      </div>

      <!-- Recent Bounce / Failure Traces Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100">
          <h3 class="text-sm font-black text-slate-900 uppercase">Recent Bounces & Delivery Issues</h3>
          <p class="text-[11px] text-slate-500">In-depth ISP bounce codes received via SES Event publishing.</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th class="py-3.5 px-4">Transaction ID</th>
                <th class="py-3.5 px-4">Recipient</th>
                <th class="py-3.5 px-4">Tenant Account</th>
                <th class="py-3.5 px-4">Bounce Type / Reason</th>
                <th class="py-3.5 px-4">ISP Error Code</th>
                <th class="py-3.5 px-4">Logged At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-mono">
              <tr *ngFor="let b of bouncedList()" class="hover:bg-slate-50/50 transition-colors">
                <td class="py-3.5 px-4 font-bold text-indigo-600">{{ b.transactionId }}</td>
                <td class="py-3.5 px-4 text-slate-900 font-bold">{{ b.toEmail }}</td>
                <td class="py-3.5 px-4 text-slate-600 font-sans">{{ b.userName }}</td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                    {{ b.bounceType || 'Hard Bounce' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-slate-500 text-[11px]">{{ b.errorMessage || '550 5.1.1 User unknown' }}</td>
                <td class="py-3.5 px-4 text-slate-400">{{ b.createdAt | date:'short' }}</td>
              </tr>

              <tr *ngIf="bouncedList().length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400 font-sans">
                  <app-icon name="check-circle" [size]="28" className="mx-auto mb-2 text-emerald-500"></app-icon>
                  <p class="font-bold text-slate-700">Zero Bounces Logged</p>
                  <p class="text-xs text-slate-400 mt-0.5">Your email sending reputation is in top standing!</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class EmailReputationComponent implements OnInit {
  dataService = inject(DataService);

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.dataService.fetchEmailDashboardStats();
    this.dataService.fetchEmailTransactions();
  }

  bounceRate(): number {
    const stats = this.dataService.emailDashboardStats();
    if (stats && stats.bounceRatePercent !== undefined) return stats.bounceRatePercent;
    const txs = this.dataService.emailTransactions();
    if (txs.length === 0) return 0;
    const bounced = txs.filter(t => t.status === 'BOUNCED' || t.status === 'FAILED').length;
    return Number(((bounced / txs.length) * 100).toFixed(2));
  }

  complaintRate(): number {
    const stats = this.dataService.emailDashboardStats();
    if (stats && stats.complaintRatePercent !== undefined) return stats.complaintRatePercent;
    const txs = this.dataService.emailTransactions();
    if (txs.length === 0) return 0;
    const complaints = txs.filter(t => t.status === 'COMPLAINT').length;
    return Number(((complaints / txs.length) * 100).toFixed(3));
  }

  bouncedList() {
    return this.dataService.emailTransactions().filter(tx => tx.status === 'BOUNCED' || tx.status === 'COMPLAINT' || tx.status === 'FAILED');
  }
}
