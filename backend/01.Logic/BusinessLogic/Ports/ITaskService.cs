using Infrastructure.Dto.Task;

namespace BusinessLogic.Ports;

public interface ITaskService
{
    Task<IEnumerable<TaskDto>> GetByProjectAsync(int projectId, int userId);
    Task<IEnumerable<TaskDto>> GetAllForUserAsync(int userId);
    Task<TaskDto> GetByIdAsync(int taskId, int userId);
    Task<TaskDto> CreateAsync(int projectId, CreateTaskRequest request, int userId);
    Task<TaskDto> UpdateAsync(int taskId, UpdateTaskRequest request, int userId);
    Task DeleteAsync(int taskId, int userId);
}
