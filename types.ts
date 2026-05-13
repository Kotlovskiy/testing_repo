// Enums
export enum ProductCategory {
    Frozen = 'Frozen',
    Meat = 'Meat',
    Vegetables = 'Vegetables',
    Greens = 'Greens',
    Spices = 'Spices',
    Grains = 'Grains',
    Canned = 'Canned',
    Liquid = 'Liquid',
    Sweets = 'Sweets'
}

export enum CookingRequirement {
    ReadyToEat = 'ReadyToEat',
    SemiFinished = 'SemiFinished',
    NeedsCooking = 'NeedsCooking'
}

export enum DishCategory {
    Dessert = 'Dessert',
    FirstCourse = 'FirstCourse',
    SecondCourse = 'SecondCourse',
    Drink = 'Drink',
    Salad = 'Salad',
    Soup = 'Soup',
    Snack = 'Snack'
}

export enum Flags {
    Vegan = 'Vegan',
    GlutenFree = 'GlutenFree',
    SugarFree = 'SugarFree'
}

// Product types
export interface Product {
    id: number;
    name: string;
    photoUrls: string[] | null;
    caloriesPer100g: number;
    proteinsPer100g: number;
    fatsPer100g: number;
    carbohydratesPer100g: number;
    composition: string | null;
    category: string;
    cookingRequirement: string;
    flags: string[];
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateUpdateProductDto {
    name: string;
    photoUrls: string[] | null;
    caloriesPer100g: number;
    proteinsPer100g: number;
    fatsPer100g: number;
    carbohydratesPer100g: number;
    composition: string | null;
    category: string;
    cookingRequirement: string;
    flags: string[];
}

// Dish types
export interface DishProductItemDto {
    productId: number;
    productName: string;
    quantityGrams: number;
}

export interface DishProductInputDto {
    productId: number;
    quantityGrams: number;
}

export interface Dish {
    id: number;
    name: string;
    photoUrls: string[] | null;
    caloriesPerServing: number;
    proteinsPerServing: number;
    fatsPerServing: number;
    carbohydratesPerServing: number;
    servingSizeGrams: number;
    category: string;
    flags: string[];
    composition: DishProductItemDto[];
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateUpdateDishDto {
    name: string;
    photoUrls: string[] | null;
    caloriesPerServing?: number | null;
    proteinsPerServing?: number | null;
    fatsPerServing?: number | null;
    carbohydratesPerServing?: number | null;
    servingSizeGrams: number;
    category?: string | null;
    flags: string[];
    composition: DishProductInputDto[];
}

// API Response types
export interface ApiError {
    error: string;
}

// Filter types
export interface ProductFilters {
    search?: string;
    category?: string;
    cookingRequirement?: string;
    flags?: string[];
    sortBy?: string;
    descending?: boolean;
}

export interface DishFilters {
    search?: string;
    category?: string;
    flags?: string[];
}

// UI State types
export type PageType = 'products' | 'dishes';
export type ModalType = 'notification' | 'confirm' | 'form' | null;

export interface ConfirmOptions {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    isDanger?: boolean;
}

export interface NotificationOptions {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
}