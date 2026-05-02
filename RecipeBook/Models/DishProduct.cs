using System.ComponentModel.DataAnnotations;

namespace RecipeBook.Models
{
    public class DishProduct
    {
        public int DishId { get; set; }
        public Dish Dish { get; set; } = null!;

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        [Required]
        public double QuantityGrams { get; set; } // количество продукта в граммах на одну порцию блюда
    }
}
