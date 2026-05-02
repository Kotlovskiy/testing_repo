import { Dish } from '../types';
import { Formatters } from '../utils/formatters';

export interface DishViewCallbacks {
    onClose: () => void;
    onEdit: (dish: Dish) => void;
}

export class DishView {
    private container: HTMLElement;
    private callbacks: DishViewCallbacks;
    private dish: Dish;

    constructor(container: HTMLElement, callbacks: DishViewCallbacks, dish: Dish) {
        this.container = container;
        this.callbacks = callbacks;
        this.dish = dish;
    }

    render(): void {
        this.container.innerHTML = `
            <div class="dish-view">
                <div class="dish-view-header">
                    <h2>${this.escapeHtml(this.dish.name)}</h2>
                    <div class="dish-view-flags">
                        ${this.dish.flags.map(f => `
                            <span class="flag">${Formatters.formatFlag(f)}</span>
                        `).join('')}
                    </div>
                </div>
                
                ${this.renderPhotos()}
                
                <div class="dish-view-section">
                    <h3>Основная информация</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Категория:</span>
                            <span class="value">${Formatters.formatDishCategory(this.dish.category)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Размер порции:</span>
                            <span class="value">${Formatters.formatNumber(this.dish.servingSizeGrams)} г</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Создано:</span>
                            <span class="value">${Formatters.formatDate(this.dish.createdAt)}</span>
                        </div>
                        ${this.dish.updatedAt ? `
                            <div class="info-item">
                                <span class="label">Обновлено:</span>
                                <span class="value">${Formatters.formatDate(this.dish.updatedAt)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="dish-view-section">
                    <h3>Пищевая ценность блюда</h3>
                    <div class="nutrition-grid">
                        <div class="nutrition-card">
                            <div class="nutrition-value">${Formatters.formatNumber(this.dish.caloriesPerServing)}</div>
                            <div class="nutrition-label">ккал</div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-value">${Formatters.formatNumber(this.dish.proteinsPerServing)}</div>
                            <div class="nutrition-label">Белки (г)</div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-value">${Formatters.formatNumber(this.dish.fatsPerServing)}</div>
                            <div class="nutrition-label">Жиры (г)</div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-value">${Formatters.formatNumber(this.dish.carbohydratesPerServing)}</div>
                            <div class="nutrition-label">Углеводы (г)</div>
                        </div>
                    </div>
                </div>
                
                <div class="dish-view-section">
                    <h3>Состав (${this.dish.composition.length} ингредиентов)</h3>
                    <div class="composition-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Продукт</th>
                                    <th>Количество (г)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.dish.composition.map(item => `
                                    <tr>
                                        <td>${this.escapeHtml(item.productName)}</td>
                                        <td>${Formatters.formatNumber(item.quantityGrams)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    }

    private renderPhotos(): string {
        if (!this.dish.photoUrls || this.dish.photoUrls.length === 0) {
            return `
                <div class="dish-view-photos empty">
                    <div class="no-photos">Нет фотографий</div>
                </div>
            `;
        }
        
        return `
            <div class="dish-view-photos">
                ${this.dish.photoUrls.map(url => `
                    <img src="${this.escapeHtml(url)}" alt="Фото блюда" class="dish-photo">
                `).join('')}
            </div>
        `;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private setupEventListeners(): void {
        document.getElementById('edit-dish-btn')?.addEventListener('click', () => {
            this.callbacks.onEdit(this.dish);
        });
        
        document.getElementById('close-view-btn')?.addEventListener('click', () => {
            this.callbacks.onClose();
        });
    }
}