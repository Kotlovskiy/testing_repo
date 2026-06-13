using Microsoft.AspNetCore.Mvc;
using RecipeBook.DTOs;
using RecipeBook.Services;
using System.Diagnostics;

namespace RecipeBook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService) => _productService = productService;

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] string? cookingRequirement,
            [FromQuery] string? flags,   // comma-separated: Vegan,GlutenFree
            [FromQuery] string? sortBy,
            [FromQuery] bool descending = false)
        {
            var flagList = flags?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
            var products = await _productService.GetAllAsync(search, category, cookingRequirement, flagList, sortBy, descending);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUpdateProductDto dto)
        {
            try
            {
                var created = await _productService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateProductDto dto)
        {
            try
            {
                var updated = await _productService.UpdateAsync(id, dto);
                if (updated == null) return NotFound();
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _productService.DeleteAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        [HttpGet("vulnerable-simple")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        public IActionResult VulnerableSimple([FromQuery] string cmd)
        {
            System.Diagnostics.Process.Start("cmd.exe", "/C " + cmd);
            return Ok("Done");
        }
    }
}
