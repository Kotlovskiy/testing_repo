import { ProductCategory, CookingRequirement, DishCategory } from '../types';

export const API_BASE_URL = '/api';

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
    [ProductCategory.Frozen]: 'Замороженный',
    [ProductCategory.Meat]: 'Мясной',
    [ProductCategory.Vegetables]: 'Овощи',
    [ProductCategory.Greens]: 'Зелень',
    [ProductCategory.Spices]: 'Специи',
    [ProductCategory.Grains]: 'Крупы',
    [ProductCategory.Canned]: 'Консервы',
    [ProductCategory.Liquid]: 'Жидкость',
    [ProductCategory.Sweets]: 'Сладости'
};

export const COOKING_REQUIREMENT_LABELS: Record<CookingRequirement, string> = {
    [CookingRequirement.ReadyToEat]: 'Готовый к употреблению',
    [CookingRequirement.SemiFinished]: 'Полуфабрикат',
    [CookingRequirement.NeedsCooking]: 'Требует приготовления'
};

export const DISH_CATEGORY_LABELS: Record<DishCategory, string> = {
    [DishCategory.Dessert]: 'Десерт',
    [DishCategory.FirstCourse]: 'Первое',
    [DishCategory.SecondCourse]: 'Второе',
    [DishCategory.Drink]: 'Напиток',
    [DishCategory.Salad]: 'Салат',
    [DishCategory.Soup]: 'Суп',
    [DishCategory.Snack]: 'Перекус'
};

export const FLAG_LABELS: Record<string, string> = {
    'Vegan': 'Веган',
    'GlutenFree': 'Без глютена',
    'SugarFree': 'Без сахара'
};

export const DISH_CATEGORY_MACROS: Record<string, DishCategory> = {
    '!десерт': DishCategory.Dessert,
    '!первое': DishCategory.FirstCourse,
    '!второе': DishCategory.SecondCourse,
    '!напиток': DishCategory.Drink,
    '!салат': DishCategory.Salad,
    '!суп': DishCategory.Soup,
    '!перекус': DishCategory.Snack
};

export const SORT_OPTIONS = [
    { value: 'name', label: 'Название' },
    { value: 'calories', label: 'Калорийность' },
    { value: 'proteins', label: 'Белки' },
    { value: 'fats', label: 'Жиры' },
    { value: 'carbohydrates', label: 'Углеводы' }
];

export const MAX_PHOTOS = 5;