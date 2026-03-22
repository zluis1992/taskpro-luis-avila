using BusinessLogic.Ports;
using Infrastructure.Dto.Comment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/tasks/{taskId:int}/comments")]
public class CommentsController : BaseController
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService) => _commentService = commentService;

    [HttpGet]
    public async Task<IActionResult> GetAll(int taskId) =>
        Success(await _commentService.GetByTaskAsync(taskId, CurrentUserId));

    [HttpPost]
    public async Task<IActionResult> Create(int taskId, [FromBody] CreateCommentRequest request)
    {
        var comment = await _commentService.CreateAsync(taskId, request, CurrentUserId, CurrentUserName);
        return SuccessCreated(comment, "Comentario creado correctamente");
    }

    [HttpPut("{commentId}")]
    public async Task<IActionResult> Update(int taskId, string commentId, [FromBody] UpdateCommentRequest request) =>
        Success(await _commentService.UpdateAsync(commentId, request, CurrentUserId), "Comentario actualizado correctamente");

    [HttpDelete("{commentId}")]
    public async Task<IActionResult> Delete(int taskId, string commentId)
    {
        await _commentService.DeleteAsync(commentId, CurrentUserId);
        return SuccessNoContent("Comentario eliminado correctamente");
    }
}
