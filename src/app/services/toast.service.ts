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
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.update(current => [...current, { id, type, title, message }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(id);
    }, 5000);
  }

  removeToast(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
