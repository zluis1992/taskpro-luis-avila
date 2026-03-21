using Infrastructure.Dto.Comment;

namespace BusinessLogic.Ports;

public interface ICommentService
{
    Task<IEnumerable<CommentDto>> GetByTaskAsync(int taskId, int userId);
    Task<CommentDto> CreateAsync(int taskId, CreateCommentRequest request, int authorId, string authorName);
    Task<CommentDto> UpdateAsync(string commentId, UpdateCommentRequest request, int userId);
    Task DeleteAsync(string commentId, int userId);
}
