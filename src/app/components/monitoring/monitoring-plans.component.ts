import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { MonitoringPlan, MonitoringAddon } from '../../models/alert21.models';

@Component({
  selector: 'app-monitoring-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Package Master & Pricing Engine</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Admin configuration for website monitoring tiers, intervals, SMS/WhatsApp policies, and add-ons (+18% GST).
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button (click)="openAddModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5">
            <app-icon name="plus" [size]="14"></app-icon>
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      <!-- Tiers & Addons Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button 
          (click)="activeTab = 'PLANS'"
          [ngClass]="activeTab === 'PLANS' ? 'bg-indigo-600 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
          class="px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2">
          <app-icon name="tag" [size]="14"></app-icon>
          <span>Monitoring Plans ({{ dataService.monitoringPlans().length }})</span>
        </button>

        <button 
          (click)="activeTab = 'ADDONS'"
          [ngClass]="activeTab === 'ADDONS' ? 'bg-indigo-600 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
          class="px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2">
          <app-icon name="plus" [size]="14"></app-icon>
          <span>Recommended Add-ons ({{ dataService.monitoringAddons().length }})</span>
        </button>
      </div>

      <!-- TAB 1: PLANS GRID / TABLE -->
      <div *ngIf="activeTab === 'PLANS'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div *ngFor="let plan of dataService.monitoringPlans()" class="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-all">
          <!-- Top Badge -->
          <div *ngIf="plan.badge" class="absolute top-2.5 right-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
            {{ plan.badge }}
          </div>

          <div class="space-y-3">
            <div>
              <span class="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">{{ plan.code }}</span>
              <h3 class="text-base font-black text-slate-900 leading-tight">{{ plan.name }}</h3>
            </div>

            <!-- Price -->
            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-black text-slate-900 font-mono">₹{{ plan.monthlyPrice }}</span>
                <span class="text-[10px] text-slate-500 font-bold">/ mo + 18% GST</span>
              </div>
              <p class="text-[10px] text-slate-400 font-medium mt-0.5">Annual: ₹{{ plan.annualPrice }} / yr (Save 2 mo)</p>
            </div>

            <!-- Entitlements List -->
            <ul class="space-y-1.5 text-[11px] text-slate-700 font-medium">
              <li class="flex items-center gap-1.5">
                <app-icon name="check-circle" [size]="12" className="text-emerald-600 shrink-0"></app-icon>
                <span><strong>{{ plan.includedMonitors }}</strong> Monitors Included</span>
              </li>
              <li class="flex items-center gap-1.5">
                <app-icon name="check-circle" [size]="12" className="text-emerald-600 shrink-0"></app-icon>
                <span><strong>{{ plan.checkIntervalSeconds }}s</strong> Check Interval</span>
              </li>
              <li class="flex items-center gap-1.5">
                <app-icon name="check-circle" [size]="12" className="text-emerald-600 shrink-0"></app-icon>
                <span><strong>{{ plan.retentionDays }} Days</strong> Retention</span>
              </li>
              <li class="flex items-center gap-1.5">
                <app-icon name="check-circle" [size]="12" className="text-emerald-600 shrink-0"></app-icon>
                <span><strong>{{ plan.notificationContacts }}</strong> Alert Contacts</span>
              </li>
              <li class="flex items-center gap-1.5">
                <app-icon name="check-circle" [size]="12" className="text-emerald-600 shrink-0"></app-icon>
                <span>SSL: <strong>{{ plan.sslMonitoring ? 'Enabled' : 'Disabled' }}</strong></span>
              </li>
              <li class="flex items-center gap-1.5">
                <app-icon name="check-circle" [size]="12" className="text-emerald-600 shrink-0"></app-icon>
                <span class="truncate">Channels: <strong class="uppercase text-[10px]">{{ plan.smsMode }}</strong></span>
              </li>
              <li class="flex items-center gap-1.5">
                <app-icon name="check-circle" [size]="12" className="text-emerald-600 shrink-0"></app-icon>
                <span>Verification: <strong>{{ plan.verificationSources }} Source(s)</strong></span>
              </li>
            </ul>
          </div>

          <!-- Card Footer Actions -->
          <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
            <span class="px-2 py-0.5 text-[9px] font-bold rounded uppercase font-mono"
                  [ngClass]="plan.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
              {{ plan.status }}
            </span>
            <div class="flex items-center gap-1">
              <button (click)="openEditModal(plan)" class="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-md transition-all">
                Edit
              </button>
              <button (click)="archivePlan(plan)" class="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-md transition-all">
                Archive
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: ADDONS TABLE -->
      <div *ngIf="activeTab === 'ADDONS'" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th class="py-3.5 px-4">Add-on Name / SKU</th>
                <th class="py-3.5 px-4">Monthly Rate</th>
                <th class="py-3.5 px-4">Annual Rate</th>
                <th class="py-3.5 px-4">Quota Delta</th>
                <th class="py-3.5 px-4">Rule / Compatibility</th>
                <th class="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let a of dataService.monitoringAddons()" class="hover:bg-slate-50/50">
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-900">{{ a.name }}</p>
                  <p class="text-[10px] font-mono text-slate-400">{{ a.sku }}</p>
                </td>
                <td class="py-3.5 px-4 font-mono font-bold text-slate-900">₹{{ a.monthlyPrice }} + GST</td>
                <td class="py-3.5 px-4 font-mono font-bold text-slate-600">₹{{ a.annualPrice }} + GST</td>
                <td class="py-3.5 px-4 font-mono font-extrabold text-indigo-600">+{{ a.quotaDelta }}</td>
                <td class="py-3.5 px-4 text-slate-600">{{ a.ruleDescription }}</td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    {{ a.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Plan Add / Edit Modal -->
      <div *ngIf="showPlanModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-100 my-8">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-black text-slate-900">{{ isEditing ? 'Edit Monitoring Plan' : 'Create New Monitoring Plan' }}</h3>
            <button (click)="showPlanModal = false" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Plan Code</label>
              <input type="text" [(ngModel)]="currentPlan.code" placeholder="e.g. PRO_PLUS" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase" [disabled]="isEditing">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Plan Name</label>
              <input type="text" [(ngModel)]="currentPlan.name" placeholder="e.g. Pro Plus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Monthly Base Price (₹)</label>
              <input type="number" [(ngModel)]="currentPlan.monthlyPrice" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Annual Base Price (₹)</label>
              <input type="number" [(ngModel)]="currentPlan.annualPrice" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Included Monitors</label>
              <input type="number" [(ngModel)]="currentPlan.includedMonitors" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Check Interval (Seconds)</label>
              <select [(ngModel)]="currentPlan.checkIntervalSeconds" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
                <option [ngValue]="300">300s (5 min)</option>
                <option [ngValue]="180">180s (3 min)</option>
                <option [ngValue]="60">60s (1 min)</option>
                <option [ngValue]="30">30s (Fastest)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Retention (Days)</label>
              <input type="number" [(ngModel)]="currentPlan.retentionDays" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">Notification Contacts</label>
              <input type="number" [(ngModel)]="currentPlan.notificationContacts" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">SMS Alerts Mode</label>
              <select [(ngModel)]="currentPlan.smsMode" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
                <option value="DISABLED">Disabled</option>
                <option value="USER_WALLET">Deduct from User SMS Wallet</option>
                <option value="INCLUDED">Included in Plan</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase mb-1">WhatsApp Alerts Mode</label>
              <select [(ngModel)]="currentPlan.whatsAppMode" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold">
                <option value="DISABLED">Disabled</option>
                <option value="USER_WALLET">Deduct from User WA Wallet</option>
                <option value="INCLUDED">Included in Plan</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="showPlanModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button (click)="savePlan()" class="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
              {{ isEditing ? 'Save Changes' : 'Create Plan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MonitoringPlansComponent implements OnInit {
  dataService = inject(DataService);
  activeTab: 'PLANS' | 'ADDONS' = 'PLANS';

  showPlanModal = false;
  isEditing = false;
  currentPlan: Partial<MonitoringPlan> = {};

  async ngOnInit() {
    await Promise.all([
      this.dataService.fetchMonitoringPlans(),
      this.dataService.fetchMonitoringAddons()
    ]);
  }

  openAddModal() {
    this.isEditing = false;
    this.currentPlan = {
      code: '',
      name: '',
      monthlyPrice: 299,
      annualPrice: 2999,
      gstPercent: 18,
      includedMonitors: 10,
      checkIntervalSeconds: 60,
      retentionDays: 60,
      notificationContacts: 5,
      smsMode: 'USER_WALLET',
      whatsAppMode: 'USER_WALLET',
      sslMonitoring: true,
      slowResponseAlert: true,
      verificationSources: 1,
      gracePeriodDays: 3,
      status: 'ACTIVE'
    };
    this.showPlanModal = true;
  }

  openEditModal(plan: MonitoringPlan) {
    this.isEditing = true;
    this.currentPlan = { ...plan };
    this.showPlanModal = true;
  }

  async savePlan() {
    if (this.isEditing && this.currentPlan.id) {
      await this.dataService.updateMonitoringPlan(this.currentPlan.id, this.currentPlan);
    } else {
      await this.dataService.createMonitoringPlan(this.currentPlan);
    }
    this.showPlanModal = false;
  }

  async archivePlan(plan: MonitoringPlan) {
    if (confirm(`Are you sure you want to archive ${plan.name}?`)) {
      await this.dataService.deleteMonitoringPlan(plan.id);
    }
  }
}
