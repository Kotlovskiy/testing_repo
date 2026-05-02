using Microsoft.EntityFrameworkCore;
using RecipeBook.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace RecipeBook.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Dish> Dishes { get; set; }
        public DbSet<DishProduct> DishProducts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Настройка составного ключа для DishProduct
            modelBuilder.Entity<DishProduct>()
                .HasKey(dp => new { dp.DishId, dp.ProductId });

            modelBuilder.Entity<DishProduct>()
                .HasOne(dp => dp.Dish)
                .WithMany(d => d.DishProducts)
                .HasForeignKey(dp => dp.DishId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DishProduct>()
                .HasOne(dp => dp.Product)
                .WithMany(p => p.DishProducts)
                .HasForeignKey(dp => dp.ProductId)
                .OnDelete(DeleteBehavior.Restrict); // запрет удаления продукта, если есть связь

            // Преобразования для JSON-полей
            modelBuilder.Entity<Product>()
                .Property(p => p.PhotoUrlsJson)
                .HasConversion(
                    v => v,
                    v => v
                );

            modelBuilder.Entity<Product>()
                .Property(p => p.FlagsJson)
                .HasConversion(
                    v => v,
                    v => v
                );

            modelBuilder.Entity<Dish>()
                .Property(d => d.PhotoUrlsJson)
                .HasConversion(
                    v => v,
                    v => v
                );

            modelBuilder.Entity<Dish>()
                .Property(d => d.FlagsJson)
                .HasConversion(
                    v => v,
                    v => v
                );
        }
    }
}
