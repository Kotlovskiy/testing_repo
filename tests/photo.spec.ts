import { test, expect } from './fixtures';

test.describe('Product Photo Management', () => {

    test.beforeEach(async ({ basePage, testDataWorker }) => {
        await basePage.navigateTo();
        await basePage.waitForPageLoad();
    });

    test('should add photo fields up to max limit', async ({ productsListPage, productFormPage }) => {
        await productsListPage.createProductBtn.click();
            
        const initialPhotoCount = await productFormPage.photoInputs.count();
            
        for(var i = initialPhotoCount; i < 5; ++i) {
            await productFormPage.addPhotoBtn.click();
        }
            
        const finalPhotoCount = await productFormPage.photoInputs.count();
        expect(finalPhotoCount).toBeLessThanOrEqual(5);
            
        await expect(productFormPage.addPhotoBtn).toBeHidden();
    });

    test('should delete a photo URL field', async ({ productsListPage, productFormPage }) => {
        await productsListPage.createProductBtn.click();

        await productFormPage.addPhotoBtn.click();
        await productFormPage.addPhotoBtn.click();

        let photoInputs = await productFormPage.photoInputs.all();
        expect(photoInputs.length).toBe(3);

        await productFormPage.deletePhotoBtn.click();

        photoInputs = await productFormPage.photoInputs.all();
        expect(photoInputs.length).toBe(2);
    });

    test('should save photos on creation and display in view', async ({ basePage, productsListPage, productFormPage, productViewPage }) => {
        const productName = `Фото продукт ${Date.now()}`;
        const photoUrl1 = 'https://example.com/photo1.jpg';
        const photoUrl2 = 'https://example.com/photo2.jpg';

        await productsListPage.createProductBtn.click();
        await productFormPage.fillProductData({
            name: productName,
            calories: 100,
            proteins: 10,
            fats: 5,
            carbs: 20,
            category: 'Vegetables',
            cookingRequirement: 'ReadyToEat',
            photos: [photoUrl1, photoUrl2]
        });
        await productFormPage.submit();
        await basePage.closeNotification();

        await productsListPage.searchProduct(productName);
        await productsListPage.clickViewProduct(productName);

        const photos = await productViewPage.photos.all();
        expect(photos.length).toBe(2);
        await expect(productViewPage.photos.nth(0)).toHaveAttribute('src', photoUrl1);
        await expect(productViewPage.photos.nth(1)).toHaveAttribute('src', photoUrl2);

        await productViewPage.close();

        await productsListPage.clickDeleteProduct(productName);
        await basePage.confirmAction();
    });
});