import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductViewPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    get productName(): Locator {
        return this.page.locator('.product-view-header h2');
    }

    get productCategory(): Locator {
        return this.page.locator('.info-grid .info-item:nth-child(1) .value');
    }

    get productCooking(): Locator {
        return this.page.locator('.info-grid .info-item:nth-child(2) .value');
    }

    get nutritionGrid(): Locator {
        return this.page.locator('.nutrition-grid');
    }

    get nutritionValues(): Locator {
        return this.page.locator('.nutrition-value');
    }

    get compositionText(): Locator {
        return this.page.locator('.composition-text');
    }

    get photos(): Locator {
        return this.page.locator('.product-photo');
    }

    get noPhotosMessage(): Locator {
        return this.page.locator('.no-photos');
    }

    get editBtn(): Locator {
        return this.page.locator('#edit-product-btn');
    }

    get closeBtn(): Locator {
        return this.page.locator('#close-view-btn');
    }

    async pressEscape(): Promise<void> {
        await this.page.keyboard.press('Escape');
    }

    async getNutritionData(): Promise<{
        calories: string;
        proteins: string;
        fats: string;
        carbs: string;
    }> {
        const values = await this.nutritionValues.allTextContents();
        return {
            calories: values[0] || '0',
            proteins: values[1] || '0',
            fats: values[2] || '0',
            carbs: values[3] || '0'
        };
    }

    async close(): Promise<void> {
        await this.pressEscape();
        await this.page.locator('#form-modal').waitFor({ state: 'hidden' });
    }

    async clickEdit(): Promise<void> {
        await this.editBtn.click();
        await this.page.waitForLoadState('networkidle');
    }
}