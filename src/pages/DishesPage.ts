import { Dish, DishFilters, CreateUpdateDishDto } from '../types';
import { dishService } from '../services/dishService';
import { DishList } from '../components/DishList';
import { DishForm } from '../components/DishForm';
import { DishView } from '../components/DishView';
import { Modal } from '../components/common/Modal';
import { notification } from '../components/common/Notification';
import { ConfirmModal } from '../components/common/ConfirmModal';

export class DishesPage {
    private container: HTMLElement;
    private dishList: DishList;
    private formModal: Modal;
    private viewModal: Modal;
    private dishes: Dish[] = [];
    private currentFilters: DishFilters = {};

    constructor(container: HTMLElement) {
        this.container = container;
        this.formModal = new Modal('form-modal');
        this.viewModal = new Modal('form-modal');
        
        this.dishList = new DishList(container, {
            onEdit: (dish) => this.openEditForm(dish),
            onDelete: (dish) => this.confirmDelete(dish),
            onView: (dish) => this.openView(dish),
            onFilterChange: (filters) => this.loadDishes(filters),
            onCreate: () => this.openCreateForm()
        });
    }

    async loadDishes(filters: DishFilters = {}): Promise<void> {
        try {
            this.currentFilters = filters;
            this.showLoading();
            this.dishes = await dishService.getAll(filters);
            this.dishList.render(this.dishes);
        } catch (error) {
            notification.error(
                error instanceof Error ? error.message : 'Не удалось загрузить блюда'
            );
            this.dishList.render([]);
        }
    }

    private showLoading(): void {
        this.container.innerHTML = '<div class="loading">Загрузка блюд...</div>';
    }

    private openCreateForm(): void {
        const formContainer = document.createElement('div');
        
        const form = new DishForm(formContainer, {
            onSubmit: async (data) => {
                await this.createDish(data);
                this.formModal.hide();
            },
            onCancel: () => this.formModal.hide()
        });
        
        form.render();
        
        this.formModal.setTitle('Создание блюда');
        this.formModal.setContent(formContainer);
        this.formModal.show();
    }

    private openEditForm(dish: Dish): void {
        const formContainer = document.createElement('div');
        
        const form = new DishForm(formContainer, {
            onSubmit: async (data) => {
                await this.updateDish(dish.id, data);
                this.formModal.hide();
            },
            onCancel: () => this.formModal.hide()
        }, dish);
        
        form.render();
        
        this.formModal.setTitle('Редактирование блюда');
        this.formModal.setContent(formContainer);
        this.formModal.show();
    }

    private openView(dish: Dish): void {
        const viewContainer = document.createElement('div');
        
        const view = new DishView(viewContainer, {
            onClose: () => this.viewModal.hide(),
            onEdit: (d) => {
                this.viewModal.hide();
                this.openEditForm(d);
            }
        }, dish);
        
        view.render();
        
        this.viewModal.setTitle('Просмотр блюда');
        this.viewModal.setContent(viewContainer);
        this.viewModal.show();
    }

    private async createDish(data: CreateUpdateDishDto): Promise<void> {
        try {
            await dishService.create(data);
            notification.success('Блюдо успешно создано');
            await this.loadDishes(this.currentFilters);
        } catch (error) {
            notification.error(
                error instanceof Error ? error.message : 'Не удалось создать блюдо'
            );
            throw error;
        }
    }

    private async updateDish(id: number, data: CreateUpdateDishDto): Promise<void> {
        try {
            await dishService.update(id, data);
            notification.success('Блюдо успешно обновлено');
            await this.loadDishes(this.currentFilters);
        } catch (error) {
            notification.error(
                error instanceof Error ? error.message : 'Не удалось обновить блюдо'
            );
            throw error;
        }
    }

    private confirmDelete(dish: Dish): void {
        ConfirmModal.show({
            title: 'Удаление блюда',
            message: `Вы уверены, что хотите удалить блюдо "${dish.name}"?`,
            confirmText: 'Удалить',
            isDanger: true,
            onConfirm: async () => {
                await this.deleteDish(dish.id);
            }
        });
    }

    private async deleteDish(id: number): Promise<void> {
        try {
            await dishService.delete(id);
            notification.success('Блюдо успешно удалено');
            await this.loadDishes(this.currentFilters);
        } catch (error) {
            notification.error(
                error instanceof Error ? error.message : 'Не удалось удалить блюдо'
            );
        }
    }

    destroy(): void {
        this.container.innerHTML = '';
    }
}