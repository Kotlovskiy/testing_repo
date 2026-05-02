namespace RecipeBook.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<string>? PhotoUrls { get; set; }
        public double CaloriesPer100g { get; set; }
        public double ProteinsPer100g { get; set; }
        public double FatsPer100g { get; set; }
        public double CarbohydratesPer100g { get; set; }
        public string? Composition { get; set; }
        public string Category { get; set; } = string.Empty;
        public string CookingRequirement { get; set; } = string.Empty;
        public List<string> Flags { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateUpdateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public List<string>? PhotoUrls { get; set; }
        public double CaloriesPer100g { get; set; }
        public double ProteinsPer100g { get; set; }
        public double FatsPer100g { get; set; }
        public double CarbohydratesPer100g { get; set; }
        public string? Composition { get; set; }
        public string Category { get; set; } = string.Empty;
        public string CookingRequirement { get; set; } = string.Empty;
        public List<string> Flags { get; set; } = new();
    }
}
