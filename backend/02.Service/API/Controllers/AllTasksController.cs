using BusinessLogic.Ports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/tasks")]
public class AllTasksController : BaseController
{
    private readonly ITaskService _taskService;

    public AllTasksController(ITaskService taskService) => _taskService = taskService;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _taskService.GetAllForUserAsync(CurrentUserId));
}
