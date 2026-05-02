import { Validators, NutritionInput } from '../src/utils/validators';

describe('Validators.calculateNutrition', () => {
    const createNutritionInput = (quantityGrams: number): NutritionInput => ({
        quantityGrams,
        productNutrition: {
            caloriesPer100g: 200,
            proteinsPer100g: 10,
            fatsPer100g: 5,
            carbohydratesPer100g: 30,
        },
    });

    describe('Эквивалентное разбиение', () => {
        test('EC1: Пустой массив — возвращает нули', () => {
            const result = Validators.calculateNutrition([]);
            expect(result).toEqual({
                calories: 0,
                proteins: 0,
                fats: 0,
                carbohydrates: 0,
            });
        });

        test('EC2: Один продукт с валидным количеством >0', () => {
            const input: NutritionInput[] = [createNutritionInput(100)];
            const result = Validators.calculateNutrition(input);

            expect(result.calories).toBe(200);
            expect(result.proteins).toBe(10);
            expect(result.fats).toBe(5);
            expect(result.carbohydrates).toBe(30);
        });

        test('EC3: Несколько продуктов с валидным количеством', () => {
            const input: NutritionInput[] = [
                createNutritionInput(100),
                createNutritionInput(50),
            ];
            const result = Validators.calculateNutrition(input);

            expect(result.calories).toBe(200 * 1.5);
            expect(result.proteins).toBe(10 * 1.5);
            expect(result.fats).toBe(5 * 1.5);
            expect(result.carbohydrates).toBe(30 * 1.5);
        });

        test('EC4: Продукты с quantityGrams <=0 — игнорируются', () => {
            const input: NutritionInput[] = [
                createNutritionInput(0),
                createNutritionInput(-10),
                createNutritionInput(100),
            ];
            const result = Validators.calculateNutrition(input);

            expect(result.calories).toBe(200);
            expect(result.proteins).toBe(10);
            expect(result.fats).toBe(5);
            expect(result.carbohydrates).toBe(30);
        });
    });

    describe('Анализ граничных значений (BVA)', () => {
        test('BVA1: quantityGrams = 0 — не учитывается (непосредственно на границе)', () => {
            const input: NutritionInput[] = [createNutritionInput(0)];
            const result = Validators.calculateNutrition(input);
            expect(result).toEqual({
                calories: 0,
                proteins: 0,
                fats: 0,
                carbohydrates: 0,
            });
        });

        test('BVA2: quantityGrams = 1 — минимальное положительное значение', () => {
            const input: NutritionInput[] = [createNutritionInput(1)];
            const result = Validators.calculateNutrition(input);
            expect(result.calories).toBe(200 * 0.01);
            expect(result.proteins).toBe(10 * 0.01);
            expect(result.fats).toBe(5 * 0.01);
            expect(result.carbohydrates).toBe(30 * 0.01);
        });

        test('BVA3: quantityGrams = -1 — отрицательное значение (не учитывается)', () => {
            const input: NutritionInput[] = [createNutritionInput(-1)];
            const result = Validators.calculateNutrition(input);
            expect(result).toEqual({
                calories: 0,
                proteins: 0,
                fats: 0,
                carbohydrates: 0,
            });
        });

        test('BVA4: quantityGrams с плавающей точкой (0.001 — почти ноль, >0)', () => {
            const input: NutritionInput[] = [createNutritionInput(0.001)];
            const result = Validators.calculateNutrition(input);
            expect(result.calories).toBe(200 * 0.00001);
            expect(result.proteins).toBe(10 * 0.00001);
        });
    });

    describe('Дополнительные кейсы', () => {
        test('Смесь валидных и невалидных количеств', () => {
            const input: NutritionInput[] = [
                createNutritionInput(200),
                createNutritionInput(0),
                createNutritionInput(-5),
            ];
            const result = Validators.calculateNutrition(input);
            expect(result.calories).toBe(400);
        });

        test('Разные продукты с разной КБЖУ', () => {
            const productA: NutritionInput = {
                quantityGrams: 100,
                productNutrition: {
                    caloriesPer100g: 100,
                    proteinsPer100g: 20,
                    fatsPer100g: 10,
                    carbohydratesPer100g: 5,
                },
            };
            const productB: NutritionInput = {
                quantityGrams: 50,
                productNutrition: {
                    caloriesPer100g: 300,
                    proteinsPer100g: 5,
                    fatsPer100g: 15,
                    carbohydratesPer100g: 50,
                },
            };
            const result = Validators.calculateNutrition([productA, productB]);

            expect(result.calories).toBe(100 + 300 * 0.5);
            expect(result.proteins).toBe(20 + 5 * 0.5);
            expect(result.fats).toBe(10 + 15 * 0.5);
            expect(result.carbohydrates).toBe(5 + 50 * 0.5);
        });
    });
});