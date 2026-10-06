import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-razorpay-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Razorpay Automated Payment Capture & Reconciliation</h2>
          <p class="text-xs text-slate-500 font-medium">View automated capture statuses, benefit application idempotency, and trigger manual capture retries for uncaptured orders.</p>
        </div>

        <button (click)="loadPayments()" class="btn btn-outline shadow-sm flex items-center gap-2">
          <app-icon name="rotate-cw" [size]="14"></app-icon>
          <span>Refresh Payments</span>
        </button>
      </div>

      <!-- Main Payments Table -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-900">Razorpay Orders & Gateway Statuses</h3>
          <span class="text-xs text-slate-500">Showing last {{ orders.length }} gateway orders</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead class="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-3">Order ID</th>
                <th class="p-3">User & Contact</th>
                <th class="p-3">Amount & Package</th>
                <th class="p-3">Razorpay Payment ID</th>
                <th class="p-3">Gateway & Capture Status</th>
                <th class="p-3">Benefit Credit</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let item of orders" class="hover:bg-slate-50/50">
                <td class="p-3">
                  <div class="font-mono font-bold text-slate-900">{{ item.order_id || item._id }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ item.created_at | date:'short' }}</div>
                </td>
                <td class="p-3">
                  <div class="font-bold text-slate-800">{{ item.user_id?.name || item.user_id?.company || 'User' }}</div>
                  <div class="text-[10px] text-slate-500 font-mono">{{ item.user_id?.email }}</div>
                </td>
                <td class="p-3">
                  <div class="font-black text-slate-900">₹{{ item.amount }}</div>
                  <div class="text-[10px] text-indigo-600 font-semibold">{{ item.credits || item.sms_count }} Credits</div>
                </td>
                <td class="p-3 font-mono font-semibold text-slate-700">
                  {{ item.razorpay_payment_id || item.payment_id || 'N/A' }}
                </td>
                <td class="p-3">
                  <div class="flex flex-col gap-1">
                    <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded-md w-fit"
                      [ngClass]="getGatewayBadgeClass(item.gateway_status || item.payment_status)">
                      Gateway: {{ item.gateway_status || item.payment_status || 'PENDING' }}
                    </span>
                    <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded-md w-fit"
                      [ngClass]="getCaptureBadgeClass(item.capture_status)">
                      Capture: {{ item.capture_status || 'PENDING' }}
                    </span>
                  </div>
                </td>
                <td class="p-3">
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-full"
                    [ngClass]="item.benefit_applied ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                    {{ item.benefit_applied ? 'APPLIED (IDEMPOTENT)' : 'NOT APPLIED' }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <button *ngIf="item.razorpay_payment_id && item.capture_status !== 'captured'"
                    (click)="retryCapture(item._id)"
                    [disabled]="retryingId === item._id"
                    class="px-3 py-1.5 text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50">
                    {{ retryingId === item._id ? 'Capturing...' : 'Retry Capture' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="orders.length === 0">
                <td colspan="7" class="p-8 text-center text-slate-400">No Razorpay payment records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class RazorpayPaymentsComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  orders: any[] = [];
  retryingId: string | null = null;

  ngOnInit() {
    this.loadPayments();
  }

  async loadPayments() {
    try {
      const headers = this.authService.getAuthHeaders();
      const baseUrl = environment.apiUrl;
      const res: any = await firstValueFrom(this.http.get(`${baseUrl}/admin/payments`, { headers }));
      this.orders = res.data || [];
    } catch (error) {
      console.error('Error loading Razorpay payment logs:', error);
    }
  }

  async retryCapture(orderDbId: string) {
    this.retryingId = orderDbId;
    try {
      const headers = this.authService.getAuthHeaders();
      const baseUrl = environment.apiUrl;
      const res: any = await firstValueFrom(
        this.http.post(`${baseUrl}/admin/payments/${orderDbId}/retry-capture`, {}, { headers })
      );
      alert(res.message || 'Payment capture retried successfully!');
      await this.loadPayments();
    } catch (error: any) {
      alert(error.error?.message || 'Failed to retry capture.');
    } finally {
      this.retryingId = null;
    }
  }

  getGatewayBadgeClass(status?: string): string {
    switch (status) {
      case 'captured':
      case 'SUCCESS':
      case 'PAID': return 'bg-emerald-100 text-emerald-800';
      case 'authorized': return 'bg-sky-100 text-sky-800';
      case 'FAILED': return 'bg-rose-100 text-rose-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  }

  getCaptureBadgeClass(status?: string): string {
    switch (status) {
      case 'captured': return 'bg-emerald-100 text-emerald-800';
      case 'failed': return 'bg-rose-100 text-rose-800';
      case 'attempted': return 'bg-sky-100 text-sky-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  }
}
