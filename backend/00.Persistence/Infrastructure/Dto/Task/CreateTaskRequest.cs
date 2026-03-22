namespace Infrastructure.Dto.Task;

public class CreateTaskRequest
{
    public int ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Priority { get; set; } = 1;
    public DateTime? DueDate { get; set; }
    public int? AssignedUserId { get; set; }
}
