import { test, expect } from './fixtures';

test.describe('Product Validation', () => {

    test.beforeEach(async ({ basePage, testDataWorker }) => {
        await basePage.navigateTo();
        await basePage.waitForPageLoad();
    });

    test('should validate min length of product name (too short)', async ({ productsListPage, productFormPage }) => {
        await productsListPage.createProductBtn.click();
        await expect(productFormPage.formTitle).toContainText('Создание продукта');

        await productFormPage.fillProductData({
            name: 'A',
            calories: 100,
            proteins: 10,
            fats: 5,
            carbs: 20,
            category: 'Vegetables',
            cookingRequirement: 'ReadyToEat'
        });
        await productFormPage.submit();

        const nameError = await productFormPage.getFieldError('name');
        expect(nameError).toContain('минимум 2 символа');
    });

    const positiveNameTestCases = [
        { value: 'AA', result: '', desc: '2' },
        { value: 'AAA', result: '', desc: '>2' },
    ];

    for (const { value, result, desc } of positiveNameTestCases) {
        test(`should validate length of product name: ${desc}`, async ({ basePage, productsListPage, productFormPage }) => {
            await productsListPage.createProductBtn.click();
            await expect(productFormPage.formTitle).toContainText('Создание продукта');

            await productFormPage.fillProductData({
                name: value,
                calories: 100,
                proteins: 0,
                fats: 5,
                carbs: 20,
                category: 'Vegetables',
                cookingRequirement: 'ReadyToEat'
            });
            await productFormPage.submit();

            const nameError = await productFormPage.getFieldError('name');
            expect(nameError).toEqual(result);

            await basePage.closeNotification();
            await productsListPage.clickDeleteProduct(value);
            await basePage.confirmAction();
        });
    }

    const negativeTestCases = [
        { field: 'calories', value: -50, errorField: 'caloriesPer100g', name: 'калории' },
        { field: 'proteins', value: -1, errorField: 'proteinsPer100g', name: 'белки' },
        { field: 'fats', value: -0.5, errorField: 'fatsPer100g', name: 'жиры' },
        { field: 'carbs', value: -10, errorField: 'carbohydratesPer100g', name: 'углеводы' },
    ];

    for (const { field, value, errorField, name } of negativeTestCases) {
        test(`should validate negative ${name}`, async ({ productsListPage, productFormPage }) => {
            await productsListPage.createProductBtn.click();

            const productData = {
                name: `Тест ${name}`,
                calories: 100,
                proteins: 10,
                fats: 5,
                carbs: 20,
                category: 'Vegetables',
                cookingRequirement: 'ReadyToEat',
                [field]: value,
            };

            await productFormPage.fillProductData(productData as any);
            await productFormPage.submit();

            const error = await productFormPage.getFieldErrorForNumber(errorField);
            expect(error).toContain('must be greater than or equal to 0');
        });
    }

    const exceedingTestCases = [
        { field: 'proteins', value: 120, errorField: 'proteinsPer100g', name: 'белки' },
        { field: 'fats', value: 150, errorField: 'fatsPer100g', name: 'жиры' },
        { field: 'carbs', value: 200, errorField: 'carbohydratesPer100g', name: 'углеводы' },
    ];

    for (const { field, value, errorField, name } of exceedingTestCases) {
        test(`should validate ${name} not exceeding 100`, async ({ productsListPage, productFormPage }) => {
            await productsListPage.createProductBtn.click();

            const productData = {
                name: `Тест ${name} >100`,
                calories: 100,
                proteins: 0,
                fats: 0,
                carbs: 0,
                category: 'Vegetables',
                cookingRequirement: 'ReadyToEat',
                [field]: value,
            };

            await productFormPage.fillProductData(productData as any);
            await productFormPage.submit();

            const error = await productFormPage.getFieldErrorForNumber(errorField);
            expect(error).toContain('must be less than or equal to 100');
        });
    }

    const minPositiveTestCases = [
        { field: 'calories', value: 0, errorField: 'caloriesPer100g', name: 'калории' },
        { field: 'proteins', value: 0, errorField: 'proteinsPer100g', name: 'белки' },
        { field: 'fats', value: 0, errorField: 'fatsPer100g', name: 'жиры' },
        { field: 'carbs', value: 0, errorField: 'carbohydratesPer100g', name: 'углеводы' },
        { field: 'calories', value: 1, errorField: 'caloriesPer100g', name: 'калории' },
        { field: 'proteins', value: 1, errorField: 'proteinsPer100g', name: 'белки' },
        { field: 'fats', value: 1, errorField: 'fatsPer100g', name: 'жиры' },
        { field: 'carbs', value: 1, errorField: 'carbohydratesPer100g', name: 'углеводы' },
    ];

    for (const { field, value, errorField, name } of minPositiveTestCases) {
        test(`shouldnt validate ${name} = ${value}`, async ({ basePage, productsListPage, productFormPage }) => {
            await productsListPage.createProductBtn.click();

            const productData = {
                name: `Тест ${name} = ${value}`,
                calories: 100,
                proteins: 30,
                fats: 30,
                carbs: 30,
                category: 'Vegetables',
                cookingRequirement: 'ReadyToEat',
                [field]: value,
            };

            await productFormPage.fillProductData(productData as any);
            await productFormPage.submit();

            const error = await productFormPage.getFieldErrorForNumber(errorField);
            expect(error).toEqual('');

            await basePage.closeNotification();
            await productsListPage.clickDeleteProduct(`Тест ${name} = ${value}`);
            await basePage.confirmAction();
        });
    }

    const topPositiveTestCases = [
        { field: 'calories', value: 99, errorField: 'caloriesPer100g', name: 'калории' },
        { field: 'proteins', value: 99, errorField: 'proteinsPer100g', name: 'белки' },
        { field: 'fats', value: 99, errorField: 'fatsPer100g', name: 'жиры' },
        { field: 'carbs', value: 99, errorField: 'carbohydratesPer100g', name: 'углеводы' },
        { field: 'calories', value: 100, errorField: 'caloriesPer100g', name: 'калории' },
        { field: 'proteins', value: 100, errorField: 'proteinsPer100g', name: 'белки' },
        { field: 'fats', value: 100, errorField: 'fatsPer100g', name: 'жиры' },
        { field: 'carbs', value: 100, errorField: 'carbohydratesPer100g', name: 'углеводы' },
    ];

    for (const { field, value, errorField, name } of topPositiveTestCases) {
        test(`shouldnt validate ${name} = ${value}`, async ({ basePage, productsListPage, productFormPage }) => {
            await productsListPage.createProductBtn.click();

            const productData = {
                name: `Тест ${name} = ${value}`,
                calories: 0,
                proteins: 0,
                fats: 0,
                carbs: 0,
                category: 'Vegetables',
                cookingRequirement: 'ReadyToEat',
                [field]: value,
            };

            await productFormPage.fillProductData(productData as any);
            await productFormPage.submit();

            const error = await productFormPage.getFieldErrorForNumber(errorField);
            expect(error).toEqual('');

            await basePage.closeNotification();
            await productsListPage.clickDeleteProduct(`Тест ${name} = ${value}`);
            await basePage.confirmAction();
        });
    }

    test('should validate empty category', async ({ productsListPage, productFormPage }) => {
        await productsListPage.createProductBtn.click();
        await expect(productFormPage.formTitle).toContainText('Создание продукта');

        await productFormPage.submit();

        const nameError = await productFormPage.getFieldError('category');
        expect(nameError).toContain('обязательно для заполнения');
    });

    test('should validate empty cookingRequirement', async ({ productsListPage, productFormPage }) => {
        await productsListPage.createProductBtn.click();
        await expect(productFormPage.formTitle).toContainText('Создание продукта');

        await productFormPage.submit();

        const nameError = await productFormPage.getFieldError('cookingRequirement');
        expect(nameError).toContain('обязательно для заполнения');
    });
});