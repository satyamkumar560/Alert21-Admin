import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { BankTransferRequest, BankTransferStatus } from '../../models/alert21.models';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-bank-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Bank Transfer Requests</h2>
          <p class="text-xs text-slate-500 font-medium">Review, verify UTR reference numbers, and approve offline SMS, Website Monitoring, Email, and WhatsApp Credit payments.</p>
        </div>

        <button (click)="refreshAll()" class="btn btn-outline shadow-sm flex items-center gap-2">
          <app-icon name="rotate-cw" [size]="14"></app-icon>
          <span>Refresh Requests</span>
        </button>
      </div>

      <!-- Manual Payment Master Switch & Permissions Banner -->
      <div class="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm transition-all"
        [ngClass]="dataService.paymentSettings().allow_manual_payment ? 'border-emerald-200 bg-emerald-50/20' : 'border-amber-200 bg-amber-50/30'">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              [ngClass]="dataService.paymentSettings().allow_manual_payment ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'">
              <app-icon [name]="dataService.paymentSettings().allow_manual_payment ? 'check-circle' : 'shield'" [size]="22"></app-icon>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-extrabold text-slate-900">User Manual / Bank Transfer Gateway Option</h3>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                  [ngClass]="dataService.paymentSettings().allow_manual_payment ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
                  {{ dataService.paymentSettings().allow_manual_payment ? 'Enabled for Users' : 'Disabled for Users' }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                {{ dataService.paymentSettings().allow_manual_payment 
                  ? 'Users can view offline bank account details and submit UTR receipts across WhatsApp, SMS, Email & Monitoring billing pages.' 
                  : 'Manual / Bank Transfer payment options are completely HIDDEN across all user billing pages. Users can only pay via automated gateways.' }}
              </p>
            </div>
          </div>

          <!-- Master Action Toggle Button -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              (click)="toggleManualPaymentSetting('allow_manual_payment')"
              [disabled]="isTogglingManualPayment"
              class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              [ngClass]="dataService.paymentSettings().allow_manual_payment 
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'">
              <app-icon [name]="dataService.paymentSettings().allow_manual_payment ? 'x' : 'check'" [size]="14"></app-icon>
              <span>{{ dataService.paymentSettings().allow_manual_payment ? 'Disable Manual Payment Option' : 'Enable Manual Payment Option' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Category Tabs: SMS vs Website Monitoring vs Email Credits -->
      <div class="flex items-center gap-3 border-b border-slate-200 pb-2 overflow-x-auto">
        <button 
          (click)="setCategory('SMS')"
          [class]="selectedCategory === 'SMS' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all whitespace-nowrap">
          <app-icon name="credit-card" [size]="14"></app-icon>
          <span>SMS Balance Purchases</span>
          <span *ngIf="pendingSmsCount() > 0" class="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
            {{ pendingSmsCount() }}
          </span>
        </button>

        <button 
          (click)="setCategory('MONITORING')"
          [class]="selectedCategory === 'MONITORING' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all whitespace-nowrap">
          <app-icon name="activity" [size]="14"></app-icon>
          <span>Website Monitoring Subscriptions</span>
          <span *ngIf="pendingMonitoringCount() > 0" class="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black animate-pulse">
            {{ pendingMonitoringCount() }} PENDING
          </span>
        </button>

        <button 
          (click)="setCategory('EMAIL')"
          [class]="selectedCategory === 'EMAIL' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all whitespace-nowrap">
          <app-icon name="mail" [size]="14"></app-icon>
          <span>Email Credits Purchases</span>
          <span *ngIf="pendingEmailCount() > 0" class="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black animate-pulse">
            {{ pendingEmailCount() }} PENDING
          </span>
        </button>

        <button 
          (click)="setCategory('WHATSAPP')"
          [class]="selectedCategory === 'WHATSAPP' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all whitespace-nowrap">
          <app-icon name="message-circle" [size]="14"></app-icon>
          <span>WhatsApp Credit Purchases</span>
          <span *ngIf="pendingWhatsappCount() > 0" class="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black animate-pulse">
            {{ pendingWhatsappCount() }} PENDING
          </span>
        </button>
      </div>

      <!-- Overview Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <!-- Pending Transfers Card -->
        <div class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <app-icon name="bank" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Approvals</p>
            <h3 class="text-2xl font-black text-slate-900 font-mono">
              {{ selectedCategory === 'SMS' ? pendingSmsCount() : (selectedCategory === 'MONITORING' ? pendingMonitoringCount() : (selectedCategory === 'EMAIL' ? pendingEmailCount() : pendingWhatsappCount())) }} Requests
            </h3>
          </div>
        </div>

        <!-- Approved Purchases Card -->
        <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <app-icon name="check-circle" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Approved & Credited</p>
            <h3 class="text-2xl font-black text-slate-900 font-mono">
              {{ selectedCategory === 'SMS' ? approvedSmsCount() : (selectedCategory === 'MONITORING' ? approvedMonitoringCount() : (selectedCategory === 'EMAIL' ? approvedEmailCount() : approvedWhatsappCount())) }} Orders
            </h3>
          </div>
        </div>

        <!-- Total Bank Orders Card -->
        <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
            <app-icon name="credit-card" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Total Bank Orders</p>
            <h3 class="text-2xl font-black text-slate-900 font-mono">
              {{ selectedCategory === 'SMS' ? dataService.bankTransfers().length : (selectedCategory === 'MONITORING' ? dataService.monitoringBankTransfers().length : (selectedCategory === 'EMAIL' ? dataService.emailBankTransfers().length : dataService.whatsappBankTransfers().length)) }} Orders
            </h3>
            <p class="text-xs font-bold text-indigo-600 font-mono mt-0.5">Direct UTR Verifications</p>
          </div>
        </div>
      </div>

      <!-- Requests Table Section -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <!-- Filter Tabs & Search -->
        <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl">
            <button 
              (click)="activeFilter = 'ALL'"
              [class]="activeFilter === 'ALL' ? 'bg-white text-indigo-600 font-extrabold shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              class="px-3 py-1.5 rounded-lg text-xs transition-all">
              All
            </button>
            <button 
              (click)="activeFilter = 'PENDING'"
              [class]="activeFilter === 'PENDING' ? 'bg-amber-500 text-white font-extrabold shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              class="px-3 py-1.5 rounded-lg text-xs transition-all">
              Pending
            </button>
            <button 
              (click)="activeFilter = 'APPROVED'"
              [class]="activeFilter === 'APPROVED' ? 'bg-emerald-600 text-white font-extrabold shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              class="px-3 py-1.5 rounded-lg text-xs transition-all">
              Approved
            </button>
          </div>

          <div class="w-full sm:w-64">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search by Order, UTR, User..." 
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-500 transition-all">
          </div>
        </div>

        <!-- 1. SMS TABLE -->
        <div *ngIf="selectedCategory === 'SMS'" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200/70 bg-slate-50/50 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th class="py-3.5 px-4">Order / User</th>
                <th class="py-3.5 px-4">SMS Qty</th>
                <th class="py-3.5 px-4">Amount Breakdown</th>
                <th class="py-3.5 px-4">Total Payable</th>
                <th class="py-3.5 px-4">UTR Reference</th>
                <th class="py-3.5 px-4">Proof</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              <tr *ngFor="let req of filteredSmsRequests()" class="hover:bg-slate-50/80 transition-all">
                <td class="py-3.5 px-4">
                  <span class="font-mono font-extrabold text-indigo-600 block">{{ req.orderId }}</span>
                  <span class="font-bold text-slate-900 block">{{ req.userName }}</span>
                  <span class="text-[11px] text-slate-400 block">{{ req.companyName || req.userEmail }}</span>
                  <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">{{ req.requestDate | date:'short' }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-black text-slate-900 text-sm font-mono block">{{ req.smsQuantity | number }}</span>
                  <span class="text-[11px] text-slate-500 font-mono">&#64; ₹{{ req.ratePerSms | number:'1.2-4' }}/SMS</span>
                </td>
                <td class="py-3.5 px-4 font-mono text-[11px] space-y-0.5">
                  <div class="text-slate-600">Base: ₹{{ req.baseAmount | number:'1.2-2' }}</div>
                  <div class="text-slate-400 text-[10px]">GST 18%: ₹{{ req.gstAmount | number:'1.2-2' }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-extrabold text-slate-900 text-sm font-mono block">₹{{ req.totalAmount | number:'1.2-2' }}</span>
                  <span class="text-[10px] text-emerald-600 font-bold uppercase">{{ req.paymentStatus }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                    <span>{{ req.utrNumber }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <button 
                    *ngIf="req.paymentProof" 
                    (click)="viewProof(req.paymentProof, req.orderId)" 
                    class="btn btn-outline btn-sm text-[11px] py-1 px-2 flex items-center gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <app-icon name="file-text" [size]="12"></app-icon>
                    <span>View Proof</span>
                  </button>
                  <span *ngIf="!req.paymentProof" class="text-slate-400 text-[11px] italic">No proof</span>
                </td>
                <td class="py-3.5 px-4">
                  <span [class]="req.purchaseStatus === 'APPROVED' ? 'badge badge-active text-[10px]' : (req.purchaseStatus === 'PENDING' ? 'badge bg-amber-50 text-amber-700 border-amber-200 text-[10px]' : 'badge badge-suspended text-[10px]')">
                    {{ req.purchaseStatus }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div *ngIf="req.purchaseStatus === 'PENDING'" class="flex items-center justify-end gap-2">
                    <button (click)="openApproveSmsModal(req)" class="btn btn-primary btn-sm text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-xs">
                      <app-icon name="check" [size]="12"></app-icon>
                      <span>Approve</span>
                    </button>
                    <button (click)="openRejectSmsModal(req)" class="btn btn-outline btn-sm text-[11px] py-1 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50">
                      <app-icon name="x" [size]="12"></app-icon>
                      <span>Reject</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. WEBSITE MONITORING TABLE -->
        <div *ngIf="selectedCategory === 'MONITORING'" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200/70 bg-slate-50/50 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th class="py-3.5 px-4">Order / User</th>
                <th class="py-3.5 px-4">Monitoring Plan</th>
                <th class="py-3.5 px-4">Amount Breakdown</th>
                <th class="py-3.5 px-4">Total Payable</th>
                <th class="py-3.5 px-4">UTR Reference</th>
                <th class="py-3.5 px-4">Proof</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              <tr *ngFor="let ord of filteredMonitoringRequests()" class="hover:bg-slate-50/80 transition-all">
                <td class="py-3.5 px-4">
                  <span class="font-mono font-extrabold text-indigo-600 block">{{ ord.orderNumber }}</span>
                  <span class="font-bold text-slate-900 block">{{ ord.userName }}</span>
                  <span class="text-[11px] text-slate-400 block">{{ ord.companyName || ord.userEmail }}</span>
                  <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">{{ ord.createdAt | date:'short' }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-black text-slate-900 text-xs block">{{ ord.planName }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase mt-1 inline-block">
                    {{ ord.billingCycle }} Plan
                  </span>
                </td>
                <td class="py-3.5 px-4 font-mono text-[11px] space-y-0.5">
                  <div class="text-slate-600">Base: ₹{{ ord.baseAmount | number:'1.2-2' }}</div>
                  <div class="text-slate-400 text-[10px]">GST {{ ord.gstRate }}%: ₹{{ ord.gstAmount | number:'1.2-2' }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-extrabold text-slate-900 text-sm font-mono block">₹{{ ord.totalPayable | number:'1.2-2' }}</span>
                  <span class="text-[10px] text-emerald-600 font-bold uppercase">{{ ord.paymentStatus }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                    <span>{{ ord.utrNumber }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <button 
                    *ngIf="ord.paymentProof" 
                    (click)="viewProof(ord.paymentProof, ord.orderNumber)" 
                    class="btn btn-outline btn-sm text-[11px] py-1 px-2 flex items-center gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <app-icon name="file-text" [size]="12"></app-icon>
                    <span>View Proof</span>
                  </button>
                  <span *ngIf="!ord.paymentProof" class="text-slate-400 text-[11px] italic">No proof</span>
                </td>
                <td class="py-3.5 px-4">
                  <span [class]="ord.adminStatus === 'APPROVED' ? 'badge badge-active text-[10px]' : (ord.adminStatus === 'PENDING' ? 'badge bg-amber-50 text-amber-700 border-amber-200 text-[10px]' : 'badge badge-suspended text-[10px]')">
                    {{ ord.adminStatus }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div *ngIf="ord.adminStatus === 'PENDING'" class="flex items-center justify-end gap-2">
                    <button (click)="openApproveMonitoringModal(ord)" class="btn btn-primary btn-sm text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-xs">
                      <app-icon name="check" [size]="12"></app-icon>
                      <span>Approve</span>
                    </button>
                    <button (click)="openRejectMonitoringModal(ord)" class="btn btn-outline btn-sm text-[11px] py-1 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50">
                      <app-icon name="x" [size]="12"></app-icon>
                      <span>Reject</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredMonitoringRequests().length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  <p class="font-bold text-slate-600">No Monitoring Bank Transfers Found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. EMAIL CREDITS TABLE -->
        <div *ngIf="selectedCategory === 'EMAIL'" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200/70 bg-slate-50/50 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th class="py-3.5 px-4">Order / User</th>
                <th class="py-3.5 px-4">Email Qty</th>
                <th class="py-3.5 px-4">Amount Breakdown</th>
                <th class="py-3.5 px-4">Total Payable</th>
                <th class="py-3.5 px-4">UTR Reference</th>
                <th class="py-3.5 px-4">Proof</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              <tr *ngFor="let ord of filteredEmailRequests()" class="hover:bg-slate-50/80 transition-all">
                <td class="py-3.5 px-4">
                  <span class="font-mono font-extrabold text-indigo-600 block">{{ ord.orderNumber }}</span>
                  <span class="font-bold text-slate-900 block">{{ ord.userName }}</span>
                  <span class="text-[11px] text-slate-400 block">{{ ord.companyName || ord.userEmail }}</span>
                  <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">{{ ord.createdAt | date:'short' }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-black text-slate-900 text-sm font-mono block">{{ ord.emailQuantity | number }} Emails</span>
                  <span class="text-[11px] text-slate-500 font-mono">&#64; ₹{{ ord.ratePerEmail | number:'1.2-4' }}/Email</span>
                </td>
                <td class="py-3.5 px-4 font-mono text-[11px] space-y-0.5">
                  <div class="text-slate-600">Base: ₹{{ ord.baseAmount | number:'1.2-2' }}</div>
                  <div class="text-slate-400 text-[10px]">GST {{ ord.gstRate }}%: ₹{{ ord.gstAmount | number:'1.2-2' }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-extrabold text-slate-900 text-sm font-mono block">₹{{ ord.totalPayable | number:'1.2-2' }}</span>
                  <span class="text-[10px] text-emerald-600 font-bold uppercase">{{ ord.paymentStatus }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                    <span>{{ ord.utrNumber }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <button 
                    *ngIf="ord.paymentProof" 
                    (click)="viewProof(ord.paymentProof, ord.orderNumber)" 
                    class="btn btn-outline btn-sm text-[11px] py-1 px-2 flex items-center gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <app-icon name="file-text" [size]="12"></app-icon>
                    <span>View Proof</span>
                  </button>
                  <span *ngIf="!ord.paymentProof" class="text-slate-400 text-[11px] italic">No proof</span>
                </td>
                <td class="py-3.5 px-4">
                  <span [class]="ord.adminStatus === 'APPROVED' ? 'badge badge-active text-[10px]' : (ord.adminStatus === 'PENDING' ? 'badge bg-amber-50 text-amber-700 border-amber-200 text-[10px]' : 'badge badge-suspended text-[10px]')">
                    {{ ord.adminStatus }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div *ngIf="ord.adminStatus === 'PENDING'" class="flex items-center justify-end gap-2">
                    <button (click)="openApproveEmailModal(ord)" class="btn btn-primary btn-sm text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-xs">
                      <app-icon name="check" [size]="12"></app-icon>
                      <span>Approve</span>
                    </button>
                    <button (click)="openRejectEmailModal(ord)" class="btn btn-outline btn-sm text-[11px] py-1 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50">
                      <app-icon name="x" [size]="12"></app-icon>
                      <span>Reject</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredEmailRequests().length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  <p class="font-bold text-slate-600">No Email Credit Bank Transfers Found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. WHATSAPP CREDITS TABLE -->
        <div *ngIf="selectedCategory === 'WHATSAPP'" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">User Account</th>
                <th class="py-3 px-4">WhatsApp Credits</th>
                <th class="py-3 px-4">Rate & Pricing</th>
                <th class="py-3 px-4">Total Amount</th>
                <th class="py-3 px-4">UTR Number</th>
                <th class="py-3 px-4">Payment Proof</th>
                <th class="py-3 px-4">Admin Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              <tr *ngFor="let ord of filteredWhatsappRequests()" class="hover:bg-slate-50/60 transition-all">
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900">{{ ord.userName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">{{ ord.userEmail }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">Order: {{ ord.orderNumber }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-black text-emerald-600 font-mono text-sm block">{{ ord.credits || ord.quantity | number }} Credits</span>
                  <span class="text-[11px] text-slate-500 font-mono">&#64; ₹{{ ord.ratePerCredit | number:'1.2-4' }}/Msg</span>
                </td>
                <td class="py-3.5 px-4 font-mono text-[11px] space-y-0.5">
                  <div class="text-slate-600">Base: ₹{{ ord.baseAmount | number:'1.2-2' }}</div>
                  <div class="text-slate-400 text-[10px]">GST: ₹{{ ord.gstAmount | number:'1.2-2' }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-extrabold text-slate-900 text-sm font-mono block">₹{{ ord.totalPayable | number:'1.2-2' }}</span>
                  <span class="text-[10px] text-emerald-600 font-bold uppercase">{{ ord.paymentStatus }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                    <span>{{ ord.utrNumber }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <button 
                    *ngIf="ord.paymentProofUrl" 
                    (click)="viewProof(ord.paymentProofUrl, ord.orderNumber)" 
                    class="btn btn-outline btn-sm text-[11px] py-1 px-2 flex items-center gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <app-icon name="file-text" [size]="12"></app-icon>
                    <span>View Proof</span>
                  </button>
                  <span *ngIf="!ord.paymentProofUrl" class="text-slate-400 text-[11px] italic">No proof</span>
                </td>
                <td class="py-3.5 px-4">
                  <span [class]="ord.adminStatus === 'APPROVED' ? 'badge badge-active text-[10px]' : (ord.adminStatus === 'PENDING' ? 'badge bg-amber-50 text-amber-700 border-amber-200 text-[10px]' : 'badge badge-suspended text-[10px]')">
                    {{ ord.adminStatus }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div *ngIf="ord.adminStatus === 'PENDING'" class="flex items-center justify-end gap-2">
                    <button (click)="openApproveWhatsappModal(ord)" class="btn btn-primary btn-sm text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-xs">
                      <app-icon name="check" [size]="12"></app-icon>
                      <span>Approve</span>
                    </button>
                    <button (click)="openRejectWhatsappModal(ord)" class="btn btn-outline btn-sm text-[11px] py-1 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50">
                      <app-icon name="x" [size]="12"></app-icon>
                      <span>Reject</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredWhatsappRequests().length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  <p class="font-bold text-slate-600">No WhatsApp Credit Bank Transfers Found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modals -->
      <div *ngIf="showApproveSmsModal && selectedSmsReq" class="modal-backdrop" (click)="showApproveSmsModal = false">
        <div class="modal-card p-6 border border-slate-200 max-w-md bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <h3 class="text-base font-extrabold text-slate-900 mb-2">Approve SMS Bank Transfer</h3>
          <p class="text-xs text-slate-600 mb-4">Confirm approval for order: {{ selectedSmsReq.orderId }}</p>
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="showApproveSmsModal = false" class="btn btn-outline btn-sm">Cancel</button>
            <button (click)="confirmApproveSms()" [disabled]="isSubmitting" class="btn btn-primary btn-sm bg-emerald-600">Confirm</button>
          </div>
        </div>
      </div>

      <div *ngIf="showApproveMonitoringModal && selectedMonitoringReq" class="modal-backdrop" (click)="showApproveMonitoringModal = false">
        <div class="modal-card p-6 border border-slate-200 max-w-md bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <h3 class="text-base font-extrabold text-slate-900 mb-2">Approve Monitoring Subscription</h3>
          <p class="text-xs text-slate-600 mb-4">Activate plan for: {{ selectedMonitoringReq.userName }}</p>
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="showApproveMonitoringModal = false" class="btn btn-outline btn-sm">Cancel</button>
            <button (click)="confirmApproveMonitoring()" [disabled]="isSubmitting" class="btn btn-primary btn-sm bg-emerald-600">Activate</button>
          </div>
        </div>
      </div>

      <div *ngIf="showApproveEmailModal && selectedEmailReq" class="modal-backdrop" (click)="showApproveEmailModal = false">
        <div class="modal-card p-6 border border-slate-200 max-w-md bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <h3 class="text-base font-extrabold text-slate-900 mb-2">Approve Email Credit Bank Transfer</h3>
          <p class="text-xs text-slate-600 mb-4">
            Credit <strong>{{ selectedEmailReq.emailQuantity | number }} Email Credits</strong> to {{ selectedEmailReq.userName }} (Order: {{ selectedEmailReq.orderNumber }})
          </p>
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="showApproveEmailModal = false" class="btn btn-outline btn-sm">Cancel</button>
            <button (click)="confirmApproveEmail()" [disabled]="isSubmitting" class="btn btn-primary btn-sm bg-emerald-600">Credit Emails</button>
          </div>
        </div>
      </div>

      <div *ngIf="showApproveWhatsappModal && selectedWhatsappReq" class="modal-backdrop" (click)="showApproveWhatsappModal = false">
        <div class="modal-card p-6 border border-slate-200 max-w-md bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <h3 class="text-base font-extrabold text-slate-900 mb-2">Approve WhatsApp Credit Bank Transfer</h3>
          <p class="text-xs text-slate-600 mb-4">
            Credit <strong>{{ (selectedWhatsappReq.credits || selectedWhatsappReq.quantity) | number }} WhatsApp Credits</strong> to {{ selectedWhatsappReq.userName }} (Order: {{ selectedWhatsappReq.orderNumber }})
          </p>
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="showApproveWhatsappModal = false" class="btn btn-outline btn-sm">Cancel</button>
            <button (click)="confirmApproveWhatsapp()" [disabled]="isSubmitting" class="btn btn-primary btn-sm bg-emerald-600">Credit WhatsApp</button>
          </div>
        </div>
      </div>

      <div *ngIf="showRejectModal" class="modal-backdrop" (click)="showRejectModal = false">
        <div class="modal-card p-6 border border-slate-200 max-w-md bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <h3 class="text-base font-extrabold text-slate-900 mb-2">Reject Bank Transfer</h3>
          <textarea [(ngModel)]="rejectionRemarks" class="w-full p-2 border border-slate-200 rounded-lg text-xs" placeholder="Reason for rejection..."></textarea>
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="showRejectModal = false" class="btn btn-outline btn-sm">Cancel</button>
            <button (click)="confirmReject()" [disabled]="isSubmitting" class="btn btn-primary btn-sm bg-rose-600">Reject</button>
          </div>
        </div>
      </div>

      <div *ngIf="showProofModal" class="modal-backdrop" (click)="showProofModal = false">
        <div class="modal-card p-6 border border-slate-200 max-w-lg bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
           <div class="flex items-center justify-between pb-3 border-b border-slate-100">
             <h3 class="text-base font-extrabold text-slate-900">Payment Proof</h3>
             <button (click)="showProofModal = false" class="text-slate-400">Close</button>
           </div>
           <div class="py-4">
             <img [src]="currentProofSrc" class="max-h-96 w-full object-contain" *ngIf="currentProofSrc">
           </div>
        </div>
      </div>
    </div>
  `
})
export class BankTransfersComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  authService = inject(AuthService);
  private http = inject(HttpClient);

  selectedCategory: 'SMS' | 'MONITORING' | 'EMAIL' | 'WHATSAPP' = 'SMS';
  activeFilter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL';
  searchQuery = '';

  showApproveSmsModal = false;
  showApproveMonitoringModal = false;
  showApproveEmailModal = false;
  showApproveWhatsappModal = false;
  showRejectModal = false;
  showProofModal = false;

  selectedSmsReq: BankTransferRequest | null = null;
  selectedMonitoringReq: any | null = null;
  selectedEmailReq: any | null = null;
  selectedWhatsappReq: any | null = null;
  activeProofOrderId = '';

  rejectionRemarks = '';
  rejectError = '';
  isSubmitting = false;
  isTogglingManualPayment = false;
  
  currentProofSrc = '';
  imageLoaded = false;
  isLoadingBlob = false;
  imageAttemptCount = 0;
  private currentObjectUrl: string | null = null;

  ngOnInit() {
    const saved = localStorage.getItem('alert21_admin_bank_transfer_category');
    if (saved && ['SMS', 'MONITORING', 'EMAIL', 'WHATSAPP'].includes(saved)) {
      this.selectedCategory = saved as any;
    }
    this.refreshAll();
  }

  setCategory(cat: 'SMS' | 'MONITORING' | 'EMAIL' | 'WHATSAPP') {
    this.selectedCategory = cat;
    localStorage.setItem('alert21_admin_bank_transfer_category', cat);
  }

  ngOnDestroy() {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }
  }

  refreshAll() {
    this.dataService.fetchPaymentSettings();
    this.dataService.fetchLiveBankTransfers();
    this.dataService.fetchMonitoringBankTransfers();
    this.dataService.fetchEmailBankTransfers();
    this.dataService.fetchWhatsappBankTransfers();
  }

  async toggleManualPaymentSetting(field: 'allow_manual_payment' | 'allow_whatsapp_manual_payment' | 'allow_sms_manual_payment' | 'allow_email_manual_payment' | 'allow_monitoring_manual_payment') {
    const current = this.dataService.paymentSettings();
    const newVal = !current[field];
    this.isTogglingManualPayment = true;
    try {
      await this.dataService.updatePaymentSettings({
        [field]: newVal
      });
    } finally {
      this.isTogglingManualPayment = false;
    }
  }

  getProofUrl(proof?: string): string {
    if (!proof) return '';
    if (proof.startsWith('http://') || proof.startsWith('https://') || proof.startsWith('data:')) return proof;
    const clean = proof.startsWith('/') ? proof : `/${proof}`;
    return `https://app.alert21.in/back${clean}`;
  }

  onImageError(event: any) {
    this.imageAttemptCount++;
    const target = event.target as HTMLImageElement;
    const current = target.src;
    if (this.imageAttemptCount === 1 && current.includes('/back/uploads/')) {
      this.currentProofSrc = current.replace('/back/uploads/', '/uploads/');
    } else if (this.imageAttemptCount === 2 && current.includes('/uploads/')) {
      this.currentProofSrc = current.replace('/uploads/', '/back/api/uploads/');
    }
  }

  async viewProof(rawProof: string, orderId: string) {
    this.activeProofOrderId = orderId;
    this.imageLoaded = false;
    this.imageAttemptCount = 0;
    this.showProofModal = true;
    if (!rawProof) { this.currentProofSrc = ''; return; }
    if (rawProof.startsWith('data:') || rawProof.startsWith('blob:')) { this.currentProofSrc = rawProof; return; }
    this.isLoadingBlob = true;
    const token = this.authService.authToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const candidates = [
      this.getProofUrl(rawProof),
      rawProof.startsWith('http') ? rawProof : `https://app.alert21.in/back${rawProof.startsWith('/') ? '' : '/'}${rawProof}`,
      rawProof.startsWith('http') ? rawProof : `https://app.alert21.in${rawProof.startsWith('/') ? '' : '/'}${rawProof}`
    ];
    let success = false;
    for (const url of candidates) {
      try {
        const blob = await firstValueFrom(this.http.get(url, { headers, responseType: 'blob' }));
        if (blob && blob.size > 0) {
          if (this.currentObjectUrl) URL.revokeObjectURL(this.currentObjectUrl);
          this.currentObjectUrl = URL.createObjectURL(blob);
          this.currentProofSrc = this.currentObjectUrl;
          this.imageLoaded = true;
          this.isLoadingBlob = false;
          success = true;
          break;
        }
      } catch (e) {}
    }
    if (!success) {
      this.currentProofSrc = this.getProofUrl(rawProof);
      this.isLoadingBlob = false;
    }
  }

  pendingSmsCount() { return this.dataService.bankTransfers().filter(t => t.purchaseStatus === 'PENDING').length; }
  approvedSmsCount() { return this.dataService.bankTransfers().filter(t => t.purchaseStatus === 'APPROVED').length; }
  pendingMonitoringCount() { return this.dataService.monitoringBankTransfers().filter(t => t.adminStatus === 'PENDING').length; }
  approvedMonitoringCount() { return this.dataService.monitoringBankTransfers().filter(t => t.adminStatus === 'APPROVED').length; }
  pendingEmailCount() { return this.dataService.emailBankTransfers().filter(t => t.adminStatus === 'PENDING').length; }
  approvedEmailCount() { return this.dataService.emailBankTransfers().filter(t => t.adminStatus === 'APPROVED').length; }
  pendingWhatsappCount() { return this.dataService.whatsappBankTransfers().filter(t => t.adminStatus === 'PENDING').length; }
  approvedWhatsappCount() { return this.dataService.whatsappBankTransfers().filter(t => t.adminStatus === 'APPROVED').length; }

  filteredSmsRequests() {
    return this.dataService.bankTransfers().filter(req => {
      if (this.activeFilter !== 'ALL' && req.purchaseStatus !== this.activeFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return (req.orderId || '').toLowerCase().includes(q) || (req.utrNumber || '').toLowerCase().includes(q) || (req.userName || '').toLowerCase().includes(q) || (req.userEmail || '').toLowerCase().includes(q);
      }
      return true;
    });
  }

  filteredMonitoringRequests() {
    return this.dataService.monitoringBankTransfers().filter(req => {
      if (this.activeFilter !== 'ALL' && req.adminStatus !== this.activeFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return (req.orderNumber || '').toLowerCase().includes(q) || (req.utrNumber || '').toLowerCase().includes(q) || (req.userName || '').toLowerCase().includes(q) || (req.userEmail || '').toLowerCase().includes(q) || (req.planName || '').toLowerCase().includes(q);
      }
      return true;
    });
  }

  filteredEmailRequests() {
    return this.dataService.emailBankTransfers().filter(req => {
      if (this.activeFilter !== 'ALL' && req.adminStatus !== this.activeFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return (req.orderNumber || '').toLowerCase().includes(q) || (req.utrNumber || '').toLowerCase().includes(q) || (req.userName || '').toLowerCase().includes(q) || (req.userEmail || '').toLowerCase().includes(q);
      }
      return true;
    });
  }

  filteredWhatsappRequests() {
    return this.dataService.whatsappBankTransfers().filter(req => {
      if (this.activeFilter !== 'ALL' && req.adminStatus !== this.activeFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return (req.orderNumber || '').toLowerCase().includes(q) || (req.utrNumber || '').toLowerCase().includes(q) || (req.userName || '').toLowerCase().includes(q) || (req.userEmail || '').toLowerCase().includes(q);
      }
      return true;
    });
  }

  openApproveSmsModal(req: BankTransferRequest) { this.selectedSmsReq = req; this.showApproveSmsModal = true; }
  async confirmApproveSms() {
    if (!this.selectedSmsReq) return;
    this.isSubmitting = true;
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    const success = await this.dataService.approveBankTransfer(this.selectedSmsReq.id, this.selectedSmsReq.orderId, adminName);
    this.isSubmitting = false;
    if (success) { this.showApproveSmsModal = false; this.selectedSmsReq = null; }
  }

  openApproveMonitoringModal(ord: any) { this.selectedMonitoringReq = ord; this.showApproveMonitoringModal = true; }
  async confirmApproveMonitoring() {
    if (!this.selectedMonitoringReq) return;
    this.isSubmitting = true;
    const success = await this.dataService.approveMonitoringBankTransfer(this.selectedMonitoringReq.id);
    this.isSubmitting = false;
    if (success) { this.showApproveMonitoringModal = false; this.selectedMonitoringReq = null; }
  }

  openApproveEmailModal(ord: any) { this.selectedEmailReq = ord; this.showApproveEmailModal = true; }
  async confirmApproveEmail() {
    if (!this.selectedEmailReq) return;
    this.isSubmitting = true;
    const success = await this.dataService.approveEmailBankTransfer(this.selectedEmailReq.id);
    this.isSubmitting = false;
    if (success) { this.showApproveEmailModal = false; this.selectedEmailReq = null; }
  }

  openApproveWhatsappModal(ord: any) { this.selectedWhatsappReq = ord; this.showApproveWhatsappModal = true; }
  async confirmApproveWhatsapp() {
    if (!this.selectedWhatsappReq) return;
    this.isSubmitting = true;
    const success = await this.dataService.approveWhatsappBankTransfer(this.selectedWhatsappReq.id);
    this.isSubmitting = false;
    if (success) { this.showApproveWhatsappModal = false; this.selectedWhatsappReq = null; }
  }

  openRejectSmsModal(req: BankTransferRequest) { this.selectedSmsReq = req; this.selectedMonitoringReq = null; this.selectedEmailReq = null; this.selectedWhatsappReq = null; this.rejectionRemarks = ''; this.rejectError = ''; this.showRejectModal = true; }
  openRejectMonitoringModal(ord: any) { this.selectedMonitoringReq = ord; this.selectedSmsReq = null; this.selectedEmailReq = null; this.selectedWhatsappReq = null; this.rejectionRemarks = ''; this.rejectError = ''; this.showRejectModal = true; }
  openRejectEmailModal(ord: any) { this.selectedEmailReq = ord; this.selectedSmsReq = null; this.selectedMonitoringReq = null; this.selectedWhatsappReq = null; this.rejectionRemarks = ''; this.rejectError = ''; this.showRejectModal = true; }
  openRejectWhatsappModal(ord: any) { this.selectedWhatsappReq = ord; this.selectedSmsReq = null; this.selectedMonitoringReq = null; this.selectedEmailReq = null; this.rejectionRemarks = ''; this.rejectError = ''; this.showRejectModal = true; }

  async confirmReject() {
    if (!this.rejectionRemarks.trim()) { this.rejectError = 'Rejection reason is mandatory.'; return; }
    this.isSubmitting = true;
    this.rejectError = '';
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    let success = false;
    if (this.selectedSmsReq) {
      success = await this.dataService.rejectBankTransfer(this.selectedSmsReq.id, this.rejectionRemarks, this.selectedSmsReq.orderId, adminName);
      if (success) this.selectedSmsReq = null;
    } else if (this.selectedMonitoringReq) {
      success = await this.dataService.rejectMonitoringBankTransfer(this.selectedMonitoringReq.id, this.rejectionRemarks);
      if (success) this.selectedMonitoringReq = null;
    } else if (this.selectedEmailReq) {
      success = await this.dataService.rejectEmailBankTransfer(this.selectedEmailReq.id, this.rejectionRemarks);
      if (success) this.selectedEmailReq = null;
    } else if (this.selectedWhatsappReq) {
      success = await this.dataService.rejectWhatsappBankTransfer(this.selectedWhatsappReq.id, this.rejectionRemarks);
      if (success) this.selectedWhatsappReq = null;
    }
    this.isSubmitting = false;
    if (success) this.showRejectModal = false;
  }
}
