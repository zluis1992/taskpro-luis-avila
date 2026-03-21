using Domain.Entity;
using Domain.Enums;
using TaskStatus = Domain.Enums.TaskStatus;

namespace Domain.Interface;

public interface ITaskRepository : IGenericRepository<TaskItem>
{
    Task<TaskItem?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<TaskItem>> GetByProjectAsync(int projectId);
    Task<IEnumerable<TaskItem>> GetByAssignedUserAsync(int userId);
    Task<IEnumerable<TaskItem>> GetByStatusAsync(int projectId, TaskStatus status);
}
