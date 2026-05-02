using System.ComponentModel.DataAnnotations;

namespace RecipeBook.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MinLength(2)]
        public string Name { get; set; } = string.Empty;

        // Хранение до 5 URL фотографий в виде JSON-строки
        public string? PhotoUrlsJson { get; set; }

        [Required]
        public double CaloriesPer100g { get; set; }

        [Required]
        public double ProteinsPer100g { get; set; }

        [Required]
        public double FatsPer100g { get; set; }

        [Required]
        public double CarbohydratesPer100g { get; set; }

        public string? Composition { get; set; }

        [Required]
        public ProductCategory Category { get; set; }

        [Required]
        public CookingRequirement CookingRequirement { get; set; }

        // Флаги хранятся как битовая маска или строкой, для простоты используем строку через разделитель
        public string FlagsJson { get; set; } = "[]"; // ["Vegan", "GlutenFree", "SugarFree"]

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Навигация
        public ICollection<DishProduct> DishProducts { get; set; } = new List<DishProduct>();
    }

    public enum ProductCategory
    {
        Frozen, Meat, Vegetables, Greens, Spices, Grains, Canned, Liquid, Sweets
    }

    public enum CookingRequirement
    {
        ReadyToEat, SemiFinished, NeedsCooking
    }
}
