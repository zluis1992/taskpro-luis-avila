using AutoMapper;
using BusinessLogic.Adapters;
using Domain.Entity;
using Domain.Exceptions;
using Domain.Interface;
using FluentAssertions;
using Infrastructure.Dto.User;
using Infrastructure.Mapper;
using Moq;

namespace TaskPro.Tests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly IMapper _mapper;

    public UserServiceTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
    }

    private UserService CreateService() => new(_userRepoMock.Object, _mapper);

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllUsers()
    {
        var users = new List<User>
        {
            new() { Id = 1, Name = "Luis", Email = "luis@test.com" },
            new() { Id = 2, Name = "Ana", Email = "ana@test.com" }
        };
        _userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(users);

        var result = await CreateService().GetAllAsync();

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByIdAsync_WhenFound_ShouldReturnUser()
    {
        var user = new User { Id = 1, Name = "Luis", Email = "luis@test.com" };
        _userRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);

        var result = await CreateService().GetByIdAsync(1);

        result.Name.Should().Be("Luis");
        result.Email.Should().Be("luis@test.com");
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotFound_ShouldThrowNotFoundException()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((User?)null);

        await CreateService().Invoking(s => s.GetByIdAsync(99))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateNameAndEmail()
    {
        var user = new User { Id = 1, Name = "Old", Email = "old@test.com" };
        _userRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
        _userRepoMock.Setup(r => r.EmailExistsAsync("new@test.com")).ReturnsAsync(false);
        _userRepoMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

        var request = new UpdateUserRequest { Name = "New", Email = "new@test.com" };
        var result = await CreateService().UpdateAsync(1, request);

        result.Name.Should().Be("New");
        result.Email.Should().Be("new@test.com");
    }

    [Fact]
    public async Task UpdateAsync_WhenEmailExistsForOtherUser_ShouldThrowBusinessException()
    {
        var user = new User { Id = 1, Name = "Luis", Email = "luis@test.com" };
        _userRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
        _userRepoMock.Setup(r => r.EmailExistsAsync("taken@test.com")).ReturnsAsync(true);

        var request = new UpdateUserRequest { Name = "Luis", Email = "taken@test.com" };
        await CreateService().Invoking(s => s.UpdateAsync(1, request))
            .Should().ThrowAsync<BusinessException>();
    }

    [Fact]
    public async Task UpdateAsync_WhenSameEmail_ShouldNotCheckDuplicate()
    {
        var user = new User { Id = 1, Name = "Luis", Email = "luis@test.com" };
        _userRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
        _userRepoMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

        var request = new UpdateUserRequest { Name = "Luis Updated", Email = "luis@test.com" };
        var result = await CreateService().UpdateAsync(1, request);

        result.Name.Should().Be("Luis Updated");
        _userRepoMock.Verify(r => r.EmailExistsAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_ShouldSoftDeleteUser()
    {
        var user = new User { Id = 1, Name = "Luis" };
        _userRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
        _userRepoMock.Setup(r => r.DeleteAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

        await CreateService().DeleteAsync(1);

        _userRepoMock.Verify(r => r.DeleteAsync(It.Is<User>(u => u.Id == 1)), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenNotFound_ShouldThrowNotFoundException()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((User?)null);

        await CreateService().Invoking(s => s.DeleteAsync(99))
            .Should().ThrowAsync<NotFoundException>();
    }
}
