import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { NavTab } from '../layout/sidebar.component';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & SMS Revenue Dashboard</h2>
          <p class="text-xs text-slate-500 font-medium">Real-time financial metrics, SMS distribution volume, GST collection, and reconciliation.</p>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="dataService.fetchBillingDashboardStats()" class="btn btn-outline shadow-sm flex items-center gap-2">
            <app-icon name="rotate-cw" [size]="14"></app-icon>
            <span>Refresh Metrics</span>
          </button>
          <button (click)="navigate.emit('bank-transfers')" class="btn btn-primary shadow-sm flex items-center gap-2">
            <app-icon name="bank" [size]="14"></app-icon>
            <span>Review Bank Transfers</span>
          </button>
        </div>
      </div>

      <!-- 8 Mandatory Billing & SMS Metrics Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- 1. Total SMS Distributed -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Total SMS Distributed</span>
            <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <app-icon name="server" [size]="16"></app-icon>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 font-mono">{{ stats().totalSmsDistributed | number }}</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Lifetime paid + admin credits</p>
          </div>
        </div>

        <!-- 2. Current Total User SMS Balance -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">User SMS Balance</span>
            <div class="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <app-icon name="credit-card" [size]="16"></app-icon>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 font-mono">{{ stats().currentTotalUserSmsBalance | number }}</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Total balance across all user wallets</p>
          </div>
        </div>

        <!-- 3. Total SMS Sold -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Total SMS Sold</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <app-icon name="tag" [size]="16"></app-icon>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-black text-emerald-600 font-mono">{{ stats().totalSmsSold | number }}</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Paid SMS quantity (free excluded)</p>
          </div>
        </div>

        <!-- 4. Total Billing Value -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Total Billing Value</span>
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <app-icon name="indian-rupee" [size]="16"></app-icon>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 font-mono">₹{{ stats().totalBillingValue | number:'1.2-2' }}</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Taxable base value before GST</p>
          </div>
        </div>

        <!-- 5. GST Collected (18%) -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">GST Collected (18%)</span>
            <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <app-icon name="file-text" [size]="16"></app-icon>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-black text-purple-700 font-mono">₹{{ stats().gstCollected | number:'1.2-2' }}</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Total statutory 18% GST collected</p>
          </div>
        </div>

        <!-- 6. Average Selling Price / SMS -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Avg Selling Price / SMS</span>
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <app-icon name="tag" [size]="16"></app-icon>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 font-mono">₹{{ stats().averageSellingPricePerSms | number:'1.3-4' }}</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Total value ÷ Total SMS sold</p>
          </div>
        </div>

        <!-- 7. Total Payment Received -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Total Payment Received</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <app-icon name="check-circle" [size]="16"></app-icon>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-black text-emerald-600 font-mono">₹{{ stats().totalPaymentReceived | number:'1.2-2' }}</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Gateway + Approved Bank payments</p>
          </div>
        </div>

        <!-- 8. Pending Bank Transfer Requests (Clickable) -->
        <div 
          (click)="navigate.emit('bank-transfers')"
          class="bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 rounded-2xl p-5 shadow-xs space-y-3 cursor-pointer transition-all group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase text-amber-800 tracking-wider">Pending Bank Transfers</span>
            <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <app-icon name="bank" [size]="16"></app-icon>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 font-mono">{{ stats().pendingBankTransferCount }} Requests</h3>
            <div class="flex items-center justify-between mt-0.5">
              <span class="text-xs font-bold text-amber-700 font-mono">₹{{ stats().pendingBankTransferAmount | number:'1.2-2' }}</span>
              <span class="text-[11px] text-indigo-600 font-extrabold group-hover:underline flex items-center gap-1">Review &rarr;</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Quick Actions and Pricing Reference -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Quick Pricing Tiers Preview -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900">Current SMS Pricing Tiers</h3>
            <button (click)="navigate.emit('sms-pricing')" class="text-xs text-indigo-600 font-bold hover:underline">
              Manage Slabs &rarr;
            </button>
          </div>

          <div class="space-y-2">
            <div *ngFor="let slab of dataService.pricingSlabs()" class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs">
              <div>
                <span class="font-bold text-slate-800">{{ slab.minQuantity | number }} - {{ slab.maxQuantity | number }} SMS</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-extrabold text-indigo-600">₹{{ slab.ratePerSms | number:'1.2-4' }}/SMS</span>
                <span [class]="slab.status === 'ACTIVE' ? 'badge badge-active text-[10px]' : 'badge badge-suspended text-[10px]'">
                  {{ slab.status }}
                </span>
              </div>
            </div>

            <div *ngIf="dataService.pricingSlabs().length === 0" class="p-4 text-center text-slate-400 text-xs">
              No pricing slabs configured yet.
            </div>
          </div>
        </div>

        <!-- Recent Bank Requests Preview -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900">Recent Bank Transfer Requests</h3>
            <button (click)="navigate.emit('bank-transfers')" class="text-xs text-indigo-600 font-bold hover:underline">
              View All &rarr;
            </button>
          </div>

          <div class="space-y-2">
            <div *ngFor="let req of recentTransfers()" class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span class="font-mono font-bold text-indigo-600 block">{{ req.orderId }}</span>
                <span class="text-slate-700 font-semibold">{{ req.userName }} ({{ req.smsQuantity | number }} SMS)</span>
              </div>
              <div class="text-right">
                <span class="font-mono font-bold text-slate-900 block">₹{{ req.totalAmount | number:'1.2-2' }}</span>
                <span [class]="req.purchaseStatus === 'APPROVED' ? 'badge badge-active text-[9px]' : (req.purchaseStatus === 'PENDING' ? 'badge bg-amber-50 text-amber-700 border-amber-200 text-[9px]' : 'badge badge-suspended text-[9px]')">
                  {{ req.purchaseStatus }}
                </span>
              </div>
            </div>

            <div *ngIf="dataService.bankTransfers().length === 0" class="p-4 text-center text-slate-400 text-xs">
              No bank transfer requests yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BillingDashboardComponent implements OnInit {
  dataService = inject(DataService);
  @Output() navigate = new EventEmitter<NavTab>();

  ngOnInit() {
    this.dataService.fetchBillingDashboardStats();
    this.dataService.fetchLivePricingSlabs();
    this.dataService.fetchLiveBankTransfers();
    this.dataService.fetchMonitoringBankTransfers();
  }

  stats() {
    const live = this.dataService.billingStats();
    const allUsers = this.dataService.users();
    const allTransfers = this.dataService.bankTransfers();
    const allMonTransfers = this.dataService.monitoringBankTransfers();

    const approved = allTransfers.filter(t => t.purchaseStatus === 'APPROVED');
    const pendingSms = allTransfers.filter(t => t.purchaseStatus === 'PENDING');
    const pendingMon = allMonTransfers.filter(t => t.adminStatus === 'PENDING');

    const pendingCount = pendingSms.length + pendingMon.length;
    const pendingAmt = pendingSms.reduce((sum, t) => sum + (t.totalAmount || 0), 0) + 
                       pendingMon.reduce((sum, t) => sum + (t.totalPayable || 0), 0);

    const totalSold = approved.reduce((sum, t) => sum + (t.smsQuantity || 0), 0);
    const totalBilling = approved.reduce((sum, t) => sum + (t.baseAmount || 0), 0);
    const totalGst = approved.reduce((sum, t) => sum + (t.gstAmount || 0), 0);
    const totalPaid = approved.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const userBalance = allUsers.reduce((sum, u) => sum + (u.smsBalance || 0), 0);

    if (live) {
      return {
        ...live,
        pendingBankTransferCount: pendingCount > 0 ? pendingCount : (live.pendingBankTransferCount || 0),
        pendingBankTransferAmount: pendingAmt > 0 ? pendingAmt : (live.pendingBankTransferAmount || 0),
        currentTotalUserSmsBalance: live.currentTotalUserSmsBalance || userBalance
      };
    }

    return {
      totalSmsDistributed: totalSold + userBalance,
      currentTotalUserSmsBalance: userBalance,
      totalSmsSold: totalSold,
      totalBillingValue: totalBilling,
      gstCollected: totalGst,
      averageSellingPricePerSms: totalSold > 0 ? totalBilling / totalSold : 0.22,
      totalPaymentReceived: totalPaid,
      pendingBankTransferCount: pendingCount,
      pendingBankTransferAmount: pendingAmt
    };
  }

  recentTransfers() {
    return this.dataService.bankTransfers().slice(0, 4);
  }
}
