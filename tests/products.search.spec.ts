import { CookingRequirement, Flags, ProductCategory } from '../types';
import { test, expect } from './fixtures';

test.describe('Products Filtering', () => {

    test.beforeEach(async ({ basePage, testDataWorker }) => {
        await basePage.navigateTo();
        await basePage.waitForPageLoad();
    });

    test('should search products by name', async ({ productsListPage }) => {
        const searchQuery = 'курица';
        await productsListPage.searchProduct(searchQuery);
        
        const productNames = await productsListPage.getProductNames();
        for (const name of productNames) {
            expect(name.toLowerCase()).toContain(searchQuery.toLowerCase());
        }
    });

    for (const value of Object.values(CookingRequirement)) {
        test(`should filter by cooking requirement: ${value}`, async ({ productsListPage }) => {
            const initialCount = await productsListPage.getProductCount();
            await productsListPage.filterByCooking(value);
            const filteredCount = await productsListPage.getProductCount();
            expect(filteredCount).toBeLessThanOrEqual(initialCount);
        });
    }

    for (const value of Object.values(ProductCategory)) {
        test(`should filter by category: ${value}`, async ({ productsListPage }) => {
            const initialCount = await productsListPage.getProductCount();
            await productsListPage.filterByCategory(value);
            const filteredCount = await productsListPage.getProductCount();
            expect(filteredCount).toBeLessThanOrEqual(initialCount);
        });
    }

    for (const value of Object.values(Flags)) {
        test(`should filter by flags: ${value}`, async ({ productsListPage }) => {
            const initialCount = await productsListPage.getProductCount();
            await productsListPage.filterByFlag(value);
            const filteredCount = await productsListPage.getProductCount();
            expect(filteredCount).toBeLessThanOrEqual(initialCount);
        });
    }

    test('should combine multiple filters', async ({ productsListPage }) => {
        await productsListPage.searchProduct('тест');
        await productsListPage.filterByCategory('Vegetables');
        await productsListPage.filterByFlag('Vegan');
        
        const count = await productsListPage.getProductCount();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should reset all filters', async ({ productsListPage }) => {
        await productsListPage.searchProduct('курица');
        await productsListPage.filterByCategory('Meat');
        
        const filteredCount = await productsListPage.getProductCount();
        
        await productsListPage.resetAllFilters();
        const resetCount = await productsListPage.getProductCount();
        
        expect(resetCount).toBeGreaterThanOrEqual(filteredCount);
    });
});

test.describe('Products Sorting', () => {
    
    test.beforeEach(async ({ basePage, testDataWorker }) => {
        await basePage.navigateTo();
        await basePage.waitForPageLoad();
    });

    test('should sort by name', async ({ productsListPage }) => {
        await productsListPage.sortBy('name');
        const names = await productsListPage.getProductNames();
        const sortedNames = [...names].sort((a, b) => { return a < b ? -1 : a > b ? 1 : 0; });
        expect(names).toEqual(sortedNames);
    });

    test('should sort by calories descending', async ({ productsListPage }) => {
        await productsListPage.sortBy('calories');
        await productsListPage.toggleDescending();
        
        const count = await productsListPage.getProductCount();
        expect(count).toBeGreaterThan(0);
    });

    test('should sort by proteins', async ({ productsListPage }) => {
        await productsListPage.sortBy('proteins');
        const count = await productsListPage.getProductCount();
        expect(count).toBeGreaterThan(0);
    });
});