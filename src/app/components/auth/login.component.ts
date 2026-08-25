import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="min-h-screen w-full flex flex-col md:flex-row bg-[#f8fafc] font-sans text-slate-800">
      <!-- Left Branding Banner matching Screenshot 2 EXACTLY -->
      <div class="w-full md:w-7/12 bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#3730a3] p-8 md:p-16 flex flex-col justify-between text-white relative overflow-hidden">
        
        <!-- Top Badge -->
        <div class="relative z-10">
          <div class="inline-flex items-center px-4 py-2 rounded-2xl bg-white shadow-lg">
            <img src="/logo.png" alt="Alert21" class="h-7 w-auto object-contain">
          </div>
        </div>

        <!-- Middle Content -->
        <div class="relative z-10 my-auto space-y-6 max-w-xl py-10">
          <h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Enterprise SMS &<br>Campaign Platform
          </h1>
          <p class="text-indigo-100 text-base md:text-lg leading-relaxed font-medium">
            Connect with millions of customers instantly via high-deliverability SMS, OTP, and automated marketing campaigns.
          </p>

          <!-- 3 Bullet Points matching Screenshot 2 -->
          <div class="pt-4 space-y-4">
            <div class="flex items-center gap-3.5">
              <div class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20 text-white">
                <app-icon name="shield-check" [size]="18"></app-icon>
              </div>
              <span class="font-bold text-sm md:text-base text-white">99.99% Uptime & Bank-Grade Security</span>
            </div>

            <div class="flex items-center gap-3.5">
              <div class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20 text-white">
                <app-icon name="route" [size]="18"></app-icon>
              </div>
              <span class="font-bold text-sm md:text-base text-white">Ultra-Fast OTP & Transactional SMS</span>
            </div>

            <div class="flex items-center gap-3.5">
              <div class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20 text-white">
                <app-icon name="file-text" [size]="18"></app-icon>
              </div>
              <span class="font-bold text-sm md:text-base text-white">Real-time Analytics & Delivery Reports</span>
            </div>
          </div>
        </div>

        <!-- Decorative Background Glows -->
        <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -top-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <!-- Right Form Section matching Screenshot 2 EXACTLY -->
      <div class="w-full md:w-5/12 bg-[#f8fafc] p-6 md:p-12 flex items-center justify-center">
        <div class="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 md:p-10 space-y-6">
          
          <!-- Card Header -->
          <div class="space-y-1.5">
            <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Sign in to Alert21</h2>
            <p class="text-xs md:text-sm text-slate-500 font-medium">Manage your SMS campaigns from one dashboard.</p>
          </div>

          <!-- Error Alert Banner -->
          <div *ngIf="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <app-icon name="alert-triangle" [size]="16" className="text-rose-600"></app-icon>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Login Form matching Screenshot 2 -->
          <form (ngSubmit)="onLogin()" class="space-y-5" autocomplete="off">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700">Email <span class="text-rose-500">*</span></label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                required
                autocomplete="off"
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all">
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700">Password <span class="text-rose-500">*</span></label>
              <div class="relative">
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  [(ngModel)]="password" 
                  name="password" 
                  required
                  autocomplete="new-password"
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10">
                <button 
                  type="button" 
                  (click)="showPassword = !showPassword" 
                  class="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                  <app-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="18"></app-icon>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                <span>Remember me</span>
              </label>

              <a href="#" (click)="$event.preventDefault()" class="text-indigo-600 hover:text-indigo-700 font-semibold">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              [disabled]="isLoading"
              class="w-full bg-[#5c54f6] hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2">
              <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isLoading ? 'Authenticating API...' : 'Sign In' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);

  email = '';
  password = '';
  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage = '';

  async onLogin() {
    if (!this.email) {
      this.errorMessage = 'Please enter an email address.';
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;

    try {
      const result = await this.authService.loginWithApi(this.email, this.password);
      if (!result.success && result.message) {
        this.errorMessage = result.message;
      }
    } catch (err: any) {
      this.errorMessage = 'An error occurred during authentication.';
    } finally {
      this.isLoading = false;
    }
  }
}


