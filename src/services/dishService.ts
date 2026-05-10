import { apiService } from './api';
import { Dish, CreateUpdateDishDto, DishFilters } from '../types';

export interface IDishService {
    getAll(filters?: DishFilters): Promise<Dish[]>;
    getById(id: number): Promise<Dish>;
    create(data: CreateUpdateDishDto): Promise<Dish>;
    update(id: number, data: CreateUpdateDishDto): Promise<Dish>;
    delete(id: number): Promise<boolean>;
}

export class DishService implements IDishService {
    private endpoint = '/dishes';

    async getAll(filters?: DishFilters): Promise<Dish[]> {
        const params: Record<string, any> = {};
        
        if (filters?.search) params.search = filters.search;
        if (filters?.category) params.category = filters.category;
        if (filters?.flags) params.flags = filters.flags;

        return apiService.get<Dish[]>(this.endpoint, params);
    }

    async getById(id: number): Promise<Dish> {
        return apiService.get<Dish>(`${this.endpoint}/${id}`);
    }

    async create(data: CreateUpdateDishDto): Promise<Dish> {
        return apiService.post<Dish>(this.endpoint, data);
    }

    async update(id: number, data: CreateUpdateDishDto): Promise<Dish> {
        return apiService.put<Dish>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: number): Promise<boolean> {
        return apiService.delete(`${this.endpoint}/${id}`);
    }
}

export const dishService = new DishService();