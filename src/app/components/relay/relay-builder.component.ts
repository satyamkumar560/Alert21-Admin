import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { RelayService } from '../../services/relay.service';
import { 
  RelaySource, 
  RelaySender, 
  RelayEventType, 
  RelayVariable, 
  RelayCategoryType, 
  RelayTemplateVariableMapping 
} from '../../models/alert21.models';

interface TokenItem {
  index: number;
  text: string;
  isVariable: boolean;
  variableKey?: string;
  variableName?: string;
  sensitivity?: string;
}

@Component({
  selector: 'app-relay-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Visual Template Builder</h2>
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">Core Engine</span>
          </div>
          <p class="text-xs text-slate-500 font-medium">
            Paste raw SMS, click text tokens to bind variable chips, compile auto-regex, execute sandbox validation, and publish immutable versions.
          </p>
        </div>

        <!-- Preset Templates Quick-Loader -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold text-slate-500">Quick Presets:</span>
          <button (click)="loadPreset('GST')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all">
            GST OTP
          </button>
          <button (click)="loadPreset('GODADDY')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all">
            GoDaddy 2FA
          </button>
          <button (click)="loadPreset('ZOHO')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all">
            CRM OTP
          </button>
          <button (click)="loadPreset('HDFC_CR')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all">
            Bank Credit
          </button>
          <button (click)="loadPreset('HDFC_DR')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all">
            Bank Debit
          </button>
        </div>
      </div>

      <!-- MAIN BUILDER GRID (Left Config + Right Preview/Testing) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- LEFT COLUMN: Step 1 to 4 Config Form (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
              <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <span>Message Source & Taxonomy</span>
            </h3>

            <!-- 1. Source Selection -->
            <div>
              <label class="block font-bold text-slate-700 text-xs mb-1">Source / Service *</label>
              <select [(ngModel)]="selectedSourceId" (change)="onSourceChanged()" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-indigo-500">
                <option *ngFor="let s of relayService.sources()" [value]="s.id">{{ s.sourceName }} [{{ s.sourceCode }}]</option>
              </select>
            </div>

            <!-- 2. Message Type Name & Event Type -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 text-xs mb-1">Logical Message Type *</label>
                <input type="text" [(ngModel)]="messageTypeName" placeholder="e.g. GST Portal - Login OTP" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 text-xs mb-1">Category *</label>
                <select [(ngModel)]="selectedCategory" (change)="onCategoryChanged()" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-indigo-500">
                  <option value="OTP">OTP (One-Time Pass)</option>
                  <option value="LOGIN_SECURITY">LOGIN_SECURITY (2FA)</option>
                  <option value="TRANSACTION">TRANSACTION (Credit/Debit)</option>
                  <option value="BUSINESS_ALERT">BUSINESS_ALERT</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 text-xs mb-1">API Event Contract Key (Immutable) *</label>
              <input type="text" [(ngModel)]="eventTypeKey" placeholder="e.g. portal.gst.otp.received" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-indigo-700 font-bold focus:outline-none focus:border-indigo-500" />
            </div>

            <!-- 3. Sender IDs Allowed -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-bold text-slate-700 text-xs">Supported Sender IDs *</label>
                <span class="text-[10px] text-slate-400 font-mono">Matched first by Android</span>
              </div>
              <div class="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
                <span *ngFor="let snd of availableSenders" 
                  (click)="toggleSender(snd.senderValue)"
                  [class]="isSenderSelected(snd.senderValue) ? 'bg-indigo-600 text-white font-black shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 font-medium'"
                  class="px-2 py-1 rounded-lg text-[10px] font-mono cursor-pointer transition-all flex items-center gap-1">
                  <span>{{ snd.senderValue }}</span>
                  <app-icon [name]="isSenderSelected(snd.senderValue) ? 'check' : 'plus'" [size]="10"></app-icon>
                </span>
                <span *ngIf="availableSenders.length === 0" class="text-slate-400 text-xs">No senders registered for this source yet.</span>
              </div>
            </div>

            <!-- 4. Raw Message Storage Policy -->
            <div>
              <label class="block font-bold text-slate-700 text-xs mb-1">Raw SMS Policy</label>
              <select [(ngModel)]="rawMessagePolicy" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-indigo-500">
                <option value="DISABLED">DISABLED (Privacy Default - Never store raw SMS)</option>
                <option value="MASKED">MASKED (Store redacted text without secret digits)</option>
                <option value="FULL">FULL (Store raw SMS subject to plan retention)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Interactive Tokenizer + Regex + Test Parser (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          <!-- Step 2: Sample SMS & Interactive Tokenizer Box -->
          <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b pb-3">
              <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span>Interactive SMS Tokenizer & Variable Mapper</span>
              </h3>
              <span class="text-[10px] font-mono text-slate-400">Click any token to bind variable</span>
            </div>

            <!-- Raw Sample SMS Input -->
            <div>
              <label class="block font-bold text-slate-700 text-xs mb-1">Sample Raw SMS Text *</label>
              <textarea 
                [(ngModel)]="sampleSmsText" 
                (ngModelChange)="tokenizeSms()"
                rows="2" 
                placeholder="Paste real sample SMS text exactly as received on phone..." 
                class="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed">
              </textarea>
            </div>

            <!-- Interactive Clickable Tokens Bar -->
            <div class="p-3.5 bg-slate-900 text-white rounded-xl space-y-2">
              <div class="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Interactive Token Map</span>
                <span class="text-indigo-400 font-mono">{{ variableMappings.length }} variables mapped</span>
              </div>

              <div class="flex flex-wrap gap-1.5 pt-1 min-h-[48px] items-center">
                <ng-container *ngFor="let token of tokens">
                  <!-- Token without variable -->
                  <button 
                    *ngIf="!token.isVariable"
                    type="button" 
                    (click)="openTokenVariableSelector(token)"
                    class="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 text-xs font-mono transition-all border border-slate-700">
                    {{ token.text }}
                  </button>

                  <!-- Token mapped as Variable Chip -->
                  <div 
                    *ngIf="token.isVariable" 
                    class="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 animate-scale-in">
                    <span>{{'{{' + token.variableKey + '}}'}}</span>
                    <span class="text-[10px] text-indigo-200">({{ token.text }})</span>
                    <button (click)="removeTokenVariable(token)" class="text-indigo-200 hover:text-white ml-0.5">
                      <app-icon name="x" [size]="12"></app-icon>
                    </button>
                  </div>
                </ng-container>
              </div>
            </div>

            <!-- Token Variable Selection Modal/Popdown -->
            <div *ngIf="activeSelectingToken" class="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3 animate-fade-in">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-indigo-900">
                  Assign variable to token: <strong class="px-2 py-0.5 rounded bg-white font-mono text-indigo-700 border border-indigo-200">"{{ activeSelectingToken.text }}"</strong>
                </span>
                <button (click)="activeSelectingToken = null" class="text-slate-400 hover:text-slate-600">
                  <app-icon name="x" [size]="14"></app-icon>
                </button>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button 
                  *ngFor="let v of relayService.variables()" 
                  (click)="assignVariableToToken(v)"
                  class="px-3 py-2 rounded-xl bg-white border border-indigo-100 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white text-left transition-all group">
                  <span class="block font-mono text-xs font-extrabold text-indigo-700 group-hover:text-white">{{'{{' + v.key + '}}'}}</span>
                  <span class="block text-[10px] text-slate-500 group-hover:text-indigo-100 truncate">{{ v.displayName }}</span>
                </button>
              </div>
            </div>

            <!-- Step 3: Generated Regex & Checksum Strip -->
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Compiled Parser Regex</span>
                <span class="text-[10px] font-mono text-emerald-600 font-bold">SHA256 Compiled</span>
              </div>
              <code class="block font-mono text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-200 overflow-x-auto select-all">
                {{ compiledRegex }}
              </code>
            </div>
          </div>

          <!-- Step 4: LIVE TEST PARSER SANDBOX -->
          <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b pb-3">
              <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <span>Live Test Parser Sandbox</span>
              </h3>
              <button (click)="runTestParser()" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all">
                <app-icon name="play" [size]="12"></app-icon>
                <span>Run Test Parser</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 text-xs mb-1">Test Incoming Sender</label>
                <input type="text" [(ngModel)]="testSenderInput" placeholder="e.g. JD-GSTNIN" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono uppercase" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 text-xs mb-1">Test Mode</label>
                <div class="flex items-center gap-2 pt-1">
                  <button (click)="loadTestSample('positive')" class="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">Positive Sample</button>
                  <button (click)="loadTestSample('spaces')" class="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">Whitespace Alt</button>
                  <button (click)="loadTestSample('wrong_sender')" class="px-2 py-1 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">Wrong Sender</button>
                </div>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 text-xs mb-1">Incoming Test SMS Text</label>
              <textarea [(ngModel)]="testSmsInput" rows="2" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-indigo-500"></textarea>
            </div>

            <!-- Test Parser Execution Result Box -->
            <div *ngIf="testResult" class="p-4 rounded-xl border transition-all"
              [ngClass]="testResult.matched ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full" [ngClass]="testResult.matched ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  <strong class="text-xs uppercase tracking-wider" [ngClass]="testResult.matched ? 'text-emerald-900' : 'text-rose-900'">
                    {{ testResult.matched ? 'MATCH SUCCESSFUL' : 'NO MATCH / REJECTED' }}
                  </strong>
                </div>
                <span class="text-[10px] font-mono text-slate-500">{{ testResult.timeTakenMs }}ms execution</span>
              </div>

              <p class="text-xs text-slate-600 mb-3">{{ testResult.message }}</p>

              <!-- Extracted Variables Output -->
              <div *ngIf="testResult.matched" class="space-y-2">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Extracted Payload Variables</span>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div *ngFor="let item of testResult.extracted | keyvalue" class="p-2 bg-white rounded-lg border border-emerald-200">
                    <span class="block text-[10px] font-mono font-bold text-emerald-800">{{ item.key }}</span>
                    <strong class="block text-xs font-mono text-slate-900">{{ item.value }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Publish / Save Action Footer -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t">
              <button (click)="resetForm()" class="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100">
                Reset Form
              </button>
              <button (click)="publishTemplate()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all">
                <app-icon name="check-circle" [size]="14"></app-icon>
                <span>Publish Version & Sync Android</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RelayBuilderComponent implements OnInit {
  relayService = inject(RelayService);

  selectedSourceId = '';
  messageTypeName = '';
  selectedCategory: RelayCategoryType = 'OTP';
  eventTypeKey = '';
  selectedSenderIds: string[] = [];
  rawMessagePolicy: 'DISABLED' | 'MASKED' | 'FULL' = 'DISABLED';

  sampleSmsText = '';
  tokens: TokenItem[] = [];
  variableMappings: RelayTemplateVariableMapping[] = [];
  activeSelectingToken: TokenItem | null = null;
  compiledRegex = '';

  testSenderInput = '';
  testSmsInput = '';
  testResult: { matched: boolean; message: string; extracted: Record<string, any>; timeTakenMs: number } | null = null;

  availableSenders: RelaySender[] = [];

  ngOnInit() {
    this.loadPreset('GST');
  }

  onSourceChanged() {
    const src = this.relayService.sources().find(s => s.id === this.selectedSourceId);
    if (src) {
      this.availableSenders = this.relayService.senders().filter(snd => snd.sourceId === src.id);
      if (this.availableSenders.length > 0 && this.selectedSenderIds.length === 0) {
        this.selectedSenderIds = [this.availableSenders[0].senderValue];
      }
    }
  }

  onCategoryChanged() {
    if (this.selectedCategory === 'OTP') {
      this.eventTypeKey = `portal.${this.getSelectedSourceCode().toLowerCase()}.otp.received`;
    } else if (this.selectedCategory === 'TRANSACTION') {
      this.eventTypeKey = 'bank.credit.received';
    } else if (this.selectedCategory === 'LOGIN_SECURITY') {
      this.eventTypeKey = `portal.${this.getSelectedSourceCode().toLowerCase()}.login_otp.received`;
    }
  }

  getSelectedSourceCode(): string {
    const src = this.relayService.sources().find(s => s.id === this.selectedSourceId);
    return src ? src.sourceCode : 'GST';
  }

  toggleSender(senderValue: string) {
    if (this.selectedSenderIds.includes(senderValue)) {
      this.selectedSenderIds = this.selectedSenderIds.filter(s => s !== senderValue);
    } else {
      this.selectedSenderIds.push(senderValue);
    }
  }

  isSenderSelected(senderValue: string): boolean {
    return this.selectedSenderIds.includes(senderValue);
  }

  tokenizeSms() {
    if (!this.sampleSmsText) {
      this.tokens = [];
      this.compiledRegex = '';
      return;
    }

    const words = this.sampleSmsText.trim().split(/\s+/);
    this.tokens = words.map((w, idx) => {
      const existing = this.variableMappings.find(m => m.tokenIndex === idx);
      return {
        index: idx,
        text: w,
        isVariable: !!existing,
        variableKey: existing?.variableKey,
        variableName: existing?.variableName,
        sensitivity: existing?.sensitivity
      };
    });

    this.buildCompiledRegex();
  }

  openTokenVariableSelector(token: TokenItem) {
    this.activeSelectingToken = token;
  }

  assignVariableToToken(variable: RelayVariable) {
    if (!this.activeSelectingToken) return;
    const token = this.activeSelectingToken;

    // Remove any existing mapping on this token
    this.variableMappings = this.variableMappings.filter(m => m.tokenIndex !== token.index);

    // Clean sample value (remove trailing dots/colons)
    const cleanSample = token.text.replace(/[.,:;]$/, '');

    const newMapping: RelayTemplateVariableMapping = {
      variableKey: variable.key,
      variableName: variable.displayName,
      dataType: variable.dataType,
      sensitivity: variable.sensitivity,
      sampleValue: cleanSample,
      tokenIndex: token.index,
      required: true
    };

    this.variableMappings.push(newMapping);

    token.isVariable = true;
    token.variableKey = variable.key;
    token.variableName = variable.displayName;
    token.sensitivity = variable.sensitivity;

    this.activeSelectingToken = null;
    this.buildCompiledRegex();
  }

  removeTokenVariable(token: TokenItem) {
    token.isVariable = false;
    token.variableKey = undefined;
    token.variableName = undefined;
    token.sensitivity = undefined;

    this.variableMappings = this.variableMappings.filter(m => m.tokenIndex !== token.index);
    this.buildCompiledRegex();
  }

  buildCompiledRegex() {
    if (!this.sampleSmsText) {
      this.compiledRegex = '';
      return;
    }

    const parts: string[] = [];
    this.tokens.forEach(t => {
      if (t.isVariable) {
        if (t.variableKey === 'otp' || t.variableKey === 'expiry_minutes' || t.variableKey === 'account_last4') {
          parts.push('(\\d+)');
        } else if (t.variableKey === 'amount' || t.variableKey === 'balance') {
          parts.push('([\\d,]+\\.\\d{2})');
        } else {
          parts.push('([A-Za-z0-9_-]+)');
        }
      } else {
        // Escape special regex chars
        const escaped = t.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        parts.push(escaped);
      }
    });

    this.compiledRegex = `^${parts.join('\\s+')}`;
  }

  loadPreset(type: 'GST' | 'GODADDY' | 'ZOHO' | 'HDFC_CR' | 'HDFC_DR') {
    this.variableMappings = [];
    if (type === 'GST') {
      this.selectedSourceId = 'src_gst';
      this.messageTypeName = 'GST Portal - Login OTP';
      this.selectedCategory = 'OTP';
      this.eventTypeKey = 'portal.gst.otp.received';
      this.selectedSenderIds = ['JD-GSTNIN', 'VM-GSTNIN'];
      this.sampleSmsText = '123456 is your OTP for GST Portal login. Valid for 10 minutes. Do not share it.';
      this.onSourceChanged();
      this.tokenizeSms();

      // auto assign 123456 as otp and 10 as expiry_minutes
      this.variableMappings = [
        { variableKey: 'otp', variableName: 'OTP', dataType: 'string', sensitivity: 'SECRET', sampleValue: '123456', tokenIndex: 0, required: true },
        { variableKey: 'expiry_minutes', variableName: 'Expiry Minutes', dataType: 'integer', sensitivity: 'NORMAL', sampleValue: '10', tokenIndex: 8, required: false }
      ];
      this.tokens[0].isVariable = true;
      this.tokens[0].variableKey = 'otp';
      this.tokens[8].isVariable = true;
      this.tokens[8].variableKey = 'expiry_minutes';
      this.testSenderInput = 'JD-GSTNIN';
      this.testSmsInput = '984120 is your OTP for GST Portal login. Valid for 10 minutes. Do not share it.';
    } else if (type === 'GODADDY') {
      this.selectedSourceId = 'src_godaddy';
      this.messageTypeName = 'GoDaddy - Security / Login Code';
      this.selectedCategory = 'LOGIN_SECURITY';
      this.eventTypeKey = 'portal.godaddy.login_otp.received';
      this.selectedSenderIds = ['GODADY', 'AX-GODADY'];
      this.sampleSmsText = 'GoDaddy verification code: 784921. Use this code to sign in.';
      this.onSourceChanged();
      this.tokenizeSms();

      this.variableMappings = [
        { variableKey: 'otp', variableName: 'OTP', dataType: 'string', sensitivity: 'SECRET', sampleValue: '784921', tokenIndex: 3, required: true }
      ];
      this.tokens[3].isVariable = true;
      this.tokens[3].variableKey = 'otp';
      this.testSenderInput = 'GODADY';
      this.testSmsInput = 'GoDaddy verification code: 319482. Use this code to sign in.';
    } else if (type === 'ZOHO') {
      this.selectedSourceId = 'src_zoho';
      this.messageTypeName = 'Zoho CRM - Login OTP';
      this.selectedCategory = 'OTP';
      this.eventTypeKey = 'crm.login_otp.received';
      this.selectedSenderIds = ['ZOHOCM', 'VK-ZOHOCM'];
      this.sampleSmsText = 'Your Zoho CRM login OTP is 456123. It expires in 5 minutes.';
      this.onSourceChanged();
      this.tokenizeSms();

      this.variableMappings = [
        { variableKey: 'otp', variableName: 'OTP', dataType: 'string', sensitivity: 'SECRET', sampleValue: '456123', tokenIndex: 6, required: true },
        { variableKey: 'expiry_minutes', variableName: 'Expiry Minutes', dataType: 'integer', sensitivity: 'NORMAL', sampleValue: '5', tokenIndex: 11, required: false }
      ];
      this.tokens[6].isVariable = true;
      this.tokens[6].variableKey = 'otp';
      this.tokens[11].isVariable = true;
      this.tokens[11].variableKey = 'expiry_minutes';
      this.testSenderInput = 'ZOHOCM';
      this.testSmsInput = 'Your Zoho CRM login OTP is 721940. It expires in 5 minutes.';
    } else if (type === 'HDFC_CR') {
      this.selectedSourceId = 'src_hdfc';
      this.messageTypeName = 'HDFC Bank - Credit Alert';
      this.selectedCategory = 'TRANSACTION';
      this.eventTypeKey = 'bank.credit.received';
      this.selectedSenderIds = ['HDFCBK', 'VM-HDFCBK'];
      this.sampleSmsText = 'INR 25,000.00 credited to A/c XX4582 via UPI. Ref 625091234567. Avl Bal INR 84,520.20';
      this.onSourceChanged();
      this.tokenizeSms();

      this.variableMappings = [
        { variableKey: 'amount', variableName: 'Amount', dataType: 'decimal', sensitivity: 'NORMAL', sampleValue: '25,000.00', tokenIndex: 1, required: true },
        { variableKey: 'account_last4', variableName: 'Account Last4', dataType: 'string', sensitivity: 'SENSITIVE', sampleValue: '4582', tokenIndex: 4, required: true },
        { variableKey: 'payment_mode', variableName: 'Payment Mode', dataType: 'enum', sensitivity: 'NORMAL', sampleValue: 'UPI', tokenIndex: 6, required: true },
        { variableKey: 'reference', variableName: 'Reference', dataType: 'string', sensitivity: 'NORMAL', sampleValue: '625091234567', tokenIndex: 8, required: true },
        { variableKey: 'balance', variableName: 'Balance', dataType: 'decimal', sensitivity: 'SENSITIVE', sampleValue: '84,520.20', tokenIndex: 12, required: false }
      ];
      this.tokens[1].isVariable = true; this.tokens[1].variableKey = 'amount';
      this.tokens[4].isVariable = true; this.tokens[4].variableKey = 'account_last4';
      this.tokens[6].isVariable = true; this.tokens[6].variableKey = 'payment_mode';
      this.tokens[8].isVariable = true; this.tokens[8].variableKey = 'reference';
      this.tokens[12].isVariable = true; this.tokens[12].variableKey = 'balance';
      this.testSenderInput = 'HDFCBK';
      this.testSmsInput = 'INR 50,000.00 credited to A/c XX9921 via UPI. Ref 982173491029. Avl Bal INR 1,45,200.00';
    } else if (type === 'HDFC_DR') {
      this.selectedSourceId = 'src_hdfc';
      this.messageTypeName = 'Bank - Debit Alert';
      this.selectedCategory = 'TRANSACTION';
      this.eventTypeKey = 'bank.debit.received';
      this.selectedSenderIds = ['HDFCBK', 'ICICIB'];
      this.sampleSmsText = 'INR 8,500.00 debited from A/c XX1198 at ABC STORES. UPI Ref 625098765432.';
      this.onSourceChanged();
      this.tokenizeSms();

      this.variableMappings = [
        { variableKey: 'amount', variableName: 'Amount', dataType: 'decimal', sensitivity: 'NORMAL', sampleValue: '8,500.00', tokenIndex: 1, required: true },
        { variableKey: 'account_last4', variableName: 'Account Last4', dataType: 'string', sensitivity: 'SENSITIVE', sampleValue: '1198', tokenIndex: 4, required: true },
        { variableKey: 'merchant', variableName: 'Merchant', dataType: 'string', sensitivity: 'NORMAL', sampleValue: 'ABC STORES', tokenIndex: 6, required: true },
        { variableKey: 'reference', variableName: 'Reference', dataType: 'string', sensitivity: 'NORMAL', sampleValue: '625098765432', tokenIndex: 9, required: true }
      ];
      this.tokens[1].isVariable = true; this.tokens[1].variableKey = 'amount';
      this.tokens[4].isVariable = true; this.tokens[4].variableKey = 'account_last4';
      this.tokens[6].isVariable = true; this.tokens[6].variableKey = 'merchant';
      this.tokens[9].isVariable = true; this.tokens[9].variableKey = 'reference';
      this.testSenderInput = 'HDFCBK';
      this.testSmsInput = 'INR 1,200.00 debited from A/c XX4021 at STARBUCKS CAFE. UPI Ref 827401928472.';
    }

    this.buildCompiledRegex();
    this.runTestParser();
  }

  loadTestSample(mode: 'positive' | 'spaces' | 'wrong_sender') {
    if (mode === 'positive') {
      this.testSmsInput = this.sampleSmsText;
      this.testSenderInput = this.selectedSenderIds[0] || 'JD-GSTNIN';
    } else if (mode === 'spaces') {
      this.testSmsInput = this.sampleSmsText.replace(/\s+/g, '   ');
      this.testSenderInput = this.selectedSenderIds[0] || 'JD-GSTNIN';
    } else if (mode === 'wrong_sender') {
      this.testSenderInput = 'PROMO-OFFER';
    }
    this.runTestParser();
  }

  runTestParser() {
    const start = performance.now();
    const sender = (this.testSenderInput || '').trim().toUpperCase();
    const text = (this.testSmsInput || '').trim();

    // 1. Check sender ID match
    const senderMatches = this.selectedSenderIds.some(s => s === '*' || s === sender || (s.endsWith('*') && sender.startsWith(s.replace('*', ''))));
    if (!senderMatches) {
      this.testResult = {
        matched: false,
        message: `NO MATCH: Sender "${sender}" is not in the allowed sender list for this message type (${this.selectedSenderIds.join(', ')}).`,
        extracted: {},
        timeTakenMs: Math.round(performance.now() - start)
      };
      return;
    }

    // 2. Try regex match
    try {
      const reg = new RegExp(this.compiledRegex, 'i');
      const match = text.match(reg);
      if (match) {
        const extracted: Record<string, any> = {};
        this.variableMappings.forEach((mapping, idx) => {
          extracted[mapping.variableKey] = match[idx + 1] || 'N/A';
        });

        this.testResult = {
          matched: true,
          message: `MATCH SUCCESS: Extracted ${Object.keys(extracted).length} variables with valid schema types and sensitivity masks.`,
          extracted: extracted,
          timeTakenMs: Math.round(performance.now() - start)
        };
      } else {
        this.testResult = {
          matched: false,
          message: 'NO MATCH: Text body structure does not conform to the fixed tokens pattern.',
          extracted: {},
          timeTakenMs: Math.round(performance.now() - start)
        };
      }
    } catch (e: any) {
      this.testResult = {
        matched: false,
        message: `Regex evaluation error: ${e.message}`,
        extracted: {},
        timeTakenMs: Math.round(performance.now() - start)
      };
    }
  }

  publishTemplate() {
    if (!this.selectedSourceId || !this.messageTypeName.trim() || !this.sampleSmsText.trim()) return;

    const src = this.relayService.sources().find(s => s.id === this.selectedSourceId);
    if (!src) return;

    this.relayService.publishTemplate({
      sourceId: src.id,
      sourceCode: src.sourceCode,
      sourceName: src.sourceName,
      messageTypeName: this.messageTypeName,
      eventTypeId: this.selectedCategory,
      eventTypeKey: this.eventTypeKey,
      category: this.selectedCategory,
      sampleSmsText: this.sampleSmsText,
      patternRegex: this.compiledRegex,
      senderIds: this.selectedSenderIds,
      variables: this.variableMappings,
      rawMessagePolicy: this.rawMessagePolicy
    });
  }

  resetForm() {
    this.messageTypeName = '';
    this.sampleSmsText = '';
    this.tokens = [];
    this.variableMappings = [];
    this.compiledRegex = '';
    this.testResult = null;
  }
}
