import { ProductsPage } from './pages/ProductsPage';
import { DishesPage } from './pages/DishesPage';
import { PageType } from './types';

class App {
    private currentPage: PageType = 'products';
    private productsPage: ProductsPage | null = null;
    private dishesPage: DishesPage | null = null;
    private mainContainer: HTMLElement;

    constructor() {
        this.mainContainer = document.getElementById('app-main')!;
        this.setupNavigation();
        this.loadPage('products');
    }

    private setupNavigation(): void {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = (e.target as HTMLElement).dataset.page as PageType;
                if (page) {
                    this.switchPage(page);
                }
            });
        });
    }

    private switchPage(page: PageType): void {
        if (this.currentPage === page) return;
        
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if ((btn as HTMLElement).dataset.page === page) {
                btn.classList.add('active');
            }
        });
        
        // Clean up current page
        if (this.currentPage === 'products' && this.productsPage) {
            this.productsPage.destroy();
        } else if (this.currentPage === 'dishes' && this.dishesPage) {
            this.dishesPage.destroy();
        }
        
        this.currentPage = page;
        this.loadPage(page);
    }

    private async loadPage(page: PageType): Promise<void> {
        this.showLoading();
        
        if (page === 'products') {
            this.productsPage = new ProductsPage(this.mainContainer);
            await this.productsPage.loadProducts();
        } else if (page === 'dishes') {
            this.dishesPage = new DishesPage(this.mainContainer);
            await this.dishesPage.loadDishes();
        }
    }

    private showLoading(): void {
        this.mainContainer.innerHTML = '<div class="loading">Загрузка...</div>';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});