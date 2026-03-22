using AutoMapper;
using BusinessLogic.Ports;
using Domain.Entity;
using Domain.Enums;
using Domain.Exceptions;
using TaskStatus = Domain.Enums.TaskStatus;
using Domain.Interface;
using Infrastructure.Dto.Task;

namespace BusinessLogic.Adapters;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly ICommentRepository _commentRepository;
    private readonly IMapper _mapper;

    public TaskService(ITaskRepository taskRepository, IProjectRepository projectRepository, ICommentRepository commentRepository, IMapper mapper)
    {
        _taskRepository = taskRepository;
        _projectRepository = projectRepository;
        _commentRepository = commentRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TaskDto>> GetAllForUserAsync(int userId)
    {
        var tasks = await _taskRepository.GetAllForUserAsync(userId);
        return _mapper.Map<IEnumerable<TaskDto>>(tasks);
    }

    public async Task<TaskDto> GetByIdAsync(int taskId, int userId)
    {
        var task = await _taskRepository.GetByIdWithDetailsAsync(taskId)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        await EnsureProjectAccessAsync(task.ProjectId, userId);
        return _mapper.Map<TaskDto>(task);
    }

    public async Task<TaskDto> CreateAsync(CreateTaskRequest request, int userId)
    {
        request.Title = request.Title.Trim();
        request.Description = request.Description?.Trim() ?? string.Empty;

        await EnsureProjectAccessAsync(request.ProjectId, userId);

        var task = _mapper.Map<TaskItem>(request);
        task.ProjectId = request.ProjectId;
        task.Priority = (TaskPriority)request.Priority;

        var created = await _taskRepository.AddAsync(task);
        var detailed = await _taskRepository.GetByIdWithDetailsAsync(created.Id);
        return _mapper.Map<TaskDto>(detailed!);
    }

    public async Task<TaskDto> UpdateAsync(int taskId, UpdateTaskRequest request, int userId)
    {
        request.Title = request.Title.Trim();
        request.Description = request.Description?.Trim() ?? string.Empty;

        var task = await _taskRepository.GetByIdWithDetailsAsync(taskId)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        await EnsureProjectAccessAsync(task.ProjectId, userId);

        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = (TaskStatus)request.Status;
        task.Priority = (TaskPriority)request.Priority;
        task.DueDate = request.DueDate;
        task.AssignedUserId = request.AssignedUserId;
        task.UpdatedAt = DateTime.UtcNow;

        await _taskRepository.UpdateAsync(task);
        var updated = await _taskRepository.GetByIdWithDetailsAsync(taskId);
        return _mapper.Map<TaskDto>(updated!);
    }

    public async Task DeleteAsync(int taskId, int userId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        await EnsureProjectAccessAsync(task.ProjectId, userId);
        task.SoftDelete();
        await _taskRepository.UpdateAsync(task);
        await _commentRepository.SoftDeleteByTaskAsync(taskId);
    }

    private async Task EnsureProjectAccessAsync(int projectId, int userId)
    {
        var project = await _projectRepository.GetByIdWithDetailsAsync(projectId)
            ?? throw new NotFoundException(nameof(Domain.Entity.Project), projectId);

        if (project.OwnerId != userId && !project.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedException();
    }
}
