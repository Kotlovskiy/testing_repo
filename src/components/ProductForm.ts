import { Product, CreateUpdateProductDto, ProductCategory, CookingRequirement } from '../types';
import { FormValidator } from './common/FormValidator';
import { Validators } from '../utils/validators';
import { MAX_PHOTOS } from '../utils/constants';

export interface ProductFormCallbacks {
    onSubmit: (data: CreateUpdateProductDto) => Promise<void>;
    onCancel: () => void;
}

export class ProductForm {
    private container: HTMLElement;
    private callbacks: ProductFormCallbacks;
    private validator!: FormValidator;
    private product?: Product;
    private photoUrls: string[] = [];

    constructor(container: HTMLElement, callbacks: ProductFormCallbacks, product?: Product) {
        this.container = container;
        this.callbacks = callbacks;
        this.product = product;
        this.photoUrls = product?.photoUrls || [];
    }

    render(): void {
        const title = this.product ? 'Редактирование продукта' : 'Создание продукта';
        
        this.container.innerHTML = `
            <form id="product-form" class="product-form">
                <h3>${title}</h3>
                
                <div class="form-group">
                    <label for="name">Название *</label>
                    <input type="text" id="name" name="name" 
                           value="${this.product?.name || ''}" 
                           placeholder="Введите название продукта">
                </div>
                
                <div class="form-group">
                    <label>Фотографии (до ${MAX_PHOTOS})</label>
                    <div class="photos-input">
                        ${this.renderPhotoInputs()}
                    </div>
                    <button type="button" class="btn btn-small" id="add-photo-btn">+ Добавить фото</button>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="caloriesPer100g">Калорийность (ккал/100г) *</label>
                        <input type="number" id="caloriesPer100g" name="caloriesPer100g" 
                               value="${this.product?.caloriesPer100g || ''}" 
                               step="0.1" min="0">
                    </div>
                </div>
                
                <div class="form-row nutrition-row">
                    <div class="form-group">
                        <label for="proteinsPer100g">Белки (г/100г) *</label>
                        <input type="number" id="proteinsPer100g" name="proteinsPer100g" 
                               value="${this.product?.proteinsPer100g || ''}" 
                               step="0.1" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label for="fatsPer100g">Жиры (г/100г) *</label>
                        <input type="number" id="fatsPer100g" name="fatsPer100g" 
                               value="${this.product?.fatsPer100g || ''}" 
                               step="0.1" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label for="carbohydratesPer100g">Углеводы (г/100г) *</label>
                        <input type="number" id="carbohydratesPer100g" name="carbohydratesPer100g" 
                               value="${this.product?.carbohydratesPer100g || ''}" 
                               step="0.1" min="0" max="100">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="composition">Состав</label>
                    <textarea id="composition" name="composition" rows="3" 
                              placeholder="Опишите состав продукта">${this.product?.composition || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="category">Категория *</label>
                        <select id="category" name="category">
                            <option value="">Выберите категорию</option>
                            ${this.renderCategoryOptions()}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="cookingRequirement">Готовность *</label>
                        <select id="cookingRequirement" name="cookingRequirement">
                            <option value="">Выберите готовность</option>
                            ${this.renderCookingOptions()}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Дополнительные флаги</label>
                    <div class="flags-input">
                        <label class="checkbox-label">
                            <input type="checkbox" value="Vegan" name="flags" 
                                   ${this.product?.flags.includes('Vegan') ? 'checked' : ''}>
                            Веган
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" value="GlutenFree" name="flags" 
                                   ${this.product?.flags.includes('GlutenFree') ? 'checked' : ''}>
                            Без глютена
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" value="SugarFree" name="flags" 
                                   ${this.product?.flags.includes('SugarFree') ? 'checked' : ''}>
                            Без сахара
                        </label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-btn">Отмена</button>
                    <button type="submit" class="btn btn-primary">${this.product ? 'Сохранить' : 'Создать'}</button>
                </div>
            </form>
        `;
        
        const form = this.container.querySelector('#product-form') as HTMLFormElement;
        if (form) {
            this.validator = new FormValidator(form);
            this.setupEventListeners(form);
        }
    }

    private renderPhotoInputs(): string {
        let html = '';
        for (let i = 0; i < Math.max(this.photoUrls.length, 1); i++) {
            html += `
                <div class="photo-input-group">
                    <input type="text" class="photo-url" value="${this.photoUrls[i] || ''}" 
                           placeholder="URL фотографии" data-index="${i}">
                    ${i > 0 ? '<button type="button" class="btn-icon remove-photo">✕</button>' : ''}
                </div>
            `;
        }
        return html;
    }

    private renderCategoryOptions(): string {
        const categories = Object.entries(ProductCategory);
        return categories.map(([key, value]) => `
            <option value="${value}" ${this.product?.category === value ? 'selected' : ''}>
                ${this.formatCategoryLabel(value)}
            </option>
        `).join('');
    }

    private renderCookingOptions(): string {
        const requirements = Object.entries(CookingRequirement);
        return requirements.map(([key, value]) => `
            <option value="${value}" ${this.product?.cookingRequirement === value ? 'selected' : ''}>
                ${this.formatCookingLabel(value)}
            </option>
        `).join('');
    }

    private formatCategoryLabel(category: string): string {
        const labels: Record<string, string> = {
            'Frozen': 'Замороженный',
            'Meat': 'Мясной',
            'Vegetables': 'Овощи',
            'Greens': 'Зелень',
            'Spices': 'Специи',
            'Grains': 'Крупы',
            'Canned': 'Консервы',
            'Liquid': 'Жидкость',
            'Sweets': 'Сладости'
        };
        return labels[category] || category;
    }

    private formatCookingLabel(requirement: string): string {
        const labels: Record<string, string> = {
            'ReadyToEat': 'Готовый к употреблению',
            'SemiFinished': 'Полуфабрикат',
            'NeedsCooking': 'Требует приготовления'
        };
        return labels[requirement] || requirement;
    }

    private setupEventListeners(form: HTMLFormElement): void {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const isValid = this.validator.validate([
                () => this.validateForm()
            ]);
            
            if (isValid) {
                const data = this.getFormData();
                await this.callbacks.onSubmit(data);
            }
        });
        
        const cancelBtn = form.querySelector('#cancel-btn');
        cancelBtn?.addEventListener('click', () => {
            this.callbacks.onCancel();
        });
        
        const addPhotoBtn = form.querySelector('#add-photo-btn');
        addPhotoBtn?.addEventListener('click', () => {
            this.syncPhotoInputs();   // Сохраняем то, что уже введено
            if (this.photoUrls.length < MAX_PHOTOS) {
                this.photoUrls.push('');
                this.updatePhotoInputs();
            }
        });
        
        // Делегирование событий для динамических элементов
        form.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('remove-photo')) {
                const group = target.closest('.photo-input-group');
                const input = group?.querySelector('input');
                const index = parseInt(input?.dataset.index || '0');
                this.syncPhotoInputs();   // Сохраняем все поля
                this.photoUrls.splice(index, 1);
                this.updatePhotoInputs();
            }
        });
    }

    private syncPhotoInputs(): void {
        const inputs = this.container.querySelectorAll('.photo-url') as NodeListOf<HTMLInputElement>;
        this.photoUrls = Array.from(inputs).map(input => input.value.trim());
    }

    private updatePhotoInputs(): void {
        const photosContainer = this.container.querySelector('.photos-input');
        if (photosContainer) {
            photosContainer.innerHTML = this.renderPhotoInputs();
        }
        
        const addBtn = this.container.querySelector('#add-photo-btn') as HTMLButtonElement | null;
        if (addBtn) {
            addBtn.style.display = this.photoUrls.length >= MAX_PHOTOS ? 'none' : '';
        }
    }

    private validateForm(): Record<string, string> {
        const data = this.getFormData();
        return Validators.validateProduct(data);
    }

    private getFormData(): CreateUpdateProductDto {
        const form = document.getElementById('product-form') as HTMLFormElement;
        const formData = new FormData(form);
        
        // Синхронизируем фото, чтобы взять актуальные значения
        this.syncPhotoInputs();
        const photoUrls = [...this.photoUrls];
        
        const flags: string[] = [];
        formData.getAll('flags').forEach(flag => flags.push(flag as string));
        
        return {
            name: (formData.get('name') as string) || '',
            photoUrls: photoUrls.length > 0 ? photoUrls : null,
            caloriesPer100g: parseFloat(formData.get('caloriesPer100g') as string) || 0,
            proteinsPer100g: parseFloat(formData.get('proteinsPer100g') as string) || 0,
            fatsPer100g: parseFloat(formData.get('fatsPer100g') as string) || 0,
            carbohydratesPer100g: parseFloat(formData.get('carbohydratesPer100g') as string) || 0,
            composition: (formData.get('composition') as string) || null,
            category: formData.get('category') as string,
            cookingRequirement: formData.get('cookingRequirement') as string,
            flags
        };
    }
}