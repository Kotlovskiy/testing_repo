using RecipeBook.DTOs;

namespace RecipeBook.Services
{
    public interface IDishService
    {
        Task<IEnumerable<DishDto>> GetAllAsync(string? search, string? category, List<string>? flags);
        Task<DishDto?> GetByIdAsync(int id);
        Task<DishDto> CreateAsync(CreateUpdateDishDto dto);
        Task<DishDto?> UpdateAsync(int id, CreateUpdateDishDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
