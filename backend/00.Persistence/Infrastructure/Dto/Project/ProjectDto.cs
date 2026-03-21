using Infrastructure.Dto.User;

namespace Infrastructure.Dto.Project;

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public IEnumerable<UserDto> Members { get; set; } = new List<UserDto>();
}
