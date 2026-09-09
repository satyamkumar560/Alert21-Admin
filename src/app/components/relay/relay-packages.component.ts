import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { RelayService } from '../../services/relay.service';
import { RelayPackagePlan, RelaySubscription } from '../../models/alert21.models';

@Component({
  selector: 'app-relay-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Relay Packages & Subscriptions</h2>
          <p class="text-xs text-slate-500 font-medium">
            Configure monthly & annual subscription plans, device limits, message type caps, monthly event quota, and customer limit overrides.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="openAddPackageModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all">
            <app-icon name="plus" [size]="14"></app-icon>
            <span>Create Plan Tier</span>
          </button>
        </div>
      </div>

      <!-- Navigation Sub-tabs -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button 
          (click)="activeTab = 'packages'"
          [class]="activeTab === 'packages' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
          <app-icon name="tag" [size]="14"></app-icon>
          <span>Package Plans</span>
          <span class="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">{{ relayService.packages().length }}</span>
        </button>

        <button 
          (click)="activeTab = 'subscriptions'"
          [class]="activeTab === 'subscriptions' ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
          <app-icon name="users" [size]="14"></app-icon>
          <span>Customer Subscriptions</span>
          <span class="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">{{ relayService.subscriptions().length }}</span>
        </button>
      </div>

      <!-- 1. PACKAGES GRID -->
      <div *ngIf="activeTab === 'packages'" class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div *ngFor="let pkg of relayService.packages()" class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-indigo-400 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[10px] font-extrabold uppercase">
                {{ pkg.planCode }}
              </span>
              <span class="text-xs font-bold text-slate-400 font-mono">
                {{ pkg.activeSubscribersCount || 0 }} subscribers
              </span>
            </div>

            <h3 class="text-lg font-extrabold text-slate-900 mt-2">{{ pkg.name }}</h3>

            <!-- Price Hero -->
            <div class="mt-3 flex items-baseline gap-1">
              <span class="text-sm font-bold text-slate-500">₹</span>
              <span class="text-3xl font-black text-slate-900 font-mono">{{ pkg.priceMonthly | number }}</span>
              <span class="text-xs font-semibold text-slate-400">/ month</span>
            </div>
            <p class="text-[11px] text-slate-400 font-mono mt-0.5">Annual: ₹ {{ pkg.priceAnnual | number }} / yr</p>

            <!-- Feature Limits List -->
            <div class="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div class="flex items-center justify-between text-slate-700">
                <span class="text-slate-500 font-medium">Max Android Devices:</span>
                <strong class="font-mono text-indigo-600 font-bold">{{ pkg.maxDevices }} Devices</strong>
              </div>
              <div class="flex items-center justify-between text-slate-700">
                <span class="text-slate-500 font-medium">Active Message Types:</span>
                <strong class="font-mono text-indigo-600 font-bold">{{ pkg.maxActiveMessageTypes }} Types</strong>
              </div>
              <div class="flex items-center justify-between text-slate-700">
                <span class="text-slate-500 font-medium">Included Events / Mo:</span>
                <strong class="font-mono text-emerald-600 font-bold">{{ pkg.includedEvents | number }}</strong>
              </div>
              <div class="flex items-center justify-between text-slate-700">
                <span class="text-slate-500 font-medium">Webhooks & API Keys:</span>
                <span class="font-mono font-bold">{{ pkg.maxWebhooks }} WH / {{ pkg.maxApiKeys }} Keys</span>
              </div>
              <div class="flex items-center justify-between text-slate-700">
                <span class="text-slate-500 font-medium">Log Retention:</span>
                <span class="font-mono font-bold">{{ pkg.retentionDays }} Days</span>
              </div>
              <div class="flex items-center justify-between text-slate-700">
                <span class="text-slate-500 font-medium">Overage Rate:</span>
                <span class="font-mono text-amber-600 font-bold">₹ {{ pkg.overagePricePerEvent }} / event</span>
              </div>
            </div>
          </div>

          <button (click)="openEditPackageModal(pkg)" class="w-full py-2 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5">
            <app-icon name="edit" [size]="12"></app-icon>
            <span>Edit Plan Limits</span>
          </button>
        </div>
      </div>

      <!-- 2. SUBSCRIPTIONS TABLE -->
      <div *ngIf="activeTab === 'subscriptions'" class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Customer Account</th>
                <th class="py-3 px-4">Active Plan</th>
                <th class="py-3 px-4">Cycle & Renewal</th>
                <th class="py-3 px-4">Usage This Month</th>
                <th class="py-3 px-4">Devices / Rules</th>
                <th class="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let sub of relayService.subscriptions()" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4">
                  <span class="font-extrabold text-slate-900 text-sm">{{ sub.userName }}</span>
                  <span class="block text-[10px] text-slate-500 font-medium">{{ sub.companyName || sub.userEmail }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-bold text-slate-800">{{ sub.planName }}</span>
                  <span class="block font-mono text-[10px] text-indigo-600 font-bold">[{{ sub.planCode }}]</span>
                </td>
                <td class="py-3.5 px-4 font-mono">
                  <span class="font-bold uppercase text-slate-700">{{ sub.billingCycle }}</span>
                  <span class="block text-[10px] text-slate-400">Renews {{ sub.renewalDate | date:'mediumDate' }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-[11px] font-mono">
                      <span class="font-bold text-slate-800">{{ sub.eventsUsedThisMonth | number }}</span>
                      <span class="text-slate-400">/ {{ sub.monthlyEventQuota | number }}</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-600 rounded-full" [style.width.%]="(sub.eventsUsedThisMonth / sub.monthlyEventQuota) * 100"></div>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-700">
                  <span class="font-bold">{{ sub.activeDevicesCount }} Devices</span> • <span>{{ sub.activeMessageTypesCount }} Rules</span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                    {{ sub.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- EDIT PACKAGE MODAL -->
      <div *ngIf="showPackageModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <h3 class="font-extrabold text-slate-900 text-base">Edit Package Plan Limits</h3>
            <button (click)="showPackageModal = false" class="text-slate-400 hover:text-slate-600"><app-icon name="x" [size]="18"></app-icon></button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Plan Name *</label>
              <input type="text" [(ngModel)]="packageForm.name" class="w-full px-3 py-2 border rounded-xl font-bold" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Monthly Price (₹) *</label>
                <input type="number" [(ngModel)]="packageForm.priceMonthly" class="w-full px-3 py-2 border rounded-xl font-mono font-bold" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Annual Price (₹) *</label>
                <input type="number" [(ngModel)]="packageForm.priceAnnual" class="w-full px-3 py-2 border rounded-xl font-mono font-bold" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Max Devices *</label>
                <input type="number" [(ngModel)]="packageForm.maxDevices" class="w-full px-3 py-2 border rounded-xl font-mono" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Active Rules *</label>
                <input type="number" [(ngModel)]="packageForm.maxActiveMessageTypes" class="w-full px-3 py-2 border rounded-xl font-mono" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Included Events *</label>
                <input type="number" [(ngModel)]="packageForm.includedEvents" class="w-full px-3 py-2 border rounded-xl font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Retention Days</label>
                <input type="number" [(ngModel)]="packageForm.retentionDays" class="w-full px-3 py-2 border rounded-xl font-mono" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Overage Price / Event (₹)</label>
                <input type="number" step="0.01" [(ngModel)]="packageForm.overagePricePerEvent" class="w-full px-3 py-2 border rounded-xl font-mono" />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t">
            <button (click)="showPackageModal = false" class="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100">Cancel</button>
            <button (click)="savePackage()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md">
              Save Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RelayPackagesComponent implements OnInit {
  relayService = inject(RelayService);

  ngOnInit() {
    this.relayService.fetchPackages();
    this.relayService.fetchSubscriptions();
  }

  activeTab: 'packages' | 'subscriptions' = 'packages';

  showPackageModal = false;
  editingPackageId: string | null = null;
  packageForm: Partial<RelayPackagePlan> = {};

  openAddPackageModal() {
    this.editingPackageId = null;
    this.packageForm = {
      planCode: 'relay_custom',
      name: 'Custom Tier',
      priceMonthly: 999,
      priceAnnual: 9990,
      maxDevices: 2,
      maxActiveMessageTypes: 20,
      includedEvents: 20000,
      maxWebhooks: 2,
      maxApiKeys: 2,
      retentionDays: 15,
      overageEnabled: true,
      overagePricePerEvent: 0.08,
      publicApiAccess: true,
      isActive: true
    };
    this.showPackageModal = true;
  }

  openEditPackageModal(pkg: RelayPackagePlan) {
    this.editingPackageId = pkg.id;
    this.packageForm = { ...pkg };
    this.showPackageModal = true;
  }

  savePackage() {
    if (this.editingPackageId) {
      this.relayService.updatePackage(this.editingPackageId, this.packageForm);
    }
    this.showPackageModal = false;
  }
}
