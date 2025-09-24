using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using MousaPortfolio.Models;

namespace MousaPortfolio.Controllers;
public class ProjectsController : Controller
{
    private readonly IWebHostEnvironment _env;
    public ProjectsController(IWebHostEnvironment env) => _env = env;

    public async Task<IActionResult> Index()
    {
        var path = Path.Combine(_env.WebRootPath, "data", "projects.json");
        if (!System.IO.File.Exists(path)) return View(new List<Project>());

        using var fs = System.IO.File.OpenRead(path);
        var items = await JsonSerializer.DeserializeAsync<List<Project>>(fs,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<Project>();

        return View(items);
    }
}
