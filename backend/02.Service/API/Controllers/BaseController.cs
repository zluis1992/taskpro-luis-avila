using System.Security.Claims;
using API.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    protected int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new InvalidOperationException("User ID claim not found."));

    protected string CurrentUserName =>
        User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;

    protected IActionResult Success<T>(T? data, string mensaje = "Operación exitosa") =>
        Ok(ApiResponse<T>.Ok(data, mensaje));

    protected IActionResult SuccessCreated<T>(T? data, string mensaje = "Registro creado correctamente") =>
        StatusCode(201, ApiResponse<T>.Created(data, mensaje));

    protected IActionResult SuccessNoContent(string mensaje = "Registro eliminado correctamente") =>
        Ok(ApiResponse<object>.Ok(null, mensaje));
}
