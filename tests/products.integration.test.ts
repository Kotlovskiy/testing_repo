import { productService } from '../src/services/productService';
import { Product, CreateUpdateProductDto, ProductCategory, CookingRequirement, Flags } from '../src/types';

async function createProduct(dto: CreateUpdateProductDto): Promise<Product> {
  return productService.create(dto);
}

async function deleteProductIfExists(id: number): Promise<void> {
  try {
    await productService.delete(id);
  } catch (e) {
  }
}

describe('Products API Integration Tests', () => {
  let createdProductIds: number[] = [];

  afterEach(async () => {
    for (const id of createdProductIds) {
      await deleteProductIfExists(id);
    }
    createdProductIds = [];
  });

  describe('POST /api/products - Создание продукта', () => {
    const validProduct: CreateUpdateProductDto = {
      name: 'Тестовый продукт',
      photoUrls: [],
      caloriesPer100g: 50,
      proteinsPer100g: 5,
      fatsPer100g: 5,
      carbohydratesPer100g: 40,
      composition: 'тест',
      category: 'Meat',
      cookingRequirement: 'NeedsCooking',
      flags: []
    };

    it('должен создать продукт с корректными данными', async () => {
      const product = await createProduct(validProduct);
      createdProductIds.push(product.id);
      expect(product.name).toBe(validProduct.name);
      expect(product.caloriesPer100g).toBe(validProduct.caloriesPer100g);
    });

    describe('Валидация названия (Анализ граничных значение)', () => {
      it('длина 1 символ (невалидно, граница - 1)', async () => {
        const dto = { ...validProduct, name: 'A' };
        await expect(createProduct(dto)).rejects.toThrow();
      });

      it.each([
        { name: 'Ab', desc: 'должен принять название длиной 2 символа (граничное значение)' },
        { name: 'Abc', desc: 'должен принять название длиной 3 символа' }
      ])('$desc', async ({ name }) => {
        const dto = { ...validProduct, name };
        const product = await createProduct(dto);
        createdProductIds.push(product.id);
        expect(product.name).toBe(name);
      });
    });

    describe('Валидация каждого показателя КБЖУ на 100 г (граничные значения)', () => {
      it.each([
        { field: 'proteinsPer100g', value: -1, name: 'белки' },
        { field: 'caloriesPer100g', value: -1, name: 'калории' },
        { field: 'fatsPer100g', value: -1, name: 'жиры' },
        { field: 'carbohydratesPer100g', value: -1, name: 'углеводы' }
      ])('не должен создать продукт где $name = $value ', async ({ field, value }) => {
        const dto = { ...validProduct, [field]: value };
        await expect(createProduct(dto)).rejects.toThrow();
      });

      it.each([
        { calories: 10, proteins: 101, fats: 0, carbs: 0, name: 'белки', target: 101 },
        { calories: 10, proteins: 0, fats: 101, carbs: 0, name: 'жиры', target: 101 },
        { calories: 10, proteins: 0, fats: 0, carbs: 101, name: 'углеводы', target: 101 }
      ])('Должен создаваться продукт, где $name = $target ', async ({ calories, proteins, fats, carbs }) => {
        const dto = { ...validProduct, caloriesPer100g: calories, proteinsPer100g: proteins, fatsPer100g: fats, carbohydratesPer100g: carbs };
        await expect(createProduct(dto)).rejects.toThrow();
      });

      it.each([
        { calories: 10, proteins: 0, fats: 2, carbs: 90, name: 'белки', target: 0 },
        { calories: 10, proteins: 2, fats: 0, carbs: 90, name: 'жиры', target: 0 },
        { calories: 10, proteins: 2, fats: 2, carbs: 0, name: 'углеводы', target: 0 },
        { calories: 0, proteins: 2, fats: 2, carbs: 90, name: 'калории', target: 0 },
        { calories: 10, proteins: 1, fats: 0, carbs: 90, name: 'белки', target: 1 },
        { calories: 10, proteins: 2, fats: 1, carbs: 90, name: 'жиры', target: 1 },
        { calories: 10, proteins: 2, fats: 2, carbs: 1, name: 'углеводы', target: 1 },
        { calories: 1, proteins: 2, fats: 2, carbs: 90, name: 'калории', target: 1 },
        { calories: 10, proteins: 99, fats: 0, carbs: 0, name: 'белки', target: 99 },
        { calories: 10, proteins: 0, fats: 99, carbs: 0, name: 'жиры', target: 99 },
        { calories: 10, proteins: 0, fats: 0, carbs: 99, name: 'углеводы', target: 99 },
        { calories: 10, proteins: 100, fats: 0, carbs: 0, name: 'белки', target: 100 },
        { calories: 10, proteins: 0, fats: 100, carbs: 0, name: 'жиры', target: 100 },
        { calories: 10, proteins: 0, fats: 0, carbs: 100, name: 'углеводы', target: 100 }
      ])('Должен создаваться продукт, где $name = $target ', async ({ calories, proteins, fats, carbs }) => {
        const dto = { ...validProduct, caloriesPer100g: calories, proteinsPer100g: proteins, fatsPer100g: fats, carbohydratesPer100g: carbs };
        const product = await createProduct(dto);
        createdProductIds.push(product.id);
        expect(product).toMatchObject({ caloriesPer100g: calories, proteinsPer100g: proteins, fatsPer100g: fats, carbohydratesPer100g: carbs });
      });
    });

    describe('Валидация суммы БЖУ на 100 г (граничные значения)', () => {
      it.each([
        { proteins: 5, fats: 5, carbs: 90, desc: 'сумма ровно 100 (допустимо)' },
        { proteins: 5, fats: 5, carbs: 89, desc: 'сумма 99 (допустимо)' },
        { proteins: 0, fats: 0, carbs: 0, desc: 'сумма ровно ноль (допустимо)' },
        { proteins: 1, fats: 0, carbs: 0, desc: 'сумма 1 (допустимо)' }
      ])('$desc', async ({ proteins, fats, carbs }) => {
        const dto = { ...validProduct, proteinsPer100g: proteins, fatsPer100g: fats, carbohydratesPer100g: carbs };
        const product = await createProduct(dto);
        createdProductIds.push(product.id);
        expect(product.proteinsPer100g).toBe(proteins);
      });

      it('сумма 101 (недопустимо)', async () => {
        const dto = { ...validProduct, proteinsPer100g: 5, fatsPer100g: 5, carbohydratesPer100g: 91 };
        await expect(createProduct(dto)).rejects.toThrow();
      });
    });

    describe('Проверка категорий', () => {
      it.each(Object.values(ProductCategory))('Должен создаваться продукт с категорией %s', async (category) => {
        const dto = { ...validProduct, category };
        const product = await createProduct(dto);
        createdProductIds.push(product.id);
        expect(product.category).toBe(category);
      });

      it('не должен создать продукт с недопустимой категорией', async () => {
        const dto = { ...validProduct, category: 'InvalidCategory' as any };
        await expect(createProduct(dto)).rejects.toThrow();
      });
    });

    describe('Проверка cookingRequirement', () => {
      it.each(Object.values(CookingRequirement))('Должен создаваться продукт с cookingRequirement %s', async (cookingRequirement) => {
        const dto = { ...validProduct, cookingRequirement };
        const product = await createProduct(dto);
        createdProductIds.push(product.id);
        expect(product.cookingRequirement).toBe(cookingRequirement);
      });

      it('не должен создать продукт с недопустимым cookingRequirement', async () => {
        const dto = { ...validProduct, cookingRequirement: 'InvalidReq' as any };
        await expect(createProduct(dto)).rejects.toThrow();
      });
    });

    describe('Проверка флагов', () => {
      it('Должен создаваться продукт без флагов', async () => {
        const dto = { ...validProduct, flags: [] };
        const product = await createProduct(dto);
        createdProductIds.push(product.id);
        expect(product.flags.length).toEqual(0)
      });

      const allCombinations = Object.values(Flags).reduce((acc, flag) => {
        const newCombinations = acc.map(combo => [...combo, flag]);
        return [...acc, ...newCombinations, [flag]];
      }, [] as Flags[][]);

      it.each(allCombinations.map(flags => [flags]))('Должен создаваться продукт с флагами %j', async (flags) => {
        const dto = { ...validProduct, flags };
        const product = await createProduct(dto);
        createdProductIds.push(product.id);
        expect(product.flags.sort()).toEqual(flags.sort());
      });

      it('не должен создать продукт с недопустимым флагом', async () => {
        const dto = { ...validProduct, flags: ['InvalidFlag'] };
        await expect(createProduct(dto)).rejects.toThrow();
      });
    });
  });

  describe('GET /api/products - Получение списка продуктов', () => {
    let localCreatedProductIds: number[] = [];

    afterAll(async () => {
      for (const id of localCreatedProductIds) {
        await deleteProductIfExists(id);
      }
      localCreatedProductIds = [];
    });

    beforeAll(async () => {
      const products: CreateUpdateProductDto[] = [
      { name: "Говядина", photoUrls: [], caloriesPer100g: 200, proteinsPer100g: 20, fatsPer100g: 15, carbohydratesPer100g: 0, composition: null, category: "Meat", cookingRequirement: "NeedsCooking", flags: ['GlutenFree', 'SugarFree'] },
      { name: "Морковь", photoUrls: [], caloriesPer100g: 41, proteinsPer100g: 1, fatsPer100g: 0, carbohydratesPer100g: 10, composition: null, category: "Vegetables", cookingRequirement: "ReadyToEat", flags: ["Vegan", 'GlutenFree', 'SugarFree'] },
      { name: "Курица", photoUrls: [], caloriesPer100g: 150, proteinsPer100g: 25, fatsPer100g: 5, carbohydratesPer100g: 0, composition: null, category: "Meat", cookingRequirement: "NeedsCooking", flags: ['GlutenFree', 'SugarFree'] },
      { name: "Мороженое пломбир", photoUrls: [], caloriesPer100g: 230, proteinsPer100g: 3.5, fatsPer100g: 15, carbohydratesPer100g: 20, composition: null, category: "Frozen", cookingRequirement: "ReadyToEat", flags: [] },
      { name: "Укроп", photoUrls: [], caloriesPer100g: 40, proteinsPer100g: 2.5, fatsPer100g: 0.5, carbohydratesPer100g: 6, composition: null, category: "Greens", cookingRequirement: "ReadyToEat", flags: ["Vegan", 'GlutenFree', 'SugarFree'] },
      { name: "Корица", photoUrls: [], caloriesPer100g: 247, proteinsPer100g: 4, fatsPer100g: 1.2, carbohydratesPer100g: 80, composition: null, category: "Spices", cookingRequirement: "ReadyToEat", flags: ["Vegan", 'GlutenFree', 'SugarFree'] },
      { name: "Гречка", photoUrls: [], caloriesPer100g: 343, proteinsPer100g: 13, fatsPer100g: 3.5, carbohydratesPer100g: 72, composition: null, category: "Grains", cookingRequirement: "NeedsCooking", flags: ["Vegan", 'GlutenFree', 'SugarFree'] },
      { name: "Тунец консервированный", photoUrls: [], caloriesPer100g: 198, proteinsPer100g: 24, fatsPer100g: 11, carbohydratesPer100g: 0, composition: null, category: "Canned", cookingRequirement: "ReadyToEat", flags: ['GlutenFree', 'SugarFree'] },
      { name: "Масло оливковое", photoUrls: [], caloriesPer100g: 884, proteinsPer100g: 0, fatsPer100g: 100, carbohydratesPer100g: 0, composition: null, category: "Liquid", cookingRequirement: "SemiFinished", flags: ["Vegan", 'GlutenFree', 'SugarFree'] },
      { name: "Мед", photoUrls: [], caloriesPer100g: 304, proteinsPer100g: 0.3, fatsPer100g: 0, carbohydratesPer100g: 82, composition: null, category: "Sweets", cookingRequirement: "ReadyToEat", flags: ["Vegan", 'GlutenFree'] }
    ];
      for (const dto of products) {
        const prod = await createProduct(dto);
        localCreatedProductIds.push(prod.id);
      }
    });

    it('должен вернуть все продукты без фильтров', async () => {
      const products = await productService.getAll();
      expect(products.length).toBeGreaterThanOrEqual(10);
    });

    it.each(Object.values(ProductCategory))('должен фильтровать по категории %s', async (category) => {
      const products = await productService.getAll({ category });
      expect(products.every(p => p.category === category)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it.each(Object.values(CookingRequirement))('должен фильтровать по cookingRequirement %s', async (cookingRequirement) => {
      const products = await productService.getAll({ cookingRequirement });
      expect(products.every(p => p.cookingRequirement === cookingRequirement)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it.each(Object.values(Flags))('должен фильтровать по флагу %s', async (flag) => {
      const products = await productService.getAll({ flags: [flag] });
      expect(products.every(p => p.flags.includes(flag))).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('должен искать по подстроке названия (регистронезависимый)', async () => {
      const products = await productService.getAll({ search: 'мор' });
      expect(products.some(p => p.name.toLowerCase().includes('мор'))).toBe(true);
    });

    it('Дожен сортировать по имени', async () => {
      const products = await productService.getAll({ sortBy: "name" });
      const expectedSorted = [...products].sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
      expect(products).toEqual(expectedSorted);
    });

    it.each([
      { sortBy: "calories", key: "caloriesPer100g" },
      { sortBy: "proteins", key: "proteinsPer100g" },
      { sortBy: "fats", key: "fatsPer100g" },
      { sortBy: "carbohydrates", key: "carbohydratesPer100g" }
    ])('должен сортировать по $sortBy', async ({ sortBy, key }) => {
      const products = await productService.getAll({ sortBy });
      const expectedSorted = [...products].sort((a, b) => {
        return a[key as keyof typeof a] as number - (b[key as keyof typeof b] as number);
      });
      
      expect(products).toEqual(expectedSorted);
    });

    it('Дожен сортировать по убыванию', async () => {
      const products = await productService.getAll({ sortBy: "name", descending: true });
      const expectedSorted = [...products].sort((a, b) => { return a.name > b.name ? -1 : a.name < b.name ? 1 : 0; });
      expect(products).toEqual(expectedSorted);
    });
  });

  describe('GET /api/products/:id - Получение продукта по ID', () => {
    it('должен вернуть продукт по существующему ID', async () => {
      const prod = await createProduct({
        name: 'Уникальный продукт',
        category: 'Greens',
        cookingRequirement: 'ReadyToEat',
        caloriesPer100g: 10, proteinsPer100g: 1, fatsPer100g: 0, carbohydratesPer100g: 2,
        composition: null, photoUrls: [], flags: []
      });
      createdProductIds.push(prod.id);
      const fetched = await productService.getById(prod.id);
      expect(fetched.id).toBe(prod.id);
      expect(fetched.name).toBe(prod.name);
    });

    it('должен вернуть 404 при несуществующем ID', async () => {
      await expect(productService.getById(-1)).rejects.toThrow();
    });
  });

  describe('PUT /api/products/:id - Обновление продукта', () => {
    it('должен обновить существующий продукт', async () => {
      const prod = await createProduct({
        name: 'Старое имя', category: 'Spices', cookingRequirement: 'ReadyToEat',
        caloriesPer100g: 0, proteinsPer100g: 0, fatsPer100g: 0, carbohydratesPer100g: 0,
        composition: null, photoUrls: [], flags: []
      });
      createdProductIds.push(prod.id);
      const updateData: CreateUpdateProductDto = { ...prod, name: 'Новое имя', caloriesPer100g: 5 };
      const updated = await productService.update(prod.id, updateData);
      expect(updated.name).toBe('Новое имя');
      expect(updated.caloriesPer100g).toBe(5);
      expect(updated.updatedAt == null).toBeFalsy
    });

    it('должен вернуть ошибку при обновлении несуществующего продукта', async () => {
        const validProduct: CreateUpdateProductDto = {
            name: 'Тестовый продукт',
            photoUrls: [],
            caloriesPer100g: 50,
            proteinsPer100g: 5,
            fatsPer100g: 5,
            carbohydratesPer100g: 40,
            composition: 'тест',
            category: 'Meat',
            cookingRequirement: 'NeedsCooking',
            flags: []
            };
        await expect(productService.update(-1, validProduct)).rejects.toThrow();
    });

    it('должен соблюдать валидацию суммы БЖУ при обновлении', async () => {
      const prod = await createProduct({
        name: 'Для обновления', category: 'Grains', cookingRequirement: 'NeedsCooking',
        caloriesPer100g: 100, proteinsPer100g: 10, fatsPer100g: 10, carbohydratesPer100g: 10,
        composition: null, photoUrls: [], flags: []
      });
      createdProductIds.push(prod.id);
      const invalidUpdate = { ...prod, proteinsPer100g: 50, fatsPer100g: 50, carbohydratesPer100g: 50 };
      await expect(productService.update(prod.id, invalidUpdate)).rejects.toThrow();
    });
  });

  describe('DELETE /api/products/:id - Удаление продукта', () => {
    const dto = {
        name: 'Удаляемый', category: 'Canned', cookingRequirement: 'ReadyToEat',
        caloriesPer100g: 0, proteinsPer100g: 0, fatsPer100g: 0, carbohydratesPer100g: 0,
        composition: null, photoUrls: [], flags: []
      }
    it('должен удалить продукт, не используемый в блюдах', async () => {
      const prod = await createProduct(dto);
      const id = prod.id;
      const result = await productService.delete(id);
      expect(result).toBe(true);
      await expect(productService.getById(id)).rejects.toThrow();
    });

    it('должен запретить удаление продукта, используемого в блюде (409 Conflict)', async () => {
      const prod = await createProduct(dto);
      createdProductIds.push(prod.id);

      const dishService = (require('../src/services/dishService').dishService);
      const dishDto = {
        name: 'Блюдо с продуктом',
        servingSizeGrams: 200,
        caloriesPerServing: null, proteinsPerServing: null, fatsPerServing: null, carbohydratesPerServing: null,
        category: 'SecondCourse',
        flags: [],
        composition: [{ productId: prod.id, quantityGrams: 100 }],
        photoUrls: []
      };
      const dish = await dishService.create(dishDto);
      await expect(productService.delete(prod.id)).rejects.toThrow(/используется в блюдах/);
      await dishService.delete(dish.id);
    });

    it('должен кидать ошибку при попытке удалить уже удалённый продукт', async () => {
      const prod = await createProduct(dto);
      const id = prod.id;
      const result = await productService.delete(id);
      expect(result).toBe(true);
      await expect(productService.delete(id)).rejects.toThrow();
    });
  });
});