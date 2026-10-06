import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AdminUser, AdminRole } from '../models/alert21.models';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  authToken = signal<string | null>(localStorage.getItem('adminToken'));

  getToken(): string | null {
    return this.authToken() || localStorage.getItem('adminToken');
  }

  currentAdmin = signal<AdminUser | null>(
    localStorage.getItem('adminUser') ? JSON.parse(localStorage.getItem('adminUser')!) : null
  );

  isLoggedIn = computed(() => this.currentAdmin() !== null && this.authToken() !== null);

  /**
   * Integrates live API: POST https://app.alert21.in/back/api/admin/auth/login
   */
  async loginWithApi(email: string, pass: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<any>(environment.authLoginUrl, {
          email: email.trim(),
          password: pass
        })
      );

      if (response && (response.success || response.token || response.data?.token)) {
        const token = response.token || response.data?.token;
        if (token) {
          this.authToken.set(token);
          localStorage.setItem('adminToken', token);
        }
        
        const userData = response.user || response.data?.user || response.data || {};
        const userRole = (userData.role || response.role || 'ADMIN').toUpperCase();

        // Validate that the authenticated account has ADMIN role
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
          return { 
            success: false, 
            message: 'Access Denied: You must have an ADMIN role to access the Alert21 Admin Panel.' 
          };
        }

        const adminUser: AdminUser = {
          id: userData.id || userData._id || '',
          name: userData.fullName || userData.name || userData.username || 'Admin',
          company: userData.companyName || userData.company || 'Scriza Admin',
          email: userData.email || email.trim(),
          role: userRole as AdminRole,
          avatar: userData.avatar || '',
          lastLogin: userData.lastLogin || new Date().toISOString()
        };

        this.currentAdmin.set(adminUser);
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        
        return { success: true };
      } else {
        return { success: false, message: response?.message || 'Invalid admin credentials.' };
      }
    } catch (err: any) {
      return { 
        success: false, 
        message: err?.error?.message || `Failed to authenticate with ${environment.authLoginUrl}` 
      };
    }
  }

  async logout(): Promise<void> {
    const token = this.authToken();
    
    // Attempt to invalidate token on the server
    if (token) {
      try {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        await firstValueFrom(
          this.http.post<any>('https://app.alert21.in/back/api/admin/auth/logout', {}, { headers })
        );
      } catch (e) {
        console.warn('Logout API failed or token already invalid.', e);
      }
    }

    // Always clear local state regardless of API success
    this.currentAdmin.set(null);
    this.authToken.set(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Check if we are in a browser context before navigating, though for Angular standalone app this is fine
    if (this.router) {
      this.router.navigate(['/']);
    }
  }

  canModifyProviders(): boolean {
    return true;
  }

  canApproveDlt(): boolean {
    return true;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken() || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
