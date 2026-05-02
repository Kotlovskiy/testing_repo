import { PRODUCT_CATEGORY_LABELS, COOKING_REQUIREMENT_LABELS, DISH_CATEGORY_LABELS, FLAG_LABELS } from './constants';

export class Formatters {
    static formatNumber(value: number, decimals: number = 1): string {
        return value.toFixed(decimals);
    }

    static formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatProductCategory(category: string): string {
        return PRODUCT_CATEGORY_LABELS[category as keyof typeof PRODUCT_CATEGORY_LABELS] || category;
    }

    static formatCookingRequirement(requirement: string): string {
        return COOKING_REQUIREMENT_LABELS[requirement as keyof typeof COOKING_REQUIREMENT_LABELS] || requirement;
    }

    static formatDishCategory(category: string): string {
        return DISH_CATEGORY_LABELS[category as keyof typeof DISH_CATEGORY_LABELS] || category;
    }

    static formatFlag(flag: string): string {
        return FLAG_LABELS[flag] || flag;
    }

    static formatNutrition(value: number, unit: string = ''): string {
        return `${this.formatNumber(value)} ${unit}`.trim();
    }
}