import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Security & Environment Settings</h2>
          <p class="text-xs text-slate-500 font-medium mt-1">Section 15 Security Compliance Checklist for Alert21 Admin Panel.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <app-icon name="shield-check" [size]="20" className="text-emerald-500"></app-icon>
            <span>Security Compliance Status</span>
          </h3>

          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
              <span class="text-slate-700 font-semibold">Credential Masking Policy</span>
              <span class="badge badge-active text-[9px] px-2 py-1 uppercase font-bold tracking-wider">ENFORCED</span>
            </div>
            <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
              <span class="text-slate-700 font-semibold">Rate Limiting Protection</span>
              <span class="badge badge-active text-[9px] px-2 py-1 uppercase font-bold tracking-wider">5 req/min</span>
            </div>
            <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
              <span class="text-slate-700 font-semibold">HTTPS Transport Encryption</span>
              <span class="badge badge-active text-[9px] px-2 py-1 uppercase font-bold tracking-wider">TLS 1.3</span>
            </div>
            <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
              <span class="text-slate-700 font-semibold">Audit Trail Logging</span>
              <span class="badge badge-active text-[9px] px-2 py-1 uppercase font-bold tracking-wider">ACTIVE</span>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <app-icon name="settings" [size]="20" className="text-indigo-500"></app-icon>
            <span>Environment Host</span>
          </h3>

          <div class="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 space-y-3 text-xs font-mono shadow-xs">
            <div class="flex justify-between items-center border-b border-indigo-100/50 pb-2">
              <span class="text-indigo-900/70 font-semibold">Admin Panel Domain:</span>
              <span class="text-indigo-700 font-bold bg-white px-2 py-1 rounded shadow-sm border border-indigo-100">admin.alert21.in</span>
            </div>
            <div class="flex justify-between items-center border-b border-indigo-100/50 pb-2">
              <span class="text-indigo-900/70 font-semibold">Main Application:</span>
              <span class="text-slate-700 font-bold bg-white px-2 py-1 rounded shadow-sm border border-slate-200">app.alert21.in</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-indigo-900/70 font-semibold">MSG24 API Gateway:</span>
              <span class="text-cyan-700 font-bold bg-cyan-50 px-2 py-1 rounded shadow-sm border border-cyan-200">admin.msg24x7.co.in</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {}