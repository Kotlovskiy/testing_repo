import { Product, ProductFilters } from '../types';
import { Formatters } from '../utils/formatters';
import { SORT_OPTIONS } from '../utils/constants';

export interface ProductListCallbacks {
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onView: (product: Product) => void;
    onFilterChange: (filters: ProductFilters) => void;
    onCreate: () => void;
}

export class ProductList {
    private container: HTMLElement;
    private callbacks: ProductListCallbacks;
    private filters: ProductFilters = {};
    private products: Product[] = [];

    constructor(container: HTMLElement, callbacks: ProductListCallbacks) {
        this.container = container;
        this.callbacks = callbacks;
    }

    render(products: Product[]): void {
        this.products = products;
        
        this.container.innerHTML = `
            <div class="product-list">
                <div class="list-header">
                    <h2>Продукты</h2>
                    <button class="btn btn-primary" id="create-product-btn">+ Добавить продукт</button>
                </div>
                
                <div class="filters-panel">
                    ${this.renderFilters()}
                </div>
                
                <div class="products-grid" id="products-grid">
                    ${this.renderProductCards()}
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    }

    private renderFilters(): string {
        const flags = this.filters.flags || [];

        return `
            <div class="filter-row">
                <div class="filter-group">
                    <input type="text" 
                           id="filter-search" 
                           placeholder="Поиск по названию..." 
                           value="${this.filters.search || ''}"
                           class="filter-input">
                </div>
                
                <div class="filter-group">
                    <select id="filter-category" class="filter-select">
                        <option value="">Все категории</option>
                        <option value="Frozen" ${this.filters.category === 'Frozen' ? 'selected' : ''}>Замороженный</option>
                        <option value="Meat" ${this.filters.category === 'Meat' ? 'selected' : ''}>Мясной</option>
                        <option value="Vegetables" ${this.filters.category === 'Vegetables' ? 'selected' : ''}>Овощи</option>
                        <option value="Greens" ${this.filters.category === 'Greens' ? 'selected' : ''}>Зелень</option>
                        <option value="Spices" ${this.filters.category === 'Spices' ? 'selected' : ''}>Специи</option>
                        <option value="Grains" ${this.filters.category === 'Grains' ? 'selected' : ''}>Крупы</option>
                        <option value="Canned" ${this.filters.category === 'Canned' ? 'selected' : ''}>Консервы</option>
                        <option value="Liquid" ${this.filters.category === 'Liquid' ? 'selected' : ''}>Жидкость</option>
                        <option value="Sweets" ${this.filters.category === 'Sweets' ? 'selected' : ''}>Сладости</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <select id="filter-cooking" class="filter-select">
                        <option value="">Любая готовность</option>
                        <option value="ReadyToEat" ${this.filters.cookingRequirement === 'ReadyToEat' ? 'selected' : ''}>Готовый</option>
                        <option value="SemiFinished" ${this.filters.cookingRequirement === 'SemiFinished' ? 'selected' : ''}>Полуфабрикат</option>
                        <option value="NeedsCooking" ${this.filters.cookingRequirement === 'NeedsCooking' ? 'selected' : ''}>Требует готовки</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <select id="filter-sort" class="filter-select">
                        <option value="">Сортировка</option>
                        ${SORT_OPTIONS.map(opt => `
                            <option value="${opt.value}" ${this.filters.sortBy === opt.value ? 'selected' : ''}>
                                ${opt.label}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="filter-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="filter-descending" ${this.filters.descending ? 'checked' : ''}>
                        По убыванию
                    </label>
                </div>
                
                <div class="filter-group flags-filter">
                    <label class="checkbox-label">
                        <input type="checkbox" value="Vegan" id="filter-vegan" ${flags.includes('Vegan') ? 'checked' : ''}>
                        Веган
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" value="GlutenFree" id="filter-glutenfree" ${flags.includes('GlutenFree') ? 'checked' : ''}>
                        Без глютена
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" value="SugarFree" id="filter-sugarfree" ${flags.includes('SugarFree') ? 'checked' : ''}>
                        Без сахара
                    </label>
                </div>
                
                <button class="btn btn-secondary" id="reset-filters">Сбросить</button>
            </div>
        `;
    }

    private renderProductCards(): string {
        if (this.products.length === 0) {
            return '<div class="empty-state">Продукты не найдены</div>';
        }
        
        return this.products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-card-header">
                    <h3>${this.escapeHtml(product.name)}</h3>
                    <div class="product-flags">
                        ${product.flags.map(f => `
                            <span class="flag">${Formatters.formatFlag(f)}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="product-card-body">
                    <div class="product-category">
                        <span class="label">Категория:</span>
                        <span>${Formatters.formatProductCategory(product.category)}</span>
                    </div>
                    <div class="product-cooking">
                        <span class="label">Готовность:</span>
                        <span>${Formatters.formatCookingRequirement(product.cookingRequirement)}</span>
                    </div>
                    <div class="product-nutrition">
                        <div class="nutrition-item">
                            <span class="value">${Formatters.formatNumber(product.caloriesPer100g)}</span>
                            <span class="unit">ккал</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="value">${Formatters.formatNumber(product.proteinsPer100g)}</span>
                            <span class="unit">Б</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="value">${Formatters.formatNumber(product.fatsPer100g)}</span>
                            <span class="unit">Ж</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="value">${Formatters.formatNumber(product.carbohydratesPer100g)}</span>
                            <span class="unit">У</span>
                        </div>
                    </div>
                </div>
                
                <div class="product-card-footer">
                    <button class="btn-icon view-product" data-id="${product.id}" title="Просмотр">👁️</button>
                    <button class="btn-icon edit-product" data-id="${product.id}" title="Редактировать">✏️</button>
                    <button class="btn-icon delete-product" data-id="${product.id}" title="Удалить">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private setupEventListeners(): void {
        document.getElementById('create-product-btn')?.addEventListener('click', () => {
            this.callbacks.onCreate();
        });
        
        document.getElementById('filter-search')?.addEventListener('input', (e) => {
            this.filters.search = (e.target as HTMLInputElement).value;
            this.callbacks.onFilterChange(this.filters);
        });
        
        document.getElementById('filter-category')?.addEventListener('change', (e) => {
            this.filters.category = (e.target as HTMLSelectElement).value || undefined;
            this.callbacks.onFilterChange(this.filters);
        });
        
        document.getElementById('filter-cooking')?.addEventListener('change', (e) => {
            this.filters.cookingRequirement = (e.target as HTMLSelectElement).value || undefined;
            this.callbacks.onFilterChange(this.filters);
        });
        
        document.getElementById('filter-sort')?.addEventListener('change', (e) => {
            this.filters.sortBy = (e.target as HTMLSelectElement).value || undefined;
            this.callbacks.onFilterChange(this.filters);
        });
        
        document.getElementById('filter-descending')?.addEventListener('change', (e) => {
            this.filters.descending = (e.target as HTMLInputElement).checked;
            this.callbacks.onFilterChange(this.filters);
        });
        
        ['vegan', 'glutenfree', 'sugarfree'].forEach(id => {
            document.getElementById(`filter-${id}`)?.addEventListener('change', () => {
                this.updateFlagsFilter();
            });
        });
        
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetFilters();
        });
        
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
                const product = this.products.find(p => p.id === id);
                if (product) this.callbacks.onEdit(product);
            });
        });
        
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
                const product = this.products.find(p => p.id === id);
                if (product) this.callbacks.onDelete(product);
            });
        });

        document.querySelectorAll('.view-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
                const product = this.products.find(p => p.id === id);
                if (product) this.callbacks.onView(product);
            });
        });
    }

    private updateFlagsFilter(): void {
        const flags: string[] = [];
        
        if ((document.getElementById('filter-vegan') as HTMLInputElement)?.checked) {
            flags.push('Vegan');
        }
        if ((document.getElementById('filter-glutenfree') as HTMLInputElement)?.checked) {
            flags.push('GlutenFree');
        }
        if ((document.getElementById('filter-sugarfree') as HTMLInputElement)?.checked) {
            flags.push('SugarFree');
        }
        
        this.filters.flags = flags.length > 0 ? flags : undefined;
        this.callbacks.onFilterChange(this.filters);
    }

    private resetFilters(): void {
        this.filters = {};
        this.callbacks.onFilterChange(this.filters);
    }

    updateFilters(filters: ProductFilters): void {
        this.filters = filters;
    }
}