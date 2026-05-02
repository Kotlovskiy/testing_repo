import { Dish, DishFilters } from '../types';
import { Formatters } from '../utils/formatters';

export interface DishListCallbacks {
    onEdit: (dish: Dish) => void;
    onDelete: (dish: Dish) => void;
    onView: (dish: Dish) => void;
    onFilterChange: (filters: DishFilters) => void;
    onCreate: () => void;
}

export class DishList {
    private container: HTMLElement;
    private callbacks: DishListCallbacks;
    private filters: DishFilters = {};
    private dishes: Dish[] = [];

    constructor(container: HTMLElement, callbacks: DishListCallbacks) {
        this.container = container;
        this.callbacks = callbacks;
    }

    render(dishes: Dish[]): void {
        this.dishes = dishes;
        
        this.container.innerHTML = `
            <div class="dish-list">
                <div class="list-header">
                    <h2>Блюда</h2>
                    <button class="btn btn-primary" id="create-dish-btn">+ Добавить блюдо</button>
                </div>
                
                <div class="filters-panel">
                    ${this.renderFilters()}
                </div>
                
                <div class="dishes-grid" id="dishes-grid">
                    ${this.renderDishCards()}
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
                        <option value="Dessert" ${this.filters.category === 'Dessert' ? 'selected' : ''}>Десерт</option>
                        <option value="FirstCourse" ${this.filters.category === 'FirstCourse' ? 'selected' : ''}>Первое</option>
                        <option value="SecondCourse" ${this.filters.category === 'SecondCourse' ? 'selected' : ''}>Второе</option>
                        <option value="Drink" ${this.filters.category === 'Drink' ? 'selected' : ''}>Напиток</option>
                        <option value="Salad" ${this.filters.category === 'Salad' ? 'selected' : ''}>Салат</option>
                        <option value="Soup" ${this.filters.category === 'Soup' ? 'selected' : ''}>Суп</option>
                        <option value="Snack" ${this.filters.category === 'Snack' ? 'selected' : ''}>Перекус</option>
                    </select>
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

    private renderDishCards(): string {
        if (this.dishes.length === 0) {
            return '<div class="empty-state">Блюда не найдены</div>';
        }
        
        return this.dishes.map(dish => `
            <div class="dish-card" data-id="${dish.id}">
                <div class="dish-card-header">
                    <h3>${this.escapeHtml(dish.name)}</h3>
                    <div class="dish-flags">
                        ${dish.flags.map(f => `
                            <span class="flag">${Formatters.formatFlag(f)}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="dish-card-body">
                    <div class="dish-category">
                        <span class="label">Категория:</span>
                        <span>${Formatters.formatDishCategory(dish.category)}</span>
                    </div>
                    <div class="dish-serving">
                        <span class="label">Порция:</span>
                        <span>${Formatters.formatNumber(dish.servingSizeGrams)} г</span>
                    </div>
                    <div class="dish-nutrition">
                        <div class="nutrition-item">
                            <span class="value">${Formatters.formatNumber(dish.caloriesPerServing)}</span>
                            <span class="unit">ккал</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="value">${Formatters.formatNumber(dish.proteinsPerServing)}</span>
                            <span class="unit">Б</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="value">${Formatters.formatNumber(dish.fatsPerServing)}</span>
                            <span class="unit">Ж</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="value">${Formatters.formatNumber(dish.carbohydratesPerServing)}</span>
                            <span class="unit">У</span>
                        </div>
                    </div>
                    <div class="dish-composition-count">
                        <span class="label">Ингредиентов:</span>
                        <span>${dish.composition.length}</span>
                    </div>
                </div>
                
                <div class="dish-card-footer">
                    <button class="btn-icon view-dish" data-id="${dish.id}" title="Просмотр">
                        👁️
                    </button>
                    <button class="btn-icon edit-dish" data-id="${dish.id}" title="Редактировать">
                        ✏️
                    </button>
                    <button class="btn-icon delete-dish" data-id="${dish.id}" title="Удалить">
                        🗑️
                    </button>
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
        document.getElementById('create-dish-btn')?.addEventListener('click', () => {
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
        
        ['vegan', 'glutenfree', 'sugarfree'].forEach(id => {
            document.getElementById(`filter-${id}`)?.addEventListener('change', () => {
                this.updateFlagsFilter();
            });
        });
        
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetFilters();
        });
        
        document.querySelectorAll('.view-dish').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
                const dish = this.dishes.find(d => d.id === id);
                if (dish) this.callbacks.onView(dish);
            });
        });
        
        document.querySelectorAll('.edit-dish').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
                const dish = this.dishes.find(d => d.id === id);
                if (dish) this.callbacks.onEdit(dish);
            });
        });
        
        document.querySelectorAll('.delete-dish').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
                const dish = this.dishes.find(d => d.id === id);
                if (dish) this.callbacks.onDelete(dish);
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

    updateFilters(filters: DishFilters): void {
        this.filters = filters;
    }
}