using BusinessLogic.Ports;
using Infrastructure.Dto.Project;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class ProjectsController : BaseController
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService) => _projectService = projectService;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Success(await _projectService.GetAllForUserAsync(CurrentUserId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) =>
        Success(await _projectService.GetByIdAsync(id, CurrentUserId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
        var project = await _projectService.CreateAsync(request, CurrentUserId);
        return SuccessCreated(project, "Proyecto creado correctamente");
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectRequest request) =>
        Success(await _projectService.UpdateAsync(id, request, CurrentUserId), "Proyecto actualizado correctamente");

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _projectService.DeleteAsync(id, CurrentUserId);
        return SuccessNoContent("Proyecto eliminado correctamente");
    }

    [HttpGet("{id:int}/members")]
    public async Task<IActionResult> GetMembers(int id) =>
        Success(await _projectService.GetMembersAsync(id, CurrentUserId));

    [HttpPost("{id:int}/members/{memberId:int}")]
    public async Task<IActionResult> AddMember(int id, int memberId)
    {
        await _projectService.AddMemberAsync(id, memberId, CurrentUserId);
        return SuccessNoContent("Miembro agregado correctamente");
    }

    [HttpDelete("{id:int}/members/{memberId:int}")]
    public async Task<IActionResult> RemoveMember(int id, int memberId)
    {
        await _projectService.RemoveMemberAsync(id, memberId, CurrentUserId);
        return SuccessNoContent("Miembro eliminado correctamente");
    }
}
