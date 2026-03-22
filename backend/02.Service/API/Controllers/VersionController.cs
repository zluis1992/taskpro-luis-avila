using System.Text.Json;
using API.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Información de versión de la aplicación.
/// </summary>
[Route("api/version")]
[Tags("Sistema")]
public class VersionController : BaseController
{
    private readonly IWebHostEnvironment _env;

    public VersionController(IWebHostEnvironment env) => _env = env;

    /// <summary>
    /// Obtiene la versión actual de la aplicación.
    /// </summary>
    /// <returns>Información de versión (SemVer, fecha de build, commit hash).</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public IActionResult GetVersion()
    {
        var versionPath = Path.Combine(_env.ContentRootPath, "..", "version.json");

        if (!System.IO.File.Exists(versionPath))
            return Success(new { version = "1.0.0", buildDate = "", commitHash = "" });

        var json = System.IO.File.ReadAllText(versionPath);
        var data = JsonSerializer.Deserialize<JsonElement>(json);
        return Success(data);
    }
}
