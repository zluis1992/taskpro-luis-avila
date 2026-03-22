using Domain.Enums;
using Domain.Interface;
using TaskStatus = Domain.Enums.TaskStatus;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Repository.Base;

namespace Repository.Tasks;

public class TaskRepository : GenericRepository<Domain.Entity.TaskItem>, ITaskRepository
{
    public TaskRepository(AppDbContext context) : base(context) { }

    public async Task<Domain.Entity.TaskItem?> GetByIdWithDetailsAsync(int id) =>
        await _dbSet
            .Include(t => t.AssignedUser)
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<IEnumerable<Domain.Entity.TaskItem>> GetByProjectAsync(int projectId) =>
        await _dbSet
            .Include(t => t.AssignedUser)
            .Where(t => t.ProjectId == projectId)
            .ToListAsync();

    public async Task<IEnumerable<Domain.Entity.TaskItem>> GetByAssignedUserAsync(int userId) =>
        await _dbSet
            .Include(t => t.Project)
            .Where(t => t.AssignedUserId == userId)
            .ToListAsync();

    public async Task<IEnumerable<Domain.Entity.TaskItem>> GetByStatusAsync(int projectId, TaskStatus status) =>
        await _dbSet
            .Where(t => t.ProjectId == projectId && t.Status == status)
            .ToListAsync();

    public async Task<IEnumerable<Domain.Entity.TaskItem>> GetAllForUserAsync(int userId) =>
        await _dbSet
            .Include(t => t.AssignedUser)
            .Include(t => t.Project)
            .Where(t => t.Project.OwnerId == userId || t.Project.Members.Any(m => m.UserId == userId))
            .ToListAsync();
}
