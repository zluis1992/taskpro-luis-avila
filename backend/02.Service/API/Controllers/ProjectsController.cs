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
        Ok(await _projectService.GetAllForUserAsync(CurrentUserId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) =>
        Ok(await _projectService.GetByIdAsync(id, CurrentUserId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
        var project = await _projectService.CreateAsync(request, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectRequest request) =>
        Ok(await _projectService.UpdateAsync(id, request, CurrentUserId));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _projectService.DeleteAsync(id, CurrentUserId);
        return NoContent();
    }

    [HttpGet("{id:int}/members")]
    public async Task<IActionResult> GetMembers(int id) =>
        Ok(await _projectService.GetMembersAsync(id, CurrentUserId));

    [HttpPost("{id:int}/members/{memberId:int}")]
    public async Task<IActionResult> AddMember(int id, int memberId)
    {
        await _projectService.AddMemberAsync(id, memberId, CurrentUserId);
        return NoContent();
    }

    [HttpDelete("{id:int}/members/{memberId:int}")]
    public async Task<IActionResult> RemoveMember(int id, int memberId)
    {
        await _projectService.RemoveMemberAsync(id, memberId, CurrentUserId);
        return NoContent();
    }
}
