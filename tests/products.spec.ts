import { test, expect } from './fixtures';

test.describe('Products Page', () => {

    test.beforeEach(async ({ basePage, testDataWorker }) => {
        await basePage.navigateTo();
        await basePage.waitForPageLoad();
    });

    test.describe('Display and Navigation', () => {
        test('should display products page by default', async ({ productsListPage }) => {
            await expect(productsListPage.listHeader).toHaveText('Продукты');
            await expect(productsListPage.productsNavBtn).toHaveClass(/active/);
        });

        test('should navigate between products and dishes', async ({ basePage, productsListPage }) => {
            await basePage.switchToDishes();
            await expect(basePage.dishesNavBtn).toHaveClass(/active/);
            
            await basePage.switchToProducts();
            await expect(basePage.productsNavBtn).toHaveClass(/active/);
            await expect(productsListPage.listHeader).toHaveText('Продукты');
        });

        test('should show empty state when no products', async ({ productsListPage }) => {
            await productsListPage.searchProduct('ZZZ_NONEXISTENT_PRODUCT');
            await expect(productsListPage.emptyState).toBeVisible();
        });
    });

    test.describe('CRUD Operations', () => {

        test('should create a new product', async ({ basePage, productsListPage, productFormPage }) => {
            const productData = {
                name: `Тестовый продукт ${Date.now()}`,
                calories: 150,
                proteins: 10,
                fats: 5,
                carbs: 20,
                category: 'Vegetables',
                cookingRequirement: 'ReadyToEat',
                flags: ['Vegan']
            };

            await productsListPage.createProductBtn.click();
            await expect(productFormPage.formTitle).toContainText('Создание продукта');
            
            await productFormPage.fillProductData(productData);
            await productFormPage.submit();
            
            const message = await basePage.getNotificationMessage();
            expect(message).toContain('успешно создан');
            await basePage.closeNotification();
            
            await productsListPage.searchProduct(productData.name);
            const count = await productsListPage.getProductCount();
            expect(count).toBe(1);

            await productsListPage.clickDeleteProduct(productData.name);
            await basePage.confirmAction();
        });

        test('should validate required fields when creating product', async ({ productsListPage, productFormPage }) => {
            await productsListPage.createProductBtn.click();
            
            await productFormPage.submit();
            
            const errors = await productFormPage.getFormErrors();
            expect(errors.length).toBeGreaterThan(0);
        });

        test('should validate BZHU sum not exceeding 100', async ({ productsListPage, productFormPage }) => {
            await productsListPage.createProductBtn.click();
            
            await productFormPage.fillProductData({
                name: 'Тест БЖУ',
                calories: 100,
                proteins: 50,
                fats: 50,
                carbs: 50,
                category: 'Meat',
                cookingRequirement: 'NeedsCooking'
            });
            
            await productFormPage.submit();
            
            const errors = await productFormPage.getFormErrors();
            expect(errors.some(e => e.includes('Сумма БЖУ'))).toBeTruthy();
        });

        test('should edit an existing product', async ({ basePage, productsListPage, productFormPage }) => {
            const productData = {
                name: `Тестовый продукт ${Date.now()}`,
                calories: 150,
                proteins: 10,
                fats: 5,
                carbs: 20,
                category: 'Vegetables',
                cookingRequirement: 'ReadyToEat',
                flags: ['Vegan']
            };
            await productsListPage.createProductBtn.click();
            await productFormPage.fillProductData(productData);
            await productFormPage.submit();
            await basePage.closeNotification();
            
            await productsListPage.searchProduct(productData.name);
            const count = await productsListPage.getProductCount();
            
            if (count > 0) {
                const firstProduct = (await productsListPage.getProductNames())[0];
                await productsListPage.clickEditProduct(firstProduct);
                
                await expect(productFormPage.formTitle).toContainText('Редактирование');
                
                const newName = `${firstProduct} (обновлен)`;
                await productFormPage.nameInput.fill(newName);
                await productFormPage.submit();
                
                const message = await basePage.getNotificationMessage();
                expect(message).toContain('обновлён');

                await basePage.closeNotification();
                await productsListPage.clickDeleteProduct(`${firstProduct} (обновлен)`);
                await basePage.confirmAction();
            }
        });

        test('should delete a product with confirmation', async ({ basePage, productsListPage, productFormPage }) => {
            const productData = {
                name: `Продукт для удаления ${Date.now()}`,
                calories: 100,
                proteins: 10,
                fats: 5,
                carbs: 10,
                category: 'Sweets',
                cookingRequirement: 'ReadyToEat'
            };

            await productsListPage.createProductBtn.click();
            await productFormPage.fillProductData(productData);
            await productFormPage.submit();
            await basePage.closeNotification();
            
            await productsListPage.searchProduct(productData.name);
            const productName = (await productsListPage.getProductNames())[0];
            await productsListPage.clickDeleteProduct(productName);
            
            await expect(basePage.confirmModal).toBeVisible();
            const confirmMessage = await basePage.confirmModal.locator('#confirm-message').textContent();
            expect(confirmMessage).toContain(productData.name);
            await basePage.confirmAction();
            
            const message = await basePage.getNotificationMessage();
            expect(message).toContain('удалён');
            await basePage.closeNotification();
        });

        test('should cancel product deletion', async ({ basePage, productsListPage }) => {
            const count = await productsListPage.getProductCount();
            
            if (count > 0) {
                const productName = (await productsListPage.getProductNames())[0];
                await productsListPage.clickDeleteProduct(productName);
                
                await expect(basePage.confirmModal).toBeVisible();
                await basePage.cancelAction();
                
                await expect(basePage.confirmModal).toBeHidden();
                const newCount = await productsListPage.getProductCount();
                expect(newCount).toBe(count);
            }
        });

        test('should not delete product that is used in a dish', async ({ 
            basePage, 
            productsListPage, 
            testDataWorker 
        }) => {
            const usedProductIds = new Set<number>();
            for (const dish of testDataWorker.dishes) {
                for (const comp of dish.composition) {
                    usedProductIds.add(comp.productId);
                }
            }
            const usedProduct = testDataWorker.products.find(p => usedProductIds.has(p.id));
            const productName = usedProduct!.name;

            await productsListPage.searchProduct(productName);
            const countBefore = await productsListPage.getProductCount();
            expect(countBefore).toBeGreaterThan(0);

            await productsListPage.clickDeleteProduct(productName);
            await basePage.confirmAction();

            const errorMessage = await basePage.getNotificationMessage();
            expect(errorMessage).toMatch('используется в блюдах');
            await basePage.closeNotification();

            await productsListPage.searchProduct(productName);
            const countAfter = await productsListPage.getProductCount();
            expect(countAfter).toBe(countBefore);
        });
    });

    test.describe('Product View', () => {
        test('should view product details', async ({ basePage, productsListPage, productViewPage }) => {
            
            const productName = (await productsListPage.getProductNames())[0];
            await productsListPage.clickViewProduct(productName);
                
            await expect(basePage.formModal).toBeVisible();
            await expect(productViewPage.productName).toHaveText(productName);
            await expect(productViewPage.nutritionGrid).toBeVisible();
        });
    });
});