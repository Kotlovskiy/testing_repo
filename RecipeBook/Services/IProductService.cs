using RecipeBook.DTOs;

namespace RecipeBook.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllAsync(string? search, string? category, string? cookingReq, List<string>? flags, string? sortBy, bool descending);
        Task<ProductDto?> GetByIdAsync(int id);
        Task<ProductDto> CreateAsync(CreateUpdateProductDto dto);
        Task<ProductDto?> UpdateAsync(int id, CreateUpdateProductDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
