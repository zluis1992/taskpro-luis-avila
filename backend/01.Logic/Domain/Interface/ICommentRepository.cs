using Domain.Entity;

namespace Domain.Interface;

public interface ICommentRepository
{
    Task<Comment?> GetByIdAsync(string id);
    Task<IEnumerable<Comment>> GetByTaskAsync(int taskId);
    Task<Comment> AddAsync(Comment comment);
    Task UpdateAsync(Comment comment);
    Task DeleteAsync(string id);
}
