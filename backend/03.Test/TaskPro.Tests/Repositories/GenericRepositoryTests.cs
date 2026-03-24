using Domain.Entity;
using Domain.Interface;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Repository.Base;
using Repository.Comment;
using Repository.Project;
using Repository.Tasks;
using Repository.User;
using FluentAssertions;

namespace TaskPro.Tests.Repositories;

public class GenericRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public GenericRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);
        _unitOfWork = new UnitOfWork(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task AddAsync_ShouldAddEntity()
    {
        var repo = new GenericRepository<User>(_context);
        var user = new User { Name = "Luis", Email = "luis@test.com" };

        var result = await repo.AddAsync(new User { Name = "Luis", Email = "luis@test.com" });
        await _unitOfWork.CompleteAsync();

        result.Id.Should().BeGreaterThan(0);
        (await repo.GetByIdAsync(result.Id)).Should().NotBeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllNonDeleted()
    {
        var repo = new GenericRepository<User>(_context);
        await repo.AddAsync(new User { Name = "Luis", Email = "luis@test.com" });
        await repo.AddAsync(new User { Name = "Ana", Email = "ana@test.com" });
        await _unitOfWork.CompleteAsync();

        var all = await repo.GetAllAsync();

        all.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAllAsync_ShouldExcludeSoftDeleted()
    {
        var repo = new GenericRepository<User>(_context);
        var user1 = await repo.AddAsync(new User { Name = "Luis", Email = "luis@test.com" });
        await repo.AddAsync(new User { Name = "Ana", Email = "ana@test.com" });
        await _unitOfWork.CompleteAsync();

        user1.SoftDelete();
        await repo.UpdateAsync(user1);
        await _unitOfWork.CompleteAsync();

        var all = await repo.GetAllAsync();

        all.Should().HaveCount(1);
        all.First().Name.Should().Be("Ana");
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnEntity()
    {
        var repo = new GenericRepository<User>(_context);
        var user = await repo.AddAsync(new User { Name = "Luis", Email = "luis@test.com" });
        await _unitOfWork.CompleteAsync();

        var found = await repo.GetByIdAsync(user.Id);

        found.Should().NotBeNull();
        found!.Name.Should().Be("Luis");
    }

    [Fact]
    public async Task GetByIdAsync_WhenSoftDeleted_ShouldReturnNull()
    {
        var repo = new GenericRepository<User>(_context);
        var user = await repo.AddAsync(new User { Name = "Luis", Email = "luis@test.com" });
        await _unitOfWork.CompleteAsync();

        user.SoftDelete();
        await repo.UpdateAsync(user);
        await _unitOfWork.CompleteAsync();

        var found = await repo.GetByIdAsync(user.Id);

        found.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateEntity()
    {
        var repo = new GenericRepository<User>(_context);
        var user = await repo.AddAsync(new User { Name = "Luis", Email = "luis@test.com" });
        await _unitOfWork.CompleteAsync();

        user.Name = "Luis Updated";
        await repo.UpdateAsync(user);
        await _unitOfWork.CompleteAsync();

        var updated = await repo.GetByIdAsync(user.Id);
        updated!.Name.Should().Be("Luis Updated");
    }

    [Fact]
    public async Task DeleteAsync_ShouldSoftDeleteEntity()
    {
        var repo = new GenericRepository<User>(_context);
        var user = await repo.AddAsync(new User { Name = "Luis", Email = "luis@test.com" });
        await _unitOfWork.CompleteAsync();

        await repo.DeleteAsync(user);
        await _unitOfWork.CompleteAsync();

        user.IsDeleted.Should().BeTrue();
        user.DeletedAt.Should().NotBeNull();
        (await repo.GetByIdAsync(user.Id)).Should().BeNull();
    }

    [Fact]
    public async Task ExistsAsync_ShouldReturnTrueForExisting()
    {
        var repo = new GenericRepository<User>(_context);
        await repo.AddAsync(new User { Name = "Luis", Email = "luis@test.com" });
        await _unitOfWork.CompleteAsync();

        var exists = await repo.ExistsAsync(u => u.Email == "luis@test.com");

        exists.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_ShouldReturnFalseForNonExisting()
    {
        var repo = new GenericRepository<User>(_context);

        var exists = await repo.ExistsAsync(u => u.Email == "none@test.com");

        exists.Should().BeFalse();
    }

    [Fact]
    public async Task FindAsync_ShouldFilterEntities()
    {
        var repo = new GenericRepository<User>(_context);
        await repo.AddAsync(new User { Name = "Luis", Email = "luis@test.com", Role = Domain.Enums.UserRole.Admin });
        await repo.AddAsync(new User { Name = "Ana", Email = "ana@test.com", Role = Domain.Enums.UserRole.Member });
        await _unitOfWork.CompleteAsync();

        var admins = await repo.FindAsync(u => u.Role == Domain.Enums.UserRole.Admin);

        admins.Should().HaveCount(1);
        admins.First().Name.Should().Be("Luis");
    }

    [Fact]
    public async Task GlobalQueryFilter_ShouldExcludeSoftDeletedInGetAll()
    {
        var repo = new UserRepository(_context);
        var user = new User { Name = "Luis", Email = "luis@test.com" };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        user.SoftDelete();
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        var all = await repo.GetAllAsync();

        all.Should().BeEmpty();
    }
}
