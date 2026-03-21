using Domain.Entity;

namespace Domain.Interface;

public interface IProjectRepository : IGenericRepository<Project>
{
    Task<Project?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Project>> GetByOwnerAsync(int ownerId);
    Task<IEnumerable<Project>> GetByMemberAsync(int userId);
    Task AddMemberAsync(ProjectMember member);
    Task RemoveMemberAsync(int projectId, int userId);
    Task<bool> IsMemberAsync(int projectId, int userId);
}
