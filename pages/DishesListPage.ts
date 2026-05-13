import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DishesListPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    get listHeader(): Locator {
        return this.page.locator('.dish-list .list-header h2');
    }

    get createDishBtn(): Locator {
        return this.page.locator('#create-dish-btn');
    }

    get searchInput(): Locator {
        return this.page.locator('#filter-search');
    }

    get categorySelect(): Locator {
        return this.page.locator('#filter-category');
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

    get dishCards(): Locator {
        return this.page.locator('.dish-card');
    }

    get emptyState(): Locator {
        return this.page.locator('.empty-state');
    }

    async getDishCardByName(name: string): Promise<Locator> {
        return this.dishCards.filter({ has: this.page.locator('h3', { hasText: name }) });
    }

    async getDishCount(): Promise<number> {
        await this.waitForPageLoad();
        return await this.dishCards.count();
    }

    async clickEditDish(dishName: string): Promise<void> {
        const card = await this.getDishCardByName(dishName);
        await card.locator('.edit-dish').click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickDeleteDish(dishName: string): Promise<void> {
        const card = await this.getDishCardByName(dishName);
        await card.locator('.delete-dish').click();
    }

    async clickViewDish(dishName: string): Promise<void> {
        const card = await this.getDishCardByName(dishName);
        await card.locator('.view-dish').click();
        await this.page.waitForLoadState('networkidle');
    }

    async searchDish(query: string): Promise<void> {
        await this.searchInput.fill(query);
        await this.page.waitForTimeout(500);
        await this.waitForPageLoad();
    }

    async filterByCategory(category: string): Promise<void> {
        await this.categorySelect.selectOption(category);
        await this.waitForPageLoad();
    }

    async filterByOneFlag(flag: string): Promise<void> {
        if (flag == 'Vegan') {
            await this.veganFilterCheckbox.check();
            await this.glutenFreeFilterCheckbox.uncheck();
            await this.sugarFreeFilterCheckbox.uncheck();
        } else if(flag == 'GlutenFree') {
            await this.glutenFreeFilterCheckbox.check();
            await this.veganFilterCheckbox.uncheck();
            await this.sugarFreeFilterCheckbox.uncheck();
        } else if(flag == 'SugarFree') {
            await this.sugarFreeFilterCheckbox.check();
            await this.glutenFreeFilterCheckbox.uncheck();
            await this.veganFilterCheckbox.uncheck();
        }
        await this.waitForPageLoad();
    }

    async resetFlags(): Promise<void> {
        await this.sugarFreeFilterCheckbox.uncheck();
        await this.glutenFreeFilterCheckbox.uncheck();
        await this.veganFilterCheckbox.uncheck();
        await this.waitForPageLoad();
    }

    async getDishNames(): Promise<string[]> {
        const names: string[] = [];
        const cards = await this.dishCards.all();
        for (const card of cards) {
            const name = await card.locator('h3').textContent();
            if (name) names.push(name);
        }
        return names;
    }
}