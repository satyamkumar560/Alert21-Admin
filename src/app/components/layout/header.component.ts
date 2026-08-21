import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <header 
      class="h-[70px] bg-white border-b border-slate-200 fixed top-0 right-0 z-30 px-6 flex items-center justify-between shadow-xs transition-all duration-300"
      [ngClass]="isSidebarOpen ? 'left-[260px]' : 'left-0'">
      <!-- Left side: Hamburger Toggle & Environment Badge -->
      <div class="flex items-center gap-4">
        <button 
          (click)="toggleSidebar.emit()"
          type="button" 
          class="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span>Environment: Production</span>
        </div>
      </div>

      <!-- Right side: Admin Profile Pill -->
      <div class="flex items-center gap-3">
        <!-- Clickable Profile Pill Wrapper -->
        <div class="relative">
          <div 
            (click)="showProfileDropdown = !showProfileDropdown"
            title="Click to view Admin Profile"
            class="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full py-1.5 px-3.5 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer shadow-xs group">
            
            <!-- Avatar Circle -->
            <div class="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
              {{ authService.currentAdmin()?.name?.charAt(0) || 'A' }}
            </div>

            <div class="text-left">
              <p class="text-xs font-extrabold text-slate-900 leading-none group-hover:text-indigo-600 transition-all">{{ authService.currentAdmin()?.name }}</p>
              <p class="text-[10px] text-slate-500 font-medium mt-0.5">{{ authService.currentAdmin()?.company }}</p>
            </div>

            <app-icon name="chevron-down" [size]="14" className="text-slate-400 group-hover:text-indigo-600 transition-all ml-1"></app-icon>
          </div>

          <!-- Dropdown Menu -->
          <div *ngIf="showProfileDropdown" class="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 z-50 overflow-hidden">
            <!-- Header -->
            <div class="p-4 border-b border-slate-100">
              <p class="text-sm font-extrabold text-slate-900 truncate">{{ authService.currentAdmin()?.name }}</p>
              <p class="text-xs text-slate-500 font-medium truncate mt-0.5">{{ authService.currentAdmin()?.email }}</p>
            </div>

            <!-- Links -->
            <div class="p-2 flex flex-col">
              <button class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
                <app-icon name="user" [size]="18"></app-icon>
                <span>My Profile</span>
              </button>
            </div>
            
            <div class="p-2 border-t border-slate-100 flex flex-col">
              <button 
                (click)="authService.logout()" 
                class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">
                <app-icon name="power" [size]="18"></app-icon>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        <button 
          (click)="authService.logout()" 
          title="Logout Admin Session" 
          class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100">
          <app-icon name="logout" [size]="18"></app-icon>
        </button>
      </div>
      
      <!-- Backdrop for dropdown -->
      <div *ngIf="showProfileDropdown" class="fixed inset-0 z-40" (click)="showProfileDropdown = false"></div>
    </header>
  `
})
export class HeaderComponent {
  @Input() isSidebarOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  showProfileDropdown = false;
}
