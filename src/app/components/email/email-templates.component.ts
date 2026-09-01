import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IconComponent } from '../shared/icon.component';
import { EmailTemplate } from '../../models/alert21.models';

@Component({
  selector: 'app-email-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Transactional Email Templates</h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Tenant reusable email templates with subject lines, HTML bodies, and dynamic variable tags.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="dataService.fetchEmailTemplates()" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all">
            <app-icon name="refresh" [size]="13"></app-icon>
            <span>Refresh Templates</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <div class="relative w-full md:w-80 flex items-center">
          <span class="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            <app-icon name="copy" [size]="14"></app-icon>
          </span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search by template name, subject or user..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium transition-all"
          />
        </div>
      </div>

      <!-- Templates Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th class="py-3.5 px-4">Template Name</th>
                <th class="py-3.5 px-4">Email Subject Line</th>
                <th class="py-3.5 px-4">User Account</th>
                <th class="py-3.5 px-4">Dynamic Variables</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4">Created On</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let t of filteredTemplates()" class="hover:bg-slate-50/50 transition-colors">
                <!-- Name -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <app-icon name="copy" [size]="16"></app-icon>
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">{{ t.name }}</p>
                      <p class="text-[10px] text-slate-400 font-mono">ID: {{ t.id }}</p>
                    </div>
                  </div>
                </td>

                <!-- Subject -->
                <td class="py-3.5 px-4 max-w-xs truncate font-medium text-slate-800">
                  {{ t.subject }}
                </td>

                <!-- User -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-800">{{ t.userName }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ t.userEmail }}</p>
                </td>

                <!-- Variables -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-1 flex-wrap max-w-xs">
                    <span *ngFor="let v of t.variables" class="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-100">
                      {{ '{{' + v + '}}' }}
                    </span>
                    <span *ngIf="t.variables.length === 0" class="text-slate-400 text-[10px] font-mono">No variables</span>
                  </div>
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase"
                        [ngClass]="t.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'">
                    {{ t.status }}
                  </span>
                </td>

                <!-- Created At -->
                <td class="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                  {{ t.createdAt | date:'mediumDate' }}
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <button (click)="openPreview(t)" class="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px] transition-all">
                    HTML Preview
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredTemplates().length === 0">
                <td colspan="7" class="py-16 text-center text-slate-400">
                  <app-icon name="copy" [size]="32" className="mx-auto mb-2 text-slate-300"></app-icon>
                  <p class="font-bold text-slate-700">No Email Templates Found</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Templates created by users for transactional email dispatch will appear here.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Live HTML Preview Modal -->
      <div *ngIf="selectedTemplate" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase">Preview: {{ selectedTemplate.name }}</h3>
              <p class="text-[11px] text-slate-500 font-mono">Subject: <strong>{{ selectedTemplate.subject }}</strong></p>
            </div>
            <button (click)="selectedTemplate = null" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div class="bg-white rounded-lg p-6 shadow-xs border border-slate-100 min-h-[250px]" [innerHTML]="selectedTemplate.htmlBody"></div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span class="text-slate-500 font-mono">Variables: {{ selectedTemplate.variables.join(', ') || 'None' }}</span>
            <button (click)="selectedTemplate = null" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200">
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmailTemplatesComponent implements OnInit {
  dataService = inject(DataService);
  searchQuery = '';
  selectedTemplate: EmailTemplate | null = null;

  ngOnInit() {
    this.dataService.fetchEmailTemplates();
  }

  filteredTemplates() {
    return this.dataService.emailTemplates().filter(t => {
      const q = this.searchQuery.toLowerCase().trim();
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.userName.toLowerCase().includes(q);
    });
  }

  openPreview(t: EmailTemplate) {
    this.selectedTemplate = t;
  }
}
