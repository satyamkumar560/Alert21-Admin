import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { EmailSender } from '../../models/alert21.models';

@Component({
  selector: 'app-email-senders',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Sender From Addresses</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Registered sender emails mapped strictly to verified tenant domains (No arbitrary unverified From addresses).
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="dataService.fetchEmailSenders()" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Refresh Senders</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <!-- Search Input -->
        <div class="relative w-full md:w-80 flex items-center">
          <span class="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            <app-icon name="mail" [size]="14"></app-icon>
          </span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search by from email, name or domain..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium transition-all"
          />
        </div>
      </div>

      <!-- Senders Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th class="py-3.5 px-4">Sender Email / From Address</th>
                <th class="py-3.5 px-4">Display / From Name</th>
                <th class="py-3.5 px-4">User Account</th>
                <th class="py-3.5 px-4">Parent Verified Domain</th>
                <th class="py-3.5 px-4">Reply-To Address</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4">Created On</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let s of filteredSenders()" class="hover:bg-slate-50/50 transition-colors">
                <!-- From Email -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <app-icon name="mail" [size]="16"></app-icon>
                    </div>
                    <div>
                      <p class="font-bold text-slate-900 font-mono">{{ s.fromEmail }}</p>
                      <p class="text-[10px] text-slate-400 font-mono">ID: {{ s.id }}</p>
                    </div>
                  </div>
                </td>

                <!-- From Name -->
                <td class="py-3.5 px-4 font-bold text-slate-800">
                  {{ s.fromName }}
                </td>

                <!-- User -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-800">{{ s.userName }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ s.userEmail }}</p>
                </td>

                <!-- Parent Domain -->
                <td class="py-3.5 px-4 font-mono text-[11px]">
                  <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                    {{ s.domainName || extractDomain(s.fromEmail) }}
                  </span>
                </td>

                <!-- Reply To -->
                <td class="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                  {{ s.replyToEmail || s.fromEmail }}
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase"
                        [ngClass]="s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
                    {{ s.status }}
                  </span>
                </td>

                <!-- Created At -->
                <td class="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                  {{ s.createdAt | date:'mediumDate' }}
                </td>
              </tr>

              <tr *ngIf="filteredSenders().length === 0">
                <td colspan="7" class="py-16 text-center text-slate-400">
                  <app-icon name="mail" [size]="32" className="mx-auto mb-2 text-slate-300"></app-icon>
                  <p class="font-bold text-slate-700">No Sender From Addresses Registered</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Senders created by tenants under their verified domains will appear here.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class EmailSendersComponent implements OnInit {
  dataService = inject(DataService);
  searchQuery = '';

  ngOnInit() {
    this.dataService.fetchEmailSenders();
  }

  filteredSenders() {
    return this.dataService.emailSenders().filter(s => {
      const q = this.searchQuery.toLowerCase().trim();
      if (!q) return true;
      return s.fromEmail.toLowerCase().includes(q) || s.fromName.toLowerCase().includes(q) || s.userName.toLowerCase().includes(q);
    });
  }

  extractDomain(email: string): string {
    if (!email || !email.includes('@')) return '';
    return email.split('@')[1];
  }
}
