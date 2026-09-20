import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { VariableMasterAdminService, VariableCategoryItem } from '../../services/variable-master-admin.service';

@Component({
  selector: 'app-variable-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 text-slate-900">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <app-icon name="layers" [size]="22"></app-icon>
          </div>
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Variable Categories</h1>
            <p class="text-xs text-slate-500 font-medium mt-0.5">Manage taxonomy groupings and classifications for notification engine variables</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            type="button" 
            (click)="openModal()"
            class="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      <!-- Categories Data Table Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div class="relative w-full sm:w-80">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search category name, slug..." 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium">
          </div>
          <span class="text-xs font-semibold text-slate-500">
            Total Taxonomy Categories: <span class="text-indigo-600 font-extrabold">{{ filteredCategories().length }}</span>
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th class="py-3 px-4">Category Name</th>
                <th class="py-3 px-4">Slug Key</th>
                <th class="py-3 px-4">Description</th>
                <th class="py-3 px-4">Order</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngFor="let cat of filteredCategories()" class="hover:bg-slate-50/60 transition-colors">
                <td class="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-xs"></span>
                  <span class="text-sm font-extrabold">{{ cat.name }}</span>
                </td>
                <td class="py-3.5 px-4 font-mono font-bold text-indigo-600">
                  <span class="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md">
                    {{ cat.slug }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-slate-600 max-w-sm text-xs leading-relaxed font-medium">
                  {{ cat.description || 'N/A' }}
                </td>
                <td class="py-3.5 px-4 font-extrabold text-slate-700">#{{ cat.displayOrder || 0 }}</td>
                <td class="py-3.5 px-4">
                  <span 
                    [ngClass]="cat.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'"
                    class="px-2.5 py-1 rounded-full text-[10px] font-black border uppercase">
                    {{ cat.isActive !== false ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right space-x-2">
                  <button 
                    (click)="editCategory(cat)"
                    class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors">
                    Edit
                  </button>
                  <button 
                    (click)="deleteCategory(cat)"
                    class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold border border-rose-100 transition-colors">
                    Delete
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredCategories().length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 font-medium">
                  No categories found matching your query.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Category Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-black text-slate-900">
              {{ isEditing ? 'Edit Category' : 'Create New Category' }}
            </h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveCategory()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.name" 
                name="name" 
                required 
                placeholder="e.g. Authentication & Security"
                (input)="generateSlug()"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Slug Key *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.slug" 
                name="slug" 
                required 
                placeholder="e.g. auth"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-indigo-700 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea 
                [(ngModel)]="formData.description" 
                name="description" 
                rows="3"
                placeholder="Brief explanation of variables grouped under this category"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                <input 
                  type="number" 
                  [(ngModel)]="formData.displayOrder" 
                  name="displayOrder"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select 
                  [(ngModel)]="formData.isActive" 
                  name="isActive"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white">
                  <option [ngValue]="true">Active</option>
                  <option [ngValue]="false">Disabled</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                (click)="closeModal()" 
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                Save Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class VariableCategoriesComponent implements OnInit {
  adminService = inject(VariableMasterAdminService);

  searchQuery = '';
  showModal = false;
  isEditing = false;
  editingId: string | null = null;

  formData: Partial<VariableCategoryItem> = {
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    isActive: true
  };

  ngOnInit() {
    this.adminService.loadCategories();
  }

  filteredCategories(): VariableCategoryItem[] {
    const list = this.adminService.categories();
    if (!this.searchQuery.trim()) return list;
    const q = this.searchQuery.toLowerCase();
    return list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.slug.toLowerCase().includes(q) || 
      (c.description && c.description.toLowerCase().includes(q))
    );
  }

  openModal() {
    this.isEditing = false;
    this.editingId = null;
    this.formData = {
      name: '',
      slug: '',
      description: '',
      displayOrder: this.adminService.categories().length + 1,
      isActive: true
    };
    this.showModal = true;
  }

  editCategory(cat: VariableCategoryItem) {
    this.isEditing = true;
    this.editingId = cat._id || cat.id || null;
    this.formData = {
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      displayOrder: cat.displayOrder || 0,
      isActive: cat.isActive !== false
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  generateSlug() {
    if (!this.isEditing && this.formData.name) {
      this.formData.slug = this.formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }

  async saveCategory() {
    if (!this.formData.name || !this.formData.slug) return;
    if (this.isEditing && this.editingId) {
      const ok = await this.adminService.updateCategory(this.editingId, this.formData);
      if (ok) this.closeModal();
    } else {
      const ok = await this.adminService.createCategory(this.formData);
      if (ok) this.closeModal();
    }
  }

  async deleteCategory(cat: VariableCategoryItem) {
    const id = cat._id || cat.id;
    if (!id) return;
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      await this.adminService.deleteCategory(id);
    }
  }
}
