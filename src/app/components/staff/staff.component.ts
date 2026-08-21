import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-white">Staff RBAC Management (Foundation Ready)</h2>
          <p class="text-xs text-slate-400">Architecture-ready role-based access control for SUPER_ADMIN, ADMIN, and STAFF roles.</p>
        </div>

        <button class="btn btn-primary btn-sm">
          <app-icon name="user-check" [size]="16"></app-icon>
          <span>Add Staff Member</span>
        </button>
      </div>

      <div class="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
        <h3 class="font-bold text-slate-100 text-sm">Role Access Control Matrix</h3>

        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Permissions Summary</th>
                <th>DLT Approvals</th>
                <th>Provider Configuration</th>
                <th>Global Default Switch</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge badge-primary">SUPER_ADMIN</span></td>
                <td class="text-xs text-slate-300">Full system authority over users, gateways, and logs</td>
                <td><span class="text-emerald-400 font-bold">Allowed</span></td>
                <td><span class="text-emerald-400 font-bold">Allowed</span></td>
                <td><span class="text-emerald-400 font-bold">Allowed</span></td>
              </tr>
              <tr>
                <td><span class="badge badge-purple">ADMIN</span></td>
                <td class="text-xs text-slate-300">User management, DLT approvals, and provider view</td>
                <td><span class="text-emerald-400 font-bold">Allowed</span></td>
                <td><span class="text-emerald-400 font-bold">Allowed</span></td>
                <td><span class="text-rose-400 font-bold">Restricted</span></td>
              </tr>
              <tr>
                <td><span class="badge badge-suspended">STAFF</span></td>
                <td class="text-xs text-slate-300">ReadOnly access to logs and user search</td>
                <td><span class="text-rose-400 font-bold">Restricted</span></td>
                <td><span class="text-rose-400 font-bold">Restricted</span></td>
                <td><span class="text-rose-400 font-bold">Restricted</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class StaffComponent {
  authService = inject(AuthService);
}
