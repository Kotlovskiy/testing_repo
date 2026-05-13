import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsListPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    get listHeader(): Locator {
        return this.page.locator('.list-header h2');
    }

    get createProductBtn(): Locator {
        return this.page.locator('#create-product-btn');
    }

    get searchInput(): Locator {
        return this.page.locator('#filter-search');
    }

    get categorySelect(): Locator {
        return this.page.locator('#filter-category');
    }

    get cookingSelect(): Locator {
        return this.page.locator('#filter-cooking');
    }

    get sortSelect(): Locator {
        return this.page.locator('#filter-sort');
    }

    get descendingCheckbox(): Locator {
        return this.page.locator('#filter-descending');
    }

    get veganFilterCheckbox(): Locator {
        return this.page.locator('#filter-vegan');
    }

    get glutenFreeFilterCheckbox(): Locator {
        return this.page.locator('#filter-glutenfree');
    }

    get sugarFreeFilterCheckbox(): Locator {
        return this.page.locator('#filter-sugarfree');
    }

    get resetFiltersBtn(): Locator {
        return this.page.locator('#reset-filters');
    }

    get productCards(): Locator {
        return this.page.locator('.product-card');
    }

    get emptyState(): Locator {
        return this.page.locator('.empty-state');
    }

    get productsGrid(): Locator {
        return this.page.locator('#products-grid');
    }

    async getProductCardByName(name: string): Promise<Locator> {
        return this.productCards.filter({ has: this.page.locator('h3', { hasText: name }) });
    }

    async getProductCount(): Promise<number> {
        await this.waitForPageLoad();
        return await this.productCards.count();
    }

    async clickEditProduct(productName: string): Promise<void> {
        const card = await this.getProductCardByName(productName);
        await card.locator('.edit-product').click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickDeleteProduct(productName: string): Promise<void> {
        const card = await this.getProductCardByName(productName);
        await card.locator('.delete-product').click();
    }

    async clickViewProduct(productName: string): Promise<void> {
        const card = await this.getProductCardByName(productName);
        await card.locator('.view-product').click();
        await this.page.waitForLoadState('networkidle');
    }

    async searchProduct(query: string): Promise<void> {
        await this.searchInput.fill(query);
        await this.page.waitForTimeout(500); // Ожидание дебаунса
        await this.waitForPageLoad();
    }

    async filterByCategory(category: string): Promise<void> {
        await this.categorySelect.selectOption(category);
        await this.waitForPageLoad();
    }

    async filterByCooking(cooking: string): Promise<void> {
        await this.cookingSelect.selectOption(cooking);
        await this.waitForPageLoad();
    }

    async sortBy(field: string): Promise<void> {
        await this.sortSelect.selectOption(field);
        await this.waitForPageLoad();
    }

    async toggleDescending(): Promise<void> {
        await this.descendingCheckbox.check();
        await this.waitForPageLoad();
    }

    async filterByFlag(flag: 'Vegan' | 'GlutenFree' | 'SugarFree'): Promise<void> {
        const checkboxMap = {
            'Vegan': this.veganFilterCheckbox,
            'GlutenFree': this.glutenFreeFilterCheckbox,
            'SugarFree': this.sugarFreeFilterCheckbox
        };
        await checkboxMap[flag].check();
        await this.waitForPageLoad();
    }

    async resetAllFilters(): Promise<void> {
        await this.resetFiltersBtn.click();
        await this.waitForPageLoad();
    }

    async getProductNames(): Promise<string[]> {
        const names: string[] = [];
        const cards = await this.productCards.all();
        for (const card of cards) {
            const name = await card.locator('h3').textContent();
            if (name) names.push(name);
        }
        return names;
    }

    async getProductNutrition(productName: string): Promise<{
        calories: string;
        proteins: string;
        fats: string;
        carbs: string;
    }> {
        const card = await this.getProductCardByName(productName);
        const nutritionValues = await card.locator('.nutrition-item .value').allTextContents();
        return {
            calories: nutritionValues[0] || '0',
            proteins: nutritionValues[1] || '0',
            fats: nutritionValues[2] || '0',
            carbs: nutritionValues[3] || '0'
        };
    }
}