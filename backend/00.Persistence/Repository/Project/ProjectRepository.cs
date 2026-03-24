using Domain.Entity;
using Domain.Interface;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Repository.Base;

namespace Repository.Project;

public class ProjectRepository : GenericRepository<Domain.Entity.Project>, IProjectRepository
{
    public ProjectRepository(AppDbContext context) : base(context) { }

    public async Task<Domain.Entity.Project?> GetByIdWithDetailsAsync(int id) =>
        await _dbSet
            .Include(p => p.Owner)
            .Include(p => p.Members).ThenInclude(m => m.User)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<Domain.Entity.Project>> GetByOwnerAsync(int ownerId) =>
        await _dbSet
            .Include(p => p.Owner)
            .Where(p => p.OwnerId == ownerId)
            .ToListAsync();

    public async Task<IEnumerable<Domain.Entity.Project>> GetByMemberAsync(int userId) =>
        await _dbSet
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .ToListAsync();

    public async Task AddMemberAsync(ProjectMember member)
    {
        _context.ProjectMembers.Add(member);
        await Task.CompletedTask;
    }

    public async Task RemoveMemberAsync(int projectId, int userId)
    {
        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == userId);
        if (member != null)
        {
            _context.ProjectMembers.Remove(member);
        }
        await Task.CompletedTask;
    }

    public async Task<bool> IsMemberAsync(int projectId, int userId) =>
        await _context.ProjectMembers
            .AnyAsync(m => m.ProjectId == projectId && m.UserId == userId);
}
