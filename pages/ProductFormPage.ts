import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductFormPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    get formTitle(): Locator {
        return this.page.locator('#product-form h3');
    }

    get nameInput(): Locator {
        return this.page.locator('#name');
    }

    get caloriesInput(): Locator {
        return this.page.locator('#caloriesPer100g');
    }

    get proteinsInput(): Locator {
        return this.page.locator('#proteinsPer100g');
    }

    get fatsInput(): Locator {
        return this.page.locator('#fatsPer100g');
    }

    get carbohydratesInput(): Locator {
        return this.page.locator('#carbohydratesPer100g');
    }

    get compositionTextarea(): Locator {
        return this.page.locator('#composition');
    }

    get categorySelect(): Locator {
        return this.page.locator('#category');
    }

    get cookingRequirementSelect(): Locator {
        return this.page.locator('#cookingRequirement');
    }

    get veganCheckbox(): Locator {
        return this.page.locator('input[name="flags"][value="Vegan"]');
    }

    get glutenFreeCheckbox(): Locator {
        return this.page.locator('input[name="flags"][value="GlutenFree"]');
    }

    get sugarFreeCheckbox(): Locator {
        return this.page.locator('input[name="flags"][value="SugarFree"]');
    }

    get addPhotoBtn(): Locator {
        return this.page.locator('#add-photo-btn');
    }

    get deletePhotoBtn(): Locator {
        return this.page.locator('.remove-photo').last();
    }

    get photoInputs(): Locator {
        return this.page.locator('.photo-url');
    }

    get submitBtn(): Locator {
        return this.page.locator('#product-form button[type="submit"]');
    }

    get cancelBtn(): Locator {
        return this.page.locator('#product-form #cancel-btn');
    }

    get fieldErrors(): Locator {
        return this.page.locator('.field-error');
    }

    get formErrors(): Locator {
        return this.page.locator('.form-errors');
    }

    async fillProductData(data: {
        name: string;
        calories: number;
        proteins: number;
        fats: number;
        carbs: number;
        composition?: string;
        category: string;
        cookingRequirement: string;
        flags?: string[];
        photos?: string[];
    }): Promise<void> {
        await this.nameInput.fill(data.name);
        await this.caloriesInput.fill(data.calories.toString());
        await this.proteinsInput.fill(data.proteins.toString());
        await this.fatsInput.fill(data.fats.toString());
        await this.carbohydratesInput.fill(data.carbs.toString());
        
        if (data.composition) {
            await this.compositionTextarea.fill(data.composition);
        }
        
        await this.categorySelect.selectOption(data.category);
        await this.cookingRequirementSelect.selectOption(data.cookingRequirement);
        
        if (data.flags) {
            if (data.flags.includes('Vegan')) await this.veganCheckbox.check();
            if (data.flags.includes('GlutenFree')) await this.glutenFreeCheckbox.check();
            if (data.flags.includes('SugarFree')) await this.sugarFreeCheckbox.check();
        }
        
        if (data.photos && data.photos.length > 0) {
            for (var i = 0; i < data.photos.length - 1; ++i) {
                await this.addPhotoBtn.click();
            }
            const inputs = await this.photoInputs.all();
            for (let i = 0; i < data.photos.length; i++) {
                await inputs[i].fill(data.photos[i]);
            }
        }
    }

    async submit(): Promise<void> {
        await this.submitBtn.click();
        await this.page.waitForLoadState('networkidle');
    }

    async cancel(): Promise<void> {
        await this.cancelBtn.click();
    }

    async getFieldError(fieldName: string): Promise<string> {
        const input = this.page.locator(`#${fieldName}`);
        const error = input.locator('..').locator('.field-error');
        if (await error.isVisible()) {
            return await error.textContent() || '';
        }
        return '';
    }

    async getFieldErrorForNumber(fieldName: string): Promise<string> {
        const input = this.page.locator(`#${fieldName}`);
        const validationMessage = await input.evaluate((el: HTMLInputElement) => {
            return el.validationMessage;
        });
        return validationMessage;
    }

    async getFormErrors(): Promise<string[]> {
        if (await this.formErrors.isVisible()) {
            return await this.formErrors.locator('div').allTextContents();
        }
        return [];
    }
}