import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { VariableMasterAdminService } from '../../services/variable-master-admin.service';

@Component({
  selector: 'app-variable-usage',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 text-slate-900">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shadow-xs">
            <app-icon name="activity" [size]="22"></app-icon>
          </div>
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Variable Usage Analytics & Audit</h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">Real-time usage metrics across Master Templates & Single API send dispatches</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            type="button" 
            (click)="refresh()"
            class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-200 flex items-center gap-2 transition-all cursor-pointer">
            <app-icon name="rotate-cw" [size]="16"></app-icon>
            <span>Refresh Audit Report</span>
          </button>
        </div>
      </div>

      <!-- Stats Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold shadow-xs">
            <app-icon name="sliders" [size]="22"></app-icon>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Tracked Variables</div>
            <div class="text-2xl font-black text-slate-900 mt-0.5">{{ adminService.usageStats().length }}</div>
          </div>
        </div>

        <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
            <app-icon name="copy" [size]="22"></app-icon>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Linked Templates</div>
            <div class="text-2xl font-black text-slate-900 mt-0.5">{{ totalTemplatesLinked() }}</div>
          </div>
        </div>

        <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
            <app-icon name="send" [size]="22"></app-icon>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Executions</div>
            <div class="text-2xl font-black text-slate-900 mt-0.5">{{ totalExecutions() }}</div>
          </div>
        </div>
      </div>

      <!-- Usage Data Table Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-sm font-extrabold text-slate-900">Variable Performance Breakdown</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th class="py-3 px-4">Variable Key</th>
                <th class="py-3 px-4">Display Name</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Data Type</th>
                <th class="py-3 px-4">Templates Linked</th>
                <th class="py-3 px-4 text-right">Execution Hits</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let item of adminService.usageStats()" class="hover:bg-slate-50/60 transition-colors">
                <td class="py-3.5 px-4 font-mono font-bold text-indigo-700">
                  <span class="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs">
                    {{ '{{ ' + item.variableKey + ' }}' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-extrabold text-slate-900 text-sm">{{ item.displayName }}</td>
                <td class="py-3.5 px-4 text-slate-500 uppercase text-[10px] font-bold tracking-wider">{{ item.category }}</td>
                <td class="py-3.5 px-4 font-mono text-purple-700 font-bold uppercase">{{ item.dataType }}</td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold text-xs border border-slate-200">
                    {{ item.templatesCount }} templates
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-extrabold border border-emerald-200 text-xs">
                    {{ item.usageCount | number }} hits
                  </span>
                </td>
              </tr>
              <tr *ngIf="adminService.usageStats().length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 font-medium">
                  No usage data available yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class VariableUsageComponent implements OnInit {
  adminService = inject(VariableMasterAdminService);

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.adminService.loadUsageReport();
  }

  totalTemplatesLinked(): number {
    return this.adminService.usageStats().reduce((sum, item) => sum + (item.templatesCount || 0), 0);
  }

  totalExecutions(): number {
    return this.adminService.usageStats().reduce((sum, item) => sum + (item.usageCount || 0), 0);
  }
}
