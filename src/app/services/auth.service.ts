import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AdminUser } from '../models/alert21.models';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  authToken = signal<string | null>(localStorage.getItem('adminToken'));

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

      if (response && (response.success || response.token)) {
        const token = response.token || response.data?.token;
        if (token) {
          this.authToken.set(token);
          localStorage.setItem('adminToken', token);
        }
        
        const userData = response.user || response.data || {};
        const adminUser: AdminUser = {
          id: userData.id || userData._id || 'ADM-101',
          name: userData.fullName || userData.name || (email === 'admin@example.com' ? 'Satyam Admin' : 'Admin'),
          company: userData.company || 'Alert21 Admin Panel',
          email: userData.email || email,
          role: userData.role || 'ADMIN',
          avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
          lastLogin: new Date().toISOString()
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
}
