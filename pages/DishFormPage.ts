import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DishFormPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    get formTitle(): Locator {
        return this.page.locator('#dish-form h3');
    }

    get nameInput(): Locator {
        return this.page.locator('#name');
    }

    get servingSizeInput(): Locator {
        return this.page.locator('#servingSizeGrams');
    }

    get caloriesInput(): Locator {
        return this.page.locator('#caloriesPerServing');
    }

    get proteinsInput(): Locator {
        return this.page.locator('#proteinsPerServing');
    }

    get fatsInput(): Locator {
        return this.page.locator('#fatsPerServing');
    }

    get carbohydratesInput(): Locator {
        return this.page.locator('#carbohydratesPerServing');
    }

    get categorySelect(): Locator {
        return this.page.locator('#category');
    }

    get productSelect(): Locator {
        return this.page.locator('#product-select');
    }

    get quantityInput(): Locator {
        return this.page.locator('#quantity-input');
    }

    get addCompositionBtn(): Locator {
        return this.page.locator('#add-composition-btn');
    }

    get compositionList(): Locator {
        return this.page.locator('#composition-list');
    }

    get compositionItems(): Locator {
        return this.page.locator('.composition-item');
    }

    get emptyComposition(): Locator {
        return this.page.locator('.empty-composition');
    }

    get autoCalcBtn(): Locator {
        return this.page.locator('#auto-calc-btn');
    }

    get veganCheckbox(): Locator {
        return this.page.locator('input[name="flags"][value="Vegan"]');
    }

    get submitBtn(): Locator {
        return this.page.locator('#dish-form button[type="submit"]');
    }

    get cancelBtn(): Locator {
        return this.page.locator('#dish-form #cancel-btn');
    }

    get formErrors(): Locator {
        return this.page.locator('.form-errors');
    }

    async getFormErrors(): Promise<string[]> {
        if (await this.formErrors.isVisible()) {
            return await this.formErrors.locator('div').allTextContents();
        }
        return [];
    }

    async getFieldError(fieldName: string): Promise<string> {
        const input = this.page.locator(`#${fieldName}`);
        const error = input.locator('..').locator('.field-error');
        if (await error.isVisible()) {
            return await error.textContent() || '';
        }
        return '';
    }

    async fillBasicInfo(name: string, servingSize: number): Promise<void> {
        await this.nameInput.fill(name);
        await this.servingSizeInput.fill(servingSize.toString());
    }

    async addIngredient(productName: string, quantity: number): Promise<void> {
        await this.productSelect.selectOption({ label: productName });
        await this.quantityInput.fill(quantity.toString());
        await this.addCompositionBtn.click();
        await this.page.waitForTimeout(300);
    }

    async removeIngredient(index: number): Promise<void> {
        const items = await this.compositionItems.all();
        if (items[index]) {
            await items[index].locator('.remove-composition').click();
            await this.page.waitForTimeout(300);
        }
    }

    async clickAutoCalc(): Promise<void> {
        await this.autoCalcBtn.click();
        await this.page.waitForTimeout(300);
    }

    async submit(): Promise<void> {
        await this.submitBtn.click();
        await this.page.waitForLoadState('networkidle');
    }

    async cancel(): Promise<void> {
        await this.cancelBtn.click();
    }

    async getCompositionCount(): Promise<number> {
        return await this.compositionItems.count();
    }

    async getCompositionProducts(): Promise<string[]> {
        const products: string[] = [];
        const items = await this.compositionItems.all();
        for (const item of items) {
            const name = await item.locator('.composition-product').textContent();
            if (name) products.push(name);
        }
        return products;
    }

    async getNutritionFields(): Promise<{
        calories: string;
        proteins: string;
        fats: string;
        carbs: string;
    }> {
        return {
            calories: await this.caloriesInput.inputValue(),
            proteins: await this.proteinsInput.inputValue(),
            fats: await this.fatsInput.inputValue(),
            carbs: await this.carbohydratesInput.inputValue()
        };
    }
}