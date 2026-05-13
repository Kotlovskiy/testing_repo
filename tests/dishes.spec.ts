import { DishCategory, Flags } from '../types';
import { test, expect } from './fixtures';

test.describe('Dishes Page', () => {

    test.beforeEach(async ({ basePage, testDataWorker }) => {
        await basePage.navigateTo();
        await basePage.switchToDishes();
    });

    test.describe('Display and Navigation', () => {
        test('should display dishes page', async ({ basePage, dishesListPage }) => {
            await expect(dishesListPage.listHeader).toHaveText('Блюда');
            await expect(basePage.dishesNavBtn).toHaveClass(/active/);
        });

        test('should show empty state when no dishes', async ({ dishesListPage }) => {
            await dishesListPage.searchDish('ZZZ_NONEXISTENT_DISH');
            await expect(dishesListPage.emptyState).toBeVisible();
        });
    });

    test.describe('Filtering', () => {
        test('should search dishes by name', async ({ dishesListPage }) => {
            await dishesListPage.searchDish('суп');
            const dishNames = await dishesListPage.getDishNames();
            
            for (const name of dishNames) {
                expect(name.toLowerCase()).toContain('суп');
            }
        });

        for (const value of Object.values(DishCategory)) {
            test(`should filter by category: ${value}`, async ({ dishesListPage }) => {
                const initialCount = await dishesListPage.getDishCount();
                await dishesListPage.filterByCategory(value);
                const filteredCount = await dishesListPage.getDishCount();
                expect(filteredCount).toBeLessThanOrEqual(initialCount);
            });
        }

        for (const value of Object.values(Flags)) {
            test(`should filter by category: ${value}`, async ({ dishesListPage }) => {
                const initialCount = await dishesListPage.getDishCount();
                await dishesListPage.filterByOneFlag(value);
                const filteredCount = await dishesListPage.getDishCount();
                expect(filteredCount).toBeLessThanOrEqual(initialCount);
                await dishesListPage.resetFlags();
            });
        }
    });

    test.describe('Dish Creation', () => {
        test('should create a dish with composition', async ({ productsListPage, dishesListPage, dishFormPage, basePage }) => {
            await dishesListPage.createDishBtn.click();
            await expect(dishFormPage.formTitle).toContainText('Создание блюда');
            
            const dishName = `Тестовое блюдо ${Date.now()}`;
            await dishFormPage.fillBasicInfo(dishName, 250);
            
            await expect(dishFormPage.productSelect).toBeEnabled({ timeout: 5000 });
            
            const product = (await productsListPage.getProductNames())[0];
            await dishFormPage.addIngredient(product, 100);
            
            const compCount = await dishFormPage.getCompositionCount();
            expect(compCount).toBe(1);
            
            
            await dishFormPage.clickAutoCalc();
            const nutrition = await dishFormPage.getNutritionFields();
            expect(nutrition.calories).toBeTruthy();
            
            await dishFormPage.submit();
            
            const message = await basePage.getNotificationMessage();
            expect(message).toContain('успешно создано');
        });

        test('should validate empty composition', async ({ dishesListPage, dishFormPage }) => {
            await dishesListPage.createDishBtn.click();
            await dishFormPage.fillBasicInfo('Блюдо без состава', 200);
            await dishFormPage.submit();
            
            const errors = await dishFormPage.getFormErrors();
            expect(errors.some(e => e.includes('Состав'))).toBeTruthy();
        });

        test('should validate required fields', async ({ dishesListPage, dishFormPage }) => {
            await dishesListPage.createDishBtn.click();
            await dishFormPage.submit();
            
            const errors = await dishFormPage.getFormErrors();
            expect(errors.length).toBeGreaterThan(0);
        });

        test('should add multiple ingredients', async ({ dishesListPage, dishFormPage }) => {
            await dishesListPage.createDishBtn.click();
            await dishFormPage.fillBasicInfo(`Блюдо с ингредиентами ${Date.now()}`, 300);
            
            const options = await dishFormPage.productSelect.locator('option').all();
            
            for (let i = 1; i < Math.min(4, options.length); i++) {
                const productName = await options[i].textContent();
                if (productName && productName !== 'Выберите продукт') {
                    await dishFormPage.addIngredient(productName, 50 + i * 10);
                }
            }
            
            const compCount = await dishFormPage.getCompositionCount();
            expect(compCount).toBeGreaterThan(0);
        });

        test('should remove ingredient from composition', async ({ dishesListPage, dishFormPage }) => {
            await dishesListPage.createDishBtn.click();
            await dishFormPage.fillBasicInfo('Блюдо для удаления', 200);
            
            const options = await dishFormPage.productSelect.locator('option').all();
            
            if (options.length > 1) {
                const productName = await options[1].textContent();
                if (productName) {
                    await dishFormPage.addIngredient(productName, 100);
                    
                    const initialCount = await dishFormPage.getCompositionCount();
                    await dishFormPage.removeIngredient(0);
                    
                    const finalCount = await dishFormPage.getCompositionCount();
                    expect(finalCount).toBe(initialCount - 1);
                }
            }
        });

        test('should auto-calculate nutrition from ingredients', async ({ dishesListPage, dishFormPage }) => {
            await dishesListPage.createDishBtn.click();
            await dishFormPage.fillBasicInfo(`Авторасчёт ${Date.now()}`, 200);
            
            const options = await dishFormPage.productSelect.locator('option').all();
            
            if (options.length > 1) {
                const productName = await options[1].textContent();
                if (productName) {
                    await dishFormPage.addIngredient(productName, 150);
                    
                    await dishFormPage.clickAutoCalc();
                    
                    const nutrition = await dishFormPage.getNutritionFields();
                    expect(nutrition.calories).not.toBe('');
                }
            }
        });
    });

    test.describe('Dish Operations', () => {
        test('should edit a dish', async ({ dishesListPage, dishFormPage }) => {
            const count = await dishesListPage.getDishCount();
            
            if (count > 0) {
                const dishName = (await dishesListPage.getDishNames())[0];
                await dishesListPage.clickEditDish(dishName);
                
                await expect(dishFormPage.formTitle).toContainText('Редактирование');
                await expect(dishFormPage.nameInput).toHaveValue(dishName);
            }
        });

        test('should delete a dish with confirmation', async ({ dishesListPage, basePage }) => {
            const count = await dishesListPage.getDishCount();
            
            if (count > 0) {
                const dishName = (await dishesListPage.getDishNames())[0];
                await dishesListPage.clickDeleteDish(dishName);
                
                await expect(basePage.confirmModal).toBeVisible();
                await basePage.confirmAction();
                
                const message = await basePage.getNotificationMessage();
                expect(message).toContain('удалено');
            }
        });

        test('should view dish details', async ({ dishesListPage, basePage }) => {
            const count = await dishesListPage.getDishCount();
            
            if (count > 0) {
                const dishName = (await dishesListPage.getDishNames())[0];
                await dishesListPage.clickViewDish(dishName);
                
                await expect(basePage.formModal).toBeVisible();
                const modalTitle = await basePage.formModal.locator('#form-title').textContent();
                expect(modalTitle).toContain('Просмотр блюда');
            }
        });
    });
});