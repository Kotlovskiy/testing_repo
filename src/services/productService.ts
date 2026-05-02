import { apiService } from './api';
import { Product, CreateUpdateProductDto, ProductFilters } from '../types';

export interface IProductService {
    getAll(filters?: ProductFilters): Promise<Product[]>;
    getById(id: number): Promise<Product>;
    create(data: CreateUpdateProductDto): Promise<Product>;
    update(id: number, data: CreateUpdateProductDto): Promise<Product>;
    delete(id: number): Promise<boolean>;
}

export class ProductService implements IProductService {
    private endpoint = '/products';

    async getAll(filters?: ProductFilters): Promise<Product[]> {
        const params: Record<string, any> = {};
        
        if (filters?.search) params.search = filters.search;
        if (filters?.category) params.category = filters.category;
        if (filters?.cookingRequirement) params.cookingRequirement = filters.cookingRequirement;
        if (filters?.flags) params.flags = filters.flags;
        if (filters?.sortBy) params.sortBy = filters.sortBy;
        if (filters?.descending !== undefined) params.descending = filters.descending;

        return apiService.get<Product[]>(this.endpoint, params);
    }

    async getById(id: number): Promise<Product> {
        return apiService.get<Product>(`${this.endpoint}/${id}`);
    }

    async create(data: CreateUpdateProductDto): Promise<Product> {
        return apiService.post<Product>(this.endpoint, data);
    }

    async update(id: number, data: CreateUpdateProductDto): Promise<Product> {
        return apiService.put<Product>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: number): Promise<boolean> {
        return apiService.delete(`${this.endpoint}/${id}`);
    }
}

export const productService = new ProductService();