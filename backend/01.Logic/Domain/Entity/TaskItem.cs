using Domain.Common;
using Domain.Enums;
using TaskStatus = Domain.Enums.TaskStatus;

namespace Domain.Entity;

public class TaskItem : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime? DueDate { get; set; }
    public int ProjectId { get; set; }
    public int? AssignedUserId { get; set; }

    public Project Project { get; set; } = null!;
    public User? AssignedUser { get; set; }
}
