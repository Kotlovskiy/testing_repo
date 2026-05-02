export class Validators {
    static required(value: any, fieldName: string): string | null {
        if (value === null || value === undefined || value === '') {
            return `${fieldName} обязательно для заполнения`;
        }
        return null;
    }

    static minLength(value: string, min: number, fieldName: string): string | null {
        if (value && value.length < min) {
            return `${fieldName} должно содержать минимум ${min} символа`;
        }
        return null;
    }

    static min(value: number, min: number, fieldName: string): string | null {
        if (value < min) {
            return `${fieldName} не может быть меньше ${min}`;
        }
        return null;
    }

    static max(value: number, max: number, fieldName: string): string | null {
        if (value > max) {
            return `${fieldName} не может превышать ${max}`;
        }
        return null;
    }

    static positive(value: number, fieldName: string): string | null {
        if (value <= 0) {
            return `${fieldName} должно быть положительным числом`;
        }
        return null;
    }

    static calculateNutrition(nutritions: NutritionInput[]): NutritionResult {
        let nutritionResult: NutritionResult = {calories: 0, proteins: 0, fats: 0, carbohydrates: 0}
        nutritions.forEach (nutrition => {
            if(nutrition.quantityGrams > 0) {
                const factor = nutrition.quantityGrams / 100;
                nutritionResult.calories += (nutrition.productNutrition.caloriesPer100g * factor)
                nutritionResult.proteins += (nutrition.productNutrition.proteinsPer100g * factor)
                nutritionResult.fats += (nutrition.productNutrition.fatsPer100g * factor)
                nutritionResult.carbohydrates += (nutrition.productNutrition.carbohydratesPer100g * factor)
            }
        })

        return nutritionResult;
    }

    static bzhuSum(proteins: number, fats: number, carbs: number): string | null {
        if (proteins + fats + carbs > 100) {
            return 'Сумма БЖУ на 100 г не может превышать 100';
        }
        return null;
    }

    static validateProduct(data: any): Record<string, string> {
        const errors: Record<string, string> = {};

        const nameError = Validators.required(data.name, 'Название') || 
                         Validators.minLength(data.name, 2, 'Название');
        if (nameError) errors.name = nameError;

        const calError = Validators.min(data.caloriesPer100g, 0, 'Калорийность');
        if (calError) errors.caloriesPer100g = calError;

        const protError = Validators.min(data.proteinsPer100g, 0, 'Белки') ||
                         Validators.max(data.proteinsPer100g, 100, 'Белки');
        if (protError) errors.proteinsPer100g = protError;

        const fatError = Validators.min(data.fatsPer100g, 0, 'Жиры') ||
                        Validators.max(data.fatsPer100g, 100, 'Жиры');
        if (fatError) errors.fatsPer100g = fatError;

        const carbError = Validators.min(data.carbohydratesPer100g, 0, 'Углеводы') ||
                         Validators.max(data.carbohydratesPer100g, 100, 'Углеводы');
        if (carbError) errors.carbohydratesPer100g = carbError;

        const bzhuError = Validators.bzhuSum(data.proteinsPer100g, data.fatsPer100g, data.carbohydratesPer100g);
        if (bzhuError) errors.bzhu = bzhuError;

        const catError = Validators.required(data.category, 'Категория');
        if (catError) errors.category = catError;

        const cookError = Validators.required(data.cookingRequirement, 'Необходимость готовки');
        if (cookError) errors.cookingRequirement = cookError;

        return errors;
    }

    static validateDish(data: any, composition: any[]): Record<string, string> {
        const errors: Record<string, string> = {};

        const nameError = Validators.required(data.name, 'Название') || 
                         Validators.minLength(data.name, 2, 'Название');
        if (nameError) errors.name = nameError;

        const servingError = Validators.positive(data.servingSizeGrams, 'Размер порции');
        if (servingError) errors.servingSizeGrams = servingError;

        if (!composition || composition.length === 0) {
            errors.composition = 'Состав блюда не может быть пустым';
        }

        return errors;
    }
}

export interface NutritionInput {
    productNutrition: {
        caloriesPer100g: number;
        proteinsPer100g: number;
        fatsPer100g: number;
        carbohydratesPer100g: number;
    };
    quantityGrams: number;
}

export interface NutritionResult {
    calories: number;
    proteins: number;
    fats: number;
    carbohydrates: number;
}