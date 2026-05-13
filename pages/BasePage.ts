import { Page, Locator } from '@playwright/test';

export class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    get header(): Locator {
        return this.page.locator('.app-header');
    }

    get productsNavBtn(): Locator {
        return this.page.locator('.nav-btn[data-page="products"]');
    }

    get dishesNavBtn(): Locator {
        return this.page.locator('.nav-btn[data-page="dishes"]');
    }

    get mainContent(): Locator {
        return this.page.locator('#app-main');
    }

    get loadingIndicator(): Locator {
        return this.page.locator('.loading');
    }

    get notificationModal(): Locator {
        return this.page.locator('#notification-modal');
    }

    get confirmModal(): Locator {
        return this.page.locator('#confirm-modal');
    }

    get formModal(): Locator {
        return this.page.locator('#form-modal');
    }

    async navigateTo(): Promise<void> {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
    }

    async waitForPageLoad(): Promise<void> {
        await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.page.waitForLoadState('networkidle');
    }

    async switchToProducts(): Promise<void> {
        await this.productsNavBtn.click();
        await this.waitForPageLoad();
    }

    async switchToDishes(): Promise<void> {
        await this.dishesNavBtn.click();
        await this.waitForPageLoad();
    }

    async getNotificationTitle(): Promise<string> {
        await this.notificationModal.waitFor({ state: 'visible' });
        const title = await this.notificationModal.locator('#notification-title').textContent();
        await this.closeNotification();
        return title || '';
    }

    async getNotificationMessage(): Promise<string> {
        await this.notificationModal.waitFor({ state: 'visible', timeout: 5000 });
        return await this.notificationModal.locator('#notification-message').textContent() || '';
    }

    async closeNotification(): Promise<void> {
        await this.notificationModal.locator('.modal-close').last().click();
        await this.notificationModal.waitFor({ state: 'hidden' });
    }

    async confirmAction(): Promise<void> {
        await this.confirmModal.waitFor({ state: 'visible' });
        await this.confirmModal.locator('#confirm-ok').last().click();
        await this.confirmModal.waitFor({ state: 'hidden' });
    }

    async cancelAction(): Promise<void> {
        await this.confirmModal.waitFor({ state: 'visible' });
        await this.confirmModal.locator('.btn-secondary.modal-close').click();
        await this.confirmModal.waitFor({ state: 'hidden' });
    }

    async closeFormModal(): Promise<void> {
        await this.formModal.waitFor({ state: 'visible' });
        await this.formModal.locator('.modal-close').click();
        await this.formModal.waitFor({ state: 'hidden' });
    }
}