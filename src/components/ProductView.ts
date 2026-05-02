import { Product } from '../types';
import { Formatters } from '../utils/formatters';

export interface ProductViewCallbacks {
    onClose: () => void;
    onEdit: (product: Product) => void;
}

export class ProductView {
    private container: HTMLElement;
    private callbacks: ProductViewCallbacks;
    private product: Product;

    constructor(container: HTMLElement, callbacks: ProductViewCallbacks, product: Product) {
        this.container = container;
        this.callbacks = callbacks;
        this.product = product;
    }

    render(): void {
        this.container.innerHTML = `
            <div class="product-view">
                <div class="product-view-header">
                    <h2>${this.escapeHtml(this.product.name)}</h2>
                    <div class="product-view-flags">
                        ${this.product.flags.map(f => `
                            <span class="flag">${Formatters.formatFlag(f)}</span>
                        `).join('')}
                    </div>
                </div>

                ${this.renderPhotos()}

                <div class="product-view-section">
                    <h3>Основная информация</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Категория:</span>
                            <span class="value">${Formatters.formatProductCategory(this.product.category)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Готовность:</span>
                            <span class="value">${Formatters.formatCookingRequirement(this.product.cookingRequirement)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Создано:</span>
                            <span class="value">${Formatters.formatDate(this.product.createdAt)}</span>
                        </div>
                        ${this.product.updatedAt ? `
                            <div class="info-item">
                                <span class="label">Обновлено:</span>
                                <span class="value">${Formatters.formatDate(this.product.updatedAt)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="product-view-section">
                    <h3>Пищевая ценность (на 100 г)</h3>
                    <div class="nutrition-grid">
                        <div class="nutrition-card">
                            <div class="nutrition-value">${Formatters.formatNumber(this.product.caloriesPer100g)}</div>
                            <div class="nutrition-label">ккал</div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-value">${Formatters.formatNumber(this.product.proteinsPer100g)}</div>
                            <div class="nutrition-label">Белки (г)</div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-value">${Formatters.formatNumber(this.product.fatsPer100g)}</div>
                            <div class="nutrition-label">Жиры (г)</div>
                        </div>
                        <div class="nutrition-card">
                            <div class="nutrition-value">${Formatters.formatNumber(this.product.carbohydratesPer100g)}</div>
                            <div class="nutrition-label">Углеводы (г)</div>
                        </div>
                    </div>
                </div>

                ${this.product.composition ? `
                    <div class="product-view-section">
                        <h3>Состав</h3>
                        <div class="composition-text">
                            ${this.escapeHtml(this.product.composition)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        this.setupEventListeners();
    }

    private renderPhotos(): string {
        if (!this.product.photoUrls || this.product.photoUrls.length === 0) {
            return `
                <div class="product-view-photos empty">
                    <div class="no-photos">Нет фотографий</div>
                </div>
            `;
        }

        return `
            <div class="product-view-photos">
                ${this.product.photoUrls.map(url => `
                    <img src="${this.escapeHtml(url)}" alt="Фото продукта" class="product-photo">
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
        document.getElementById('edit-product-btn')?.addEventListener('click', () => {
            this.callbacks.onEdit(this.product);
        });

        document.getElementById('close-view-btn')?.addEventListener('click', () => {
            this.callbacks.onClose();
        });
    }
}