using Microsoft.EntityFrameworkCore;
using RecipeBook.Data;
using RecipeBook.DTOs;
using RecipeBook.Models;
using System.Text.Json;

namespace RecipeBook.Services
{
    public class DishService : IDishService
    {
        private readonly AppDbContext _context;

        public DishService(AppDbContext context) => _context = context;

        public async Task<IEnumerable<DishDto>> GetAllAsync(string? search, string? category, List<string>? flags)
        {
            var query = _context.Dishes
                .Include(d => d.DishProducts)
                .ThenInclude(dp => dp.Product)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(d => d.Name.ToLower().Contains(search.ToLower()));

            if (!string.IsNullOrEmpty(category) && Enum.TryParse<DishCategory>(category, true, out var cat))
                query = query.Where(d => d.Category == cat);

            if (flags != null && flags.Any())
            {
                query = query.Where(d => flags.All(f => d.FlagsJson.Contains(f)));
            }

            var dishes = await query.ToListAsync();
            return dishes.Select(MapToDto);
        }

        public async Task<DishDto?> GetByIdAsync(int id)
        {
            var dish = await _context.Dishes
                .Include(d => d.DishProducts)
                .ThenInclude(dp => dp.Product)
                .FirstOrDefaultAsync(d => d.Id == id);
            return dish == null ? null : MapToDto(dish);
        }

        public async Task<DishDto> CreateAsync(CreateUpdateDishDto dto)
        {
            // 1. Обработка макроса категории
            var (cleanedName, finalCategory) = ExtractCategoryFromMacro(dto.Name);
            finalCategory = dto.Category ?? finalCategory;
            dto.Name = cleanedName;

            // 2. Получить состав с продуктами
            var composition = await GetCompositionProducts(dto.Composition);

            // 3. Авторасчёт КБЖУ, если пользователь не указал свои значения
            (double cal, double prot, double fat, double carb) = CalculateNutrition(composition, dto.ServingSizeGrams);

            double finalCal = dto.CaloriesPerServing ?? cal;
            double finalProt = dto.ProteinsPerServing ?? prot;
            double finalFat = dto.FatsPerServing ?? fat;
            double finalCarb = dto.CarbohydratesPerServing ?? carb;

            // Валидация суммы БЖУ на 100 грамм
            ValidateDishBZHUPer100g(finalProt, finalFat, finalCarb, dto.ServingSizeGrams);

            // 4. Проверка флагов на соответствие составу
            var allowedFlags = GetAllowedFlagsForComposition(composition);
            var requestedFlags = dto.Flags ?? new List<string>();
            if (!requestedFlags.All(f => allowedFlags.Contains(f)))
                throw new ArgumentException("Некоторые флаги не могут быть установлены для данного состава блюда");

            var dish = new Dish
            {
                Name = dto.Name,
                PhotoUrlsJson = JsonSerializer.Serialize(dto.PhotoUrls ?? new List<string>()),
                CaloriesPerServing = finalCal,
                ProteinsPerServing = finalProt,
                FatsPerServing = finalFat,
                CarbohydratesPerServing = finalCarb,
                ServingSizeGrams = dto.ServingSizeGrams,
                Category = Enum.Parse<DishCategory>(finalCategory, true),
                FlagsJson = JsonSerializer.Serialize(requestedFlags),
                CreatedAt = DateTime.UtcNow
            };

            _context.Dishes.Add(dish);
            await _context.SaveChangesAsync();

            // Добавить состав
            foreach (var item in dto.Composition)
            {
                _context.DishProducts.Add(new DishProduct
                {
                    DishId = dish.Id,
                    ProductId = item.ProductId,
                    QuantityGrams = item.QuantityGrams
                });
            }
            await _context.SaveChangesAsync();

            return await GetByIdAsync(dish.Id) ?? throw new Exception("Failed to retrieve created dish");
        }

        public async Task<DishDto?> UpdateAsync(int id, CreateUpdateDishDto dto)
        {
            var dish = await _context.Dishes
                .Include(d => d.DishProducts)
                .FirstOrDefaultAsync(d => d.Id == id);
            if (dish == null) return null;

            // Обработка макроса (только если пользователь не указал категорию явно)
            var (cleanedName, finalCategory) = ExtractCategoryFromMacro(dto.Name);
            finalCategory = dto.Category ?? finalCategory;
            dto.Name = cleanedName;

            // Получить новый состав
            var newComposition = await GetCompositionProducts(dto.Composition);

            // Авторасчёт
            (double cal, double prot, double fat, double carb) = CalculateNutrition(newComposition, dto.ServingSizeGrams);
            double finalCal = dto.CaloriesPerServing ?? cal;
            double finalProt = dto.ProteinsPerServing ?? prot;
            double finalFat = dto.FatsPerServing ?? fat;
            double finalCarb = dto.CarbohydratesPerServing ?? carb;

            ValidateDishBZHUPer100g(finalProt, finalFat, finalCarb, dto.ServingSizeGrams);

            var allowedFlags = GetAllowedFlagsForComposition(newComposition);
            var requestedFlags = dto.Flags ?? new List<string>();
            // Если ранее установленный флаг более не разрешён, автоматически снимаем (но не выбрасываем ошибку)
            var finalFlags = requestedFlags.Intersect(allowedFlags).ToList();

            // Обновление
            dish.Name = dto.Name;
            dish.PhotoUrlsJson = JsonSerializer.Serialize(dto.PhotoUrls ?? new List<string>());
            dish.CaloriesPerServing = finalCal;
            dish.ProteinsPerServing = finalProt;
            dish.FatsPerServing = finalFat;
            dish.CarbohydratesPerServing = finalCarb;
            dish.ServingSizeGrams = dto.ServingSizeGrams;
            dish.Category = Enum.Parse<DishCategory>(finalCategory, true);
            dish.FlagsJson = JsonSerializer.Serialize(finalFlags);
            dish.UpdatedAt = DateTime.UtcNow;

            // Обновление состава: удалить старые, добавить новые
            _context.DishProducts.RemoveRange(dish.DishProducts);
            foreach (var item in dto.Composition)
            {
                _context.DishProducts.Add(new DishProduct
                {
                    DishId = dish.Id,
                    ProductId = item.ProductId,
                    QuantityGrams = item.QuantityGrams
                });
            }

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var dish = await _context.Dishes.FindAsync(id);
            if (dish == null) return false;
            _context.Dishes.Remove(dish);
            await _context.SaveChangesAsync();
            return true;
        }

        // Вспомогательные методы
        private (string cleanedName, string category) ExtractCategoryFromMacro(string name)
        {
            var macroMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["!десерт"] = "Dessert",
                ["!первое"] = "FirstCourse",
                ["!второе"] = "SecondCourse",
                ["!напиток"] = "Drink",
                ["!салат"] = "Salad",
                ["!суп"] = "Soup",
                ["!перекус"] = "Snack"
            };

            foreach (var macro in macroMap.Keys.OrderByDescending(k => k.Length))
            {
                if (name.Contains(macro, StringComparison.OrdinalIgnoreCase))
                {
                    name = name.Replace(macro, "", StringComparison.OrdinalIgnoreCase).Trim();
                    return (name, macroMap[macro]);
                }
            }
            return (name, "SecondCourse"); // значение по умолчанию, но пользователь должен указать категорию, если макроса нет
        }

        private async Task<List<(Product Product, double Quantity)>> GetCompositionProducts(List<DishProductInputDto> composition)
        {
            if (composition == null || !composition.Any())
                throw new ArgumentException("Состав блюда не может быть пустым");

            var productIds = composition.Select(c => c.ProductId).Distinct();
            var products = await _context.Products.Where(p => productIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id);

            var result = new List<(Product, double)>();
            foreach (var item in composition)
            {
                if (!products.TryGetValue(item.ProductId, out var product))
                    throw new ArgumentException($"Продукт с id {item.ProductId} не найден");
                result.Add((product, item.QuantityGrams));
            }
            return result;
        }

        private (double calories, double proteins, double fats, double carbs) CalculateNutrition(List<(Product Product, double Quantity)> composition, double servingSize)
        {
            double totalCal = 0, totalProt = 0, totalFat = 0, totalCarb = 0;
            foreach (var (product, qtyGrams) in composition)
            {
                double factor = qtyGrams / 100.0;
                totalCal += product.CaloriesPer100g * factor;
                totalProt += product.ProteinsPer100g * factor;
                totalFat += product.FatsPer100g * factor;
                totalCarb += product.CarbohydratesPer100g * factor;
            }
            return (totalCal, totalProt, totalFat, totalCarb);
        }

        private void ValidateDishBZHUPer100g(double proteins, double fats, double carbs, double servingSize)
        {
            if (servingSize <= 0) throw new ArgumentException("Размер порции должен быть больше 0");
            double sumPer100g = (proteins + fats + carbs) / (servingSize / 100.0);
            if (sumPer100g > 100)
                throw new ArgumentException("Сумма БЖУ на 100 грамм блюда не может превышать 100");
        }

        private List<string> GetAllowedFlagsForComposition(List<(Product Product, double Quantity)> composition)
        {
            bool allVegan = composition.All(c => JsonSerializer.Deserialize<List<string>>(c.Product.FlagsJson ?? "[]")?.Contains("Vegan") == true);
            bool allGlutenFree = composition.All(c => JsonSerializer.Deserialize<List<string>>(c.Product.FlagsJson ?? "[]")?.Contains("GlutenFree") == true);
            bool allSugarFree = composition.All(c => JsonSerializer.Deserialize<List<string>>(c.Product.FlagsJson ?? "[]")?.Contains("SugarFree") == true);

            var allowed = new List<string>();
            if (allVegan) allowed.Add("Vegan");
            if (allGlutenFree) allowed.Add("GlutenFree");
            if (allSugarFree) allowed.Add("SugarFree");
            return allowed;
        }

        private DishDto MapToDto(Dish d)
        {
            var composition = d.DishProducts.Select(dp => new DishProductItemDto
            {
                ProductId = dp.ProductId,
                ProductName = dp.Product.Name,
                QuantityGrams = dp.QuantityGrams
            }).ToList();

            return new DishDto
            {
                Id = d.Id,
                Name = d.Name,
                PhotoUrls = JsonSerializer.Deserialize<List<string>>(d.PhotoUrlsJson ?? "[]"),
                CaloriesPerServing = d.CaloriesPerServing,
                ProteinsPerServing = d.ProteinsPerServing,
                FatsPerServing = d.FatsPerServing,
                CarbohydratesPerServing = d.CarbohydratesPerServing,
                ServingSizeGrams = d.ServingSizeGrams,
                Category = d.Category.ToString(),
                Flags = JsonSerializer.Deserialize<List<string>>(d.FlagsJson ?? "[]") ?? new List<string>(),
                Composition = composition,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            };
        }
    }
}
