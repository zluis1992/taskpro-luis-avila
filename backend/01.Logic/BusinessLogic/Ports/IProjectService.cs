using Infrastructure.Dto.Project;
using Infrastructure.Dto.User;

namespace BusinessLogic.Ports;

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetAllForUserAsync(int userId);
    Task<ProjectDto> GetByIdAsync(int id, int userId);
    Task<ProjectDto> CreateAsync(CreateProjectRequest request, int ownerId);
    Task<ProjectDto> UpdateAsync(int id, UpdateProjectRequest request, int userId);
    Task DeleteAsync(int id, int userId);
    Task AddMemberAsync(int projectId, int memberId, int requesterId);
    Task RemoveMemberAsync(int projectId, int memberId, int requesterId);
    Task<IEnumerable<UserDto>> GetMembersAsync(int projectId, int userId);
}
