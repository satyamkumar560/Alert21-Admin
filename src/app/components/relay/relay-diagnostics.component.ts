import { Component, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';
import { RelayService } from '../../services/relay.service';
import { RelayUnmatchedDiagnostic } from '../../models/alert21.models';
import { NavTab } from '../layout/sidebar.component';

@Component({
  selector: 'app-relay-diagnostics',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Diagnostics & Unmatched SMS</h2>
          <p class="text-xs text-slate-500 font-medium">
            Review privacy-safe normalized signature hashes of unmatched messages to identify changed SMS formats and create new templates.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
            Zero Raw Secret Leakage
          </span>
        </div>
      </div>

      <!-- Information Banner -->
      <div class="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <app-icon name="shield" [size]="16"></app-icon>
        </div>
        <div class="text-xs text-indigo-950 leading-relaxed">
          <strong>Privacy Safeguard (Page 25):</strong> Unmatched messages uploaded from Android nodes do not contain plain OTPs or full account numbers. Signatures are normalized pattern abstractions with anonymized token placeholders to protect end-user privacy.
        </div>
      </div>

      <!-- DIAGNOSTICS TABLE -->
      <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-4">Signature Hash</th>
                <th class="py-3 px-4">Sender Observed</th>
                <th class="py-3 px-4">Candidate Source</th>
                <th class="py-3 px-4">Pattern Signature (Anonymized)</th>
                <th class="py-3 px-4">Occurrences</th>
                <th class="py-3 px-4">Affected Nodes</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let d of relayService.diagnostics()" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4 font-mono font-extrabold text-indigo-600">
                  {{ d.signatureHash }}
                </td>
                <td class="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {{ d.sender }}
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[10px] font-mono">
                    {{ d.candidateSourceCode }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-600 text-[11px] max-w-md">
                  {{ d.samplePatternSignature }}
                </td>
                <td class="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {{ d.occurrencesCount }} times
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-600">
                  {{ d.affectedDevicesCount }} devices ({{ d.affectedUsersCount }} users)
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="d.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
                    {{ d.status }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button (click)="openBuilderFromDiagnostic(d)" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm ml-auto transition-all">
                    <app-icon name="plus" [size]="12"></app-icon>
                    <span>Build Template</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class RelayDiagnosticsComponent implements OnInit {
  relayService = inject(RelayService);
  @Output() navigate = new EventEmitter<NavTab>();

  ngOnInit() {
    this.relayService.fetchDiagnostics();
  }

  openBuilderFromDiagnostic(d: RelayUnmatchedDiagnostic) {
    this.relayService.builderDraft.set({
      sourceCode: d.candidateSourceCode,
      senderValue: d.sender,
      sampleSmsText: d.samplePatternSignature || '',
      messageTypeName: `${d.candidateSourceCode || 'SMS'} Alert Variant`,
      category: 'OTP'
    });
    this.navigate.emit('relay-builder');
  }
}
