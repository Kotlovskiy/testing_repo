import { dishService } from '../src/services/dishService';
import { productService } from '../src/services/productService';
import { CreateUpdateDishDto, DishCategory, Flags } from '../src/types';
import { CreateUpdateProductDto } from '../src/types';

async function createTestProduct(overrides: Partial<CreateUpdateProductDto> = {}): Promise<number> {
  const dto: CreateUpdateProductDto = {
    name: `product-${Date.now()}-${Math.random()}`,
    photoUrls: [],
    caloriesPer100g: 100,
    proteinsPer100g: 10,
    fatsPer100g: 5,
    carbohydratesPer100g: 20,
    composition: null,
    category: 'Meat',
    cookingRequirement: 'NeedsCooking',
    flags: [],
    ...overrides
  };
  const prod = await productService.create(dto);
  return prod.id;
}

async function deleteProductSafely(id: number) {
  try { await productService.delete(id); } catch {}
}

describe('Dishes API Integration Tests', () => {
  let createdDishIds: number[] = [];
  let createdProductIds: number[] = [];

  afterEach(async () => {
    for (const id of createdDishIds) {
      try { await dishService.delete(id); } catch {}
    }
    for (const id of createdProductIds) {
      await deleteProductSafely(id);
    }
    createdDishIds = [];
    createdProductIds = [];
  });

  describe('POST /api/dishes - Создание блюда (авторасчёт и макросы)', () => {
    it('должен создать блюдо с авто-расчётом КБЖУ на основе состава', async () => {
      const prodId = await createTestProduct({ caloriesPer100g: 200, proteinsPer100g: 15, fatsPer100g: 10, carbohydratesPer100g: 30 });
      createdProductIds.push(prodId);

      const dto: CreateUpdateDishDto = {
        name: 'Тестовое блюдо',
        servingSizeGrams: 300,
        caloriesPerServing: null,
        proteinsPerServing: null,
        fatsPerServing: null,
        carbohydratesPerServing: null,
        category: 'SecondCourse',
        flags: [],
        composition: [{ productId: prodId, quantityGrams: 150 }],
        photoUrls: []
      };

      const dish = await dishService.create(dto);
      createdDishIds.push(dish.id);
      expect(dish.caloriesPerServing).toBeCloseTo(300, 1);
      expect(dish.proteinsPerServing).toBeCloseTo(22.5, 1);
      expect(dish.fatsPerServing).toBeCloseTo(15, 1);
      expect(dish.carbohydratesPerServing).toBeCloseTo(45, 1);
    });

    it('должен позволить переопределить КБЖУ вручную', async () => {
      const prodId = await createTestProduct();
      createdProductIds.push(prodId);

      const dto: CreateUpdateDishDto = {
        name: 'Ручное КБЖУ',
        servingSizeGrams: 100,
        caloriesPerServing: 50,
        proteinsPerServing: 5,
        fatsPerServing: 5,
        carbohydratesPerServing: 5,
        category: 'SecondCourse',
        flags: [],
        composition: [{ productId: prodId, quantityGrams: 100 }],
        photoUrls: []
      };
      const dish = await dishService.create(dto);
      createdDishIds.push(dish.id);
      expect(dish.caloriesPerServing).toBe(50);
    });

    describe('Макросы категорий в названии', () => {
      it.each([
        { name: '!десерт Шоколадный торт', expectedName: 'Шоколадный торт', expectedCategory: 'Dessert' },
        { name: '!первое Борщ', expectedName: 'Борщ', expectedCategory: 'FirstCourse' },
        { name: '!второе Котлеты', expectedName: 'Котлеты', expectedCategory: 'SecondCourse' },
        { name: '!напиток Компот', expectedName: 'Компот', expectedCategory: 'Drink' },
        { name: '!салат Цезарь', expectedName: 'Цезарь', expectedCategory: 'Salad' },
        { name: '!суп Харчо', expectedName: 'Харчо', expectedCategory: 'Soup' },
        { name: '!перекус Орехи', expectedName: 'Орехи', expectedCategory: 'Snack' },
      ])('макрос $name → название "$expectedName", категория $expectedCategory', async ({ name, expectedName, expectedCategory }) => {
        const prodId = await createTestProduct();
        createdProductIds.push(prodId);
        const dto: CreateUpdateDishDto = {
          name,
          servingSizeGrams: 200,
          caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null,
          category: undefined,
          flags: [],
          composition: [{ productId: prodId, quantityGrams: 100 }],
          photoUrls: []
        };
        const dish = await dishService.create(dto);
        createdDishIds.push(dish.id);
        expect(dish.name).toBe(expectedName);
        expect(dish.category).toBe(expectedCategory);
      });

      it('при наличии макроса и явной категории приоритет у поля category', async () => {
        const prodId = await createTestProduct();
        createdProductIds.push(prodId);
        const dto: CreateUpdateDishDto = {
          name: '!десерт Мусс',
          servingSizeGrams: 150,
          caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null,
          category: 'Drink',
          flags: [],
          composition: [{ productId: prodId, quantityGrams: 100 }],
          photoUrls: []
        };
        const dish = await dishService.create(dto);
        createdDishIds.push(dish.id);
        expect(dish.name).toBe('Мусс');
        expect(dish.category).toBe('Drink');
      });
    });

    describe('Ограничения флагов блюда по составу', () => {
      it.each(Object.values(Flags))('должен разрешить флаг %s, если все продукты с флагом %s', async (flag) => {
        const prodId = await createTestProduct({ flags: [flag] });
        createdProductIds.push(prodId);
        const dto: CreateUpdateDishDto = {
          name: '$flag блюдо',
          servingSizeGrams: 100,
          caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null,
          category: 'SecondCourse',
          flags: [flag],
          composition: [{ productId: prodId, quantityGrams: 100 }],
          photoUrls: []
        };
        const dish = await dishService.create(dto);
        createdDishIds.push(dish.id);
        expect(dish.flags).toContain(flag);
      });

      it.each(Object.values(Flags))('должен запретить флаг %s, если есть не-%s продукт', async (flag) => {
        const prodId = await createTestProduct({ flags: [] });
        createdProductIds.push(prodId);
        const dto: CreateUpdateDishDto = {
          name: 'Не $flag',
          servingSizeGrams: 100,
          caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null,
          category: 'SecondCourse',
          flags: [flag],
          composition: [{ productId: prodId, quantityGrams: 100 }],
          photoUrls: []
        };
        await expect(dishService.create(dto)).rejects.toThrow(/не могут быть установлены/);
      });
    });

    describe('Валидация размера порции (граничные значения)', () => {
      const baseDto = (size: number) => ({
        name: 'Порция тест',
        servingSizeGrams: size,
        caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null,
        category: 'SecondCourse',
        flags: [],
        composition: [{ productId: 0, quantityGrams: 100 }],
        photoUrls: []
      });

      it.each([
        { size: 0, desc: '0 г (недопустимо)' },
        { size: -1, desc: 'отрицательное значение (недопустимо)' },
      ])('размер порции $desc', async ({ size }) => {
        const prodId = await createTestProduct();
        createdProductIds.push(prodId);
        const dto = { ...baseDto(size), composition: [{ productId: prodId, quantityGrams: 100 }] };
        await expect(dishService.create(dto)).rejects.toThrow();
      });

      it('должен принять размер порции 0.1 г (граничное > 0)', async () => {
        const prodId = await createTestProduct();
        createdProductIds.push(prodId);
        const dto = { ...baseDto(0.1), composition: [{ productId: prodId, quantityGrams: 100 }] };
        const dish = await dishService.create(dto);
        createdDishIds.push(dish.id);
        expect(dish.servingSizeGrams).toBe(0.1);
      });
    });
  });

  describe('GET /api/dishes - Фильтрация и поиск блюд', () => {
    beforeEach(async () => {
      const prodId = await createTestProduct({ flags: ['Vegan', 'GlutenFree'] });
      createdProductIds.push(prodId);
      const dishes: CreateUpdateDishDto[] = [
        { name: 'Салат Оливье', servingSizeGrams: 200, caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null, category: 'Salad', flags: ['Vegan'], composition: [{ productId: prodId, quantityGrams: 100 }], photoUrls: [] },
        { name: 'Суп Грибной', servingSizeGrams: 250, caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null, category: 'Soup', flags: ['GlutenFree'], composition: [{ productId: prodId, quantityGrams: 150 }], photoUrls: [] },
      ];
      for (const dto of dishes) {
        const dish = await dishService.create(dto);
        createdDishIds.push(dish.id);
      }
    });

    afterAll(async () => {
      for (const id of createdDishIds) {
        try { await dishService.delete(id); } catch {}
      }
      for (const id of createdProductIds) {
        await deleteProductSafely(id);
      }
    });

    it.each(Object.values(DishCategory))('должен фильтровать по категории $s', async (category) => {
      const dishes = await dishService.getAll({ category });
      expect(dishes.every(d => d.category === category)).toBe(true);
    });

    it.each(Object.values(Flags))('должен фильтровать по флагу $s', async (flag) => {
      const dishes = await dishService.getAll({ flags: [flag] });
      expect(dishes.every(d => d.flags.includes(flag))).toBe(true);
    });

    it('должен искать по подстроке', async () => {
      const dishes = await dishService.getAll({ search: 'гриб' });
      expect(dishes.some(d => d.name.toLowerCase().includes('гриб'))).toBe(true);
    });
  });

  describe('PUT /api/dishes/:id - Редактирование блюда', () => {
    it.each(Object.values(Flags))('при изменении состава флаги должны пересчитываться: $s должен сняться', async (flag) => {
      const Prod = await createTestProduct({ flags: [flag] });
      createdProductIds.push(Prod);
      const dishDto: CreateUpdateDishDto = {
        name: '$flag блюдо',
        servingSizeGrams: 100,
        caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null,
        category: 'SecondCourse',
        flags: [flag],
        composition: [{ productId: Prod, quantityGrams: 100 }],
        photoUrls: []
      };
      const dish = await dishService.create(dishDto);
      createdDishIds.push(dish.id);

      const nonFlagProd = await createTestProduct({ flags: [] });
      createdProductIds.push(nonFlagProd);

      const updateDto: CreateUpdateDishDto = {
        ...dishDto,
        name: dish.name,
        composition: [
          { productId: Prod, quantityGrams: 50 },
          { productId: nonFlagProd, quantityGrams: 50 }
        ],
        flags: [flag]
      };
      const updated = await dishService.update(dish.id, updateDto);
      expect(updated.flags).not.toContain(flag);
    });
  });

  describe('DELETE /api/dishes/:id - Удаление блюда', () => {
    it('должен успешно удалить существующее блюдо', async () => {
      const prodId = await createTestProduct();
      createdProductIds.push(prodId);
      const dto: CreateUpdateDishDto = {
        name: 'Удаляемое',
        servingSizeGrams: 100,
        caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null,
        category: 'SecondCourse',
        flags: [],
        composition: [{ productId: prodId, quantityGrams: 100 }],
        photoUrls: []
      };
      const dish = await dishService.create(dto);
      const result = await dishService.delete(dish.id);
      expect(result).toBe(true);
    });

    it('должен выкинуть ошибку при попытке удалить уже удалённое блюдо', async () => {
      const prodId = await createTestProduct();
      createdProductIds.push(prodId);
      const dto: CreateUpdateDishDto = {
        name: 'Удаляемое',
        servingSizeGrams: 100,
        caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null,
        category: 'SecondCourse',
        flags: [],
        composition: [{ productId: prodId, quantityGrams: 100 }],
        photoUrls: []
      };
      const dish = await dishService.create(dto);
      const result = await dishService.delete(dish.id);
      expect(result).toBe(true);
      await expect(dishService.getById(dish.id)).rejects.toThrow();
    });
  });
});