import { Validators, NutritionInput, NutritionResult } from '../src/utils/validators';

function createNutritionInput(
    quantityGrams: number,
    overrides: Partial<NutritionInput['productNutrition']> = {}
): NutritionInput {
    return {
        quantityGrams,
        productNutrition: {
            caloriesPer100g: 200,
            proteinsPer100g: 10,
            fatsPer100g: 5,
            carbohydratesPer100g: 30,
            ...overrides,
        },
    };
}

describe('Validators.calculateNutrition', () => {
    describe('Эквивалентное разбиение (Equivalence Partitioning)', () => {
        test('EC1: должен вернуть нулевую питательность для пустого массива', () => {
            const result = Validators.calculateNutrition([]);
            expect(result).toEqual<NutritionResult>({
                calories: 0,
                proteins: 0,
                fats: 0,
                carbohydrates: 0,
            });
        });

        test('EC2: должен корректно рассчитать питательность для одного валидного продукта', () => {
            const input = [createNutritionInput(100)];
            const result = Validators.calculateNutrition(input);

            expect(result).toEqual<NutritionResult>({
                calories: 200,
                proteins: 10,
                fats: 5,
                carbohydrates: 30,
            });
        });

        test('EC3: должен суммировать питательность для нескольких валидных продуктов', () => {
            const input = [
                createNutritionInput(100),
                createNutritionInput(50),
            ];
            const result = Validators.calculateNutrition(input);

            expect(result).toEqual<NutritionResult>({
                calories: 200 * 1 + 200 * 0.5,
                proteins: 10 * 1 + 10 * 0.5,
                fats: 5 * 1 + 5 * 0.5,
                carbohydrates: 30 * 1 + 30 * 0.5,
            });
        });

        test('EC4: должен игнорировать невалидные продукты', () => {
            const input = [
                createNutritionInput(100, {
                    proteinsPer100g: -1,
                }),
                createNutritionInput(-10),
                createNutritionInput(100),
            ];
            const result = Validators.calculateNutrition(input);

            expect(result).toEqual<NutritionResult>({
                calories: 200,
                proteins: 10,
                fats: 5,
                carbohydrates: 30,
            });
        });
    });

    describe('Анализ граничных значений (Boundary Value Analysis)', () => {

        test('BVA1: должен игнорировать продукт при quantityGrams = 0', () => {
            const result = Validators.calculateNutrition([createNutritionInput(0)]);
            expect(result).toEqual<NutritionResult>({
                calories: 0,
                proteins: 0,
                fats: 0,
                carbohydrates: 0,
            });
        });

        test('BVA2: должен игнорировать продукт при quantityGrams = -0.001', () => {
            const result = Validators.calculateNutrition([createNutritionInput(-0.001)]);
            expect(result).toEqual<NutritionResult>({
                calories: 0,
                proteins: 0,
                fats: 0,
                carbohydrates: 0,
            });
        });

        test('BVA3: должен корректно обрабатывать минимальное положительное количество (0.001 г)', () => {
            const result = Validators.calculateNutrition([createNutritionInput(0.001)]);
            const factor = 0.001 / 100;

            expect(result.calories).toBeCloseTo(200 * factor);
            expect(result.proteins).toBeCloseTo(10 * factor);
            expect(result.fats).toBeCloseTo(5 * factor);
            expect(result.carbohydrates).toBeCloseTo(30 * factor);
        });

        describe.each([
            { field: 'caloriesPer100g' },
            { field: 'proteinsPer100g' },
            { field: 'fatsPer100g' },
            { field: 'carbohydratesPer100g' },
        ])('Параметризованный тест для отрицательной питательности', ({ field }) => {
            const validProduct = () => createNutritionInput(50);

            test(`BVA4: должен игнорировать продукт с ${field} = -0.001`, () => {
                const invalid = createNutritionInput(100, { [field]: -0.001 });
                const result = Validators.calculateNutrition([invalid, validProduct()]);
                const factor = 50 / 100;

                expect(result.calories).toBeCloseTo(200 * factor);
                expect(result.proteins).toBeCloseTo(10 * factor);
                expect(result.fats).toBeCloseTo(5 * factor);
                expect(result.carbohydrates).toBeCloseTo(30 * factor);
            });
        })

        test('BVA5: должен корректно обрабатывать продукт с caloriesPer100g = 0', () => {
            const result = Validators.calculateNutrition([
                createNutritionInput(100, { caloriesPer100g: 0 }),
                createNutritionInput(50),
            ]);
            const factor = 50 / 100;

            expect(result).toEqual<NutritionResult>({
                calories: 0 + 200 * factor,
                proteins: 10 + 10 * factor,
                fats: 5 + 5 * factor,
                carbohydrates: 30 + 30 * factor,
            });
        });

        test('BVA6: должен корректно обрабатывать caloriesPer100g = 0.001', () => {
            const result = Validators.calculateNutrition([
                createNutritionInput(100, { caloriesPer100g: 0.001 }),
            ]);

            expect(result.calories).toBeCloseTo(0.001);
            expect(result.proteins).toBeCloseTo(10);
            expect(result.fats).toBeCloseTo(5);
            expect(result.carbohydrates).toBeCloseTo(30);
        });
        
        test('BVA7: должен корректно обрабатывать продукт с proteinsPer100g = 0', () => {
            const result = Validators.calculateNutrition([
                createNutritionInput(100, { proteinsPer100g: 0 }),
                createNutritionInput(50),
            ]);
            const factor = 50 / 100;

            expect(result).toEqual<NutritionResult>({
                calories: 200 + 200 * factor,
                proteins: 0 + 10 * factor,
                fats: 5 + 5 * factor,
                carbohydrates: 30 + 30 * factor,
            });
        });

        test('BVA8: должен корректно обрабатывать proteinsPer100g = 0.001', () => {
            const result = Validators.calculateNutrition([
                createNutritionInput(100, { proteinsPer100g: 0.001 }),
            ]);

            expect(result.calories).toBeCloseTo(200);
            expect(result.proteins).toBeCloseTo(0.001);
            expect(result.fats).toBeCloseTo(5);
            expect(result.carbohydrates).toBeCloseTo(30);
        });

        test('BVA9: должен корректно обрабатывать продукт с fatsPer100g = 0', () => {
            const result = Validators.calculateNutrition([
                createNutritionInput(100, { fatsPer100g: 0 }),
                createNutritionInput(50),
            ]);
            const factor = 50 / 100;

            expect(result).toEqual<NutritionResult>({
                calories: 200 + 200 * factor,
                proteins: 10 + 10 * factor,
                fats: 0 + 5 * factor,
                carbohydrates: 30 + 30 * factor,
            });
        });

        test('BVA10: должен корректно обрабатывать fatsPer100g = 0.001', () => {
            const result = Validators.calculateNutrition([
                createNutritionInput(100, { fatsPer100g: 0.001 }),
            ]);

            expect(result.calories).toBeCloseTo(200);
            expect(result.proteins).toBeCloseTo(10);
            expect(result.fats).toBeCloseTo(0.001);
            expect(result.carbohydrates).toBeCloseTo(30);
        });

        test('BVA11: должен корректно обрабатывать продукт с carbohydratesPer100g = 0', () => {
            const result = Validators.calculateNutrition([
                createNutritionInput(100, { carbohydratesPer100g: 0 }),
                createNutritionInput(50),
            ]);
            const factor = 50 / 100;

            expect(result).toEqual<NutritionResult>({
                calories: 200 + 200 * factor,
                proteins: 10 + 10 * factor,
                fats: 5 + 5 * factor,
                carbohydrates: 0 + 30 * factor,
            });
        });

        test('BVA12: должен корректно обрабатывать carbohydratesPer100g = 0.001', () => {
            const result = Validators.calculateNutrition([
                createNutritionInput(100, { carbohydratesPer100g: 0.001 }),
            ]);

            expect(result.calories).toBeCloseTo(200);
            expect(result.proteins).toBeCloseTo(10);
            expect(result.fats).toBeCloseTo(5);
            expect(result.carbohydrates).toBeCloseTo(0.001);
        });
    });

    describe.each([
        { quantityGrams: 100, factor: 1 },
        { quantityGrams: 50, factor: 0.5 },
        { quantityGrams: 250, factor: 2.5 },
        { quantityGrams: 1.5, factor: 0.015 },
    ])('Параметризованный тест для количества $quantityGrams г', ({ quantityGrams, factor }) => {
        test(`должен масштабировать питательность с коэффициентом ${factor}`, () => {
            const result = Validators.calculateNutrition([createNutritionInput(quantityGrams)]);

            expect(result.calories).toBeCloseTo(200 * factor);
            expect(result.proteins).toBeCloseTo(10 * factor);
            expect(result.fats).toBeCloseTo(5 * factor);
            expect(result.carbohydrates).toBeCloseTo(30 * factor);
        });
    });

    describe('Дополнительные проверки', () => {
        test('должен корректно смешивать валидные и невалидные элементы', () => {
            const input = [
                createNutritionInput(200),
                createNutritionInput(0),
                createNutritionInput(-5),
                createNutritionInput(50, { caloriesPer100g: -10 }),
            ];
            const result = Validators.calculateNutrition(input);

            expect(result).toEqual<NutritionResult>({
                calories: 200 * 2,
                proteins: 10 * 2,
                fats: 5 * 2,
                carbohydrates: 30 * 2,
            });
        });

        test('должен корректно обрабатывать продукты с разными профилями питательности', () => {
            const productA = createNutritionInput(100, {
                caloriesPer100g: 100,
                proteinsPer100g: 20,
                fatsPer100g: 10,
                carbohydratesPer100g: 5,
            });
            const productB = createNutritionInput(50, {
                caloriesPer100g: 300,
                proteinsPer100g: 5,
                fatsPer100g: 15,
                carbohydratesPer100g: 50,
            });

            const result = Validators.calculateNutrition([productA, productB]);

            expect(result).toEqual<NutritionResult>({
                calories: 100 * 1 + 300 * 0.5,
                proteins: 20 * 1 + 5 * 0.5,
                fats: 10 * 1 + 15 * 0.5,
                carbohydrates: 5 * 1 + 50 * 0.5,
            });
        });

        test('не должен мутировать входные объекты', () => {
            const originalQuantity = 100;
            const originalNutrition = {
                caloriesPer100g: 200,
                proteinsPer100g: 10,
                fatsPer100g: 5,
                carbohydratesPer100g: 30,
            };
            const input: NutritionInput = {
                quantityGrams: originalQuantity,
                productNutrition: { ...originalNutrition },
            };
            const frozenInput = Object.freeze(input);

            expect(() => Validators.calculateNutrition([frozenInput])).not.toThrow();
            expect(input.quantityGrams).toBe(originalQuantity);
            expect(input.productNutrition).toEqual(originalNutrition);
        });
    });
});