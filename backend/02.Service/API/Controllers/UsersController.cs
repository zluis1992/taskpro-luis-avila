using API.Models;
using BusinessLogic.Ports;
using Infrastructure.Dto.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Gestión de usuarios del sistema.
/// </summary>
[Authorize]
[Route("api/users")]
[Tags("Usuarios")]
public class UsersController : BaseController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService) => _userService = userService;

    /// <summary>
    /// Obtiene todos los usuarios registrados.
    /// </summary>
    /// <returns>Lista de usuarios.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserDto>>), 200)]
    public async Task<IActionResult> GetAll() =>
        Success(await _userService.GetAllAsync());

    /// <summary>
    /// Obtiene un usuario por su identificador.
    /// </summary>
    /// <param name="id">Identificador del usuario.</param>
    /// <returns>Usuario solicitado.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetById(int id) =>
        Success(await _userService.GetByIdAsync(id));

    /// <summary>
    /// Actualiza un usuario existente.
    /// </summary>
    /// <param name="id">Identificador del usuario.</param>
    /// <param name="request">Campos a modificar.</param>
    /// <returns>Usuario actualizado.</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request) =>
        Success(await _userService.UpdateAsync(id, request), "Usuario actualizado correctamente");

    /// <summary>
    /// Elimina un usuario.
    /// </summary>
    /// <param name="id">Identificador del usuario.</param>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> Delete(int id)
    {
        await _userService.DeleteAsync(id);
        return SuccessNoContent("Usuario eliminado correctamente");
    }
}
