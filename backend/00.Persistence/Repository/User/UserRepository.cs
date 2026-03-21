using Domain.Interface;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Repository.Base;

namespace Repository.User;

public class UserRepository : GenericRepository<Domain.Entity.User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<Domain.Entity.User?> GetByEmailAsync(string email) =>
        await _dbSet.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<bool> EmailExistsAsync(string email) =>
        await _dbSet.AnyAsync(u => u.Email == email);
}
