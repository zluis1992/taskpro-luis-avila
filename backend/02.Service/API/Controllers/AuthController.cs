using API.Models;
using BusinessLogic.Ports;
using Infrastructure.Dto.Auth;
using Infrastructure.Dto.User;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Autenticación y registro de usuarios.
/// </summary>
[Route("api/auth")]
[Tags("Autenticación")]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>
    /// Inicia sesión con email y contraseña.
    /// </summary>
    /// <param name="request">Credenciales del usuario.</param>
    /// <returns>Token JWT y datos del usuario.</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        return Success(response, "Inicio de sesión exitoso");
    }

    /// <summary>
    /// Registra un nuevo usuario en el sistema.
    /// </summary>
    /// <param name="request">Datos del usuario (nombre, email, contraseña).</param>
    /// <returns>Usuario creado.</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> Register([FromBody] CreateUserRequest request)
    {
        var user = await _authService.RegisterAsync(request);
        return SuccessCreated(user, "Usuario registrado correctamente");
    }
}
