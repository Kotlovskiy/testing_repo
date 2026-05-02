using System.ComponentModel.DataAnnotations;

namespace RecipeBook.Models
{
    public class Dish
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MinLength(2)]
        public string Name { get; set; } = string.Empty;

        public string? PhotoUrlsJson { get; set; }

        [Required]
        public double CaloriesPerServing { get; set; }

        [Required]
        public double ProteinsPerServing { get; set; }

        [Required]
        public double FatsPerServing { get; set; }

        [Required]
        public double CarbohydratesPerServing { get; set; }

        [Required]
        public double ServingSizeGrams { get; set; }

        [Required]
        public DishCategory Category { get; set; }

        public string FlagsJson { get; set; } = "[]";

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Связь многие ко многим через промежуточную таблицу
        public ICollection<DishProduct> DishProducts { get; set; } = new List<DishProduct>();
    }

    public enum DishCategory
    {
        Dessert, FirstCourse, SecondCourse, Drink, Salad, Soup, Snack
    }
}
