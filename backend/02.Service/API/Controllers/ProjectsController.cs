using API.Models;
using BusinessLogic.Ports;
using Infrastructure.Dto.Project;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Gestión de proyectos y sus miembros.
/// </summary>
[Authorize]
[Route("api/projects")]
[Tags("Proyectos")]
public class ProjectsController : BaseController
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService) => _projectService = projectService;

    /// <summary>
    /// Obtiene todos los proyectos del usuario autenticado.
    /// </summary>
    /// <returns>Lista de proyectos donde el usuario es propietario o miembro.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProjectDto>>), 200)]
    public async Task<IActionResult> GetAll() =>
        Success(await _projectService.GetAllForUserAsync(CurrentUserId));

    /// <summary>
    /// Obtiene un proyecto por su identificador.
    /// </summary>
    /// <param name="id">Identificador del proyecto.</param>
    /// <returns>Proyecto solicitado con sus miembros.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ProjectDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetById(int id) =>
        Success(await _projectService.GetByIdAsync(id, CurrentUserId));

    /// <summary>
    /// Crea un nuevo proyecto. El usuario autenticado será el propietario.
    /// </summary>
    /// <param name="request">Datos del proyecto a crear.</param>
    /// <returns>Proyecto creado.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ProjectDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
        var project = await _projectService.CreateAsync(request, CurrentUserId);
        return SuccessCreated(project, "Proyecto creado correctamente");
    }

    /// <summary>
    /// Actualiza un proyecto existente. Solo el propietario puede modificarlo.
    /// </summary>
    /// <param name="id">Identificador del proyecto.</param>
    /// <param name="request">Campos a modificar.</param>
    /// <returns>Proyecto actualizado.</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ProjectDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectRequest request) =>
        Success(await _projectService.UpdateAsync(id, request, CurrentUserId), "Proyecto actualizado correctamente");

    /// <summary>
    /// Elimina un proyecto. Solo el propietario puede eliminarlo.
    /// </summary>
    /// <param name="id">Identificador del proyecto.</param>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> Delete(int id)
    {
        await _projectService.DeleteAsync(id, CurrentUserId);
        return SuccessNoContent("Proyecto eliminado correctamente");
    }

}
