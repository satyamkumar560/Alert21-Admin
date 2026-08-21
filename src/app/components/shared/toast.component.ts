import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none w-80">
      <div *ngFor="let toast of toastService.toasts()" 
           class="pointer-events-auto overflow-hidden rounded-xl bg-white border shadow-xl shadow-slate-200/50 transition-all transform flex"
           [ngClass]="{
             'border-emerald-200': toast.type === 'success',
             'border-rose-200': toast.type === 'error',
             'border-amber-200': toast.type === 'warning',
             'border-indigo-200': toast.type === 'info'
           }">
        
        <!-- Left Color Bar -->
        <div class="w-1.5 shrink-0" 
             [ngClass]="{
               'bg-emerald-500': toast.type === 'success',
               'bg-rose-500': toast.type === 'error',
               'bg-amber-500': toast.type === 'warning',
               'bg-indigo-500': toast.type === 'info'
             }">
        </div>

        <div class="flex-1 p-4 flex gap-3 items-start">
          <!-- Icon -->
          <div class="mt-0.5 shrink-0"
               [ngClass]="{
                 'text-emerald-500': toast.type === 'success',
                 'text-rose-500': toast.type === 'error',
                 'text-amber-500': toast.type === 'warning',
                 'text-indigo-500': toast.type === 'info'
               }">
            <app-icon [name]="getIcon(toast.type)" [size]="20"></app-icon>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h4 class="text-sm font-extrabold text-slate-900 leading-tight">{{ toast.title }}</h4>
            <p class="text-xs text-slate-500 mt-1 leading-snug">{{ toast.message }}</p>
          </div>

          <!-- Close Button -->
          <button (click)="toastService.removeToast(toast.id)" class="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <app-icon name="x" [size]="16"></app-icon>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'alert-triangle';
      case 'info': return 'info';
      default: return 'bell';
    }
  }
}
