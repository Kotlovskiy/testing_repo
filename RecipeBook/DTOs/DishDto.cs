namespace RecipeBook.DTOs
{
    public class DishDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<string>? PhotoUrls { get; set; }
        public double CaloriesPerServing { get; set; }
        public double ProteinsPerServing { get; set; }
        public double FatsPerServing { get; set; }
        public double CarbohydratesPerServing { get; set; }
        public double ServingSizeGrams { get; set; }
        public string Category { get; set; } = string.Empty;
        public List<string> Flags { get; set; } = new();
        public List<DishProductItemDto> Composition { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class DishProductItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public double QuantityGrams { get; set; }
    }

    public class CreateUpdateDishDto
    {
        public string Name { get; set; } = string.Empty;
        public List<string>? PhotoUrls { get; set; }
        public double? CaloriesPerServing { get; set; } // null = авторасчёт
        public double? ProteinsPerServing { get; set; }
        public double? FatsPerServing { get; set; }
        public double? CarbohydratesPerServing { get; set; }
        public double ServingSizeGrams { get; set; }
        public string? Category { get; set; } // если null, то из макроса
        public List<string> Flags { get; set; } = new();
        public List<DishProductInputDto> Composition { get; set; } = new();
    }

    public class DishProductInputDto
    {
        public int ProductId { get; set; }
        public double QuantityGrams { get; set; }
    }
}
