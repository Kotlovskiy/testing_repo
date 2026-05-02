using Microsoft.EntityFrameworkCore;
using RecipeBook.Data;
using RecipeBook.DTOs;
using RecipeBook.Models;
using System.Text.Json;

namespace RecipeBook.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context) => _context = context;

        public async Task<IEnumerable<ProductDto>> GetAllAsync(string? search, string? category, string? cookingReq, List<string>? flags, string? sortBy, bool descending)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()));

            if (!string.IsNullOrEmpty(category) && Enum.TryParse<ProductCategory>(category, true, out var cat))
                query = query.Where(p => p.Category == cat);

            if (!string.IsNullOrEmpty(cookingReq) && Enum.TryParse<CookingRequirement>(cookingReq, true, out var cook))
                query = query.Where(p => p.CookingRequirement == cook);

            if (flags != null && flags.Any())
            {
                query = query.Where(p => flags.All(f => p.FlagsJson.Contains(f)));
            }

            query = sortBy?.ToLower() switch
            {
                "name" => descending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
                "calories" => descending ? query.OrderByDescending(p => p.CaloriesPer100g) : query.OrderBy(p => p.CaloriesPer100g),
                "proteins" => descending ? query.OrderByDescending(p => p.ProteinsPer100g) : query.OrderBy(p => p.ProteinsPer100g),
                "fats" => descending ? query.OrderByDescending(p => p.FatsPer100g) : query.OrderBy(p => p.FatsPer100g),
                "carbohydrates" => descending ? query.OrderByDescending(p => p.CarbohydratesPer100g) : query.OrderBy(p => p.CarbohydratesPer100g),
                _ => query.OrderBy(p => p.Id)
            };

            var products = await query.ToListAsync();
            return products.Select(MapToDto);
        }

        public async Task<ProductDto?> GetByIdAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            return product == null ? null : MapToDto(product);
        }

        public async Task<ProductDto> CreateAsync(CreateUpdateProductDto dto)
        {
            ValidateProductBZHU(dto.ProteinsPer100g, dto.FatsPer100g, dto.CarbohydratesPer100g);

            var product = new Product
            {
                Name = dto.Name,
                PhotoUrlsJson = JsonSerializer.Serialize(dto.PhotoUrls ?? new List<string>()),
                CaloriesPer100g = dto.CaloriesPer100g,
                ProteinsPer100g = dto.ProteinsPer100g,
                FatsPer100g = dto.FatsPer100g,
                CarbohydratesPer100g = dto.CarbohydratesPer100g,
                Composition = dto.Composition,
                Category = Enum.Parse<ProductCategory>(dto.Category, true),
                CookingRequirement = Enum.Parse<CookingRequirement>(dto.CookingRequirement, true),
                FlagsJson = JsonSerializer.Serialize(dto.Flags ?? new List<string>()),
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return MapToDto(product);
        }

        public async Task<ProductDto?> UpdateAsync(int id, CreateUpdateProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return null;

            ValidateProductBZHU(dto.ProteinsPer100g, dto.FatsPer100g, dto.CarbohydratesPer100g);

            product.Name = dto.Name;
            product.PhotoUrlsJson = JsonSerializer.Serialize(dto.PhotoUrls ?? new List<string>());
            product.CaloriesPer100g = dto.CaloriesPer100g;
            product.ProteinsPer100g = dto.ProteinsPer100g;
            product.FatsPer100g = dto.FatsPer100g;
            product.CarbohydratesPer100g = dto.CarbohydratesPer100g;
            product.Composition = dto.Composition;
            product.Category = Enum.Parse<ProductCategory>(dto.Category, true);
            product.CookingRequirement = Enum.Parse<CookingRequirement>(dto.CookingRequirement, true);
            product.FlagsJson = JsonSerializer.Serialize(dto.Flags ?? new List<string>());
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToDto(product);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.DishProducts)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return false;

            if (product.DishProducts.Any())
                throw new InvalidOperationException($"Продукт используется в блюдах: {string.Join(", ", product.DishProducts.Select(dp => dp.DishId))}");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        private void ValidateProductBZHU(double proteins, double fats, double carbs)
        {
            if (proteins + fats + carbs > 100)
                throw new ArgumentException("Сумма БЖУ на 100 г не может превышать 100");
        }

        private ProductDto MapToDto(Product p)
        {
            return new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                PhotoUrls = JsonSerializer.Deserialize<List<string>>(p.PhotoUrlsJson ?? "[]"),
                CaloriesPer100g = p.CaloriesPer100g,
                ProteinsPer100g = p.ProteinsPer100g,
                FatsPer100g = p.FatsPer100g,
                CarbohydratesPer100g = p.CarbohydratesPer100g,
                Composition = p.Composition,
                Category = p.Category.ToString(),
                CookingRequirement = p.CookingRequirement.ToString(),
                Flags = JsonSerializer.Deserialize<List<string>>(p.FlagsJson ?? "[]") ?? new List<string>(),
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            };
        }
    }
}
