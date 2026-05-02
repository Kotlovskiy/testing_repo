import { Product, ProductFilters, CreateUpdateProductDto } from '../types';
import { productService } from '../services/productService';
import { ProductList } from '../components/ProductList';
import { ProductForm } from '../components/ProductForm';
import { Modal } from '../components/common/Modal';
import { notification } from '../components/common/Notification';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ProductView } from '../components/ProductView';

export class ProductsPage {
    private container: HTMLElement;
    private productList: ProductList;
    private formModal: Modal;
    private viewModal: Modal;
    private products: Product[] = [];
    private currentFilters: ProductFilters = {};

    constructor(container: HTMLElement) {
        this.container = container;
        this.formModal = new Modal('form-modal');
        this.viewModal = new Modal('form-modal');
        
        this.productList = new ProductList(container, {
            onEdit: (product) => this.openEditForm(product),
            onDelete: (product) => this.confirmDelete(product),
            onView: (product) => this.openView(product),
            onFilterChange: (filters) => this.loadProducts(filters),
            onCreate: () => this.openCreateForm()
        });
    }

    async loadProducts(filters: ProductFilters = {}): Promise<void> {
        try {
            this.currentFilters = filters;
            this.showLoading();
            this.products = await productService.getAll(filters);
            this.productList.render(this.products);
        } catch (error) {
            notification.error(
                error instanceof Error ? error.message : 'Не удалось загрузить продукты'
            );
            this.productList.render([]);
        }
    }

    private showLoading(): void {
        this.container.innerHTML = '<div class="loading">Загрузка продуктов...</div>';
    }

    private openCreateForm(): void {
        const formContainer = document.createElement('div');
        
        const form = new ProductForm(formContainer, {
            onSubmit: async (data) => {
                await this.createProduct(data);
                this.formModal.hide();
            },
            onCancel: () => this.formModal.hide()
        });
        
        form.render();
        
        this.formModal.setTitle('Создание продукта');
        this.formModal.setContent(formContainer);
        this.formModal.show();
    }

    private openEditForm(product: Product): void {
        const formContainer = document.createElement('div');
        
        const form = new ProductForm(formContainer, {
            onSubmit: async (data) => {
                await this.updateProduct(product.id, data);
                this.formModal.hide();
            },
            onCancel: () => this.formModal.hide()
        }, product);
        
        form.render();
        
        this.formModal.setTitle('Редактирование продукта');
        this.formModal.setContent(formContainer);
        this.formModal.show();
    }

    private openView(product: Product): void {
        const viewContainer = document.createElement('div');

        const view = new ProductView(viewContainer, {
            onClose: () => this.viewModal.hide(),
            onEdit: (p) => {
                this.viewModal.hide();
                this.openEditForm(p);
            }
        }, product);

        view.render();

        this.viewModal.setTitle('Просмотр продукта');
        this.viewModal.setContent(viewContainer);
        this.viewModal.show();
    }

    private async createProduct(data: CreateUpdateProductDto): Promise<void> {
        try {
            await productService.create(data);
            notification.success('Продукт успешно создан');
            await this.loadProducts(this.currentFilters);
        } catch (error) {
            notification.error(
                error instanceof Error ? error.message : 'Не удалось создать продукт'
            );
            throw error;
        }
    }

    private async updateProduct(id: number, data: CreateUpdateProductDto): Promise<void> {
        try {
            await productService.update(id, data);
            notification.success('Продукт успешно обновлён');
            await this.loadProducts(this.currentFilters);
        } catch (error) {
            notification.error(
                error instanceof Error ? error.message : 'Не удалось обновить продукт'
            );
            throw error;
        }
    }

    private confirmDelete(product: Product): void {
        ConfirmModal.show({
            title: 'Удаление продукта',
            message: `Вы уверены, что хотите удалить продукт "${product.name}"?`,
            confirmText: 'Удалить',
            isDanger: true,
            onConfirm: async () => {
                await this.deleteProduct(product.id);
            }
        });
    }

    private async deleteProduct(id: number): Promise<void> {
        try {
            await productService.delete(id);
            notification.success('Продукт успешно удалён');
            await this.loadProducts(this.currentFilters);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Не удалось удалить продукт';
            
            if (message.includes('используется в блюдах')) {
                notification.error(
                    message,
                    'Невозможно удалить продукт'
                );
            } else {
                notification.error(message);
            }
        }
    }

    destroy(): void {
        this.container.innerHTML = '';
    }
}