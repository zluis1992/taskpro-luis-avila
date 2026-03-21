using BusinessLogic.Ports;
using Infrastructure.Dto.Task;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/projects/{projectId:int}/tasks")]
public class TasksController : BaseController
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService) => _taskService = taskService;

    [HttpGet]
    public async Task<IActionResult> GetAll(int projectId) =>
        Ok(await _taskService.GetByProjectAsync(projectId, CurrentUserId));

    [HttpGet("{taskId:int}")]
    public async Task<IActionResult> GetById(int projectId, int taskId) =>
        Ok(await _taskService.GetByIdAsync(taskId, CurrentUserId));

    [HttpPost]
    public async Task<IActionResult> Create(int projectId, [FromBody] CreateTaskRequest request)
    {
        var task = await _taskService.CreateAsync(projectId, request, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { projectId, taskId = task.Id }, task);
    }

    [HttpPut("{taskId:int}")]
    public async Task<IActionResult> Update(int projectId, int taskId, [FromBody] UpdateTaskRequest request) =>
        Ok(await _taskService.UpdateAsync(taskId, request, CurrentUserId));

    [HttpDelete("{taskId:int}")]
    public async Task<IActionResult> Delete(int projectId, int taskId)
    {
        await _taskService.DeleteAsync(taskId, CurrentUserId);
        return NoContent();
    }
}
