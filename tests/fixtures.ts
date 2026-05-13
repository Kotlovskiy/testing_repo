import { test as base, request as baseRequest } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { ProductsListPage } from '../pages/ProductsListPage';
import { ProductFormPage } from '../pages/ProductFormPage';
import { ProductViewPage } from '../pages/ProductViewPage';
import { DishesListPage } from '../pages/DishesListPage';
import { DishFormPage } from '../pages/DishFormPage';
import { Product, Dish,
  ProductCategory, CookingRequirement,
  CreateUpdateDishDto, CreateUpdateProductDto,
  Flags, } from '../types'

interface TestData {
  products: Product[];
  dishes: Dish[];
}

const timestamp = Date.now();
const uniqueId = () => `${timestamp}_${Math.random().toString(36).substring(2, 8)}`;

const ALL_CATEGORIES = Object.values(ProductCategory);
const ALL_COOKING_REQUIREMENTS = Object.values(CookingRequirement);
const ALL_FLAGS = Object.values(Flags);

async function createProductViaApi(
  apiRequest: Awaited<ReturnType<typeof baseRequest.newContext>>,
  baseURL: string | undefined,
  productData: CreateUpdateProductDto,
): Promise<Product> {
  const response = await apiRequest.post(`${baseURL}/api/products`, {
    data: productData,
  });
  if (!response.ok()) {
    throw new Error(`Failed to create product: ${await response.text()}`);
  }
  return response.json();
}

async function createDishViaApi(
  apiRequest: Awaited<ReturnType<typeof baseRequest.newContext>>,
  baseURL: string | undefined,
  dishData: CreateUpdateDishDto,
): Promise<Dish> {
  const response = await apiRequest.post(`${baseURL}/api/dishes`, {
    data: dishData,
  });
  if (!response.ok()) {
    throw new Error(`Failed to create dish: ${await response.text()}`);
  }
  return response.json();
}

async function deleteProductViaApi(
  apiRequest: Awaited<ReturnType<typeof baseRequest.newContext>>,
  baseURL: string | undefined,
  id: number,
): Promise<void> {
  await apiRequest.delete(`${baseURL}/api/products/${id}`);
}

async function deleteDishViaApi(
  apiRequest: Awaited<ReturnType<typeof baseRequest.newContext>>,
  baseURL: string | undefined,
  id: number,
): Promise<void> {
  await apiRequest.delete(`${baseURL}/api/dishes/${id}`);
}

async function generateTestData(
  apiRequest: Awaited<ReturnType<typeof baseRequest.newContext>>,
  baseURL: string | undefined,
): Promise<TestData> {
  const products: Product[] = [];
  const dishes: Dish[] = [];

  const prefix = `test_${uniqueId()}`;

  for (const category of ALL_CATEGORIES) {
    const productData: CreateUpdateProductDto = {
      name: `${prefix}_cat_${category}`,
      photoUrls: null,
      caloriesPer100g: 100,
      proteinsPer100g: 10,
      fatsPer100g: 5,
      carbohydratesPer100g: 20,
      composition: `Тестовый продукт категории ${category}`,
      category,
      cookingRequirement: CookingRequirement.SemiFinished,
      flags: [],
    };
    const product = await createProductViaApi(apiRequest, baseURL, productData);
    products.push(product);
  }

  for (const flag of ALL_FLAGS) {
    const productData: CreateUpdateProductDto = {
      name: `${prefix}_flag_${flag}`,
      photoUrls: null,
      caloriesPer100g: 120,
      proteinsPer100g: 15,
      fatsPer100g: 8,
      carbohydratesPer100g: 25,
      composition: `Тестовый продукт с флагом ${flag}`,
      category: ProductCategory.Vegetables,
      cookingRequirement: CookingRequirement.ReadyToEat,
      flags: [flag],
    };
    const product = await createProductViaApi(apiRequest, baseURL, productData);
    products.push(product);
  }

  for (const requirement of ALL_COOKING_REQUIREMENTS) {
    const alreadyExists = products.some(p => p.cookingRequirement === requirement && p.flags.length === 0);
    if (!alreadyExists) {
      const productData: CreateUpdateProductDto = {
        name: `${prefix}_cook_${requirement}`,
        photoUrls: null,
        caloriesPer100g: 130,
        proteinsPer100g: 12,
        fatsPer100g: 7,
        carbohydratesPer100g: 22,
        composition: `Тестовый продукт с готовностью ${requirement}`,
        category: ProductCategory.Meat,
        cookingRequirement: requirement,
        flags: [],
      };
      const product = await createProductViaApi(apiRequest, baseURL, productData);
      products.push(product);
    }
  }

  const veganProduct = products.find(p => p.flags.includes('Vegan'));
  const anyProduct = products[0];

  const dish1Data: CreateUpdateDishDto = {
    name: `${prefix}_Dish1_Vegan_GlutenFree`,
    photoUrls: null,
    servingSizeGrams: 200,
    flags: ['Vegan'],
    composition: [
      ...(veganProduct ? [{ productId: veganProduct.id, quantityGrams: 100 }] : []),
    ],
    category: 'Dessert',
  };
  const dish1 = await createDishViaApi(apiRequest, baseURL, dish1Data);
  dishes.push(dish1);

  const sugarFreeProduct = products.find(p => p.flags.includes('SugarFree'));
  const dish2Data: CreateUpdateDishDto = {
    name: `${prefix}_Dish2_Dessert`,
    photoUrls: null,
    servingSizeGrams: 150,
    flags: [],
    composition: [
      ...(sugarFreeProduct ? [{ productId: sugarFreeProduct.id, quantityGrams: 80 }] : []),
      { productId: anyProduct.id, quantityGrams: 70 },
    ],
    category: 'Dessert',
  };
  const dish2 = await createDishViaApi(apiRequest, baseURL, dish2Data);
  dishes.push(dish2);

  if (products.length === 0) {
    throw new Error('No products were created during test data generation');
  }

  console.log(`Successfully created ${products.length} products`);

  return { products, dishes };
}

interface MyFixtures {
  basePage: BasePage;
  productsListPage: ProductsListPage;
  productFormPage: ProductFormPage;
  productViewPage: ProductViewPage;
  dishesListPage: DishesListPage;
  dishFormPage: DishFormPage;
}

export const test = base.extend<MyFixtures, { testDataWorker: TestData }>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },

  productsListPage: async ({ page }, use) => {
    const productsListPage = new ProductsListPage(page);
    await use(productsListPage);
  },

  productFormPage: async ({ page }, use) => {
    const productFormPage = new ProductFormPage(page);
    await use(productFormPage);
  },

  productViewPage: async ({ page }, use) => {
    const productViewPage = new ProductViewPage(page);
    await use(productViewPage);
  },

  dishesListPage: async ({ page }, use) => {
    const dishesListPage = new DishesListPage(page);
    await use(dishesListPage);
  },

  dishFormPage: async ({ page }, use) => {
    const dishFormPage = new DishFormPage(page);
    await use(dishFormPage);
  },

  testDataWorker: [async ({ playwright }, use) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    const apiContext = await playwright.request.newContext({
      baseURL,
    });
    const data = await generateTestData(apiContext, baseURL);
    await use(data);

    for (const dish of data.dishes) {
      await deleteDishViaApi(apiContext, baseURL, dish.id).catch(e =>
        console.warn(`Failed to delete dish ${dish.id}:`, e)
      );
    }
    for (const product of data.products) {
      await deleteProductViaApi(apiContext, baseURL, product.id).catch(e =>
        console.warn(`Failed to delete product ${product.id}:`, e)
      );
    }
    await apiContext.dispose();
  }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';