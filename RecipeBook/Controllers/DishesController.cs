using Microsoft.AspNetCore.Mvc;
using RecipeBook.DTOs;
using RecipeBook.Services;

namespace RecipeBook.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DishesController : ControllerBase
    {
        private readonly IDishService _dishService;

        public DishesController(IDishService dishService) => _dishService = dishService;

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] string? flags)
        {
            var flagList = flags?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
            var dishes = await _dishService.GetAllAsync(search, category, flagList);
            return Ok(dishes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var dish = await _dishService.GetByIdAsync(id);
            if (dish == null) return NotFound();
            return Ok(dish);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUpdateDishDto dto)
        {
            try
            {
                var created = await _dishService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateDishDto dto)
        {
            try
            {
                var updated = await _dishService.UpdateAsync(id, dto);
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
            var deleted = await _dishService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
