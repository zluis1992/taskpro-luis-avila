using API.Models;
using BusinessLogic.Ports;
using Infrastructure.Dto.Task;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Gestión de tareas del sistema.
/// </summary>
[Authorize]
[Route("api/tasks")]
[Tags("Tareas")]
public class TasksController : BaseController
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService) => _taskService = taskService;

    /// <summary>
    /// Obtiene todas las tareas del usuario autenticado.
    /// </summary>
    /// <returns>Lista de tareas donde el usuario es propietario o miembro del proyecto.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<TaskDto>>), 200)]
    public async Task<IActionResult> GetAll() =>
        Success(await _taskService.GetAllForUserAsync(CurrentUserId));

    /// <summary>
    /// Obtiene una tarea por su identificador.
    /// </summary>
    /// <param name="id">Identificador de la tarea.</param>
    /// <returns>Tarea solicitada con sus detalles.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TaskDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> GetById(int id) =>
        Success(await _taskService.GetByIdAsync(id, CurrentUserId));

    /// <summary>
    /// Crea una nueva tarea en un proyecto.
    /// </summary>
    /// <param name="request">Datos de la tarea a crear. El <c>ProjectId</c> es obligatorio.</param>
    /// <returns>Tarea creada con su identificador asignado.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TaskDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
    {
        var task = await _taskService.CreateAsync(request, CurrentUserId);
        return SuccessCreated(task, "Tarea creada correctamente");
    }

    /// <summary>
    /// Actualiza una tarea existente.
    /// </summary>
    /// <param name="id">Identificador de la tarea a actualizar.</param>
    /// <param name="request">Campos a modificar.</param>
    /// <returns>Tarea actualizada.</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TaskDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskRequest request) =>
        Success(await _taskService.UpdateAsync(id, request, CurrentUserId), "Tarea actualizada correctamente");

    /// <summary>
    /// Elimina una tarea.
    /// </summary>
    /// <param name="id">Identificador de la tarea a eliminar.</param>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> Delete(int id)
    {
        await _taskService.DeleteAsync(id, CurrentUserId);
        return SuccessNoContent("Tarea eliminada correctamente");
    }
}
