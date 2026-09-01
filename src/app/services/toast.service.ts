import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  showSuccess(title: string, message: string) {
    this.addToast('success', title, message);
  }

  showError(title: string, message: string) {
    this.addToast('error', title, message);
  }

  showWarning(title: string, message: string) {
    this.addToast('warning', title, message);
  }

  showInfo(title: string, message: string) {
    this.addToast('info', title, message);
  }

  private addToast(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) {
    const current = this.toasts();
    // Prevent duplicate toast if already showing
    if (current.some(t => t.title === title && t.message === message)) {
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    // Keep max 3 toasts at a time
    const updated = [...current.slice(-2), { id, type, title, message }];
    this.toasts.set(updated);
    
    // Auto remove after 4.5 seconds
    setTimeout(() => {
      this.removeToast(id);
    }, 4500);
  }

  removeToast(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
