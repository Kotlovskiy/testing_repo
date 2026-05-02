import { Dish, CreateUpdateDishDto, Product, DishProductInputDto, DishCategory } from '../types';
import { FormValidator } from './common/FormValidator';
import { NutritionInput, Validators } from '../utils/validators';
import { DISH_CATEGORY_MACROS, MAX_PHOTOS } from '../utils/constants';
import { Formatters } from '../utils/formatters';
import { productService } from '../services/productService';

export interface DishFormCallbacks {
    onSubmit: (data: CreateUpdateDishDto) => Promise<void>;
    onCancel: () => void;
}

export class DishForm {
    private container: HTMLElement;
    private callbacks: DishFormCallbacks;
    private validator!: FormValidator;
    private dish?: Dish;
    private photoUrls: string[] = [];
    private composition: DishProductInputDto[] = [];
    private availableProducts: Product[] = [];
    private autoCalculatedNutrition = { calories: 0, proteins: 0, fats: 0, carbs: 0 };

    constructor(container: HTMLElement, callbacks: DishFormCallbacks, dish?: Dish) {
        this.container = container;
        this.callbacks = callbacks;
        this.dish = dish;
        this.photoUrls = dish?.photoUrls || [];
        this.composition = dish?.composition.map(c => ({
            productId: c.productId,
            quantityGrams: c.quantityGrams
        })) || [];
    }

    async render(): Promise<void> {
        await this.loadProducts();
        
        const title = this.dish ? 'Редактирование блюда' : 'Создание блюда';
        
        this.container.innerHTML = `
            <form id="dish-form" class="dish-form">
                <h3>${title}</h3>
                
                <div class="form-group">
                    <label for="name">Название *</label>
                    <input type="text" id="name" name="name" 
                           value="${this.dish?.name || ''}" 
                           placeholder="Введите название блюда (можно использовать макросы: !десерт, !первое и т.д.)">
                    <small class="hint">Макросы: !десерт, !первое, !второе, !напиток, !салат, !суп, !перекус</small>
                </div>
                
                <div class="form-group">
                    <label>Фотографии (до ${MAX_PHOTOS})</label>
                    <div class="photos-input">
                        ${this.renderPhotoInputs()}
                    </div>
                    <button type="button" class="btn btn-small" id="add-photo-btn">+ Добавить фото</button>
                </div>
                
                <div class="form-group">
                    <label for="servingSizeGrams">Размер порции (г) *</label>
                    <input type="number" id="servingSizeGrams" name="servingSizeGrams" 
                           value="${this.dish?.servingSizeGrams || ''}" 
                           step="0.1" min="0.1" placeholder="Вес одной порции">
                </div>
                
                <div class="form-group">
                    <label>Состав блюда *</label>
                    <div class="composition-section">
                        <div class="composition-list" id="composition-list">
                            ${this.renderCompositionItems()}
                        </div>
                        <div class="add-composition">
                            <select id="product-select" class="product-select">
                                <option value="">Выберите продукт</option>
                                ${this.availableProducts.map(p => `
                                    <option value="${p.id}">${this.escapeHtml(p.name)}</option>
                                `).join('')}
                            </select>
                            <input type="number" id="quantity-input" placeholder="Кол-во (г)" step="0.1" min="0.1" value="100">
                            <button type="button" class="btn btn-small" id="add-composition-btn">Добавить</button>
                        </div>
                    </div>
                </div>
                
                <div class="form-row nutrition-row">
                    <div class="form-group">
                        <label for="caloriesPerServing">Калорийность (ккал/порция)</label>
                        <input type="number" id="caloriesPerServing" name="caloriesPerServing" 
                               value="${this.dish?.caloriesPerServing || ''}" 
                               step="0.1" min="0" placeholder="Авторасчёт">
                        <button type="button" class="btn btn-small" id="auto-calc-btn">Авторасчёт</button>
                    </div>
                </div>
                
                <div class="form-row nutrition-row">
                    <div class="form-group">
                        <label for="proteinsPerServing">Белки (г/порция)</label>
                        <input type="number" id="proteinsPerServing" name="proteinsPerServing" 
                               value="${this.dish?.proteinsPerServing || ''}" 
                               step="0.1" min="0" placeholder="Авторасчёт">
                    </div>
                    <div class="form-group">
                        <label for="fatsPerServing">Жиры (г/порция)</label>
                        <input type="number" id="fatsPerServing" name="fatsPerServing" 
                               value="${this.dish?.fatsPerServing || ''}" 
                               step="0.1" min="0" placeholder="Авторасчёт">
                    </div>
                    <div class="form-group">
                        <label for="carbohydratesPerServing">Углеводы (г/порция)</label>
                        <input type="number" id="carbohydratesPerServing" name="carbohydratesPerServing" 
                               value="${this.dish?.carbohydratesPerServing || ''}" 
                               step="0.1" min="0" placeholder="Авторасчёт">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="category">Категория</label>
                    <select id="category" name="category">
                        <option value="">Будет определена автоматически</option>
                        ${this.renderCategoryOptions()}
                    </select>
                    <small class="hint">Если не указана, категория определится из макроса в названии</small>
                </div>
                
                <div class="form-group">
                    <label>Дополнительные флаги</label>
                    <div class="flags-input">
                        ${this.renderFlagsInput()}
                    </div>
                    <small class="hint" id="flags-hint"></small>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-btn">Отмена</button>
                    <button type="submit" class="btn btn-primary">${this.dish ? 'Сохранить' : 'Создать'}</button>
                </div>
            </form>
        `;
        
        const form = document.getElementById('dish-form') as HTMLFormElement;
        if (form) {
            this.validator = new FormValidator(form);
            this.setupEventListeners(form);
            this.updateFlagsAvailability();
        }
    }

    private async loadProducts(): Promise<void> {
        try {
            this.availableProducts = await productService.getAll();
        } catch (error) {
            console.error('Failed to load products:', error);
            this.availableProducts = [];
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

    private renderCompositionItems(): string {
        if (this.composition.length === 0) {
            return '<div class="empty-composition">Добавьте ингредиенты</div>';
        }
        return this.composition.map((item, index) => {
            const product = this.availableProducts.find(p => p.id === item.productId);
            return this.renderCompositionItem(item, index, product);
        }).join('');
    }

    private renderCompositionItem(item: DishProductInputDto, index: number, product?: Product): string {
        const productName = product ? product.name : `Продукт #${item.productId}`;
        
        return `
            <div class="composition-item" data-index="${index}">
                <span class="composition-product">${this.escapeHtml(productName)}</span>
                <span class="composition-quantity">${Formatters.formatNumber(item.quantityGrams)} г</span>
                <button type="button" class="btn-icon remove-composition" data-index="${index}">✕</button>
                <input type="hidden" name="composition[${index}].productId" value="${item.productId}">
                <input type="hidden" name="composition[${index}].quantityGrams" value="${item.quantityGrams}">
            </div>
        `;
    }

    private renderCategoryOptions(): string {
        const categories = Object.entries(DishCategory);
        return categories.map(([key, value]) => `
            <option value="${value}" ${this.dish?.category === value ? 'selected' : ''}>
                ${Formatters.formatDishCategory(value)}
            </option>
        `).join('');
    }

    private renderFlagsInput(): string {
        const availableFlags = this.getAvailableFlags();
        
        return `
            <label class="checkbox-label ${!availableFlags.includes('Vegan') ? 'disabled' : ''}">
                <input type="checkbox" value="Vegan" name="flags" 
                       ${this.dish?.flags.includes('Vegan') ? 'checked' : ''}
                       ${!availableFlags.includes('Vegan') ? 'disabled' : ''}>
                Веган
            </label>
            <label class="checkbox-label ${!availableFlags.includes('GlutenFree') ? 'disabled' : ''}">
                <input type="checkbox" value="GlutenFree" name="flags" 
                       ${this.dish?.flags.includes('GlutenFree') ? 'checked' : ''}
                       ${!availableFlags.includes('GlutenFree') ? 'disabled' : ''}>
                Без глютена
            </label>
            <label class="checkbox-label ${!availableFlags.includes('SugarFree') ? 'disabled' : ''}">
                <input type="checkbox" value="SugarFree" name="flags" 
                       ${this.dish?.flags.includes('SugarFree') ? 'checked' : ''}
                       ${!availableFlags.includes('SugarFree') ? 'disabled' : ''}>
                Без сахара
            </label>
        `;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
            // Сохраняем текущий ввод из полей перед изменением массива
            this.syncPhotoInputs();
            if (this.photoUrls.length < MAX_PHOTOS) {
                this.photoUrls.push('');
                this.updatePhotoInputs();
            }
        });
        
        const addCompositionBtn = form.querySelector('#add-composition-btn');
        addCompositionBtn?.addEventListener('click', () => {
            this.addCompositionItem();
        });
        
        const autoCalcBtn = form.querySelector('#auto-calc-btn');
        autoCalcBtn?.addEventListener('click', () => {
            this.calculateNutrition();
            this.fillNutritionFields();
        });
        
        const nameInput = form.querySelector('#name');
        nameInput?.addEventListener('input', () => {
            this.updateCategoryFromMacro();
        });
        
        const servingInput = form.querySelector('#servingSizeGrams');
        servingInput?.addEventListener('input', () => {
            this.calculateNutrition();
        });
        
        // Делегирование для динамических элементов
        form.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            
            if (target.classList.contains('remove-photo')) {
                const group = target.closest('.photo-input-group');
                const input = group?.querySelector('input');
                const index = parseInt(input?.dataset.index || '0');
                // Синхронизируем ВСЕ поля перед удалением, чтобы сохранить ввод
                this.syncPhotoInputs();
                this.photoUrls.splice(index, 1);
                this.updatePhotoInputs();
            }
            
            if (target.classList.contains('remove-composition')) {
                const index = parseInt(target.dataset.index || '0');
                this.composition.splice(index, 1);
                this.updateCompositionList();
                this.updateFlagsInput();
                this.calculateNutrition();
                this.updateFlagsAvailability();
            }
        });
    }

    /**
     * Считывает актуальные значения из всех видимых полей .photo-url и записывает их в this.photoUrls.
     * Необходимо для сохранения ввода пользователя перед обновлением DOM.
     */
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
            if (this.photoUrls.length >= MAX_PHOTOS) {
                addBtn.style.display = 'none';
            } else {
                addBtn.style.display = '';
            }
        }
    }

    private updateCompositionList(): void {
        const listContainer = this.container.querySelector('#composition-list');
        if (listContainer) {
            listContainer.innerHTML = this.renderCompositionItems();
        }
    }

    private updateFlagsInput(): void {
        const flagsContainer = this.container.querySelector('.flags-input');
        if (flagsContainer) {
            flagsContainer.innerHTML = this.renderFlagsInput();
        }
    }

    private addCompositionItem(): void {
        const select = document.getElementById('product-select') as HTMLSelectElement;
        const quantityInput = document.getElementById('quantity-input') as HTMLInputElement;
        
        const productId = parseInt(select.value);
        const quantity = parseFloat(quantityInput.value);
        
        if (!productId || !quantity || quantity <= 0) {
            alert('Выберите продукт и укажите количество');
            return;
        }
        
        const existingIndex = this.composition.findIndex(c => c.productId === productId);
        if (existingIndex >= 0) {
            this.composition[existingIndex].quantityGrams += quantity;
        } else {
            this.composition.push({ productId, quantityGrams: quantity });
        }
        
        // Очищаем поля выбора
        select.value = '';
        quantityInput.value = '100';
        
        this.updateCompositionList();
        this.updateFlagsInput();
        this.calculateNutrition();
        this.updateFlagsAvailability();
    }

    private calculateNutrition(): void {
        let products: NutritionInput[] = []
        
        this.composition.forEach(item => {
            const product = this.availableProducts.find(p => p.id === item.productId);
            if (product) {
                products.push({
                    productNutrition: {
                        caloriesPer100g: product.caloriesPer100g,
                        proteinsPer100g: product.proteinsPer100g,
                        fatsPer100g: product.fatsPer100g,
                        carbohydratesPer100g: product.carbohydratesPer100g
                    },
                    quantityGrams: item.quantityGrams
                })
            }
        });

        const nutritions = Validators.calculateNutrition(products)
        
        this.autoCalculatedNutrition = {
            calories: nutritions.calories,
            proteins: nutritions.proteins,
            fats: nutritions.fats,
            carbs: nutritions.carbohydrates
        };
    }

    private fillNutritionFields(): void {
        const calInput = document.getElementById('caloriesPerServing') as HTMLInputElement;
        const protInput = document.getElementById('proteinsPerServing') as HTMLInputElement;
        const fatInput = document.getElementById('fatsPerServing') as HTMLInputElement;
        const carbInput = document.getElementById('carbohydratesPerServing') as HTMLInputElement;
        
        calInput.value = Formatters.formatNumber(this.autoCalculatedNutrition.calories, 1);
        protInput.value = Formatters.formatNumber(this.autoCalculatedNutrition.proteins, 1);
        fatInput.value = Formatters.formatNumber(this.autoCalculatedNutrition.fats, 1);
        carbInput.value = Formatters.formatNumber(this.autoCalculatedNutrition.carbs, 1);
    }

    private updateCategoryFromMacro(): void {
        const nameInput = document.getElementById('name') as HTMLInputElement;
        const name = nameInput.value.toLowerCase();
        
        for (const [macro, category] of Object.entries(DISH_CATEGORY_MACROS)) {
            if (name.includes(macro.toLowerCase())) {
                const categorySelect = document.getElementById('category') as HTMLSelectElement;
                if (!categorySelect.value) {
                    // Не переопределяем, если пользователь уже выбрал категорию
                }
                break;
            }
        }
    }

    private getAvailableFlags(): string[] {
        if (this.composition.length === 0) return [];
        
        const compositionProducts = this.composition
            .map(c => this.availableProducts.find(p => p.id === c.productId))
            .filter((p): p is Product => p !== undefined);
        
        if (compositionProducts.length !== this.composition.length) return [];
        
        const allVegan = compositionProducts.every(p => p.flags.includes('Vegan'));
        const allGlutenFree = compositionProducts.every(p => p.flags.includes('GlutenFree'));
        const allSugarFree = compositionProducts.every(p => p.flags.includes('SugarFree'));
        
        const available: string[] = [];
        if (allVegan) available.push('Vegan');
        if (allGlutenFree) available.push('GlutenFree');
        if (allSugarFree) available.push('SugarFree');
        
        return available;
    }

    private updateFlagsAvailability(): void {
        const availableFlags = this.getAvailableFlags();
        const hint = document.getElementById('flags-hint');
        
        if (hint) {
            if (availableFlags.length === 0 && this.composition.length > 0) {
                hint.textContent = 'Для установки флагов все продукты должны иметь соответствующие флаги';
                hint.style.color = '#e67e22';
            } else {
                hint.textContent = '';
            }
        }
    }

    private validateForm(): Record<string, string> {
        const data = this.getFormData();
        return Validators.validateDish(data, this.composition);
    }

    private getFormData(): CreateUpdateDishDto {
        const form = document.getElementById('dish-form') as HTMLFormElement;
        const formData = new FormData(form);
        
        // При сборе данных также синхронизируем фото, чтобы точно взять актуальные значения
        this.syncPhotoInputs();
        const photoUrls = [...this.photoUrls]; // Используем уже синхронизированный массив
        
        const flags: string[] = [];
        formData.getAll('flags').forEach(flag => flags.push(flag as string));
        
        const calories = formData.get('caloriesPerServing') as string;
        const proteins = formData.get('proteinsPerServing') as string;
        const fats = formData.get('fatsPerServing') as string;
        const carbs = formData.get('carbohydratesPerServing') as string;
        
        return {
            name: (formData.get('name') as string) || '',
            photoUrls: photoUrls.length > 0 ? photoUrls : null,
            caloriesPerServing: calories ? parseFloat(calories) : null,
            proteinsPerServing: proteins ? parseFloat(proteins) : null,
            fatsPerServing: fats ? parseFloat(fats) : null,
            carbohydratesPerServing: carbs ? parseFloat(carbs) : null,
            servingSizeGrams: parseFloat(formData.get('servingSizeGrams') as string) || 0,
            category: (formData.get('category') as string) || null,
            flags,
            composition: [...this.composition]
        };
    }
}