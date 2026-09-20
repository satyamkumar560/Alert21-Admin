import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface VariableCategoryItem {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface VariableMasterItem {
  id?: string;
  _id?: string;
  variableKey: string;
  displayName: string;
  category: string; // slug or ID
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  isSensitive: boolean;
  maskingPattern?: 'NONE' | 'FULL' | 'LAST4' | 'EMAIL';
  allowedChannels: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    push: boolean;
  };
  sampleValue?: string;
  validationRegex?: string;
  description?: string;
  isActive?: boolean;
}

export interface VariableUsageItem {
  variableKey: string;
  displayName: string;
  category: string;
  dataType: string;
  usageCount: number;
  templatesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class VariableMasterAdminService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private baseUrl = 'https://app.alert21.in/back/api/v1/admin/variables';

  categories = signal<VariableCategoryItem[]>([]);
  variables = signal<VariableMasterItem[]>([]);
  usageStats = signal<VariableUsageItem[]>([]);
  loading = signal<boolean>(false);

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  async loadCategories(): Promise<VariableCategoryItem[]> {
    try {
      this.loading.set(true);
      const res: any = await firstValueFrom(
        this.http.get(`${this.baseUrl}/categories`, this.getHeaders())
      );
      if (res && res.success) {
        const list = res.data || [];
        // Map backend name/slug fields
        const formatted = list.map((c: any) => ({
          _id: c._id || c.id,
          name: c.name || c.category_name,
          slug: c.slug || c.category_slug || (c.name ? c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
          description: c.description || c.category_description || '',
          displayOrder: c.display_order || c.order || 0,
          isActive: c.status ? c.status === 'ACTIVE' : c.isActive !== false
        }));
        this.categories.set(formatted);
        return formatted;
      }
      this.categories.set([]);
      return [];
    } catch (err: any) {
      console.error('Failed to load categories from Live DB API', err);
      this.categories.set([]);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async createCategory(payload: Partial<VariableCategoryItem>): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(
        this.http.post(`${this.baseUrl}/categories`, payload, this.getHeaders())
      );
      if (res && res.success) {
        this.toastService.success('Category created successfully');
        await this.loadCategories();
        return true;
      }
      this.toastService.error(res?.message || 'Failed to create category');
      return false;
    } catch (err: any) {
      this.toastService.error(err?.error?.message || 'Error creating category');
      return false;
    }
  }

  async updateCategory(id: string, payload: Partial<VariableCategoryItem>): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(
        this.http.put(`${this.baseUrl}/categories/${id}`, payload, this.getHeaders())
      );
      if (res && res.success) {
        this.toastService.success('Category updated successfully');
        await this.loadCategories();
        return true;
      }
      this.toastService.error(res?.message || 'Failed to update category');
      return false;
    } catch (err: any) {
      this.toastService.error(err?.error?.message || 'Error updating category');
      return false;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(
        this.http.delete(`${this.baseUrl}/categories/${id}`, this.getHeaders())
      );
      if (res && res.success) {
        this.toastService.success('Category deleted successfully');
        await this.loadCategories();
        return true;
      }
      this.toastService.error(res?.message || 'Failed to delete category');
      return false;
    } catch (err: any) {
      this.toastService.error(err?.error?.message || 'Error deleting category');
      return false;
    }
  }

  async loadVariables(category?: string, search?: string): Promise<VariableMasterItem[]> {
    try {
      this.loading.set(true);
      let url = `${this.baseUrl}?`;
      if (category) url += `category=${encodeURIComponent(category)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res: any = await firstValueFrom(this.http.get(url, this.getHeaders()));
      if (res && res.success) {
        const list = (res.data || []).map((v: any) => ({
          _id: v._id || v.id,
          variableKey: v.variable_key || v.variableKey,
          displayName: v.name || v.displayName || v.variable_key,
          category: v.category_slug || v.category || 'general',
          dataType: (v.data_type || v.dataType || 'string').toLowerCase(),
          isSensitive: !!v.is_sensitive || !!v.isSensitive,
          maskingPattern: v.masking_pattern || v.maskingPattern || 'NONE',
          allowedChannels: {
            sms: v.allowed_channels?.sms !== false,
            whatsapp: v.allowed_channels?.whatsapp !== false,
            email: v.allowed_channels?.email !== false,
            push: v.allowed_channels?.push !== false
          },
          sampleValue: v.sample_value || v.sampleValue || '',
          validationRegex: v.validation_regex || v.validationRegex || '',
          description: v.description || '',
          isActive: v.status ? v.status === 'ACTIVE' : v.isActive !== false
        }));
        this.variables.set(list);
        return list;
      }
      this.variables.set([]);
      return [];
    } catch (err: any) {
      console.error('Failed to load variables from Live DB API', err);
      this.variables.set([]);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async createVariable(payload: Partial<VariableMasterItem>): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(
        this.http.post(this.baseUrl, payload, this.getHeaders())
      );
      if (res && res.success) {
        this.toastService.success('Variable created successfully');
        await this.loadVariables();
        return true;
      }
      this.toastService.error(res?.message || 'Failed to create variable');
      return false;
    } catch (err: any) {
      this.toastService.error(err?.error?.message || 'Error creating variable');
      return false;
    }
  }

  async updateVariable(id: string, payload: Partial<VariableMasterItem>): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(
        this.http.put(`${this.baseUrl}/${id}`, payload, this.getHeaders())
      );
      if (res && res.success) {
        this.toastService.success('Variable updated successfully');
        await this.loadVariables();
        return true;
      }
      this.toastService.error(res?.message || 'Failed to update variable');
      return false;
    } catch (err: any) {
      this.toastService.error(err?.error?.message || 'Error updating variable');
      return false;
    }
  }

  async deleteVariable(id: string): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(
        this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders())
      );
      if (res && res.success) {
        this.toastService.success('Variable deleted successfully');
        await this.loadVariables();
        return true;
      }
      this.toastService.error(res?.message || 'Failed to delete variable');
      return false;
    } catch (err: any) {
      this.toastService.error(err?.error?.message || 'Error deleting variable');
      return false;
    }
  }

  async loadUsageReport(): Promise<VariableUsageItem[]> {
    try {
      this.loading.set(true);
      const res: any = await firstValueFrom(
        this.http.get(`${this.baseUrl}/usage`, this.getHeaders())
      );
      if (res && res.success) {
        const list = (res.data || []).map((u: any) => ({
          variableKey: u.variable_key || u.variableKey,
          displayName: u.display_name || u.displayName || u.variable_key,
          category: u.category || 'general',
          dataType: u.data_type || u.dataType || 'string',
          usageCount: u.usage_count || u.usageCount || 0,
          templatesCount: u.templates_count || u.templatesCount || 0
        }));
        this.usageStats.set(list);
        return list;
      }
      this.usageStats.set([]);
      return [];
    } catch (err: any) {
      console.error('Failed to load usage report from Live DB API', err);
      this.usageStats.set([]);
      return [];
    } finally {
      this.loading.set(false);
    }
  }
}
