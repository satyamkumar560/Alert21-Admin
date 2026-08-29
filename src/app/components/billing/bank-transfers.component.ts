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
          <p class="text-xs text-slate-500 font-medium">Review, verify UTR reference numbers, and approve offline SMS purchase payments.</p>
        </div>

        <button (click)="dataService.fetchLiveBankTransfers()" class="btn btn-outline shadow-sm flex items-center gap-2">
          <app-icon name="rotate-cw" [size]="14"></app-icon>
          <span>Refresh Requests</span>
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
            <h3 class="text-2xl font-black text-slate-900 font-mono">{{ pendingCount() }} Requests</h3>
          </div>
        </div>

        <!-- Approved Purchases Card -->
        <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <app-icon name="check-circle" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Approved & Credited</p>
            <h3 class="text-2xl font-black text-slate-900 font-mono">{{ approvedCount() }} Orders</h3>
          </div>
        </div>

        <!-- Total Bank Orders Card -->
        <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
            <app-icon name="credit-card" [size]="22"></app-icon>
          </div>
          <div>
            <p class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Total Bank Orders</p>
            <h3 class="text-2xl font-black text-slate-900 font-mono">{{ dataService.bankTransfers().length }} Orders</h3>
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
              All ({{ dataService.bankTransfers().length }})
            </button>
            <button 
              (click)="activeFilter = 'PENDING'"
              [class]="activeFilter === 'PENDING' ? 'bg-amber-500 text-white font-extrabold shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              class="px-3 py-1.5 rounded-lg text-xs transition-all">
              Pending ({{ pendingCount() }})
            </button>
            <button 
              (click)="activeFilter = 'APPROVED'"
              [class]="activeFilter === 'APPROVED' ? 'bg-emerald-600 text-white font-extrabold shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              class="px-3 py-1.5 rounded-lg text-xs transition-all">
              Approved
            </button>
            <button 
              (click)="activeFilter = 'REJECTED'"
              [class]="activeFilter === 'REJECTED' ? 'bg-rose-600 text-white font-extrabold shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              class="px-3 py-1.5 rounded-lg text-xs transition-all">
              Rejected
            </button>
          </div>

          <div class="w-full sm:w-64">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search by Order ID, UTR, User..." 
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-500 transition-all">
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
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
              <tr *ngFor="let req of filteredRequests()" class="hover:bg-slate-50/80 transition-all">
                <!-- Order ID & User Details -->
                <td class="py-3.5 px-4">
                  <span class="font-mono font-extrabold text-indigo-600 block">{{ req.orderId }}</span>
                  <span class="font-bold text-slate-900 block">{{ req.userName }}</span>
                  <span class="text-[11px] text-slate-400 block">{{ req.companyName || req.userEmail }}</span>
                  <span class="text-[10px] text-slate-400 font-mono mt-0.5 block">{{ req.requestDate | date:'short' }}</span>
                </td>

                <!-- SMS Quantity -->
                <td class="py-3.5 px-4">
                  <span class="font-black text-slate-900 text-sm font-mono block">{{ req.smsQuantity | number }}</span>
                  <span class="text-[11px] text-slate-500 font-mono">&#64; ₹{{ req.ratePerSms | number:'1.2-4' }}/SMS</span>
                </td>

                <!-- Base Amount & GST -->
                <td class="py-3.5 px-4 font-mono text-[11px] space-y-0.5">
                  <div class="text-slate-600">Base: ₹{{ req.baseAmount | number:'1.2-2' }}</div>
                  <div class="text-slate-400 text-[10px]">GST 18%: ₹{{ req.gstAmount | number:'1.2-2' }}</div>
                </td>

                <!-- Total Amount -->
                <td class="py-3.5 px-4">
                  <span class="font-extrabold text-slate-900 text-sm font-mono block">₹{{ req.totalAmount | number:'1.2-2' }}</span>
                  <span class="text-[10px] text-emerald-600 font-bold uppercase">{{ req.paymentStatus }}</span>
                </td>

                <!-- UTR Number -->
                <td class="py-3.5 px-4">
                  <div class="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                    <span>{{ req.utrNumber }}</span>
                  </div>
                  <span *ngIf="req.paymentDate" class="text-[10px] text-slate-400 block mt-0.5">Paid: {{ req.paymentDate | date:'mediumDate' }}</span>
                </td>

                <!-- Payment Proof -->
                <td class="py-3.5 px-4">
                  <button 
                    *ngIf="req.paymentProof" 
                    (click)="viewProof(req)" 
                    class="btn btn-outline btn-sm text-[11px] py-1 px-2 flex items-center gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <app-icon name="file-text" [size]="12"></app-icon>
                    <span>View Proof</span>
                  </button>
                  <span *ngIf="!req.paymentProof" class="text-slate-400 text-[11px] italic">No proof</span>
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span 
                    [class]="req.purchaseStatus === 'APPROVED' ? 'badge badge-active text-[10px]' : (req.purchaseStatus === 'PENDING' ? 'badge bg-amber-50 text-amber-700 border-amber-200 text-[10px]' : 'badge badge-suspended text-[10px]')">
                    {{ req.purchaseStatus }}
                  </span>
                  <p *ngIf="req.approvedBy" class="text-[10px] text-slate-400 mt-0.5">By: {{ req.approvedBy }}</p>
                  <p *ngIf="req.rejectionRemarks" class="text-[10px] text-rose-600 mt-0.5 truncate max-w-xs" [title]="req.rejectionRemarks">Reason: {{ req.rejectionRemarks }}</p>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div *ngIf="req.purchaseStatus === 'PENDING'" class="flex items-center justify-end gap-2">
                    <button (click)="openApproveModal(req)" class="btn btn-primary btn-sm text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-xs">
                      <app-icon name="check" [size]="12"></app-icon>
                      <span>Approve</span>
                    </button>

                    <button (click)="openRejectModal(req)" class="btn btn-outline btn-sm text-[11px] py-1 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50">
                      <app-icon name="x" [size]="12"></app-icon>
                      <span>Reject</span>
                    </button>
                  </div>

                  <span *ngIf="req.purchaseStatus !== 'PENDING'" class="text-slate-400 text-xs italic">
                    Resolved
                  </span>
                </td>
              </tr>

              <tr *ngIf="filteredRequests().length === 0">
                <td colspan="8" class="py-10 text-center text-slate-400 text-xs font-medium">
                  No bank transfer requests found matching current filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Approve Confirmation Modal -->
      <div *ngIf="showApproveModal && selectedReq" class="modal-backdrop" (click)="showApproveModal = false">
        <div class="modal-card p-6 border border-slate-200 max-w-md bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <app-icon name="check-circle" [size]="20"></app-icon>
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Approve Bank Transfer Request</h3>
              <p class="text-xs text-slate-500">Order: {{ selectedReq.orderId }}</p>
            </div>
          </div>

          <div class="py-4 space-y-3 font-sans text-xs">
            <p class="text-slate-600 leading-relaxed">
              Are you sure you want to approve this offline bank payment? This will mark the order as <strong>PAID</strong> and immediately credit <strong>{{ selectedReq.smsQuantity | number }} SMS units</strong> to user <strong>{{ selectedReq.userName }}</strong>.
            </p>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 font-mono">
              <div class="flex justify-between text-slate-600">
                <span>UTR Reference:</span>
                <span class="font-bold text-slate-900">{{ selectedReq.utrNumber }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Total Amount Received:</span>
                <span class="font-bold text-emerald-600">₹{{ selectedReq.totalAmount | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>SMS Units to Credit:</span>
                <span class="font-bold text-indigo-600">{{ selectedReq.smsQuantity | number }} SMS</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="showApproveModal = false" class="btn btn-outline btn-sm">Cancel</button>
            <button (click)="confirmApprove()" [disabled]="isSubmitting" class="btn btn-primary btn-sm bg-emerald-600 hover:bg-emerald-700 border-emerald-600">
              {{ isSubmitting ? 'Approving...' : 'Confirm & Credit SMS' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Reject Request Modal with Mandatory Remarks -->
      <div *ngIf="showRejectModal && selectedReq" class="modal-backdrop" (click)="showRejectModal = false">
        <div class="modal-card p-6 border border-slate-200 max-w-md bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <app-icon name="alert-triangle" [size]="20"></app-icon>
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Reject Bank Transfer</h3>
              <p class="text-xs text-slate-500">Order: {{ selectedReq.orderId }}</p>
            </div>
          </div>

          <div class="py-4 space-y-4">
            <p class="text-xs text-slate-600">
              Please enter the reason for rejection (e.g. UTR mismatch, payment not received in bank account). Rejection remarks are mandatory.
            </p>

            <div class="form-group">
              <label class="form-label">Rejection Reason / Remarks: <span class="text-rose-500">*</span></label>
              <textarea 
                [(ngModel)]="rejectionRemarks" 
                rows="3" 
                class="form-control text-xs font-sans" 
                placeholder="e.g. UTR reference not found in bank statement.">
              </textarea>
            </div>

            <div *ngIf="rejectError" class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {{ rejectError }}
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="showRejectModal = false" class="btn btn-outline btn-sm">Cancel</button>
            <button (click)="confirmReject()" [disabled]="isSubmitting" class="btn btn-primary btn-sm bg-rose-600 hover:bg-rose-700 border-rose-600">
              {{ isSubmitting ? 'Rejecting...' : 'Reject Request' }}
            </button>
          </div>
        </div>
      </div>

      <!-- View Proof Modal -->
      <div *ngIf="showProofModal && selectedReq" class="modal-backdrop" (click)="showProofModal = false">
        <div class="modal-card p-6 border border-slate-200 max-w-lg bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Payment Receipt / Proof</h3>
              <p class="text-xs text-slate-500 font-mono">UTR: {{ selectedReq.utrNumber }}</p>
            </div>
            <button (click)="showProofModal = false" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="py-4 text-center space-y-4">
            <!-- Loading Indicator -->
            <div *ngIf="isLoadingBlob" class="py-12 flex flex-col items-center justify-center gap-3">
              <div class="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs text-slate-500 font-medium">Loading payment proof receipt...</p>
            </div>

            <!-- Receipt Image Box (Visible if proof exists and loaded) -->
            <div *ngIf="selectedReq.paymentProof && !isLoadingBlob" class="relative bg-slate-50 border border-slate-200 rounded-2xl p-2 min-h-[160px] flex items-center justify-center overflow-hidden">
              <img 
                [src]="currentProofSrc" 
                (error)="onImageError($event)"
                (load)="imageLoaded = true"
                alt="Payment Receipt Proof" 
                class="max-h-[380px] w-auto max-w-full mx-auto rounded-xl object-contain shadow-xs">
            </div>

            <div *ngIf="!selectedReq.paymentProof && !isLoadingBlob" class="p-6 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium italic">
              No receipt attachment uploaded with this request.
            </div>

            <div *ngIf="selectedReq.paymentProof && !isLoadingBlob" class="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <a 
                [href]="currentProofSrc" 
                target="_blank" 
                class="btn btn-primary btn-sm text-xs inline-flex items-center gap-1.5 font-bold shadow-xs">
                <app-icon name="external-link" [size]="14"></app-icon>
                <span>Open / Zoom Receipt (New Window)</span>
              </a>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex justify-end">
            <button (click)="showProofModal = false" class="btn btn-outline btn-sm">Close</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BankTransfersComponent implements OnInit, OnDestroy {
  http = inject(HttpClient);
  dataService = inject(DataService);
  authService = inject(AuthService);

  activeFilter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL';
  searchQuery = '';

  showApproveModal = false;
  showRejectModal = false;
  showProofModal = false;

  selectedReq: BankTransferRequest | null = null;
  rejectionRemarks = '';
  rejectError = '';
  isSubmitting = false;
  
  currentProofSrc = '';
  imageLoaded = false;
  isLoadingBlob = false;
  imageAttemptCount = 0;
  private currentObjectUrl: string | null = null;

  getProofUrl(proof?: string): string {
    if (!proof) return '';
    if (proof.startsWith('http://') || proof.startsWith('https://') || proof.startsWith('data:')) {
      return proof;
    }
    const clean = proof.startsWith('/') ? proof : `/${proof}`;
    return `https://app.alert21.in/back${clean}`;
  }

  getFileName(proof?: string): string {
    if (!proof) return 'Payment Receipt';
    const parts = proof.split('/');
    return parts[parts.length - 1] || 'Payment Receipt';
  }

  onImageError(event: any) {
    this.imageAttemptCount++;
    const target = event.target as HTMLImageElement;
    const current = target.src;

    if (this.imageAttemptCount === 1 && current.includes('/back/uploads/')) {
      this.currentProofSrc = current.replace('/back/uploads/', '/uploads/');
    } else if (this.imageAttemptCount === 2 && current.includes('/uploads/')) {
      this.currentProofSrc = current.replace('/uploads/', '/back/api/uploads/');
    } else if (this.imageAttemptCount === 3 && current.includes('/back/api/uploads/')) {
      this.currentProofSrc = current.replace('/back/api/uploads/', '/alert/uploads/');
    }
  }

  ngOnInit() {
    this.dataService.fetchLiveBankTransfers();
  }

  ngOnDestroy() {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }
  }

  async viewProof(req: BankTransferRequest) {
    this.selectedReq = req;
    this.imageLoaded = false;
    this.imageAttemptCount = 0;
    this.showProofModal = true;

    const rawProof = req.paymentProof || '';
    if (!rawProof) {
      this.currentProofSrc = '';
      return;
    }

    if (rawProof.startsWith('data:') || rawProof.startsWith('blob:')) {
      this.currentProofSrc = rawProof;
      return;
    }

    this.isLoadingBlob = true;
    const token = this.authService.authToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const candidates = [
      this.getProofUrl(rawProof),
      rawProof.startsWith('http') ? rawProof : `https://app.alert21.in/back${rawProof.startsWith('/') ? '' : '/'}${rawProof}`,
      rawProof.startsWith('http') ? rawProof : `https://app.alert21.in${rawProof.startsWith('/') ? '' : '/'}${rawProof}`,
      rawProof.startsWith('http') ? rawProof : `https://app.alert21.in/back/api${rawProof.startsWith('/') ? '' : '/'}${rawProof}`,
      rawProof.startsWith('http') ? rawProof : `https://app.alert21.in/alert${rawProof.startsWith('/') ? '' : '/'}${rawProof}`
    ];

    let success = false;
    for (const url of candidates) {
      try {
        const blob = await firstValueFrom(this.http.get(url, { headers, responseType: 'blob' }));
        if (blob && blob.size > 0) {
          if (this.currentObjectUrl) {
            URL.revokeObjectURL(this.currentObjectUrl);
          }
          this.currentObjectUrl = URL.createObjectURL(blob);
          this.currentProofSrc = this.currentObjectUrl;
          this.imageLoaded = true;
          this.isLoadingBlob = false;
          success = true;
          break;
        }
      } catch (e) {
        // try next candidate
      }
    }

    if (!success) {
      this.currentProofSrc = this.getProofUrl(rawProof);
      this.isLoadingBlob = false;
    }
  }

  pendingCount() {
    return this.dataService.bankTransfers().filter(t => t.purchaseStatus === 'PENDING').length;
  }

  pendingAmount() {
    return this.dataService.bankTransfers()
      .filter(t => t.purchaseStatus === 'PENDING')
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  }

  approvedCount() {
    return this.dataService.bankTransfers().filter(t => t.purchaseStatus === 'APPROVED').length;
  }

  approvedAmount() {
    return this.dataService.bankTransfers()
      .filter(t => t.purchaseStatus === 'APPROVED')
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  }

  filteredRequests() {
    return this.dataService.bankTransfers().filter(req => {
      if (this.activeFilter !== 'ALL' && req.purchaseStatus !== this.activeFilter) {
        return false;
      }
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const orderMatch = (req.orderId || '').toLowerCase().includes(q);
        const utrMatch = (req.utrNumber || '').toLowerCase().includes(q);
        const userMatch = (req.userName || '').toLowerCase().includes(q) || (req.userEmail || '').toLowerCase().includes(q);
        return orderMatch || utrMatch || userMatch;
      }
      return true;
    });
  }

  openApproveModal(req: BankTransferRequest) {
    this.selectedReq = req;
    this.showApproveModal = true;
  }

  async confirmApprove() {
    if (!this.selectedReq) return;
    this.isSubmitting = true;
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    const success = await this.dataService.approveBankTransfer(this.selectedReq.id, this.selectedReq.orderId, adminName);
    this.isSubmitting = false;
    if (success) {
      this.showApproveModal = false;
      this.selectedReq = null;
    }
  }

  openRejectModal(req: BankTransferRequest) {
    this.selectedReq = req;
    this.rejectionRemarks = '';
    this.rejectError = '';
    this.showRejectModal = true;
  }

  async confirmReject() {
    if (!this.selectedReq) return;
    if (!this.rejectionRemarks.trim()) {
      this.rejectError = 'Rejection reason is mandatory.';
      return;
    }

    this.isSubmitting = true;
    this.rejectError = '';
    const adminName = this.authService.currentAdmin()?.name || 'Admin';
    const success = await this.dataService.rejectBankTransfer(this.selectedReq.id, this.rejectionRemarks, this.selectedReq.orderId, adminName);
    this.isSubmitting = false;
    if (success) {
      this.showRejectModal = false;
      this.selectedReq = null;
    }
  }
}
