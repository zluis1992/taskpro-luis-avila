using Infrastructure.Dto.Task;

namespace BusinessLogic.Ports;

public interface ITaskService
{
    Task<IEnumerable<TaskDto>> GetAllForUserAsync(int userId);
    Task<TaskDto> GetByIdAsync(int taskId, int userId);
    Task<TaskDto> CreateAsync(CreateTaskRequest request, int userId);
    Task<TaskDto> UpdateAsync(int taskId, UpdateTaskRequest request, int userId);
    Task DeleteAsync(int taskId, int userId);
}
