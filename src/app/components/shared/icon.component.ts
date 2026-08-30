import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      [attr.width]="size" 
      [attr.height]="size" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      [attr.stroke-width]="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      [class]="className">
      
      <!-- Dashboard / Grid -->
      <ng-container *ngIf="name === 'layout-dashboard'">
        <rect width="7" height="9" x="3" y="3" rx="1"/>
        <rect width="7" height="5" x="14" y="3" rx="1"/>
        <rect width="7" height="9" x="14" y="12" rx="1"/>
        <rect width="7" height="5" x="3" y="16" rx="1"/>
      </ng-container>

      <!-- Users -->
      <ng-container *ngIf="name === 'users'">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </ng-container>

      <!-- Shield / DLT / Security -->
      <ng-container *ngIf="name === 'shield-check'">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
        <path d="m9 12 2 2 4-4"/>
      </ng-container>

      <!-- Server / Provider -->
      <ng-container *ngIf="name === 'server'">
        <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
        <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
        <line x1="6" x2="6.01" y1="6" y2="6"/>
        <line x1="6" x2="6.01" y1="18" y2="18"/>
      </ng-container>

      <!-- Hash / Hash Tool -->
      <ng-container *ngIf="name === 'hash'">
        <line x1="4" x2="20" y1="9" y2="9"/>
        <line x1="4" x2="20" y1="15" y2="15"/>
        <line x1="10" x2="8" y1="3" y2="21"/>
        <line x1="16" x2="14" y1="3" y2="21"/>
      </ng-container>

      <!-- Route / Provider Routing -->
      <ng-container *ngIf="name === 'route'">
        <circle cx="6" cy="19" r="3"/>
        <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
        <circle cx="18" cy="5" r="3"/>
      </ng-container>

      <!-- File Text / Logs -->
      <ng-container *ngIf="name === 'file-text'">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
        <path d="M10 9H8"/>
        <path d="M16 13H8"/>
        <path d="M16 17H8"/>
      </ng-container>

      <!-- Audit / History -->
      <ng-container *ngIf="name === 'history'">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M12 7v5l4 2"/>
      </ng-container>

      <!-- Settings -->
      <ng-container *ngIf="name === 'settings'">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </ng-container>

      <!-- Staff / Shield User -->
      <ng-container *ngIf="name === 'user-check'">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <polyline points="16 11 18 13 22 9"/>
      </ng-container>

      <!-- Key / Password -->
      <ng-container *ngIf="name === 'key'">
        <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4.1a1 1 0 0 0-1.4 0l-2.1 2.1a1 1 0 0 0 0 1.3Z"/>
        <path d="m14 11-6.5 6.5A2.12 2.12 0 0 1 6 18H4a1 1 0 0 1-1-1v-2c0-.53.21-1.04.59-1.41L10 7"/>
        <circle cx="16.5" cy="7.5" r=".5"/>
      </ng-container>

      <!-- Eye / Eye Off -->
      <ng-container *ngIf="name === 'eye'">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </ng-container>

      <ng-container *ngIf="name === 'eye-off'">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
        <line x1="2" x2="22" y1="2" y2="22"/>
      </ng-container>

      <!-- Copy -->
      <ng-container *ngIf="name === 'copy'">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </ng-container>

      <!-- Check / Check Circle -->
      <ng-container *ngIf="name === 'check'">
        <polyline points="20 6 9 17 4 12"/>
      </ng-container>
      <ng-container *ngIf="name === 'check-circle'">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <path d="m9 11 3 3L22 4"/>
      </ng-container>

      <!-- Alert Triangle / Warning -->
      <ng-container *ngIf="name === 'alert-triangle'">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" x2="12" y1="9" y2="13"/>
        <line x1="12" x2="12.01" y1="17" y2="17"/>
      </ng-container>

      <!-- Play / Run -->
      <ng-container *ngIf="name === 'play'">
        <polygon points="6 3 20 12 6 21 6 3"/>
      </ng-container>

      <!-- Refresh / Sync -->
      <ng-container *ngIf="name === 'rotate-cw'">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
      </ng-container>

      <!-- Arrow Right / Chevron -->
      <ng-container *ngIf="name === 'chevron-right'">
        <path d="m9 18 6-6-6-6"/>
      </ng-container>
      <ng-container *ngIf="name === 'chevron-down'">
        <path d="m6 9 6 6 6-6"/>
      </ng-container>
      <ng-container *ngIf="name === 'logout'">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" x2="9" y1="12" y2="12"/>
      </ng-container>
      <ng-container *ngIf="name === 'sparkles'">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </ng-container>

      <!-- Credit Card -->
      <ng-container *ngIf="name === 'credit-card'">
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <line x1="2" x2="22" y1="10" y2="10"/>
      </ng-container>

      <!-- Bank / Building -->
      <ng-container *ngIf="name === 'bank' || name === 'building'">
        <line x1="3" x2="21" y1="21" y2="21"/>
        <line x1="6" x2="6" y1="18" y2="11"/>
        <line x1="10" x2="10" y1="18" y2="11"/>
        <line x1="14" x2="14" y1="18" y2="11"/>
        <line x1="18" x2="18" y1="18" y2="11"/>
        <polygon points="12 2 20 7 4 7"/>
      </ng-container>

      <!-- Plus -->
      <ng-container *ngIf="name === 'plus'">
        <line x1="12" x2="12" y1="5" y2="19"/>
        <line x1="5" x2="19" y1="12" y2="12"/>
      </ng-container>

      <!-- Minus -->
      <ng-container *ngIf="name === 'minus'">
        <line x1="5" x2="19" y1="12" y2="12"/>
      </ng-container>

      <!-- Tag / Pricing -->
      <ng-container *ngIf="name === 'tag'">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
        <path d="M7 7h.01"/>
      </ng-container>

      <!-- Indian Rupee / Currency -->
      <ng-container *ngIf="name === 'indian-rupee' || name === 'dollar-sign'">
        <path d="M6 3h12"/>
        <path d="M6 8h12"/>
        <path d="m6 13 8.5 8"/>
        <path d="M6 13h3a4 4 0 0 0 0-8"/>
      </ng-container>

      <!-- External Link -->
      <ng-container *ngIf="name === 'external-link'">
        <path d="M15 3h6v6"/>
        <path d="M10 14 21 3"/>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      </ng-container>

      <!-- X / Close -->
      <ng-container *ngIf="name === 'x'">
        <line x1="18" x2="6" y1="6" y2="18"/>
        <line x1="6" x2="18" y1="6" y2="18"/>
      </ng-container>

      <!-- Globe / Website -->
      <ng-container *ngIf="name === 'globe'">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" x2="22" y1="12" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </ng-container>

      <!-- Activity / Pulse -->
      <ng-container *ngIf="name === 'activity'">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </ng-container>

      <!-- Alert Triangle / Warning -->
      <ng-container *ngIf="name === 'alert-triangle'">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" x2="12" y1="9" y2="13"/>
        <line x1="12" x2="12.01" y1="17" y2="17"/>
      </ng-container>

      <!-- Bell / Alert -->
      <ng-container *ngIf="name === 'bell'">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </ng-container>

      <!-- Clock / History -->
      <ng-container *ngIf="name === 'clock'">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </ng-container>

      <!-- Play -->
      <ng-container *ngIf="name === 'play'">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </ng-container>

      <!-- Pause -->
      <ng-container *ngIf="name === 'pause'">
        <rect width="4" height="16" x="6" y="4"/>
        <rect width="4" height="16" x="14" y="4"/>
      </ng-container>

      <!-- Zap / Lightning -->
      <ng-container *ngIf="name === 'zap'">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </ng-container>

      <!-- Layers / Sources -->
      <ng-container *ngIf="name === 'layers'">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </ng-container>

      <!-- Mail / Email -->
      <ng-container *ngIf="name === 'mail'">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </ng-container>

      <!-- Smartphone / Mobile -->
      <ng-container *ngIf="name === 'smartphone'">
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
        <line x1="12" x2="12.01" y1="18" y2="18"/>
      </ng-container>

      <!-- Message Square / WhatsApp -->
      <ng-container *ngIf="name === 'message-square'">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </ng-container>
    </svg>
  `
})
export class IconComponent {
  @Input() name: string = 'layout-dashboard';
  @Input() size: number | string = 18;
  @Input() strokeWidth: number | string = 2;
  @Input() className: string = '';
}
